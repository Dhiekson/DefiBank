
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

export interface WalletProvider {
  name: string;
  id: "metamask" | "coinbase"; // Removed walletconnect for now
  icon: string;
  description: string;
}

export type ExternalWallet = {
  address: string;
  provider: "metamask" | "coinbase"; // Removed walletconnect for now
  chainId?: number;
  balance?: string;
};

// Estender a interface Window para adicionar o ethereum
declare global {
  interface Window {
    ethereum?: any;
    coinbaseWalletExtension?: any;
  }
}
