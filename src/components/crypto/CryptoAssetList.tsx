import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Search, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { CryptoAsset } from '@/types/crypto';

interface CryptoAssetListProps {
  assets: CryptoAsset[];
  onAssetSelect: (asset: CryptoAsset) => void;
  onSearch?: (term: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const CryptoAssetList: React.FC<CryptoAssetListProps> = ({ 
  assets, 
  onAssetSelect, 
  onSearch,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssets, setFilteredAssets] = useState<CryptoAsset[]>(assets);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastAssetElementRef = useCallback((node) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        onLoadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, onLoadMore]);

  useEffect(() => {
    if (onSearch) {
      setFilteredAssets(assets);
    } else {
      setFilteredAssets(
        assets.filter(asset => 
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [assets, searchTerm, onSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (onSearch) {
      onSearch(term);
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  const formatLargeNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    } else {
      return value.toString();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar criptomoeda..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {onRefresh && (
          <Button type="button" variant="outline" onClick={onRefresh}>
            <RefreshCw size={16} className="mr-2" />
            Atualizar
          </Button>
        )}
      </form>
      
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">24h</TableHead>
                <TableHead className="text-right">Volume 24h</TableHead>
                <TableHead className="text-right">Cap. de Mercado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset, index) => {
                const isLastItem = index === filteredAssets.length - 1;
                return (
                  <TableRow 
                    key={asset.id} 
                    ref={isLastItem && hasMore ? lastAssetElementRef : null}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {asset.logoUrl && (
                          <img src={asset.logoUrl} alt={asset.name} className="h-6 w-6" />
                        )}
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-xs text-gray-500">{asset.symbol}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(asset.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end ${parseFloat(asset.change24h) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(asset.change24h) >= 0 ? (
                          <ArrowUpRight size={14} className="mr-1" />
                        ) : (
                          <ArrowDownRight size={14} className="mr-1" />
                        )}
                        <span>{Math.abs(parseFloat(asset.change24h))}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {formatCurrency(asset.volume24h)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {formatLargeNumber(asset.marketCap)}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => onAssetSelect(asset)} size="sm">
                        Comprar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {filteredAssets.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum ativo encontrado com "{searchTerm}".
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {hasMore && onLoadMore && (
        <div className="flex justify-center py-4">
          <Button onClick={onLoadMore} variant="outline" disabled={isLoading}>
            {isLoading ? "Carregando..." : "Carregar mais"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CryptoAssetList;
