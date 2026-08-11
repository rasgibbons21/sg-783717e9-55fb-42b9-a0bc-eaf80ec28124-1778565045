/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { marketService } from "@/services/marketService";
import { Search, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { userService } from "@/services/userService";
import { supabase } from "@/integrations/supabase/client";
import { UpgradeBanner } from "@/components/UpgradeModal";
import { canShowExternalPayment } from "@/lib/payments";
import { PansyContextCard } from "@/components/PansyContextCard";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface Asset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: "stock" | "etf" | "mutual-fund";
  trend?: string;
  riskLevel?: string;
  pansyQuote?: string;
  error?: boolean;
}

interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  error?: boolean;
}

const STOCK_TICKERS = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "JPM", "V", "JNJ",
  "WMT", "BAC", "XOM", "UNH", "PG", "HD", "MA", "ABBV", "AVGO", "CRM"
];

const ETF_TICKERS = [
  "VOO", "QQQ", "SPY", "SCHD", "VTI", "IVV", "VGT", "ARKK", "SCHG", "VYM",
  "BND", "AGG", "GLD", "IWM", "JEPI"
];

const MUTUAL_FUND_TICKERS = [
  "FXAIX", "VTSAX", "VFIAX", "FCNTX", "PRGFX", "VWELX", "FDGRX", "AGTHX", "DODFX", "VBTLX"
];

const ASSET_NAMES: Record<string, string> = {
  "AAPL": "Apple Inc.", "MSFT": "Microsoft", "NVDA": "NVIDIA", "GOOGL": "Alphabet", 
  "AMZN": "Amazon", "META": "Meta Platforms", "TSLA": "Tesla", "JPM": "JPMorgan Chase", 
  "V": "Visa", "JNJ": "Johnson & Johnson", "WMT": "Walmart", "BAC": "Bank of America", 
  "XOM": "Exxon Mobil", "UNH": "UnitedHealth", "PG": "Procter & Gamble", "HD": "Home Depot", 
  "MA": "Mastercard", "ABBV": "AbbVie", "AVGO": "Broadcom", "CRM": "Salesforce",
  "VOO": "Vanguard S&P 500 ETF", "QQQ": "Invesco QQQ Trust", "SPY": "SPDR S&P 500 ETF",
  "SCHD": "Schwab US Dividend Equity ETF", "VTI": "Vanguard Total Stock Market ETF", 
  "IVV": "iShares Core S&P 500 ETF", "VGT": "Vanguard Information Tech ETF", 
  "ARKK": "ARK Innovation ETF", "SCHG": "Schwab US Large-Cap Growth ETF", 
  "VYM": "Vanguard High Dividend Yield ETF", "BND": "Vanguard Total Bond Market ETF", 
  "AGG": "iShares Core US Aggregate Bond ETF", "GLD": "SPDR Gold Shares", 
  "IWM": "iShares Russell 2000 ETF", "JEPI": "JPMorgan Equity Premium Income ETF",
  "FXAIX": "Fidelity 500 Index Fund", "VTSAX": "Vanguard Total Stock Market Index Fund", 
  "VFIAX": "Vanguard 500 Index Fund", "FCNTX": "Fidelity Contrafund", 
  "PRGFX": "T. Rowe Price Growth Stock Fund", "VWELX": "Vanguard Wellington Fund", 
  "FDGRX": "Fidelity Growth Company Fund", "AGTHX": "The Growth Fund of America", 
  "DODFX": "Dodge & Cox International Stock Fund", "VBTLX": "Vanguard Total Bond Market Index Fund"
};

const PANSYS_DEFAULT_PICKS: Asset[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 0,
    change: 0,
    changePercent: 0,
    type: "stock",
    trend: "Bullish",
    riskLevel: "Aggressive",
    pansyQuote: "At the center of the AI boom and its chip demand — but richly valued and sharply volatile when sentiment turns.",
  },
  {
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    price: 0,
    change: 0,
    changePercent: 0,
    type: "etf",
    trend: "Bullish",
    riskLevel: "Moderate",
    pansyQuote: "A low-cost way to own 500 large US companies at once — broadly diversified, though it still falls with the whole market.",
  },
  {
    ticker: "FXAIX",
    name: "Fidelity 500 Index Fund",
    price: 0,
    change: 0,
    changePercent: 0,
    type: "mutual-fund",
    trend: "Sideways",
    riskLevel: "Conservative",
    pansyQuote: "A very low-cost S&P 500 index fund built for set-and-forget — steady, but with no protection from broad market downturns.",
  },
];

