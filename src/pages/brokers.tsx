import { ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { RiskNote } from "@/components/RiskNote";
import { Botanical } from "@/components/brand/Botanical";
import { brokers, type BrokerConfig } from "@/config/brokers";
import { useBrokerNotice } from "@/hooks/useBrokerNotice";
import { supabase } from "@/integrations/supabase/client";
import { trackBrokerClick } from "@/lib/analytics";
import { canShowOpenButton, type BrokerNotice } from "@/lib/brokers/region";

const LOOK_FOR = [
  { title: "Regulation", body: "Check who regulates the broker for people in your country, and look it up on that regulator's own website." },
  { title: "A free demo", body: "You should be able to practise with pretend money first, with no deposit." },
  { title: "Clear costs", body: "Spreads, overnight fees and any commissions should be easy to find." },
  { title: "Small trade sizes", body: "Being able to trade 0.01 lot keeps your learning gentle." },
];

const GOLD_NOTES: Record<string, { offers: string; note: string }> = {
  xm: {
    offers: "Gold, major forex pairs and indices such as the US500, on MetaTrader and its own web and mobile platforms.",
    note: "Offers a demo account and free educational material, which can suit beginners.",
  },
  icmarkets: {
    offers: "Gold, silver, platinum and palladium, plus forex and indices, on MetaTrader, cTrader and TradingView.",
    note: "Built more for experienced traders, so its pricing and tools may feel like a lot at first. It now also goes by the name IC.",
  },
};

function recordClick(broker: BrokerConfig) {
  trackBrokerClick(broker.name);
  supabase.auth
    .getSession()
    .then(({ data: { session } }) => supabase.from("broker_clicks").insert({ broker_name: broker.name, user_id: session?.user?.id ?? null }))
    .then(undefined, () => undefined);
}

function BrokerEntry({ broker, notice }: { broker: BrokerConfig; notice: BrokerNotice }) {
  const gold = GOLD_NOTES[broker.id];
  const showButton = canShowOpenButton(broker, notice);

  return (
    <article className="rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)]">
      <h3 className="text-2xl font-semibold text-foreground">{broker.name}</h3>
      {gold ? (
        <>
          <p className="mt-2 text-base leading-relaxed text-foreground">{gold.offers}</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">{gold.note}</p>
        </>
      ) : (
        <>
          <p className="mt-2 text-base leading-relaxed text-foreground">{broker.shortDescription}</p>
          {broker.markets?.length > 0 && <p className="mt-2 text-sm text-muted-foreground">Includes: {broker.markets.join(", ")}</p>}
        </>
      )}

      {showButton ? (
        <>
          <a
            href={broker.affiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => recordClick(broker)}
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-primary px-5 text-sm font-semibold text-primary transition-transform active:scale-95"
          >
            Visit {broker.name} <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          {broker.disclosureRequired && <p className="mt-2 text-xs text-muted-foreground">Bloom may earn a commission if you open an account through this link.</p>}
        </>
      ) : (
        notice === "general" && <p className="mt-3 text-sm text-muted-foreground">For information only, so there&apos;s no link here for now.</p>
      )}
    </article>
  );
}

export default function BrokersPage() {
  const notice = useBrokerNotice();
  const byId = (id: string) => brokers.find((broker) => broker.id === id);
  const featured = [byId("xm"), byId("icmarkets")].filter(Boolean) as BrokerConfig[];
  const others = brokers.filter((b) => b.active && b.category === "Forex & CFDs" && !featured.includes(b));
  const tradingView = byId("tradingview");
  const stocksOnly = brokers.filter((b) => b.active && b.category === "Stocks & ETFs");

  return (
    <>
      <SEO title="Free demo accounts - Bloom" description="Learn what a demo account is and what brokers such as XM and IC Markets offer for gold and other markets." />
      <Layout>
        <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
          <header className="relative overflow-hidden rounded-3xl bg-secondary p-6">
            <Botanical variant="corner" className="pointer-events-none absolute -right-6 -top-4 h-36 w-28" />
            <h1 className="max-w-[80%] text-3xl font-semibold leading-tight text-foreground">When you feel ready, try a free demo</h1>
            <p className="mt-2 max-w-[90%] text-base leading-relaxed text-muted-foreground">
              A demo account lets you practise on a real broker&apos;s platform with pretend money. There&apos;s no rush, and staying with Bloom&apos;s practice area is always fine.
            </p>
          </header>

          {notice === "us" ? (
            <section role="note" className="flex gap-3 rounded-3xl bg-accent/70 p-5">
              <Info className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">A note for visitors in the US</h2>
                <p className="mt-1 text-base leading-relaxed text-foreground">
                  The gold and CFD brokers below don&apos;t generally accept US residents, so we haven&apos;t included links for you. You can still use all of Bloom&apos;s lessons, Pansy and our practice area, which are free.
                </p>
                <Link href="/practice" className="mt-3 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
                  Go to Practice
                </Link>
              </div>
            </section>
          ) : (
            <p className="rounded-2xl bg-accent/60 p-4 text-base text-foreground">Availability depends on your country, so please check that a broker accepts people from where you live.</p>
          )}

          <section aria-labelledby="look-for">
            <h2 id="look-for" className="text-2xl font-semibold text-foreground">What to look for</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {LOOK_FOR.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-base text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="gold-brokers">
            <h2 id="gold-brokers" className="text-2xl font-semibold text-foreground">Brokers for gold and more</h2>
            <div className="mt-3 space-y-3">
              {[...featured, ...others].map((broker) => (
                <BrokerEntry key={broker.id} broker={broker} notice={notice} />
              ))}
            </div>
          </section>

          {tradingView && (
            <section aria-labelledby="learning-tools">
              <h2 id="learning-tools" className="text-2xl font-semibold text-foreground">A learning tool</h2>
              <p className="mt-1 text-base text-muted-foreground">Not a broker, but a popular place to look at charts.</p>
              <div className="mt-3">
                <BrokerEntry broker={{ ...tradingView, regions: ["US", "Global"] }} notice={notice} />
              </div>
            </section>
          )}

          {stocksOnly.length > 0 && (
            <section aria-labelledby="stocks-only">
              <h2 id="stocks-only" className="text-2xl font-semibold text-foreground">For stocks only</h2>
              <p className="mt-1 text-base text-muted-foreground">These don&apos;t offer gold CFDs, and aren&apos;t what our lessons cover.</p>
              <div className="mt-3 space-y-3">
                {stocksOnly.map((broker) => (
                  <BrokerEntry key={broker.id} broker={broker} notice={notice} />
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl bg-secondary p-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">How Bloom earns money:</strong> Bloom is free because some of these links pay us a commission if you open an account. It doesn&apos;t cost you anything extra, and it doesn&apos;t change what we teach. Bloom isn&apos;t a broker and doesn&apos;t recommend any particular provider, so please do your own checks.
            </p>
          </section>

          <RiskNote />
        </div>
      </Layout>
    </>
  );
}
