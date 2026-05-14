import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { marketService, Quote, NewsItem } from "@/services/marketService";
import { dahliaAnalysisService, DahliaAnalysis } from "@/services/dahliaAnalysisService";
import { ChevronDown, ChevronUp, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { SEO } from "@/components/SEO";

interface ETFHolding {
  symbol: string;
  name: string;
  weight: number;
}

interface SectorWeighting {
  sector: string;
  weight: number;
}

export default function StockAnalysis() {
  const router = useRouter();
  const { ticker } = router.query;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [dahliaAnalysis, setDahliaAnalysis] = useState<DahliaAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isETF, setIsETF] = useState(false);
  const [showETFBreakdown, setShowETFBreakdown] = useState(false);
  const [etfHoldings, setEtfHoldings] = useState<ETFHolding[]>([]);
  const [sectorMix, setSectorMix] = useState<SectorWeighting[]>([]);
  const [chartInterval, setChartInterval] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1D");

  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadStockData(ticker);
    }
  }, [ticker]);

  const loadStockData = async (symbol: string) => {
    try {
      const [quoteData, newsData] = await Promise.all([
        marketService.getQuote(symbol),
        marketService.getCompanyNews(symbol),
      ]);

      if (quoteData) setQuote(quoteData);
      setNews(newsData || []);

      const commonETFs = ["SPY", "QQQ", "VOO", "VTI", "SCHD", "IVV", "AGG", "BND"];
      const isETFCheck = commonETFs.includes(symbol.toUpperCase());
      setIsETF(isETFCheck);

      if (isETFCheck) {
        const [holdings, sectors] = await Promise.all([
          marketService.getETFHoldings(symbol),
          marketService.getETFSectorWeighting(symbol),
        ]);
        
        setEtfHoldings(holdings?.map(h => ({
          symbol: h.asset,
          name: h.name,
          weight: h.weightPercentage
        })) || []);
        
        setSectorMix(sectors?.map(s => ({
          sector: s.sector,
          weight: s.weightPercentage
        })) || []);
      }

      setIsLoadingAnalysis(true);
      const analysis = await dahliaAnalysisService.generateAnalysis(symbol, isETFCheck);
      setDahliaAnalysis(analysis);
      setIsLoadingAnalysis(false);
    } catch (error) {
      console.error("Error loading stock data:", error);
      setIsLoadingAnalysis(false);
    }
  };

  const formatPrice = (price: number | undefined | null) => {
    if (price == null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatLargeNumber = (num: number | undefined | null) => {
    if (num == null) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  if (!ticker || typeof ticker !== "string") {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Invalid ticker</p>
        </div>
      </Layout>
    );
  }

  const changePercent = quote?.dp ?? 0;
  const change = quote?.d ?? 0;
  const isPositive = changePercent >= 0;

  return (
    <Layout>
      <SEO
        title={`${ticker.toUpperCase()} Analysis - Bloom`}
        description={`Dahlia's girlfriend-tone investment analysis for ${ticker.toUpperCase()}`}
      />
      <div className="container-full py-6 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-4xl font-bold text-foreground">
                {ticker.toUpperCase()}
              </h1>
              <p className="text-muted-foreground mt-1">Stock Analysis</p>
            </div>
            <Badge
              className={`text-lg px-4 py-2 ${
                isPositive
                  ? "bg-primary/20 text-primary hover:bg-primary/20"
                  : "bg-rose/20 text-rose hover:bg-rose/20"
              }`}
            >
              {isPositive ? "+" : ""}
              {quote?.dp != null ? quote.dp.toFixed(2) : "0.00"}%
            </Badge>
          </div>

          <div className="flex items-end gap-4">
            <div>
              <p className="text-5xl font-bold text-foreground tabular-nums">
                {formatPrice(quote?.c)}
              </p>
              <div className={`flex items-center gap-2 mt-2 text-lg font-semibold ${
                isPositive ? "text-primary" : "text-rose"
              }`}>
                {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                <span className="tabular-nums">
                  {isPositive ? "+" : ""}
                  {formatPrice(change)} today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {["1D", "1W", "1M", "3M", "1Y"].map((interval) => (
              <Button
                key={interval}
                variant={chartInterval === interval ? "default" : "outline"}
                size="sm"
                onClick={() => setChartInterval(interval as any)}
                className="rounded-lg"
              >
                {interval}
              </Button>
            ))}
          </div>
          <div className="h-80 bg-popover rounded-xl flex items-center justify-center border border-border">
            <p className="text-muted-foreground text-sm">
              TradingView chart for {ticker.toUpperCase()} — {chartInterval}
            </p>
          </div>
        </Card>

        {/* Dahlia's Analysis */}
        {isLoadingAnalysis ? (
          <Card className="p-8 bg-card border-border rounded-2xl">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <span className="ml-3 text-muted-foreground">Dahlia is analyzing this for you...</span>
            </div>
          </Card>
        ) : dahliaAnalysis ? (
          <Card className="p-6 bg-card border-accent/50 rounded-2xl">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img
                    src="/bloom-logo.png"
                    alt="Dahlia"
                    className="h-14 w-14 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-foreground">Dahlia</h3>
                    <Badge className="text-xs bg-accent/20 text-accent hover:bg-accent/20">
                      {dahliaAnalysis.sentiment}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Bloom's Investing Expert</p>
                </div>
              </div>

              <div className="bg-popover p-5 rounded-xl border border-border">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {dahliaAnalysis.content}
                </p>
              </div>

              <p className="text-sm font-medium text-accent">— Dahlia 🌺</p>

              <Card className="p-4 bg-muted/50 border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This is just educational info — not financial advice. Always invest what feels right for you 💛
                </p>
              </Card>
            </div>
          </Card>
        ) : null}

        {/* Key Stats */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Key Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="text-lg font-bold text-foreground">{formatLargeNumber((quote as any)?.marketCap)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">52W High</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(quote?.h)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">52W Low</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(quote?.l)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="text-lg font-bold text-foreground tabular-nums">
                {(quote as any)?.v ? ((quote as any).v / 1e6).toFixed(2) + "M" : "N/A"}
              </p>
            </div>
          </div>
        </Card>

        {/* ETF Breakdown */}
        {isETF && (
          <Card className="p-6 bg-card border-border rounded-2xl">
            <Button
              variant="ghost"
              onClick={() => setShowETFBreakdown(!showETFBreakdown)}
              className="w-full flex items-center justify-between hover:bg-transparent p-0 h-auto"
            >
              <span className="font-serif text-2xl font-bold text-foreground">
                See what's inside 🌺
              </span>
              {showETFBreakdown ? (
                <ChevronUp className="w-6 h-6 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-6 h-6 text-muted-foreground" />
              )}
            </Button>

            {showETFBreakdown && (
              <div className="space-y-6 pt-6 mt-6 border-t border-border">
                {/* Top Holdings */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-foreground">Top 5 Holdings</h4>
                  {etfHoldings.slice(0, 5).map((holding, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-semibold text-foreground">{holding.symbol}</span>
                          <span className="text-muted-foreground ml-2">{holding.name}</span>
                        </div>
                        <span className="text-foreground font-semibold">
                          {holding.weight.toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${holding.weight}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sector Mix */}
                {sectorMix.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-foreground">Sector Mix</h4>
                    <div className="flex flex-wrap gap-2">
                      {sectorMix.map((sector, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-sm border-border bg-popover"
                        >
                          {sector.sector}: {sector.weight.toFixed(1)}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dahlia's ETF Summary */}
                <Card className="p-5 bg-accent/10 border-accent/30 rounded-xl">
                  <p className="text-sm text-foreground leading-relaxed">
                    Basically girl, when you buy {ticker.toUpperCase()} you're buying a little piece of{" "}
                    {etfHoldings.length}+ solid companies at once. If one has a bad week the others hold it up 💪 
                    It's like not putting all your eggs in one basket.
                  </p>
                </Card>
              </div>
            )}
          </Card>
        )}

        {/* Latest News */}
        {news.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground">Latest News</h2>
            <div className="grid gap-4">
              {news.slice(0, 5).map((article, index) => (
                <Card key={index} className="p-5 bg-card border-border rounded-2xl hover:border-accent/50 transition-all">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {article.source} • {new Date(article.datetime * 1000).toLocaleDateString()}
                    </p>
                    <h3 className="font-semibold text-foreground leading-snug">
                      {article.headline}
                    </h3>
                    {article.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-accent hover:underline"
                      >
                        Read more →
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <Card className="p-4 bg-muted/50 border-border/50 rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}