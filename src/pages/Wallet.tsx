import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bitcoin, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Import the new components
import WalletHeader from '@/components/wallet/WalletHeader';
import WalletActions from '@/components/wallet/WalletActions';
import AssetsList from '@/components/wallet/AssetsList';
import TransactionList from '@/components/wallet/TransactionList';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'conversion';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  recipient_id?: string;
}

interface SupabaseTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  recipient_id?: string;
  currency: string;
  updated_at: string;
  user_id: string;
  metadata: Json;
}

interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  change: number;
  icon: React.ReactNode;
}

interface TransactionItemProps {
  id: string;
  type: 'in' | 'out';
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

const getAssetIcon = (symbol: string) => {
  switch (symbol.toUpperCase()) {
    case 'BTC':
      return <Bitcoin size={24} className="text-amber-600" />;
    case 'ETH':
      return <Coins size={24} className="text-blue-600" />;
    default:
      return <Coins size={24} className="text-gray-600" />;
  }
};

const Wallet: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadWalletData();
    }
  }, [user, authLoading, navigate]);

  const loadWalletData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    await Promise.all([
      loadRecentTransactions(),
      loadUserAssets()
    ]);
    setIsLoading(false);
  };

  const loadRecentTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        throw error;
      }
      
      const formattedTransactions: Transaction[] = (data || []).map((item: SupabaseTransaction) => ({
        id: item.id,
        type: item.type as 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'conversion',
        amount: item.amount,
        description: item.description || '',
        status: item.status as 'pending' | 'completed' | 'failed',
        created_at: item.created_at,
        recipient_id: item.recipient_id
      }));
      
      setRecentTransactions(formattedTransactions);
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error.message);
      toast({
        title: "Erro ao carregar transações",
        description: "Não foi possível carregar o histórico de transações.",
        variant: "destructive"
      });
    }
  };

  const loadUserAssets = async () => {
    try {
      const { data: userAssetsData, error: userAssetsError } = await supabase
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
        .eq('user_id', user?.id);
      
      if (userAssetsError) {
        throw userAssetsError;
      }
      
      if (!userAssetsData || userAssetsData.length === 0) {
        const { data: assetsData, error: assetsError } = await supabase
          .from('assets')
          .select('*');
          
        if (assetsError) {
          throw assetsError;
        }
        
        const assetsList: Asset[] = assetsData.map(asset => ({
          id: asset.id,
          name: asset.name,
          symbol: asset.symbol,
          amount: 0,
          value: 0,
          change: Math.random() * 5 - 1,
          icon: getAssetIcon(asset.symbol)
        }));
        
        setUserAssets(assetsList);
      } else {
        const assetsList: Asset[] = userAssetsData.map(item => {
          const asset = item.assets as any;
          let value = 0;
          if (asset.symbol === 'BTC') {
            value = item.amount * 52100;
          } else if (asset.symbol === 'ETH') {
            value = item.amount * 3060;
          }
          
          return {
            id: item.id,
            name: asset.name,
            symbol: asset.symbol,
            amount: item.amount,
            value,
            change: Math.random() * 5 - 1,
            icon: getAssetIcon(asset.symbol)
          };
        });
        
        setUserAssets(assetsList);
      }
    } catch (error: any) {
      console.error('Erro ao carregar ativos:', error.message);
      toast({
        title: "Erro ao carregar ativos",
        description: "Não foi possível carregar seus ativos.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
    
    toast({
      title: "Dados atualizados",
      description: "Seus dados foram atualizados com sucesso."
    });
  };

  const handleDeposit = async (amount: number) => {
    await loadWalletData();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  const transactionItems: TransactionItemProps[] = recentTransactions.map(t => ({
    id: t.id,
    type: t.type === 'deposit' || t.type === 'transfer_in' ? 'in' : 'out',
    amount: t.amount,
    description: t.description || 'Transação',
    date: new Date(t.created_at).toLocaleDateString('pt-BR'),
    status: t.status
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-bank-navy mb-6">Sua Carteira Digital</h1>
          
          <div className="glass-card shadow-glass-xl p-6 md:p-8 mb-8">
            <WalletHeader 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
            />
            
            <WalletActions onDeposit={handleDeposit} />
            
            <AssetsList assets={userAssets} />
          </div>
          
          <TransactionList transactions={transactionItems} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wallet;
