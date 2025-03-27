
// Tipos para criptomoedas e carteiras
export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: string;
  volume24h: number;
  marketCap: number;
  logoUrl?: string;
}

export type WalletProviderType = "metamask" | "coinbase" | "walletconnect" | string;

export interface WalletProvider {
  name: string;
  id: WalletProviderType;
  icon: string;
  description: string;
}

export type ExternalWallet = {
  address: string;
  provider: WalletProviderType;
  chainId?: number;
  balance?: string;
};

// Estender a interface Window para adicionar o ethereum
declare global {
  interface Window {
    ethereum?: any;
    coinbaseWalletExtension?: any;
    Web3?: any;
  }
}
