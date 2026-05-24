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
      const url = `/api/stock-data?tickers=${ticker}`;
      const response = await this.apiFetch(url);
      const data = await response.json();

      console.log(`[API Response] Local quote for ${ticker}:`, data);

      if (data && data.length > 0) {
        const quote = data[0];
        const result = {
          c: quote.price,
          h: quote.dayHigh || quote.price,
          l: quote.dayLow || quote.price,
          o: quote.open || quote.price,
          pc: quote.previousClose || quote.price,
          d: quote.change,
          dp: quote.changesPercentage,
          v: quote.volume || 0,
        };

        quoteCache.set(ticker, { data: result, timestamp: now });
        return result;
      }

      console.log(`[API Error] No price data returned for ${ticker}:`, data);
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
      { name: "S&P 500", symbol: "^GSPC" },
      { name: "NASDAQ", symbol: "^IXIC" },
      { name: "DOW", symbol: "^DJI" },
      { name: "VIX", symbol: "^VIX" },
    ];
    
    // Batch tickers for local API route
    const tickers = indices.map(i => i.symbol).join(",");

    try {
      const url = `/api/stock-data?tickers=${tickers}`;
      const response = await this.apiFetch(url);
      const data = await response.json();
      
      const results = [];
      for (const index of indices) {
        const quote = data?.find?.((q: any) => q.symbol === index.symbol);
        if (quote) {
          results.push({
            symbol: index.symbol.replace("^", ""),
            name: index.name,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changesPercentage,
            error: false
          });
        } else {
          results.push({
            symbol: index.symbol.replace("^", ""),
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
    } catch (error) {
      console.error("Error fetching market indices:", error);
      return [];
    }
  },

  async getChartData(ticker: string, timeframe: string = "1D") {
    try {
      let url = "";
      let isIntraday = false;

      switch(timeframe) {
        case "1D":
          url = `/api/stock-chart?ticker=${ticker}&endpoint=5min`;
          isIntraday = true;
          break;
        case "5D":
          url = `/api/stock-chart?ticker=${ticker}&endpoint=15min`;
          isIntraday = true;
          break;
        case "1M":
          url = `/api/stock-chart?ticker=${ticker}&endpoint=1hour`;
          isIntraday = true;
          break;
        case "3M":
          url = `/api/stock-chart?ticker=${ticker}&endpoint=historical-price-full&timeseries=90`;
          break;
        case "6M":
          url = `/api/stock-chart?ticker=${ticker}&endpoint=historical-price-full&timeseries=180`;
          break;
        case "YTD":
          url = `/api/stock-chart?ticker=${ticker}&endpoint=historical-price-full&timeseries=250`;
          break;
        case "1Y":
          url = `/api/stock-chart?ticker=${ticker}&endpoint=historical-price-full&timeseries=250`;
          break;
        case "5Y":
          url = `/api/stock-chart?ticker=${ticker}&endpoint=historical-price-full&timeseries=1250`;
          break;
        default:
          url = `/api/stock-chart?ticker=${ticker}&endpoint=5min`;
          isIntraday = true;
      }

      console.log(`[API Request] Fetching local chart data for ${ticker} (${timeframe}):`, url);
      const response = await this.apiFetch(url);
      const data = await response.json();

      let results = [];

      if (isIntraday && Array.isArray(data)) {
        // Intraday is newest first, so reverse it
        results = data.reverse().map((item: any) => ({
          time: new Date(item.date).getTime(),
          date: new Date(item.date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric", 
            minute: "2-digit"
          }),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
        }));

        if (timeframe === "1D" && results.length > 0) {
          const lastDate = new Date(results[results.length - 1].time).toLocaleDateString();
          results = results.filter((r: any) => new Date(r.time).toLocaleDateString() === lastDate);
        }
      } else if (!isIntraday && data.historical && Array.isArray(data.historical)) {
        results = data.historical.reverse().map((item: any) => ({
          time: new Date(item.date).getTime(),
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: timeframe === "5Y" ? "numeric" : undefined
          }),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
        }));

        if (timeframe === "YTD") {
          const currentYear = new Date().getFullYear();
          results = results.filter(r => new Date(r.time).getFullYear() === currentYear);
        }
      }

      if (results.length > 0) {
        return results;
      }

      console.log(`[API Error] Invalid or empty chart data returned for ${ticker}`);
      return null;
    } catch (error) {
      console.error("Error fetching chart data:", error);
      return null;
    }
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
      const [vix, nasdaq, sp500, dow] = await Promise.all([
        this.getRealTimeQuote("^VIX"),
        this.getRealTimeQuote("^IXIC"),
        this.getRealTimeQuote("^GSPC"), 
        this.getRealTimeQuote("^DJI"), 
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