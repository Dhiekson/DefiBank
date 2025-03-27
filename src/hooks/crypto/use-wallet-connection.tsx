
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WalletProviderType } from '@/types/crypto';

export function useWalletConnection(userId?: string) {
  const { toast } = useToast();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletProvider, setWalletProvider] = useState<WalletProviderType | "none">("none");

  useEffect(() => {
    if (userId) {
      checkWalletConnection();
    }
  }, [userId]);

  const checkWalletConnection = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setIsWalletConnected(true);
      setWalletAddress(window.ethereum.selectedAddress);
      setWalletProvider("metamask");
    }
  };

  const handleWalletConnect = async (provider: WalletProviderType) => {
    if (provider === "metamask") {
      if (!window.ethereum) {
        toast({
          title: "MetaMask não encontrado",
          description: "Por favor, instale a extensão MetaMask para continuar.",
          variant: "destructive"
        });
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          setWalletProvider("metamask");
          
          if (userId) {
            await supabase.from('transactions').insert({
              user_id: userId,
              type: 'wallet_connect',
              amount: 0,
              description: 'Conexão de carteira externa',
              status: 'completed',
              metadata: {
                wallet_address: accounts[0],
                wallet_provider: 'metamask',
                is_active: true
              }
            });
          }
          
          toast({
            title: "Carteira conectada",
            description: "Sua carteira MetaMask foi conectada com sucesso."
          });
          
          return true;
        }
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        toast({
          title: "Erro ao conectar",
          description: "Ocorreu um erro ao tentar conectar com sua carteira MetaMask.",
          variant: "destructive"
        });
      }
    } else if (provider === "coinbase") {
      toast({
        title: "Em breve",
        description: "A integração com Coinbase Wallet estará disponível em breve!"
      });
    } else {
      toast({
        title: "Provedor não suportado",
        description: `A integração com ${provider} será implementada em breve!`
      });
    }
    
    return false;
  };

  return {
    isWalletConnected,
    walletAddress,
    walletProvider,
    handleWalletConnect,
    checkWalletConnection
  };
}
