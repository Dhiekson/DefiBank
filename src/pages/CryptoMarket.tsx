
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCryptoMarket } from '@/hooks/use-crypto-market';
import CryptoMarketHeader from '@/components/crypto/CryptoMarketHeader';
import CryptoMarketTabs from '@/components/crypto/CryptoMarketTabs';
import LoadingIndicator from '@/components/ui/loading-indicator';

const CryptoMarket: React.FC = () => {
  const {
    authLoading,
    isLoading,
    isDetailLoading,
    assets,
    selectedAsset,
    assetDetail,
    chartData,
    tab,
    setTab,
    isWalletConnected,
    walletAddress,
    walletProvider,
    handleAssetSelect,
    handleWalletConnect,
    handleWalletDisconnect,
    handlePurchase,
    handleRefresh
  } = useCryptoMarket();

  if (authLoading || isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <CryptoMarketHeader onRefresh={handleRefresh} />
          
          <CryptoMarketTabs 
            tab={tab}
            setTab={setTab}
            assets={assets}
            selectedAsset={selectedAsset}
            assetDetail={assetDetail}
            chartData={chartData}
            isDetailLoading={isDetailLoading}
            isWalletConnected={isWalletConnected}
            walletAddress={walletAddress}
            walletProvider={walletProvider}
            onAssetSelect={handleAssetSelect}
            onWalletConnect={handleWalletConnect}
            onWalletDisconnect={handleWalletDisconnect}
            onPurchase={handlePurchase}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CryptoMarket;
