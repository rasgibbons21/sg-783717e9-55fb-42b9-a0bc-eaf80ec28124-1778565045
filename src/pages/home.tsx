import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { marketService } from "@/services/marketService";
import { TrendingUp, TrendingDown, ArrowRight, ChevronRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockPick {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dahliaQuote: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [stockPicks, setStockPicks] = useState<StockPick[]>([]);
  const [watchlistNews, setWatchlistNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    const profile = await authService.getCurrentUser();
    setUser(profile);
    await loadMarketData();
    await loadStockPicks();
    await loadWatchlistNews(session.user.id);
  };

  const loadWatchlistNews = async (userId: string) => {
    setIsLoadingNews(true);
    try {
      // Get user's watchlist
      const { data: watchlist, error } = await supabase
        .from("watchlist")
        .select("ticker")
        .eq("user_id", userId)
        .limit(5);

      if (error) throw error;

      if (!watchlist || watchlist.length === 0) {
        setWatchlistNews([]);
        setIsLoadingNews(false);
        return;
      }

      // Fetch news for each ticker
      const newsPromises = watchlist.map(async (item) => {
        const response = await fetch(
          `https://finnhub.io/api/v1/company-news?symbol=${item.ticker}&from=${
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          }&to=${new Date().toISOString().split("T")[0]}&token=${
            process.env.NEXT_PUBLIC_FINNHUB_API_KEY
          }`
        );
        const newsData = await response.json();
        return Array.isArray(newsData) ? newsData.slice(0, 2) : [];
      });

      const allNews = await Promise.all(newsPromises);
      const flatNews = allNews.flat().sort((a, b) => b.datetime - a.datetime).slice(0, 6);
      setWatchlistNews(flatNews);
    } catch (error) {
      console.error("Error loading watchlist news:", error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const loadMarketData = async () => {
    try {
      const indices = ["^GSPC", "^IXIC", "^DJI", "^VIX"];
      const data = await Promise.all(
        indices.map(async (symbol) => {
          const quote = await marketService.getRealTimeQuote(symbol);
          return {
            symbol: symbol.replace("^", ""),
            name:
              symbol === "^GSPC"
                ? "S&P 500"
                : symbol === "^IXIC"
                ? "NASDAQ"
                : symbol === "^DJI"
                ? "DOW"
                : "VIX",
            price: quote?.c || 0,
            change: quote?.d || 0,
            changePercent: quote?.dp || 0,
          };
        })
      );
      setMarketData(data);
    } catch (error) {
      console.error("Error loading market data:", error);
    }
  };

  const loadStockPicks = async () => {
    const picks: StockPick[] = [
      {
        ticker: "SCHD",
        name: "Schwab US Dividend Equity ETF",
        price: 0,
        change: 0,
        changePercent: 0,
        dahliaQuote:
          "SCHD is literally paying you every quarter just to hold it. It's like getting a bonus at work but from your investment. Dividend yield is 3.8% right now which is solid 💅",
      },
      {
        ticker: "VOO",
        name: "Vanguard S&P 500 ETF",
        price: 0,
        change: 0,
        changePercent: 0,
        dahliaQuote:
          "VOO tracks the 500 biggest US companies. Think of it like betting on America as a whole instead of picking winners. Been going up for decades sis 📈",
      },
      {
        ticker: "AAPL",
        name: "Apple Inc.",
        price: 0,
        change: 0,
        changePercent: 0,
        dahliaQuote:
          "AAPL - you already know this one. Everyone uses their products, the ecosystem locks people in, and they have $162B in cash. That's not going anywhere 💪",
      },
    ];

    try {
      const updatedPicks = await Promise.all(
        picks.map(async (pick) => {
          const quote = await marketService.getRealTimeQuote(pick.ticker);
          return {
            ...pick,
            price: quote?.c || 0,
            change: quote?.d || 0,
            changePercent: quote?.dp || 0,
          };
        })
      );
      setStockPicks(updatedPicks);
    } catch (error) {
      console.error("Error loading stock picks:", error);
      setStockPicks(picks);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Home - Bloom" description="Your personalized investment dashboard" />
      <div className="container-full py-6 space-y-6">
        {/* Market Summary Bar */}
        <Card className="p-4 bg-card border-border rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketData.map((market) => (
              <div key={market.symbol} className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  {market.name}
                </p>
                <p className="text-lg font-bold text-foreground tabular-nums">
                  {formatPrice(market.price)}
                </p>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    market.change >= 0 ? "text-primary" : "text-rose"
                  }`}
                >
                  {market.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="tabular-nums">
                    {market.change >= 0 ? "+" : ""}
                    {market.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Greeting */}
        <div>
          <h1 className="font-serif text-4xl font-bold text-foreground">
            {getGreeting()}, {user?.full_name?.split(" ")[0] || "there"} 🌸
          </h1>
          {user?.plan_type === "pro" && (
            <Badge className="mt-2 bg-accent text-accent-foreground">
              Bloom Pro
            </Badge>
          )}
        </div>

        {/* Dahlia's Message */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src="/bloom-logo.png"
                  alt="Dahlia"
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary border-2 border-card"></div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Dahlia</h3>
                <Badge
                  variant="outline"
                  className="text-xs border-primary text-primary"
                >
                  Available 24/7
                </Badge>
              </div>
              <div className="bg-popover p-4 rounded-2xl rounded-tl-none border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  Welcome back {user?.full_name?.split(" ")[0] || "sis"} 🌸 I've
                  been watching the market and I've got some solid picks ready for
                  you. Everything's looking pretty stable today — perfect time to
                  review your portfolio 💛
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Market Movers */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Market Movers
          </h2>
          <div className="space-y-3">
            {stockPicks.slice(0, 5).map((stock) => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.ticker}`}
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors group"
              >
                <div>
                  <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {stock.ticker}
                  </p>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    ${stock.price.toFixed(2)}
                  </p>
                  <Badge
                    className={
                      stock.changePercent >= 0
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }
                  >
                    {stock.changePercent >= 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Market News for Watchlist */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Your Market News
            </h2>
            <span className="text-xl">📰</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Latest updates on the stocks you're watching
          </p>

          {isLoadingNews ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
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
                  className="flex gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors group"
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.headline}
                      className="w-20 h-20 object-cover rounded-lg"
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

        {/* Dahlia's Picks Today */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Dahlia's Picks Today
            </h2>
            <Link href="/discover">
              <Button variant="ghost" size="sm" className="text-accent">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockPicks.map((pick) => (
              <Card
                key={pick.ticker}
                className="p-5 bg-card border-border rounded-2xl hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => router.push(`/stock/${pick.ticker}`)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">
                        {pick.ticker}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {pick.name}
                      </p>
                    </div>
                    <Badge
                      variant={pick.changePercent >= 0 ? "default" : "destructive"}
                      className={
                        pick.changePercent >= 0
                          ? "bg-primary/20 text-primary hover:bg-primary/20"
                          : "bg-rose/20 text-rose hover:bg-rose/20"
                      }
                    >
                      {pick.changePercent >= 0 ? "+" : ""}
                      {pick.changePercent.toFixed(2)}%
                    </Badge>
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                      {formatPrice(pick.price)}
                    </p>
                    <p
                      className={`text-sm font-semibold tabular-nums ${
                        pick.change >= 0 ? "text-primary" : "text-rose"
                      }`}
                    >
                      {pick.change >= 0 ? "+" : ""}
                      {formatPrice(pick.change)} today
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      {pick.dahliaQuote}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full text-accent hover:text-accent hover:bg-accent/10"
                  >
                    Read Dahlia's take
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="p-4 bg-muted border-border/50 rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Educational content only. Not financial advice. Bloom is not liable for
            any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}