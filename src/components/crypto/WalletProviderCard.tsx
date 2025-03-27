
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { WalletProvider, WalletProviderType } from '@/types/crypto';

interface WalletProviderCardProps {
  provider: WalletProvider;
  isConnected: boolean;
  currentProvider: WalletProviderType | "none";
  onConnect: (provider: WalletProviderType) => Promise<void>;
}

const WalletProviderCard: React.FC<WalletProviderCardProps> = ({
  provider,
  isConnected,
  currentProvider,
  onConnect
}) => {
  const isCurrentProvider = currentProvider === provider.id;

  return (
    <Card key={provider.id} className={`overflow-hidden ${isCurrentProvider ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={provider.icon} alt={provider.name} className="h-8 w-8" />
            <CardTitle className="text-lg">{provider.name}</CardTitle>
          </div>
          {isCurrentProvider && (
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
          variant={isCurrentProvider ? "outline" : "default"}
          onClick={() => onConnect(provider.id)}
          disabled={isCurrentProvider}
        >
          {isCurrentProvider ? 'Conectado' : 'Conectar'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WalletProviderCard;
