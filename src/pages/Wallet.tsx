import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, ChevronRight, Bitcoin, Coins, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  const handleSendMoney = () => {
    navigate('/transactions', { state: { action: 'send' } });
  };

  const handleReceiveMoney = () => {
    navigate('/transactions', { state: { action: 'receive' } });
  };

  const handleConvertMoney = () => {
    toast({
      title: "Conversão",
      description: "Funcionalidade de conversão será implementada em breve."
    });
  };

  const handleViewAllAssets = () => {
    toast({
      title: "Visualizar ativos",
      description: "Listagem completa de ativos será implementada em breve."
    });
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-bank-navy">Carteira Digital</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-10 w-10" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCcw size={18} className={`text-bank-gray ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-bank-gray mb-1">Saldo Total</p>
              <h2 className="text-3xl font-bold text-bank-navy">R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              <div className="flex items-center text-green-600 text-sm mt-1">
                <ArrowUpRight size={14} className="mr-1" />
                <span>+2.4% nas últimas 24h</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <Button size="sm" className="bg-bank-blue text-white hover:bg-bank-blue-light rounded-full" onClick={handleSendMoney}>
                <ArrowUpRight size={14} className="mr-1.5" />
                Enviar
              </Button>
              <Button size="sm" className="bg-bank-blue text-white hover:bg-bank-blue-light rounded-full" onClick={handleReceiveMoney}>
                <ArrowDownRight size={14} className="mr-1.5" />
                Receber
              </Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={handleConvertMoney}>
                <RefreshCcw size={14} className="mr-1.5" />
                Converter
              </Button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-bank-navy">Seus Ativos</h4>
              
              {assets.map((asset) => (
                <div key={asset.id} className="glass p-4 rounded-xl flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-amber-100">
                    {asset.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{asset.name}</p>
                      <p className="font-medium">R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex justify-between text-sm text-bank-gray mt-1">
                      <p>{asset.amount} {asset.symbol}</p>
                      <div className="flex items-center text-green-600">
                        <ArrowUpRight size={12} className="mr-1" />
                        <span>{asset.change}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full justify-between text-bank-blue"
                onClick={handleViewAllAssets}
              >
                <span>Ver todos os ativos</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-bank-navy">Transações Recentes</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-bank-blue"
                onClick={() => navigate('/transactions')}
              >
                Ver todas
                <ChevronRight size={16} />
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${transaction.type === 'in' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'in' ? (
                        <ArrowDownRight size={20} className="text-green-600" />
                      ) : (
                        <ArrowUpRight size={20} className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-bank-navy">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'in' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {transaction.status === 'pending' && (
                      <div className="flex items-center text-amber-600 text-sm">
                        <Clock size={12} className="mr-1" />
                        <span>Pendente</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {recentTransactions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma transação recente encontrada.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wallet;
