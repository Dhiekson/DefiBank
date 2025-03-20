
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WalletHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ 
  refreshing, 
  onRefresh 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [change24h, setChange24h] = useState(0);

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
    }
  }, [user]);

  const fetchWalletBalance = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar o saldo da carteira
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setTotalBalance(data.balance);
        
        // Simular uma variação para as últimas 24h
        // Em um sistema real, isso seria calculado com base em transações reais
        setChange24h(Math.random() * 5 - 1); // Variação entre -1% e 4%
      }
    } catch (error: any) {
      console.error('Erro ao buscar saldo:', error.message);
      toast({
        title: "Erro ao buscar saldo",
        description: "Não foi possível atualizar o saldo da sua carteira.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    onRefresh();
    fetchWalletBalance();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-bank-navy">Carteira Digital</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10" 
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCcw size={18} className={`text-bank-gray ${refreshing || loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-bank-gray mb-1">Saldo Total</p>
        {loading ? (
          <div className="h-8 w-40 bg-gray-200 animate-pulse rounded-md"></div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-bank-navy">R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <div className={`flex items-center ${change24h >= 0 ? 'text-green-600' : 'text-red-600'} text-sm mt-1`}>
              <ArrowUpRight size={14} className="mr-1" />
              <span>{change24h >= 0 ? '+' : ''}{change24h.toFixed(1)}% nas últimas 24h</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletHeader;
