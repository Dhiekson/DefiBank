
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bitcoin, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import WalletHeader from '@/components/wallet/WalletHeader';
import WalletActions from '@/components/wallet/WalletActions';
import AssetsList from '@/components/wallet/AssetsList';
import TransactionList from '@/components/wallet/TransactionList';
import QRCodeDisplay from '@/components/wallet/QRCodeDisplay';

import { Transaction, SupabaseTransaction, mapSupabaseTransaction } from '@/types/transaction';
import { formatTransactionType, formatTransactionDate } from '@/utils/transactionFormatters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  change: number;
  icon: React.ReactNode;
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
  const location = useLocation();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Estado para exibir o QR Code (se fornecido pelo redirecionamento)
  const qrCodeUrl = location.state?.qrCodeUrl;
  const qrAmount = location.state?.amount ? parseFloat(location.state.amount) : 0;
  const qrDescription = location.state?.description || '';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadWalletData();
      
      // Se temos um QR Code nos parâmetros de estado, mostrar o diálogo
      if (qrCodeUrl) {
        setShowQRCode(true);
      }
    }
  }, [user, authLoading, navigate, qrCodeUrl]);

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
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        throw error;
      }
      
      const formattedTransactions: Transaction[] = (data || []).map(
        (item: SupabaseTransaction) => mapSupabaseTransaction(item)
      );
      
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

  // Map transaction data for the TransactionList component
  const transactionItems = recentTransactions.map(t => ({
    id: t.id,
    type: formatTransactionType(t.type),
    amount: t.amount,
    description: t.description || 'Transação',
    date: formatTransactionDate(t.created_at),
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
      
      {/* Modal de QR Code para pagamento */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code para Pagamento</DialogTitle>
          </DialogHeader>
          <QRCodeDisplay 
            amount={qrAmount} 
            description={qrDescription} 
            qrCodeUrl={qrCodeUrl} 
          />
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Wallet;
