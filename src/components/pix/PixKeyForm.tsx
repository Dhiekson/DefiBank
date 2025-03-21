
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PixKeyFormProps {
  onSubmit: (keyType: 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM', keyValue: string) => Promise<void>;
}

const PixKeyForm: React.FC<PixKeyFormProps> = ({ onSubmit }) => {
  const [keyType, setKeyType] = useState<'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM'>('EMAIL');
  const [keyValue, setKeyValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateRandomKey = () => {
    // Generate a random UUID-like string
    const randomKey = crypto.randomUUID();
    setKeyValue(randomKey);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyValue.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Informe o valor da chave PIX.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate based on key type
    if (keyType === 'CPF' && !/^\d{11}$/.test(keyValue)) {
      toast({
        title: "CPF inválido",
        description: "Informe um CPF válido (apenas números, 11 dígitos).",
        variant: "destructive"
      });
      return;
    }
    
    if (keyType === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(keyValue)) {
      toast({
        title: "E-mail inválido",
        description: "Informe um endereço de e-mail válido.",
        variant: "destructive"
      });
      return;
    }
    
    if (keyType === 'PHONE' && !/^\d{10,11}$/.test(keyValue)) {
      toast({
        title: "Telefone inválido",
        description: "Informe um número de telefone válido (apenas números, 10 ou 11 dígitos).",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await onSubmit(keyType, keyValue);
      // Reset form after successful submission
      setKeyType('EMAIL');
      setKeyValue('');
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="keyType" className="block text-sm font-medium text-gray-700">
          Tipo de Chave
        </label>
        <select
          id="keyType"
          value={keyType}
          onChange={(e) => setKeyType(e.target.value as 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM')}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
        >
          <option value="EMAIL">E-mail</option>
          <option value="CPF">CPF</option>
          <option value="PHONE">Telefone</option>
          <option value="RANDOM">Chave Aleatória</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="keyValue" className="block text-sm font-medium text-gray-700">
          Valor da Chave
        </label>
        <div className="flex gap-2">
          <input
            id="keyValue"
            type={keyType === 'CPF' || keyType === 'PHONE' ? 'number' : 'text'}
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            placeholder={keyType === 'CPF' 
              ? '12345678900' 
              : keyType === 'EMAIL' 
                ? 'seu@email.com' 
                : keyType === 'PHONE' 
                  ? '11987654321' 
                  : 'Clique em Gerar'
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
            disabled={keyType === 'RANDOM' || isLoading}
          />
          {keyType === 'RANDOM' && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={generateRandomKey}
              disabled={isLoading}
            >
              Gerar
            </Button>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-bank-blue hover:bg-bank-blue-light"
        disabled={isLoading}
      >
        {isLoading ? 'Processando...' : 'Criar Chave PIX'}
      </Button>
    </form>
  );
};

export default PixKeyForm;
