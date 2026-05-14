import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { marketService, type MarketAnalysis } from "@/services/marketService";
import { dahliaAnalysisService } from "@/services/dahliaAnalysisService";
import { ChevronDown, ChevronUp, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
  const [quote, setQuote] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [dahliaAnalysis, setDahliaAnalysis] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [chartInterval, setChartInterval] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1M");
  const [showETFBreakdown, setShowETFBreakdown] = useState(false);
  const [isETF] = useState(false);
  const [etfHoldings] = useState<any[]>([]);
  const [sectorMix] = useState<any[]>([]);

  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadStockData(ticker);
    }
  }, [ticker]);

  const loadStockData = async (symbol: string) => {
    setIsLoadingQuote(true);
    setIsLoadingChart(true);
    setIsLoadingAnalysis(true);

    // Fetch real-time quote
    const quoteData = await marketService.getRealTimeQuote(symbol);
    setQuote(quoteData);
    setIsLoadingQuote(false);

    // Fetch chart data
    const days = chartInterval === "1D" ? 1 : chartInterval === "1W" ? 7 : chartInterval === "1M" ? 30 : chartInterval === "3M" ? 90 : 365;
    const historical = await marketService.getHistoricalData(symbol, days);
    setChartData(historical);
    setIsLoadingChart(false);

    // Fetch market analysis
    const analysis = await marketService.getMarketAnalysis(symbol);
    setMarketAnalysis(analysis);

    // Generate Dahlia's analysis with real data
    if (quoteData && analysis) {
      const dahliaResponse = await dahliaAnalysisService.getAnalysisWithMarketData(
        symbol,
        quoteData,
        analysis
      );
      setDahliaAnalysis(dahliaResponse);
    }
    setIsLoadingAnalysis(false);

    // Fetch news (keeping existing Finnhub logic)
    try {
      const newsResponse = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        }&to=${new Date().toISOString().split("T")[0]}&token=${
          process.env.NEXT_PUBLIC_FINNHUB_API_KEY
        }`
      );
      const newsData = await newsResponse.json();
      setNews(Array.isArray(newsData) ? newsData : []);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadStockData(ticker);
    }
  }, [chartInterval]);

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

        {/* Chart Section */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {["1D", "1W", "1M", "3M", "1Y"].map((interval) => (
              <Button
                key={interval}
                variant={chartInterval === interval ? "default" : "outline"}
                size="sm"
                onClick={() => setChartInterval(interval as any)}
                className={
                  chartInterval === interval
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-primary/10"
                }
              >
                {interval}
              </Button>
            ))}
          </div>

          {isLoadingChart ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    stroke="#8080a0"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8080a0"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#16161f",
                      border: "1px solid #2a2a3a",
                      borderRadius: "8px",
                      color: "#f0f0f8",
                    }}
                    formatter={(value: any) => [`$${value.toFixed(2)}`, "Price"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={
                      chartData.length >= 2 &&
                      chartData[chartData.length - 1].price > chartData[0].price
                        ? "#3d7a54"
                        : "#ef4444"
                    }
                    strokeWidth={2}
                    dot={false}
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-muted-foreground">No chart data available</p>
            </div>
          )}
        </Card>

        {/* Dahlia's Analysis */}
        {isLoadingAnalysis ? (
          <Card className="p-6 bg-card border-accent/20 rounded-2xl space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </Card>
        ) : dahliaAnalysis ? (
          <Card className="p-6 bg-card border-accent/20 rounded-2xl space-y-4">
            <div className="flex items-start gap-4">
              <img
                src="/bloom-logo.png"
                alt="Dahlia"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-lg">Dahlia</h3>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      dahliaAnalysis.sentiment === "Positive"
                        ? "bg-primary/10 text-primary border-primary"
                        : dahliaAnalysis.sentiment === "Negative"
                        ? "bg-destructive/10 text-destructive border-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {dahliaAnalysis.sentiment === "Positive" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : dahliaAnalysis.sentiment === "Negative" ? (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    ) : null}
                    {dahliaAnalysis.sentiment}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bloom's Investing Expert
                </p>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {dahliaAnalysis.content}
              </p>
            </div>

            <p className="text-sm font-medium text-accent">— Dahlia 🌺</p>

            <Card className="p-3 bg-muted/50 border-muted-foreground/20 rounded-xl">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is just educational info — not financial advice. Always invest
                what feels right for you 💛 — Dahlia
              </p>
            </Card>
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