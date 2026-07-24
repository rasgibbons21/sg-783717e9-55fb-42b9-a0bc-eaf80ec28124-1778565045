import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { getEnabledBrokers } from "@/config/brokers";
import BrokerCard from "@/components/BrokerCard";
import BrokerHubDisclaimer from "@/components/BrokerHubDisclaimer";
import FindMyBrokerWizard from "@/components/FindMyBrokerWizard";
import { Compass, LayoutGrid } from "lucide-react";

export default function Brokers() {
  const [showWizard, setShowWizard] = useState(false);
  const brokers = getEnabledBrokers();

  return (
    <Layout>
      <SEO
        title="Broker Hub — Bloom"
        description="Compare regulated brokers and find the right platform for your trading journey."
      />
      <div className="container-full py-8 space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Broker Hub
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Compare regulated brokers and find a platform that suits your trading goals.
            Every broker listed here is vetted for regulation and reliability.
          </p>
        </div>

        {/* Pansy guidance */}
        <Card className="p-6 bg-primary/5 border-primary/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl shrink-0">
              🌺
            </div>
            <div className="space-y-2 flex-1">
              <p className="font-semibold text-foreground">How to think about choosing a broker</p>
              <p className="text-sm text-foreground leading-relaxed">
                The right broker depends on where you are in your journey and what you need.
                If you&apos;re just starting, look for low minimum deposits and educational
                resources. If you&apos;re more experienced, focus on execution speed, spreads,
                and the instruments available. Always check that a broker is properly regulated
                before depositing funds — and never risk more than you can afford to lose.
              </p>
              <p className="text-sm font-medium text-primary">— Pansy 🌺</p>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <BrokerHubDisclaimer />

        {/* Mode toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWizard(false)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              !showWizard
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border/50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            All Brokers
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              showWizard
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border/50"
            }`}
          >
            <Compass className="w-4 h-4" />
            Find My Broker
          </button>
        </div>

        {/* Content */}
        {showWizard ? (
          <FindMyBrokerWizard />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {brokers.map((broker) => (
              <BrokerCard key={broker.id} broker={broker} />
            ))}
          </div>
        )}

        {/* Bottom disclaimer */}
        <Card className="p-4 bg-muted/50 border-border rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Trading forex and CFDs carries significant risk — you can lose more than your
            initial deposit. The brokers listed are for informational purposes only. Always
            do your own research and consider consulting a licensed financial advisor.
          </p>
        </Card>
      </div>
    </Layout>
  );
}
