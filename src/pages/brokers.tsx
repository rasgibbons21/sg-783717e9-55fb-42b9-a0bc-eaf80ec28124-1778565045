import { ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { RiskNote } from "@/components/RiskNote";
import { brokers, type BrokerConfig } from "@/config/brokers";
import { useBrokerNotice } from "@/hooks/useBrokerNotice";
import { supabase } from "@/integrations/supabase/client";
import { trackBrokerClick } from "@/lib/analytics";
import { brokersFor, canShowOpenButton, type BrokerNotice } from "@/lib/brokers/region";

const CFD_WARNING =
  "CFDs are complex and carry a high risk of losing money quickly. Check the broker's own risk warning before you open an account.";

const LOOK_FOR = [
  { title: "Regulation", body: "Check who regulates the broker for people in your country, and confirm it on that regulator's own website." },
  { title: "Real shares or CFDs", body: "Some brokers let you own real shares. Others offer CFDs, which track a share's price without owning it, and are riskier." },
  { title: "Clear costs", body: "Commissions, spreads and any overnight fees should be easy to find before you trade." },
  { title: "A practice account", body: "A demo with pretend money lets you learn the platform before any real money is involved." },
];

/** What each broker offers for stocks, in plain words. Members should confirm details on the broker's own site. */
const STOCK_NOTES: Record<string, { offers: string; cfd: boolean }> = {
  webull: { offers: "Real US shares and ETFs, with a paper trading mode for practice.", cfd: false },
  xm: { offers: "CFDs on shares of large US companies, alongside indices and other markets, with a demo account.", cfd: true },
  icmarkets: { offers: "CFDs on US shares and indices, on MetaTrader, cTrader and TradingView. It now also goes by the name IC.", cfd: true },
  exness: { offers: "CFDs on shares of well-known US companies and on indices.", cfd: true },
  vantage: { offers: "CFDs on US shares and indices.", cfd: true },
  avatrade: { offers: "CFDs on US shares and indices, with educational material.", cfd: true },
  deriv: { offers: "CFDs on US shares and indices.", cfd: true },
  tradingview: { offers: "Not a broker. A popular charting platform for studying stock charts, which suits the skills in Bloom's lessons.", cfd: false },
};

function recordClick(broker: BrokerConfig) {
  trackBrokerClick(broker.name);
  supabase.auth
    .getSession()
    .then(({ data: { session } }) => supabase.from("broker_clicks").insert({ broker_name: broker.name, user_id: session?.user?.id ?? null }))
    .then(undefined, () => undefined);
}

function BrokerEntry({ broker, notice }: { broker: BrokerConfig; notice: BrokerNotice }) {
  const note = STOCK_NOTES[broker.id];
  const showButton = canShowOpenButton(broker, notice);

  return (
    <article className="rounded-3xl border border-[var(--bloom-rule)] bg-card p-5">
      <h3 className="text-2xl text-foreground">{broker.name}</h3>
      <p className="mt-2 text-base leading-relaxed text-foreground">{note?.offers ?? broker.shortDescription}</p>
      {note?.cfd && <p className="mt-3 rounded-2xl bg-accent p-3 text-sm leading-relaxed text-foreground">{CFD_WARNING}</p>}

      {showButton ? (
        <>
          <a
            href={broker.affiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => recordClick(broker)}
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-primary px-5 text-sm font-semibold text-[var(--bloom-gold)] transition-transform active:scale-95"
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
  const listed = brokersFor(notice, brokers);

  return (
    <>
      <SEO title="Where to practise for real - Bloom" description="What to look for in a broker, and what brokers offer for US stocks in your region." />
      <Layout>
        <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
          <header className="rounded-3xl border border-[var(--bloom-rule)] bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bloom-gold)]">When you feel ready</p>
            <h1 className="mt-2 text-4xl leading-tight text-foreground">Where to practise for real</h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              There&apos;s no rush. Many traders practise for months first, and staying in Bloom&apos;s Practice area is always fine.
            </p>
          </header>

          {notice === "us" ? (
            <section role="note" className="flex gap-3 rounded-3xl bg-accent p-5">
              <Info className="mt-1 h-5 w-5 shrink-0 text-[var(--bloom-gold)]" />
              <div>
                <h2 className="text-xl text-foreground">For visitors in the US</h2>
                <p className="mt-1 text-base leading-relaxed text-foreground">
                  CFD brokers don&apos;t generally accept US residents, so we only show brokers for real US shares here. Bloom&apos;s lessons, Practice and Pansy are free for everyone.
                </p>
                <Link href="/practice" className="mt-3 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
                  Go to Practice
                </Link>
              </div>
            </section>
          ) : (
            <p className="rounded-2xl bg-accent p-4 text-base text-foreground">Availability depends on your country, so please check that a broker accepts people from where you live.</p>
          )}

          <section aria-labelledby="look-for">
            <h2 id="look-for" className="text-3xl text-foreground">What to look for</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {LOOK_FOR.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[var(--bloom-rule)] p-4">
                  <h3 className="text-xl text-foreground">{item.title}</h3>
                  <p className="mt-1 text-base text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="broker-list">
            <h2 id="broker-list" className="text-3xl text-foreground">{notice === "us" ? "Brokers for US shares" : "Brokers for US stocks"}</h2>
            <div className="mt-4 space-y-3">
              {listed.map((broker) => (
                <BrokerEntry key={broker.id} broker={broker} notice={notice} />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--bloom-rule)] p-5 text-sm leading-relaxed text-muted-foreground">
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
