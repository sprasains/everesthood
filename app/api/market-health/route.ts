import { NextResponse } from 'next/server';
import axios from 'axios';

// This function fetches the latest quote for a given stock symbol from Alpha Vantage.
async function getStockQuote(symbol: string, apiKey: string) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  const response = await axios.get(url);
  const data = response.data['Global Quote'];
  if (!data || Object.keys(data).length === 0) {
    // Handle cases where the API limit is reached or the symbol is invalid
    console.warn(`Could not fetch data for symbol: ${symbol}. API response:`, response.data);
    return { symbol, price: 'N/A', changePercent: '0.00%' };
  }
  return {
    symbol: data['01. symbol'],
    price: parseFloat(data['05. price']).toFixed(2),
    changePercent: data['10. change percent'],
  };
}

// This is the main API endpoint your frontend will call.
export async function GET() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    console.error('ALPHA_VANTAGE_API_KEY is not set.');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // We will fetch data for major market ETFs and cryptocurrencies in parallel.
    const symbols = ['SPY', 'QQQ', 'DIA', 'AMZN', 'AAPL', 'GOOGL', 'TSLA']; // S&P 500, Nasdaq 100, Dow Jones, Amazon, Apple, Google, Tesla
    const cryptoSymbols = ['BTC', 'ETH', 'DOGE', 'SHIB']; // Bitcoin, Ethereum, Dogecoin, Shiba Inu

    const stockPromises = symbols.map(symbol => getStockQuote(symbol, apiKey));

    // For crypto, the function is slightly different
    const cryptoPromises = cryptoSymbols.map(async (symbol) => {
        const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${apiKey}`;
        const response = await axios.get(url);
        const data = response.data['Realtime Currency Exchange Rate'];
        if (!data) {
            console.warn(`Could not fetch data for crypto: ${symbol}. API response:`, response.data);
            return { symbol: `${symbol}-USD`, price: 'N/A', changePercent: '0.00%' };
        }
        // Alpha Vantage doesn't provide change % for crypto in this endpoint, so we'll just show the price.
        return {
            symbol: `${data['1. From_Currency Code']}-USD`,
            price: parseFloat(data['5. Exchange Rate']).toFixed(2),
            changePercent: 'N/A'
        };
    });

    // Wait for all API calls to complete
    const results = await Promise.all([...stockPromises, ...cryptoPromises]);

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error fetching market health data:', error);
    return NextResponse.json({ error: 'Failed to fetch external market data.' }, { status: 502 });
  }
} 