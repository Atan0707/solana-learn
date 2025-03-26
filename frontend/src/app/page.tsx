import CounterProgram from "@/components/CounterProgram";
import WalletButton from "@/components/WalletButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-blue-700 dark:text-blue-400 mb-4">Solana Counter dApp</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
          A simple counter application built on the Solana blockchain. Connect your wallet to initialize and increment a counter.
        </p>
      </header>
      
      <div className="mb-6 w-full max-w-md">
        <WalletButton />
      </div>
      
      <main className="w-full max-w-md mb-12">
        <CounterProgram />
      </main>
      
      <section className="my-8 max-w-2xl text-gray-700 dark:text-gray-300">
        <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-4">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-blue-600 dark:text-blue-300 mb-2">Initialize</h3>
            <p>Creates a new counter account unique to your wallet address with an initial value of 0.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-blue-600 dark:text-blue-300 mb-2">Increment</h3>
            <p>Increases your counter by 1. Each transaction is recorded on the Solana blockchain.</p>
          </div>
        </div>
      </section>
      
      <footer className="mt-auto py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Built with Next.js, Tailwind CSS, and Solana Web3.js</p>
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
