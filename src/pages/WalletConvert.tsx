
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Criar componente para conversão de moedas
const WalletConvert: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fromCurrency, setFromCurrency] = useState("BRL");
  const [toCurrency, setToCurrency] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  // Taxas de conversão fictícias (em um app real, estas viriam de uma API)
  const exchangeRates = {
    BRL_BTC: 0.0000046,
    BRL_ETH: 0.00033,
    BTC_BRL: 217000,
    BTC_ETH: 72.25,
    ETH_BRL: 3000,
    ETH_BTC: 0.0138
  };
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadWalletBalance();
    }
  }, [user, authLoading, navigate, fromCurrency]);
  
  const loadWalletBalance = async () => {
    setIsLoading(true);
    
    try {
      if (fromCurrency === "BRL") {
        // Buscar saldo da carteira principal
        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user?.id)
          .single();
          
        if (error) throw error;
        setAvailableBalance(data?.balance || 0);
      } else {
        // Buscar saldo do ativo específico
        const { data, error } = await supabase
          .from('user_assets')
          .select('amount, assets(symbol)')
          .eq('user_id', user?.id)
          .eq('assets.symbol', fromCurrency)
          .single();
          
        if (error && error.code !== 'PGRST116') { // Ignora erro de não encontrado
          throw error;
        }
        
        setAvailableBalance(data?.amount || 0);
      }
    } catch (error: any) {
      console.error('Erro ao carregar saldo:', error.message);
      toast({
        title: "Erro ao carregar saldo",
        description: "Não foi possível verificar seu saldo atual.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Calcular valor convertido quando o valor ou moedas mudam
    if (amount && parseFloat(amount) > 0) {
      const key = `${fromCurrency}_${toCurrency}`;
      const rate = (exchangeRates as any)[key] || 0;
      setConvertedAmount(parseFloat(amount) * rate);
    } else {
      setConvertedAmount(null);
    }
  }, [amount, fromCurrency, toCurrency]);
  
  const handleConvert = async () => {
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para realizar conversões.",
        variant: "destructive"
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, informe um valor válido para conversão.",
        variant: "destructive"
      });
      return;
    }
    
    if (parseFloat(amount) > availableBalance) {
      toast({
        title: "Saldo insuficiente",
        description: `Você não possui saldo suficiente em ${fromCurrency}.`,
        variant: "destructive"
      });
      return;
    }
    
    const amountToConvert = parseFloat(amount);
    const key = `${fromCurrency}_${toCurrency}`;
    const rate = (exchangeRates as any)[key] || 0;
    const converted = amountToConvert * rate;
    
    if (!converted || converted <= 0) {
      toast({
        title: "Erro na conversão",
        description: "Não foi possível calcular a conversão. Tente novamente.",
        variant: "destructive"
      });
      return;
    }
    
    setIsConverting(true);
    
    try {
      // Simulação da conversão de moeda
      if (fromCurrency === "BRL") {
        // Reduzir saldo em BRL
        const { error: walletError } = await supabase
          .from('wallets')
          .update({ balance: availableBalance - amountToConvert })
          .eq('user_id', user.id);
          
        if (walletError) throw walletError;
        
        // Aumentar (ou criar) saldo na criptomoeda
        const { data: assetData, error: assetError } = await supabase
          .from('assets')
          .select('id')
          .eq('symbol', toCurrency)
          .single();
          
        if (assetError) throw assetError;
        
        // Verificar se já possui o ativo
        const { data: userAssetData, error: userAssetError } = await supabase
          .from('user_assets')
          .select('id, amount')
          .eq('user_id', user.id)
          .eq('asset_id', assetData.id)
          .maybeSingle();
          
        if (userAssetError && userAssetError.code !== 'PGRST116') throw userAssetError;
        
        if (userAssetData) {
          // Atualizar saldo existente
          const { error: updateError } = await supabase
            .from('user_assets')
            .update({ amount: userAssetData.amount + converted })
            .eq('id', userAssetData.id);
            
          if (updateError) throw updateError;
        } else {
          // Criar novo registro de ativo
          const { error: insertError } = await supabase
            .from('user_assets')
            .insert({ user_id: user.id, asset_id: assetData.id, amount: converted });
            
          if (insertError) throw insertError;
        }
      } else {
        // Conversão de cripto para BRL ou outra cripto
        // Reduzir saldo da criptomoeda de origem
        const { data: fromAssetData, error: fromAssetError } = await supabase
          .from('assets')
          .select('id')
          .eq('symbol', fromCurrency)
          .single();
          
        if (fromAssetError) throw fromAssetError;
        
        const { data: userFromAssetData, error: userFromAssetError } = await supabase
          .from('user_assets')
          .select('id, amount')
          .eq('user_id', user.id)
          .eq('asset_id', fromAssetData.id)
          .single();
          
        if (userFromAssetError) throw userFromAssetError;
        
        // Atualizar saldo da criptomoeda de origem
        const { error: updateFromError } = await supabase
          .from('user_assets')
          .update({ amount: userFromAssetData.amount - amountToConvert })
          .eq('id', userFromAssetData.id);
          
        if (updateFromError) throw updateFromError;
        
        if (toCurrency === "BRL") {
          // Aumentar saldo em BRL
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();
            
          if (walletError) throw walletError;
          
          const { error: updateWalletError } = await supabase
            .from('wallets')
            .update({ balance: walletData.balance + converted })
            .eq('user_id', user.id);
            
          if (updateWalletError) throw updateWalletError;
        } else {
          // Conversão de cripto para outra cripto
          const { data: toAssetData, error: toAssetError } = await supabase
            .from('assets')
            .select('id')
            .eq('symbol', toCurrency)
            .single();
            
          if (toAssetError) throw toAssetError;
          
          // Verificar se já possui o ativo de destino
          const { data: userToAssetData, error: userToAssetError } = await supabase
            .from('user_assets')
            .select('id, amount')
            .eq('user_id', user.id)
            .eq('asset_id', toAssetData.id)
            .maybeSingle();
            
          if (userToAssetError && userToAssetError.code !== 'PGRST116') throw userToAssetError;
          
          if (userToAssetData) {
            // Atualizar saldo existente
            const { error: updateToError } = await supabase
              .from('user_assets')
              .update({ amount: userToAssetData.amount + converted })
              .eq('id', userToAssetData.id);
              
            if (updateToError) throw updateToError;
          } else {
            // Criar novo registro de ativo
            const { error: insertToError } = await supabase
              .from('user_assets')
              .insert({ user_id: user.id, asset_id: toAssetData.id, amount: converted });
              
            if (insertToError) throw insertToError;
          }
        }
      }
      
      // Registrar a transação de conversão
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'conversion',
            amount: amountToConvert,
            description: `Conversão de ${amountToConvert} ${fromCurrency} para ${converted.toFixed(8)} ${toCurrency}`,
            status: 'completed',
            metadata: { 
              from_currency: fromCurrency, 
              to_currency: toCurrency, 
              exchange_rate: rate,
              converted_amount: converted
            }
          }
        ]);
      
      if (transactionError) throw transactionError;
      
      toast({
        title: "Conversão realizada com sucesso",
        description: `Você converteu ${amountToConvert} ${fromCurrency} para ${converted.toFixed(8)} ${toCurrency}.`,
      });
      
      // Redirecionar para a carteira após a conversão
      navigate('/wallet');
      
    } catch (error: any) {
      console.error('Erro na conversão:', error.message);
      toast({
        title: "Erro na conversão",
        description: error.message || "Não foi possível realizar a conversão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount("");
    setConvertedAmount(null);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-bank-navy mb-6">Converter Moedas</h1>
          
          <div className="glass-card shadow-glass-xl p-6 md:p-8 mb-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">De</label>
                <div className="flex gap-3">
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500">
                  Saldo disponível: {availableBalance.toLocaleString('pt-BR', { 
                    minimumFractionDigits: fromCurrency === 'BRL' ? 2 : 8,
                    maximumFractionDigits: fromCurrency === 'BRL' ? 2 : 8
                  })} {fromCurrency}
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="mx-auto"
                onClick={handleSwapCurrencies}
              >
                <RefreshCw className="rotate-90" />
              </Button>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Para</label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Valor a converter</label>
                <Input
                  type="number"
                  step={fromCurrency === 'BRL' ? '0.01' : '0.00000001'}
                  placeholder={`0${fromCurrency === 'BRL' ? ',00' : '.00000000'}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              {convertedAmount !== null && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">Você receberá aproximadamente:</p>
                  <p className="text-lg font-semibold text-bank-navy">{
                    convertedAmount.toLocaleString('pt-BR', { 
                      minimumFractionDigits: toCurrency === 'BRL' ? 2 : 8,
                      maximumFractionDigits: toCurrency === 'BRL' ? 2 : 8
                    })
                  } {toCurrency}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Taxa de câmbio: 1 {fromCurrency} = {
                      ((exchangeRates as any)[`${fromCurrency}_${toCurrency}`] || 0).toLocaleString('pt-BR', { 
                        minimumFractionDigits: toCurrency === 'BRL' ? 2 : 8,
                        maximumFractionDigits: toCurrency === 'BRL' ? 2 : 8
                      })
                    } {toCurrency}
                  </p>
                </div>
              )}
              
              <Button
                className="w-full bg-bank-blue hover:bg-bank-blue-light"
                disabled={isConverting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
                onClick={handleConvert}
              >
                {isConverting ? "Processando..." : "Converter"}
                {!isConverting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                As taxas de conversão são atualizadas em tempo real. A conversão efetiva pode variar ligeiramente.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WalletConvert;
