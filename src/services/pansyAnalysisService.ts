/* eslint-disable @typescript-eslint/no-explicit-any */
// All API calls now go through internal proxy routes - no direct external API access
import { supabase } from "@/integrations/supabase/client";

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

export interface PansyAnalysis {
  content: string;
  sentiment: "Optimistic" | "Cautious" | "Neutral" | "Watchful";
  timestamp?: string;
  analysis?: string; // For backward compatibility
}

export const pansyAnalysisService = {
  // Get real-time price data via proxy route
  async getPriceData(ticker: string): Promise<PriceData | null> {
    try {
      const response = await fetch(`/api/proxy/polygon-aggs?ticker=${ticker}&type=prev`);
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
      console.error("Error fetching price data:", error);
      return null;
    }
  },

  // Get latest news and analyze sentiment via proxy route
  async getNewsWithSentiment(ticker: string): Promise<NewsItem[]> {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const from = weekAgo.toISOString().split("T")[0];
      const to = today.toISOString().split("T")[0];

      const response = await fetch(`/api/proxy/finnhub-news?ticker=${ticker}&from=${from}&to=${to}`);
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

  // Get fundamental data via proxy route
  async getFundamentals(ticker: string): Promise<FundamentalData | null> {
    try {
      const [ratiosResponse, metricsResponse] = await Promise.all([
        fetch(`/api/proxy/fmp-ratios?ticker=${ticker}&endpoint=ratios`),
        fetch(`/api/proxy/fmp-ratios?ticker=${ticker}&endpoint=key-metrics`)
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

  // Detect chart pattern from price data via proxy route
  async detectChartPattern(ticker: string): Promise<ChartPattern> {
    try {
      // Get last 30 days of data
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const response = await fetch(
        `/api/proxy/polygon-aggs?ticker=${ticker}&type=range&from=${startDate.toISOString().split('T')[0]}&to=${endDate.toISOString().split('T')[0]}`
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

  async getAnalysisWithMarketData(
    ticker: string,
    quoteData: any,
    marketAnalysis: any
  ): Promise<PansyAnalysis> {
    try {
      const trendText = marketAnalysis.trend === "up" ? "climbing" : marketAnalysis.trend === "down" ? "dropping" : "trading sideways";
      const volumeText = marketAnalysis.volumeRatio > 1.5 ? `${marketAnalysis.volumeRatio.toFixed(1)}x the average` : "about average";
      const nearHigh = marketAnalysis.priceVs30DayHigh > -5; // within 5% of high
      const nearLow = marketAnalysis.priceVs30DayLow < 5; // within 5% of low

      let priceContext = "";
      if (nearHigh) priceContext = "The price is near its 30 day high so watch for a pullback before jumping in.";
      else if (nearLow) priceContext = "It's near its 30 day low, which could be a discount opportunity if you believe in the company.";
      else priceContext = "It's trading right in the middle of its recent range.";

      const prompt = `You are Pansy, Bloom's investing expert. Write a 3 paragraph analysis in your warm girlfriend tone about ${ticker}.

Use this REAL market data in your analysis. You MUST reference these numbers naturally like a friend talking:
- The stock has been ${trendText} over the last 30 days.
- Today's volume is ${volumeText}.
- ${priceContext}

Make it sound exactly like this example: "${ticker} has been climbing for 3 weeks straight and today's volume is 2x the average — something is definitely happening here 👀 The price is near its 30 day high so watch for a pullback before jumping in"

Do not use any financial jargon. Never say buy/sell/hold.
End with: "This is just educational info — not financial advice. Always invest what feels right for you 💛 — Pansy"`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          content: data.content || data.analysis || "Analysis generated.",
          sentiment: data.sentiment || "Neutral",
          analysis: data.content || data.analysis,
          timestamp: new Date().toISOString(),
        };
      }
      return this.getStaticFallbackAnalysis(ticker);
    } catch (error) {
      console.error("Error generating analysis with market data:", error);
      return this.getStaticFallbackAnalysis(ticker);
    }
  },

  // Get ETF sector exposure via proxy route
  async getETFSectorExposure(ticker: string): Promise<ETFSectorData[]> {
    try {
      const response = await fetch(`/api/proxy/fmp-ratios?ticker=${ticker}&endpoint=etf-sector-weightings`);
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

  // Generate Pansy's analysis using our Next.js API route
  async generateAnalysis(
    ticker: string, 
    isETF: boolean = false, 
    quoteData?: any, 
    profileData?: any, 
    newsData?: any[]
  ): Promise<PansyAnalysis> {
    try {
      let priceAction = "Price data unavailable.";
      let newsContext = "No recent news available.";
      let fundamentalsContext = "Fundamental data unavailable.";
      let chartContext = "Chart data unavailable.";
      let sectorContext = "";

      // Fetch dynamic data if we need it (the 2-argument call)
      if (!quoteData) {
        const [priceData, news, fundamentals, chartPattern, sectorData] = await Promise.all([
          this.getPriceData(ticker),
          this.getNewsWithSentiment(ticker),
          this.getFundamentals(ticker),
          this.detectChartPattern(ticker),
          isETF ? this.getETFSectorExposure(ticker) : Promise.resolve([]),
        ]);

        if (priceData) {
          priceAction = `Current price: $${priceData.currentPrice.toFixed(2)}, ${priceData.changePercent > 0 ? 'up' : 'down'} ${Math.abs(priceData.changePercent).toFixed(2)}% today.`;
        }
        
        if (news && news.length > 0) {
          newsContext = news.map(n => `${n.sentiment.toUpperCase()}: "${n.headline}"`).join("\n");
        }

        if (fundamentals) {
          fundamentalsContext = `Profit margin: ${(fundamentals.profitMargin * 100).toFixed(1)}%, Debt-to-equity: ${fundamentals.debtToEquity.toFixed(2)}, P/E ratio: ${fundamentals.peRatio.toFixed(1)}`;
        }

        if (chartPattern) {
          chartContext = `Chart shows a ${chartPattern.trend}${chartPattern.pattern ? ` with a ${chartPattern.pattern} pattern` : ''}.`;
        }

        if (sectorData && sectorData.length > 0) {
          sectorContext = `Sector exposure: ${sectorData.map(s => `${s.sector} (${s.weight.toFixed(1)}%)`).join(', ')}.`;
        }
      } else {
        // Use provided data (the 4-argument call backward compatibility)
        priceAction = `Current price: $${quoteData?.c || "Unknown"}, Daily change: ${quoteData?.dp ? `${quoteData.dp}%` : "Unknown"}`;
        if (profileData) {
          fundamentalsContext = `Company info: ${profileData.name || ticker} - ${profileData.finnhubIndustry || profileData.assetClass || "Unknown"}`;
        }
        if (newsData && newsData.length > 0) {
          newsContext = newsData.slice(0, 3).map(n => `- ${n.headline || n.symbol}`).join('\n');
        }
      }

      const prompt = `You are Pansy, Bloom's investing expert. You have just reviewed the following data for ${ticker}:

PRICE ACTION: ${priceAction}
RECENT NEWS: ${newsContext}
FUNDAMENTALS: ${fundamentalsContext}
CHART PATTERN: ${chartContext}
${sectorContext ? `SECTOR DATA: ${sectorContext}` : ''}

Write a 3 paragraph analysis in your warm girlfriend tone. 
Paragraph 1 — what is happening with this stock right now in plain language.
Paragraph 2 — what the data and news are suggesting without using any financial jargon.
Paragraph 3 — what makes sense here based on everything you are seeing (never say buy/sell/hold).
End with: "This is just educational info — not financial advice. Always invest what feels right for you 💛 — Pansy"`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          content: data.content || data.analysis || "Analysis generated.",
          sentiment: data.sentiment || "Neutral",
          analysis: data.content || data.analysis, // Backward compatibility
          timestamp: new Date().toISOString(),
        };
      }

      return this.getStaticFallbackAnalysis(ticker);
    } catch (error) {
      console.error("Error generating Pansy analysis:", error);
      return this.getStaticFallbackAnalysis(ticker);
    }
  },

  generateSectorNewsReaction: async (
    headline: string,
    sector: string,
    etfTicker: string
  ): Promise<string> => {
    try {
      const prompt = `You are Pansy, Bloom's investing expert with a warm girlfriend tone. A news headline just came out related to the ${sector} sector, which is one of the main sectors in the ${etfTicker} ETF.
Headline: "${headline}"
Write ONE casual sentence (15-25 words max) explaining how this news might affect the ${sector} companies inside this ETF. Keep it conversational, honest, and use light emojis naturally. Never use jargon. Just one sentence.`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.content || data.analysis || "Keeping an eye on how this plays out 🌸";
      }
      return "Keeping an eye on how this plays out 🌸";
    } catch (error) {
      console.error("Error generating sector news reaction:", error);
      return "Keeping an eye on how this plays out 🌸";
    }
  },

  // Fallback for when the API route is unavailable or fails
  getStaticFallbackAnalysis: (ticker: string): PansyAnalysis => {
    const fallbackText = `Hey! I'm having a bit of trouble pulling all the data for ${ticker} right now, but here's what I can tell you based on what I'm seeing.\n\nThe market is always moving, and this stock is no exception. Sometimes the data takes a minute to catch up, but that's okay — we're here to learn together.\n\nFor now, I'd say take your time with this one. Do a little more research on your own, check out what the company actually does, and see if it aligns with your goals. No rush!\n\nThis is just educational info — not financial advice. Always invest what feels right for you 💛 — Pansy`;
    
    return {
      content: fallbackText,
      analysis: fallbackText,
      sentiment: "Neutral",
      timestamp: new Date().toISOString(),
    };
  },

  async analyzeStock(
    ticker: string,
    companyName: string,
    price: number,
    changePercent: number,
    userProfile?: {
      riskTolerance?: string;
      age?: number;
      retirementAge?: number;
      monthlyContribution?: number;
      investmentGoals?: string[];
      experienceLevel?: string;
    }
  ) {
    try {
      console.log(`Pansy analyzing ${ticker}...`);

      const cacheKey = `bloom_pansy_${ticker}_${new Date().toISOString().split("T")[0]}_${new Date().getHours()}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.log(`Using cached analysis for ${ticker}`);
        return JSON.parse(cached);
      }

      let userContext = "";
      if (userProfile) {
        userContext = `\n\nUSER PROFILE:
- Risk Tolerance: ${userProfile.riskTolerance || "Moderate"}
- Experience Level: ${userProfile.experienceLevel || "Beginner"}
- Investment Goals: ${userProfile.investmentGoals?.join(", ") || "Wealth Building"}`;
        
        if (userProfile.age && userProfile.retirementAge) {
          const yearsToRetirement = userProfile.retirementAge - userProfile.age;
          userContext += `\n- Current Age: ${userProfile.age}
- Target Retirement Age: ${userProfile.retirementAge}
- Time Horizon: ${yearsToRetirement} years`;
        }
        
        if (userProfile.monthlyContribution) {
          userContext += `\n- Monthly Contribution: $${userProfile.monthlyContribution}`;
        }
      }

      const userMessage = `Analyze this investment for a female investor:

Ticker: ${ticker}
Company: ${companyName}
Current Price: $${price}
Change Today: ${changePercent.toFixed(2)}%

${userContext}

Please provide:
1. **Why This ETF / Investment** (1-2 sentences on what's happening with this investment right now based on your web search)
2. **Portfolio Role** — Is this a good area to start a position, how does it fit with other investments, and should she wait? Use web search to check current market conditions.
3. **Risks to Know** — What's the main risk to watch?

Use web search to get the latest data and performance metrics. Sound like a knowledgeable girlfriend giving real talk, not a robot reading data.`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analysis from server");
      }

      const data = await response.json();
      const analysisText = data.analysis || data.content;

      if (!analysisText) {
        throw new Error("No analysis text received from Pansy");
      }

      const analysis = {
        whyThisEtf: extractSection(analysisText, ["Why This ETF", "Why This Investment", "Overview", "Situation"]),
        portfolioRole: extractSection(analysisText, ["Portfolio Role", "Role", "Entry", "Fit"]),
        risksToKnow: extractSection(analysisText, ["Risks to Know", "Key Risk", "Risk", "What to Watch"]),
        fullText: analysisText,
        timestamp: new Date().toISOString(),
      };

      let sentiment: "bullish" | "neutral" | "bearish" = "neutral";
      const roleLower = analysis.portfolioRole.toLowerCase();
      if (
        roleLower.includes("good entry") ||
        roleLower.includes("solid opportunity") ||
        roleLower.includes("looks promising") ||
        roleLower.includes("good area") ||
        roleLower.includes("core holding")
      ) {
        sentiment = "bullish";
      } else if (
        roleLower.includes("wait") ||
        roleLower.includes("caution") ||
        roleLower.includes("avoid") ||
        roleLower.includes("risky")
      ) {
        sentiment = "bearish";
      }

      const result = {
        ...analysis,
        sentiment,
        ticker,
        companyName,
        price,
        changePercent,
      };

      localStorage.setItem(cacheKey, JSON.stringify(result));
      console.log(`Cached analysis for ${ticker}`);

      return result;
    } catch (error: any) {
      console.error("Error in Pansy analysis:", error);
      
      return {
        whyThisEtf: `I'm looking at ${companyName} (${ticker}) which is currently trading at $${price}, ${
          changePercent >= 0 ? "up" : "down"
        } ${Math.abs(changePercent).toFixed(2)}% today.`,
        portfolioRole: "I need a moment to gather the latest data for you. Try refreshing in a few seconds 🌸",
        risksToKnow: "Market conditions are always changing, so staying informed is key.",
        fullText: "Analysis temporarily unavailable. Please try again in a moment.",
        sentiment: "neutral" as const,
        ticker,
        companyName,
        price,
        changePercent,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  },

  async generatePortfolioRecommendation(userProfile: {
    age: number;
    retirementAge: number;
    monthlyContribution: number;
    riskTolerance: string;
    investmentGoals: string[];
  }) {
    try {
      const yearsToRetirement = userProfile.retirementAge - userProfile.age;
      
      const userMessage = `Generate a personalized ETF portfolio recommendation for this investor:

Age: ${userProfile.age}
Target Retirement Age: ${userProfile.retirementAge}
Time Horizon: ${yearsToRetirement} years
Monthly Contribution: $${userProfile.monthlyContribution}
Risk Tolerance: ${userProfile.riskTolerance}
Investment Goals: ${userProfile.investmentGoals.join(", ")}

Please provide:
1. **Recommended Portfolio** — Suggest 3-5 ETFs with allocation percentages
2. **Compound Growth Projection** — Estimate portfolio value at retirement using historical average returns
3. **Growth Breakdown** — Show total contributions vs compounding growth
4. **Why This Mix** — Explain how these ETFs work together for her specific goals and timeline
5. **Behavioral Finance Tip** — One key mindset insight for staying the course

Use web search to find currently top-performing ETFs that match her profile. Consider new ETFs launched in the last 12 months if they're worth recommending. Be specific with allocation percentages and realistic with projections.`;

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("/api/analyze-portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({ userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendation from server");
      }

      const data = await response.json();
      return {
        fullText: data.fullText || "Check back in a moment for my recommendation 🌸",
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error("Error generating portfolio recommendation:", error);
      throw error;
    }
  },
};

function extractSection(text: string, sectionTitles: string[]): string {
  for (const title of sectionTitles) {
    const regex = new RegExp(`${title}[:\\s]*([^\\n]+(?:\\n(?!\\*\\*|#)[^\\n]+)*)`, "i");
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
  return paragraphs[0] || "Check back in a moment for my full analysis 🌸";
}