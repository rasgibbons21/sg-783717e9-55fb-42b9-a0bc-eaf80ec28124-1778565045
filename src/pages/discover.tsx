import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/authService";
import { TrendingUp, TrendingDown, ChevronRight, Eye, Star, Sparkles } from "lucide-react";

type AssetType = "Stocks" | "ETFs" | "Mutual Funds";
type FilterType = "Top Performers" | "Most Watched" | "Dahlia's Picks";

interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dahliaTake: string;
}

const DEFAULT_TICKERS = {
  Stocks: ["AAPL", "NVDA", "MSFT", "GOOGL", "TSLA", "AMZN", "META"],
  ETFs: ["VOO", "QQQ", "SCHD", "VTI", "JEPI", "SPY", "IVV"],
  "Mutual Funds": ["VFIAX", "FXAIX", "VTSAX", "SWPPX", "FZROX"],
};

const DAHLIA_INSIGHTS: Record<string, string> = {
  AAPL: "Everyone uses their products and the ecosystem locks people in. $162B in cash. Not going anywhere 💪",
  NVDA: "Powering the AI revolution. Every tech company needs their chips and only they can make them this good 🚀",
  VOO: "500 biggest US companies in one purchase. Bet on America as a whole instead of picking winners 🇺🇸",
  SCHD: "Pays you every quarter just to hold it. 3.8% dividend yield means $380 per year on $10k 💸",
  QQQ: "Top 100 tech companies. Higher risk but higher growth potential. For when you want more upside 📈",
  MSFT: "Cloud, AI, Xbox, LinkedIn. Microsoft is in everything now and growing in all directions 💻",
  TSLA: "Volatile but revolutionary. Electric vehicles plus energy storage plus AI. High risk high reward ⚡",
  GOOGL: "Search, YouTube, Android, Cloud. Printing money from ads and growing in AI. Dominant position 🎯",
  AMZN: "E-commerce king plus AWS cloud business. Two massive revenue streams. Prime locks in customers 📦",
  META: "Instagram, Facebook, WhatsApp. 3 billion users worldwide. Ad business is a money printer 📱",
  VTI: "Total US stock market. 4000+ companies. Ultimate diversification for long term wealth building 🌟",
  JEPI: "Monthly dividend income plus growth. Great for people who want regular cash flow 💰",
  SPY: "Original S&P 500 ETF. Tracks the 500 biggest companies. Classic long term bet on America 🇺🇸",
  IVV: "Another S&P 500 tracker. Slightly lower fees than SPY. Same companies just cheaper to own 💵",
  VFIAX: "Vanguard's S&P 500 mutual fund. Solid choice for retirement accounts. Low fees, proven track record 📊",
  FXAIX: "Fidelity's S&P 500 fund. Zero expense ratio means you keep all the growth. Can't beat free 🎉",
  VTSAX: "Total US market fund. 4000+ stocks. Set it and forget it for decades. Warren Buffett approved ✅",
  SWPPX: "Schwab's S&P 500 fund. Another solid no-fee option. Pick your favorite broker and stick with it 🏦",
  FZROX: "Fidelity Zero Total Market. Free index fund with everything. Great for beginners starting out 🌱",
};

const DAHLIAS_PICKS = ["VOO", "SCHD", "AAPL", "MSFT", "JEPI"];

const COMPANY_NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  NVDA: "NVIDIA Corporation",
  MSFT: "Microsoft Corporation",
  GOOGL: "Alphabet Inc.",
  TSLA: "Tesla Inc.",
  AMZN: "Amazon.com Inc.",
  META: "Meta Platforms Inc.",
  VOO: "Vanguard S&P 500 ETF",
  QQQ: "Invesco QQQ Trust",
  SCHD: "Schwab US Dividend Equity ETF",
  VTI: "Vanguard Total Stock Market ETF",
  JEPI: "JPMorgan Equity Premium Income ETF",
  SPY: "SPDR S&P 500 ETF Trust",
  IVV: "iShares Core S&P 500 ETF",
  VFIAX: "Vanguard 500 Index Fund",
  FXAIX: "Fidelity 500 Index Fund",
  VTSAX: "Vanguard Total Stock Market Index Fund",
  SWPPX: "Schwab S&P 500 Index Fund",
  FZROX: "Fidelity ZERO Total Market Index Fund",
};

