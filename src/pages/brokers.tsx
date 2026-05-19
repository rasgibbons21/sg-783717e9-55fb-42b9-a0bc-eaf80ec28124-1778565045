import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, TrendingUp, BarChart3, PiggyBank } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";

interface Broker {
  name: string;
  logo: string;
  description: string;
  features: string[];
  link: string;
  isAffiliate: boolean;
  category: string;
}

const BROKERS: Broker[] = [
  // Beginner-friendly
  {
    name: "Fidelity",
    logo: "💼",
    description: "Zero commissions, excellent research tools, and retirement planning",
    features: ["$0 commissions", "24/7 support", "Fractional shares", "Robust research"],
    link: "https://www.fidelity.com",
    isAffiliate: false,
    category: "Beginner-friendly"
  },
  {
    name: "Charles Schwab",
    logo: "🏦",
    description: "Full-service brokerage with extensive educational resources",
    features: ["$0 commissions", "Banking services", "Retirement planning", "Educational content"],
    link: "https://www.schwab.com",
    isAffiliate: false,
    category: "Beginner-friendly"
  },
  {
    name: "SoFi Invest",
    logo: "💡",
    description: "Modern platform with automated investing and crypto options",
    features: ["$0 commissions", "Crypto trading", "Automated investing", "Career coaching"],
    link: "https://www.sofi.com/invest",
    isAffiliate: true,
    category: "Beginner-friendly"
  },
  {
    name: "Robinhood",
    logo: "🦅",
    description: "Simple mobile-first platform perfect for beginners",
    features: ["$0 commissions", "Easy interface", "Fractional shares", "Instant deposits"],
    link: "https://www.robinhood.com",
    isAffiliate: true,
    category: "Beginner-friendly"
  },
  {
    name: "Public",
    logo: "🌐",
    description: "Social investing platform with community insights",
    features: ["$0 commissions", "Social features", "Fractional shares", "Live audio events"],
    link: "https://www.public.com",
    isAffiliate: false,
    category: "Beginner-friendly"
  },

  // Active traders / options
  {
    name: "Interactive Brokers",
    logo: "⚡",
    description: "Professional-grade platform for active traders",
    features: ["Low margin rates", "Advanced tools", "Global markets", "Options trading"],
    link: "https://www.interactivebrokers.com",
    isAffiliate: true,
    category: "Active traders"
  },
  {
    name: "Webull",
    logo: "📊",
    description: "Advanced charting and extended trading hours",
    features: ["$0 commissions", "Extended hours", "Advanced charts", "Paper trading"],
    link: "https://www.webull.com",
    isAffiliate: true,
    category: "Active traders"
  },
  {
    name: "tastytrade",
    logo: "🎯",
    description: "Options-focused platform with educational content",
    features: ["Options tools", "Low fees", "Education", "Desktop platform"],
    link: "https://www.tastytrade.com",
    isAffiliate: false,
    category: "Active traders"
  },
  {
    name: "TradeStation",
    logo: "🖥️",
    description: "Advanced trading technology for serious traders",
    features: ["Advanced tools", "Algo trading", "Options", "Futures"],
    link: "https://www.tradestation.com",
    isAffiliate: false,
    category: "Active traders"
  },
  {
    name: "E*TRADE",
    logo: "💹",
    description: "Comprehensive platform with powerful trading tools",
    features: ["Advanced tools", "Options", "Futures", "Managed portfolios"],
    link: "https://www.etrade.com",
    isAffiliate: false,
    category: "Active traders"
  },

  // ETF / long-term investors
  {
    name: "Vanguard",
    logo: "🛡️",
    description: "Industry leader in low-cost index funds and ETFs",
    features: ["Low-cost ETFs", "Index funds", "Retirement accounts", "Long-term focus"],
    link: "https://www.vanguard.com",
    isAffiliate: false,
    category: "Long-term"
  },
  {
    name: "Merrill Edge",
    logo: "🐂",
    description: "Bank of America's investment platform with rewards",
    features: ["$0 commissions", "Banking integration", "Preferred Rewards", "Research"],
    link: "https://www.merrilledge.com",
    isAffiliate: false,
    category: "Long-term"
  },
];

