
import React from 'react';
import { WalletProvider, WalletProviderType } from '@/types/crypto';
import WalletProviderCard from './WalletProviderCard';
import ConnectedWallet from './ConnectedWallet';

interface CryptoConnectProps {
  onConnect: (provider: WalletProviderType) => Promise<void>;
  isConnected: boolean;
  walletAddress: string;
  walletProvider: WalletProviderType | "none";
}

const CryptoConnect: React.FC<CryptoConnectProps> = ({
  onConnect,
  isConnected,
  walletAddress,
  walletProvider,
}) => {
  const walletProviders: WalletProvider[] = [
    {
      name: "MetaMask",
      id: "metamask",
      icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
      description: "A extensão de carteira mais popular para navegadores. Simples e segura."
    },
    {
      name: "Coinbase Wallet",
      id: "coinbase",
      icon: "https://seeklogo.com/images/C/coinbase-coin-logo-C86F46D7B8-seeklogo.com.png",
      description: "Carteira com suporte da Coinbase, uma das maiores exchanges do mundo."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Conecte sua carteira</h2>
        <p className="text-gray-600 mb-6">
          Para comprar criptomoedas, você precisa conectar uma carteira externa. Escolha uma das opções abaixo:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {walletProviders.map((provider) => (
            <WalletProviderCard
              key={provider.id}
              provider={provider}
              isConnected={isConnected}
              currentProvider={walletProvider}
              onConnect={onConnect}
            />
          ))}
        </div>
      </div>
      
      {isConnected && (
        <ConnectedWallet 
          walletAddress={walletAddress} 
          walletProvider={walletProvider} 
        />
      )}
    </div>
  );
};

export default CryptoConnect;
