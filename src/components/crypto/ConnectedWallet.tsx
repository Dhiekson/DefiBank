
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { WalletProviderType } from '@/types/crypto';

interface ConnectedWalletProps {
  walletAddress: string;
  walletProvider: WalletProviderType | "none";
}

const ConnectedWallet: React.FC<ConnectedWalletProps> = ({
  walletAddress,
  walletProvider
}) => {
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-2">Carteira conectada</h3>
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <div className="flex-1">
          <p className="text-gray-600">Endereço: <span className="font-medium text-gray-800">{formatAddress(walletAddress)}</span></p>
          <p className="text-gray-600">Provedor: <span className="font-medium text-gray-800 capitalize">{walletProvider}</span></p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={() => window.open(`https://etherscan.io/address/${walletAddress}`, '_blank')}
        >
          <ExternalLink size={14} />
          <span>Ver na blockchain</span>
        </Button>
      </div>
    </div>
  );
};

export default ConnectedWallet;
