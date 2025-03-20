
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DepositFormProps {
  onSuccess: (amount: number) => void;
}

const DepositForm: React.FC<DepositFormProps> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      toast({
        title: "Erro no formulário",
        description: "Dados do cartão inválidos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Em um cenário real, você faria uma chamada para seu backend
      // para criar um Payment Intent no Stripe e retornar o client_secret
      
      // Para simular, estamos processando diretamente a transação
      // Em produção, NUNCA processe pagamentos diretamente no frontend
      
      // Chamar a função RPC para processar o depósito
      const { data, error } = await supabase.rpc(
        'process_deposit',
        {
          p_user_id: user.id,
          p_amount: amount,
          p_description: 'Depósito via cartão',
          p_metadata: { payment_method: 'card' }
        }
      );

      if (error) {
        throw error;
      }
      
      setIsLoading(false);
      toast({
        title: "Depósito realizado",
        description: `Depósito de R$ ${amount.toFixed(2)} realizado com sucesso.`
      });
      
      onSuccess(amount);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Erro ao processar depósito:', error);
      toast({
        title: "Erro no depósito",
        description: error.message || "Não foi possível processar seu depósito. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Valor do depósito (R$)
        </label>
        <input
          id="amount"
          type="number"
          min="10"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dados do cartão
        </label>
        <div className="p-3 border border-gray-300 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-bank-blue hover:bg-bank-blue-light"
      >
        {isLoading ? 'Processando...' : 'Depositar'}
      </Button>
    </form>
  );
};

export default DepositForm;
