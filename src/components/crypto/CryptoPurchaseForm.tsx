
import React, { useState, useEffect } from 'react';
import { CryptoAsset } from '@/types/crypto';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Tab, Tabs, TabList, TabPanel } from '@/components/ui/tabs-simple';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const [amount, setAmount] = useState<number>(1);
  const [amountInput, setAmountInput] = useState<string>("1");
  const [usdValue, setUsdValue] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState(0); // 0 para compra, 1 para venda
  const [userAssetBalance, setUserAssetBalance] = useState<number>(0);
  const [gasPrice, setGasPrice] = useState<string>("0.001");
  const [slippage, setSlippage] = useState<number>(0.5); // 0.5% padrão
  const { toast } = useToast();
  const { user } = useAuth();
  const { web3, account, balance, chainId, connected } = useWeb3();

  useEffect(() => {
    // Calcular valor em USD sempre que o montante mudar
    const calculatedValue = amount * asset.price;
    setUsdValue(calculatedValue);
  }, [amount, asset.price]);

  useEffect(() => {
    if (user && asset.id) {
      fetchUserBalance();
    }
  }, [user, asset.id]);

  const fetchUserBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_assets')
        .select('amount')
        .eq('user_id', user.id)
        .eq('asset_id', asset.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = No data found
        throw error;
      }
      
      setUserAssetBalance(data?.amount || 0);
    } catch (error) {
      console.error('Erro ao buscar saldo do usuário:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountInput(value);
    
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      setAmount(parsedValue);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newAmount = value[0];
    setAmount(newAmount);
    setAmountInput(newAmount.toString());
  };

  const handleMaxClick = () => {
    if (tabIndex === 0) {
      // Max para compra: basado no saldo em ETH/BNB/etc e preço do ativo
      if (web3 && balance) {
        // Deixar 10% do saldo para gas
        const maxTokensAffordable = parseFloat(balance) * 0.9 / asset.price;
        setAmount(Math.floor(maxTokensAffordable * 1000) / 1000); // Arredondar para 3 casas decimais
        setAmountInput(amount.toString());
      }
    } else {
      // Max para venda: baseado no saldo do usuário
      setAmount(userAssetBalance);
      setAmountInput(userAssetBalance.toString());
    }
  };

  const handleBuy = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Carteira não conectada",
        description: "Por favor, conecte sua carteira antes de comprar.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "Você precisa estar logado para realizar esta operação.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Aqui seria a integração real com um DEX como Uniswap ou 1inch
      // Para fins de simulação, vamos apenas registrar a transação
      
      const gasFeeEth = parseFloat(gasPrice);
      const totalCostEth = usdValue / (asset.price / parseFloat(balance)) + gasFeeEth;
      
      // Verificar se tem saldo suficiente
      if (parseFloat(balance) < totalCostEth) {
        toast({
          title: "Saldo insuficiente",
          description: `Você precisa de pelo menos ${totalCostEth.toFixed(6)} ${chainId === 56 ? 'BNB' : 'ETH'} para esta transação.`,
          variant: "destructive"
        });
        return;
      }
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Registrar transação no Supabase
      const { data: txn, error: txnError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'conversion',
          amount: amount * asset.price,
          currency: 'USD',
          description: `Compra de ${amount} ${asset.symbol}`,
          status: 'completed',
          metadata: {
            transaction_type: 'buy',
            asset_id: asset.id,
            asset_symbol: asset.symbol,
            asset_amount: amount,
            wallet_address: account,
            chain_id: chainId,
            price_per_unit: asset.price,
            gas_price: gasPrice,
            slippage: slippage
          }
        })
        .select()
        .single();
      
      if (txnError) throw txnError;
      
      // Atualizar o saldo do usuário
      const { data: existingAsset, error: assetError } = await supabase
        .from('user_assets')
        .select('*')
        .eq('user_id', user.id)
        .eq('asset_id', asset.id)
        .maybeSingle();
      
      if (assetError) throw assetError;
      
      if (existingAsset) {
        // Atualizar saldo existente
        await supabase
          .from('user_assets')
          .update({
            amount: existingAsset.amount + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAsset.id);
      } else {
        // Criar novo registro
        await supabase
          .from('user_assets')
          .insert({
            user_id: user.id,
            asset_id: asset.id,
            amount: amount
          });
      }
      
      // Atualizar o saldo do usuário na UI
      setUserAssetBalance(prev => prev + amount);
      
      toast({
        title: "Compra concluída",
        description: `Você comprou ${amount} ${asset.symbol} com sucesso!`
      });
      
      // Notificar componente pai
      onPurchase(amount);
      
    } catch (error: any) {
      console.error('Erro ao processar compra:', error);
      toast({
        title: "Erro na transação",
        description: error.message || "Não foi possível completar sua compra.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSell = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Carteira não conectada",
        description: "Por favor, conecte sua carteira antes de vender.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "Você precisa estar logado para realizar esta operação.",
        variant: "destructive"
      });
      return;
    }
    
    if (amount <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "A quantidade a ser vendida deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }
    
    if (amount > userAssetBalance) {
      toast({
        title: "Saldo insuficiente",
        description: `Você possui apenas ${userAssetBalance} ${asset.symbol}.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Registrar transação no Supabase
      const { data: txn, error: txnError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'conversion',
          amount: amount * asset.price,
          currency: 'USD',
          description: `Venda de ${amount} ${asset.symbol}`,
          status: 'completed',
          metadata: {
            transaction_type: 'sell',
            asset_id: asset.id,
            asset_symbol: asset.symbol,
            asset_amount: -amount, // Negativo para indicar venda
            wallet_address: account,
            chain_id: chainId,
            price_per_unit: asset.price,
            gas_price: gasPrice,
            slippage: slippage
          }
        })
        .select()
        .single();
      
      if (txnError) throw txnError;
      
      // Atualizar o saldo do usuário
      const { data: existingAsset, error: assetError } = await supabase
        .from('user_assets')
        .select('*')
        .eq('user_id', user.id)
        .eq('asset_id', asset.id)
        .single();
      
      if (assetError) throw assetError;
      
      const newAmount = existingAsset.amount - amount;
      
      if (newAmount <= 0) {
        // Remover o ativo se o saldo ficar zerado
        await supabase
          .from('user_assets')
          .delete()
          .eq('id', existingAsset.id);
      } else {
        // Atualizar saldo
        await supabase
          .from('user_assets')
          .update({
            amount: newAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAsset.id);
      }
      
      // Atualizar o saldo do usuário na UI
      setUserAssetBalance(prev => prev - amount);
      
      toast({
        title: "Venda concluída",
        description: `Você vendeu ${amount} ${asset.symbol} com sucesso!`
      });
      
      // Notificar componente pai
      onPurchase(-amount);
      
    } catch (error: any) {
      console.error('Erro ao processar venda:', error);
      toast({
        title: "Erro na transação",
        description: error.message || "Não foi possível completar sua venda.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {asset.logoUrl && (
            <img src={asset.logoUrl} alt={asset.name} className="w-10 h-10 rounded-full" />
          )}
          <div>
            <h2 className="text-xl font-semibold">{asset.name}</h2>
            <p className="text-sm text-gray-600">{asset.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Preço atual</p>
          <p className="text-lg font-semibold">
            ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
          </p>
        </div>
      </div>

      <Tabs selectedIndex={tabIndex} onChange={(index) => setTabIndex(index)}>
        <TabList className="flex gap-2 mb-6">
          <Tab
            selected={tabIndex === 0}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none"
          >
            Comprar
          </Tab>
          <Tab
            selected={tabIndex === 1}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none"
          >
            Vender
          </Tab>
        </TabList>

        <TabPanel>
          {/* Painel de Compra */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Quantidade de {asset.symbol}
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={amountInput}
                  onChange={handleInputChange}
                  min="0"
                  step="0.000001"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMaxClick}
                >
                  MAX
                </Button>
              </div>
            </div>

            <Slider
              defaultValue={[1]}
              min={0}
              max={100}
              step={0.1}
              value={[amount]}
              onValueChange={handleSliderChange}
            />

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor Total (USD)</span>
                <span className="font-medium">${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxa de Gás Estimada</span>
                <span className="font-medium">{gasPrice} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Slippage</span>
                <span className="font-medium">{slippage}%</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleBuy}
              disabled={isProcessing || !isWalletConnected || amount <= 0}
            >
              {isProcessing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? "Processando..." : "Comprar"}
            </Button>

            {!isWalletConnected && (
              <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
                <AlertCircle size={16} />
                <span>Conecte sua carteira para comprar</span>
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel>
          {/* Painel de Venda */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-600">
                  Quantidade de {asset.symbol}
                </label>
                <span className="text-sm text-gray-600">
                  Saldo: {userAssetBalance} {asset.symbol}
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={amountInput}
                  onChange={handleInputChange}
                  min="0"
                  max={userAssetBalance}
                  step="0.000001"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMaxClick}
                >
                  MAX
                </Button>
              </div>
            </div>

            <Slider
              defaultValue={[0]}
              min={0}
              max={userAssetBalance}
              step={0.1}
              value={[amount]}
              onValueChange={handleSliderChange}
            />

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor Total (USD)</span>
                <span className="font-medium">${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxa de Gás Estimada</span>
                <span className="font-medium">{gasPrice} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Slippage</span>
                <span className="font-medium">{slippage}%</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSell}
              disabled={isProcessing || !isWalletConnected || amount <= 0 || amount > userAssetBalance}
              variant="destructive"
            >
              {isProcessing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? "Processando..." : "Vender"}
            </Button>

            {!isWalletConnected && (
              <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
                <AlertCircle size={16} />
                <span>Conecte sua carteira para vender</span>
              </div>
            )}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default CryptoPurchaseForm;
