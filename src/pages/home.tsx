import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { marketService } from "@/services/marketService";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import Link from "next/link";

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
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [stockPicks, setStockPicks] = useState<StockPick[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadMarketData();
    loadStockPicks();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }

    const userData = await userService.getCurrentUser();
    if (userData) {
      setUser(userData);
    }
    setIsLoading(false);
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