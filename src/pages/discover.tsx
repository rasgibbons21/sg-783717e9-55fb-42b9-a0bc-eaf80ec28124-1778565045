import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { marketService } from "@/services/marketService";
import { TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";

type AssetType = "stocks" | "etfs" | "mutual-funds";
type FilterType = "top-performers" | "most-watched" | "dahlias-picks";

interface Asset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function Discover() {
  const [activeTab, setActiveTab] = useState<AssetType>("stocks");
  const [activeFilter, setActiveFilter] = useState<FilterType>("top-performers");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, [activeTab, activeFilter]);

  const loadAssets = async () => {
    setIsLoading(true);
    
    const assetLists: Record<AssetType, Record<FilterType, string[]>> = {
      stocks: {
        "top-performers": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "NFLX"],
        "most-watched": ["AAPL", "TSLA", "NVDA", "AMD", "AMZN", "GOOGL", "META", "MSFT"],
        "dahlias-picks": ["AAPL", "NVDA", "MSFT", "COST", "V", "MA", "UNH", "JNJ"],
      },
      etfs: {
        "top-performers": ["VOO", "SCHD", "QQQ", "VTI", "JEPI", "SPY", "VUG", "VTV"],
        "most-watched": ["VOO", "SCHD", "QQQ", "VTI", "JEPI", "SPY", "IWM", "AGG"],
        "dahlias-picks": ["VOO", "SCHD", "QQQ", "VTI", "JEPI"],
      },
      "mutual-funds": {
        "top-performers": ["VFIAX", "FXAIX", "VTSAX", "FSKAX", "VIGAX", "FCNTX"],
        "most-watched": ["VFIAX", "FXAIX", "VTSAX", "VGTSX", "FDGRX", "FCNTX"],
        "dahlias-picks": ["VFIAX", "FXAIX", "VTSAX"],
      },
    };

    const tickers = assetLists[activeTab][activeFilter];
    const assetData = await Promise.all(
      tickers.map(async (ticker) => {
        const quote = await marketService.getRealTimeQuote(ticker);
        if (quote) {
          return {
            ticker,
            name: getAssetName(ticker),
            price: quote.c,
            change: quote.d,
            changePercent: quote.dp,
          };
        }
        return null;
      })
    );

    const validAssets = assetData.filter((asset): asset is Asset => asset !== null);
    
    // Always show at least the default picks if we got valid data
    setAssets(validAssets.length > 0 ? validAssets : []);
    setIsLoading(false);
  };

  const getAssetName = (ticker: string): string => {
    const names: Record<string, string> = {
      AAPL: "Apple Inc.",
      MSFT: "Microsoft Corporation",
      GOOGL: "Alphabet Inc.",
      AMZN: "Amazon.com Inc.",
      NVDA: "NVIDIA Corporation",
      TSLA: "Tesla Inc.",
      META: "Meta Platforms Inc.",
      NFLX: "Netflix Inc.",
      AMD: "Advanced Micro Devices",
      COST: "Costco Wholesale",
      V: "Visa Inc.",
      MA: "Mastercard Inc.",
      UNH: "UnitedHealth Group",
      JNJ: "Johnson & Johnson",
      SPY: "SPDR S&P 500 ETF",
      QQQ: "Invesco QQQ Trust",
      VOO: "Vanguard S&P 500 ETF",
      VTI: "Vanguard Total Stock Market ETF",
      IVV: "iShares Core S&P 500 ETF",
      SCHD: "Schwab US Dividend Equity ETF",
      VUG: "Vanguard Growth ETF",
      VTV: "Vanguard Value ETF",
      JEPI: "JPMorgan Equity Premium Income ETF",
      IWM: "iShares Russell 2000 ETF",
      EEM: "iShares MSCI Emerging Markets ETF",
      AGG: "iShares Core US Aggregate Bond ETF",
      VYM: "Vanguard High Dividend Yield ETF",
      DGRO: "iShares Core Dividend Growth ETF",
      SPHD: "Invesco S&P 500 High Dividend Low Volatility ETF",
      HDV: "iShares Core High Dividend ETF",
      VFIAX: "Vanguard 500 Index Fund",
      FXAIX: "Fidelity 500 Index Fund",
      VTSAX: "Vanguard Total Stock Market Index Fund",
      FSKAX: "Fidelity Total Market Index Fund",
      VIGAX: "Vanguard Growth Index Fund",
      FCNTX: "Fidelity Contrafund",
      VGTSX: "Vanguard Total International Stock Index Fund",
      FDGRX: "Fidelity Dividend Growth Fund",
      VBTLX: "Vanguard Total Bond Market Index Fund",
      VTIAX: "Vanguard Total International Stock Index Fund",
      VHDYX: "Vanguard High-Yield Corporate Fund",
    };
    return names[ticker] || ticker;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getTabLabel = (tab: AssetType) => {
    return tab === "mutual-funds" ? "Mutual Funds" : tab.charAt(0).toUpperCase() + tab.slice(1);
  };

  const getFilterLabel = (filter: FilterType) => {
    const labels: Record<FilterType, string> = {
      "top-performers": "Top Performers",
      "most-watched": "Most Watched",
      "dahlias-picks": "Dahlia's Picks",
    };
    return labels[filter];
  };

  return (
    <Layout>
      <SEO title="Discover - Bloom" description="Explore stocks, ETFs, and mutual funds" />
      <div className="container-full py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Discover
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore stocks, ETFs, and mutual funds handpicked by Dahlia
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AssetType)} className="space-y-6">
          <TabsList className="w-full grid grid-cols-3 bg-card border border-border rounded-2xl p-1">
            <TabsTrigger value="stocks" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Stocks
            </TabsTrigger>
            <TabsTrigger value="etfs" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              ETFs
            </TabsTrigger>
            <TabsTrigger value="mutual-funds" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Mutual Funds
            </TabsTrigger>
          </TabsList>

          {/* Dahlia Education Section */}
          <Card className="p-6 bg-card border-accent/20 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/bloom-logo.png"
                alt="Dahlia"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-foreground text-lg">Invest with Dahlia</h3>
                <p className="text-sm text-muted-foreground">Learn the basics from your investing bestie</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Card 1 - What is a Stock */}
              <Card className="p-4 bg-muted/30 border-border rounded-xl">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-semibold text-foreground">What is a Stock? 📈</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-3 space-y-3">
                    <p className="text-sm text-foreground leading-relaxed">
                      Okay so when you buy a stock you're basically buying a tiny piece of a real company. Like if you buy Apple stock you literally own a small slice of Apple. If Apple does well and makes more money their stock price usually goes up and so does your investment. If they have a bad year the price might drop. That's the risk but also the opportunity 🍎
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary/10 rounded-lg"
                      onClick={() => setActiveTab("stocks")}
                    >
                      Explore Stocks
                    </Button>
                  </div>
                </details>
              </Card>

              {/* Card 2 - What is an ETF */}
              <Card className="p-4 bg-muted/30 border-border rounded-xl">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-semibold text-foreground">What is an ETF? 🧺</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-3 space-y-3">
                    <p className="text-sm text-foreground leading-relaxed">
                      Think of an ETF like ordering a combo meal instead of picking every single item yourself. An ETF bundles together lots of different stocks so you get a little bit of everything in one purchase. VOO for example holds 500 of the biggest US companies. So instead of picking winners yourself you're basically betting on America as a whole 💪 Much less risky than putting everything in one company.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary/10 rounded-lg"
                      onClick={() => setActiveTab("etfs")}
                    >
                      Explore ETFs
                    </Button>
                  </div>
                </details>
              </Card>

              {/* Card 3 - What is a Mutual Fund */}
              <Card className="p-4 bg-muted/30 border-border rounded-xl">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-semibold text-foreground">What is a Mutual Fund? 💼</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-3 space-y-3">
                    <p className="text-sm text-foreground leading-relaxed">
                      A mutual fund is similar to an ETF - it pools money from lots of investors to buy a diversified mix of stocks or bonds. The big difference is a professional fund manager makes the decisions for you. They usually cost a bit more in fees but some women prefer having an expert manage their money especially when starting out. Think of it like hiring a personal shopper vs doing it yourself 🛍️
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary/10 rounded-lg"
                      onClick={() => setActiveTab("mutual-funds")}
                    >
                      Explore Mutual Funds
                    </Button>
                  </div>
                </details>
              </Card>
            </div>
          </Card>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {(["top-performers", "most-watched", "dahlias-picks"] as FilterType[]).map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="lg"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-xl ${
                  activeFilter === filter 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "border-border hover:border-accent"
                }`}
              >
                {getFilterLabel(filter)}
              </Button>
            ))}
          </div>

          <TabsContent value={activeTab} className="space-y-4 mt-0">
            {isLoading ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">Loading {getTabLabel(activeTab)}...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <Link key={asset.ticker} href={`/stock/${asset.ticker}`}>
                    <Card className="p-5 bg-card border-border rounded-2xl hover:border-accent/50 transition-all cursor-pointer h-full">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-xl text-foreground">
                                {asset.ticker}
                              </h3>
                              <Badge
                                className={`text-xs ${
                                  asset.changePercent >= 0
                                    ? "bg-primary/20 text-primary hover:bg-primary/20"
                                    : "bg-rose/20 text-rose hover:bg-rose/20"
                                }`}
                              >
                                {asset.changePercent >= 0 ? "+" : ""}
                                {asset.changePercent.toFixed(2)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {asset.name}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-3xl font-bold text-foreground tabular-nums">
                            {formatPrice(asset.price)}
                          </p>
                          <div className="flex items-center gap-2">
                            {asset.change >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-primary" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-rose" />
                            )}
                            <span
                              className={`text-sm font-semibold tabular-nums ${
                                asset.change >= 0 ? "text-primary" : "text-rose"
                              }`}
                            >
                              {asset.change >= 0 ? "+" : ""}
                              {formatPrice(asset.change)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Card className="p-4 bg-muted/50 border-border/50 rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}