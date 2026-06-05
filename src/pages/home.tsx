/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { marketService } from "@/services/marketService";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  error?: boolean;
}

interface StockPick {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  pansyQuote: string;
  type?: string;
  trend?: string;
  riskLevel?: string;
  error?: boolean;
}

// Default fallback data
const DEFAULT_MARKET_DATA: MarketIndex[] = [
  { symbol: "^GSPC", name: "S&P 500", price: 5200.00, change: 0, changePercent: 0 },
  { symbol: "^IXIC", name: "NASDAQ", price: 16400.00, change: 0, changePercent: 0 },
  { symbol: "^DJI", name: "DOW", price: 38500.00, change: 0, changePercent: 0 },
  { symbol: "^VIX", name: "VIX", price: 14.50, change: 0, changePercent: 0 },
];

const DEFAULT_STOCK_PICKS: StockPick[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 450.00,
    change: 0,
    changePercent: 0,
    pansyQuote: "Powering the AI revolution. Every tech company needs their chips.",
    type: "Stock",
    trend: "Bullish",
    riskLevel: "Aggressive",
  },
  {
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    price: 420.00,
    change: 0,
    changePercent: 0,
    pansyQuote: "Tracks the 500 biggest US companies. A foundational piece for any portfolio.",
    type: "ETF",
    trend: "Bullish",
    riskLevel: "Moderate",
  },
  {
    ticker: "FXAIX",
    name: "Fidelity 500 Index Fund",
    price: 180.00,
    change: 0,
    changePercent: 0,
    pansyQuote: "One of the lowest cost index funds. Perfect for set-and-forget retirement accounts.",
    type: "Mutual Fund",
    trend: "Sideways",
    riskLevel: "Conservative",
  },
];

