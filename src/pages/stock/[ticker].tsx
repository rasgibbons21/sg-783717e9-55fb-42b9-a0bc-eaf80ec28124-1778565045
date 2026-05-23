/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PansyChat } from "@/components/PansyChat";
import { marketService } from "@/services/marketService";
import { TrendingUp, TrendingDown, AlertTriangle, ExternalLink, BarChart3, Activity, Target } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

interface StockData {
  c: number;
  dp: number;
  name?: string;
}

interface NewsItem {
  headline: string;
  source: string;
  datetime: number;
  url: string;
  summary: string;
}

interface PansyAnalysis {
  technical: string;
  fundamental: string;
  bullishScenario: string;
  bearishScenario: string;
  behavioralTip: string;
  scorecard: string;
  verdict: string;
  rating: string;
  fullText: string;
  timestamp: string;
}

export default function StockDetail() {
  const router = useRouter();
  const { ticker } = router.query;
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [pansyAnalysis, setPansyAnalysis] = useState<PansyAnalysis | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadStockData(ticker.toUpperCase());
    }
  }, [ticker]);

  useEffect(() => {
    if (chartReady && ticker && typeof ticker === "string") {
      initializeTradingViewChart(ticker.toUpperCase(), selectedTimeframe);
    }
  }, [chartReady, ticker, selectedTimeframe]);

  const loadStockData = async (symbol: string) => {
    setIsLoading(true);
    try {
      const quote = await marketService.getRealTimeQuote(symbol);

      // Fallback for news
      let newsData = [];
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          }&to=${new Date().toISOString().split("T")[0]}&token=${
            process.env.NEXT_PUBLIC_FINNHUB_API_KEY
          }`
        );
        newsData = await response.json();
      } catch (e) {
        console.error("Error fetching news:", e);
      }

      setStockData(quote || { c: 0, dp: 0, name: symbol });
      setNews(Array.isArray(newsData) ? newsData.slice(0, 10) : []);

      // Load Pansy's analysis
      await loadPansyAnalysis(symbol, quote || { c: 0, dp: 0, name: symbol });
    } catch (error) {
      console.error("Error loading stock data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPansyAnalysis = async (symbol: string, quote: StockData) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: symbol,
          companyName: quote.name || symbol,
          price: quote.c,
          changePercent: quote.dp,
        }),
      });

      if (response.ok) {
        const analysis = await response.json();
        setPansyAnalysis(analysis);
      }
    } catch (error) {
      console.error("Error loading Pansy analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const initializeTradingViewChart = (symbol: string, timeframe: string) => {
    const container = document.getElementById("tradingview-chart");
    if (!container) return;

    // Clear previous chart
    container.innerHTML = "";

    // Map timeframe to TradingView interval
    const intervalMap: Record<string, string> = {
      "1D": "1",
      "5D": "5",
      "1M": "30",
      "3M": "60",
      "6M": "D",
      "YTD": "D",
      "1Y": "D",
      "5Y": "W",
    };

    const interval = intervalMap[timeframe] || "D";

    // Initialize TradingView widget
    new (window as any).TradingView.widget({
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#0a0a0f",
      enable_publishing: false,
      allow_symbol_change: false,
      container_id: "tradingview-chart",
      studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies", "MASimple@tv-basicstudies"],
      backgroundColor: "#0a0a0f",
      gridColor: "rgba(61, 122, 84, 0.1)",
      hide_side_toolbar: false,
      save_image: false,
    });
  };

  const timeframes = ["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "5Y"];

  const getRatingColor = (rating: string) => {
    if (rating === "Strong Watch") return "text-[#3d7a54] bg-[#3d7a54]/10 border-[#3d7a54]/20";
    if (rating === "Watch") return "text-[#c8953a] bg-[#c8953a]/10 border-[#c8953a]/20";
    if (rating === "High Risk" || rating === "Avoid") return "text-[#d4788a] bg-[#d4788a]/10 border-[#d4788a]/20";
    return "text-muted-foreground bg-muted border-border";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-full py-8 space-y-6 pb-24">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!stockData) {
    return (
      <Layout>
        <div className="container-full py-8 pb-24">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Stock data not available</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Script
        src="https://s3.tradingview.com/tv.js"
        strategy="afterInteractive"
        onLoad={() => setChartReady(true)}
      />
      <div className="container-full py-8 space-y-6 pb-24">
        {/* Stock Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/discover" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Discover
            </Link>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            {stockData.name || ticker}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold text-foreground">
              ${stockData.c.toFixed(2)}
            </p>
            <Badge
              className={
                stockData.dp >= 0
                  ? "bg-[#3d7a54]/20 text-[#3d7a54]"
                  : "bg-[#d4788a]/20 text-[#d4788a]"
              }
            >
              {stockData.dp >= 0 ? "+" : ""}
              {stockData.dp.toFixed(2)}%
            </Badge>
            {pansyAnalysis && (
              <Badge className={getRatingColor(pansyAnalysis.rating)}>
                {pansyAnalysis.rating}
              </Badge>
            )}
          </div>
        </div>

        {/* TradingView Chart */}
        <Card className="p-6 bg-[#0a0a0f] border-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-foreground" />
              <h2 className="font-semibold text-foreground">Live Chart</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  size="sm"
                  variant={selectedTimeframe === tf ? "default" : "outline"}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={
                    selectedTimeframe === tf
                      ? "bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-muted"
                  }
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
          <div
            id="tradingview-chart"
            className="w-full h-[500px] rounded-lg overflow-hidden"
          />
          <p className="text-xs text-muted-foreground">
            Chart includes RSI, MACD, and Moving Averages for technical analysis
          </p>
        </Card>

        {/* Pansy's Analysis */}
        {isAnalyzing ? (
          <Card className="p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Pansy is analyzing the chart and fundamentals...</p>
            </div>
          </Card>
        ) : pansyAnalysis ? (
          <Card className="p-6 bg-card border-border rounded-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl shrink-0">
                🌺
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-semibold text-foreground text-lg">Pansy's Analysis</p>
                  <p className="text-sm text-muted-foreground">Bloom's Investing Expert</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="technical" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="technical">
                  <Activity className="w-4 h-4 mr-2" />
                  Technical
                </TabsTrigger>
                <TabsTrigger value="fundamental">
                  <Target className="w-4 h-4 mr-2" />
                  Fundamental
                </TabsTrigger>
                <TabsTrigger value="risk">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Risk & Mindset
                </TabsTrigger>
              </TabsList>

              <TabsContent value="technical" className="space-y-4 mt-4">
                <Card className="p-4 border-[#3d7a54]/30 bg-[#3d7a54]/10">
                  <h3 className="text-sm font-semibold text-[#3d7a54] mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Chart Analysis
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {pansyAnalysis.technical}
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="fundamental" className="space-y-4 mt-4">
                <Card className="p-4 border-[#c8953a]/30 bg-[#c8953a]/10">
                  <h3 className="text-sm font-semibold text-[#c8953a] mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Business Analysis
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {pansyAnalysis.fundamental}
                  </p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 border-[#3d7a54]/30 bg-[#3d7a54]/10">
                    <h3 className="text-sm font-semibold text-[#3d7a54] mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Bullish Scenario
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      {pansyAnalysis.bullishScenario}
                    </p>
                  </Card>

                  <Card className="p-4 border-[#d4788a]/30 bg-[#d4788a]/10">
                    <h3 className="text-sm font-semibold text-[#d4788a] mb-2 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Bearish Scenario
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      {pansyAnalysis.bearishScenario}
                    </p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4 mt-4">
                {pansyAnalysis.scorecard && (
                  <Card className="p-4 border-[#c8953a]/40 bg-[#c8953a]/10">
                    <h4 className="text-sm font-semibold text-[#c8953a] mb-2 flex items-center gap-2">
                      📋 Scorecard
                    </h4>
                    <p className="text-sm text-foreground/90 whitespace-pre-line">
                      {pansyAnalysis.scorecard}
                    </p>
                  </Card>
                )}

                <Card className="p-4 border-accent/20 bg-accent/5">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    💡 Behavioral Tip
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xs shrink-0">
                      🌺
                    </div>
                    <p className="text-sm text-foreground leading-relaxed italic">
                      {pansyAnalysis.behavioralTip}
                    </p>
                  </div>
                </Card>

                <Card className="p-4 border-[#c8953a]/50 bg-[#c8953a]/20 shadow-lg">
                  <h3 className="text-sm font-semibold text-[#c8953a] mb-1">Pansy's Verdict</h3>
                  <p className="text-lg font-bold text-foreground">{pansyAnalysis.verdict}</p>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                This platform is for educational and informational purposes only. It is not financial advice. Investing and trading involve risk, including possible loss of principal. Always do your own research or consult a licensed financial professional.
              </p>
            </div>
          </Card>
        ) : null}

        {/* Latest News */}
        {news.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground">Latest News</h2>
            {news.map((item, index) => (
              <Card key={index} className="p-4 border-border hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary line-clamp-2"
                    >
                      {item.headline}
                    </a>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{new Date(item.datetime * 1000).toLocaleDateString()}</span>
                    </div>
                    {item.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(item.url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Pansy Chat */}
        {ticker && stockData && (
          <PansyChat
            ticker={ticker as string}
            companyName={stockData.name || (ticker as string)}
            currentPrice={stockData.c}
            analysisContext={pansyAnalysis?.fullText}
          />
        )}
      </div>
    </Layout>
  );
}