
import React from 'react';
import { Filter, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TransactionSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
}

const TransactionSearch: React.FC<TransactionSearchProps> = ({
  searchTerm,
  setSearchTerm,
  onRefresh
}) => {
  return (
    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 justify-between">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input 
          placeholder="Buscar transações" 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Filter size={14} />
          <span>Filtrar</span>
        </Button>
        <Button 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onRefresh}
        >
          <Download size={14} />
          <span>Atualizar</span>
        </Button>
      </div>
    </div>
  );
};

export default TransactionSearch;
