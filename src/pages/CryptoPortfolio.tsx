
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin, TrendingUp, TrendingDown, RefreshCcw, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  price: number;
  value: number;
  logoUrl?: string;
  color?: string;
  change24h?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF5733', '#C70039', '#900C3F', '#581845'];

const CryptoPortfolio = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadUserAssets();
    }
  }, [user, isLoading, navigate]);

  const loadUserAssets = async () => {
    setIsLoadingAssets(true);
    try {
      // Get user assets from Supabase
      const { data: userAssetsData, error: userAssetsError } = await supabase
        .from('user_assets')
        .select(`
          id,
          asset_id,
          amount,
          assets (
            id,
            name,
            symbol,
            icon
          )
        `)
        .eq('user_id', user?.id);
      
      if (userAssetsError) throw userAssetsError;
      
      if (!userAssetsData || userAssetsData.length === 0) {
        setAssets([]);
        setIsLoadingAssets(false);
        return;
      }
      
      // Fetch current prices for assets
      const assetIds = userAssetsData.map(item => item.asset_id);
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=${assetIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }
      
      const priceData = await response.json();
      
      // Map user assets with current prices
      const portfolioAssets = userAssetsData.map((userAsset: any) => {
        const asset = userAsset.assets;
        const priceInfo = priceData.find((p: any) => p.id === userAsset.asset_id);
        
        const price = priceInfo ? priceInfo.current_price : 0;
        const amount = userAsset.amount;
        const value = price * amount;
        const change24h = priceInfo ? priceInfo.price_change_percentage_24h?.toString() : '0';
        
        return {
          id: userAsset.asset_id,
          name: asset.name,
          symbol: asset.symbol.toUpperCase(),
          amount,
          price,
          value,
          logoUrl: priceInfo?.image,
          change24h,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        };
      });
      
      // Calculate totals
      const total = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0);
      const weightedChange = portfolioAssets.reduce((sum, asset) => {
        const weight = asset.value / total;
        return sum + (parseFloat(asset.change24h || '0') * weight);
      }, 0);
      
      setAssets(portfolioAssets);
      setTotalValue(total);
      setTotalChange(weightedChange);
      
      // Generate mock historical data
      generateMockHistoricalData();
      
    } catch (error: any) {
      console.error('Error loading portfolio assets:', error);
      toast({
        title: 'Erro ao carregar portfólio',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const generateMockHistoricalData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate a value that follows a slightly upward trend with some randomness
      const baseValue = totalValue * 0.8; // Start at 80% of current value
      const trend = (30 - i) / 30 * 0.2; // Gradual increase of up to 20%
      const randomFactor = (Math.random() - 0.5) * 0.1; // Random fluctuation of ±5%
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: baseValue * (1 + trend + randomFactor)
      });
    }
    
    setHistoricalData(data);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading || isLoadingAssets) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-bank-navy">Meu Portfólio Cripto</h1>
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button variant="outline" size="sm" onClick={loadUserAssets}>
                <RefreshCcw size={14} className="mr-1" />
                Atualizar
              </Button>
              <Button size="sm" onClick={() => navigate('/crypto')}>
                <ArrowUpRight size={14} className="mr-1" />
                Comprar cripto
              </Button>
            </div>
          </div>
          
          {assets.length === 0 ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Seu portfólio está vazio</CardTitle>
                <CardDescription>
                  Você ainda não possui criptomoedas. Comece comprando algumas no mercado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/crypto')}>
                  <Bitcoin size={16} className="mr-2" />
                  Explorar mercado
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Valor total</CardDescription>
                    <CardTitle className="text-2xl">{formatCurrency(totalValue)}</CardTitle>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Variação 24h</CardDescription>
                    <CardTitle className={`text-2xl flex items-center ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalChange >= 0 ? (
                        <TrendingUp size={20} className="mr-1" />
                      ) : (
                        <TrendingDown size={20} className="mr-1" />
                      )}
                      {formatPercentage(totalChange)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Nº de ativos</CardDescription>
                    <CardTitle className="text-2xl">{assets.length}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
              
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="assets">Meus Ativos</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visão Geral do Portfólio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="h-64">
                          <h3 className="text-sm font-medium text-center mb-2">Distribuição de Ativos</h3>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={assets}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="symbol"
                                label={({ symbol }) => symbol}
                              >
                                {assets.map((asset, index) => (
                                  <Cell key={`cell-${index}`} fill={asset.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: any) => formatCurrency(value as number)}
                                labelFormatter={(label) => `${label}`}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="h-64">
                          <h3 className="text-sm font-medium text-center mb-2">Evolução do Portfólio (30 dias)</h3>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={historicalData}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 10 }}
                                tickFormatter={(tick) => tick.slice(5)}
                              />
                              <YAxis 
                                tick={{ fontSize: 10 }} 
                                tickFormatter={(tick) => `R$${(tick/1000).toFixed(1)}k`}
                              />
                              <Tooltip formatter={(value) => formatCurrency(value as number)} />
                              <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#8884d8" 
                                fill="#8884d8" 
                                fillOpacity={0.3} 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="assets">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meus Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left pb-2">Ativo</th>
                              <th className="text-right pb-2">Preço</th>
                              <th className="text-right pb-2">Quantidade</th>
                              <th className="text-right pb-2">Valor</th>
                              <th className="text-right pb-2">24h</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assets.map((asset) => (
                              <tr key={asset.id} className="border-b hover:bg-gray-50">
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    {asset.logoUrl && (
                                      <img src={asset.logoUrl} alt={asset.name} className="w-6 h-6" />
                                    )}
                                    <div>
                                      <div className="font-medium">{asset.name}</div>
                                      <div className="text-xs text-gray-500">{asset.symbol}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-right">{formatCurrency(asset.price)}</td>
                                <td className="text-right">{asset.amount.toFixed(8)}</td>
                                <td className="text-right font-medium">{formatCurrency(asset.value)}</td>
                                <td className={`text-right ${parseFloat(asset.change24h || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <div className="flex items-center justify-end">
                                    {parseFloat(asset.change24h || '0') >= 0 ? (
                                      <TrendingUp size={14} className="mr-1" />
                                    ) : (
                                      <TrendingDown size={14} className="mr-1" />
                                    )}
                                    {formatPercentage(parseFloat(asset.change24h || '0'))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Transações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center py-8">
                        O histórico detalhado de transações será implementado em breve.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CryptoPortfolio;
