
import { CryptoAsset } from '@/types/crypto';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export async function fetchCryptoAssets(limit: number = 20): Promise<CryptoAsset[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Mapear os dados para o formato de CryptoAsset
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

export async function fetchCryptoAssetDetail(id: string) {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
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

export async function fetchExchanges(limit: number = 10) {
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
