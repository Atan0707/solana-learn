'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import wallet components with SSR disabled
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const WalletConnectionStatus = dynamic(
  async () => {
    const { useWallet } = await import('@solana/wallet-adapter-react');
    
    return function WalletStatus() {
      const { wallet, connected } = useWallet();
      
      if (!connected) return null;
      
      return (
        <div className="ml-4 text-sm text-gray-600 dark:text-gray-300">
          Connected to {wallet?.adapter.name}
        </div>
      );
    };
  },
  { ssr: false }
);

const WalletButton: FC = () => {
  return (
    <div className="flex items-center justify-center">
      <WalletMultiButtonDynamic className="wallet-button" />
      <WalletConnectionStatus />
    </div>
  );
};

export default WalletButton; 