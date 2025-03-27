
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CryptoAsset } from '@/types/crypto';

export function useCryptoAssets(userId?: string) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleAssetSelect = (asset: CryptoAsset) => {
    setSelectedAsset(asset);
  };

  const handleRefresh = () => {
    loadAssets();
    toast({
      title: "Dados atualizados",
      description: "Lista de criptomoedas atualizada com sucesso."
    });
  };

  return {
    assets,
    selectedAsset,
    isLoading,
    loadAssets,
    handleAssetSelect,
    handleRefresh,
    setSelectedAsset
  };
}
