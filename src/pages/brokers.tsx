import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { CATEGORIES, getBrokersByCategory } from "@/config/brokers";
import BrokerCard from "@/components/BrokerCard";
import BrokerHubDisclaimer from "@/components/BrokerHubDisclaimer";
import FindMyBrokerWizard from "@/components/FindMyBrokerWizard";
import { Compass, LayoutGrid } from "lucide-react";

export default function Brokers() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <Layout>
      <SEO
        title="Invest & Trade — Bloom"
        description="Compare regulated brokers and platforms to find the right fit for your trading and investing journey."
      />
      <div className="container-full py-8 space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Invest &amp; Trade
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Compare brokers and platforms to find the right fit for your goals. Every provider listed here has a confirmed partnership with Bloom.
          </p>
        </div>

        {/* Pansy guidance */}
        <Card className="p-6 bg-primary/5 border-primary/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl shrink-0">
              🌺
            </div>
            <div className="space-y-2 flex-1">
              <p className="font-semibold text-foreground">How to think about choosing a platform</p>
              <p className="text-sm text-foreground leading-relaxed">
                The right platform depends on where you are in your journey and what you need.
                If you&apos;re just starting, look for educational resources and demo accounts.
                If you&apos;re more experienced, focus on execution speed, available markets, and
                the tools that fit your strategy. Always check terms, fees, and regional availability
                on the provider&apos;s website before opening an account.
              </p>
              <p className="text-sm font-medium text-primary">— Pansy 🌺</p>
            </div>
          </div>
        </Card>

        {/* Disclosures */}
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
            All Platforms
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
            Find My Platform
          </button>
        </div>

        {/* Content */}
        {showWizard ? (
          <FindMyBrokerWizard />
        ) : (
          <div className="space-y-10">
            {CATEGORIES.map((category) => {
              const items = getBrokersByCategory(category);
              if (items.length === 0) return null;
              return (
                <section key={category} className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-foreground">{category}</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {items.map((broker) => (
                      <BrokerCard key={broker.id} broker={broker} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Bottom disclaimer */}
        <Card className="p-4 bg-muted/50 border-border rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Check availability and terms on each provider&apos;s website. Bloom does not guarantee eligibility, rewards, or account approval. This page is for informational purposes only and is not financial advice.
          </p>
        </Card>
      </div>
    </Layout>
  );
}
