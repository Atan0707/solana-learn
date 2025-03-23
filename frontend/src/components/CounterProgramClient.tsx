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

const CounterProgramClient: FC = () => {
  const wallet = useAnchorWallet()
  const [counter, setCounter] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [counterAccount, setCounterAccount] = useState<Keypair | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false)

  // Get the connection from the Solana cluster
  const connection = new Connection(web3.clusterApiUrl('devnet'), 'confirmed')

  // Generate a new keypair for the counter account
  useEffect(() => {
    // Create a keypair for the counter account or retrieve from localStorage
    const getOrCreateCounterAccount = () => {
      if (!wallet) return
      
      // Check if we have a stored keypair in localStorage
      const storedKeypair = localStorage.getItem('counterAccountKeypair')
      
      if (storedKeypair) {
        try {
          // Recreate the keypair from the stored secret key
          const secretKey = new Uint8Array(JSON.parse(storedKeypair))
          const keypair = Keypair.fromSecretKey(secretKey)
          setCounterAccount(keypair)
          console.log('Retrieved counter account from localStorage:', keypair.publicKey.toString())
        } catch (error) {
          console.error('Error loading keypair from localStorage:', error)
          createNewKeypair()
        }
      } else {
        createNewKeypair()
      }
    }
    
    const createNewKeypair = () => {
      // Generate a new keypair for the counter
      const keypair = Keypair.generate()
      // Store the secret key in localStorage
      localStorage.setItem('counterAccountKeypair', JSON.stringify(Array.from(keypair.secretKey)))
      setCounterAccount(keypair)
      console.log('Created new counter account:', keypair.publicKey.toString())
    }

    getOrCreateCounterAccount()
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
        console.log('Counter data:', counterData)
        setCounter(Number(counterData.count))
        console.log('Counter:', counter)
        console.log('Counter account:', counterAccount.publicKey.toString())
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

      console.log('Initializing with authority:', wallet.publicKey.toString())
      console.log('Counter account:', counterAccount.publicKey.toString())
      
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

      // Check if counter is initialized first
      try {
        await program.account.counter.fetch(counterAccount.publicKey)
      } catch (error) {
        console.error('Counter not initialized or authority mismatch:', error)
        setInitialized(false)
        setLoading(false)
        return
      }

      console.log('Incrementing with authority:', wallet.publicKey.toString())
      
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

  // Reset counter account (create a new one)
  const resetCounterAccount = () => {
    if (!wallet) return
    
    // Generate a new keypair
    const keypair = Keypair.generate()
    // Store the new secret key in localStorage
    localStorage.setItem('counterAccountKeypair', JSON.stringify(Array.from(keypair.secretKey)))
    setCounterAccount(keypair)
    setInitialized(false)
    setCounter(0)
    console.log('Reset counter account to:', keypair.publicKey.toString())
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Counter Program</h2>
      
      {!wallet ? (
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300">
            Please connect your wallet to interact with the counter program
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Current Count:</span>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{counter}</span>
          </div>
          
          {counterAccount && (
            <div className="text-xs text-gray-500 dark:text-gray-400 break-all bg-gray-100 dark:bg-gray-700 p-2 rounded">
              <span className="font-semibold">Counter Account:</span> {counterAccount.publicKey.toString()}
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={incrementCounter}
              disabled={loading || !initialized}
              className="w-full"
            >
              Increment Counter
            </Button>
            
            {!initialized && (
              <Button 
                onClick={initializeCounter}
                disabled={loading}
                className="w-full"
              >
                Initialize Counter
              </Button>
            )}
          </div>
          
          {loading && (
            <div className="text-center p-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Processing transaction...</p>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={resetCounterAccount}
              variant="outline"
              className="w-full text-sm"
            >
              Reset Counter Account
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              This will create a new counter account and reset the state
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CounterProgramClient 