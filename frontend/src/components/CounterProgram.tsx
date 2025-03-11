'use client'

import { FC, useEffect, useState } from 'react'
import { Connection, PublicKey, Keypair } from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, web3, Idl } from '@coral-xyz/anchor'
import { idl, CounterAccount } from '@/idl/contract'
import Button from '@/components/ui/button'

// Define a type for our program with the expected account structure
type CounterProgram = Program<Idl> & {
  account: {
    counter: {
      fetch(address: PublicKey): Promise<CounterAccount>
    }
  }
}

const CounterProgram: FC = () => {
  const wallet = useAnchorWallet()
  const [counter, setCounter] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [counterAccount, setCounterAccount] = useState<Keypair | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false)

  // Get the connection from the Solana cluster
  const connection = new Connection(web3.clusterApiUrl('devnet'), 'confirmed')

  // Generate a new keypair for the counter account
  useEffect(() => {
    // Create a keypair for the counter account
    const generateCounterAccount = () => {
      if (!wallet) return
      
      // Generate a new keypair for the counter
      const keypair = Keypair.generate();
      setCounterAccount(keypair);
    }

    generateCounterAccount()
  }, [wallet])

  // Fetch counter data
  const fetchCounter = async () => {
    if (!wallet || !counterAccount) return

    try {
      setLoading(true)
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      )

      const program = new Program(idl, provider) as CounterProgram

      try {
        // Try to fetch the counter account
        const counterData = await program.account.counter.fetch(counterAccount.publicKey)
        setCounter(Number(counterData.count))
        setInitialized(true)
      } catch (error: unknown) {
        // Silently catch error when counter is not initialized
        console.log('Counter not initialized yet:', error instanceof Error ? error.message : String(error))
        setInitialized(false)
      }
    } catch (err) {
      console.error('Error fetching counter:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initialize counter
  const initializeCounter = async () => {
    if (!wallet || !counterAccount) return

    try {
      setLoading(true)
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      )

      const program = new Program(idl, provider) as CounterProgram

      // Create the transaction to initialize the counter
      await program.methods
        .initialize()
        .accounts({
          counter: counterAccount.publicKey,
          authority: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([counterAccount])
        .rpc()

      // Fetch the counter after initialization
      await fetchCounter()
    } catch (err) {
      console.error('Error initializing counter:', err)
    } finally {
      setLoading(false)
    }
  }

  // Increment counter
  const incrementCounter = async () => {
    if (!wallet || !counterAccount) return

    try {
      setLoading(true)
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      )

      const program = new Program(idl, provider) as CounterProgram

      // Create the transaction to increment the counter
      await program.methods
        .increment()
        .accounts({
          counter: counterAccount.publicKey,
          authority: wallet.publicKey,
        })
        .rpc()

      // Fetch the counter after incrementing
      await fetchCounter()
    } catch (err) {
      console.error('Error incrementing counter:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch counter on component mount and when wallet changes
  useEffect(() => {
    if (wallet && counterAccount) {
      fetchCounter()
    }
  }, [wallet, counterAccount])

  if (!wallet) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Solana Counter</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Please connect your wallet to interact with the counter.</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white">Solana Counter</h2>
      
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2 text-gray-800 dark:text-white">{counter}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Count</p>
        </div>

        <div className="flex flex-col space-y-3 w-full">
          {!initialized ? (
            <Button
              onClick={initializeCounter}
              disabled={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? 'Initializing...' : 'Initialize Counter'}
            </Button>
          ) : (
            <Button
              onClick={incrementCounter}
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading ? 'Processing...' : 'Increment Counter'}
            </Button>
          )}
          
          <Button
            onClick={fetchCounter}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Refreshing...' : 'Refresh Counter'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CounterProgram

