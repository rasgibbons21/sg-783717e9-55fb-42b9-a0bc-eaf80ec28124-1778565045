import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { marketService } from "@/services/marketService";
import { TrendingUp, Sparkles, Shield, BarChart3, Users, DollarSign, Target } from "lucide-react";
import { SEO } from "@/components/SEO";

interface FeaturedStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function LandingPage() {
  const router = useRouter();
  const [showDahliaModal, setShowDahliaModal] = useState(false);
  const [featuredStocks, setFeaturedStocks] = useState<FeaturedStock[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
    loadFeaturedStocks();
  }, []);

  const checkAuthAndRedirect = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (user?.experience_level) {
        router.push("/home");
        return;
      }
    }
    
    setIsCheckingAuth(false);
  };

  const loadFeaturedStocks = async () => {
    const tickers = ["AAPL", "SCHD", "NVDA"];
    const stocks: FeaturedStock[] = [];

    for (const ticker of tickers) {
      const quote = await marketService.getQuote(ticker);
      if (quote) {
        stocks.push({
          ticker,
          name: ticker === "AAPL" ? "Apple Inc." : ticker === "SCHD" ? "Schwab US Dividend ETF" : "NVIDIA Corporation",
          price: quote.c,
          change: quote.d ?? 0,
          changePercent: quote.dp ?? 0,
        });
      }
    }

    setFeaturedStocks(stocks);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Bloom...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Bloom - Investing Made Simple for Women" 
        description="Your money. Your terms. Your future. Join thousands of women taking control of their financial future with Dahlia, your personal investing guide."
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-2xl">🌸</span>
              </div>
              <span className="font-serif text-2xl font-bold text-foreground">Bloom</span>
            </div>
            <Link href="/onboarding">
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
          <div className="relative max-w-6xl mx-auto px-4 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="font-serif text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Your money.<br />
                    Your terms.<br />
                    <span className="text-accent">Your future.</span>
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Join thousands of women taking control of their financial future. 
                    No jargon, no pressure—just real talk about investing with Dahlia, your expert guide.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/onboarding">
                    <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg h-14 px-8">
                      Start Investing
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg h-14 px-8"
                    onClick={() => setShowDahliaModal(true)}
                  >
                    Meet Dahlia →
                  </Button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                  <div>
                    <div className="flex items-center gap-2 text-accent mb-1">
                      <Users className="w-5 h-5" />
                      <p className="text-2xl font-bold text-foreground">12K+</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Women Investors</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-accent mb-1">
                      <TrendingUp className="w-5 h-5" />
                      <p className="text-2xl font-bold text-foreground">$2.4M</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Analyzed Weekly</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-accent mb-1">
                      <Target className="w-5 h-5" />
                      <p className="text-2xl font-bold text-foreground">500+</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Daily Picks</p>
                  </div>
                </div>
              </div>

              {/* Dahlia Card */}
              <Card className="relative p-8 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 backdrop-blur">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                
                <div className="relative space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-3xl">🌺</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-foreground">Meet Dahlia</h3>
                      <p className="text-sm text-accent font-semibold">Bloom's Investing Expert</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-foreground leading-relaxed italic">
                      "Hi! I'm Dahlia, and I know everything about investing—but I promise to explain it like we're having brunch, not a finance lecture. No confusing jargon, no pressure. Just real talk about growing your money in a way that actually makes sense 💛"
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      <p className="text-sm text-muted-foreground">Available 24/7 to guide your investing journey</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* How Bloom Works */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="font-serif text-4xl font-bold text-foreground">
                How Bloom Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to start investing with confidence
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 space-y-4 border-l-4 border-l-accent hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">1</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Share Your Goals
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tell us about your investing experience, goals, and comfort level. 
                  No judgment—just honesty about where you're starting from.
                </p>
              </Card>

              <Card className="p-8 space-y-4 border-l-4 border-l-primary hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Get Personalized Picks
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dahlia analyzes the market daily and shares picks tailored to your profile. 
                  Every recommendation comes with plain-language analysis you'll actually understand.
                </p>
              </Card>

              <Card className="p-8 space-y-4 border-l-4 border-l-accent hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">3</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Invest With Confidence
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Use any broker you like—we connect you to the best platforms. 
                  Track your portfolio, learn as you go, and build wealth on your own terms.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Stocks */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="font-serif text-4xl font-bold text-foreground">
                Today's Featured Picks
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what Dahlia's watching today—real-time data, real insights
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredStocks.map((stock) => (
                <Card key={stock.ticker} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-xl text-foreground">{stock.ticker}</p>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </div>
                      <Badge
                        variant={stock.changePercent >= 0 ? "default" : "destructive"}
                        className={
                          stock.changePercent >= 0
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : ""
                        }
                      >
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </Badge>
                    </div>

                    <div>
                      <p className="text-3xl font-bold text-foreground tabular-nums">
                        {formatPrice(stock.price)}
                      </p>
                      <p
                        className={`text-sm font-semibold tabular-nums ${
                          stock.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stock.change >= 0 ? "+" : ""}
                        {formatPrice(stock.change)} today
                      </p>
                    </div>

                    <Link href="/onboarding">
                      <Button variant="outline" className="w-full">
                        See Dahlia's Analysis →
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/onboarding">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted and we never share your information
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">Educational Only</h3>
                <p className="text-sm text-muted-foreground">
                  We provide insights, not financial advice—you stay in control
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Start Free</h3>
                <p className="text-sm text-muted-foreground">
                  No credit card required to explore Bloom and meet Dahlia
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-xl">🌸</span>
                </div>
                <span className="font-serif text-xl font-bold text-foreground">Bloom</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                © 2026 Bloom. Educational content only. Not financial advice.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/onboarding" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Dahlia Modal */}
      {showDahliaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDahliaModal(false)}>
          <Card className="max-w-lg w-full p-8 space-y-6 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowDahliaModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
                <span className="text-4xl">🌺</span>
              </div>
              <div>
                <h3 className="font-serif text-3xl font-bold text-foreground">Dahlia</h3>
                <p className="text-accent font-semibold">Bloom's Investing Expert</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-foreground leading-relaxed">
                Hi, I'm Dahlia! 🌸 I know everything about investing, but I promise to explain it like we're chatting over coffee—no confusing finance-bro talk.
              </p>
              <p className="text-foreground leading-relaxed">
                Every day, I analyze thousands of stocks, ETFs, and funds to find opportunities that match your goals. Then I break down what's happening in plain language you'll actually understand.
              </p>
              <p className="text-foreground leading-relaxed">
                Whether you're just starting or you've been investing for years, I'm here to make sense of the market and help you make confident decisions about your money. No pressure, no judgment—just honest guidance 💛
              </p>
            </div>

            <Link href="/onboarding">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12" onClick={() => setShowDahliaModal(false)}>
                Start Investing With Dahlia
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </>
  );
}