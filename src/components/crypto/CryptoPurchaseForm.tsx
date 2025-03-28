
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CryptoAsset } from '@/types/crypto';
import { ArrowLeft, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CryptoPurchaseFormProps {
  asset: CryptoAsset;
  walletAddress: string;
  isWalletConnected: boolean;
  onPurchase: (amount: number) => Promise<void>;
}

const CryptoPurchaseForm: React.FC<CryptoPurchaseFormProps> = ({
  asset,
  walletAddress,
  isWalletConnected,
  onPurchase
}) => {
  const [amount, setAmount] = useState<number>(0.01);
  const [fiatAmount, setFiatAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const { toast } = useToast();
  
  useEffect(() => {
    if (asset) {
      setFiatAmount(amount * asset.price);
    }
  }, [amount, asset]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
      setFiatAmount(value * asset.price);
    }
  };
  
  const handleFiatAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setFiatAmount(value);
      setAmount(value / asset.price);
    }
  };
  
  const handleSliderChange = (value: number[]) => {
    if (activeTab === "buy") {
      // For buy, slider goes from 0.0001 to 10 BTC (or equivalent)
      const cryptoAmount = parseFloat((value[0] / 100 * 10).toFixed(8));
      setAmount(cryptoAmount);
      setFiatAmount(cryptoAmount * asset.price);
    } else {
      // For sell, you can only sell what you have - mocked to 1 BTC max for demo
      const cryptoAmount = parseFloat((value[0] / 100 * 1).toFixed(8));
      setAmount(cryptoAmount);
      setFiatAmount(cryptoAmount * asset.price);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWalletConnected) {
      toast({
        title: "Carteira não conectada",
        description: "Por favor, conecte sua carteira antes de continuar.",
        variant: "destructive"
      });
      return;
    }
    
    if (amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor maior que zero.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (activeTab === "buy") {
        await onPurchase(amount);
        toast({
          title: "Compra realizada!",
          description: `Você comprou ${amount} ${asset.symbol} por ${formatCurrency(fiatAmount)}.`
        });
      } else {
        // Mock sell functionality for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: "Venda realizada!",
          description: `Você vendeu ${amount} ${asset.symbol} por ${formatCurrency(fiatAmount)}.`
        });
      }
    } catch (error) {
      console.error('Erro ao processar operação:', error);
      toast({
        title: "Erro na operação",
        description: "Não foi possível processar sua operação no momento.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            {asset.logoUrl && <img src={asset.logoUrl} alt={asset.name} className="w-8 h-8" />}
            <CardTitle>{asset.name} ({asset.symbol})</CardTitle>
          </div>
          <CardDescription>
            Preço atual: <span className="font-semibold">{formatCurrency(asset.price)}</span>
            <span className={`ml-2 text-sm ${parseFloat(asset.change24h) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(asset.change24h) >= 0 ? (
                <><ArrowUpRight size={14} className="inline mr-1" /></>
              ) : (
                <><ArrowDownRight size={14} className="inline mr-1" /></>
              )}
              {Math.abs(parseFloat(asset.change24h))}%
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "buy" | "sell")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Comprar</TabsTrigger>
              <TabsTrigger value="sell">Vender</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quero gastar (BRL)</label>
                <Input
                  type="number"
                  value={fiatAmount.toFixed(2)}
                  onChange={handleFiatAmountChange}
                  step="1"
                  min="1"
                  className="text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Vou receber ({asset.symbol})</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  step="0.0001"
                  min="0.0001"
                  className="text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Ajuste a quantidade</label>
                <Slider
                  defaultValue={[1]}
                  max={100}
                  step={1}
                  value={[(amount / 10) * 100]}
                  onValueChange={handleSliderChange}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.0001 {asset.symbol}</span>
                  <span>10 {asset.symbol}</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sell" className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quero vender ({asset.symbol})</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  step="0.0001"
                  min="0.0001"
                  className="text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Vou receber (BRL)</label>
                <Input
                  type="number"
                  value={fiatAmount.toFixed(2)}
                  onChange={handleFiatAmountChange}
                  step="1"
                  min="1"
                  className="text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Ajuste a quantidade</label>
                <Slider
                  defaultValue={[1]}
                  max={100}
                  step={1}
                  value={[amount * 100]}
                  onValueChange={handleSliderChange}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.0001 {asset.symbol}</span>
                  <span>1 {asset.symbol}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                {activeTab === "buy" ? "Subtotal:" : "Você receberá:"}
              </span>
              <span>{formatCurrency(fiatAmount)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Taxa de rede (estimativa):</span>
              <span>{formatCurrency(fiatAmount * 0.005)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>{activeTab === "buy" ? "Total a pagar:" : "Total a receber:"}</span>
              <span>
                {activeTab === "buy" 
                  ? formatCurrency(fiatAmount * 1.005) 
                  : formatCurrency(fiatAmount * 0.995)}
              </span>
            </div>
          </div>
          
          {isWalletConnected && (
            <div className="text-sm flex items-start gap-2">
              <Info size={16} className="text-gray-500 mt-0.5" />
              <p className="text-gray-600">
                {activeTab === "buy" 
                  ? `Ao confirmar essa compra, você autoriza a transferência de ${formatCurrency(fiatAmount * 1.005)} para receber ${amount} ${asset.symbol} em sua carteira no endereço ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}.`
                  : `Ao confirmar essa venda, você autoriza a transferência de ${amount} ${asset.symbol} da sua carteira ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)} em troca de ${formatCurrency(fiatAmount * 0.995)}.`
                }
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" className="sm:flex-1" onClick={() => history.back()}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
          <Button 
            type="submit" 
            className={`sm:flex-1 ${activeTab === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`} 
            disabled={isSubmitting || !isWalletConnected || amount <= 0}
          >
            {isSubmitting 
              ? "Processando..." 
              : activeTab === "buy" 
                ? `Comprar ${asset.symbol}` 
                : `Vender ${asset.symbol}`
            }
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CryptoPurchaseForm;
