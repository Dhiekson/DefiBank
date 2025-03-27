
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink } from 'lucide-react';
import { fetchExchanges } from '@/services/crypto-api';
import { Skeleton } from '@/components/ui/skeleton';

const CryptoExchanges: React.FC = () => {
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadExchanges = async () => {
      try {
        setIsLoading(true);
        const data = await fetchExchanges(10);
        setExchanges(data);
      } catch (error) {
        console.error('Erro ao carregar corretoras:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExchanges();
  }, []);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Corretoras Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Corretoras Populares</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Volume 24h (BTC)</TableHead>
              <TableHead className="text-right">Confiança</TableHead>
              <TableHead className="text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exchanges.map((exchange) => (
              <TableRow key={exchange.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img src={exchange.image} alt={exchange.name} className="h-5 w-5" />
                    <span>{exchange.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {exchange.trade_volume_24h_btc.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center">
                    <div className="bg-gray-200 w-24 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 h-full rounded-full" 
                        style={{ width: `${exchange.trust_score * 10}%` }}
                      />
                    </div>
                    <span className="ml-2 text-xs">{exchange.trust_score}/10</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <a 
                    href={exchange.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    Acessar
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CryptoExchanges;
