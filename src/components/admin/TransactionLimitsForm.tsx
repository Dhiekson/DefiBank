
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getTransactionTypeLabel } from '@/utils/transactionFormatters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TransactionType } from '@/types/admin';

interface TransactionLimitsFormProps {
  transactionLimits: TransactionType[];
  loadTransactionLimits: () => Promise<void>;
}

const TransactionLimitsForm: React.FC<TransactionLimitsFormProps> = ({ 
  transactionLimits, 
  loadTransactionLimits 
}) => {
  const { toast } = useToast();
  const [editingLimit, setEditingLimit] = useState<TransactionType | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [transactionLimit, setTransactionLimit] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const handleEditLimit = (limit: TransactionType) => {
    setEditingLimit(limit);
    setDailyLimit(limit.daily_limit);
    setTransactionLimit(limit.transaction_limit);
    setFeePercentage(limit.fee_percentage);
    setShowLimitDialog(true);
  };

  const handleSaveLimit = async () => {
    if (!editingLimit) return;
    
    try {
      const { error } = await supabase
        .from('transaction_limits')
        .update({
          daily_limit: dailyLimit,
          transaction_limit: transactionLimit,
          fee_percentage: feePercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingLimit.id);
        
      if (error) throw error;
      
      toast({
        title: "Limite atualizado",
        description: "O limite de transação foi atualizado com sucesso."
      });
      
      setShowLimitDialog(false);
      
      await loadTransactionLimits();
    } catch (error) {
      console.error('Error updating limit:', error);
      toast({
        title: "Erro ao atualizar limite",
        description: "Não foi possível atualizar o limite de transação.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de Transação</TableHead>
              <TableHead>Limite Diário</TableHead>
              <TableHead>Limite por Transação</TableHead>
              <TableHead>Taxa (%)</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionLimits.map((limit) => (
              <TableRow key={limit.id}>
                <TableCell>{getTransactionTypeLabel(limit.transaction_type)}</TableCell>
                <TableCell>{formatCurrency(limit.daily_limit)}</TableCell>
                <TableCell>{formatCurrency(limit.transaction_limit)}</TableCell>
                <TableCell>{limit.fee_percentage.toFixed(2)}%</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditLimit(limit)}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Limite de Transação</DialogTitle>
          </DialogHeader>
          
          {editingLimit && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Transação
                </label>
                <input
                  type="text"
                  value={getTransactionTypeLabel(editingLimit.transaction_type)}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700">
                  Limite Diário (R$)
                </label>
                <input
                  id="dailyLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="transactionLimit" className="block text-sm font-medium text-gray-700">
                  Limite por Transação (R$)
                </label>
                <input
                  id="transactionLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={transactionLimit}
                  onChange={(e) => setTransactionLimit(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="feePercentage" className="block text-sm font-medium text-gray-700">
                  Taxa (%)
                </label>
                <input
                  id="feePercentage"
                  type="number"
                  min="0"
                  step="0.01"
                  max="100"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
                />
              </div>
              
              <Button
                onClick={handleSaveLimit}
                className="w-full bg-bank-blue hover:bg-bank-blue-light"
              >
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionLimitsForm;
