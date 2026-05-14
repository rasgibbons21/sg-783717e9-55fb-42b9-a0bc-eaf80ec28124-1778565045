import { useEffect, useState, useRef } from "react";
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
import { createChart, ColorType } from "lightweight-charts";

type ChartInterval = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y";

export default function StockAnalysis() {
  const router = useRouter();
  const { ticker } = router.query;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  const [quote, setQuote] = useState<any>(null);
  const [ohlcData, setOhlcData] = useState<any[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [dahliaAnalysis, setDahliaAnalysis] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [chartInterval, setChartInterval] = useState<ChartInterval>("1M");
  const [showETFBreakdown, setShowETFBreakdown] = useState(false);
  const [isETF] = useState(false);
  const [etfHoldings] = useState<any[]>([]);
  const [sectorMix] = useState<any[]>([]);

  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadStockData(ticker);
    }
  }, [ticker]);

  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadChartData(ticker);
    }
  }, [ticker, chartInterval]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0f" },
        textColor: "#8080a0",
      },
      grid: {
        vertLines: { color: "#1e1e2a" },
        horzLines: { color: "#1e1e2a" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#c8953a",
          labelBackgroundColor: "#c8953a",
        },
        horzLine: {
          color: "#c8953a",
          labelBackgroundColor: "#c8953a",
        },
      },
      timeScale: {
        borderColor: "#2a2a3a",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#2a2a3a",
      },
    });

    const candlestickSeries = chart.addSeries({
      type: 'Candlestick',
      upColor: "#22d472",
      downColor: "#f04848",
      borderUpColor: "#22d472",
      borderDownColor: "#f04848",
      wickUpColor: "#22d472",
      wickDownColor: "#f04848",
    });

    const volumeSeries = chart.addSeries({
      type: 'Histogram',
      color: "#8080a0",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (ohlcData.length > 0 && candlestickSeriesRef.current && volumeSeriesRef.current) {
      const candleData = ohlcData.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      const volumeData = ohlcData.map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? "#22d47233" : "#f0484833",
      }));

      candlestickSeriesRef.current.setData(candleData);
      volumeSeriesRef.current.setData(volumeData);

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [ohlcData]);

  const loadStockData = async (symbol: string) => {
    setIsLoadingQuote(true);
    setIsLoadingAnalysis(true);

    // Fetch real-time quote
    const quoteData = await marketService.getRealTimeQuote(symbol);
    setQuote(quoteData);
    setIsLoadingQuote(false);

    // Fetch market analysis
    const analysis = await marketService.getMarketAnalysis(symbol);
    setMarketAnalysis(analysis);

    // Generate Dahlia's analysis with candlestick pattern recognition
    if (quoteData && analysis) {
      const dahliaResponse = await generateCandlestickAnalysis(symbol, quoteData, analysis);
      setDahliaAnalysis(dahliaResponse);
    }
    setIsLoadingAnalysis(false);

    // Fetch news
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

  const loadChartData = async (symbol: string) => {
    setIsLoadingChart(true);
    const days = getDaysForInterval(chartInterval);
    const historical = await marketService.getHistoricalOHLC(symbol, days);
    setOhlcData(historical);
    setIsLoadingChart(false);
  };

  const getDaysForInterval = (interval: ChartInterval): number => {
    switch (interval) {
      case "1D":
        return 1;
      case "5D":
        return 5;
      case "1M":
        return 30;
      case "3M":
        return 90;
      case "6M":
        return 180;
      case "1Y":
        return 365;
      default:
        return 30;
    }
  };

  const generateCandlestickAnalysis = async (
    symbol: string,
    quoteData: any,
    marketAnalysis: MarketAnalysis
  ) => {
    try {
      // Analyze recent candles for patterns
      const recentCandles = ohlcData.slice(-5);
      let patternText = "";

      if (recentCandles.length >= 3) {
        const greenCandles = recentCandles.filter(c => c.close > c.open).length;
        const redCandles = recentCandles.length - greenCandles;
        
        const volumeIncreasing = recentCandles.length >= 2 && 
          recentCandles[recentCandles.length - 1].volume > recentCandles[recentCandles.length - 2].volume;

        if (greenCandles >= 3 && volumeIncreasing) {
          patternText = "The last 3 candles are all green with increasing volume — that's called momentum and it usually means buyers are in control right now 📈";
        } else if (redCandles >= 3 && volumeIncreasing) {
          patternText = "Seeing 3 red candles in a row with heavy volume — sellers are pushing hard right now. This could continue or bounce, so watch closely 👀";
        } else if (greenCandles === redCandles) {
          patternText = "The chart's been bouncing between green and red candles — that's indecision. The market doesn't know which way it wants to go yet 🤔";
        }
      }

      const trendText = marketAnalysis.trend === "up" ? "climbing" : marketAnalysis.trend === "down" ? "dropping" : "trading sideways";
      const volumeText = marketAnalysis.volumeRatio > 1.5 ? `${marketAnalysis.volumeRatio.toFixed(1)}x the average` : "about average";
      
      const prompt = `You are Dahlia, Bloom's investing expert. Write a 3 paragraph analysis in your warm girlfriend tone about ${symbol}.

Use this REAL candlestick chart data in your analysis:
- ${patternText}
- The stock has been ${trendText} over the last 30 days.
- Today's volume is ${volumeText}.
- Current price: $${quoteData.c.toFixed(2)}

Reference the candlestick pattern naturally like: "The last 3 candles are all green with increasing volume — that's momentum girl, buyers are stepping in 📈"

Make it conversational. No financial jargon. Never say buy/sell/hold.
End with: "This is just educational info — not financial advice. Always invest what feels right for you 💛 — Dahlia"`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          content: data.content || data.analysis || "Analysis generated.",
          sentiment: data.sentiment || "Neutral",
          analysis: data.content || data.analysis,
          timestamp: new Date().toISOString(),
        };
      }
      return dahliaAnalysisService.getStaticFallbackAnalysis(symbol);
    } catch (error) {
      console.error("Error generating candlestick analysis:", error);
      return dahliaAnalysisService.getStaticFallbackAnalysis(symbol);
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
    return `$${num.toLocaleString()}`;
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

  return (
    <Layout>
      <SEO
        title={`${ticker.toUpperCase()} Stock Analysis - Bloom`}
        description={`Dahlia's investment analysis for ${ticker.toUpperCase()}`}
      />
      <div className="container-full py-6 space-y-6">
        {/* Price Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-4xl font-bold text-foreground">
                {ticker.toUpperCase()}
              </h1>
              <p className="text-muted-foreground text-lg">Stock Analysis</p>
            </div>
            <Badge
              className={`text-base px-4 py-2 ${
                (quote?.dp ?? 0) >= 0
                  ? "bg-primary/20 text-primary hover:bg-primary/20"
                  : "bg-rose/20 text-rose hover:bg-rose/20"
              }`}
            >
              {(quote?.dp ?? 0) >= 0 ? "+" : ""}
              {quote?.dp != null ? quote.dp.toFixed(2) : "0.00"}%
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-5xl font-bold text-foreground tabular-nums">
              {formatPrice(quote?.c)}
            </p>
            <p
              className={`text-xl font-semibold tabular-nums ${
                (quote?.d ?? 0) >= 0 ? "text-primary" : "text-rose"
              }`}
            >
              {(quote?.d ?? 0) >= 0 ? "+" : ""}
              {formatPrice(quote?.d)} today
            </p>
          </div>
        </div>

        {/* Candlestick Chart */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {(["1D", "5D", "1M", "3M", "6M", "1Y"] as ChartInterval[]).map((interval) => (
              <Button
                key={interval}
                variant={chartInterval === interval ? "default" : "outline"}
                size="sm"
                onClick={() => setChartInterval(interval)}
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
            <div className="h-96 flex items-center justify-center bg-popover rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div
              ref={chartContainerRef}
              className="w-full rounded-xl overflow-hidden"
              style={{ minHeight: "400px" }}
            />
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
          <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
            <Button
              variant="ghost"
              onClick={() => setShowETFBreakdown(!showETFBreakdown)}
              className="w-full flex items-center justify-between"
            >
              <span className="font-semibold text-foreground">
                See what's inside 🌺
              </span>
              {showETFBreakdown ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>

            {showETFBreakdown && (
              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Top Holdings</h4>
                  {etfHoldings.slice(0, 5).map((holding, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {holding.symbol}
                        </span>
                        <span className="text-muted-foreground">
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

                {sectorMix.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">
                      Sector Breakdown
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sectorMix.map((sector, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {sector.sector}: {sector.percentage.toFixed(1)}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Card className="p-4 bg-accent/5 border-accent rounded-xl">
                  <p className="text-sm text-foreground leading-relaxed">
                    Basically girl, when you buy {ticker.toUpperCase()} you're buying
                    a little piece of {etfHoldings.length}+ solid companies at once.
                    If one has a bad week the others hold it up 💪 It's like not
                    putting all your eggs in one basket.
                  </p>
                </Card>
              </div>
            )}
          </Card>
        )}

        {/* Latest News */}
        {news.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Latest News
            </h2>
            <div className="space-y-3">
              {news.slice(0, 5).map((article, index) => (
                <Card key={index} className="p-5 bg-card border-border rounded-2xl hover:border-accent/30 transition-colors">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {article.source} •{" "}
                      {new Date(article.datetime * 1000).toLocaleDateString()}
                    </p>
                    <h3 className="font-semibold text-foreground text-lg">
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
                        className="text-sm text-accent hover:underline inline-block"
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
            This is educational content only and does not constitute financial
            advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}