const categoryIcons = {
  "Beginner-friendly": PiggyBank,
  "Active traders": TrendingUp,
  "Long-term": BarChart3,
};

const categoryColors = {
  "Beginner-friendly": "text-[#3d7a54] bg-[#3d7a54]/10 border-[#3d7a54]/20",
  "Active traders": "text-[#d4788a] bg-[#d4788a]/10 border-[#d4788a]/20",
  "Long-term": "text-[#c8953a] bg-[#c8953a]/10 border-[#c8953a]/20",
};

export default function Brokers() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getCurrentUser();
      if (user) setUserId(user.id);
    };
    loadUser();
  }, []);

  const trackBrokerClick = async (brokerName: string, isAffiliate: boolean) => {
    if (!userId) return;

    try {
      await supabase.from("broker_clicks").insert({
        user_id: userId,
        broker_name: brokerName,
        is_affiliate: isAffiliate,
        clicked_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error tracking broker click:", error);
    }
  };

  const handleBrokerClick = (broker: Broker) => {
    trackBrokerClick(broker.name, broker.isAffiliate);
    window.open(broker.link, "_blank");
  };

  const groupedBrokers = {
    "Beginner-friendly": BROKERS.filter((b) => b.category === "Beginner-friendly"),
    "Active traders": BROKERS.filter((b) => b.category === "Active traders"),
    "Long-term": BROKERS.filter((b) => b.category === "Long-term"),
  };

  return (
    <Layout>
      <SEO title="Brokers — Bloom" />
      <div className="container-full py-8 space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Brokers
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Find the right brokerage for your investing journey. We've organized them by investor type to make it easier.
          </p>
        </div>

        {/* Disclaimer */}
        <Card className="p-4 border-accent/20 bg-accent/5">
          <div className="flex gap-3">
            <Star className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Affiliate Disclosure
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Bloom may earn a commission from some broker partnerships (marked with a gold star). We list both affiliate and independent brokers to keep things fair. Your decision should be based on which platform best fits your needs.
              </p>
            </div>
          </div>
        </Card>

        {/* Pansy's Broker Tip */}
        <Card className="p-6 bg-primary/5 border-primary/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl shrink-0">
              🌺
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">Pansy's Broker Guide</p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                The best broker is the one you'll actually use! If you're just starting out, go with something simple like Fidelity or Charles Schwab. If you love charts and trading, check out Webull or Interactive Brokers. And if you're building long-term wealth, Vanguard is the gold standard for low-cost index funds 💛
              </p>
              <p className="text-sm font-medium text-primary">— Pansy 🌺</p>
            </div>
          </div>
        </Card>

        {/* Broker Categories */}
        {Object.entries(groupedBrokers).map(([category, brokers]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const colorClass = categoryColors[category as keyof typeof categoryColors];

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-foreground" />
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  {category}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brokers.map((broker) => (
                  <Card
                    key={broker.name}
                    className="p-6 border-border hover:border-primary/30 transition-all"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                            {broker.logo}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground text-lg">
                                {broker.name}
                              </h3>
                              {broker.isAffiliate && (
                                <Badge className={`${colorClass} text-xs`}>
                                  <Star className="w-3 h-3 mr-1" />
                                  Partner
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {broker.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {broker.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            className="bg-background/50 text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handleBrokerClick(broker)}
                        className={
                          broker.isAffiliate
                            ? "w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
                            : "w-full bg-primary hover:bg-primary/90"
                        }
                      >
                        {broker.isAffiliate ? "Start Investing" : "Learn More"}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Disclaimer */}
        <Card className="p-4 bg-muted/50 border-muted-foreground/20 rounded-2xl">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses. Always do your own research before opening a brokerage account.
          </p>
        </Card>
      </div>
    </Layout>
  );
}