
import React from 'react';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PixReceiveFormProps {
  onOpenQRCode: () => void;
  amount: number;
  setAmount: (amount: number) => void;
  description: string;
  setDescription: (description: string) => void;
}

const PixReceiveForm: React.FC<PixReceiveFormProps> = ({
  onOpenQRCode,
  amount,
  setAmount,
  description,
  setDescription
}) => {
  const { toast } = useToast();

  const handleGenerateQRCode = () => {
    if (amount <= 0 || !description) {
      toast({
        title: "Campos incompletos",
        description: "Informe um valor e descrição para gerar o QR Code.",
        variant: "destructive"
      });
      return;
    }
    
    onOpenQRCode();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="receiveAmount" className="block text-sm font-medium text-gray-700">
          Valor (R$)
        </label>
        <input
          id="receiveAmount"
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
        <label htmlFor="receiveDescription" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <input
          id="receiveDescription"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Pagamento, transferência, etc."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
          required
        />
      </div>
      
      <Button 
        onClick={handleGenerateQRCode}
        className="w-full bg-bank-blue hover:bg-bank-blue-light flex items-center justify-center gap-2"
      >
        <QrCode size={16} />
        <span>Gerar QR Code</span>
      </Button>
    </div>
  );
};

export default PixReceiveForm;
