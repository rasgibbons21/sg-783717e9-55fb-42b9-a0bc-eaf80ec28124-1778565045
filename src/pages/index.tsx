 
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { marketService } from "@/services/marketService";
import { 
  BookOpen, 
  BarChart3, 
  PieChart, 
  Target, 
  TrendingUp,
  Bell,
  ArrowRight,
  Sparkles
} from "lucide-react";
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
  const [featuredETF, setFeaturedETF] = useState<FeaturedStock | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
    loadFeaturedETF();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const loadFeaturedETF = async () => {
    const quote = await marketService.getRealTimeQuote("VOO");
    if (quote) {
      setFeaturedETF({
        ticker: "VOO",
        name: "Vanguard S&P 500 ETF",
        price: quote.c,
        change: quote.d ?? 0,
        changePercent: quote.dp ?? 0,
      });
    }
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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#FAF7F2" }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#C4714A", borderTopColor: "transparent" }} />
          <p style={{ color: "#2D4A3E" }}>Loading Bloom...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Bloom - Investing Made Simple for Women" 
        description="Invest with Confidence. Bloom Into Wealth. Your all-in-one space to learn investing, analyze stocks, build wealth, and become the woman your future self is proud of."
      />
      
      <div className="min-h-screen" style={{ backgroundColor: "#FAF7F2" }}>
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: "rgba(250, 247, 242, 0.95)", borderBottom: "1px solid rgba(45, 74, 62, 0.1)" }}>
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Left - Logo + Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2D4A3E 0%, #D4AF6A 100%)" }}>
                <span className="text-2xl">🌸</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold block" style={{ color: "#2D4A3E" }}>Bloom</span>
                <span className="text-xs tracking-wide" style={{ color: "#2D4A3E", opacity: 0.6 }}>Invest. Grow.</span>
              </div>
            </div>

            {/* Center - Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/home" className="text-sm font-medium transition-colors" style={{ color: "#2D4A3E" }}>
                Home
              </Link>
              <Link href="/learn" className="text-sm font-medium transition-colors" style={{ color: "#2D4A3E" }}>
                Learn
              </Link>
              <Link href="/discover" className="text-sm font-medium transition-colors" style={{ color: "#2D4A3E" }}>
                Analyze
              </Link>
              <Link href="/portfolio" className="text-sm font-medium transition-colors" style={{ color: "#2D4A3E" }}>
                Portfolio
              </Link>
              <Link href="/goals" className="text-sm font-medium transition-colors" style={{ color: "#2D4A3E" }}>
                Discipline
              </Link>
              <Link href="/subscription" className="text-sm font-semibold transition-colors" style={{ color: "#D4AF6A" }}>
                Bloom Pro
              </Link>
            </nav>

            {/* Right - Bell + Sign In */}
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: "rgba(45, 74, 62, 0.05)" }}>
                <Bell className="w-5 h-5" style={{ color: "#2D4A3E" }} />
              </button>
              <Link href="/onboarding">
                <Button className="font-semibold" style={{ backgroundColor: "#C4714A", color: "white" }}>
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section - Two Columns */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Welcome */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#C4714A" }}>
                    WELCOME TO SHE BLOOMS WEALTH
                  </p>
                  <h1 className="font-serif text-5xl lg:text-6xl font-bold leading-tight" style={{ color: "#2D4A3E" }}>
                    Invest with Confidence.{" "}
                    <span style={{ color: "#C4714A" }}>Bloom Into Wealth.</span>
                  </h1>
                  <p className="text-lg leading-relaxed" style={{ color: "#2D4A3E", opacity: 0.8 }}>
                    Your all-in-one space to learn investing, analyze stocks, build wealth, and become the woman your future self is proud of.
                  </p>
                </div>

                {/* Pill Row */}
                <div className="flex flex-wrap gap-3">
                  {["Learn", "Analyze", "Invest", "Grow"].map((item) => (
                    <div key={item} className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.15)", color: "#2D4A3E" }}>
                      {item}
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/learn">
                    <Button size="lg" className="w-full sm:w-auto font-semibold text-base px-8 py-6" style={{ backgroundColor: "#C4714A", color: "white" }}>
                      Start Learning
                    </Button>
                  </Link>
                  <Link href="/discover">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold text-base px-8 py-6" style={{ borderColor: "#2D4A3E", color: "#2D4A3E" }}>
                      Analyze a Stock
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column - Pansy's Daily Market Thought */}
              <Card className="p-8 space-y-6 shadow-lg" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #D4AF6A 0%, #C4714A 100%)" }}>
                    <span className="text-2xl">🌺</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold" style={{ color: "#2D4A3E" }}>
                      Pansy's Daily Market Thought
                    </h3>
                    <p className="text-sm" style={{ color: "#2D4A3E", opacity: 0.6 }}>Your guide to today's market</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-base leading-relaxed italic" style={{ color: "#2D4A3E", opacity: 0.9 }}>
                    "Good morning! The S&P is holding steady this week, which is exactly what we want to see — no drama, just consistent growth. Remember, boring markets build wealth faster than exciting ones 💛"
                  </p>

                  <div className="pt-4 space-y-3" style={{ borderTop: "1px solid rgba(45, 74, 62, 0.1)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: "#2D4A3E", opacity: 0.7 }}>Today's Sentiment</span>
                      <Badge className="font-medium" style={{ backgroundColor: "rgba(45, 74, 62, 0.1)", color: "#2D4A3E" }}>
                        Steady & Optimistic
                      </Badge>
                    </div>

                    {featuredETF && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: "#2D4A3E", opacity: 0.7 }}>Featured ETF</span>
                        <div className="text-right">
                          <p className="font-semibold font-mono" style={{ color: "#2D4A3E" }}>{featuredETF.ticker}</p>
                          <p className="text-xs font-mono" style={{ color: featuredETF.changePercent >= 0 ? "#10b981" : "#ef4444" }}>
                            {formatPrice(featuredETF.price)} {featuredETF.changePercent >= 0 ? "+" : ""}{featuredETF.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4" style={{ borderTop: "1px solid rgba(45, 74, 62, 0.1)" }}>
                  <p className="text-xs text-center" style={{ color: "#2D4A3E", opacity: 0.6 }}>
                    Pansy is here to guide you every step of your wealth journey.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Cards - 5 Cards Row */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Card 1 - Learn Stocks & ETFs */}
              <Card className="p-6 space-y-4 hover:shadow-xl transition-shadow" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(45, 74, 62, 0.1)" }}>
                  <BookOpen className="w-6 h-6" style={{ color: "#2D4A3E" }} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold" style={{ color: "#2D4A3E" }}>
                    Learn Stocks & ETFs
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Plain-language lessons on investing fundamentals
                  </p>
                </div>
                <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: "#C4714A" }}>
                  Explore <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>

              {/* Card 2 - Analyze Any Stock */}
              <Card className="p-6 space-y-4 hover:shadow-xl transition-shadow" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(45, 74, 62, 0.1)" }}>
                  <BarChart3 className="w-6 h-6" style={{ color: "#2D4A3E" }} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold" style={{ color: "#2D4A3E" }}>
                    Analyze Any Stock
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Get Pansy's breakdown on any ticker in seconds
                  </p>
                </div>
                <Link href="/discover" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: "#C4714A" }}>
                  Search <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>

              {/* Card 3 - Portfolio Tracker */}
              <Card className="p-6 space-y-4 hover:shadow-xl transition-shadow" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(45, 74, 62, 0.1)" }}>
                  <PieChart className="w-6 h-6" style={{ color: "#2D4A3E" }} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold" style={{ color: "#2D4A3E" }}>
                    Portfolio Tracker
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Track your investments and watch them grow
                  </p>
                </div>
                <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: "#C4714A" }}>
                  Track <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>

              {/* Card 4 - Discipline Center */}
              <Card className="p-6 space-y-4 hover:shadow-xl transition-shadow" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(45, 74, 62, 0.1)" }}>
                  <Target className="w-6 h-6" style={{ color: "#2D4A3E" }} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold" style={{ color: "#2D4A3E" }}>
                    Discipline Center
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Set goals, track progress, build wealth habits
                  </p>
                </div>
                <Link href="/goals" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: "#C4714A" }}>
                  Start <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>

              {/* Card 5 - Side Hustle Investments */}
              <Card className="p-6 space-y-4 hover:shadow-xl transition-shadow" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(45, 74, 62, 0.1)" }}>
                  <TrendingUp className="w-6 h-6" style={{ color: "#2D4A3E" }} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold" style={{ color: "#2D4A3E" }}>
                    Side Hustle Investments
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Learn income streams beyond the stock market
                  </p>
                </div>
                <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: "#C4714A" }}>
                  Learn <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16" style={{ backgroundColor: "rgba(45, 74, 62, 0.03)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <p className="font-serif text-4xl font-bold font-mono" style={{ color: "#2D4A3E" }}>12K+</p>
                <p className="text-sm" style={{ color: "#2D4A3E", opacity: 0.7 }}>Women Investors</p>
              </div>
              <div className="space-y-2">
                <p className="font-serif text-4xl font-bold font-mono" style={{ color: "#2D4A3E" }}>$2.4M</p>
                <p className="text-sm" style={{ color: "#2D4A3E", opacity: 0.7 }}>Analyzed Weekly</p>
              </div>
              <div className="space-y-2">
                <p className="font-serif text-4xl font-bold font-mono" style={{ color: "#2D4A3E" }}>500+</p>
                <p className="text-sm" style={{ color: "#2D4A3E", opacity: 0.7 }}>Daily Picks</p>
              </div>
              <div className="space-y-2">
                <p className="font-serif text-4xl font-bold font-mono" style={{ color: "#D4AF6A" }}>Pro</p>
                <p className="text-sm" style={{ color: "#2D4A3E", opacity: 0.7 }}>Premium Tools</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "rgba(212, 175, 106, 0.1)" }}>
                <Sparkles className="w-4 h-4" style={{ color: "#D4AF6A" }} />
                <span className="text-sm font-semibold" style={{ color: "#D4AF6A" }}>Ready to Start?</span>
              </div>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold" style={{ color: "#2D4A3E" }}>
                Join Thousands of Women Building Wealth
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                Start learning, analyzing, and investing today. No credit card required.
              </p>
            </div>
            <Link href="/onboarding">
              <Button size="lg" className="font-semibold text-lg px-10 py-7" style={{ backgroundColor: "#C4714A", color: "white" }}>
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12" style={{ backgroundColor: "rgba(45, 74, 62, 0.03)", borderTop: "1px solid rgba(45, 74, 62, 0.1)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2D4A3E 0%, #D4AF6A 100%)" }}>
                  <span className="text-xl">🌸</span>
                </div>
                <span className="font-serif text-xl font-bold" style={{ color: "#2D4A3E" }}>Bloom</span>
              </div>
              <p className="text-sm text-center" style={{ color: "#2D4A3E", opacity: 0.6 }}>
                © 2026 Bloom. Educational content only. Not financial advice.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                  Privacy
                </Link>
                <Link href="/terms" className="text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                  Terms
                </Link>
                <Link href="/contact" className="text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}