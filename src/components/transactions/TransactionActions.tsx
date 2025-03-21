
import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionActionsProps {
  onSend: () => void;
  onReceive: () => void;
}

const TransactionActions: React.FC<TransactionActionsProps> = ({ onSend, onReceive }) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReceive}
        className="flex items-center gap-1"
      >
        <ArrowDownRight size={14} />
        <span>Receber</span>
      </Button>
      <Button 
        size="sm" 
        onClick={onSend}
        className="flex items-center gap-1"
      >
        <ArrowUpRight size={14} />
        <span>Enviar</span>
      </Button>
    </div>
  );
};

export default TransactionActions;
