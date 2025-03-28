
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CryptoAsset } from '@/types/crypto';

export function useCryptoPurchase(userId?: string) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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
    
    setIsProcessing(true);
    
    try {
      // Verificar se o usuário já possui este ativo
      const { data: existingAsset, error: queryError } = await supabase
        .from('user_assets')
        .select('*')
        .eq('user_id', userId)
        .eq('asset_id', selectedAsset.id)
        .single();
      
      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = Nenhum resultado encontrado
        throw queryError;
      }
      
      // Registrar a transação
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
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
        })
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // Atualizar ou criar o registro de ativo do usuário
      if (existingAsset) {
        // Usuário já possui o ativo, atualizar a quantidade
        const newAmount = existingAsset.amount + amount;
        
        const { error: updateError } = await supabase
          .from('user_assets')
          .update({ 
            amount: newAmount,
            last_transaction_id: transaction.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAsset.id);
        
        if (updateError) throw updateError;
      } else {
        // Usuário não possui o ativo, criar um novo registro
        const { error: insertError } = await supabase
          .from('user_assets')
          .insert({
            user_id: userId,
            asset_id: selectedAsset.id,
            amount: amount,
            last_transaction_id: transaction.id
          });
        
        if (insertError) throw insertError;
      }
      
      // Configurar uma simulação de atraso para a animação de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSell = async (
    amount: number,
    selectedAsset: CryptoAsset | null,
    isWalletConnected: boolean,
    walletAddress: string
  ) => {
    if (!selectedAsset || !userId) return false;
    
    if (!isWalletConnected) {
      toast({
        title: "Carteira não conectada",
        description: "Por favor, conecte uma carteira antes de fazer uma venda.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // Verificar se o usuário possui esse ativo e em quantidade suficiente
      const { data: userAsset, error: queryError } = await supabase
        .from('user_assets')
        .select('*')
        .eq('user_id', userId)
        .eq('asset_id', selectedAsset.id)
        .single();
      
      if (queryError) throw queryError;
      
      if (!userAsset) {
        throw new Error(`Você não possui ${selectedAsset.symbol} em sua carteira.`);
      }
      
      if (userAsset.amount < amount) {
        throw new Error(`Saldo insuficiente. Você possui apenas ${userAsset.amount} ${selectedAsset.symbol}.`);
      }
      
      // Registrar a transação de venda
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'conversion',
          amount: amount * selectedAsset.price,
          description: `Venda de ${amount} ${selectedAsset.symbol}`,
          status: 'completed',
          metadata: {
            asset_id: selectedAsset.id,
            asset_amount: -amount, // Valor negativo para venda
            wallet_address: walletAddress,
            price_per_unit: selectedAsset.price
          }
        })
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // Atualizar o saldo do ativo
      const newAmount = userAsset.amount - amount;
      
      if (newAmount > 0) {
        // Ainda tem saldo, atualizar
        const { error: updateError } = await supabase
          .from('user_assets')
          .update({ 
            amount: newAmount,
            last_transaction_id: transaction.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', userAsset.id);
        
        if (updateError) throw updateError;
      } else {
        // Não tem mais saldo, remover o registro
        const { error: deleteError } = await supabase
          .from('user_assets')
          .delete()
          .eq('id', userAsset.id);
        
        if (deleteError) throw deleteError;
      }
      
      // Simulação de delay para processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Venda realizada",
        description: `Você vendeu ${amount} ${selectedAsset.symbol} com sucesso!`
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao processar venda:', error);
      toast({
        title: "Erro na venda",
        description: error.message || "Não foi possível processar sua venda.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handlePurchase,
    handleSell,
    isProcessing
  };
}
