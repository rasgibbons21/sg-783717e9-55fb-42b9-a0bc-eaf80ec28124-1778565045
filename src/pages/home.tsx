/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import { TrendingUp, TrendingDown, ChevronDown, Clock } from "lucide-react";
import { TimeGreeting } from "@/components/TimeGreeting";
import { GemsLeaderboard } from "@/components/GemsLeaderboard";

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  error?: boolean;
}

// Default fallback data — symbols match getMarketIndices() (ETF proxies, free-tier safe)
const DEFAULT_MARKET_DATA: MarketIndex[] = [
  { symbol: "SPY", name: "S&P 500", price: 0, change: 0, changePercent: 0 },
  { symbol: "QQQ", name: "NASDAQ", price: 0, change: 0, changePercent: 0 },
  { symbol: "DIA", name: "DOW", price: 0, change: 0, changePercent: 0 },
  { symbol: "VIXY", name: "VIX", price: 0, change: 0, changePercent: 0 },
];


const HOME_MARKETS = [
  { name: "NYSE", tz: "America/New_York", open: 9.5, close: 16 },
  { name: "LSE", tz: "Europe/London", open: 8, close: 16.5 },
  { name: "TSE", tz: "Asia/Tokyo", open: 9, close: 15 },
];

function getHomeMarketInfo(tz: string, openH: number, closeH: number) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour: "numeric", minute: "numeric", hour12: false, weekday: "short",
  }).formatToParts(now);
  const h = parseInt(parts.find(p => p.type === "hour")?.value || "0");
  const m = parseInt(parts.find(p => p.type === "minute")?.value || "0");
  const weekday = parts.find(p => p.type === "weekday")?.value || "";

  const mins = h * 60 + m;
  const openMins = Math.round(openH * 60);
  const closeMins = Math.round(closeH * 60);

  const isWeekend = weekday === "Sat" || weekday === "Sun";
  const isOpen = !isWeekend && mins >= openMins && mins < closeMins;

  let countdown = "";
  if (isOpen) {
    const left = closeMins - mins;
    countdown = left >= 60 ? `${Math.floor(left / 60)}h ${left % 60}m to close` : `${left}m to close`;
  } else {
    let daysToAdd = 0;
    if (weekday === "Sat") daysToAdd = 2;
    else if (weekday === "Sun") daysToAdd = 1;
    else if (mins >= closeMins) daysToAdd = weekday === "Fri" ? 3 : 1;

    let toOpen: number;
    if (daysToAdd === 0) {
      toOpen = openMins - mins;
    } else {
      toOpen = (24 * 60 - mins) + (daysToAdd - 1) * 24 * 60 + openMins;
    }

    if (toOpen >= 24 * 60) {
      const d = Math.floor(toOpen / (24 * 60));
      const hr = Math.floor((toOpen % (24 * 60)) / 60);
      countdown = `${d}d ${hr}h to open`;
    } else {
      countdown = toOpen >= 60 ? `${Math.floor(toOpen / 60)}h ${toOpen % 60}m to open` : `${toOpen}m to open`;
    }
  }

  const localTime = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  return { isOpen, countdown, localTime };
}

