
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, LogOut } from 'lucide-react';
import { WalletProviderType } from '@/types/crypto';

interface ConnectedWalletProps {
  walletAddress: string;
  walletProvider: WalletProviderType | "none";
  chainId?: number | null;
  onDisconnect: () => Promise<void>;
}

const ConnectedWallet: React.FC<ConnectedWalletProps> = ({
  walletAddress,
  walletProvider,
  chainId,
  onDisconnect
}) => {
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const getNetworkName = (id: number | null | undefined) => {
    if (!id) return 'Desconhecido';
    
    switch (id) {
      case 1: return 'Ethereum Mainnet';
      case 56: return 'Binance Smart Chain';
      case 137: return 'Polygon';
      case 42161: return 'Arbitrum One';
      case 43114: return 'Avalanche C-Chain';
      default: return `Rede ${id}`;
    }
  };
  
  const getExplorerUrl = (address: string, chainId: number | null | undefined) => {
    if (!address) return '';
    
    switch (chainId) {
      case 1: return `https://etherscan.io/address/${address}`;
      case 56: return `https://bscscan.com/address/${address}`;
      case 137: return `https://polygonscan.com/address/${address}`;
      case 42161: return `https://arbiscan.io/address/${address}`;
      case 43114: return `https://snowtrace.io/address/${address}`;
      default: return `https://etherscan.io/address/${address}`;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-2">Carteira conectada</h3>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-gray-600">Endereço: <span className="font-medium text-gray-800">{formatAddress(walletAddress)}</span></p>
          <p className="text-gray-600">Provedor: <span className="font-medium text-gray-800 capitalize">{walletProvider}</span></p>
          {chainId && (
            <p className="text-gray-600">Rede: <span className="font-medium text-gray-800">{getNetworkName(chainId)}</span></p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => window.open(getExplorerUrl(walletAddress, chainId), '_blank')}
          >
            <ExternalLink size={14} />
            <span>Ver na blockchain</span>
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={onDisconnect}
          >
            <LogOut size={14} />
            <span>Desconectar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectedWallet;
