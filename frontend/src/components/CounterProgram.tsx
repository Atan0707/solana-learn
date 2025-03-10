'use client';

import React, { useState, useEffect } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import dynamic from 'next/dynamic';
import idl from "@/idl/contract.json";

// Dynamically import the WalletMultiButton with SSR disabled to prevent hydration errors
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

// Set our program ID from the IDL
const programID = new PublicKey(idl.address);

// Generate a unique counter address for the current user
const getCounterAddress = async (wallet: PublicKey | null) => {
  if (!wallet) return null;
  
  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), wallet.toBuffer()],
    programID
  );
  
  return counterPDA;
};

const Counter = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [count, setCount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [counterAddress, setCounterAddress] = useState<PublicKey | null>(null);

  // Function to create an Anchor provider and program
  const getProgram = () => {
    if (!wallet) return null;
    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );
    return new Program(idl, programID, provider);
  };

  // Initialize the counter account
  const initializeCounter = async () => {
    try {
      setLoading(true);
      const program = getProgram();
      if (!wallet || !program) return;

      const counterAddr = await getCounterAddress(wallet.publicKey);
      if (!counterAddr) return;
      
      setCounterAddress(counterAddr);

      // Create new account for the counter
      await program.methods
        .initialize()
        .accounts({
          counter: counterAddr,
          authority: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Counter initialized!");
      setInitialized(true);
      fetchCounter();
    } catch (error) {
      console.error("Error initializing counter:", error);
    } finally {
      setLoading(false);
    }
  };

  // Increment the counter
  const incrementCounter = async () => {
    try {
      setLoading(true);
      const program = getProgram();
      if (!wallet || !program || !counterAddress) return;

      await program.methods
        .increment()
        .accounts({
          counter: counterAddress,
          authority: wallet.publicKey,
        })
        .rpc();

      console.log("Counter incremented!");
      fetchCounter();
    } catch (error) {
      console.error("Error incrementing counter:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the current counter value
  const fetchCounter = async () => {
    try {
      const program = getProgram();
      if (!program || !counterAddress) return;

      try {
        // @ts-expect-error - The program.account.counter property and counterAccount.count property exist at runtime
        const counterAccount = await program.account.counter.fetch(counterAddress);
        setCount(counterAccount.count.toString());
        setInitialized(true);
      } catch (error) {
        console.error("Error fetching counter account:", error);
        setInitialized(false);
      }
    } catch (error) {
      console.error("Error fetching counter:", error);
      setInitialized(false);
    }
  };

  // Effect to check if counter is initialized and fetch its value
  useEffect(() => {
    const checkAndFetchCounter = async () => {
      if (wallet) {
        const addr = await getCounterAddress(wallet.publicKey);
        if (addr) {
          setCounterAddress(addr);
          
          try {
            await fetchCounter();
          } catch {
            // If there's an error, the counter is not initialized
            setInitialized(false);
          }
        }
      }
    };
    
    checkAndFetchCounter();
  }, [wallet]);

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Solana Counter dApp</h1>
      
      <div className="w-full">
        <WalletMultiButton className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors" />
      </div>
      
      {wallet ? (
        <div className="w-full flex flex-col gap-4 items-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Connected as:</p>
            <p className="font-mono text-sm truncate max-w-xs">{wallet.publicKey.toString()}</p>
          </div>
          
          {initialized ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg w-full text-center">
                <p className="text-gray-600 dark:text-gray-300">Current Count:</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{count !== null ? count : "..."}</p>
              </div>
              
              <button
                onClick={incrementCounter}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Increment Counter"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <p className="text-gray-600 dark:text-gray-300">Counter not initialized yet.</p>
              <button
                onClick={initializeCounter}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Initialize Counter"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">Connect your wallet to interact with the counter program.</p>
      )}
    </div>
  );
};

export default Counter;