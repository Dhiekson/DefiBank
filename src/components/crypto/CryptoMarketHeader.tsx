
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface CryptoMarketHeaderProps {
  onRefresh: () => void;
}

const CryptoMarketHeader: React.FC<CryptoMarketHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-bank-navy">Mercado de Criptomoedas</h1>
      <Button 
        variant="outline" 
        onClick={onRefresh}
        className="flex items-center gap-1"
      >
        <RefreshCcw size={14} />
        <span>Atualizar</span>
      </Button>
    </div>
  );
};

export default CryptoMarketHeader;
