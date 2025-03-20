
import React from 'react';
import { Bitcoin, Coins, ArrowUpRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  change: number;
  icon: React.ReactNode;
}

interface AssetsListProps {
  assets: Asset[];
}

const AssetsList: React.FC<AssetsListProps> = ({ assets }) => {
  const { toast } = useToast();

  const handleViewAllAssets = () => {
    toast({
      title: "Visualizar ativos",
      description: "Listagem completa de ativos será implementada em breve."
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-bank-navy">Seus Ativos</h4>
      
      {assets.map((asset) => (
        <div key={asset.id} className="glass p-4 rounded-xl flex items-center">
          <div className="mr-3 p-2 rounded-full bg-amber-100">
            {asset.icon}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <p className="font-medium">{asset.name}</p>
              <p className="font-medium">R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="flex justify-between text-sm text-bank-gray mt-1">
              <p>{asset.amount} {asset.symbol}</p>
              <div className="flex items-center text-green-600">
                <ArrowUpRight size={12} className="mr-1" />
                <span>{asset.change}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <Button 
        variant="ghost" 
        className="w-full justify-between text-bank-blue"
        onClick={handleViewAllAssets}
      >
        <span>Ver todos os ativos</span>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

export default AssetsList;
