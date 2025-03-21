
import React from 'react';
import TransactionItem from './TransactionItem';
import { Transaction } from '@/types/transaction';
import { formatTransactionType, formatTransactionDate } from '@/utils/transactionFormatters';

interface TransactionsListProps {
  transactions: Transaction[];
  filteredCount: number;
  totalCount: number;
  searchTerm: string;
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  filteredCount,
  totalCount,
  searchTerm
}) => {
  return (
    <>
      <div className="divide-y divide-gray-100">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem 
              key={transaction.id}
              type={formatTransactionType(transaction.type)} 
              amount={transaction.amount} 
              description={transaction.description || "Transação"} 
              date={formatTransactionDate(transaction.created_at)}
              status={transaction.status}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? "Nenhuma transação encontrada para esta busca." : "Nenhuma transação encontrada."}
          </div>
        )}
      </div>
      
      <div className="p-4 text-center text-sm text-gray-500">
        Mostrando {filteredCount} de {totalCount} transações
      </div>
    </>
  );
};

export default TransactionsList;
