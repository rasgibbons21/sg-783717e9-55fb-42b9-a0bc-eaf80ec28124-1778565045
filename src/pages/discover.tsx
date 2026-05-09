import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { marketService, Quote } from "@/services/marketService";
import { TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

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
        "top-performers": ["SPY", "QQQ", "VOO", "VTI", "IVV", "SCHD", "VUG", "VTV"],
        "most-watched": ["SPY", "QQQ", "VOO", "IWM", "EEM", "VTI", "SCHD", "AGG"],
        "dahlias-picks": ["SCHD", "VOO", "VTI", "QQQ", "VYM", "DGRO", "SPHD", "HDV"],
      },
      "mutual-funds": {
        "top-performers": ["VFIAX", "FXAIX", "VTSAX", "FSKAX", "VIGAX", "FCNTX"],
        "most-watched": ["VFIAX", "VTSAX", "FXAIX", "VGTSX", "FDGRX", "FCNTX"],
        "dahlias-picks": ["VFIAX", "VTSAX", "VBTLX", "VTIAX", "VHDYX", "VIGAX"],
      },
    };

    const tickers = assetLists[activeTab][activeFilter];
    const assetData = await Promise.all(
      tickers.map(async (ticker) => {
        const quote = await marketService.getQuote(ticker);
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

    setAssets(assetData.filter((asset): asset is Asset => asset !== null));
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
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Discover 🔍
          </h1>
          <p className="text-muted-foreground">
            Explore stocks, ETFs, and mutual funds
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AssetType)}>
          <TabsList className="w-full grid grid-cols-3 bg-muted">
            <TabsTrigger value="stocks">{getTabLabel("stocks")}</TabsTrigger>
            <TabsTrigger value="etfs">{getTabLabel("etfs")}</TabsTrigger>
            <TabsTrigger value="mutual-funds">{getTabLabel("mutual-funds")}</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 overflow-x-auto py-4 -mx-4 px-4">
            {(["top-performers", "most-watched", "dahlias-picks"] as FilterType[]).map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap ${
                  activeFilter === filter ? "bg-primary" : ""
                }`}
              >
                {getFilterLabel(filter)}
              </Button>
            ))}
          </div>

          <TabsContent value={activeTab} className="space-y-3 mt-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading {getTabLabel(activeTab)}...</p>
              </div>
            ) : (
              assets.map((asset) => (
                <Link key={asset.ticker} href={`/stock/${asset.ticker}`}>
                  <Card className="p-4 hover:border-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground text-lg">
                            {asset.ticker}
                          </p>
                          <Badge
                            variant={asset.changePercent >= 0 ? "default" : "destructive"}
                            className={`text-xs ${
                              asset.changePercent >= 0
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : ""
                            }`}
                          >
                            {asset.changePercent >= 0 ? "+" : ""}
                            {asset.changePercent.toFixed(2)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {asset.name}
                        </p>
                      </div>

                      <div className="text-right space-y-1 ml-4">
                        <p className="text-xl font-bold text-foreground tabular-nums">
                          {formatPrice(asset.price)}
                        </p>
                        <div className="flex items-center justify-end gap-1">
                          {asset.change >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                          <span
                            className={`text-xs font-semibold tabular-nums ${
                              asset.change >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {asset.change >= 0 ? "+" : ""}
                            {formatPrice(asset.change)}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4 w-16 h-12 flex items-center justify-center">
                        <div className="text-xs text-muted-foreground">📈</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Card className="p-3 bg-muted border-muted-foreground/20">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial
            advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}