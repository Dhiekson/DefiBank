
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
    handleWalletConnect
  } = useWalletConnection(user?.id);

  const {
    assets,
    selectedAsset,
    isLoading,
    loadAssets,
    handleAssetSelect,
    handleRefresh,
    setSelectedAsset
  } = useCryptoAssets(user?.id);

  const { handlePurchase } = useCryptoPurchase(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadAssets();
    }
  }, [user, authLoading, navigate]);

  const handleAssetSelectWithTabChange = (asset: any) => {
    handleAssetSelect(asset);
    setTab("buy");
  };

  const handleWalletConnectWithTabChange = async (provider: any) => {
    const success = await handleWalletConnect(provider);
    if (success) {
      setTab("market");
    }
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
    isLoading,
    tab,
    setTab,
    isWalletConnected,
    walletAddress,
    walletProvider,
    handleAssetSelect: handleAssetSelectWithTabChange,
    handleWalletConnect: handleWalletConnectWithTabChange,
    handlePurchase: handlePurchaseWithTabChange,
    handleRefresh,
    authLoading
  };
}
