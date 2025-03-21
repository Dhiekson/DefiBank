
import React from 'react';
import { ArrowDownRight, ArrowUpRight, Clock } from 'lucide-react';

interface TransactionItemProps {
  type: 'in' | 'out';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  type, 
  amount, 
  description, 
  date, 
  status 
}) => {
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
          {type === 'in' ? '+' : '-'}R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {status === 'pending' && (
          <div className="flex items-center text-amber-600 text-sm">
            <Clock size={12} className="mr-1" />
            <span>Pendente</span>
          </div>
        )}
        {status === 'failed' && (
          <div className="flex items-center text-red-600 text-sm">
            <Clock size={12} className="mr-1" />
            <span>Falhou</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
