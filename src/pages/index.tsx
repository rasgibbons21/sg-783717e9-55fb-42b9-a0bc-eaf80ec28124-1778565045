import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
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
  const [marketQuotes, setMarketQuotes] = useState<Record<string, FeaturedStock>>({});
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  useEffect(() => {
    checkAuthAndRedirect();
    loadFeaturedETF();
    loadMarketQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMarketQuotes = async () => {
    const tickers = ["AAPL", "SPY", "QQQ", "NVDA", "MSFT"];
    const quotes: Record<string, FeaturedStock> = {};
    
    for (const ticker of tickers) {
      const quote = await marketService.getRealTimeQuote(ticker);
      if (quote) {
        quotes[ticker] = {
          ticker,
          name: getStockName(ticker),
          price: quote.c,
          change: quote.d ?? 0,
          changePercent: quote.dp ?? 0,
        };
      }
    }
    
    setMarketQuotes(quotes);
  };

  const getStockName = (ticker: string) => {
    const names: Record<string, string> = {
      AAPL: "Apple Inc.",
      SPY: "SPDR S&P 500 ETF",
      QQQ: "Invesco QQQ Trust",
      NVDA: "NVIDIA Corporation",
      MSFT: "Microsoft Corporation",
    };
    return names[ticker] || ticker;
  };

  const checkAuthAndRedirect = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", session.user.id)
        .single();
      if (profile?.onboarding_complete) { router.push("/home"); return; }
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
                <span className="text-xs tracking-wide" style={{ color: "#2D4A3E", opacity: 0.6 }}>Learn. Grow. Thrive.</span>
              </div>
            </div>

            {/* Center - Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#2D4A3E" }}>
                Home
              </Link>
              <Link href="/learn" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#2D4A3E" }}>
                Learn
              </Link>
              <Link href="/discover" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#2D4A3E" }}>
                Analyze
              </Link>
              <Link href="/portfolio" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#2D4A3E" }}>
                Portfolio
              </Link>
              <Link href="/goals" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#2D4A3E" }}>
                Discipline
              </Link>
              <Link href="/subscription" className="text-sm font-semibold transition-colors hover:opacity-80" style={{ color: "#D4AF6A" }}>
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
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Welcome */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#C4714A" }}>
                    WELCOME TO SHE BLOOMS WEALTH
                  </p>
                  <h1 className="font-serif text-5xl lg:text-6xl font-bold leading-tight" style={{ color: "#2D4A3E" }}>
                    Become the Woman Your Future Self Thanks You For.
                  </h1>
                  <p className="text-xl font-medium leading-relaxed" style={{ color: "#C4714A" }}>
                    Learn money skills. Build confidence. Create lasting wealth.
                  </p>
                  <p className="text-lg leading-relaxed" style={{ color: "#2D4A3E", opacity: 0.8 }}>
                    Your all-in-one space to learn investing, understand money, analyze opportunities, and build the future you deserve.
                  </p>
                </div>

                {/* Pill Row */}
                <div className="flex flex-wrap gap-3">
                  {([
                    { label: "Learn", href: "/learn" },
                    { label: "Analyze", href: "/discover" },
                    { label: "Invest", href: "/portfolio" },
                    { label: "Grow", href: "/goals" },
                  ] as const).map(({ label, href }) => (
                    <Link key={label} href={href} className="px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.15)", color: "#2D4A3E" }}>
                      {label}
                    </Link>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/learn">
                    <Button size="lg" className="w-full sm:w-auto font-semibold text-base px-8 py-6" style={{ backgroundColor: "#C4714A", color: "white" }}>
                      Start Learning
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold text-base px-8 py-6" style={{ borderColor: "#2D4A3E", color: "#2D4A3E" }}>
                      See How It Works
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column - Hero Image */}
              <div className="relative w-full h-[500px] rounded-[20px] overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(45, 74, 62, 0.15)" }}>
                <Image
                  src="/bloom-hero.jpg"
                  alt="Woman working on laptop in warm sunlit room"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pansy's Daily Market Thought - Full Width Strip */}
        <section className="py-12" style={{ backgroundColor: "rgba(45, 74, 62, 0.03)" }}>
          <div className="max-w-7xl mx-auto px-6">
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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-base leading-relaxed italic" style={{ color: "#2D4A3E", opacity: 0.9 }}>
                    "Good morning! The S&P is holding steady this week, which is exactly what we want to see — no drama, just consistent growth. Remember, boring markets build wealth faster than exciting ones 💛"
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "rgba(45, 74, 62, 0.05)" }}>
                    <span className="text-sm font-medium" style={{ color: "#2D4A3E", opacity: 0.7 }}>Today's Sentiment</span>
                    <Badge className="font-medium" style={{ backgroundColor: "rgba(45, 74, 62, 0.1)", color: "#2D4A3E" }}>
                      Steady & Optimistic
                    </Badge>
                  </div>

                  {featuredETF && (
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "rgba(45, 74, 62, 0.05)" }}>
                      <span className="text-sm font-medium" style={{ color: "#2D4A3E", opacity: 0.7 }}>Featured ETF</span>
                      <div className="text-right">
                        <p className="font-semibold font-mono" style={{ color: "#2D4A3E" }}>{featuredETF.ticker}</p>
                        <p className="text-xs font-mono" style={{ color: featuredETF.changePercent >= 0 ? "#10b981" : "#ef4444" }}>
                          {formatPrice(featuredETF.price)} {featuredETF.changePercent >= 0 ? "+" : ""}{featuredETF.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-center pt-2" style={{ color: "#2D4A3E", opacity: 0.6 }}>
                    Pansy is here to guide you every step of your wealth journey.
                  </p>
                </div>
              </div>
            </Card>
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

        {/* Dashboard Row - Three Columns */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Column 1 - Live Market Overview */}
              <Card className="p-6 space-y-6" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-bold" style={{ color: "#2D4A3E" }}>
                    Live Market Overview
                  </h3>
                  
                  {/* Search Box */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search ticker..."
                      className="w-full px-4 py-3 pr-10 rounded-lg text-sm"
                      style={{ backgroundColor: "rgba(45, 74, 62, 0.05)", border: "1px solid rgba(45, 74, 62, 0.1)", color: "#2D4A3E" }}
                    />
                    <BarChart3 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#2D4A3E", opacity: 0.4 }} />
                  </div>

                  {/* Ticker List */}
                  <div className="space-y-3">
                    {Object.values(marketQuotes).map((quote) => (
                      <button
                        key={quote.ticker}
                        onClick={() => setSelectedStock(quote.ticker)}
                        className="w-full p-3 rounded-lg text-left transition-all hover:shadow-md"
                        style={{ 
                          backgroundColor: selectedStock === quote.ticker ? "rgba(196, 113, 74, 0.1)" : "rgba(45, 74, 62, 0.03)",
                          border: selectedStock === quote.ticker ? "1px solid #C4714A" : "1px solid transparent"
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold font-mono" style={{ color: "#2D4A3E" }}>{quote.ticker}</span>
                          <span className="text-sm font-mono" style={{ color: quote.changePercent >= 0 ? "#10b981" : "#ef4444" }}>
                            {quote.changePercent >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: "#2D4A3E", opacity: 0.6 }}>{quote.name}</span>
                          <span className="text-sm font-mono font-semibold" style={{ color: "#2D4A3E" }}>{formatPrice(quote.price)}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <Link href="/discover" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors pt-2" style={{ color: "#C4714A" }}>
                    View All Markets <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>

              {/* Column 2 - Stock Detail */}
              <Card className="p-6 space-y-6" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <div className="space-y-4">
                  {marketQuotes[selectedStock] && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-xl font-bold" style={{ color: "#2D4A3E" }}>
                            {selectedStock}
                          </h3>
                          <Badge className="font-mono" style={{ backgroundColor: marketQuotes[selectedStock].changePercent >= 0 ? "#10b981" : "#ef4444", color: "white" }}>
                            {marketQuotes[selectedStock].changePercent >= 0 ? "+" : ""}{marketQuotes[selectedStock].changePercent.toFixed(2)}%
                          </Badge>
                        </div>
                        <p className="text-sm" style={{ color: "#2D4A3E", opacity: 0.6 }}>{marketQuotes[selectedStock].name}</p>
                        <p className="font-serif text-3xl font-bold font-mono" style={{ color: "#2D4A3E" }}>
                          {formatPrice(marketQuotes[selectedStock].price)}
                        </p>
                      </div>

                      {/* Timeframe Tabs */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "5Y", "Max"].map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setSelectedTimeframe(tf)}
                            className="px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all"
                            style={{ 
                              backgroundColor: selectedTimeframe === tf ? "rgba(45, 74, 62, 0.1)" : "transparent",
                              color: "#2D4A3E",
                              border: selectedTimeframe === tf ? "1px solid rgba(45, 74, 62, 0.2)" : "1px solid transparent"
                            }}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>

                      {/* Chart Placeholder */}
                      <div className="h-48 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(45, 74, 62, 0.05)" }}>
                        <div className="text-center space-y-2">
                          <BarChart3 className="w-12 h-12 mx-auto" style={{ color: "#2D4A3E", opacity: 0.3 }} />
                          <p className="text-xs" style={{ color: "#2D4A3E", opacity: 0.5 }}>Live chart powered by TradingView</p>
                        </div>
                      </div>

                      {/* Indicators / Compare Buttons */}
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="flex-1 text-xs" style={{ borderColor: "#2D4A3E", color: "#2D4A3E" }}>
                          Indicators
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs" style={{ borderColor: "#2D4A3E", color: "#2D4A3E" }}>
                          Compare
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Column 3 - Pansy's Analysis (SAMPLE) */}
              <Card className="p-6 space-y-6" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-xl font-bold" style={{ color: "#2D4A3E" }}>
                      Pansy's Analysis
                    </h3>
                    <Badge className="text-xs font-semibold" style={{ backgroundColor: "rgba(212, 175, 106, 0.2)", color: "#D4AF6A", border: "1px solid #D4AF6A" }}>
                      Example
                    </Badge>
                  </div>

                  <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: "rgba(196, 113, 74, 0.05)", border: "1px solid rgba(196, 113, 74, 0.2)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #D4AF6A 0%, #C4714A 100%)" }}>
                        <span className="text-sm">🌺</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "#2D4A3E" }}>Pansy Says...</span>
                    </div>
                    <p className="text-sm leading-relaxed italic" style={{ color: "#2D4A3E", opacity: 0.9 }}>
                      "This tech giant is holding steady above key support. The recent earnings beat expectations and the dividend yield provides nice passive income while you wait for growth 💛"
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: "#2D4A3E", opacity: 0.7 }}>RECOMMENDATION</span>
                      <Badge style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid #10b981" }}>
                        Hold
                      </Badge>
                    </div>

                    <div className="flex items-center justify-center py-4">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="rgba(45, 74, 62, 0.1)"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#10b981"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40 * 0.75} ${2 * Math.PI * 40}`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-serif text-2xl font-bold font-mono" style={{ color: "#2D4A3E" }}>75%</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-center" style={{ color: "#2D4A3E", opacity: 0.6 }}>Confidence Level</p>

                    {/* Entry/Stop/Take-Profit Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs" style={{ borderTop: "1px solid rgba(45, 74, 62, 0.1)", paddingTop: "12px" }}>
                      <div>
                        <p style={{ color: "#2D4A3E", opacity: 0.6 }}>Entry Zone</p>
                        <p className="font-semibold font-mono" style={{ color: "#2D4A3E" }}>$170-175</p>
                      </div>
                      <div>
                        <p style={{ color: "#2D4A3E", opacity: 0.6 }}>Stop Loss</p>
                        <p className="font-semibold font-mono" style={{ color: "#ef4444" }}>$165</p>
                      </div>
                      <div>
                        <p style={{ color: "#2D4A3E", opacity: 0.6 }}>Take Profit</p>
                        <p className="font-semibold font-mono" style={{ color: "#10b981" }}>$195</p>
                      </div>
                      <div>
                        <p style={{ color: "#2D4A3E", opacity: 0.6 }}>Risk Level</p>
                        <p className="font-semibold" style={{ color: "#D4AF6A" }}>Moderate</p>
                      </div>
                      <div className="col-span-2">
                        <p style={{ color: "#2D4A3E", opacity: 0.6 }}>Best For</p>
                        <p className="font-semibold" style={{ color: "#2D4A3E" }}>Long-term investors</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg text-xs text-center" style={{ backgroundColor: "rgba(212, 175, 106, 0.1)", color: "#D4AF6A" }}>
                    ⚠️ Example only — not a recommendation
                  </div>

                  <Link href="/discover" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors w-full justify-center pt-2" style={{ color: "#C4714A" }}>
                    View Full Analysis <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
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

        {/* Bottom Row - Three Columns */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Column 1 - Bloom Academy */}
              <Card className="p-6 space-y-6" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <h3 className="font-serif text-xl font-bold" style={{ color: "#2D4A3E" }}>
                  Bloom Academy
                </h3>
                <div className="space-y-3">
                  {[
                    "What Is a Stock?",
                    "What Is an ETF?",
                    "How Dividends Build Wealth",
                    "Beginner Chart Reading",
                    "Side Hustle Investing",
                    "Trading Psychology",
                    "Women & Wealth Building"
                  ].map((lesson) => (
                    <Link key={lesson} href="/learn" className="block p-3 rounded-lg transition-all hover:shadow-md" style={{ backgroundColor: "rgba(45, 74, 62, 0.03)" }}>
                      <p className="text-sm font-medium" style={{ color: "#2D4A3E" }}>{lesson}</p>
                    </Link>
                  ))}
                </div>
                <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors pt-2" style={{ color: "#C4714A" }}>
                  View All Lessons <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>

              {/* Column 2 - Trader Psychology */}
              <Card className="p-6 space-y-6" style={{ backgroundColor: "white", border: "1px solid rgba(45, 74, 62, 0.1)" }}>
                <h3 className="font-serif text-xl font-bold" style={{ color: "#2D4A3E" }}>
                  Trader Psychology
                </h3>
                <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: "rgba(45, 74, 62, 0.05)" }}>
                  <p className="text-xs font-semibold" style={{ color: "#2D4A3E", opacity: 0.7 }}>TODAY'S DISCIPLINE REMINDER</p>
                  <p className="text-sm leading-relaxed italic" style={{ color: "#2D4A3E" }}>
                    "The market rewards patience, not impulse. Your plan exists for moments like this 💛"
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold" style={{ color: "#2D4A3E", opacity: 0.7 }}>QUICK CHECK-IN</p>
                  {[
                    "Am I following my plan?",
                    "Am I chasing a trade?",
                    "Did I set my risk first?",
                    "Am I trading emotionally?"
                  ].map((question) => (
                    <label key={question} className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:shadow-md" style={{ backgroundColor: "rgba(45, 74, 62, 0.03)" }}>
                      <input type="checkbox" className="mt-1" style={{ accentColor: "#2D4A3E" }} />
                      <span className="text-sm" style={{ color: "#2D4A3E" }}>{question}</span>
                    </label>
                  ))}
                </div>

                <Button className="w-full font-semibold" style={{ backgroundColor: "#2D4A3E", color: "white" }}>
                  Start Check-In
                </Button>
              </Card>

              {/* Column 3 - Bloom Pro */}
              <Card className="p-6 space-y-6" style={{ background: "linear-gradient(135deg, rgba(45, 74, 62, 0.05) 0%, rgba(212, 175, 106, 0.05) 100%)", border: "1px solid rgba(212, 175, 106, 0.3)" }}>
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#D4AF6A" }}>
                    UNLOCK YOUR POTENTIAL
                  </p>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-2xl font-bold" style={{ color: "#2D4A3E" }}>
                      Bloom Pro
                    </h3>
                    <span className="text-2xl">👑</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    "Unlimited Stock Analysis",
                    "Advanced Indicators",
                    "Portfolio Tracking",
                    "Daily Pansy Market Notes",
                    "ETF Research Center",
                    "Wealth Building Roadmaps",
                    "Watchlist Alerts",
                    "Priority Support"
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(212, 175, 106, 0.2)" }}>
                        <span className="text-xs">✓</span>
                      </div>
                      <p className="text-sm" style={{ color: "#2D4A3E" }}>{feature}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-3" style={{ borderTop: "1px solid rgba(45, 74, 62, 0.1)" }}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold font-mono" style={{ color: "#2D4A3E" }}>$7.99</span>
                    <span className="text-sm" style={{ color: "#2D4A3E", opacity: 0.6 }}>/month</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold font-mono" style={{ color: "#2D4A3E" }}>$57.99</span>
                    <span className="text-sm" style={{ color: "#2D4A3E", opacity: 0.6 }}>/year</span>
                    <Badge className="text-xs" style={{ backgroundColor: "rgba(212, 175, 106, 0.2)", color: "#D4AF6A" }}>
                      Save ~40%
                    </Badge>
                  </div>
                </div>

                <Link href="/subscription">
                  <Button className="w-full font-semibold" style={{ backgroundColor: "#C4714A", color: "white" }}>
                    Upgrade to Bloom Pro
                  </Button>
                </Link>

                <p className="text-xs text-center" style={{ color: "#2D4A3E", opacity: 0.6 }}>
                  Cancel Anytime
                </p>
              </Card>
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

        {/* Comprehensive Footer */}
        <footer className="py-16" style={{ backgroundColor: "rgba(45, 74, 62, 0.05)", borderTop: "1px solid rgba(45, 74, 62, 0.1)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              {/* Column 1 - Logo + Mission */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2D4A3E 0%, #D4AF6A 100%)" }}>
                    <span className="text-2xl">🌸</span>
                  </div>
                  <span className="font-serif text-2xl font-bold" style={{ color: "#2D4A3E" }}>Bloom</span>
                </div>
                <p className="text-sm font-semibold" style={{ color: "#2D4A3E" }}>
                  She Blooms Wealth
                </p>
                <p className="text-xs" style={{ color: "#2D4A3E", opacity: 0.6 }}>
                  by Cinder Vault Enterprises LLC
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                  Empowering women to invest with confidence, build wealth, and bloom into their financial future.
                </p>
              </div>

              {/* Column 2 - Resources */}
              <div className="space-y-4">
                <p className="text-sm font-semibold" style={{ color: "#2D4A3E" }}>Resources</p>
                <div className="space-y-2">
                  <Link href="/about" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    About
                  </Link>
                  <Link href="/contact" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Contact
                  </Link>
                  <Link href="/blog" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Blog
                  </Link>
                  <Link href="/faq" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    FAQs
                  </Link>
                </div>
              </div>

              {/* Column 3 - Legal */}
              <div className="space-y-4">
                <p className="text-sm font-semibold" style={{ color: "#2D4A3E" }}>Legal</p>
                <div className="space-y-2">
                  <Link href="/terms" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Terms of Service
                  </Link>
                  <Link href="/privacy" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Privacy Policy
                  </Link>
                  <Link href="/disclaimer" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Financial Disclaimer
                  </Link>
                  <Link href="/refund" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Refund Policy
                  </Link>
                </div>
              </div>

              {/* Column 4 - Follow Us + Download */}
              <div className="space-y-4">
                <p className="text-sm font-semibold" style={{ color: "#2D4A3E" }}>Follow Us</p>
                <div className="space-y-2">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Instagram
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    TikTok
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    YouTube
                  </a>
                  <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="block text-sm transition-colors" style={{ color: "#2D4A3E", opacity: 0.7 }}>
                    Pinterest
                  </a>
                </div>
                <div className="pt-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: "#2D4A3E" }}>Download the App</p>
                  <div className="space-y-2">
                    <a href="#" className="block px-4 py-2 rounded-lg text-xs font-semibold text-center transition-all" style={{ backgroundColor: "rgba(45, 74, 62, 0.1)", color: "#2D4A3E", border: "1px solid rgba(45, 74, 62, 0.2)" }}>
                      Google Play
                    </a>
                    <a href="#" className="block px-4 py-2 rounded-lg text-xs font-semibold text-center transition-all" style={{ backgroundColor: "rgba(45, 74, 62, 0.1)", color: "#2D4A3E", border: "1px solid rgba(45, 74, 62, 0.2)" }}>
                      App Store
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar - Full Disclaimer */}
            <div className="pt-8" style={{ borderTop: "1px solid rgba(45, 74, 62, 0.1)" }}>
              <p className="text-xs leading-relaxed text-center max-w-4xl mx-auto" style={{ color: "#2D4A3E", opacity: 0.6 }}>
                She Blooms Wealth is for educational purposes only. We are not financial advisors. All investing involves risk. Always do your own research before making financial decisions. © 2026 Cinder Vault Enterprises LLC.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}