export default function Discover() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<AssetType>("Stocks");
  const [activeFilter, setActiveFilter] = useState<FilterType>("Top Performers");
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    loadStocks();
  }, [activeTab, activeFilter]);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    const profile = await authService.getCurrentUser();
    setUser(profile);
  };

  const loadStocks = async () => {
    setLoading(true);
    try {
      let tickers: string[] = [];

      if (activeFilter === "Dahlia's Picks") {
        tickers = DAHLIAS_PICKS;
      } else {
        tickers = DEFAULT_TICKERS[activeTab];
      }

      const stockPromises = tickers.map(async (ticker) => {
        try {
          const response = await fetch(
            `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${process.env.NEXT_PUBLIC_POLYGON_API_KEY}`
          );
          const data = await response.json();

          if (data.ticker) {
            return {
              ticker: ticker,
              name: COMPANY_NAMES[ticker] || ticker,
              price: data.ticker.day?.c || data.ticker.prevDay?.c || 0,
              change: data.ticker.todaysChange || 0,
              changePercent: data.ticker.todaysChangePerc || 0,
              dahliaTake: DAHLIA_INSIGHTS[ticker] || "This is a solid option worth researching 💡",
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching ${ticker}:`, error);
          return null;
        }
      });

      const results = await Promise.all(stockPromises);
      const validStocks = results.filter((s): s is StockData => s !== null);

      // Sort by change percent for "Top Performers"
      if (activeFilter === "Top Performers") {
        validStocks.sort((a, b) => b.changePercent - a.changePercent);
      }

      setStocks(validStocks);
    } catch (error) {
      console.error("Error loading stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Discover - Bloom"
        description="Explore stocks, ETFs, and mutual funds with Dahlia's expert insights"
      />

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-serif text-foreground">Discover</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Explore investments with Dahlia's insights
            </p>
          </div>

          {/* Asset Type Tabs */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
            {(["Stocks", "ETFs", "Mutual Funds"] as AssetType[]).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveTab(tab);
                  setActiveFilter("Top Performers");
                }}
                className={activeTab === tab ? "bg-primary text-primary-foreground" : ""}
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar border-t border-border pt-3">
            {(["Top Performers", "Most Watched", "Dahlia's Picks"] as FilterType[]).map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="flex items-center gap-1"
              >
                {filter === "Top Performers" && <TrendingUp className="w-4 h-4" />}
                {filter === "Most Watched" && <Eye className="w-4 h-4" />}
                {filter === "Dahlia's Picks" && <Sparkles className="w-4 h-4" />}
                {filter}
              </Button>
            ))}
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Dahlia's Picks Message */}
          {activeFilter === "Dahlia's Picks" && (
            <Card className="p-4 border-accent bg-accent/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-xl flex-shrink-0">
                  🌺
                </div>
                <div>
                  <p className="text-sm text-foreground italic">
                    "These are my personal favorites right now sis. Do your own research but these are solid picks for most investing goals 🌸"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">— Dahlia</p>
                </div>
              </div>
            </Card>
          )}

          {/* Stock List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-16 bg-muted rounded"></div>
                </Card>
              ))}
            </div>
          ) : stocks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No stocks found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {stocks.map((stock) => (
                <Card
                  key={stock.ticker}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/stock/${stock.ticker}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-foreground">
                          {stock.ticker}
                        </h3>
                        {activeFilter === "Dahlia's Picks" && (
                          <Badge variant="secondary" className="bg-accent/20 text-accent border-accent">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Dahlia's Pick
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {stock.name}
                      </p>

                      {/* Dahlia's Take */}
                      <div className="bg-primary/5 border-l-2 border-primary pl-3 py-2 mt-3">
                        <p className="text-sm text-primary italic">
                          "{stock.dahliaTake}"
                        </p>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-lg font-semibold text-foreground">
                        ${stock.price.toFixed(2)}
                      </p>
                      <Badge
                        variant={stock.changePercent >= 0 ? "default" : "destructive"}
                        className={
                          stock.changePercent >= 0
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        }
                      >
                        {stock.changePercent >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-muted-foreground mt-2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Invest with Dahlia Education Section */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-3xl flex-shrink-0">
                🌺
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-serif text-foreground mb-2">
                  Invest with Dahlia
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  I break down every investment in plain English so you can make confident decisions. No jargon, no pressure — just real talk about your money.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs text-muted-foreground">Stock Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs text-muted-foreground">ETF Breakdowns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs text-muted-foreground">Market News</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs text-muted-foreground">Risk Insights</span>
                  </div>
                </div>
                <Link href="/subscription">
                  <Button size="sm" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white">
                    Upgrade to Bloom Pro
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Disclaimer */}
          <Card className="p-4 bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}