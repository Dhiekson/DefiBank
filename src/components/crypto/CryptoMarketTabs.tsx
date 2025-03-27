
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CryptoConnect from '@/components/crypto/CryptoConnect';
import CryptoAssetList from '@/components/crypto/CryptoAssetList';
import CryptoPurchaseForm from '@/components/crypto/CryptoPurchaseForm';
import CryptoDetail from '@/components/crypto/CryptoDetail';
import CryptoExchanges from '@/components/crypto/CryptoExchanges';
import { CryptoAsset, WalletProviderType } from '@/types/crypto';

interface CryptoMarketTabsProps {
  tab: string;
  setTab: (tab: string) => void;
  assets: CryptoAsset[];
  selectedAsset: CryptoAsset | null;
  assetDetail: any;
  chartData: any;
  isDetailLoading: boolean;
  isWalletConnected: boolean;
  walletAddress: string;
  walletProvider: WalletProviderType | "none";
  onAssetSelect: (asset: CryptoAsset) => void;
  onWalletConnect: (provider: WalletProviderType) => Promise<void>;
  onWalletDisconnect: () => Promise<void>;
  onPurchase: (amount: number) => Promise<void>;
}

const CryptoMarketTabs: React.FC<CryptoMarketTabsProps> = ({
  tab,
  setTab,
  assets,
  selectedAsset,
  assetDetail,
  chartData,
  isDetailLoading,
  isWalletConnected,
  walletAddress,
  walletProvider,
  onAssetSelect,
  onWalletConnect,
  onWalletDisconnect,
  onPurchase
}) => {
  // Função para lidar com a compra de um ativo específico
  const handleBuyAsset = () => {
    if (selectedAsset) {
      setTab("buy");
    }
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="connect">Conectar Carteira</TabsTrigger>
        <TabsTrigger value="market">Mercado</TabsTrigger>
        <TabsTrigger value="detail" disabled={!selectedAsset}>Detalhes</TabsTrigger>
        <TabsTrigger value="buy" disabled={!selectedAsset}>Comprar</TabsTrigger>
      </TabsList>
      
      <TabsContent value="connect" className="space-y-4">
        <CryptoConnect 
          onConnect={onWalletConnect}
          onDisconnect={onWalletDisconnect}
          isConnected={isWalletConnected}
          walletAddress={walletAddress}
          walletProvider={walletProvider}
        />
        
        {isWalletConnected && (
          <CryptoExchanges />
        )}
      </TabsContent>
      
      <TabsContent value="market" className="space-y-4">
        <CryptoAssetList 
          assets={assets} 
          onAssetSelect={onAssetSelect}
        />
      </TabsContent>
      
      <TabsContent value="detail" className="space-y-4">
        {selectedAsset && (
          <CryptoDetail 
            asset={selectedAsset}
            assetDetail={assetDetail}
            chartData={chartData}
            isLoading={isDetailLoading}
            onBuy={handleBuyAsset}
          />
        )}
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
