
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletProvider } from '@/types/crypto';
import { Check, ExternalLink } from 'lucide-react';

interface CryptoConnectProps {
  onConnect: (provider: "metamask" | "coinbase") => Promise<void>;
  isConnected: boolean;
  walletAddress: string;
  walletProvider: "metamask" | "coinbase" | "none";
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

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Conecte sua carteira</h2>
        <p className="text-gray-600 mb-6">
          Para comprar criptomoedas, você precisa conectar uma carteira externa. Escolha uma das opções abaixo:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {walletProviders.map((provider) => (
            <Card key={provider.id} className={`overflow-hidden ${walletProvider === provider.id ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={provider.icon} alt={provider.name} className="h-8 w-8" />
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                  </div>
                  {walletProvider === provider.id && (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      <Check size={12} className="mr-1" /> Conectado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="min-h-[60px]">{provider.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={walletProvider === provider.id ? "outline" : "default"}
                  onClick={() => onConnect(provider.id)}
                  disabled={walletProvider === provider.id}
                >
                  {walletProvider === provider.id ? 'Conectado' : 'Conectar'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {isConnected && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Carteira conectada</h3>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="flex-1">
              <p className="text-gray-600">Endereço: <span className="font-medium text-gray-800">{formatAddress(walletAddress)}</span></p>
              <p className="text-gray-600">Provedor: <span className="font-medium text-gray-800 capitalize">{walletProvider}</span></p>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => window.open(`https://etherscan.io/address/${walletAddress}`, '_blank')}>
              <ExternalLink size={14} />
              <span>Ver na blockchain</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoConnect;
