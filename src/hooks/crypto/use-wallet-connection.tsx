
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WalletProviderType } from '@/types/crypto';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from 'web3';

export function useWalletConnection(userId?: string) {
  const { toast } = useToast();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletProvider, setWalletProvider] = useState<WalletProviderType | "none">("none");
  const [wcProvider, setWcProvider] = useState<WalletConnectProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    if (userId) {
      checkWalletConnection();
    }
  }, [userId]);

  useEffect(() => {
    // Setup MetaMask event listeners if available
    if (window.ethereum) {
      // Handle account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('accountsChanged', accounts);
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        } else {
          setWalletAddress("");
          setIsWalletConnected(false);
          setWalletProvider("none");
          toast({
            title: "Carteira desconectada",
            description: "Sua carteira foi desconectada."
          });
        }
      });

      // Handle chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        console.log('chainChanged', chainId);
        setChainId(parseInt(chainId, 16));
        toast({
          title: "Rede alterada",
          description: "A rede da sua carteira foi alterada."
        });
      });
    }

    // Cleanup WalletConnect on unmount
    return () => {
      if (wcProvider) {
        wcProvider.disconnect();
      }
      
      // Remove MetaMask listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [wcProvider, toast]);

  const checkWalletConnection = async () => {
    try {
      if (window.ethereum && window.ethereum.selectedAddress) {
        setIsWalletConnected(true);
        setWalletAddress(window.ethereum.selectedAddress);
        setWalletProvider("metamask");
        setChainId(parseInt(window.ethereum.chainId, 16));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
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
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          setWalletProvider("metamask");
          setChainId(parseInt(chainId, 16));
          
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
                chain_id: parseInt(chainId, 16),
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
        
        // Inicializar o provedor WalletConnect
        const walletConnectProvider = new WalletConnectProvider({
          infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // Infura ID público para testes
          bridge: "https://bridge.walletconnect.org",
          qrcodeModalOptions: {
            mobileLinks: [
              "rainbow",
              "metamask",
              "trust",
              "argent",
              "imtoken"
            ],
          }
        });
        
        console.log("WalletConnect provider created");
        
        // Conectar ao WalletConnect
        await walletConnectProvider.enable();
        
        console.log("WalletConnect enabled");
        
        // Obter a conta conectada
        const web3 = new Web3(walletConnectProvider as any);
        const accounts = await web3.eth.getAccounts();
        const chainId = await web3.eth.getChainId();
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          setWalletProvider("walletconnect");
          setWcProvider(walletConnectProvider);
          setChainId(chainId);
          
          // Configurar o evento de desconexão
          walletConnectProvider.on("disconnect", () => {
            setIsWalletConnected(false);
            setWalletAddress("");
            setWalletProvider("none");
            setWcProvider(null);
            setChainId(null);
            
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
                chain_id: chainId,
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
    } else if (provider === "trustwallet") {
      // Trust Wallet funciona através do protocolo WalletConnect
      return handleWalletConnect("walletconnect");
    } else {
      toast({
        title: "Provedor não suportado",
        description: `A integração com ${provider} será implementada em breve!`
      });
    }
    
    return false;
  };

  const disconnectWallet = async () => {
    if (walletProvider === "walletconnect" && wcProvider) {
      await wcProvider.disconnect();
    }
    
    setIsWalletConnected(false);
    setWalletAddress("");
    setWalletProvider("none");
    setWcProvider(null);
    setChainId(null);
    
    toast({
      title: "Carteira desconectada",
      description: "Sua carteira foi desconectada com sucesso."
    });
    
    return true;
  };

  return {
    isWalletConnected,
    walletAddress,
    walletProvider,
    chainId,
    handleWalletConnect,
    disconnectWallet,
    checkWalletConnection
  };
}
