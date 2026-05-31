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
import { TextWithPansyTooltips } from "@/components/TextWithPansyTooltips";
import { UpgradeModal, UpgradeBanner, useViewTracker } from "@/components/UpgradeModal";
import { marketService } from "@/services/marketService";
import { userService } from "@/services/userService";
import { TrendingUp, TrendingDown, AlertTriangle, ExternalLink, BarChart3, Activity, Target, Sparkles } from "lucide-react";
import Link from "next/link";

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
  const [userPlan, setUserPlan] = useState<string>("free");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { viewCount, trackView, showUpgradeModal, setShowUpgradeModal } = useViewTracker();
  
  useEffect(() => {
    const checkUserPlan = async () => {
      const user = await userService.getCurrentUser();
      if (user) {
        setUserPlan(user.plan_type || "free");
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkUserPlan();
  }, []);

  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadStockData(ticker.toUpperCase());
      // Track view for free users
      if (userPlan === "free") {
        trackView();
      }
    }
  }, [ticker, userPlan]);

  const loadStockData = async (symbol: string) => {
    setIsLoading(true);
    try {
      const quote = await marketService.getRealTimeQuote(symbol);

      // Fallback for news using local API route
      let newsData = [];
      try {
        const response = await fetch(`/api/stock-news?ticker=${symbol}`);
        const data = await response.json();
        if (data && Array.isArray(data)) {
          newsData = data.map((item: any) => ({
            headline: item.title,
            source: item.site || "Market News",
            datetime: new Date(item.publishedDate).getTime() / 1000,
            url: item.url,
            summary: item.text
          }));
        }
      } catch (e) {
        console.error("Error fetching news:", e);
      }

      setStockData(quote || { c: 0, dp: 0, name: symbol });
      setNews(newsData);

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

        {/* Prominent Pansy Analysis CTA */}
        {!pansyAnalysis && !isAnalyzing && (
          <Card className="p-6 bg-gradient-to-br from-[#c8953a]/20 to-[#c8953a]/10 border-[#c8953a] border-2 animate-pulse-glow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl shrink-0 shadow-lg">
                🌺
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold text-foreground">Want Pansy's full breakdown?</h3>
                <p className="text-sm text-muted-foreground">Get her expert take in plain English — no jargon.</p>
              </div>
              <Button 
                onClick={() => loadPansyAnalysis(ticker as string, stockData)}
                className="bg-[#c8953a] hover:bg-[#c8953a]/90 text-white font-semibold px-6 py-3 text-base shadow-lg shrink-0"
              >
                ✨ Get Pansy's Take
              </Button>
            </div>
          </Card>
        )}

        {/* TradingView Chart */}
        <Card className="p-6 bg-[#0a0a0f] border-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-foreground" />
              <h2 className="font-semibold text-foreground">Live Chart</h2>
            </div>
          </div>
          
          <div className="w-full h-[400px] rounded-lg overflow-hidden mt-4 bg-[#0a0a0f] relative border border-white/5">
            {ticker && (
              <iframe 
                src={`https://s.tradingview.com/widgetembed/?symbol=${ticker}&interval=D&theme=dark&studies=RSI@tv-basicstudies&studies=VWAP@tv-basicstudies`}
                width="100%" 
                height="400"
                frameBorder="0"
              />
            )}
          </div>
        </Card>

        {/* Pansy's Analysis */}
        {isAnalyzing ? (
          <Card className="p-8 border-[#c8953a] animate-pulse-glow">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-3xl animate-bounce">
                🌺
              </div>
              <div className="flex items-center gap-2">
                <p className="text-foreground font-medium">Pansy is analyzing this for you</p>
                <span className="animate-pulse">...</span>
              </div>
              <p className="text-sm text-muted-foreground">This usually takes 5-10 seconds</p>
            </div>
          </Card>
        ) : pansyAnalysis ? (
          <Card className="p-6 bg-card border-[#c8953a] border-2 rounded-2xl space-y-6 animate-slide-up shadow-lg shadow-[#c8953a]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl shrink-0 shadow-lg">
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
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="technical" className="data-[state=active]:bg-[#3d7a54] data-[state=active]:text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Pansy's Take
                </TabsTrigger>
                <TabsTrigger value="fundamental" className="data-[state=active]:bg-[#c8953a] data-[state=active]:text-white">
                  <Target className="w-4 h-4 mr-2" />
                  Entry & Exit
                </TabsTrigger>
                <TabsTrigger value="risk" className="data-[state=active]:bg-[#d4788a] data-[state=active]:text-white">
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
                  <p className="text-sm text-foreground leading-relaxed">
                    <TextWithPansyTooltips text={pansyAnalysis.technical} />
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="fundamental" className="space-y-4 mt-4">
                <Card className="p-4 border-[#c8953a]/30 bg-[#c8953a]/10">
                  <h3 className="text-sm font-semibold text-[#c8953a] mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Business Analysis
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    <TextWithPansyTooltips text={pansyAnalysis.fundamental} />
                  </p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 border-[#3d7a54]/30 bg-[#3d7a54]/10">
                    <h3 className="text-sm font-semibold text-[#3d7a54] mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Bullish Scenario
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      <TextWithPansyTooltips text={pansyAnalysis.bullishScenario} />
                    </p>
                  </Card>

                  <Card className="p-4 border-[#d4788a]/30 bg-[#d4788a]/10">
                    <h3 className="text-sm font-semibold text-[#d4788a] mb-2 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Bearish Scenario
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      <TextWithPansyTooltips text={pansyAnalysis.bearishScenario} />
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
                    <p className="text-sm text-foreground/90">
                      <TextWithPansyTooltips text={pansyAnalysis.scorecard} />
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
                      <TextWithPansyTooltips text={pansyAnalysis.behavioralTip} />
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

        {/* Upgrade Banner for Free Users After Analysis */}
        {pansyAnalysis && userPlan === "free" && isLoggedIn && (
          <UpgradeBanner message="Loved Pansy's take? Get unlimited analysis with Bloom Pro — $7.99/month" />
        )}

        {/* Sign-Up CTA for Logged-Out Users */}
        {pansyAnalysis && !isLoggedIn && (
          <Card className="p-6 bg-gradient-to-br from-accent/20 to-primary/20 border-accent border-2 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl shrink-0 shadow-lg">
                🌺
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Want the full breakdown?
                </h3>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  Pansy can walk you through entry zones, exit planning, and the real risk — free the moment you sign up.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg">
                  Create free account
                </Button>
              </Link>
              <Button 
                variant="outline"
                onClick={() => loadPansyAnalysis(ticker as string, stockData!)}
                className="flex-1 border-accent/50 hover:bg-accent/10"
              >
                Quick take
              </Button>
            </div>
          </Card>
        )}

        {/* Upgrade Modal */}
        <UpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)}
          trigger={pansyAnalysis ? "after_analysis" : "view_limit"}
        />

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