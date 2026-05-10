const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || "";
const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY || "";

export interface Quote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High
  l: number; // Low
  o: number; // Open
  pc: number; // Previous close
  t: number; // Timestamp
}

export interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface ETFHolding {
  asset: string;
  name: string;
  weightPercentage: number;
}

export interface ETFSectorWeighting {
  sector: string;
  weightPercentage: number;
}

export const marketService = {
  async getQuote(symbol: string): Promise<Quote | null> {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching quote:", error);
      return null;
    }
  },

  async getMarketIndices(): Promise<Record<string, Quote>> {
    // Using ETF proxies as Finnhub free tier supports them reliably
    const indices = ["SPY", "QQQ", "DIA", "VIXY"];
    const quotes: Record<string, Quote> = {};

    await Promise.all(
      indices.map(async (index) => {
        const quote = await this.getQuote(index);
        if (quote) {
          quotes[index] = quote;
        }
      })
    );

    return quotes;
  },

  async getCompanyNews(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    try {
      const to = new Date().toISOString().split("T")[0];
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const response = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();
      return Array.isArray(data) ? data.slice(0, limit) : [];
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  },

  async getETFHoldings(symbol: string): Promise<ETFHolding[]> {
    try {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/etf-holder/${symbol}?apikey=${FMP_API_KEY}`
      );
      const data = await response.json();
      return Array.isArray(data) ? data.slice(0, 5) : [];
    } catch (error) {
      console.error("Error fetching ETF holdings:", error);
      return [];
    }
  },

  async getETFSectorWeighting(symbol: string): Promise<ETFSectorWeighting[]> {
    try {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/etf-sector-weightings/${symbol}?apikey=${FMP_API_KEY}`
      );
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching ETF sector weighting:", error);
      return [];
    }
  },

  getSectorNews: async (sector: string): Promise<NewsItem[]> => {
    try {
      const sectorKeywords: Record<string, string> = {
        "Technology": "technology",
        "Financial Services": "banking finance",
        "Healthcare": "healthcare pharma",
        "Consumer Cyclical": "retail consumer",
        "Communication Services": "telecom media",
        "Industrials": "industrial manufacturing",
        "Energy": "energy oil",
        "Utilities": "utilities power",
        "Real Estate": "real estate",
        "Basic Materials": "materials mining",
        "Consumer Defensive": "consumer staples",
      };

      const keyword = sectorKeywords[sector] || sector.toLowerCase();
      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();
      
      // Filter news by sector keywords
      const filtered = (data || [])
        .filter((item: NewsItem) => 
          item.headline.toLowerCase().includes(keyword) ||
          item.summary?.toLowerCase().includes(keyword)
        )
        .slice(0, 3);

      return filtered;
    } catch (error) {
      console.error("Error fetching sector news:", error);
      return [];
    }
  },
};