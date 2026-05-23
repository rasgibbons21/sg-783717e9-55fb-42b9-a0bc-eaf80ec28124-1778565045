/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
const PRIMARY_BASE_URL = "https://api.massive.com";
const FALLBACK_BASE_URL = "https://api.polygon.io";

interface PolygonQuote {
  ticker: {
    ticker: string;
    todaysChangePerc: number;
    todaysChange: number;
    day: {
      c: number;
      h: number;
      l: number;
      o: number;
      v: number;
    };
    lastQuote?: {
      P: number;
      p: number;
    };
    prevDay?: {
      c: number;
    };
  };
}

interface PolygonAgg {
  v: number;  // volume
  vw: number; // volume weighted average
  o: number;  // open
  c: number;  // close
  h: number;  // high
  l: number;  // low
  t: number;  // timestamp
  n: number;  // number of transactions
}

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
  async fetchWithFallback(primaryUrl: string, fallbackUrl: string) {
    try {
      const response = await fetch(primaryUrl);
      if (response.ok) return response;
      console.warn("Primary API failed, trying fallback...");
      return fetch(fallbackUrl);
    } catch (error) {
      console.warn("Primary API error, trying fallback:", error);
      return fetch(fallbackUrl);
    }
  },

  async getHistoricalData(ticker: string, days: number = 30): Promise<ChartDataPoint[]> {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);

    const fromStr = from.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];

    const primaryUrl = `${PRIMARY_BASE_URL}/v2/aggs/ticker/${ticker}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
    const fallbackUrl = `${FALLBACK_BASE_URL}/v2/aggs/ticker/${ticker}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;

    try {
      const response = await this.fetchWithFallback(primaryUrl, fallbackUrl);
      const data = await response.json();

      if (data.results && Array.isArray(data.results)) {
        return data.results.map((item: PolygonAgg) => ({
          date: new Date(item.t).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          price: item.c,
          timestamp: item.t,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching historical data:", error);
      return [];
    }
  },

  // Get historical OHLC data for candlestick charts
  async getHistoricalOHLC(
    ticker: string,
    days: number
  ): Promise<Array<{ time: string; open: number; high: number; low: number; close: number; volume: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const from = startDate.toISOString().split("T")[0];
      const to = endDate.toISOString().split("T")[0];

      // Determine interval based on days
      let multiplier = 1;
      let timespan = "day";
      
      if (days === 1) {
        multiplier = 5;
        timespan = "minute";
      } else if (days <= 5) {
        multiplier = 15;
        timespan = "minute";
      } else if (days <= 30) {
        multiplier = 1;
        timespan = "day";
      } else if (days <= 180) {
        multiplier = 1;
        timespan = "day";
      } else {
        multiplier = 1;
        timespan = "week";
      }

      const url = `${PRIMARY_BASE_URL}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
      
      console.log("Fetching OHLC data:", url);
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && Array.isArray(data.results)) {
        return data.results.map((bar: any) => ({
          time: new Date(bar.t).toISOString().split("T")[0],
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
          volume: bar.v || 0,
        }));
      }

      // Fallback to secondary URL
      const fallbackUrl = `${FALLBACK_BASE_URL}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.results && Array.isArray(fallbackData.results)) {
        return fallbackData.results.map((bar: any) => ({
          time: new Date(bar.t).toISOString().split("T")[0],
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
          volume: bar.v || 0,
        }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching OHLC data:", error);
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

    const primaryUrl = `${PRIMARY_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`;
    const fallbackUrl = `${FALLBACK_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`;

    try {
      const response = await this.fetchWithFallback(primaryUrl, fallbackUrl);
      const data: PolygonQuote = await response.json();
      
      console.log(`[API Response] Real-time quote for ${ticker}:`, data);

      if (data.ticker) {
        const t = data.ticker;
        const result = {
          c: t.day?.c || t.lastQuote?.p || t.lastQuote?.P || 0,
          h: t.day?.h || 0,
          l: t.day?.l || 0,
          o: t.day?.o || 0,
          pc: t.prevDay?.c || 0,
          d: t.todaysChange || 0,
          dp: t.todaysChangePerc || 0,
          v: t.day?.v || 0,
        };
        quoteCache.set(ticker, { data: result, timestamp: now });
        return result;
      }
      
      console.log(`[API Error] No ticker data returned for ${ticker}:`, data);
      return null;
    } catch (error) {
      console.error("Error fetching real-time quote:", error);
      return null;
    }
  },

  // Get market analysis data including candlestick patterns
  async getMarketAnalysis(ticker: string): Promise<MarketAnalysis | null> {
    try {
      const [chartData, quote] = await Promise.all([
        this.getHistoricalData(ticker, 30),
        this.getRealTimeQuote(ticker),
      ]);

      if (chartData.length === 0 || !quote) return null;

      // Calculate trend
      const firstPrice = chartData[0].price;
      const lastPrice = chartData[chartData.length - 1].price;
      const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

      let trend: "up" | "down" | "sideways" = "sideways";
      if (priceChange > 2) trend = "up";
      else if (priceChange < -2) trend = "down";

      // Calculate 30-day high and low
      const prices = chartData.map((d) => d.price);
      const high30Day = Math.max(...prices);
      const low30Day = Math.min(...prices);

      // Calculate average volume (assuming we have volume data)
      const avgVolume = quote.v; // Simplified - would need historical volume data

      // Volume ratio (today vs average)
      const volumeRatio = avgVolume > 0 ? quote.v / avgVolume : 1;

      // Price vs 30-day high/low
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
      const [vix, nasdaq, sp500, dow] = await Promise.all([
        this.getRealTimeQuote("VIX"),
        this.getRealTimeQuote("NDAQ"),
        this.getRealTimeQuote("SPY"), // S&P 500 ETF as proxy
        this.getRealTimeQuote("DIA"), // Dow ETF as proxy
      ]);

      return {
        vix: vix || { c: 0, d: 0, dp: 0 },
        nasdaq: nasdaq || { c: 0, d: 0, dp: 0 },
        sp500: sp500 || { c: 0, d: 0, dp: 0 },
        dow: dow || { c: 0, d: 0, dp: 0 },
      };
    } catch (error) {
      console.error("Error fetching market summary:", error);
      return null;
    }
  },
};