/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PansyChat } from "@/components/PansyChat";
import { TextWithPansyTooltips } from "@/components/TextWithPansyTooltips";
import { UpgradeModal, UpgradeBanner, useViewTracker } from "@/components/UpgradeModal";
import { LockedFeatureModal } from "@/components/LockedFeatureModal";
import { PRO_PLAN } from "@/config/proPlan";
import { marketService } from "@/services/marketService";
import { ExternalLink, BarChart3, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

interface StockData {
  c: number;
  dp: number;
  name?: string;
}

interface NewsItem {
  headline: string;
  source: string;
  datetime: number;
  url: string;
  summary: string;
}

interface PansyAnalysis {
  fullText: string;
  rating: string;
  timestamp: string;
}

export default function StockPage() {
  const router = useRouter();
  const { ticker } = router.query;
  const { isPro, isLoggedIn } = useSubscription();
  
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [pansyAnalysis, setPansyAnalysis] = useState<PansyAnalysis | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLockedFeatureModal, setShowLockedFeatureModal] = useState(false);
  const { viewCount, trackView, showUpgradeModal, setShowUpgradeModal } = useViewTracker();
  
  useEffect(() => {
    if (ticker && typeof ticker === "string") {
      loadStockData(ticker.toUpperCase());
    }
  }, [ticker]);

  const loadStockData = async (symbol: string) => {
    setIsLoading(true);
    try {
      const quote = await marketService.getRealTimeQuote(symbol);

      // Fallback for news using local API route
      let newsData = [];
      try {
        const response = await fetch(`/api/stock-news?ticker=${symbol}`);
        const data = await response.json();
        if (data && Array.isArray(data)) {
          newsData = data.map((item: any) => ({
            headline: item.title,
            source: item.site || "Market News",
            datetime: new Date(item.publishedDate).getTime() / 1000,
            url: item.url,
            summary: item.text
          }));
        }
      } catch (e) {
        console.error("Error fetching news:", e);
      }

      setStockData(quote || { c: 0, dp: 0, name: symbol });
      setNews(newsData);

      // Load Pansy's analysis
      await loadPansyAnalysis(symbol, quote || { c: 0, dp: 0, name: symbol });
    } catch (error) {
      console.error("Error loading stock data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPansyAnalysis = async (symbol: string, quote: StockData) => {
    // Fetch fresh session and profile data to avoid race condition with state
    const session = await authService.getCurrentSession();
    
    // Check if user is logged in
    if (!session) {
      setShowLockedFeatureModal(true);
      return;
    }

    // Fetch user's profile to check Pro status
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro, subscription_status")
      .eq("id", session.user.id)
      .single();

    // Compute Pro status from fresh data
    const userIsPro = profile?.is_pro || profile?.subscription_status === "active";

    // Check if user is Pro - only Pro users can access full analysis
    if (!userIsPro) {
      setShowUpgradeModal(true);
      return;
    }

    // Pro users: close any modals and proceed with analysis
    setShowLockedFeatureModal(false);
    setShowUpgradeModal(false);

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ticker: symbol,
          companyName: quote.name || symbol,
          price: quote.c,
          changePercent: quote.dp,
        }),
      });

      if (response.ok) {
        const analysis = await response.json();
        setPansyAnalysis(analysis);
      }
    } catch (error) {
      console.error("Error loading Pansy analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRatingColor = (rating: string) => {
    if (rating === "Strong Watch") return "text-[#49B06E] bg-[#49B06E]/10 border-[#49B06E]/20";
    if (rating === "Watch") return "text-[#27B7C8] bg-[#27B7C8]/10 border-[#27B7C8]/20";
    if (rating === "High Risk" || rating === "Avoid") return "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20";
    return "text-muted-foreground bg-muted border-border";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-full py-8 pb-24 flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading stock data...</p>
        </div>
      </Layout>
    );
  }

  if (!stockData) {
    return (
      <Layout>
        <div className="container-full py-8 pb-24">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Stock data not available</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-full py-8 space-y-6 pb-24">
        {/* Stock Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/discover" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Discover
            </Link>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            {stockData.name || ticker}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold text-foreground">
              ${stockData.c.toFixed(2)}
            </p>
            <Badge
              className={
                stockData.dp >= 0
                  ? "bg-[#49B06E]/20 text-[#49B06E]"
                  : "bg-[#ef4444]/20 text-[#ef4444]"
              }
            >
              {stockData.dp >= 0 ? "+" : ""}
              {stockData.dp.toFixed(2)}%
            </Badge>
            {pansyAnalysis && (
              <Badge className={getRatingColor(pansyAnalysis.rating)}>
                {pansyAnalysis.rating}
              </Badge>
            )}
          </div>
        </div>

        {/* Prominent Pansy Analysis CTA */}
        {!pansyAnalysis && !isAnalyzing && (
          <Card className="p-6 bg-gradient-to-br from-[#27B7C8]/20 to-[#27B7C8]/10 border-[#27B7C8] border-2 animate-pulse-glow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl shrink-0 shadow-lg">
                🌺
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold text-foreground">Want Pansy's full breakdown?</h3>
                <p className="text-sm text-muted-foreground">Get her take in plain English — no jargon.</p>
              </div>
              <Button
                onClick={() => loadPansyAnalysis(ticker as string, stockData)}
                className="bg-[#27B7C8] hover:bg-[#27B7C8]/90 text-[#0E1B30] font-semibold px-6 py-3 text-base shadow-lg shrink-0"
              >
                {isPro ? (
                  <>✨ Get Pansy's Take</>
                ) : (
                  <><Lock className="w-4 h-4 mr-2 inline" />Get Pansy's Take <Badge className="ml-2 bg-white/20 text-white text-xs">Pro</Badge></>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* TradingView Chart */}
        <Card className="p-6 bg-[#0E1B30] border-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-foreground" />
              <h2 className="font-semibold text-foreground">Live Chart</h2>
            </div>
          </div>
          
          <div className="w-full h-[400px] rounded-lg overflow-hidden mt-4 bg-[#0E1B30] relative border border-white/5">
            {ticker && (
              <iframe 
                src={`https://s.tradingview.com/widgetembed/?symbol=${ticker}&interval=D&theme=dark&studies=RSI@tv-basicstudies&studies=VWAP@tv-basicstudies`}
                width="100%" 
                height="400"
                frameBorder="0"
              />
            )}
          </div>
        </Card>

        {/* Pansy's Analysis */}
        {isAnalyzing ? (
          <Card className="p-8 border-[#27B7C8] animate-pulse-glow">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-3xl animate-bounce">
                🌺
              </div>
              <div className="flex items-center gap-2">
                <p className="text-foreground font-medium">Pansy is analyzing this for you</p>
                <span className="animate-pulse">...</span>
              </div>
              <p className="text-sm text-muted-foreground">This usually takes 5-10 seconds</p>
            </div>
          </Card>
        ) : pansyAnalysis ? (
          <Card className="p-6 bg-card border-[#27B7C8] border-2 rounded-2xl space-y-5 animate-slide-up shadow-lg shadow-[#27B7C8]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl shrink-0 shadow-lg">
                🌺
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">Pansy&apos;s Analysis</p>
                <p className="text-sm text-muted-foreground">Bloom&apos;s Investing Expert</p>
              </div>
              {pansyAnalysis.rating && (
                <Badge className={getRatingColor(pansyAnalysis.rating)}>
                  {pansyAnalysis.rating}
                </Badge>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed space-y-4">
              {pansyAnalysis.fullText.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed">
                  <TextWithPansyTooltips text={paragraph} />
                </p>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                This platform is for educational and informational purposes only. It is not financial advice. Investing and trading involve risk, including possible loss of principal. Always do your own research or consult a licensed financial professional.
              </p>
            </div>
          </Card>
        ) : null}

        {/* Upgrade Banner for Free Users After Analysis */}
        {pansyAnalysis && !isPro && isLoggedIn && (
          <UpgradeBanner message={`Loved Pansy's take? Get unlimited analysis with Bloom Pro — $${PRO_PLAN.monthlyPrice}/month`} />
        )}

        {/* Sign-Up CTA for Logged-Out Users */}
        {pansyAnalysis && !isLoggedIn && (
          <Card className="p-6 bg-gradient-to-br from-accent/20 to-primary/20 border-accent border-2 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl shrink-0 shadow-lg">
                🌺
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Want the full breakdown?
                </h3>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  Pansy breaks down the business, the bull and bear case, and the real risks in plain English — free the moment you sign up.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg">
                  Create free account
                </Button>
              </Link>
              <Button 
                variant="outline"
                onClick={() => loadPansyAnalysis(ticker as string, stockData!)}
                className="flex-1 border-accent/50 hover:bg-accent/10"
              >
                Quick take
              </Button>
            </div>
          </Card>
        )}

        {/* Upgrade Modal */}
        <UpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)}
          trigger={pansyAnalysis ? "after_analysis" : "view_limit"}
        />

        {/* Locked Feature Modal for Logged-Out Users */}
        <LockedFeatureModal
          isOpen={showLockedFeatureModal}
          onClose={() => setShowLockedFeatureModal(false)}
          featureName={`Pansy's full breakdown of ${ticker}`}
          featureDescription="Get her take in plain English — no jargon."
        />

        {/* Latest News */}
        {news.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground">Latest News</h2>
            {news.map((item, index) => (
              <Card key={index} className="p-4 border-border hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary line-clamp-2"
                    >
                      {item.headline}
                    </a>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{new Date(item.datetime * 1000).toLocaleDateString()}</span>
                    </div>
                    {item.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(item.url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Pansy Chat */}
        {ticker && stockData && (
          <PansyChat
            ticker={ticker as string}
            companyName={stockData.name || (ticker as string)}
            currentPrice={stockData.c}
            analysisContext={pansyAnalysis?.fullText}
          />
        )}
      </div>
    </Layout>
  );
}