
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CryptoConnect from '@/components/crypto/CryptoConnect';
import CryptoAssetList from '@/components/crypto/CryptoAssetList';
import CryptoPurchaseForm from '@/components/crypto/CryptoPurchaseForm';
import { CryptoAsset, WalletProviderType } from '@/types/crypto';

interface CryptoMarketTabsProps {
  tab: string;
  setTab: (tab: string) => void;
  assets: CryptoAsset[];
  selectedAsset: CryptoAsset | null;
  isWalletConnected: boolean;
  walletAddress: string;
  walletProvider: WalletProviderType | "none";
  onAssetSelect: (asset: CryptoAsset) => void;
  onWalletConnect: (provider: WalletProviderType) => Promise<void>;
  onPurchase: (amount: number) => Promise<void>;
}

const CryptoMarketTabs: React.FC<CryptoMarketTabsProps> = ({
  tab,
  setTab,
  assets,
  selectedAsset,
  isWalletConnected,
  walletAddress,
  walletProvider,
  onAssetSelect,
  onWalletConnect,
  onPurchase
}) => {
  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="connect">Conectar Carteira</TabsTrigger>
        <TabsTrigger value="market">Mercado</TabsTrigger>
        <TabsTrigger value="buy" disabled={!selectedAsset}>Comprar</TabsTrigger>
      </TabsList>
      
      <TabsContent value="connect" className="space-y-4">
        <CryptoConnect 
          onConnect={onWalletConnect}
          isConnected={isWalletConnected}
          walletAddress={walletAddress}
          walletProvider={walletProvider}
        />
      </TabsContent>
      
      <TabsContent value="market" className="space-y-4">
        <CryptoAssetList 
          assets={assets} 
          onAssetSelect={onAssetSelect}
        />
      </TabsContent>
      
      <TabsContent value="buy" className="space-y-4">
        {selectedAsset && (
          <CryptoPurchaseForm 
            asset={selectedAsset}
            walletAddress={walletAddress}
            isWalletConnected={isWalletConnected}
            onPurchase={onPurchase}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CryptoMarketTabs;
