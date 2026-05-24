/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Removed direct frontend API key dependency

interface ChartDataPoint {
  date: string;
  price: number;
  timestamp: number;
}

export interface MarketAnalysis {
  trend: "up" | "down" | "sideways";
  volumeRatio: number;
  priceVs30DayHigh: number;
  priceVs30DayLow: number;
  avgVolume: number;
  high30Day: number;
  low30Day: number;
  currentPrice: number;
}

const quoteCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 60 seconds

export const marketService = {
  async apiFetch(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    if (response.status === 429) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fmp-rate-limit"));
      }
    }
    return response;
  },

  async getHistoricalData(ticker: string, days: number = 30): Promise<ChartDataPoint[]> {
    try {
      const url = `/api/stock-chart?ticker=${ticker}&endpoint=historical-price-full&timeseries=${days}`;
      const response = await this.apiFetch(url);
      const data = await response.json();

      if (data.historical && Array.isArray(data.historical)) {
        return data.historical.reverse().map((item: any) => ({
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          price: item.close,
          timestamp: new Date(item.date).getTime(),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching historical data:", error);
      return [];
    }
  },

  async getRealTimeQuote(ticker: string) {
    const now = Date.now();
    const cached = quoteCache.get(ticker);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`[Cache Hit] Real-time quote for ${ticker}`);
      return cached.data;
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
      if (!apiKey) throw new Error("Finnhub API key missing");

      const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
      const response = await this.apiFetch(url);
      const data = await response.json();

      console.log(`[API Response] Finnhub quote for ${ticker}:`, data);

      if (data && typeof data.c === "number" && data.c !== 0) {
        const result = {
          c: data.c,
          h: data.h || data.c,
          l: data.l || data.c,
          o: data.o || data.c,
          pc: data.pc || data.c,
          d: data.d || 0,
          dp: data.dp || 0,
          v: data.v || 0,
        };

        quoteCache.set(ticker, { data: result, timestamp: now });
        return result;
      }

      console.log(`[API Error] Invalid price data returned for ${ticker}:`, data);
      return null;
    } catch (error) {
      console.error("Error fetching real-time quote:", error);
      return null;
    }
  },

  async getMarketIndices(): Promise<any[]> {
    const now = Date.now();
    const cacheKey = "market_indices";
    const cached = quoteCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`[Cache Hit] Market indices`);
      return cached.data;
    }

    const indices = [
      { name: "S&P 500", symbol: "SPY" },
      { name: "NASDAQ", symbol: "QQQ" },
      { name: "DOW", symbol: "DIA" },
      { name: "VIX", symbol: "VIXY" },
    ];
    
    const results = [];
    
    for (const index of indices) {
      try {
        const data = await this.getRealTimeQuote(index.symbol);
        
        if (data) {
          results.push({
            symbol: index.symbol,
            name: index.name,
            price: data.c,
            change: data.d,
            changePercent: data.dp,
            error: false
          });
        } else {
          results.push({
            symbol: index.symbol,
            name: index.name,
            price: 0,
            change: 0,
            changePercent: 0,
            error: true
          });
        }
        
        // 500ms delay between calls to avoid Finnhub free tier rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error fetching index ${index.symbol}:`, error);
        results.push({
          symbol: index.symbol,
          name: index.name,
          price: 0,
          change: 0,
          changePercent: 0,
          error: true
        });
      }
    }
    
    if (results.length > 0) {
      quoteCache.set(cacheKey, { data: results, timestamp: now });
    }
    return results;
  },

  async getMarketAnalysis(ticker: string): Promise<MarketAnalysis | null> {
    try {
      const [chartData, quote] = await Promise.all([
        this.getHistoricalData(ticker, 30),
        this.getRealTimeQuote(ticker),
      ]);

      if (chartData.length === 0 || !quote) return null;

      const firstPrice = chartData[0].price;
      const lastPrice = chartData[chartData.length - 1].price;
      const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

      let trend: "up" | "down" | "sideways" = "sideways";
      if (priceChange > 2) trend = "up";
      else if (priceChange < -2) trend = "down";

      const prices = chartData.map((d) => d.price);
      const high30Day = Math.max(...prices);
      const low30Day = Math.min(...prices);

      const avgVolume = quote.v;
      const volumeRatio = avgVolume > 0 ? quote.v / avgVolume : 1;

      const priceVs30DayHigh = ((quote.c - high30Day) / high30Day) * 100;
      const priceVs30DayLow = ((quote.c - low30Day) / low30Day) * 100;

      return {
        trend,
        volumeRatio,
        priceVs30DayHigh,
        priceVs30DayLow,
        avgVolume,
        high30Day,
        low30Day,
        currentPrice: quote.c,
      };
    } catch (error) {
      console.error("Error calculating market analysis:", error);
      return null;
    }
  },

  async getMarketSummary() {
    try {
      // Reuse getMarketIndices to safely fetch sequentially and avoid Finnhub rate limits
      const indices = await this.getMarketIndices();
      
      const vix = indices.find(i => i.symbol === "VIXY");
      const nasdaq = indices.find(i => i.symbol === "QQQ");
      const sp500 = indices.find(i => i.symbol === "SPY");
      const dow = indices.find(i => i.symbol === "DIA");

      return {
        vix: vix ? { c: vix.price, d: vix.change, dp: vix.changePercent } : { c: 0, d: 0, dp: 0 },
        nasdaq: nasdaq ? { c: nasdaq.price, d: nasdaq.change, dp: nasdaq.changePercent } : { c: 0, d: 0, dp: 0 },
        sp500: sp500 ? { c: sp500.price, d: sp500.change, dp: sp500.changePercent } : { c: 0, d: 0, dp: 0 },
        dow: dow ? { c: dow.price, d: dow.change, dp: dow.changePercent } : { c: 0, d: 0, dp: 0 },
      };
    } catch (error) {
      console.error("Error fetching market summary:", error);
      return null;
    }
  },

  async getGeneralNews() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
      if (!apiKey) return [];

      const url = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        return data.slice(0, 5).map((item: any) => ({
          headline: item.headline,
          source: item.source,
          datetime: item.datetime,
          url: item.url,
          image: item.image,
          summary: item.summary
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching general news:", error);
      return [];
    }
  },
};