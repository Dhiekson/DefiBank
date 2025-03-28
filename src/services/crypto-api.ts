
import { CryptoAsset } from '@/types/crypto';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export async function fetchCryptoAssets(limit: number = 100): Promise<CryptoAsset[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map the data to CryptoAsset format
    return data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h?.toFixed(2) || '0.00',
      volume24h: coin.total_volume,
      marketCap: coin.market_cap,
      logoUrl: coin.image
    }));
  } catch (error) {
    console.error('Error fetching crypto assets:', error);
    throw error;
  }
}

export async function fetchAllCryptoCurrencies(page: number = 1, perPage: number = 250): Promise<CryptoAsset[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h?.toFixed(2) || '0.00',
      volume24h: coin.total_volume,
      marketCap: coin.market_cap,
      logoUrl: coin.image
    }));
  } catch (error) {
    console.error('Error fetching all crypto currencies:', error);
    throw error;
  }
}

export async function fetchCryptoAssetDetail(id: string) {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=false&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching details for ${id}:`, error);
    throw error;
  }
}

export async function fetchCryptoAssetChart(id: string, days: number = 7) {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${id}/market_chart?vs_currency=brl&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching chart data for ${id}:`, error);
    throw error;
  }
}

export async function fetchExchanges(limit: number = 25) {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/exchanges?per_page=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    throw error;
  }
}

export async function searchCryptoCurrencies(query: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    console.error('Error searching crypto currencies:', error);
    throw error;
  }
}

export async function fetchTrendingCoins() {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/search/trending`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    throw error;
  }
}
