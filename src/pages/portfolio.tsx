import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { marketService } from "@/services/marketService";
import { notificationService } from "@/services/notificationService";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Plus, Trash2, Loader2, Bell, BellOff } from "lucide-react";

interface WatchlistItem {
  ticker: string;
  quote: any;
  loading: boolean;
}

export default function Portfolio() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTicker, setNewTicker] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState<any[]>([]);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("5");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getSession();
    if (!session) {
      router.push("/");
      return;
    }
    const profile = await authService.getProfile();
    setUser(profile);
    await loadWatchlist();
    await loadPriceAlerts();
  };

  const loadPriceAlerts = async () => {
    const session = await authService.getSession();
    if (!session) return;

    const alerts = await notificationService.getPriceAlerts(session.user.id);
    setPriceAlerts(alerts);
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
      setIsLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!newTicker.trim()) return;

    const ticker = newTicker.trim().toUpperCase();
    
    if (watchlist.some(item => item.ticker === ticker)) {
      setNewTicker("");
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

      setNewTicker("");
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

  const handleRemove = async (ticker: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("ticker", ticker);

      if (error) throw error;

      setWatchlist((prev) => prev.filter((item) => item.ticker !== ticker));
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  };

  const handleCreateAlert = async () => {
    if (!user?.id || !selectedTicker || !alertThreshold) return;

    const threshold = parseFloat(alertThreshold);
    if (isNaN(threshold) || threshold <= 0) {
      alert("Please enter a valid percentage");
      return;
    }

    const alert = await notificationService.createPriceAlert(
      user.id,
      selectedTicker,
      "price_change",
      threshold
    );

    if (alert) {
      await loadPriceAlerts();
      setShowAlertDialog(false);
      setSelectedTicker("");
      setAlertThreshold("5");
    } else {
      alert("Failed to create price alert. Please try again.");
    }
  };

  const getAlertForTicker = (ticker: string) => {
    return priceAlerts.find(
      (alert) => alert.ticker === ticker && alert.alert_type === "price_change"
    );
  };

  const toggleAlert = async (alertId: string, enabled: boolean) => {
    const success = await notificationService.toggleAlert(alertId, enabled);
    if (success) {
      await loadPriceAlerts();
    }
  };

  if (isLoading) {
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
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
              placeholder="Enter ticker (e.g., AAPL, VOO, SCHD)"
              className="flex-1 px-4 py-3 bg-popover border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isAddingNew}
            />
            <Button
              onClick={addToWatchlist}
              disabled={!newTicker.trim() || isAddingNew}
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

                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            item.quote?.dp >= 0
                              ? "bg-primary/10 text-primary"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {item.quote?.dp >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {item.quote?.dp?.toFixed(2)}%
                        </Badge>
                        {(() => {
                          const alert = getAlertForTicker(item.ticker);
                          return alert ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAlert(alert.id, !alert.enabled)}
                              className={
                                alert.enabled
                                  ? "text-accent hover:text-accent/80"
                                  : "text-muted-foreground hover:text-foreground"
                              }
                            >
                              {alert.enabled ? (
                                <Bell className="w-4 h-4" />
                              ) : (
                                <BellOff className="w-4 h-4" />
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTicker(item.ticker);
                                setShowAlertDialog(true);
                              }}
                              className="text-muted-foreground hover:text-accent"
                            >
                              <Bell className="w-4 h-4" />
                            </Button>
                          );
                        })()}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.ticker)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

        {/* Price Alert Dialog */}
        <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Set Price Alert for {selectedTicker}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Get notified when {selectedTicker} moves by this percentage in a single day
              </p>
              <div className="space-y-2">
                <Label htmlFor="threshold" className="text-foreground">
                  Price Change Threshold (%)
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  placeholder="5"
                  className="bg-background border-border text-foreground"
                  min="1"
                  max="50"
                  step="1"
                />
                <p className="text-xs text-muted-foreground">
                  You'll get a notification if the price moves up or down by {alertThreshold}% or more
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAlertDialog(false)}
                className="border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAlert}
                className="bg-primary hover:bg-primary/90"
              >
                Create Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="p-4 bg-muted/50 border-border/50 rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}