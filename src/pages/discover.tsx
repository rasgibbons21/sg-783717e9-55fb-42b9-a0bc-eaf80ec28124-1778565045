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
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { userService } from "@/services/userService";
import { UpgradeBanner } from "@/components/UpgradeModal";

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
    pansyQuote: "Powering the AI revolution. Every tech company needs their chips.",
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
    pansyQuote: "Tracks the 500 biggest US companies. A foundational portfolio piece.",
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
    pansyQuote: "One of the lowest cost index funds. Perfect for set-and-forget accounts.",
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
        const response = await fetch("/api/pansy-picks");
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
    if (trend === "Bullish") return "bg-[#3d7a54]/10 text-[#3d7a54] border-[#3d7a54]/20";
    if (trend === "Bearish") return "bg-[#d4788a]/10 text-[#d4788a] border-[#d4788a]/20";
    return "bg-muted text-muted-foreground border-border";
  };

  const getRiskColor = (risk: string) => {
    if (risk === "Aggressive") return "bg-[#d4788a]/10 text-[#d4788a] border-[#d4788a]/20";
    if (risk === "Conservative") return "bg-[#3d7a54]/10 text-[#3d7a54] border-[#3d7a54]/20";
    return "bg-[#c8953a]/10 text-[#c8953a] border-[#c8953a]/20";
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
                            ? "bg-[#3d7a54]/20 text-[#3d7a54] text-xs"
                            : "bg-[#d4788a]/20 text-[#d4788a] text-xs"
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
            <Button
              size="sm"
              variant={activeFilter === "top-performers" ? "default" : "outline"}
              onClick={() => setActiveFilter("top-performers")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Top Performers
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "most-watched" ? "default" : "outline"}
              onClick={() => setActiveFilter("most-watched")}
            >
              Most Watched
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "pansy-picks" ? "default" : "outline"}
              onClick={() => setActiveFilter("pansy-picks")}
            >
              🌺 Pansy's Picks
            </Button>
          </div>
        </div>

        {/* Upgrade Banner - Hidden for Pro users */}
        {!isPro && (
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="etfs">ETFs</TabsTrigger>
            <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : displayAssets.length > 0 ? (
              <div className="space-y-3">
                {displayAssets.map((asset) => (
                  <AssetCard key={asset.ticker} asset={asset} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No stocks found</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="etfs" className="mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : displayAssets.length > 0 ? (
              <div className="space-y-3">
                {displayAssets.map((asset) => (
                  <AssetCard key={asset.ticker} asset={asset} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No ETFs found</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mutual-funds" className="mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : displayAssets.length > 0 ? (
              <div className="space-y-3">
                {displayAssets.map((asset) => (
                  <AssetCard key={asset.ticker} asset={asset} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No mutual funds found</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  return (
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
                      ? "bg-[#3d7a54]/20 text-[#3d7a54]"
                      : "bg-[#d4788a]/20 text-[#d4788a]"
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
  );
}

function getTrendColor(trend: string) {
  if (trend === "Bullish") return "bg-[#3d7a54]/10 text-[#3d7a54] border-[#3d7a54]/20";
  if (trend === "Bearish") return "bg-[#d4788a]/10 text-[#d4788a] border-[#d4788a]/20";
  return "bg-muted text-muted-foreground border-border";
}

function getRiskColor(risk: string) {
  if (risk === "Aggressive") return "bg-[#d4788a]/10 text-[#d4788a] border-[#d4788a]/20";
  if (risk === "Conservative") return "bg-[#3d7a54]/10 text-[#3d7a54] border-[#3d7a54]/20";
  return "bg-[#c8953a]/10 text-[#c8953a] border-[#c8953a]/20";
}