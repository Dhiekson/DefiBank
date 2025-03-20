
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bitcoin, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import the new components
import WalletHeader from '@/components/wallet/WalletHeader';
import WalletActions from '@/components/wallet/WalletActions';
import AssetsList from '@/components/wallet/AssetsList';
import TransactionList from '@/components/wallet/TransactionList';

interface Transaction {
  id: string;
  type: 'in' | 'out';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
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

const Wallet: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [totalBalance, setTotalBalance] = useState(38659.42);
  const [refreshing, setRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const assets: Asset[] = [
    {
      id: '1',
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: 0.431,
      value: 22458.13,
      change: 3.2,
      icon: <Bitcoin size={24} className="text-amber-600" />
    },
    {
      id: '2',
      name: 'Ethereum',
      symbol: 'ETH',
      amount: 3.21,
      value: 9845.29,
      change: 1.8,
      icon: <Coins size={24} className="text-blue-600" />
    }
  ];

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadRecentTransactions();
    }
  }, [user, isLoading, navigate]);

  const loadRecentTransactions = async () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'in',
        amount: 1250.00,
        description: 'Depósito recebido',
        date: 'Hoje, 14:30',
        status: 'completed'
      },
      {
        id: '2',
        type: 'out',
        amount: 450.00,
        description: 'Transferência para João Silva',
        date: 'Ontem, 09:15',
        status: 'completed'
      },
      {
        id: '3',
        type: 'in',
        amount: 350.00,
        description: 'Recompensa de staking',
        date: '18/03/2025',
        status: 'pending'
      }
    ];
    
    setRecentTransactions(mockTransactions);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    
    setTimeout(() => {
      const newBalance = totalBalance + (Math.random() * 100 - 50);
      setTotalBalance(Number(newBalance.toFixed(2)));
      setRefreshing(false);
      
      toast({
        title: "Saldo atualizado",
        description: "Seus dados foram atualizados com sucesso."
      });
    }, 1000);
  };

  const handleDeposit = (amount: number) => {
    const newBalance = totalBalance + amount;
    setTotalBalance(Number(newBalance.toFixed(2)));
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'in',
      amount: amount,
      description: 'Depósito via cartão',
      date: 'Hoje',
      status: 'completed'
    };
    
    setRecentTransactions([newTransaction, ...recentTransactions]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-bank-navy mb-6">Sua Carteira Digital</h1>
          
          <div className="glass-card shadow-glass-xl p-6 md:p-8 mb-8">
            <WalletHeader 
              totalBalance={totalBalance} 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
            />
            
            <WalletActions onDeposit={handleDeposit} />
            
            <AssetsList assets={assets} />
          </div>
          
          <TransactionList transactions={recentTransactions} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wallet;
