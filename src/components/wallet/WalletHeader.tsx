
import React from 'react';
import { ArrowUpRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface WalletHeaderProps {
  totalBalance: number;
  refreshing: boolean;
  onRefresh: () => void;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ 
  totalBalance, 
  refreshing, 
  onRefresh 
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-bank-navy">Carteira Digital</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10" 
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCcw size={18} className={`text-bank-gray ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-bank-gray mb-1">Saldo Total</p>
        <h2 className="text-3xl font-bold text-bank-navy">R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        <div className="flex items-center text-green-600 text-sm mt-1">
          <ArrowUpRight size={14} className="mr-1" />
          <span>+2.4% nas últimas 24h</span>
        </div>
      </div>
    </div>
  );
};

export default WalletHeader;
