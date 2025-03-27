
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Link, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CryptoAsset } from '@/types/crypto';
import CryptoChart from './CryptoChart';

interface CryptoDetailProps {
  asset: CryptoAsset;
  assetDetail: any;
  chartData: any;
  isLoading: boolean;
  onBuy: () => void;
}

const CryptoDetail: React.FC<CryptoDetailProps> = ({ 
  asset, 
  assetDetail, 
  chartData, 
  isLoading,
  onBuy 
}) => {
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
  
  const isPriceUp = () => {
    return parseFloat(asset.change24h) >= 0;
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img src={asset.logoUrl} alt={asset.name} className="h-10 w-10" />
              <div>
                <CardTitle className="text-xl">{asset.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs font-mono">
                    {asset.symbol}
                  </Badge>
                  {assetDetail?.links?.homepage?.[0] && (
                    <a 
                      href={assetDetail.links.homepage[0]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Link size={12} />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={onBuy}>Comprar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-2">
            <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
              <span className="text-3xl font-bold">{formatCurrency(asset.price)}</span>
              <div className={`flex items-center text-sm ${isPriceUp() ? 'text-green-600' : 'text-red-600'}`}>
                {isPriceUp() ? (
                  <ArrowUpRight size={16} className="mr-1" />
                ) : (
                  <ArrowDownRight size={16} className="mr-1" />
                )}
                <span>{Math.abs(parseFloat(asset.change24h))}% (24h)</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Capitalização</p>
              <p className="text-lg font-medium mt-1">{formatCurrency(asset.marketCap)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Volume (24h)</p>
              <p className="text-lg font-medium mt-1">{formatCurrency(asset.volume24h)}</p>
            </div>
            {assetDetail?.market_data?.circulating_supply && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Fornecimento</p>
                <p className="text-lg font-medium mt-1">
                  {formatLargeNumber(assetDetail.market_data.circulating_supply)} {asset.symbol}
                </p>
              </div>
            )}
          </div>
          
          <Separator className="my-6" />
          
          <CryptoChart data={chartData} isLoading={false} />
          
          {assetDetail?.description?.pt && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Sobre {asset.name}</h3>
                <div 
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: assetDetail.description.pt.substring(0, 300) + '...' 
                  }}
                />
                <Button variant="link" className="p-0 h-auto text-sm mt-2">
                  Ler mais <ExternalLink size={14} className="ml-1" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoDetail;
