import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { marketService, Quote, NewsItem } from "@/services/marketService";
import { dahliaAnalysisService, DahliaAnalysis } from "@/services/dahliaAnalysisService";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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

interface SectorNewsItem {
  sector: string;
  headline: string;
  source: string;
  url: string;
  timestamp: number;
  dahliaReaction: string;
}

export default function StockAnalysis() {
  const router = useRouter();
  const { ticker } = router.query;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [dahliaAnalysis, setDahliaAnalysis] = useState<DahliaAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isETF, setIsETF] = useState(false);
  const [etfExpanded, setEtfExpanded] = useState(false);
  const [etfHoldings, setEtfHoldings] = useState<ETFHolding[]>([]);
  const [sectorWeighting, setSectorWeighting] = useState<SectorWeighting[]>([]);
  const [sectorNews, setSectorNews] = useState<SectorNewsItem[]>([]);
  const [isLoadingSectorNews, setIsLoadingSectorNews] = useState(false);
  const [chartInterval, setChartInterval] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1D");

  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadStockData(ticker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const sectorData = sectors.map(s => ({
        sector: s.sector,
        weight: s.weightPercentage
      }));
      setSectorWeighting(sectorData);

      // Load sector news for top 3 sectors
      loadSectorNews(symbol, sectorData.slice(0, 3));
    }

    // Generate AI-powered Dahlia analysis
    setIsLoadingAnalysis(true);
    const analysis = await dahliaAnalysisService.generateAnalysis(symbol, isETFCheck);
    setDahliaAnalysis(analysis);
    setIsLoadingAnalysis(false);
  };

  const loadSectorNews = async (etfTicker: string, topSectors: SectorWeighting[]) => {
    setIsLoadingSectorNews(true);
    let allSectorNews: SectorNewsItem[] = [];

    for (const sector of topSectors) {
      const newsItems = await marketService.getSectorNews(sector.sector);
      
      const sectorReactions = await Promise.all(
        newsItems.slice(0, 3).map(async (newsItem) => {
          const reaction = await dahliaAnalysisService.generateSectorNewsReaction(
            newsItem.headline,
            sector.sector,
            etfTicker
          );

          return {
            sector: sector.sector,
            headline: newsItem.headline,
            source: newsItem.source,
            url: newsItem.url,
            timestamp: newsItem.datetime,
            dahliaReaction: reaction,
          };
        })
      );
      
      allSectorNews = [...allSectorNews, ...sectorReactions];
    }

    setSectorNews(allSectorNews);
    setIsLoadingSectorNews(false);
  };

  const formatPrice = (price: number | undefined | null) => {
    if (price == null) return "$0.00";
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
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">
                  {ticker.toUpperCase()}
                </h1>
                <p className="text-muted-foreground">Stock Analysis</p>
              </div>
              <Badge
                variant={(quote?.dp ?? 0) >= 0 ? "default" : "destructive"}
                className={`text-base px-3 py-1 ${
                  (quote?.dp ?? 0) >= 0
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : ""
                }`}
              >
                {(quote?.dp ?? 0) >= 0 ? "+" : ""}
                {quote?.dp != null ? quote.dp.toFixed(2) : '0.00'}%
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-4xl font-bold text-foreground tabular-nums">
                {formatPrice(quote?.c)}
              </p>
              <p
                className={`text-lg font-semibold tabular-nums ${
                  (quote?.d ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {(quote?.d ?? 0) >= 0 ? "+" : ""}
                {formatPrice(quote?.d)} today
              </p>
            </div>
          </div>

          <Card className="p-4">
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {["1D", "1W", "1M", "3M", "1Y"].map((interval) => (
                <Button
                  key={interval}
                  variant={chartInterval === interval ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartInterval(interval as any)}
                >
                  {interval}
                </Button>
              ))}
            </div>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                TradingView chart for {ticker.toUpperCase()} - {chartInterval}
              </p>
            </div>
          </Card>

          {isLoadingAnalysis ? (
            <Card className="p-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            </Card>
          ) : dahliaAnalysis ? (
            <Card className="p-6 space-y-4 border-accent">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/80 to-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌺</span>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Dahlia</h3>
                    <Badge variant="outline" className="text-xs">
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

              <Card className="p-3 bg-muted border-muted-foreground/20">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This is just educational info — not financial advice. Always invest
                  what feels right for you 💛 — Dahlia
                </p>
              </Card>
            </Card>
          ) : null}

          {isETF && (
            <Card className="p-6 space-y-4">
              <Button
                variant="ghost"
                onClick={() => setEtfExpanded(!etfExpanded)}
                className="w-full flex items-center justify-between"
              >
                <span className="font-semibold text-foreground">
                  See what's inside 🌺
                </span>
                {etfExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </Button>

              {etfExpanded && (
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

                  {sectorWeighting.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">
                        Sector Breakdown
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {sectorWeighting.map((sector, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {sector.sector}: {sector.weight.toFixed(1)}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Card className="p-4 bg-accent/5 border-accent">
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

          {news.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Latest News
              </h2>
              <div className="space-y-3">
                {news.slice(0, 5).map((article, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {article.source} •{" "}
                        {new Date(article.datetime * 1000).toLocaleDateString()}
                      </p>
                      <h3 className="font-semibold text-foreground">
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
                          className="text-sm text-accent hover:underline"
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

          <Card className="p-3 bg-muted border-muted-foreground/20">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              This is educational content only and does not constitute financial
              advice. Bloom is not liable for any investment decisions or losses.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}