
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, CreditCard, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DepositForm from '@/components/wallet/DepositForm';
import { useAuth } from '@/contexts/AuthContext';

interface WalletActionsProps {
  onDeposit: (amount: number) => void;
  showQRCode?: boolean;
  qrCodeUrl?: string;
  qrAmount?: number;
  qrDescription?: string;
}

const WalletActions: React.FC<WalletActionsProps> = ({ 
  onDeposit, 
  showQRCode = false,
  qrCodeUrl,
  qrAmount,
  qrDescription 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSendMoney = () => {
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para enviar dinheiro.",
        variant: "destructive"
      });
      return;
    }
    navigate('/transactions', { state: { action: 'send' } });
  };

  const handleReceiveMoney = () => {
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para receber dinheiro.",
        variant: "destructive"
      });
      return;
    }
    navigate('/transactions', { state: { action: 'receive' } });
  };

  const handleConvertMoney = () => {
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para converter moedas.",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/wallet/convert');
  };
  
  const handleCryptoMarket = () => {
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para acessar o mercado de criptomoedas.",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/crypto');
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
      <Button size="sm" className="bg-amber-500 text-white hover:bg-amber-600 rounded-full" onClick={handleCryptoMarket}>
        <Coins size={14} className="mr-1.5" />
        Comprar Crypto
      </Button>
    </div>
  );
};

export default WalletActions;
