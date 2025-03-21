
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { getTransactionTypeLabel } from '@/utils/transactionFormatters';
import { AdminTransaction } from '@/types/admin';

interface TransactionsTabProps {
  transactions: AdminTransaction[];
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions }) => {
  const [transactionSearch, setTransactionSearch] = useState("");

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.description?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    transaction.id.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    transaction.user_id.toLowerCase().includes(transactionSearch.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar transações..."
          value={transactionSearch}
          onChange={(e) => setTransactionSearch(e.target.value)}
          className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue mb-4"
        />
        <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">
                    {transaction.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {transaction.user_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {getTransactionTypeLabel(transaction.type)}
                  </TableCell>
                  <TableCell 
                    className={
                      transaction.type.includes('in') || transaction.type === 'deposit'
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }
                  >
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {transaction.status === 'completed' ? (
                        <CheckCircle size={14} className="text-green-500 mr-1" />
                      ) : transaction.status === 'pending' ? (
                        <AlertTriangle size={14} className="text-amber-500 mr-1" />
                      ) : (
                        <AlertTriangle size={14} className="text-red-500 mr-1" />
                      )}
                      <span className={
                        transaction.status === 'completed' 
                          ? 'text-green-600' 
                          : transaction.status === 'pending'
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }>
                        {transaction.status === 'completed' 
                          ? 'Concluída' 
                          : transaction.status === 'pending'
                            ? 'Pendente'
                            : 'Falhou'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.description || 'N/A'}</TableCell>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionsTab;
