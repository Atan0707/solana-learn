import CounterProgram from "@/components/CounterProgram";
import WalletButton from "@/components/WalletButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Solana Counter dApp</h1>
        <p className="text-gray-600 dark:text-gray-300">Interact with a Solana smart contract</p>
      </header>
      
      <div className="mb-6 w-full max-w-md">
        <WalletButton />
      </div>
      
      <main className="w-full max-w-md">
        <CounterProgram />
      </main>
      
      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Built with Next.js and Solana Web3.js</p>
        <p className="mt-1">
          <a 
            href="https://github.com/Atan0707/solana-learn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