export default function Home() {
  const router = useRouter();
  const { isPro, isLoggedIn } = useSubscription();
  const [user, setUser] = useState<any>(null);
  const [marketData, setMarketData] = useState<MarketIndex[]>(DEFAULT_MARKET_DATA);
  const [stockPicks, setStockPicks] = useState<StockPick[]>(DEFAULT_STOCK_PICKS);
  const [watchlistNews, setWatchlistNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isLoadingIndices, setIsLoadingIndices] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    
    // Load complete user profile from users table
    const userProfile = await userService.getCurrentUser();
    setUser(userProfile);
    
    // Load data with timeout
    loadDataWithTimeout();
  };

  const loadDataWithTimeout = async () => {
    const timeoutId = setTimeout(() => {
      console.log("Home: Data loading timeout - using fallback data");
      setIsLoadingNews(false);
    }, 5000);

    try {
      const userProfile = await userService.getCurrentUser();
      
      await Promise.all([
        loadMarketData(),
        loadStockPicks(),
        loadWatchlistNews(userProfile?.id),
      ]);
      clearTimeout(timeoutId);
    } catch (error) {
      console.error("Home: Error loading data:", error);
      clearTimeout(timeoutId);
    }
  };

  const loadWatchlistNews = async (userId: string) => {
    try {
      let newsLoaded = false;

      if (userId) {
        const { data: watchlist, error } = await supabase
          .from("watchlist")
          .select("ticker")
          .eq("user_id", userId)
          .limit(5);

        if (!error && watchlist && watchlist.length > 0) {
          const newsPromises = watchlist.map(async (item) => {
            // Use the new local API route for FMP
            const response = await fetch(`/api/stock-news?ticker=${item.ticker}`);
            const newsData = await response.json();
            return Array.isArray(newsData) ? newsData.slice(0, 2) : [];
          });

          const allNews = await Promise.all(newsPromises);
          const flatNews = allNews.flat().sort((a, b) => b.datetime - a.datetime).slice(0, 5);
          
          if (flatNews.length > 0) {
            setWatchlistNews(flatNews);
            newsLoaded = true;
          }
        }
      }

      // Fallback to general market news if watchlist is empty or has no news
      if (!newsLoaded) {
        const generalNews = await marketService.getGeneralNews();
        setWatchlistNews(generalNews);
      }
    } catch (error) {
      console.error("Error loading watchlist news:", error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const loadMarketData = async () => {
    setIsLoadingIndices(true);
    try {
      const data = await marketService.getMarketIndices();
      if (data && data.length > 0) {
        setMarketData(data);
      }
    } catch (error) {
      console.error("Error loading market data:", error);
    } finally {
      setIsLoadingIndices(false);
    }
  };

  const loadStockPicks = async () => {
    try {
      const tickers = ["NVDA", "VOO", "FXAIX"];
      const picks = [];
      
      for (let i = 0; i < tickers.length; i++) {
        const ticker = tickers[i];
        try {
          const quote = await marketService.getRealTimeQuote(ticker);
          picks.push({
            ...DEFAULT_STOCK_PICKS[i],
            price: quote?.c || DEFAULT_STOCK_PICKS[i].price,
            change: quote?.d || 0,
            changePercent: quote?.dp || 0,
            error: !quote || quote.c === 0
          });
        } catch (error) {
          console.error(`Error loading ${ticker}:`, error);
          picks.push({ ...DEFAULT_STOCK_PICKS[i], error: true });
        }
      }

      setStockPicks(picks);
    } catch (error) {
      console.error("Error loading stock picks:", error);
    }
  };

  return (
    <Layout>
      <SEO
        title="Home — Bloom"
        description="Your personalized investment dashboard"
      />

      {/* Full-width layout with 5% left/right padding */}
      <div className="w-full mx-auto space-y-8 pb-24 px-[5%] pt-6">
        
        {/* Greeting */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {isPro ? "Welcome to Bloom Pro" : `Welcome back, ${user?.full_name?.split(" ")[0] || "Investor"}`} 🌸
            </h1>
            <p className="text-muted-foreground mt-1">
              {isPro ? "Your premium investing companion" : "Your daily market insights"}
            </p>
          </div>
        </div>

        {/* Pansy Chat Bubble */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0 mt-1">
            <img src="/bloom-logo.png" alt="Pansy" className="w-16 h-16 rounded-full border-2 border-background shadow-sm object-cover bg-white" />
            <div className="absolute bottom-0 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 pl-1">
              <h3 className="font-serif font-bold text-foreground text-lg">Pansy</h3>
              <Badge variant="secondary" className="text-[10px] bg-accent/10 text-accent-foreground border-accent/20 h-5 font-medium shadow-sm">
                Available 24/7
              </Badge>
            </div>
            <div className="bg-card backdrop-blur-sm p-4 rounded-2xl rounded-tl-sm shadow-sm inline-block border border-border">
              <p className="text-sm md:text-base text-foreground leading-relaxed">
                The market is moving today, but remember our golden rule: we don't panic, we prepare. I've analyzed the latest trends and picked out some beautiful opportunities for your portfolio. What are we feeling today? 💛
              </p>
            </div>
          </div>
        </div>

        {/* Market Summary Bar */}
        <Card className="p-5 bg-card border-border rounded-2xl shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoadingIndices ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center justify-center space-y-2 p-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))
            ) : marketData.map((index) => (
              <div key={index.symbol} className="text-center p-2 flex flex-col justify-center">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  {index.name}
                </p>
                {index.error ? (
                  <p className="font-semibold text-destructive text-sm mt-1">Unavailable</p>
                ) : (
                  <>
                    <p className="font-serif font-bold text-foreground text-xl md:text-2xl">
                      {index.price > 0 ? index.price.toFixed(2) : "—"}
                    </p>
                    {index.price > 0 && (
                      <div className="mt-1">
                        <Badge
                          className={
                            index.changePercent >= 0
                              ? "bg-[#3d7a54]/10 text-[#3d7a54] text-xs font-medium border-0"
                              : "bg-[#d4788a]/10 text-[#d4788a] text-xs font-medium border-0"
                          }
                        >
                          {index.changePercent >= 0 ? "+" : ""}
                          {index.changePercent.toFixed(2)}%
                        </Badge>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Pansy's Picks Today (Grid) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Pansy's Picks Today
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stockPicks.map((stock) => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.ticker}`}
                className="block group h-full"
              >
                <Card className="p-5 hover:border-accent/50 hover:shadow-md transition-all border-border rounded-2xl h-full flex flex-col bg-card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-serif font-bold text-foreground text-xl group-hover:text-accent transition-colors">
                          {stock.ticker}
                        </p>
                        <Badge variant="secondary" className="text-[10px] bg-muted uppercase tracking-wider">
                          {stock.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {stock.name}
                      </p>
                    </div>
                    <div className="text-right">
                      {stock.error ? (
                        <p className="text-sm font-medium text-destructive mt-1">Unavailable</p>
                      ) : (
                        <>
                          <p className="font-semibold text-foreground text-lg">
                            ${stock.price.toFixed(2)}
                          </p>
                          {stock.price > 0 && stock.changePercent !== 0 && (
                            <Badge
                              className={
                                stock.changePercent >= 0
                                  ? "bg-[#3d7a54]/10 text-[#3d7a54] text-xs font-medium mt-1 border-0"
                                  : "bg-[#d4788a]/10 text-[#d4788a] text-xs font-medium mt-1 border-0"
                              }
                            >
                              {stock.changePercent >= 0 ? "+" : ""}
                              {stock.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline" className="text-xs font-normal border-border/50 text-muted-foreground">
                      {stock.trend}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-normal border-border/50 text-muted-foreground">
                      {stock.riskLevel}
                    </Badge>
                  </div>

                  <div className="mt-auto">
                    <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 relative">
                      <div className="absolute -top-3 -left-2 text-2xl drop-shadow-sm">🌺</div>
                      <p className="text-sm italic text-foreground leading-relaxed pl-4">
                        "{stock.pansyQuote}"
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Market Movers */}
          <Card className="p-6 bg-card border-border rounded-2xl h-fit">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Market Movers
            </h2>
            <div className="space-y-3">
              {stockPicks.slice(0, 5).map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors group"
                >
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
                      {stock.ticker}
                    </p>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    {stock.error ? (
                      <p className="text-sm font-medium text-destructive">Unavailable</p>
                    ) : (
                      <>
                        <p className="font-semibold text-foreground">
                          ${stock.price.toFixed(2)}
                        </p>
                        {stock.price > 0 && stock.changePercent !== 0 && (
                          <Badge
                            className={
                              stock.changePercent >= 0
                                ? "bg-[#3d7a54]/10 text-[#3d7a54] border-0"
                                : "bg-[#d4788a]/10 text-[#d4788a] border-0"
                            }
                          >
                            {stock.changePercent >= 0 ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Market News for Watchlist */}
          <Card className="p-6 bg-card border-border rounded-2xl h-fit">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Your Market News
              </h2>
              <span className="text-xl">📰</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Latest market updates and news on stocks you're watching
            </p>

            {isLoadingNews ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : watchlistNews.length > 0 ? (
              <div className="space-y-4">
                {watchlistNews.map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors group"
                  >
                    {article.image && (
                      <img
                        src={article.image}
                        alt={article.headline}
                        className="w-20 h-20 object-cover rounded-xl shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-1">
                        {article.headline}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>
                          {new Date(article.datetime * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No news yet for your watchlist
                </p>
                <p className="text-sm text-muted-foreground">
                  Add some stocks to your portfolio to see personalized news here 💛
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Investment Rules Card */}
        <Card className="border-accent bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl">
          <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xl shadow-md">
                      🌺
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Pansy's Investment Rules</CardTitle>
                      <CardDescription className="mt-1">
                        Save these rules. Follow them every time. Discipline beats intelligence 💪
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      rulesOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-destructive flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      When Your Stock Drops:
                    </h4>
                    <div className="space-y-2 pl-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-foreground">Drop 10%?</span>
                        <span className="text-sm text-muted-foreground">Hold.</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-foreground">Drop 20%?</span>
                        <span className="text-sm text-muted-foreground">Buy 15% more.</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-foreground">Drop 30%?</span>
                        <span className="text-sm text-muted-foreground">Buy 30% more.</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      When Your Stock Rises:
                    </h4>
                    <div className="space-y-2 pl-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-foreground">Rise 30%?</span>
                        <span className="text-sm text-muted-foreground">Sell 10%.</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-foreground">Rise 50%?</span>
                        <span className="text-sm text-muted-foreground">Sell 30%.</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-foreground">Rise 100%?</span>
                        <span className="text-sm text-muted-foreground">Sell 60%.</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <p className="text-xs text-muted-foreground italic text-center">
                    No thinking. No emotion. Just execute the plan. The decision was already made before you entered the position. 🎯
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Disclaimer */}
        <Card className="p-4 bg-muted/50 border-border rounded-xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial
            advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}