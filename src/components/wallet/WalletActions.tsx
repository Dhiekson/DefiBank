
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DepositForm from '@/components/wallet/DepositForm';

interface WalletActionsProps {
  onDeposit: (amount: number) => void;
}

const WalletActions: React.FC<WalletActionsProps> = ({ onDeposit }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendMoney = () => {
    navigate('/transactions', { state: { action: 'send' } });
  };

  const handleReceiveMoney = () => {
    navigate('/transactions', { state: { action: 'receive' } });
  };

  const handleConvertMoney = () => {
    toast({
      title: "Conversão",
      description: "Funcionalidade de conversão será implementada em breve."
    });
  };

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <Button size="sm" className="bg-bank-blue text-white hover:bg-bank-blue-light rounded-full" onClick={handleSendMoney}>
        <ArrowUpRight size={14} className="mr-1.5" />
        Enviar
      </Button>
      <Button size="sm" className="bg-bank-blue text-white hover:bg-bank-blue-light rounded-full" onClick={handleReceiveMoney}>
        <ArrowDownRight size={14} className="mr-1.5" />
        Receber
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-bank-blue text-white hover:bg-bank-blue-light rounded-full">
            <CreditCard size={14} className="mr-1.5" />
            Depositar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Depositar via cartão</DialogTitle>
          </DialogHeader>
          <DepositForm onSuccess={onDeposit} />
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="outline" className="rounded-full" onClick={handleConvertMoney}>
        <RefreshCcw size={14} className="mr-1.5" />
        Converter
      </Button>
    </div>
  );
};

export default WalletActions;
