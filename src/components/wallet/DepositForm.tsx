
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DepositFormProps {
  onSuccess: (amount: number) => void;
}

const DepositForm: React.FC<DepositFormProps> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, you would call your backend API to create a payment intent
      // For demo purposes, we'll just simulate success
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Depósito realizado",
          description: `Depósito de R$ ${amount.toFixed(2)} realizado com sucesso.`
        });
        onSuccess(amount);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erro no depósito",
        description: "Não foi possível processar seu depósito. Tente novamente.",
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
