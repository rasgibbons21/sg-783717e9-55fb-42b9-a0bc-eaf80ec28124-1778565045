import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { marketService, Quote, NewsItem } from "@/services/marketService";
import { dahliaAnalysisService } from "@/services/dahliaAnalysisService";
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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

interface DahliaAnalysisData {
  analysis: string;
  sentiment: "bullish" | "bearish" | "neutral" | "cautious";
  timestamp: string;
}

export default function StockAnalysis() {
  const router = useRouter();
  const { ticker } = router.query;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [dahliaAnalysis, setDahliaAnalysis] = useState<DahliaAnalysisData | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isETF, setIsETF] = useState(false);
  const [etfExpanded, setEtfExpanded] = useState(false);
  const [etfHoldings, setEtfHoldings] = useState<ETFHolding[]>([]);
  const [sectorWeighting, setSectorWeighting] = useState<SectorWeighting[]>([]);
  const [chartInterval, setChartInterval] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1D");

  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadStockData(ticker);
    }
  }, [ticker]);

  const loadStockData = async (symbol: string) => {
    const [quoteData, newsData] = await Promise.all([
      marketService.getQuote(symbol),
      marketService.getCompanyNews(symbol),
    ]);

    if (quoteData) setQuote(quoteData);
    setNews(newsData);

    const commonETFs = ["SPY", "QQQ", "VOO", "VTI", "SCHD", "IVV", "AGG", "BND"];
    const isETFCheck = commonETFs.includes(symbol.toUpperCase());
    setIsETF(isETFCheck);

    if (isETFCheck) {
      const [holdings, sectors] = await Promise.all([
        marketService.getETFHoldings(symbol),
        marketService.getETFSectorWeighting(symbol),
      ]);
      setEtfHoldings(holdings.map(h => ({
        symbol: h.asset,
        name: h.name,
        weight: h.weightPercentage
      })));
      setSectorWeighting(sectors.map(s => ({
        sector: s.sector,
        weight: s.weightPercentage
      })));
    }

    // Generate AI-powered Dahlia analysis
    setIsLoadingAnalysis(true);
    const analysis = await dahliaAnalysisService.generateAnalysis(symbol, isETFCheck);
    setDahliaAnalysis(analysis);
    setIsLoadingAnalysis(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    const labels: Record<string, string> = {
      bullish: "Optimistic",
      bearish: "Cautious",
      neutral: "Neutral",
      cautious: "Watchful",
    };
    return labels[sentiment] || "Neutral";
  };

  if (!quote || !ticker) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`${ticker} Analysis - Bloom`}
        description={`Dahlia's investing analysis for ${ticker}`}
      />
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                {typeof ticker === "string" ? ticker.toUpperCase() : ""}
              </h1>
              <p className="text-muted-foreground">Stock Analysis</p>
            </div>
            <Badge
              variant={quote.dp >= 0 ? "default" : "destructive"}
              className={`text-base px-3 py-1 ${
                quote.dp >= 0
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : ""
              }`}
            >
              {quote.dp >= 0 ? "+" : ""}
              {quote.dp.toFixed(2)}%
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-4xl font-bold text-foreground tabular-nums">
              {formatPrice(quote.c)}
            </p>
            <p
              className={`text-lg font-semibold tabular-nums ${
                quote.d >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {quote.d >= 0 ? "+" : ""}
              {formatPrice(quote.d)} today
            </p>
          </div>
        </div>

        <Card className="p-4 bg-card">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {(["1D", "1W", "1M", "3M", "1Y"] as const).map((interval) => (
              <Button
                key={interval}
                variant={chartInterval === interval ? "default" : "outline"}
                size="sm"
                onClick={() => setChartInterval(interval)}
                className={chartInterval === interval ? "bg-primary" : ""}
              >
                {interval}
              </Button>
            ))}
          </div>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Chart placeholder - TradingView widget integration
            </p>
          </div>
        </Card>

        <Card className="p-5 space-y-4 border-accent/30">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-amber-400 flex items-center justify-center text-3xl flex-shrink-0">
              🌺
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="font-serif text-xl font-semibold text-foreground">
                  Dahlia
                </p>
                <p className="text-sm text-muted-foreground">
                  Bloom's Investing Expert
                </p>
              </div>
              {dahliaAnalysis && (
                <Badge className="bg-accent/20 text-accent-foreground border-accent">
                  {getSentimentLabel(dahliaAnalysis.sentiment)}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {isLoadingAnalysis ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <p className="ml-3 text-muted-foreground">
                  Dahlia is reviewing the data...
                </p>
              </div>
            ) : dahliaAnalysis ? (
              <>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {dahliaAnalysis.analysis}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                Analysis unavailable at this time.
              </p>
            )}
          </div>
        </Card>

        {isETF && (
          <Card className="p-4 space-y-4">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
              onClick={() => setEtfExpanded(!etfExpanded)}
            >
              <span className="font-semibold text-foreground">
                See what's inside 🌺
              </span>
              {etfExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>

            {etfExpanded && (
              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <p className="font-semibold text-foreground">Top 5 Holdings</p>
                  {etfHoldings.slice(0, 5).map((holding) => (
                    <div key={holding.symbol} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-semibold text-foreground">
                            {holding.symbol}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            {holding.name}
                          </span>
                        </div>
                        <span className="font-semibold text-foreground tabular-nums">
                          {holding.weight.toFixed(1)}%
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

                {sectorWeighting.length > 0 && (
                  <div className="space-y-3">
                    <p className="font-semibold text-foreground">Sector Mix</p>
                    <div className="flex flex-wrap gap-2">
                      {sectorWeighting.map((sector) => (
                        <Badge
                          key={sector.sector}
                          variant="outline"
                          className="text-xs"
                        >
                          {sector.sector} {sector.weight.toFixed(0)}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Card className="p-4 bg-accent/5 border-accent/30">
                  <p className="text-sm text-foreground leading-relaxed">
                    Basically girl, when you buy {typeof ticker === "string" ? ticker.toUpperCase() : ""} you're buying a little piece of {etfHoldings.length}+ solid companies at once. If one has a bad week the others hold it up 💪 It's like not putting all your eggs in one basket.
                  </p>
                </Card>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-2xl">💰</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      Dividend Yield
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Paid quarterly
                    </p>
                  </div>
                  <p className="text-lg font-bold text-accent tabular-nums">
                    3.5%
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Latest News
          </h2>
          <div className="space-y-3">
            {news.slice(0, 5).map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="p-4 hover:border-accent/50 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-foreground leading-snug flex-1">
                        {item.headline}
                      </p>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {formatTimestamp(item.datetime)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.source}</p>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>

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