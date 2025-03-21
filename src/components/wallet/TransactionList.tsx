
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  type: 'in' | 'out';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const navigate = useNavigate();

  return (
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
        {transactions.map((transaction) => (
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
              {transaction.status === 'failed' && (
                <div className="flex items-center text-red-600 text-sm">
                  <Clock size={12} className="mr-1" />
                  <span>Falhou</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {transactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nenhuma transação recente encontrada.
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
