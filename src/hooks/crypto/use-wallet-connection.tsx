
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WalletProviderType } from '@/types/crypto';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from 'web3';
import { Buffer } from 'buffer';

// Ensure Buffer is available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

export function useWalletConnection(userId?: string) {
  const { toast } = useToast();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletProvider, setWalletProvider] = useState<WalletProviderType | "none">("none");
  const [wcProvider, setWcProvider] = useState<WalletConnectProvider | null>(null);

  useEffect(() => {
    if (userId) {
      checkWalletConnection();
    }
  }, [userId]);

  useEffect(() => {
    // Cleanup WalletConnect on unmount
    return () => {
      if (wcProvider) {
        wcProvider.disconnect();
      }
    };
  }, [wcProvider]);

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
        return false;
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
    } else if (provider === "walletconnect") {
      try {
        console.log("Initializing WalletConnect...");
        // Check if Buffer is available
        console.log("Buffer available:", typeof Buffer !== 'undefined');
        
        // Inicializar o provedor WalletConnect
        const walletConnectProvider = new WalletConnectProvider({
          infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // Infura ID públic para testes
          bridge: "https://bridge.walletconnect.org",
          // No QRCodeModal property needed - it's handled by WalletConnect internally
        });
        
        console.log("WalletConnect provider created");
        
        // Conectar ao WalletConnect
        await walletConnectProvider.enable();
        
        console.log("WalletConnect enabled");
        
        // Obter a conta conectada
        const web3 = new Web3(walletConnectProvider as any);
        const accounts = await web3.eth.getAccounts();
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          setWalletProvider("walletconnect");
          setWcProvider(walletConnectProvider);
          
          // Configurar o evento de desconexão
          walletConnectProvider.on("disconnect", () => {
            setIsWalletConnected(false);
            setWalletAddress("");
            setWalletProvider("none");
            setWcProvider(null);
            
            toast({
              title: "Carteira desconectada",
              description: "Sua carteira foi desconectada."
            });
          });
          
          if (userId) {
            await supabase.from('transactions').insert({
              user_id: userId,
              type: 'wallet_connect',
              amount: 0,
              description: 'Conexão de carteira externa',
              status: 'completed',
              metadata: {
                wallet_address: accounts[0],
                wallet_provider: 'walletconnect',
                is_active: true
              }
            });
          }
          
          toast({
            title: "Carteira conectada",
            description: "Sua carteira WalletConnect foi conectada com sucesso."
          });
          
          return true;
        }
      } catch (error) {
        console.error("Error connecting to WalletConnect:", error);
        toast({
          title: "Erro ao conectar",
          description: "Ocorreu um erro ao tentar conectar com WalletConnect.",
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
