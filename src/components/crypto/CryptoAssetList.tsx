
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CryptoAsset } from '@/types/crypto';

interface CryptoAssetListProps {
  assets: CryptoAsset[];
  onAssetSelect: (asset: CryptoAsset) => void;
}

const CryptoAssetList: React.FC<CryptoAssetListProps> = ({ assets, onAssetSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar criptomoeda..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
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
              {filteredAssets.map(asset => (
                <TableRow key={asset.id}>
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
              ))}
              
              {filteredAssets.length === 0 && (
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
    </div>
  );
};

export default CryptoAssetList;
