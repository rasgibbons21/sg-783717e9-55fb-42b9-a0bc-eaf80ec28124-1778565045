import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import Link from "next/link";

// Declare TradingView on window
declare global {
  interface Window {
    TradingView: any;
  }
}

interface StockQuote {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  d: number;
  dp: number;
  t: number;
}

interface NewsArticle {
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

interface PansyAnalysis {
  overview: string;
  entry: {
    text: string;
    signal: "good" | "wait" | "avoid";
  };
  exitHold: string;
  risk: string;
  timestamp: number;
}

export default function StockDetail() {
  const router = useRouter();
  const { ticker } = router.query;

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [pansyAnalysis, setPansyAnalysis] = useState<PansyAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  // TradingView widget reference
  const [widget, setWidget] = useState<any>(null);

  const timeframes = [
    { label: "1D", interval: "5", range: "1D" },
    { label: "1W", interval: "30", range: "5D" },
    { label: "1M", interval: "D", range: "1M" },
    { label: "3M", interval: "D", range: "3M" },
    { label: "6M", interval: "W", range: "6M" },
    { label: "1Y", interval: "W", range: "12M" },
  ];

  useEffect(() => {
    if (!ticker) return;
    loadStockData();
  }, [ticker]);

  useEffect(() => {
    if (chartLoaded && ticker) {
      initTradingViewWidget();
    }
  }, [chartLoaded, ticker, selectedTimeframe]);

  const loadStockData = async () => {
    if (!ticker || typeof ticker !== "string") return;

    setLoading(true);
    try {
      // Fetch quote
      const quoteRes = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`
      );
      const quoteData = await quoteRes.json();
      setQuote(quoteData);

      // Fetch profile
      const profileRes = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`
      );
      const profileData = await profileRes.json();
      setProfile(profileData);

      // Fetch news
      const newsRes = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}&to=${new Date().toISOString().split("T")[0]}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`
      );
      const newsData = await newsRes.json();
      setNews(newsData.slice(0, 10));

      // Check cache for Pansy analysis
      checkCachedAnalysis(ticker.toUpperCase());
    } catch (error) {
      console.error("Error loading stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkCachedAnalysis = (tickerSymbol: string) => {
    const now = new Date();
    const cacheKey = `bloom_pansy_${tickerSymbol}_${now.toISOString().split("T")[0]}_${now.getHours()}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 2 hours old
        if (Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
          setPansyAnalysis(parsed);
          return;
        }
      } catch (e) {
        console.error("Error parsing cached analysis:", e);
      }
    }

    // No valid cache, fetch new analysis
    if (quote && profile) {
      fetchPansyAnalysis(tickerSymbol);
    }
  };

  const fetchPansyAnalysis = async (tickerSymbol: string) => {
    if (!quote || !profile) return;

    setLoadingAnalysis(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: tickerSymbol,
          name: profile.name || tickerSymbol,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          high52: profile.high52 || quote.h,
          low52: profile.low52 || quote.l,
          marketCap: profile.marketCapitalization,
          peRatio: profile.peRatio,
          news: news.slice(0, 3),
        }),
      });

      const data = await response.json();

      if (data.analysis) {
        // Parse the analysis into structured format
        const analysis: PansyAnalysis = parseAnalysis(data.analysis);
        setPansyAnalysis(analysis);

        // Cache the analysis
        const now = new Date();
        const cacheKey = `bloom_pansy_${tickerSymbol}_${now.toISOString().split("T")[0]}_${now.getHours()}`;
        localStorage.setItem(cacheKey, JSON.stringify(analysis));
      }
    } catch (error) {
      console.error("Error fetching Pansy analysis:", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const parseAnalysis = (text: string): PansyAnalysis => {
    // Simple parsing - you can make this more sophisticated
    const paragraphs = text.split("\n\n").filter((p) => p.trim());

    // Determine entry signal based on keywords
    let entrySignal: "good" | "wait" | "avoid" = "wait";
    const lowerText = text.toLowerCase();
    if (lowerText.includes("good entry") || lowerText.includes("solid entry") || lowerText.includes("good time to")) {
      entrySignal = "good";
    } else if (lowerText.includes("avoid") || lowerText.includes("stay away") || lowerText.includes("not worth")) {
      entrySignal = "avoid";
    }

    return {
      overview: paragraphs[0] || text.substring(0, 200),
      entry: {
        text: paragraphs[1] || "Consider your risk tolerance and investment goals before entering a position.",
        signal: entrySignal,
      },
      exitHold: paragraphs[2] || "Monitor your position and adjust based on your goals.",
      risk: paragraphs[3] || "Market volatility can affect all stocks. Invest only what you can afford to lose.",
      timestamp: Date.now(),
    };
  };

  const initTradingViewWidget = () => {
    if (!ticker || !window.TradingView) return;

    // Clear existing widget
    const container = document.getElementById("tradingview_chart");
    if (container) {
      container.innerHTML = "";
    }

    const timeframe = timeframes.find((t) => t.label === selectedTimeframe);

    try {
      const newWidget = new window.TradingView.widget({
        width: "100%",
        height: 400,
        symbol: ticker as string,
        interval: timeframe?.interval || "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#0a0a10",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: "tradingview_chart",
        studies: ["RSI@tv-builtin", "MACD@tv-builtin"],
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#22d472",
          "mainSeriesProperties.candleStyle.downColor": "#f04848",
          "mainSeriesProperties.candleStyle.wickUpColor": "#22d472",
          "mainSeriesProperties.candleStyle.wickDownColor": "#f04848",
          "paneProperties.background": "#0a0a10",
          "paneProperties.vertGridProperties.color": "#1e1e2c",
          "paneProperties.horzGridProperties.color": "#1e1e2c",
          "scalesProperties.textColor": "#8080a0",
        },
      });

      setWidget(newWidget);
    } catch (error) {
      console.error("Error initializing TradingView widget:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-full py-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!quote || !profile) {
    return (
      <Layout>
        <div className="container-full py-6">
          <p className="text-muted-foreground">Stock data not available</p>
        </div>
      </Layout>
    );
  }

  const isPositive = quote.dp >= 0;

  return (
    <Layout>
      <SEO title={`${ticker} - ${profile.name || "Stock Analysis"} | Bloom`} description={`Get Pansy's analysis on ${ticker} stock`} />

      <Script
        src="https://s3.tradingview.com/tv.js"
        strategy="lazyOnload"
        onLoad={() => setChartLoaded(true)}
      />

      <div className="container-full py-6 space-y-6">
        {/* Back Button */}
        <Link href="/discover">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discover
          </Button>
        </Link>

        {/* Stock Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{ticker}</h1>
            {profile.logo && (
              <img src={profile.logo} alt={profile.name} className="w-10 h-10 rounded-full object-cover" />
            )}
          </div>
          <p className="text-lg text-muted-foreground">{profile.name}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-foreground">${quote.c.toFixed(2)}</span>
            <Badge variant={isPositive ? "default" : "destructive"} className="text-sm">
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {isPositive ? "+" : ""}
              {quote.d.toFixed(2)} ({isPositive ? "+" : ""}
              {quote.dp.toFixed(2)}%)
            </Badge>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {timeframes.map((tf) => (
            <Button
              key={tf.label}
              variant={selectedTimeframe === tf.label ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(tf.label)}
              className="min-w-[60px]"
            >
              {tf.label}
            </Button>
          ))}
        </div>

        {/* TradingView Chart */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div id="tradingview_chart" className="w-full" style={{ minHeight: "400px" }}></div>
          </CardContent>
        </Card>

        {/* Pansy's Analysis */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl">
                🌺
              </div>
              <div>
                <CardTitle className="text-xl text-accent">Pansy's Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">Investment analysis in plain language</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAnalysis ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-muted-foreground">Pansy is analyzing {ticker} for you... 🌸</p>
              </div>
            ) : pansyAnalysis ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="entry">Entry</TabsTrigger>
                  <TabsTrigger value="exit">Exit/Hold</TabsTrigger>
                  <TabsTrigger value="risk">Risk</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <p className="text-foreground leading-relaxed">{pansyAnalysis.overview}</p>
                </TabsContent>

                <TabsContent value="entry" className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Entry Consideration 🎯
                  </h3>
                  <Card
                    className={`p-4 ${
                      pansyAnalysis.entry.signal === "good"
                        ? "bg-primary/10 border-primary"
                        : pansyAnalysis.entry.signal === "avoid"
                        ? "bg-destructive/10 border-destructive"
                        : "bg-accent/10 border-accent"
                    }`}
                  >
                    <p className="text-foreground leading-relaxed">{pansyAnalysis.entry.text}</p>
                  </Card>
                </TabsContent>

                <TabsContent value="exit" className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Exit or Hold? 💭
                  </h3>
                  <p className="text-foreground leading-relaxed">{pansyAnalysis.exitHold}</p>
                </TabsContent>

                <TabsContent value="risk" className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Key Risk ⚠️
                  </h3>
                  <Card className="p-4 bg-accent/10 border-accent">
                    <p className="text-foreground leading-relaxed">{pansyAnalysis.risk}</p>
                  </Card>
                </TabsContent>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    Educational only. Not financial advice. Do your own research before investing. — Pansy 🌺
                  </p>
                </div>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Analysis not available yet</p>
                <Button onClick={() => fetchPansyAnalysis(ticker as string)} variant="outline" className="mt-4">
                  Generate Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest News */}
        {news.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Latest News</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {news.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{article.headline}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{new Date(article.datetime * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {article.image && (
                      <img src={article.image} alt="" className="w-20 h-20 object-cover rounded" />
                    )}
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="p-4 bg-muted/50 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </div>
      </div>
    </Layout>
  );
}