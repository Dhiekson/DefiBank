
import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface CryptoChartProps {
  data: any;
  isLoading: boolean;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ data, isLoading }) => {
  const [timeRange, setTimeRange] = React.useState('7d');
  
  if (isLoading) {
    return (
      <Card className="w-full p-6 flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }
  
  if (!data || !data.prices || data.prices.length === 0) {
    return (
      <Card className="w-full p-6 flex items-center justify-center h-80">
        <p className="text-muted-foreground">Sem dados disponíveis</p>
      </Card>
    );
  }
  
  // Processar dados para o gráfico
  const chartData = data.prices.map((item: number[]) => ({
    date: new Date(item[0]),
    price: item[1],
  }));
  
  // Formatar data para o tooltip
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'dd MMM yyyy, HH:mm', { locale: ptBR });
  };
  
  // Formatar preço para o tooltip
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };
  
  // Calcular intervalo entre pontos no eixo X
  const xAxisInterval = Math.floor(chartData.length / 6);
  
  return (
    <Card className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Histórico de Preço</h3>
        <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="1d">1D</TabsTrigger>
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="30d">30D</TabsTrigger>
            <TabsTrigger value="1y">1A</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              interval={xAxisInterval}
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                return format(date, 'dd/MM', { locale: ptBR });
              }}
              minTickGap={30}
            />
            <YAxis 
              tickFormatter={(value) => `R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              formatter={(value: number) => [formatPrice(value), 'Preço']}
              labelFormatter={(label: any) => formatDate(label)}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CryptoChart;
