
import React from 'react';
import { WalletProvider, WalletProviderType } from '@/types/crypto';
import WalletProviderCard from './WalletProviderCard';
import ConnectedWallet from './ConnectedWallet';

interface CryptoConnectProps {
  onConnect: (provider: WalletProviderType) => Promise<void>;
  onDisconnect: () => Promise<void>;
  isConnected: boolean;
  walletAddress: string;
  walletProvider: WalletProviderType | "none";
}

const CryptoConnect: React.FC<CryptoConnectProps> = ({
  onConnect,
  onDisconnect,
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
      name: "WalletConnect",
      id: "walletconnect",
      icon: "https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png",
      description: "Conecte com qualquer carteira móvel via QR code. Não precisa de extensão."
    },
    {
      name: "Trust Wallet",
      id: "trustwallet",
      icon: "https://trustwallet.com/assets/images/favicon.png",
      description: "Carteira móvel multi-blockchain. Popular para aplicativos DeFi e NFTs."
    }
  ];

  return (
    <div className="space-y-6">
      {isConnected && (
        <ConnectedWallet 
          walletAddress={walletAddress} 
          walletProvider={walletProvider}
          onDisconnect={onDisconnect} 
        />
      )}
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">
          {isConnected ? 'Trocar carteira' : 'Conecte sua carteira'}
        </h2>
        <p className="text-gray-600 mb-6">
          {isConnected 
            ? 'Você já está conectado, mas pode trocar para outra carteira se desejar:'
            : 'Para comprar criptomoedas, você precisa conectar uma carteira externa. Escolha uma das opções abaixo:'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  );
};

export default CryptoConnect;
