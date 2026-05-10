import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/authService";
import { marketService, Quote } from "@/services/marketService";
import { TrendingUp, TrendingDown, Plus, Trash2, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import Link from "next/link";

interface WatchlistItem {
  ticker: string;
  quote: Quote | null;
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
        const quote = await marketService.getQuote(items[i].ticker);
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
    
    // Check if already in watchlist
    if (watchlist.some(item => item.ticker === ticker)) {
      setAddingTicker("");
      setIsAddingNew(false);
      return;
    }

    setIsAddingNew(true);
    try {
      // Validate ticker by fetching quote
      const quote = await marketService.getQuote(ticker);
      if (!quote) {
        alert("Invalid ticker symbol");
        setIsAddingNew(false);
        return;
      }

      // Add to watchlist
      const newItem: WatchlistItem = { ticker, quote, loading: false };
      const updatedList = [...watchlist, newItem];
      setWatchlist(updatedList);

      // Save to localStorage
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

    // Save to localStorage
    const tickers = updatedList.map(item => item.ticker);
    localStorage.setItem("bloom_watchlist", JSON.stringify(tickers));
  };

  if (loading) {
    return (
      <Layout>
        <SEO title="Portfolio - Bloom" description="Track your investment watchlist" />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Portfolio - Bloom" description="Track your investment watchlist" />
      
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Your Watchlist</h1>
          <p className="text-muted-foreground mt-1">Track stocks and ETFs you're interested in</p>
        </div>

        {/* Add New Stock */}
        <Card className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={addingTicker}
              onChange={(e) => setAddingTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
              placeholder="Enter ticker (e.g., AAPL)"
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isAddingNew}
            />
            <Button
              onClick={addToWatchlist}
              disabled={!addingTicker.trim() || isAddingNew}
              className="gap-2"
            >
              {isAddingNew ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add
            </Button>
          </div>
        </Card>

        {/* Watchlist Items */}
        {watchlist.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Your watchlist is empty</p>
            <p className="text-sm text-muted-foreground">Add some stocks above to get started tracking them!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {watchlist.map((item) => (
              <Link
                key={item.ticker}
                href={`/stock/${item.ticker}`}
                className="block"
              >
                <Card className="p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{item.ticker}</h3>
                        {item.loading ? (
                          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                        ) : item.quote?.dp !== undefined ? (
                          <Badge
                            variant={item.quote.dp >= 0 ? "default" : "destructive"}
                            className="gap-1"
                          >
                            {item.quote.dp >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {item.quote.dp >= 0 ? "+" : ""}{item.quote.dp.toFixed(2)}%
                          </Badge>
                        ) : null}
                      </div>
                      
                      {item.loading ? (
                        <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                      ) : item.quote ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-semibold text-foreground">
                            ${item.quote.c.toFixed(2)}
                          </span>
                          <span className={`text-sm ${item.quote.d >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {item.quote.d >= 0 ? "+" : ""}{item.quote.d.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No data</span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromWatchlist(item.ticker);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground mb-3">
            💡 <span className="font-medium">Tip from Dahlia:</span> Building a watchlist is a great way to research before you invest. Take your time, read the news, and see how stocks move over a few weeks!
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/discover")}
          >
            Discover More Stocks
          </Button>
        </Card>
      </div>
    </Layout>
  );
}