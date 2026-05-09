import Anthropic from "@anthropic-ai/sdk";

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || "";
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || "";
const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

interface PriceData {
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

interface NewsItem {
  headline: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  url: string;
}

interface FundamentalData {
  revenueGrowth: number;
  profitMargin: number;
  debtToEquity: number;
  peRatio: number;
}

interface ChartPattern {
  trend: "uptrend" | "downtrend" | "consolidating";
  pattern?: "breakout" | "pullback" | "support" | "resistance";
  strength: number;
}

interface ETFSectorData {
  sector: string;
  weight: number;
}

interface DahliaAnalysis {
  analysis: string;
  sentiment: "bullish" | "bearish" | "neutral" | "cautious";
  timestamp: string;
}

export const dahliaAnalysisService = {
  // Get real-time price data from Polygon.io
  async getPriceData(ticker: string): Promise<PriceData | null> {
    try {
      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const result = data.results[0];
        const change = result.c - result.o;
        const changePercent = (change / result.o) * 100;

        return {
          currentPrice: result.c,
          change,
          changePercent,
          high: result.h,
          low: result.l,
          volume: result.v,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching price data from Polygon:", error);
      return null;
    }
  },

  // Get latest news and analyze sentiment
  async getNewsWithSentiment(ticker: string): Promise<NewsItem[]> {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const from = weekAgo.toISOString().split("T")[0];
      const to = today.toISOString().split("T")[0];

      const response = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();

      if (!Array.isArray(data)) return [];

      // Take latest 3 news items and analyze sentiment
      const latestNews = data.slice(0, 3);
      
      return latestNews.map((item: any) => ({
        headline: item.headline,
        source: item.source,
        sentiment: this.analyzeSentiment(item.headline),
        url: item.url,
      }));
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  },

  // Simple sentiment analysis based on keywords
  analyzeSentiment(headline: string): "positive" | "negative" | "neutral" {
    const positive = [
      "surge", "soar", "gain", "rally", "up", "boost", "growth", "profit",
      "beat", "exceed", "strong", "rise", "jump", "high", "record", "success"
    ];
    const negative = [
      "fall", "drop", "plunge", "loss", "down", "decline", "weak", "miss",
      "cut", "lower", "concern", "risk", "struggle", "slump", "crisis"
    ];

    const lowerHeadline = headline.toLowerCase();
    const positiveCount = positive.filter(word => lowerHeadline.includes(word)).length;
    const negativeCount = negative.filter(word => lowerHeadline.includes(word)).length;

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  },

  // Get fundamental data from FMP
  async getFundamentals(ticker: string): Promise<FundamentalData | null> {
    try {
      const [ratiosResponse, metricsResponse] = await Promise.all([
        fetch(`https://financialmodelingprep.com/api/v3/ratios/${ticker}?apikey=${FMP_API_KEY}`),
        fetch(`https://financialmodelingprep.com/api/v3/key-metrics/${ticker}?apikey=${FMP_API_KEY}`)
      ]);

      const ratios = await ratiosResponse.json();
      const metrics = await metricsResponse.json();

      if (!Array.isArray(ratios) || !Array.isArray(metrics) || ratios.length === 0 || metrics.length === 0) {
        return null;
      }

      const latestRatio = ratios[0];
      const latestMetric = metrics[0];

      return {
        revenueGrowth: latestMetric.revenuePerShareTTM || 0,
        profitMargin: latestRatio.netProfitMargin || 0,
        debtToEquity: latestRatio.debtEquityRatio || 0,
        peRatio: latestRatio.priceEarningsRatio || 0,
      };
    } catch (error) {
      console.error("Error fetching fundamentals:", error);
      return null;
    }
  },

  // Detect chart pattern from price data
  async detectChartPattern(ticker: string): Promise<ChartPattern> {
    try {
      // Get last 30 days of data
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`
      );
      const data = await response.json();

      if (!data.results || data.results.length < 10) {
        return { trend: "consolidating", strength: 0 };
      }

      const prices = data.results.map((r: any) => r.c);
      const recentPrices = prices.slice(-10);
      const olderPrices = prices.slice(0, 10);

      // Calculate simple moving averages
      const recentAvg = recentPrices.reduce((a: number, b: number) => a + b, 0) / recentPrices.length;
      const olderAvg = olderPrices.reduce((a: number, b: number) => a + b, 0) / olderPrices.length;

      // Determine trend
      const trendStrength = ((recentAvg - olderAvg) / olderAvg) * 100;

      let trend: "uptrend" | "downtrend" | "consolidating";
      let pattern: "breakout" | "pullback" | "support" | "resistance" | undefined;

      if (trendStrength > 3) {
        trend = "uptrend";
        // Check for breakout
        const currentPrice = prices[prices.length - 1];
        const maxPrice = Math.max(...prices.slice(0, -5));
        if (currentPrice > maxPrice * 1.02) {
          pattern = "breakout";
        }
      } else if (trendStrength < -3) {
        trend = "downtrend";
        // Check for pullback
        const currentPrice = prices[prices.length - 1];
        const minPrice = Math.min(...prices.slice(0, -5));
        if (currentPrice < minPrice * 0.98) {
          pattern = "pullback";
        }
      } else {
        trend = "consolidating";
        // Check for support/resistance
        const currentPrice = prices[prices.length - 1];
        const priceRange = Math.max(...prices) - Math.min(...prices);
        const relativePosition = (currentPrice - Math.min(...prices)) / priceRange;
        
        if (relativePosition < 0.3) pattern = "support";
        else if (relativePosition > 0.7) pattern = "resistance";
      }

      return {
        trend,
        pattern,
        strength: Math.abs(trendStrength),
      };
    } catch (error) {
      console.error("Error detecting chart pattern:", error);
      return { trend: "consolidating", strength: 0 };
    }
  },

  // Get ETF sector exposure
  async getETFSectorExposure(ticker: string): Promise<ETFSectorData[]> {
    try {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/etf-sector-weightings/${ticker}?apikey=${FMP_API_KEY}`
      );
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) return [];

      return data.map((item: any) => ({
        sector: item.sector,
        weight: parseFloat(item.weightPercentage) || 0,
      })).slice(0, 5); // Top 5 sectors
    } catch (error) {
      console.error("Error fetching ETF sector exposure:", error);
      return [];
    }
  },

