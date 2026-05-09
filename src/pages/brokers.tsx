import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Broker {
  id: string;
  name: string;
  description: string;
  features: string[];
  isAffiliate: boolean;
  link: string;
}

export default function Brokers() {
  const brokers: Broker[] = [
    {
      id: "robinhood",
      name: "Robinhood",
      description: "Perfect for beginners. Clean, simple interface with no commission fees.",
      features: ["Zero commissions", "Fractional shares", "Easy to use"],
      isAffiliate: true,
      link: "https://robinhood.com",
    },
    {
      id: "webull",
      name: "Webull",
      description: "Great for intermediate investors wanting more data and charts.",
      features: ["Advanced charts", "Paper trading", "Zero commissions"],
      isAffiliate: true,
      link: "https://webull.com",
    },
    {
      id: "fidelity",
      name: "Fidelity",
      description: "Established, trusted broker with excellent customer service.",
      features: ["Great support", "Fractional shares", "Research tools"],
      isAffiliate: false,
      link: "https://fidelity.com",
    },
    {
      id: "schwab",
      name: "Charles Schwab",
      description: "Comprehensive platform with lots of educational resources.",
      features: ["Education hub", "No minimums", "Strong research"],
      isAffiliate: false,
      link: "https://schwab.com",
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
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Brokers 🏦
          </h1>
          <p className="text-muted-foreground">
            Find the right platform for your investing journey
          </p>
        </div>

        <Card className="p-3 bg-muted border-muted-foreground/20">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Bloom may earn a commission from some broker partnerships. We list both
            affiliate and independent brokers to keep things fair.
          </p>
        </Card>

        <div className="space-y-4">
          {brokers.map((broker) => (
            <Card key={broker.id} className="p-5 space-y-4 border-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-lg text-foreground">
                      {broker.name}
                    </h2>
                    {broker.isAffiliate && (
                      <Badge className="bg-accent/20 text-accent-foreground border-accent text-[10px] font-semibold uppercase tracking-wider">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {broker.description}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ml-4">
                  <span className="text-xl">📈</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {broker.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="font-normal">
                    {feature}
                  </Badge>
                ))}
              </div>

              <Button
                className={`w-full ${
                  broker.isAffiliate 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-transparent border-2 border-primary text-primary hover:bg-primary/5"
                }`}
                variant={broker.isAffiliate ? "default" : "outline"}
                onClick={() => handleBrokerClick(broker)}
              >
                {broker.isAffiliate ? "Start Investing" : "Learn More"}
              </Button>
            </Card>
          ))}
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