
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

export type WalletProviderType = "metamask" | "coinbase" | "walletconnect" | "trustwallet" | string;

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

export interface CryptoExchange {
  id: string;
  name: string;
  year_established: number;
  country: string;
  url: string;
  image: string;
  trust_score: number;
  trust_score_rank: number;
  trade_volume_24h_btc: number;
}

// Estender a interface Window para adicionar o ethereum
declare global {
  interface Window {
    ethereum?: any;
    coinbaseWalletExtension?: any;
    Web3?: any;
  }
}
