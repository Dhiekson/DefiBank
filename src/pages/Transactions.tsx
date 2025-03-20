
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowDownRight, ArrowUpRight, Clock, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const TransactionItem: React.FC<{
  type: 'in' | 'out';
  amount: string;
  description: string;
  date: string;
  status?: 'completed' | 'pending';
}> = ({ type, amount, description, date, status = 'completed' }) => {
  return (
    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${type === 'in' ? 'bg-green-100' : 'bg-red-100'}`}>
          {type === 'in' ? (
            <ArrowDownRight size={20} className="text-green-600" />
          ) : (
            <ArrowUpRight size={20} className="text-red-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-bank-navy">{description}</p>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
          {type === 'in' ? '+' : '-'}{amount}
        </p>
        {status === 'pending' && (
          <div className="flex items-center text-amber-600 text-sm">
            <Clock size={12} className="mr-1" />
            <span>Pendente</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Transactions: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
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
          <h1 className="text-2xl md:text-3xl font-bold text-bank-navy mb-6">Transações</h1>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Buscar transações" 
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter size={14} />
                  <span>Filtrar</span>
                </Button>
                <Button size="sm">Exportar</Button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              <TransactionItem 
                type="in" 
                amount="R$ 1.250,00" 
                description="Depósito recebido" 
                date="Hoje, 14:30"
              />
              <TransactionItem 
                type="out" 
                amount="R$ 450,00" 
                description="Transferência para João Silva" 
                date="Ontem, 09:15"
              />
              <TransactionItem 
                type="out" 
                amount="R$ 120,00" 
                description="Compra de Bitcoin" 
                date="22/03/2025"
              />
              <TransactionItem 
                type="in" 
                amount="R$ 890,00" 
                description="Venda de Ethereum" 
                date="20/03/2025"
              />
              <TransactionItem 
                type="in" 
                amount="R$ 350,00" 
                description="Recompensa de staking" 
                date="18/03/2025"
                status="pending"
              />
              <TransactionItem 
                type="out" 
                amount="R$ 75,00" 
                description="Taxa de conversão" 
                date="15/03/2025"
              />
            </div>
            
            <div className="p-4 text-center text-sm text-gray-500">
              Mostrando 6 de 24 transações
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Transactions;
