'use client';

import { FC, useEffect, useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN, Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import contractIDL from '../idl/contract.json';
// Create types based on the IDL
type Counter = {
  count: BN;
  authority: PublicKey;
};

const idl = contractIDL as Idl;
// const programId = new PublicKey(idl.address);

const CounterProgramClient: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signAllTransactions, signTransaction } = useWallet();
  
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  // Create the provider that will be used to create the program
  const getProvider = useCallback(() => {
    if (!publicKey || !signAllTransactions || !signTransaction) {
      return null;
    }
    
    return new AnchorProvider(
      connection,
      {
        publicKey,
        signAllTransactions,
        signTransaction,
      },
      { commitment: 'confirmed' }
    );
  }, [connection, publicKey, signAllTransactions, signTransaction]);

  // Create the program
  const getProgram = useCallback(() => {
    const provider = getProvider();
    if (!provider) {
      return null;
    }
    
    return new Program(idl, provider);
  }, [getProvider]);

  // Get the counter account address
  const getCounterAccount = useCallback(async () => {
    if (!publicKey) return null;
    
    const program = getProgram();
    if (!program) return null;
    
    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('counter'), publicKey.toBuffer()],
      program.programId
    );
    
    return counterPDA;
  }, [getProgram, publicKey]);

  // Fetch counter value
  const fetchCounter = useCallback(async () => {
    if (!publicKey) {
      setCount(null);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const program = getProgram();
      if (!program) {
        throw new Error('Program not available');
      }
      
      const counterAccount = await getCounterAccount();
      if (!counterAccount) {
        throw new Error('Failed to derive counter account address');
      }
      
      try {
        // @ts-expect-error - we know this account exists in the IDL
        const counterData = await program.account.counter.fetch(counterAccount) as Counter;
        setCount(counterData.count.toNumber());
      } catch (err) {
        // If the account doesn't exist yet, that's okay
        if (err instanceof Error && err.message?.includes('Account does not exist')) {
          setCount(null);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to fetch counter: ${err instanceof Error ? err.message : String(err)}`);
      setCount(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, getProgram, getCounterAccount]);

  // Initialize counter account
  const initializeCounter = useCallback(async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const program = getProgram();
      if (!program) {
        throw new Error('Program not available');
      }
      
      const counterAccount = await getCounterAccount();
      if (!counterAccount) {
        throw new Error('Failed to derive counter account address');
      }
      
      const tx = await program.methods
        .initialize()
        .accounts({
          counter: counterAccount,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      setTxSignature(signature);
      
      // Wait for confirmation
      await connection.confirmTransaction(
        {
          blockhash: (await connection.getLatestBlockhash()).blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
          signature,
        },
        'confirmed'
      );
      
      // Read the counter value after initialization
      await fetchCounter();
      
    } catch (err) {
      console.error('Initialize error:', err);
      setError(`Failed to initialize counter: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, getProgram, getCounterAccount, sendTransaction, connection, fetchCounter]);

  // Increment counter
  const incrementCounter = useCallback(async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const program = getProgram();
      if (!program) {
        throw new Error('Program not available');
      }
      
      const counterAccount = await getCounterAccount();
      if (!counterAccount) {
        throw new Error('Failed to derive counter account address');
      }
      
      const tx = await program.methods
        .increment()
        .accounts({
          counter: counterAccount,
          authority: publicKey,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      setTxSignature(signature);
      
      // Wait for confirmation
      await connection.confirmTransaction(
        {
          blockhash: (await connection.getLatestBlockhash()).blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
          signature,
        },
        'confirmed'
      );
      // Read the updated counter value
      await fetchCounter();
      
    } catch (err) {
      console.error('Increment error:', err);
      setError(`Failed to increment counter: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, getProgram, getCounterAccount, sendTransaction, connection, fetchCounter]);

  // Decrement counter
  const decrementCounter = useCallback(async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const program = getProgram();
      if (!program) {
        throw new Error('Program not available');
      }
      
      const counterAccount = await getCounterAccount();
      if (!counterAccount) {
        throw new Error('Failed to derive counter account address');
      }
      
      const tx = await program.methods
        .decrement()
        .accounts({
          counter: counterAccount,
          authority: publicKey,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      setTxSignature(signature);
      
      // Wait for confirmation
      await connection.confirmTransaction(
        {
          blockhash: (await connection.getLatestBlockhash()).blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
          signature,
        },
        'confirmed'
      );
      
      // Read the updated counter value
      await fetchCounter();
      
    } catch (err) {
      console.error('Decrement error:', err);
      setError(`Failed to decrement counter: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, getProgram, getCounterAccount, sendTransaction, connection, fetchCounter]);

  // Fetch the counter value when wallet connects
  useEffect(() => {
    fetchCounter();
  }, [fetchCounter, publicKey]);

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-gray-700 dark:text-gray-300 text-center">
          Connect your wallet to interact with the counter program
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Counter Program</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      
      {txSignature && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm">
          <p>Transaction submitted!</p>
          <a 
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-green-800 dark:hover:text-green-200"
          >
            View on Solana Explorer
          </a>
        </div>
      )}
      
      <div className="mb-6 flex flex-col items-center">
        <div className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          {count !== null ? count : 'Not initialized'}
        </div>
        <p className="text-gray-600 dark:text-gray-400">Current count</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {count === null ? (
          <button
            onClick={initializeCounter}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Initializing...' : 'Initialize Counter'}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={incrementCounter}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Increment Counter'}
            </button>
            <button
              onClick={decrementCounter}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Decrement Counter'}
            </button>
          </div>
        )}
        
        <button
          onClick={fetchCounter}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Refresh Count'}
        </button>
      </div>
    </div>
  );
};

export default CounterProgramClient;
