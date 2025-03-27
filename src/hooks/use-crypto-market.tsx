
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CryptoAsset } from '@/types/crypto';

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
  const [walletProvider, setWalletProvider] = useState<"metamask" | "coinbase" | "none">("none");

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
      // Obter dados da API de preços de criptomoedas (mock por enquanto)
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Mapear dados para o formato de CryptoAsset
      const cryptoAssets: CryptoAsset[] = (data || []).map(asset => ({
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        price: asset.symbol === 'BTC' ? 52100 : 3060, // Mock de preços
        change24h: (Math.random() * 10 - 5).toFixed(2), // Simulação de mudança de preço
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
    // Verificar se o MetaMask está instalado e conectado
    if (window.ethereum && window.ethereum.selectedAddress) {
      setIsWalletConnected(true);
      setWalletAddress(window.ethereum.selectedAddress);
      setWalletProvider("metamask");
      setTab("market");
    } 
    // Você também pode verificar outras carteiras aqui
  };

  const handleAssetSelect = (asset: CryptoAsset) => {
    setSelectedAsset(asset);
    setTab("buy");
  };

  const handleWalletConnect = async (provider: "metamask" | "coinbase") => {
    if (provider === "metamask") {
      // Conectar MetaMask
      try {
        // Verificar se o MetaMask está instalado
        if (!window.ethereum) {
          toast({
            title: "MetaMask não encontrado",
            description: "Por favor, instale a extensão MetaMask para continuar.",
            variant: "destructive"
          });
          return;
        }

        // Solicitar contas
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          setWalletProvider("metamask");
          
          // Registrar wallet na tabela transactions como metadata
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
      } catch (error: any) {
        console.error('Erro ao conectar MetaMask:', error);
        toast({
          title: "Erro ao conectar",
          description: error.message || "Não foi possível conectar ao MetaMask.",
          variant: "destructive"
        });
      }
    } else if (provider === "coinbase") {
      // Implementação futura para Coinbase Wallet
      toast({
        title: "Em breve",
        description: "A integração com Coinbase Wallet estará disponível em breve!"
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
      // Em uma implementação real, você enviaria uma transação para a blockchain
      // Por enquanto, vamos apenas simular a compra e registrar no Supabase
      
      // Registrar a compra no banco de dados
      const { data, error } = await supabase.from('user_assets').upsert({
        user_id: user?.id,
        asset_id: selectedAsset.id,
        amount: amount,
      }, {
        onConflict: 'user_id,asset_id'
      });
      
      if (error) throw error;
      
      // Registrar a transação
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
      
      // Voltar para a lista de mercado
      setTab("market");
      
      // Recarregar os ativos
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
