import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { DahliaPopup } from "@/components/DahliaPopup";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/userService";
import { marketService, Quote } from "@/services/marketService";
import { dahliaAnalysisService } from "@/services/dahliaAnalysisService";
import { TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/integrations/supabase/types";

type User = Database["public"]["Tables"]["users"]["Row"];

interface StockPick {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  insight: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [marketIndices, setMarketIndices] = useState<Record<string, Quote>>({});
  const [dahliasPicks, setDahliasPicks] = useState<StockPick[]>([]);
  const [showDahliaPopup, setShowDahliaPopup] = useState(false);

  useEffect(() => {
    loadUserData();
    loadMarketData();
    loadDahliasPicks();
    checkFirstVisit();
  }, []);

  const checkFirstVisit = () => {
    const hasVisited = sessionStorage.getItem("dahlia-popup-returning");
    if (!hasVisited) {
      setShowDahliaPopup(true);
    }
  };

  const loadUserData = async () => {
    const userData = await userService.getCurrentUser();
    setUser(userData);
    
    if (userData) {
      await userService.updateLastActive(userData.id);
    }
  };

  const loadMarketData = async () => {
    const indices = await marketService.getMarketIndices();
    setMarketIndices(indices);
  };

  const loadDahliasPicks = async () => {
    const picks: StockPick[] = [
      {
        ticker: "AAPL",
        name: "Apple Inc.",
        price: 0,
        change: 0,
        changePercent: 0,
        insight: "Loading Dahlia's analysis...",
      },
      {
        ticker: "SCHD",
        name: "Schwab US Dividend Equity ETF",
        price: 0,
        change: 0,
        changePercent: 0,
        insight: "Loading Dahlia's analysis...",
      },
      {
        ticker: "NVDA",
        name: "NVIDIA Corporation",
        price: 0,
        change: 0,
        changePercent: 0,
        insight: "Loading Dahlia's analysis...",
      },
    ];

    // Load prices and AI-generated insights in parallel
    const picksWithData = await Promise.all(
      picks.map(async (pick) => {
        const [quote, analysis] = await Promise.all([
          marketService.getQuote(pick.ticker),
          dahliaAnalysisService.generateAnalysis(pick.ticker, pick.ticker === "SCHD"),
        ]);

        // Extract first sentence from analysis as insight
        let insight = pick.insight;
        if (analysis && analysis.analysis) {
          const sentences = analysis.analysis.split(/[.!?]/);
          const firstSentence = sentences.find(s => s.trim().length > 20);
          if (firstSentence) {
            insight = firstSentence.trim() + " 🌟";
          }
        }

        if (quote) {
          return {
            ...pick,
            price: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            insight,
          };
        }
        return { ...pick, insight };
      })
    );

    setDahliasPicks(picksWithData);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatIndexName = (index: string) => {
    const names: Record<string, string> = {
      "^GSPC": "S&P 500",
      "^IXIC": "NASDAQ",
      "^DJI": "DOW",
      "^VIX": "VIX",
    };
    return names[index] || index;
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-foreground">
                {user?.full_name ? `Hi ${user.full_name.split(" ")[0]}` : "Welcome"} 🌸
              </h1>
              {user?.plan_type === "pro" && (
                <Badge className="bg-accent text-accent-foreground font-semibold">
                  Pro
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Here's what's happening in the market today
            </p>
          </div>

          <Card className="p-4 bg-card">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(marketIndices).map(([index, quote]) => (
                <div key={index} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatIndexName(index)}
                  </p>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    {quote.c.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1">
                    {quote.d >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        quote.d >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {quote.d >= 0 ? "+" : ""}
                      {quote.dp.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Dahlia's Picks Today 🌺
              </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {dahliasPicks.map((pick) => (
                <Card
                  key={pick.ticker}
                  className="flex-shrink-0 w-72 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-foreground text-lg">
                        {pick.ticker}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {pick.name}
                      </p>
                    </div>
                    <Badge
                      variant={pick.changePercent >= 0 ? "default" : "destructive"}
                      className={
                        pick.changePercent >= 0
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : ""
                      }
                    >
                      {pick.changePercent >= 0 ? "+" : ""}
                      {pick.changePercent.toFixed(2)}%
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                      {formatPrice(pick.price)}
                    </p>
                    <p
                      className={`text-sm font-semibold tabular-nums ${
                        pick.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {pick.change >= 0 ? "+" : ""}
                      {formatPrice(pick.change)}
                    </p>
                  </div>

                  <Card className="p-3 border-accent border-l-4 bg-accent/5">
                    <p className="text-sm italic text-foreground leading-relaxed">
                      {pick.insight}
                    </p>
                  </Card>

                  <Link href={`/stock/${pick.ticker}`}>
                    <Button variant="outline" className="w-full">
                      Read Dahlia's take →
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-3 bg-muted border-muted-foreground/20">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Educational content only. Not financial advice. Bloom is not liable
              for any investment decisions or losses.
            </p>
          </Card>
        </div>
      </div>

      {showDahliaPopup && user && (
        <DahliaPopup type="returning" userName={user.full_name?.split(" ")[0]} />
      )}
    </Layout>
  );
}