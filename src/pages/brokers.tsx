import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

interface Broker {
  id: string;
  name: string;
  description: string;
  dahliaQuote: string;
  features: string[];
  isAffiliate: boolean;
  link: string;
  category: string;
}

export default function Brokers() {
  const brokers: Broker[] = [
    {
      id: "robinhood",
      name: "Robinhood",
      description: "Perfect for beginners who want a simple, beautiful app",
      dahliaQuote: "Robinhood is perfect if you're just starting. Zero fees, you can buy fractional shares for like $1, and the app is actually beautiful. No excuses not to start sis 💅",
      features: ["Zero commissions", "Fractional shares from $1", "Easy to use", "Instant deposits"],
      isAffiliate: true,
      link: "https://robinhood.com",
      category: "Beginner Investing",
    },
    {
      id: "webull",
      name: "Webull",
      description: "Great for investors who want advanced charts and data",
      dahliaQuote: "Webull gives you all the data without making it overwhelming. Love the paper trading feature — you can practice without risking real money. Smart move 📊",
      features: ["Advanced charts", "Paper trading", "Zero commissions", "Extended hours"],
      isAffiliate: true,
      link: "https://webull.com",
      category: "Active Trading",
    },
    {
      id: "fidelity",
      name: "Fidelity",
      description: "Trusted broker with excellent customer service and research",
      dahliaQuote: "Fidelity is like the reliable best friend — been around forever, super helpful when you need them, and they have amazing research tools. Totally trustworthy 💚",
      features: ["Great support", "Fractional shares", "Research tools", "Retirement accounts"],
      isAffiliate: false,
      link: "https://fidelity.com",
      category: "Long-Term Wealth",
    },
    {
      id: "schwab",
      name: "Charles Schwab",
      description: "Comprehensive platform with educational resources",
      dahliaQuote: "Schwab is perfect if you want to learn while you invest. Their education hub is actually good, and they don't make you feel dumb for asking questions ✨",
      features: ["Education hub", "No account minimums", "Strong research", "24/7 support"],
      isAffiliate: false,
      link: "https://schwab.com",
      category: "ETFs & Retirement",
    },
  ];

  const handleBrokerClick = async (broker: Broker) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("broker_clicks").insert({
          user_id: user.id,
          broker_name: broker.name,
          is_affiliate: broker.isAffiliate,
        });
      }
    } catch (error) {
      console.error("Error logging broker click:", error);
    }
    window.open(broker.link, "_blank");
  };

  return (
    <Layout>
      <SEO title="Brokers - Bloom" description="Find the right investment platform with Dahlia's guidance" />
      <div className="container-full py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Find Your Broker
          </h1>
          <p className="text-muted-foreground text-lg">
            Dahlia's honest takes on where to start investing
          </p>
        </div>

        <Card className="p-4 bg-accent/10 border-accent/30 rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Bloom may earn a commission from some broker partnerships. We list both affiliate and independent brokers to keep things fair.
          </p>
        </Card>

        <div className="grid gap-6">
          {brokers.map((broker) => (
            <Card key={broker.id} className="p-6 bg-card border-border rounded-2xl space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="font-serif text-2xl font-bold text-foreground">
                      {broker.name}
                    </h2>
                    {broker.isAffiliate && (
                      <Badge className="bg-accent/20 text-accent border-accent/50 text-xs font-semibold uppercase tracking-wider">
                        Featured Partner
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs border-border">
                      {broker.category}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {broker.description}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-popover border border-border flex items-center justify-center flex-shrink-0 ml-6">
                  <span className="text-2xl">🏦</span>
                </div>
              </div>

              <Card className="p-4 bg-popover border-border/50 rounded-xl">
                <div className="flex gap-3">
                  <img
                    src="/bloom-logo.png"
                    alt="Dahlia"
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground italic leading-relaxed">
                      "{broker.dahliaQuote}"
                    </p>
                    <p className="text-xs text-accent mt-2">— Dahlia 🌺</p>
                  </div>
                </div>
              </Card>

              <div className="flex flex-wrap gap-2">
                {broker.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="bg-muted border-border font-normal rounded-lg">
                    {feature}
                  </Badge>
                ))}
              </div>

              <Button
                className={`w-full rounded-xl h-12 font-semibold ${
                  broker.isAffiliate 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-transparent border-2 border-primary text-primary hover:bg-primary/10"
                }`}
                onClick={() => handleBrokerClick(broker)}
              >
                {broker.isAffiliate ? "Start Investing" : "Learn More"}
              </Button>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-muted/50 border-border/50 rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}