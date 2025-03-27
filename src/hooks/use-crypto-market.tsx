import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CryptoAsset, WalletProviderType } from '@/types/crypto';

export function useCryptoMarket() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("connect");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletProvider, setWalletProvider] = useState<WalletProviderType | "none">("none");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadAssets();
      checkWalletConnection();
    }
  }, [user, authLoading, navigate]);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      const cryptoAssets: CryptoAsset[] = (data || []).map(asset => ({
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        price: asset.symbol === 'BTC' ? 52100 : 3060,
        change24h: (Math.random() * 10 - 5).toFixed(2),
        volume24h: Math.floor(Math.random() * 1000000000),
        marketCap: asset.symbol === 'BTC' ? 1100000000000 : 350000000000,
        logoUrl: `https://cryptologos.cc/logos/${asset.symbol.toLowerCase()}-${asset.symbol.toLowerCase()}-logo.png`
      }));
      
      setAssets(cryptoAssets);
    } catch (error: any) {
      console.error('Erro ao carregar ativos:', error.message);
      toast({
        title: "Erro ao carregar ativos",
        description: "Não foi possível carregar a lista de criptomoedas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setIsWalletConnected(true);
      setWalletAddress(window.ethereum.selectedAddress);
      setWalletProvider("metamask");
      setTab("market");
    } 
  };

  const handleAssetSelect = (asset: CryptoAsset) => {
    setSelectedAsset(asset);
    setTab("buy");
  };

  const handleWalletConnect = async (provider: WalletProviderType) => {
    if (provider === "metamask") {
      if (!window.ethereum) {
        toast({
          title: "MetaMask não encontrado",
          description: "Por favor, instale a extensão MetaMask para continuar.",
          variant: "destructive"
        });
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        setWalletProvider("metamask");
        
        await supabase.from('transactions').insert({
          user_id: user?.id,
          type: 'wallet_connect',
          amount: 0,
          description: 'Conexão de carteira externa',
          status: 'completed',
          metadata: {
            wallet_address: accounts[0],
            wallet_provider: 'metamask',
            is_active: true
          }
        });
        
        toast({
          title: "Carteira conectada",
          description: "Sua carteira MetaMask foi conectada com sucesso."
        });
        
        setTab("market");
      }
    } else if (provider === "coinbase") {
      toast({
        title: "Em breve",
        description: "A integração com Coinbase Wallet estará disponível em breve!"
      });
    } else {
      toast({
        title: "Provedor não suportado",
        description: `A integração com ${provider} será implementada em breve!`
      });
    }
  };

  const handlePurchase = async (amount: number) => {
    if (!selectedAsset) return;
    if (!isWalletConnected) {
      toast({
        title: "Carteira não conectada",
        description: "Por favor, conecte uma carteira antes de fazer uma compra.",
        variant: "destructive"
      });
      setTab("connect");
      return;
    }
    
    try {
      const { data, error } = await supabase.from('user_assets').upsert({
        user_id: user?.id,
        asset_id: selectedAsset.id,
        amount: amount,
      }, {
        onConflict: 'user_id,asset_id'
      });
      
      if (error) throw error;
      
      await supabase.from('transactions').insert({
        user_id: user?.id,
        type: 'conversion',
        amount: amount * selectedAsset.price,
        description: `Compra de ${amount} ${selectedAsset.symbol}`,
        status: 'completed',
        metadata: {
          asset_id: selectedAsset.id,
          asset_amount: amount,
          wallet_address: walletAddress,
          price_per_unit: selectedAsset.price
        }
      });
      
      toast({
        title: "Compra realizada",
        description: `Você comprou ${amount} ${selectedAsset.symbol} com sucesso!`
      });
      
      setTab("market");
      
      loadAssets();
    } catch (error: any) {
      console.error('Erro ao processar compra:', error);
      toast({
        title: "Erro na compra",
        description: error.message || "Não foi possível processar sua compra.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    loadAssets();
    toast({
      title: "Dados atualizados",
      description: "Lista de criptomoedas atualizada com sucesso."
    });
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
    handleAssetSelect,
    handleWalletConnect,
    handlePurchase,
    handleRefresh,
    authLoading
  };
}
