
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CryptoAsset } from '@/types/crypto';

export function useCryptoPurchase(userId?: string) {
  const { toast } = useToast();

  const handlePurchase = async (
    amount: number,
    selectedAsset: CryptoAsset | null,
    isWalletConnected: boolean,
    walletAddress: string
  ) => {
    if (!selectedAsset || !userId) return false;
    
    if (!isWalletConnected) {
      toast({
        title: "Carteira não conectada",
        description: "Por favor, conecte uma carteira antes de fazer uma compra.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const { data, error } = await supabase.from('user_assets').upsert({
        user_id: userId,
        asset_id: selectedAsset.id,
        amount: amount,
      }, {
        onConflict: 'user_id,asset_id'
      });
      
      if (error) throw error;
      
      await supabase.from('transactions').insert({
        user_id: userId,
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
      
      return true;
    } catch (error: any) {
      console.error('Erro ao processar compra:', error);
      toast({
        title: "Erro na compra",
        description: error.message || "Não foi possível processar sua compra.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handlePurchase
  };
}
