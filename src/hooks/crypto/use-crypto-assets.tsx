
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CryptoAsset } from '@/types/crypto';
import { fetchCryptoAssets, fetchCryptoAssetDetail, fetchCryptoAssetChart } from '@/services/crypto-api';

export function useCryptoAssets(userId?: string) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [assetDetail, setAssetDetail] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      // Carregar ativos da API externa
      const cryptoAssets = await fetchCryptoAssets(20);
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
      const chart = await fetchCryptoAssetChart(assetId, 7);
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

  return {
    assets,
    selectedAsset,
    assetDetail,
    chartData,
    isLoading,
    isDetailLoading,
    loadAssets,
    handleAssetSelect,
    handleRefresh,
    setSelectedAsset
  };
}
