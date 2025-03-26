
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { CryptoAsset } from '@/types/crypto';
import { ArrowLeft, Info } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const totalPrice = amount * asset.price;
  
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
    }
  };
  
  const handleSliderChange = (value: number[]) => {
    setAmount(parseFloat((value[0] / 100).toFixed(4)));
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
      await onPurchase(amount);
    } catch (error) {
      console.error('Erro ao processar compra:', error);
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
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade ({asset.symbol})</label>
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
              value={[amount * 100]}
              onValueChange={handleSliderChange}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.01 {asset.symbol}</span>
              <span>1 {asset.symbol}</span>
            </div>
          </div>
          
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Taxa de rede (estimativa):</span>
              <span>{formatCurrency(totalPrice * 0.01)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(totalPrice * 1.01)}</span>
            </div>
          </div>
          
          {isWalletConnected && (
            <div className="text-sm flex items-start gap-2">
              <Info size={16} className="text-gray-500 mt-0.5" />
              <p className="text-gray-600">
                Ao confirmar essa compra, você autoriza a transferência do valor para sua carteira {asset.symbol} no endereço {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" className="sm:flex-1" onClick={() => history.back()}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
          <Button type="submit" className="sm:flex-1" disabled={isSubmitting || !isWalletConnected || amount <= 0}>
            {isSubmitting ? "Processando..." : `Comprar ${asset.symbol}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CryptoPurchaseForm;
