'use client';

import React, { useState } from 'react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import idl from '@/idl/contract.json';

// Configuration options
const opts = {
  preflightCommitment: "confirmed" as const,
};

const { SystemProgram } = web3;
const programID = new PublicKey(idl.address);

const SimpleCounter = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [counter, setCounter] = useState<web3.Keypair | null>(null);
  const [count, setCount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Create a provider and program
  const getProvider = () => {
    if (!wallet) return null;
    
    return new AnchorProvider(
      connection,
      wallet,
      { preflightCommitment: opts.preflightCommitment }
    );
  };

  // Create a program instance
  const getProgram = () => {
    const provider = getProvider();
    if (!provider) return null;
    
    // @ts-expect-error - The IDL structure is compatible at runtime
    return new Program(idl, programID, provider);
  };

  // Create a new counter
  const createCounter = async () => {
    try {
      setLoading(true);
      const program = getProgram();
      if (!wallet || !program) return;

      // Generate a new keypair for the counter account
      const newCounter = web3.Keypair.generate();
      setCounter(newCounter);

      // Create the counter account
      await program.methods
        .initialize()
        .accounts({
          counter: newCounter.publicKey,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([newCounter])
        .rpc();

      console.log('Counter created with address:', newCounter.publicKey.toString());
      
      // Fetch the counter value
      await fetchCounter(newCounter.publicKey);
    } catch (error) {
      console.error('Error creating counter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Increment the counter
  const incrementCounter = async () => {
    try {
      setLoading(true);
      const program = getProgram();
      if (!wallet || !program || !counter) return;

      // Increment the counter
      await program.methods
        .increment()
        .accounts({
          counter: counter.publicKey,
          authority: wallet.publicKey,
        })
        .rpc();

      console.log('Counter incremented');
      
      // Fetch the updated counter value
      await fetchCounter(counter.publicKey);
    } catch (error) {
      console.error('Error incrementing counter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the counter value
  const fetchCounter = async (counterPublicKey: PublicKey) => {
    try {
      const program = getProgram();
      if (!program) return;

      // Fetch the counter account
      // @ts-expect-error - The counter account exists at runtime
      const counterAccount = await program.account.counter.fetch(counterPublicKey);
      setCount(counterAccount.count.toString());
      console.log('Counter value:', counterAccount.count.toString());
    } catch (error) {
      console.error('Error fetching counter:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Simple Solana Counter</h1>
      
      <div className="w-full">
        <WalletMultiButton className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors" />
      </div>
      
      {wallet ? (
        <div className="w-full flex flex-col gap-4 items-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Connected as:</p>
            <p className="font-mono text-sm truncate max-w-xs">{wallet.publicKey.toString()}</p>
          </div>
          
          {counter ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg w-full text-center">
                <p className="text-gray-600 dark:text-gray-300">Counter Address:</p>
                <p className="font-mono text-xs truncate max-w-xs">{counter.publicKey.toString()}</p>
                <p className="text-gray-600 dark:text-gray-300 mt-4">Current Count:</p>
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
              <p className="text-gray-600 dark:text-gray-300">Create a new counter to get started.</p>
              <button
                onClick={createCounter}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Create Counter"}
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

export default SimpleCounter; 