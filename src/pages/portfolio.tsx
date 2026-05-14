import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/authService";
import { marketService } from "@/services/marketService";
import { TrendingUp, TrendingDown, Plus, Trash2, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import Link from "next/link";

interface WatchlistItem {
  ticker: string;
  quote: any;
  loading: boolean;
}

export default function Portfolio() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTicker, setAddingTicker] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    setLoading(true);
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    await loadWatchlist();
  };

  const loadWatchlist = async () => {
    try {
      const saved = localStorage.getItem("bloom_watchlist");
      const savedTickers = saved ? JSON.parse(saved) : ["AAPL", "GOOGL", "MSFT"];
      
      const items: WatchlistItem[] = savedTickers.map((ticker: string) => ({
        ticker,
        quote: null,
        loading: true,
      }));
      
      setWatchlist(items);

      for (let i = 0; i < items.length; i++) {
        const quote = await marketService.getRealTimeQuote(items[i].ticker);
        setWatchlist(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], quote, loading: false };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error loading watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!addingTicker.trim()) return;

    const ticker = addingTicker.trim().toUpperCase();
    
    if (watchlist.some(item => item.ticker === ticker)) {
      setAddingTicker("");
      setIsAddingNew(false);
      return;
    }

    setIsAddingNew(true);
    try {
      const quote = await marketService.getRealTimeQuote(ticker);
      if (!quote) {
        alert("Invalid ticker symbol");
        setIsAddingNew(false);
        return;
      }

      const newItem: WatchlistItem = { ticker, quote, loading: false };
      const updatedList = [...watchlist, newItem];
      setWatchlist(updatedList);

      const tickers = updatedList.map(item => item.ticker);
      localStorage.setItem("bloom_watchlist", JSON.stringify(tickers));

      setAddingTicker("");
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      alert("Failed to add ticker to watchlist");
    } finally {
      setIsAddingNew(false);
    }
  };

  const removeFromWatchlist = async (ticker: string) => {
    const updatedList = watchlist.filter(item => item.ticker !== ticker);
    setWatchlist(updatedList);

    const tickers = updatedList.map(item => item.ticker);
    localStorage.setItem("bloom_watchlist", JSON.stringify(tickers));
  };

  if (loading) {
    return (
      <Layout>
        <SEO title="Watchlist - Bloom" description="Track your investment watchlist" />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Watchlist - Bloom" description="Track stocks and ETFs you're interested in" />
      
      <div className="container-full py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-bold text-foreground">Your Watchlist</h1>
          <p className="text-muted-foreground text-lg">Track stocks and ETFs you're interested in</p>
        </div>

        <Card className="p-5 bg-card border-border rounded-2xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={addingTicker}
              onChange={(e) => setAddingTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
              placeholder="Enter ticker (e.g., AAPL, VOO, SCHD)"
              className="flex-1 px-4 py-3 bg-popover border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isAddingNew}
            />
            <Button
              onClick={addToWatchlist}
              disabled={!addingTicker.trim() || isAddingNew}
              className="gap-2 rounded-xl px-6 bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isAddingNew ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Add
            </Button>
          </div>
        </Card>

        {watchlist.length === 0 ? (
          <Card className="p-12 bg-card border-border rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">Your watchlist is empty</h3>
              <p className="text-muted-foreground">Add some stocks above to start tracking them!</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((item) => (
              <Link
                key={item.ticker}
                href={`/stock/${item.ticker}`}
                className="block"
              >
                <Card className="p-5 bg-card border-border rounded-2xl hover:border-accent/50 transition-all h-full">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-xl text-foreground">{item.ticker}</h3>
                          {item.loading ? (
                            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                          ) : item.quote?.dp !== undefined ? (
                            <Badge
                              className={`text-xs ${
                                item.quote.dp >= 0
                                  ? "bg-primary/20 text-primary hover:bg-primary/20"
                                  : "bg-rose/20 text-rose hover:bg-rose/20"
                              }`}
                            >
                              {item.quote.dp >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {item.quote.dp >= 0 ? "+" : ""}{item.quote.dp.toFixed(2)}%
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromWatchlist(item.ticker);
                        }}
                        className="text-muted-foreground hover:text-rose -mr-2 -mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {item.loading ? (
                      <div className="h-10 w-24 bg-muted rounded animate-pulse" />
                    ) : item.quote ? (
                      <div className="space-y-1">
                        <p className="text-3xl font-bold text-foreground tabular-nums">
                          ${item.quote.c.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2">
                          {item.quote.d >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-primary" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-rose" />
                          )}
                          <span className={`text-sm font-semibold tabular-nums ${item.quote.d >= 0 ? "text-primary" : "text-rose"}`}>
                            {item.quote.d >= 0 ? "+" : ""}{item.quote.d.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No data</span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <Card className="p-5 bg-accent/10 border-accent/30 rounded-2xl">
          <div className="flex gap-4">
            <img
              src="/bloom-logo.png"
              alt="Dahlia"
              className="h-12 w-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-semibold">Tip from Dahlia:</span> Building a watchlist is a great way to research before you invest. Take your time, read the news, and see how stocks move over a few weeks! No rush girl 💛
              </p>
              <Button
                variant="outline"
                className="w-full rounded-xl border-accent text-accent hover:bg-accent/10"
                onClick={() => router.push("/discover")}
              >
                Discover More Stocks
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/50 border-border/50 rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}