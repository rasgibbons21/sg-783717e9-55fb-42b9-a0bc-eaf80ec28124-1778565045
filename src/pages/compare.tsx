import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { marketService } from "@/services/marketService";
import { Search, X, TrendingUp, TrendingDown, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";

interface ComparisonAsset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  prevClose: number;
}

interface ComparativeAnalysis {
  summary: string;
  strengths: Record<string, string>;
  risks: Record<string, string>;
  bestFor: Record<string, string>;
  verdict: string;
}

export default function Compare() {
  const router = useRouter();
  const [selectedAssets, setSelectedAssets] = useState<ComparisonAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ComparativeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Load comparison from URL params
    const tickers = router.query.tickers as string;
    if (tickers) {
      const tickerList = tickers.split(",").slice(0, 4);
      loadAssetsForComparison(tickerList);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.tickers]);

  const loadAssetsForComparison = async (tickers: string[]) => {
    setIsLoading(true);
    try {
      const assetsData = await Promise.all(
        tickers.map(async (ticker) => {
          try {
            const quote = await marketService.getRealTimeQuote(ticker.toUpperCase());
            if (quote) {
              return {
                ticker: ticker.toUpperCase(),
                name: ticker.toUpperCase(),
                price: quote.c,
                change: quote.d,
                changePercent: quote.dp,
                high: quote.h,
                low: quote.l,
                volume: quote.v,
                prevClose: quote.pc,
              };
            }
            return null;
          } catch (error) {
            console.error(`Error loading ${ticker}:`, error);
            return null;
          }
        })
      );

      const validAssets = assetsData.filter((a): a is ComparisonAsset => a !== null);
      setSelectedAssets(validAssets);

      // Load comparative analysis if we have 2+ assets
      if (validAssets.length >= 2) {
        loadComparativeAnalysis(validAssets);
      }
    } catch (error) {
      console.error("Error loading assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComparativeAnalysis = async (assets: ComparisonAsset[]) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/compare-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error("Error loading comparative analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || selectedAssets.length >= 4) return;

    const ticker = searchQuery.trim().toUpperCase();
    
    // Check if already added
    if (selectedAssets.some(a => a.ticker === ticker)) {
      setSearchQuery("");
      return;
    }

    setIsLoading(true);
    try {
      const quote = await marketService.getRealTimeQuote(ticker);
      if (quote) {
        const newAsset: ComparisonAsset = {
          ticker,
          name: ticker,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          high: quote.h,
          low: quote.l,
          volume: quote.v,
          prevClose: quote.pc,
        };

        const newAssets = [...selectedAssets, newAsset];
        setSelectedAssets(newAssets);
        setSearchQuery("");

        // Update URL
        router.push({
          pathname: "/compare",
          query: { tickers: newAssets.map(a => a.ticker).join(",") },
        }, undefined, { shallow: true });

        // Reload analysis if we have 2+ assets
        if (newAssets.length >= 2) {
          loadComparativeAnalysis(newAssets);
        }
      }
    } catch (error) {
      console.error("Error adding asset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeAsset = (ticker: string) => {
    const newAssets = selectedAssets.filter(a => a.ticker !== ticker);
    setSelectedAssets(newAssets);

    if (newAssets.length > 0) {
      router.push({
        pathname: "/compare",
        query: { tickers: newAssets.map(a => a.ticker).join(",") },
      }, undefined, { shallow: true });

      if (newAssets.length >= 2) {
        loadComparativeAnalysis(newAssets);
      } else {
        setAnalysis(null);
      }
    } else {
      router.push("/compare", undefined, { shallow: true });
      setAnalysis(null);
    }
  };

  const getMetricColor = (value: number, _isPercentage: boolean = false) => {
    if (value > 0) return "text-[#3d7a54]";
    if (value < 0) return "text-[#d4788a]";
    return "text-muted-foreground";
  };

  return (
    <Layout>
      <SEO
        title="Compare Investments | Bloom"
        description="Side-by-side comparison of stocks and ETFs with Pansy's analysis"
      />
      <div className="container-full py-8 space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link href="/discover" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Discover
            </Link>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Compare Investments
          </h1>
          <p className="text-muted-foreground">
            Add up to 4 stocks or ETFs to compare side-by-side
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 border-border">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Enter ticker symbol (e.g., AAPL, MSFT, VOO)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
                disabled={selectedAssets.length >= 4}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || selectedAssets.length >= 4 || isLoading}
            >
              Add
            </Button>
          </div>
          {selectedAssets.length >= 4 && (
            <p className="text-xs text-muted-foreground mt-2">
              Maximum 4 assets for comparison. Remove one to add another.
            </p>
          )}
        </Card>

        {/* Selected Assets Pills */}
        {selectedAssets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedAssets.map((asset) => (
              <Badge
                key={asset.ticker}
                className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 flex items-center gap-2"
              >
                <span className="font-semibold">{asset.ticker}</span>
                <button
                  onClick={() => removeAsset(asset.ticker)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Empty State */}
        {selectedAssets.length === 0 && !isLoading && (
          <Card className="p-12 text-center border-dashed">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
              Start Your Comparison
            </h2>
            <p className="text-muted-foreground mb-6">
              Search for stocks or ETFs above to begin comparing
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["AAPL", "MSFT", "NVDA", "VOO", "QQQ", "SPY"].map((ticker) => (
                <Button
                  key={ticker}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery(ticker);
                    setTimeout(handleSearch, 100);
                  }}
                >
                  Add {ticker}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Comparison Grid */}
        {selectedAssets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedAssets.map((asset) => (
              <Card key={asset.ticker} className="p-6 border-border space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-xl text-foreground">
                      {asset.ticker}
                    </h3>
                    <p className="text-sm text-muted-foreground">{asset.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAsset(asset.ticker)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">
                      ${asset.price.toFixed(2)}
                    </p>
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
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">High</span>
                      <span className="font-medium text-foreground">
                        ${asset.high.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Low</span>
                      <span className="font-medium text-foreground">
                        ${asset.low.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prev Close</span>
                      <span className="font-medium text-foreground">
                        ${asset.prevClose.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-medium text-foreground">
                        {(asset.volume / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  </div>
                </div>

                <Link href={`/stock/${asset.ticker}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Full Analysis <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Comparison Table */}
        {selectedAssets.length >= 2 && (
          <Card className="p-6 border-border overflow-x-auto">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              Key Metrics Comparison
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-muted-foreground font-medium">Metric</th>
                  {selectedAssets.map((asset) => (
                    <th key={asset.ticker} className="text-right py-3 text-foreground font-semibold">
                      {asset.ticker}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 text-muted-foreground">Current Price</td>
                  {selectedAssets.map((asset) => (
                    <td key={asset.ticker} className="text-right py-3 font-medium text-foreground">
                      ${asset.price.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Daily Change</td>
                  {selectedAssets.map((asset) => (
                    <td key={asset.ticker} className={`text-right py-3 font-medium ${getMetricColor(asset.change)}`}>
                      {asset.change >= 0 ? "+" : ""}${asset.change.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Daily Change %</td>
                  {selectedAssets.map((asset) => (
                    <td key={asset.ticker} className={`text-right py-3 font-medium ${getMetricColor(asset.changePercent, true)}`}>
                      {asset.changePercent >= 0 ? "+" : ""}{asset.changePercent.toFixed(2)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Day High</td>
                  {selectedAssets.map((asset) => (
                    <td key={asset.ticker} className="text-right py-3 font-medium text-foreground">
                      ${asset.high.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Day Low</td>
                  {selectedAssets.map((asset) => (
                    <td key={asset.ticker} className="text-right py-3 font-medium text-foreground">
                      ${asset.low.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Volume</td>
                  {selectedAssets.map((asset) => (
                    <td key={asset.ticker} className="text-right py-3 font-medium text-foreground">
                      {(asset.volume / 1000000).toFixed(2)}M
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </Card>
        )}

        {/* Pansy's Comparative Analysis */}
        {isAnalyzing ? (
          <Card className="p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Pansy is comparing these investments...</p>
            </div>
          </Card>
        ) : analysis && selectedAssets.length >= 2 ? (
          <Card className="p-6 border-border space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl shrink-0">
                🌺
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-semibold text-foreground text-lg">Pansy's Comparative Analysis</p>
                  <p className="text-sm text-muted-foreground">Bloom's Investing Expert</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Overview</h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {analysis.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-[#3d7a54]/30 bg-[#3d7a54]/10">
                  <h4 className="text-sm font-semibold text-[#3d7a54] mb-2">Strengths</h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.strengths).map(([ticker, strength]) => (
                      <div key={ticker}>
                        <p className="text-xs font-semibold text-foreground">{ticker}</p>
                        <p className="text-xs text-foreground/90">{strength}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 border-[#d4788a]/30 bg-[#d4788a]/10">
                  <h4 className="text-sm font-semibold text-[#d4788a] mb-2">Risks</h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.risks).map(([ticker, risk]) => (
                      <div key={ticker}>
                        <p className="text-xs font-semibold text-foreground">{ticker}</p>
                        <p className="text-xs text-foreground/90">{risk}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 border-[#c8953a]/30 bg-[#c8953a]/10">
                  <h4 className="text-sm font-semibold text-[#c8953a] mb-2">Best For</h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.bestFor).map(([ticker, use]) => (
                      <div key={ticker}>
                        <p className="text-xs font-semibold text-foreground">{ticker}</p>
                        <p className="text-xs text-foreground/90">{use}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-4 border-[#c8953a]/50 bg-[#c8953a]/20">
                <h3 className="text-sm font-semibold text-[#c8953a] mb-2">Pansy's Verdict</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {analysis.verdict}
                </p>
              </Card>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                This platform is for educational and informational purposes only. It is not financial advice. Investing and trading involve risk, including possible loss of principal. Always do your own research or consult a licensed financial professional.
              </p>
            </div>
          </Card>
        ) : null}
      </div>
    </Layout>
  );
}