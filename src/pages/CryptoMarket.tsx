
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCryptoMarket } from '@/hooks/use-crypto-market';
import CryptoMarketHeader from '@/components/crypto/CryptoMarketHeader';
import CryptoMarketTabs from '@/components/crypto/CryptoMarketTabs';
import LoadingIndicator from '@/components/ui/loading-indicator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CryptoMarket: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    isLoading,
    isDetailLoading,
    assets,
    selectedAsset,
    assetDetail,
    chartData,
    tab,
    setTab,
    hasMore,
    isWalletConnected,
    walletAddress,
    walletProvider,
    handleAssetSelect,
    handleWalletConnect,
    handleWalletDisconnect,
    handlePurchase,
    handleRefresh,
    loadMoreAssets,
    searchAssets
  } = useCryptoMarket();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar o mercado de criptomoedas.",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, authLoading, navigate, toast]);

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
            isLoading={isLoading}
            hasMore={hasMore}
            isWalletConnected={isWalletConnected}
            walletAddress={walletAddress}
            walletProvider={walletProvider}
            onAssetSelect={handleAssetSelect}
            onWalletConnect={handleWalletConnect}
            onWalletDisconnect={handleWalletDisconnect}
            onPurchase={handlePurchase}
            onLoadMore={loadMoreAssets}
            onSearch={searchAssets}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CryptoMarket;
