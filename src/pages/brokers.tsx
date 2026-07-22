import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Shield, ChevronRight } from "lucide-react";
import { brokers, getAllCategories, getBrokersByCategory, type Broker } from "@/config/brokers";
import { supabase } from "@/integrations/supabase/client";

function BrokerCard({ broker }: { broker: Broker }) {
  const handleClick = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("broker_clicks").insert({
        broker_name: broker.name,
        user_id: session?.user?.id ?? null,
      });
    } catch {}
    window.open(broker.affiliateLink, "_blank");
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 rounded-2xl">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={broker.logo}
                alt={broker.name}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold text-foreground/60">${broker.name[0]}</span>`;
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{broker.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(broker.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">{broker.rating}</span>
              </div>
            </div>
          </div>
          {broker.regulated && (
            <Badge variant="outline" className="text-[10px] bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20 gap-1">
              <Shield className="w-3 h-3" /> Regulated
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {broker.description}
        </p>

        {/* Info row */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex flex-col">
            <span className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">Min Deposit</span>
            <span className="text-foreground font-semibold">{broker.minDeposit}</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col">
            <span className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">Spread</span>
            <span className="text-foreground font-semibold">{broker.spreadType}</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {broker.features.map((feature) => (
            <Badge key={feature} variant="outline" className="bg-background/50 text-[11px] font-normal border-border/50">
              {feature}
            </Badge>
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={handleClick}
          className="w-full bg-primary hover:bg-primary/90 group/btn transition-all"
        >
          <span>Open Account</span>
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </Card>
  );
}

export default function Brokers() {
  const allCategories = getAllCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const displayedBrokers = activeCategory
    ? getBrokersByCategory(activeCategory)
    : brokers;

  return (
    <Layout>
      <SEO title="Brokers — Bloom" description="Explore trusted, regulated brokers handpicked for your trading journey." />
      <div className="container-full py-8 space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Broker Hub
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Trusted, regulated brokers handpicked for your trading journey. Each broker is vetted for reliability, regulation, and trader-friendly features.
          </p>
        </div>

        {/* Pansy's guidance */}
        <Card className="p-6 bg-primary/5 border-primary/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl shrink-0">
              🌺
            </div>
            <div className="space-y-2 flex-1">
              <p className="font-semibold text-foreground">How to think about choosing a broker</p>
              <p className="text-sm text-foreground leading-relaxed">
                The right broker depends on where you are in your journey and what you need. If you&apos;re just starting, look for low minimum deposits and educational resources. If you&apos;re more experienced, focus on execution speed, spreads, and the instruments available. Always check that a broker is properly regulated before depositing funds.
              </p>
              <p className="text-sm font-medium text-primary">— Pansy 🌺</p>
            </div>
          </div>
        </Card>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All Brokers
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Broker grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedBrokers.map((broker) => (
            <BrokerCard key={broker.id} broker={broker} />
          ))}
        </div>

        {/* Disclaimer */}
        <Card className="p-4 bg-muted/50 border-muted-foreground/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bloom may earn a commission when you open an account through links on this page. This does not affect our recommendations or the fees you pay. Trading forex and CFDs carries significant risk — you can lose more than your initial deposit. Always do your own research and only trade with money you can afford to lose.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
