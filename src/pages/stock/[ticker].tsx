import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, TrendingUp, TrendingDown, Info, AlertTriangle, Heart } from "lucide-react";
import { marketService } from "@/services/marketService";
import { pansyAnalysisService } from "@/services/pansyAnalysisService";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";

interface PansyAnalysis {
  overview: string;
  entry: string;
  exit: string;
  risk: string;
  behavioralTip: string;
  scorecard: string;
  verdict: string;
  sentiment: "bullish" | "neutral" | "bearish";
  fullText: string;
  timestamp: string;
}

export default function StockDetail() {
  const router = useRouter();
  const { ticker } = router.query;

  const [stockData, setStockData] = useState<any>(null);
  const [pansyAnalysis, setPansyAnalysis] = useState<PansyAnalysis | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadStockData(ticker);
      loadUserProfile();
    }
  }, [ticker]);

  const loadUserProfile = async () => {
    try {
      const user = await userService.getCurrentUser();
      setUserProfile(user);
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const loadStockData = async (symbol: string) => {
    setIsLoading(true);
    try {
      const [quote, newsData] = await Promise.all([
        marketService.getStockQuote(symbol),
        marketService.getStockNews(symbol).catch(() => []),
      ]);

      setStockData(quote);
      setNews(newsData || []);

      // Load Pansy's analysis
      await loadPansyAnalysis(symbol, quote);
    } catch (error) {
      console.error("Error loading stock data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPansyAnalysis = async (symbol: string, quote: any) => {
    setIsAnalyzing(true);
    try {
      const analysis = await pansyAnalysisService.analyzeStock(
        symbol,
        quote.name || symbol,
        quote.c || 0,
        quote.dp || 0,
        userProfile
      );
      setPansyAnalysis(analysis as PansyAnalysis);
    } catch (error) {
      console.error("Error loading Pansy analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleWatchlist = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    // Implementation would add/remove from watchlist
    setIsInWatchlist(!isInWatchlist);
  };

  if (isLoading || !stockData) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  const isPositive = (stockData.dp || 0) >= 0;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6 pb-24">
        {/* Stock Header */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-serif">{stockData.name || ticker}</h1>
              <p className="text-sm text-muted-foreground">{ticker}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleWatchlist}
              className={isInWatchlist ? "text-rose" : "text-muted-foreground"}
            >
              <Heart className={`w-5 h-5 ${isInWatchlist ? "fill-current" : ""}`} />
            </Button>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">${stockData.c?.toFixed(2) || "—"}</span>
            <Badge
              variant={isPositive ? "default" : "destructive"}
              className={`${
                isPositive ? "bg-primary/20 text-primary" : "bg-rose/20 text-rose"
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {stockData.dp?.toFixed(2) || "0.00"}%
            </Badge>
          </div>
        </Card>

        {/* TradingView Chart Embed */}
        <Card className="p-4 bg-card/50 backdrop-blur">
          <div className="w-full h-96 bg-background/50 rounded-xl flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              TradingView chart for {ticker} would appear here
            </p>
          </div>
        </Card>

        {/* Pansy's Analysis */}
        {isAnalyzing ? (
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl">
                🌺
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Pansy's Analysis</h2>
                <p className="text-sm text-muted-foreground">Bloom's Investing Expert</p>
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        ) : pansyAnalysis ? (
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl">
                🌺
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Pansy's Analysis</h2>
                <p className="text-sm text-muted-foreground">Bloom's Investing Expert</p>
              </div>
              <Badge
                variant="secondary"
                className={`ml-auto ${
                  pansyAnalysis.sentiment === "bullish"
                    ? "bg-primary/20 text-primary"
                    : pansyAnalysis.sentiment === "bearish"
                    ? "bg-rose/20 text-rose"
                    : "bg-muted"
                }`}
              >
                {pansyAnalysis.sentiment}
              </Badge>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Pansy's Take</TabsTrigger>
                <TabsTrigger value="entry-exit">Entry / Exit</TabsTrigger>
                <TabsTrigger value="risk">Risk & Mindset</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">{pansyAnalysis.overview}</p>
                  </div>
                  {pansyAnalysis.scorecard && (
                    <Card className="p-4 bg-accent/10 border-accent">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Scorecard</h4>
                      <p className="text-sm text-foreground/90 whitespace-pre-line">{pansyAnalysis.scorecard}</p>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="entry-exit" className="space-y-4 mt-4">
                <Card className="p-4 bg-primary/10 border-primary">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Entry Consideration
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">{pansyAnalysis.entry}</p>
                </Card>

                <Card className="p-4 bg-rose/10 border-rose">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Exit Consideration
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">{pansyAnalysis.exit}</p>
                </Card>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4 mt-4">
                <Card className="p-4 bg-rose/10 border-rose">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Assessment
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">{pansyAnalysis.risk}</p>
                </Card>

                <Card className="p-4 bg-accent/10 border-accent">
                  <h3 className="text-sm font-semibold text-foreground mb-2">💡 Behavioral Tip</h3>
                  <p className="text-sm text-foreground leading-relaxed italic">{pansyAnalysis.behavioralTip}</p>
                </Card>

                <Card className="p-4 bg-accent/20 border-accent">
                  <h3 className="text-sm font-semibold text-accent mb-2">Pansy's Verdict</h3>
                  <p className="text-base font-medium text-foreground">{pansyAnalysis.verdict}</p>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                This is for educational purposes only and is not financial advice. Investing involves risk including possible loss of principal. Historical performance does not guarantee future results. Always do your own research and consult a financial professional before investing 🌸
              </p>
            </div>
          </Card>
        ) : null}

        {/* Latest News */}
        {news.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Latest News</h2>
            {news.slice(0, 5).map((article, index) => (
              <Card key={index} className="p-4 bg-card/50 backdrop-blur">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block space-y-2 hover:opacity-80 transition"
                >
                  <h3 className="font-medium text-foreground line-clamp-2">{article.headline}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{new Date(article.datetime * 1000).toLocaleDateString()}</span>
                  </div>
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}