  // Generate Dahlia's analysis using Claude API
  async generateAnalysis(ticker: string, isETF: boolean = false): Promise<DahliaAnalysis> {
    try {
      // Gather all data in parallel
      const [priceData, news, fundamentals, chartPattern, sectorData] = await Promise.all([
        this.getPriceData(ticker),
        this.getNewsWithSentiment(ticker),
        this.getFundamentals(ticker),
        this.detectChartPattern(ticker),
        isETF ? this.getETFSectorExposure(ticker) : Promise.resolve([]),
      ]);

      // Prepare data summary for Claude
      const priceAction = priceData 
        ? `Current price: $${priceData.currentPrice.toFixed(2)}, ${priceData.changePercent > 0 ? 'up' : 'down'} ${Math.abs(priceData.changePercent).toFixed(2)}% today. High: $${priceData.high.toFixed(2)}, Low: $${priceData.low.toFixed(2)}.`
        : "Price data unavailable.";

      const newsContext = news.length > 0
        ? news.map(n => `${n.sentiment.toUpperCase()}: "${n.headline}" (${n.source})`).join("\n")
        : "No recent news available.";

      const fundamentalsContext = fundamentals
        ? `Profit margin: ${(fundamentals.profitMargin * 100).toFixed(1)}%, Debt-to-equity: ${fundamentals.debtToEquity.toFixed(2)}, P/E ratio: ${fundamentals.peRatio.toFixed(1)}`
        : "Fundamental data unavailable.";

      const chartContext = `Chart shows a ${chartPattern.trend}${chartPattern.pattern ? ` with a ${chartPattern.pattern} pattern` : ''}. Trend strength: ${chartPattern.strength.toFixed(1)}%.`;

      const sectorContext = sectorData.length > 0
        ? `Sector exposure: ${sectorData.map(s => `${s.sector} (${s.weight.toFixed(1)}%)`).join(', ')}.`
        : "";

      // Call Claude API
      const anthropic = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
      });

      const prompt = `You are Dahlia, Bloom's investing expert. You have just reviewed the following data for ${ticker}:

PRICE ACTION: ${priceAction}

RECENT NEWS:
${newsContext}

FUNDAMENTALS: ${fundamentalsContext}

CHART PATTERN: ${chartContext}

${sectorContext ? `SECTOR DATA: ${sectorContext}` : ''}

Write a 3 paragraph analysis in your warm girlfriend tone. 

Paragraph 1 — what is happening with this stock right now in plain language. Use everyday words like "the price went up/down" instead of technical terms.

Paragraph 2 — what the data and news are suggesting without using any financial jargon. Replace terms like "bearish" with "concerning" or "looking shaky", "bullish" with "promising" or "looking strong", "consolidating" with "hanging around the same price", "momentum" with "energy" or "movement".

Paragraph 3 — what makes sense here based on everything you are seeing. Frame this as what you personally think makes sense, not as a buy or sell recommendation. Never say "buy", "sell", or "hold". Instead use language like: "this one is worth watching", "the data is giving me pause right now", "everything is lining up nicely here", "I would want to see more before getting excited", or "this one feels like a sit and watch situation for now".

End with: "This is just educational info — not financial advice. Always invest what feels right for you 💛 — Dahlia"

Never mention AI, APIs, algorithms, data sources, or automation. Write as if you personally reviewed everything yourself. Use light emojis naturally but sparingly. Be honest about risk.`;

      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const analysisText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : "Analysis unavailable at this time.";

      // Determine overall sentiment
      const newsPositive = news.filter(n => n.sentiment === "positive").length;
      const newsNegative = news.filter(n => n.sentiment === "negative").length;
      const trendPositive = chartPattern.trend === "uptrend";

      let sentiment: "bullish" | "bearish" | "neutral" | "cautious";
      if (newsPositive > newsNegative && trendPositive) {
        sentiment = "bullish";
      } else if (newsNegative > newsPositive && !trendPositive) {
        sentiment = "bearish";
      } else if (newsNegative > 0 || chartPattern.trend === "downtrend") {
        sentiment = "cautious";
      } else {
        sentiment = "neutral";
      }

      return {
        analysis: analysisText,
        sentiment,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating Dahlia analysis:", error);
      
      // Fallback analysis
      return {
        analysis: `Hey! I'm having a bit of trouble pulling all the data for ${ticker} right now, but here's what I can tell you based on what I'm seeing.\n\nThe market is always moving, and this stock is no exception. Sometimes the data takes a minute to catch up, but that's okay — we're here to learn together.\n\nFor now, I'd say take your time with this one. Do a little more research on your own, check out what the company actually does, and see if it aligns with your goals. No rush!\n\nThis is just educational info — not financial advice. Always invest what feels right for you 💛 — Dahlia`,
        sentiment: "neutral",
        timestamp: new Date().toISOString(),
      };
    }
  },
};