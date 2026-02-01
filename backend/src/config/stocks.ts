/**
 * Stock Lists Configuration
 * Popular stocks from BIST (Istanbul Stock Exchange) and US markets
 */

import { IStockInfo, Market } from '../types/analysis.types';

export const BIST_STOCKS: IStockInfo[] = [
  { ticker: 'ASELS.IS', name: 'Aselsan', sector: 'Defense' },
  { ticker: 'THYAO.IS', name: 'Turkish Airlines', sector: 'Airlines' },
  { ticker: 'GARAN.IS', name: 'Garanti BBVA', sector: 'Banking' },
  { ticker: 'AKBNK.IS', name: 'Akbank', sector: 'Banking' },
  { ticker: 'YKBNK.IS', name: 'Yapi Kredi', sector: 'Banking' },
  { ticker: 'ISCTR.IS', name: 'Is Bank', sector: 'Banking' },
  { ticker: 'KCHOL.IS', name: 'Koc Holding', sector: 'Conglomerate' },
  { ticker: 'SAHOL.IS', name: 'Sabanci Holding', sector: 'Conglomerate' },
  { ticker: 'EREGL.IS', name: 'Erdemir', sector: 'Steel' },
  { ticker: 'BIMAS.IS', name: 'BIM', sector: 'Retail' },
  { ticker: 'SISE.IS', name: 'Sisecam', sector: 'Glass & Chemicals' },
  { ticker: 'TUPRS.IS', name: 'Tupras', sector: 'Energy' },
  { ticker: 'TCELL.IS', name: 'Turkcell', sector: 'Telecom' },
  { ticker: 'PGSUS.IS', name: 'Pegasus Airlines', sector: 'Airlines' },
  { ticker: 'VESTL.IS', name: 'Vestel', sector: 'Electronics' },
];

export const US_STOCKS: IStockInfo[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology' },
  { ticker: 'NVDA', name: 'NVIDIA', sector: 'Semiconductors' },
  { ticker: 'GOOGL', name: 'Alphabet', sector: 'Technology' },
  { ticker: 'AMZN', name: 'Amazon', sector: 'E-commerce' },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology' },
  { ticker: 'TSLA', name: 'Tesla', sector: 'Automotive' },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Banking' },
  { ticker: 'V', name: 'Visa', sector: 'Financial Services' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { ticker: 'UNH', name: 'UnitedHealth', sector: 'Healthcare' },
  { ticker: 'HD', name: 'Home Depot', sector: 'Retail' },
  { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer Goods' },
  { ticker: 'DIS', name: 'Walt Disney', sector: 'Entertainment' },
  { ticker: 'NFLX', name: 'Netflix', sector: 'Entertainment' },
];

export function getStocksByMarket(market: Market): IStockInfo[] {
  return market === 'BIST' ? BIST_STOCKS : US_STOCKS;
}

export function getStockInfo(market: Market, ticker: string): IStockInfo | undefined {
  const stocks = getStocksByMarket(market);
  return stocks.find((s) => s.ticker === ticker);
}

export function isValidTicker(market: Market, ticker: string): boolean {
  const stocks = getStocksByMarket(market);
  return stocks.some((s) => s.ticker === ticker);
}

export function getAllStocks(): { BIST: IStockInfo[]; US: IStockInfo[] } {
  return {
    BIST: BIST_STOCKS,
    US: US_STOCKS,
  };
}

export default {
  BIST_STOCKS,
  US_STOCKS,
  getStocksByMarket,
  getStockInfo,
  isValidTicker,
  getAllStocks,
};
