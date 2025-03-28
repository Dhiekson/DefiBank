
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletConnection } from './crypto/use-wallet-connection';
import { useCryptoAssets } from './crypto/use-crypto-assets';
import { useCryptoPurchase } from './crypto/use-crypto-purchase';

export function useCryptoMarket() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("connect");

  const {
    isWalletConnected,
    walletAddress,
    walletProvider,
    chainId,
    handleWalletConnect,
    disconnectWallet,
    checkWalletConnection
  } = useWalletConnection(user?.id);

  const {
    assets,
    selectedAsset,
    assetDetail,
    chartData,
    isLoading,
    isDetailLoading,
    hasMore,
    loadAssets,
    loadMoreAssets,
    handleAssetSelect,
    handleRefresh,
    setSelectedAsset,
    searchAssets
  } = useCryptoAssets(user?.id);

  const { handlePurchase } = useCryptoPurchase(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadAssets();
      checkWalletConnection();
    }
  }, [user, authLoading, navigate]);

  const handleAssetSelectWithTabChange = (asset: any) => {
    handleAssetSelect(asset);
    setTab("detail");
  };

  const handleWalletConnectWithTabChange = async (provider: any) => {
    const success = await handleWalletConnect(provider);
    if (success) {
      setTab("market");
    }
  };

  const handleWalletDisconnectWithRefresh = async () => {
    await disconnectWallet();
    setTab("connect");
  };

  const handlePurchaseWithTabChange = async (amount: number) => {
    const success = await handlePurchase(amount, selectedAsset, isWalletConnected, walletAddress);
    if (success) {
      setTab("market");
      loadAssets();
      setSelectedAsset(null);
    }
  };

  return {
    user,
    assets,
    selectedAsset,
    assetDetail,
    chartData,
    isLoading,
    isDetailLoading,
    tab,
    setTab,
    hasMore,
    isWalletConnected,
    walletAddress,
    walletProvider,
    chainId,
    handleAssetSelect: handleAssetSelectWithTabChange,
    handleWalletConnect: handleWalletConnectWithTabChange,
    handleWalletDisconnect: handleWalletDisconnectWithRefresh,
    handlePurchase: handlePurchaseWithTabChange,
    handleRefresh,
    loadMoreAssets,
    searchAssets,
    authLoading
  };
}
