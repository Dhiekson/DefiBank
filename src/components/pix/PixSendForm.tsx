
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PixSendFormProps {
  onSuccess: (amount: number) => void;
}

const PixSendForm: React.FC<PixSendFormProps> = ({ onSuccess }) => {
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para realizar transferências PIX.",
        variant: "destructive"
      });
      return;
    }
    
    if (!pixKey || amount <= 0 || !description) {
      toast({
        title: "Campos incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the RPC function to process the PIX transfer
      const { data, error } = await supabase.rpc(
        'process_pix_transfer',
        {
          p_sender_id: user.id,
          p_pix_key: pixKey,
          p_amount: amount,
          p_description: description
        }
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "PIX enviado com sucesso!",
        description: `R$ ${amount.toFixed(2)} enviados via PIX.`
      });
      
      // Reset form
      setPixKey('');
      setAmount(0);
      setDescription('');
      
      // Notify parent component
      onSuccess(amount);
    } catch (error: any) {
      console.error('Erro ao enviar PIX:', error);
      toast({
        title: "Erro ao enviar PIX",
        description: error.message || "Não foi possível completar a transferência PIX.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="pixKey" className="block text-sm font-medium text-gray-700">
          Chave PIX
        </label>
        <input
          id="pixKey"
          type="text"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          placeholder="Email, CPF, telefone ou chave aleatória"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Valor (R$)
        </label>
        <input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Pagamento, transferência, etc."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-bank-blue hover:bg-bank-blue-light"
        disabled={isLoading}
      >
        {isLoading ? 'Processando...' : 'Enviar PIX'}
      </Button>
    </form>
  );
};

export default PixSendForm;
