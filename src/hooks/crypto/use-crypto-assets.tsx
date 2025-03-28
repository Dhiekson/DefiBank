
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CryptoAsset } from '@/types/crypto';
import { 
  fetchCryptoAssets, 
  fetchCryptoAssetDetail, 
  fetchCryptoAssetChart, 
  fetchAllCryptoCurrencies 
} from '@/services/crypto-api';

export function useCryptoAssets(userId?: string) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [assetDetail, setAssetDetail] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      // Carregar ativos da API externa
      const cryptoAssets = await fetchCryptoAssets(100);
      setAssets(cryptoAssets);
      
      // Recuperar ativos do usuário do Supabase para mostrar os que ele já possui
      if (userId) {
        const { data, error } = await supabase
          .from('user_assets')
          .select(`
            id,
            amount,
            assets (
              id,
              name,
              symbol,
              icon
            )
          `)
          .eq('user_id', userId);
        
        if (error) throw error;
        
        // Aqui poderíamos marcar quais ativos o usuário já possui
      }
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

  const loadMoreAssets = async () => {
    if (isLoading || !hasMore) return;
    
    try {
      const nextPage = page + 1;
      const moreAssets = await fetchAllCryptoCurrencies(nextPage, 100);
      
      if (moreAssets.length === 0) {
        setHasMore(false);
        return;
      }
      
      setAssets(prevAssets => [...prevAssets, ...moreAssets]);
      setPage(nextPage);
    } catch (error: any) {
      console.error('Erro ao carregar mais ativos:', error.message);
      toast({
        title: "Erro ao carregar mais ativos",
        description: "Não foi possível carregar mais criptomoedas.",
        variant: "destructive"
      });
    }
  };

  const handleAssetSelect = async (asset: CryptoAsset) => {
    setSelectedAsset(asset);
    loadAssetDetail(asset.id);
  };

  const loadAssetDetail = async (assetId: string) => {
    setIsDetailLoading(true);
    try {
      // Carregar detalhes do ativo
      const detail = await fetchCryptoAssetDetail(assetId);
      setAssetDetail(detail);
      
      // Carregar dados do gráfico
      const chart = await fetchCryptoAssetChart(assetId, 30);
      setChartData(chart);
      
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do ativo:', error.message);
      toast({
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os detalhes da criptomoeda.",
        variant: "destructive"
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAssets();
    if (selectedAsset) {
      loadAssetDetail(selectedAsset.id);
    }
    
    toast({
      title: "Dados atualizados",
      description: "Lista de criptomoedas atualizada com sucesso."
    });
  };

  const searchAssets = (query: string) => {
    if (!query) {
      loadAssets();
      return;
    }
    
    const filtered = assets.filter(asset => 
      asset.name.toLowerCase().includes(query.toLowerCase()) || 
      asset.symbol.toLowerCase().includes(query.toLowerCase())
    );
    
    setAssets(filtered);
  };

  return {
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
  };
}