export default function Discover() {
  const router = useRouter();
  const { isPro } = useSubscription();
  const [activeTab, setActiveTab] = useState("stocks");
  const [activeFilter, setActiveFilter] = useState("top-performers");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [stocks, setStocks] = useState<Asset[]>([]);
  const [etfs, setEtfs] = useState<Asset[]>([]);
  const [mutualFunds, setMutualFunds] = useState<Asset[]>([]);
  const [pansysPicks, setPansysPicks] = useState<Asset[]>(PANSYS_DEFAULT_PICKS);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPicks, setIsLoadingPicks] = useState(false);
  const [isLoadingIndices, setIsLoadingIndices] = useState(true);

  useEffect(() => {
    const checkUserPlan = async () => {
      const user = await userService.getCurrentUser();
      if (user) {
        // Default to free plan since plan_type doesn't exist in profiles
        setUserPlan("free");
      }
    };
    checkUserPlan();
    loadMarketIndices();
    loadMarketData();
  }, []);

  useEffect(() => {
    if (activeFilter === "pansy-picks") {
      loadPansysPicks();
    }
  }, [activeFilter]);

  const loadMarketIndices = async () => {
    setIsLoadingIndices(true);
    try {
      const indexData = await marketService.getMarketIndices();
      setMarketIndices(indexData.map(i => ({
        ...i,
        value: i.price, // Map price back to value for existing UI
      })));
    } catch (error) {
      console.error("Error loading market indices:", error);
    } finally {
      setIsLoadingIndices(false);
    }
  };

  const loadMarketData = async () => {
    setIsLoading(true);
    try {
      // Load stocks
      const stockData: Asset[] = [];
      for (const ticker of STOCK_TICKERS) {
        try {
          const quote = await marketService.getRealTimeQuote(ticker);
          const hasError = !quote || quote.c === 0;
          stockData.push({
            ticker,
            name: ASSET_NAMES[ticker] || ticker,
            price: quote?.c || 0,
            change: quote?.d || 0,
            changePercent: quote?.dp || 0,
            type: "stock",
            trend: getTrend(quote?.dp || 0),
            riskLevel: getRiskLevel(ticker, "stock"),
            error: hasError
          });
        } catch (error) {
          console.error(`Error loading ${ticker}:`, error);
        }
      }
      setStocks(stockData);

      // Load ETFs
      const etfData: Asset[] = [];
      for (const ticker of ETF_TICKERS) {
        try {
          const quote = await marketService.getRealTimeQuote(ticker);
          const hasError = !quote || quote.c === 0;
          etfData.push({
            ticker,
            name: ASSET_NAMES[ticker] || ticker,
            price: quote?.c || 0,
            change: quote?.d || 0,
            changePercent: quote?.dp || 0,
            type: "etf",
            trend: getTrend(quote?.dp || 0),
            riskLevel: getRiskLevel(ticker, "etf"),
            error: hasError
          });
        } catch (error) {
          console.error(`Error loading ${ticker}:`, error);
        }
      }
      setEtfs(etfData);

      // Load Mutual Funds
      const mfData: Asset[] = [];
      for (const ticker of MUTUAL_FUND_TICKERS) {
        try {
          const quote = await marketService.getRealTimeQuote(ticker);
          const hasError = !quote || quote.c === 0;
          mfData.push({
            ticker,
            name: ASSET_NAMES[ticker] || ticker,
            price: quote?.c || 0,
            change: quote?.d || 0,
            changePercent: quote?.dp || 0,
            type: "mutual-fund",
            trend: getTrend(quote?.dp || 0),
            riskLevel: getRiskLevel(ticker, "mutual-fund"),
            error: hasError
          });
        } catch (error) {
          console.error(`Error loading ${ticker}:`, error);
        }
      }
      setMutualFunds(mfData);
    } catch (error) {
      console.error("Error loading market data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPansysPicks = async () => {
    setIsLoadingPicks(true);
    try {
      // Load live prices for default picks sequentially
      const defaultPicksWithPrices = [];
      for (const pick of PANSYS_DEFAULT_PICKS) {
        try {
          const quote = await marketService.getRealTimeQuote(pick.ticker);
          const hasError = !quote || quote.c === 0;
          defaultPicksWithPrices.push({
            ...pick,
            price: quote?.c || pick.price,
            change: quote?.d || pick.change,
            changePercent: quote?.dp || pick.changePercent,
            error: hasError
          });
        } catch (error) {
          defaultPicksWithPrices.push({ ...pick, error: true });
        }
      }

      // Try to get additional picks from API
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch("/api/pansy-picks", {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        });
        if (response.ok) {
          const additionalPicks = await response.json();
          const processedAdditionalPicks = additionalPicks.map((p: any) => ({
            ...p,
            error: !p.price || p.price === 0
          }));
          setPansysPicks([...defaultPicksWithPrices, ...processedAdditionalPicks]);
        } else {
          setPansysPicks(defaultPicksWithPrices);
        }
      } catch (error) {
        console.error("Error loading additional picks:", error);
        setPansysPicks(defaultPicksWithPrices);
      }
    } catch (error) {
      console.error("Error loading Pansy's picks:", error);
      setPansysPicks(PANSYS_DEFAULT_PICKS);
    } finally {
      setIsLoadingPicks(false);
    }
  };

  const getTrend = (changePercent: number): string => {
    if (changePercent > 1) return "Bullish";
    if (changePercent < -1) return "Bearish";
    return "Sideways";
  };

  const getRiskLevel = (ticker: string, type: string): string => {
    // Aggressive risk tickers
    const aggressive = ["NVDA", "TSLA", "ARKK", "QQQ", "AVGO", "META"];
    // Conservative risk tickers
    const conservative = ["JNJ", "PG", "WMT", "BND", "AGG", "VBTLX", "VWELX"];
    
    if (aggressive.includes(ticker)) return "Aggressive";
    if (conservative.includes(ticker)) return "Conservative";
    return "Moderate";
  };

  const getDisplayAssets = (): Asset[] => {
    let assets: Asset[] = [];
    
    if (activeTab === "stocks") assets = stocks;
    else if (activeTab === "etfs") assets = etfs;
    else if (activeTab === "mutual-funds") assets = mutualFunds;

    // Apply filter
    if (activeFilter === "top-performers") {
      assets = [...assets].sort((a, b) => b.changePercent - a.changePercent);
    } else if (activeFilter === "most-watched") {
      // For now, show all - can be enhanced with actual analytics
      assets = [...assets];
    } else if (activeFilter === "pansy-picks") {
      return pansysPicks.filter(p => {
        if (activeTab === "stocks") return p.type === "stock";
        if (activeTab === "etfs") return p.type === "etf";
        if (activeTab === "mutual-funds") return p.type === "mutual-fund";
        return false;
      });
    }

    // Apply search filter
    if (searchQuery) {
      assets = assets.filter(
        (asset) =>
          asset.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return assets;
  };

  const displayAssets = getDisplayAssets();

  const getTrendColor = (trend: string) => {
    if (trend === "Bullish") return "bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20";
    if (trend === "Bearish") return "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20";
    return "bg-muted text-muted-foreground border-border";
  };

  const getRiskColor = (risk: string) => {
    if (risk === "Aggressive") return "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20";
    if (risk === "Conservative") return "bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20";
    return "bg-[#27B7C8]/10 text-[#27B7C8] border-[#27B7C8]/20";
  };

  return (
    <Layout>
      <SEO
        title="Discover Investments | Bloom"
        description="Explore stocks, ETFs, and mutual funds with Pansy's expert analysis"
      />
      <div className="container-full py-8 space-y-6 pb-24">
        {/* Market Summary Bar */}
        <Card className="p-4 bg-card border-border rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoadingIndices ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))
            ) : marketIndices.map((index) => (
              <div key={index.symbol} className="space-y-1">
                <p className="text-sm text-muted-foreground">{index.name}</p>
                {index.error ? (
                  <p className="font-semibold text-destructive text-sm mt-2">Data unavailable</p>
                ) : (
                  <>
                    <p className="font-semibold text-foreground">
                      {index.value > 0 ? index.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                    </p>
                    {index.value > 0 && (
                      <Badge
                        className={
                          index.changePercent >= 0
                            ? "bg-[#49B06E]/20 text-[#49B06E] text-xs"
                            : "bg-[#ef4444]/20 text-[#ef4444] text-xs"
                        }
                      >
                        {index.changePercent >= 0 ? "+" : ""}
                        {index.changePercent.toFixed(2)}%
                      </Badge>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Header */}
        <div className="space-y-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Discover
          </h1>

          <PansyContextCard
            message="This is your research playground! Browse real market data, explore Pansy's Picks for curated ideas, or search for any company you're curious about."
            tip="Tip: Try the 'Pansy's Picks' filter to see investments I've hand-picked with beginner-friendly analysis."
            variant="tip"
            compact
          />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by ticker or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: "top-performers", label: "Top Performers", icon: <TrendingUp className="w-4 h-4 mr-2" /> },
              { key: "most-watched", label: "Most Watched", icon: null },
              { key: "pansy-picks", label: "🌺 Pansy's Analyses", icon: null },
            ].map((f) => (
              <motion.div key={f.key} whileTap={{ scale: 0.92 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                <Button
                  size="sm"
                  variant={activeFilter === f.key ? "default" : "outline"}
                  onClick={() => { setActiveFilter(f.key); haptic(); }}
                >
                  {f.icon}{f.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upgrade Banner - Hidden for Pro users and non-Stripe builds */}
        {!isPro && canShowExternalPayment && (
          <Card className="p-5 bg-gradient-to-br from-accent/20 to-primary/10 border-accent rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl shrink-0">
                🌺
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">
                  Want Pansy's full breakdown on every stock? Upgrade to Pro 🌸
                </p>
              </div>
              <Link href="/subscription">
                <Button className="bg-accent hover:bg-accent/90 text-white shrink-0">
                  Upgrade
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-300">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
            <span className="text-muted-foreground text-sm">Loading market data...</span>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="etfs">ETFs</TabsTrigger>
                <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
              </TabsList>

              {(["stocks", "etfs", "mutual-funds"] as const).map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-6">
                  {displayAssets.length > 0 ? (
                    <div className="space-y-3">
                      {displayAssets.map((asset, i) => (
                        <motion.div
                          key={asset.ticker}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.04, 0.4), type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <AssetCard asset={asset} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No {tab === "stocks" ? "stocks" : tab === "etfs" ? "ETFs" : "mutual funds"} found
                      </p>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>
    </Layout>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
    <Card className="p-4 hover:bg-muted/50 transition-colors border-border rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/stock/${asset.ticker}`} className="flex-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-foreground text-lg">
                {asset.ticker}
              </p>
              <Badge variant="outline" className="text-xs">
                {asset.type === "stock" ? "Stock" : asset.type === "etf" ? "ETF" : "Mutual Fund"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{asset.name}</p>
          </div>
        </Link>
        <div className="text-right">
          {asset.error ? (
            <p className="text-sm font-medium text-destructive mt-1">Data unavailable</p>
          ) : (
            <>
              <p className="font-semibold text-foreground">
                ${asset.price.toFixed(2)}
              </p>
              {asset.price > 0 && (
                <Badge
                  className={
                    asset.changePercent >= 0
                      ? "bg-[#49B06E]/20 text-[#49B06E]"
                      : "bg-[#ef4444]/20 text-[#ef4444]"
                  }
                >
                  {asset.changePercent >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {asset.changePercent >= 0 ? "+" : ""}
                  {asset.changePercent.toFixed(2)}%
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Trend and Risk Badges */}
      {(asset.trend || asset.riskLevel) && (
        <div className="flex gap-2 mb-3">
          {asset.trend && (
            <Badge className={`text-xs font-normal ${getTrendColor(asset.trend)}`}>
              Trend: {asset.trend}
            </Badge>
          )}
          {asset.riskLevel && (
            <Badge className={`text-xs font-normal ${getRiskColor(asset.riskLevel)}`}>
              Risk: {asset.riskLevel}
            </Badge>
          )}
        </div>
      )}

      {/* Pansy's Quote */}
      {asset.pansyQuote && (
        <Link href={`/stock/${asset.ticker}`}>
          <Card className="p-3 bg-accent/5 border-accent/20 rounded-lg flex gap-3 items-start mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xs shrink-0 mt-0.5">
              🌺
            </div>
            <p className="text-sm italic text-foreground leading-relaxed">
              "{asset.pansyQuote}"
            </p>
          </Card>
        </Link>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link href={`/stock/${asset.ticker}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Full Analysis
          </Button>
        </Link>
        <Link href={`/compare?tickers=${asset.ticker}`}>
          <Button variant="outline" size="sm">
            Compare
          </Button>
        </Link>
      </div>
    </Card>
    </motion.div>
  );
}

function getTrendColor(trend: string) {
  if (trend === "Bullish") return "bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20";
  if (trend === "Bearish") return "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20";
  return "bg-muted text-muted-foreground border-border";
}

function getRiskColor(risk: string) {
  if (risk === "Aggressive") return "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20";
  if (risk === "Conservative") return "bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20";
  return "bg-[#27B7C8]/10 text-[#27B7C8] border-[#27B7C8]/20";
}