function MarketClock() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="p-4 bg-card border-border rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Market Hours</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {HOME_MARKETS.map(mkt => {
          const info = getHomeMarketInfo(mkt.tz, mkt.open, mkt.close);
          return (
            <div key={mkt.name} className="text-center p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">{mkt.name}</p>
              <p className="text-sm font-mono font-semibold text-foreground">{info.localTime}</p>
              <Badge className={`mt-1.5 text-[10px] border-0 ${
                info.isOpen
                  ? "bg-[#49B06E]/15 text-[#49B06E]"
                  : "bg-muted text-muted-foreground"
              }`}>
                {info.isOpen ? "Open" : "Closed"}
              </Badge>
              <p className="text-[10px] text-muted-foreground mt-1">{info.countdown}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function Home() {
  const router = useRouter();
  const { isPro, userName, userId: ctxUserId } = useSubscription();
  const [user, setUser] = useState<any>(null);
  const [gems, setGems] = useState<number | null>(null);
  const [marketData, setMarketData] = useState<MarketIndex[]>(DEFAULT_MARKET_DATA);
  const [watchlistNews, setWatchlistNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isLoadingIndices, setIsLoadingIndices] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);

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

    // Derived gem total (single source: /api/gems)
    fetch("/api/gems", { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setGems(d.gems); })
      .catch(() => {});

    // Load data with timeout
    loadDataWithTimeout();
  };

  const loadDataWithTimeout = async () => {
    const timeoutId = setTimeout(() => {
      console.log("Home: Data loading timeout - using fallback data");
      setIsLoadingNews(false);
    }, 5000);

    try {
      await Promise.all([
        loadMarketData(),
        loadWatchlistNews(ctxUserId ?? ""),
        loadBriefing(),
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

  const loadBriefing = async () => {
    setBriefingLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/daily-briefing", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return; // hidden-card state — no error shown to user
      const data = await res.json();
      if (data.content) setBriefing(data.content);
    } catch {
      // silent — briefing is a nice-to-have, not a core feature
    } finally {
      setBriefingLoading(false);
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
            <TimeGreeting fullName={user?.full_name ?? userName} />
            <p className="text-muted-foreground mt-1">
              {isPro ? "Keep learning. Keep growing." : "Your daily market education"}
            </p>
          </div>
          {gems !== null && (
            <a
              href="/profile"
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 hover:bg-primary/15 transition-colors"
              title="Gems earned from completed lessons"
            >
              <span className="text-lg leading-none">💎</span>
              <span className="text-base font-bold text-foreground">{gems.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">gems</span>
            </a>
          )}
        </div>

        {/* Lessons / Gems Leaderboard */}
        <GemsLeaderboard />

        {/* Pansy Chat Bubble */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0 mt-1">
            <img src="/bloom-logo.png" alt="Pansy" className="w-16 h-16 rounded-full border-2 border-background shadow-sm object-cover bg-[#0E1B30]" />
            <div className="absolute bottom-0 right-1 bg-[#49B06E] w-4 h-4 rounded-full border-2 border-background"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 pl-1">
              <h3 className="font-serif font-bold text-foreground text-lg">Pansy</h3>
              <Badge variant="secondary" className="text-[10px] bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20 h-5 font-medium shadow-sm">
                Your guide
              </Badge>
            </div>
            <div className="bg-card backdrop-blur-sm p-4 rounded-2xl rounded-tl-sm shadow-sm inline-block border border-border">
              <p className="text-sm md:text-base text-foreground leading-relaxed">
                The market is always telling a story — my job is to help you learn to read it. I&apos;m here to explain what&apos;s happening, answer your questions, and help your confidence grow alongside your knowledge. What would you like to understand today? 💛
              </p>
            </div>
            <a
              href="/learn"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#49B06E] hover:bg-[#49B06E]/90 text-[#0E1B30] text-sm font-semibold transition-colors ml-1"
            >
              Explore lessons →
            </a>
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
                              ? "bg-[#49B06E]/10 text-[#49B06E] text-xs font-medium border-0"
                              : "bg-[#ef4444]/10 text-[#ef4444] text-xs font-medium border-0"
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

        {/* Market Hours Clock */}
        <MarketClock />

        {/* Morning Coffee with Pansy */}
        {(briefingLoading || briefing) && (
          <Card className="p-6 bg-card border-border rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-serif text-xl font-bold text-foreground">Morning Coffee with Pansy</h2>
              <span className="text-xl">☕</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Today&apos;s market context</p>
            {briefingLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <img
                  src="/pansy-coffee.png"
                  alt="Pansy"
                  className="w-10 h-10 rounded-full border border-border object-cover shrink-0 mt-0.5"
                />
                <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-4 py-3 border border-border">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{briefing}</p>
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Market Movers */}
          <Card className="p-6 bg-card border-border rounded-2xl h-fit">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Market Indices
            </h2>
            <div className="space-y-3">
              {marketData.filter(i => ["SPY","QQQ","DIA"].includes(i.symbol)).map((index) => (
                <div
                  key={index.symbol}
                  className="flex items-center justify-between p-3 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-foreground">{index.name}</p>
                    <p className="text-sm text-muted-foreground">{index.symbol}</p>
                  </div>
                  <div className="text-right">
                    {index.error ? (
                      <p className="text-sm font-medium text-destructive">Unavailable</p>
                    ) : (
                      <>
                        <p className="font-semibold text-foreground">
                          {index.price > 0 ? `$${index.price.toFixed(2)}` : "—"}
                        </p>
                        {index.price > 0 && index.changePercent !== 0 && (
                          <Badge
                            className={
                              index.changePercent >= 0
                                ? "bg-[#49B06E]/10 text-[#49B06E] border-0"
                                : "bg-[#ef4444]/10 text-[#ef4444] border-0"
                            }
                          >
                            {index.changePercent >= 0 ? "+" : ""}
                            {index.changePercent.toFixed(2)}%
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
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