
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Web3 from 'web3';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { supabase } from '@/integrations/supabase/client';

type ChainData = {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

interface Web3ContextType {
  web3: Web3 | null;
  account: string | null;
  chainId: number | null;
  balance: string;
  provider: string;
  connecting: boolean;
  connected: boolean;
  connectWallet: (providerName: string) => Promise<boolean>;
  disconnectWallet: () => Promise<void>;
  switchChain: (chainId: number) => Promise<boolean>;
  getSupportedChains: () => ChainData[];
  refreshBalance: () => Promise<void>;
  transactionHistory: any[];
  refreshTransactionHistory: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const INFURA_ID = "27e484dcd9e3efcfd25a83a78777cdf1"; // Infura ID para uso público

const SUPPORTED_CHAINS: ChainData[] = [
  {
    chainId: 1, // Ethereum Mainnet
    name: 'Ethereum',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  {
    chainId: 56, // Binance Smart Chain
    name: 'Binance Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  {
    chainId: 137, // Polygon Mainnet
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  {
    chainId: 43114, // Avalanche
    name: 'Avalanche',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io']
  },
  {
    chainId: 42161, // Arbitrum
    name: 'Arbitrum',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io']
  }
];

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [provider, setProvider] = useState<string>('');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [walletConnectProvider, setWalletConnectProvider] = useState<WalletConnectProvider | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  // Verificar e restaurar a conexão da wallet ao iniciar
  useEffect(() => {
    const checkPreviousConnection = async () => {
      if (user) {
        const { data } = await supabase
          .from('wallet_connections')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'connected')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          const providerName = data.provider_name;
          if (providerName === 'metamask') {
            if (window.ethereum && window.ethereum.isMetaMask) {
              connectWallet('metamask');
            }
          } else if (providerName === 'walletconnect') {
            // WalletConnect requer reconexão manual
          }
        }
      }
    };

    checkPreviousConnection();
  }, [user]);

  // Configurar listeners da MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          refreshBalance();
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        refreshBalance();
        
        // Notificar mudança de rede
        const chain = SUPPORTED_CHAINS.find(c => c.chainId === newChainId);
        toast.info(`Rede alterada para ${chain ? chain.name : `Chain ID ${newChainId}`}`);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  // Atualizar saldo quando a conta ou chainId mudarem
  useEffect(() => {
    if (web3 && account) {
      refreshBalance();
      refreshTransactionHistory();
    }
  }, [web3, account, chainId]);

  const refreshBalance = async () => {
    if (!web3 || !account) return;
    
    try {
      const balanceWei = await web3.eth.getBalance(account);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      setBalance(balanceEth);
      
      // Salvar o saldo no Supabase se usuário estiver autenticado
      if (user) {
        await supabase.from('wallet_balances').upsert({
          user_id: user.id,
          wallet_address: account.toLowerCase(),
          chain_id: chainId,
          balance: balanceEth,
          last_updated: new Date().toISOString()
        }, { onConflict: 'user_id, wallet_address, chain_id' });
      }
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
    }
  };

  const refreshTransactionHistory = async () => {
    if (!web3 || !account || !chainId || !user) return;
    
    try {
      // Primeiro buscar do Supabase
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('metadata->wallet_address', account.toLowerCase())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTransactionHistory(data || []);
      
      // Aqui poderia adicionar busca de transações da blockchain
      // Mas isso requer APIs adicionais como Etherscan, BSCScan, etc.
      
    } catch (error) {
      console.error('Erro ao buscar histórico de transações:', error);
    }
  };

  const connectWallet = async (providerName: string): Promise<boolean> => {
    if (connecting) return false;
    
    setConnecting(true);
    
    try {
      if (providerName === 'metamask') {
        if (!window.ethereum) {
          toast.error('MetaMask não encontrada', {
            description: 'Por favor, instale a extensão MetaMask no seu navegador.'
          });
          return false;
        }
        
        const web3Instance = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setChainId(parseInt(chainIdHex, 16));
        setProvider('metamask');
        setConnected(true);
        
      } else if (providerName === 'walletconnect') {
        // Inicializar WalletConnect
        const wcProvider = new WalletConnectProvider({
          infuraId: INFURA_ID,
          rpc: SUPPORTED_CHAINS.reduce((acc, chain) => {
            acc[chain.chainId] = chain.rpcUrls[0];
            return acc;
          }, {} as Record<number, string>)
        });
        
        // Ativar sessão do WalletConnect
        await wcProvider.enable();
        
        const web3Instance = new Web3(wcProvider as any);
        const accounts = await web3Instance.eth.getAccounts();
        const chainId = await web3Instance.eth.getChainId();
        
        setWalletConnectProvider(wcProvider);
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setChainId(chainId);
        setProvider('walletconnect');
        setConnected(true);
        
        // Configurar listeners do WalletConnect
        wcProvider.on('disconnect', () => {
          disconnectWallet();
        });
        
        wcProvider.on('chainChanged', (chainId: number) => {
          setChainId(chainId);
          refreshBalance();
        });
        
        wcProvider.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            disconnectWallet();
          } else {
            setAccount(accounts[0]);
            refreshBalance();
          }
        });
        
      } else if (providerName === 'trustwallet') {
        // Trust Wallet usa o mesmo protocolo do WalletConnect
        return connectWallet('walletconnect');
      } else {
        toast.error('Provedor não suportado', {
          description: `O provedor ${providerName} não é suportado no momento.`
        });
        return false;
      }
      
      // Registrar conexão no Supabase se usuário estiver autenticado
      if (user) {
        await supabase.from('wallet_connections').insert({
          user_id: user.id,
          wallet_address: account?.toLowerCase(),
          provider_name: providerName,
          chain_id: chainId,
          status: 'connected',
          metadata: {
            provider: providerName,
            chain_id: chainId
          }
        });
      }
      
      toast.success('Carteira conectada', {
        description: 'Sua carteira foi conectada com sucesso!'
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao conectar carteira:', error);
      
      let errorMessage = 'Não foi possível conectar à carteira';
      if (error.message) {
        errorMessage = error.message.includes('User rejected') 
          ? 'Conexão rejeitada pelo usuário' 
          : error.message;
      }
      
      toast.error('Erro ao conectar', {
        description: errorMessage
      });
      
      return false;
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (walletConnectProvider) {
      await walletConnectProvider.disconnect();
      setWalletConnectProvider(null);
    }
    
    setWeb3(null);
    setAccount(null);
    setChainId(null);
    setBalance('0');
    setProvider('');
    setConnected(false);
    
    // Atualizar status no Supabase
    if (user && account) {
      await supabase.from('wallet_connections')
        .update({ status: 'disconnected', updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('wallet_address', account.toLowerCase())
        .eq('status', 'connected');
    }
    
    toast.info('Carteira desconectada');
  };

  const switchChain = async (chainId: number): Promise<boolean> => {
    if (!web3 || !account) return false;
    
    const chain = SUPPORTED_CHAINS.find(c => c.chainId === chainId);
    if (!chain) {
      toast.error('Rede não suportada');
      return false;
    }
    
    try {
      if (provider === 'metamask') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
        
        // O evento chainChanged irá atualizar o estado
        return true;
      } else if (provider === 'walletconnect') {
        toast.error('Troca de rede não suportada', {
          description: 'O WalletConnect não suporta troca de rede automática. Por favor, troque a rede na sua carteira.'
        });
        return false;
      }
      
      return false;
    } catch (error: any) {
      // Código 4902 significa que a chain não está adicionada à MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: chain.rpcUrls,
                blockExplorerUrls: chain.blockExplorerUrls
              },
            ],
          });
          
          return true;
        } catch (addError) {
          console.error('Erro ao adicionar rede:', addError);
          toast.error('Erro ao adicionar rede');
          return false;
        }
      }
      
      console.error('Erro ao trocar rede:', error);
      toast.error('Erro ao trocar rede');
      return false;
    }
  };

  const getSupportedChains = () => {
    return SUPPORTED_CHAINS;
  };

  return (
    <Web3Context.Provider value={{
      web3,
      account,
      chainId,
      balance,
      provider,
      connecting,
      connected,
      connectWallet,
      disconnectWallet,
      switchChain,
      getSupportedChains,
      refreshBalance,
      transactionHistory,
      refreshTransactionHistory
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
