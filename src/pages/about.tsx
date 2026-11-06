import Link from "next/link";
import { BookOpen, LineChart, MessageCircleHeart, Trophy } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { RiskNote } from "@/components/RiskNote";
import { BloomMark } from "@/components/brand/BloomMark";

const OFFERS = [
  { icon: BookOpen, title: "Interactive lessons", body: "26 lessons from reading a chart to fair value gaps, order blocks and the full execution checklist." },
  { icon: LineChart, title: "Practice with structure", body: "Plan trades on real US stocks with simulated money, and get a process score for every one." },
  { icon: Trophy, title: "Leaderboards", body: "One for learning and one for practice gains, so progress is visible and shared." },
  { icon: MessageCircleHeart, title: "Pansy", body: "Your AI learning companion, who explains any concept precisely, whenever you ask." },
];

const FAQS = [
  { q: "What is Bloom?", a: "Bloom is a free education platform that helps women learn to analyse US stocks, starting with fair value gaps, structure and liquidity." },
  { q: "Is it really free?", a: "Yes. There's no card, no paywall and nothing to pay. Bloom earns a commission if you open an account through some of our broker links, which never costs you extra." },
  { q: "Who is Pansy?", a: "Pansy is Bloom's AI learning companion. Pansy explains concepts and suggests what to learn next, but never analyses live charts or gives trade calls." },
  { q: "Does Bloom tell me what to trade?", a: "No. Bloom teaches you how to read a chart, plan a trade and manage risk. It doesn't give tips, alerts or recommendations." },
  { q: "Is practice money real?", a: "No. Practice and its leaderboard use simulated money, and practice results don't predict real results." },
  { q: "Can I use Bloom anywhere?", a: "Yes. Lessons, Practice and Pansy work everywhere. The brokers we list depend on where you live." },
];

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Bloom"
        description="Bloom is a free, premium place for women to learn stock analysis: fair value gaps, structure and liquidity, through interactive lessons and safe practice."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }}
      />
      <Layout>
        <div className="mx-auto max-w-2xl space-y-12 px-4 py-12">
          <header className="text-center">
            <div className="mx-auto w-fit">
              <BloomMark size={52} />
            </div>
            <h1 className="mt-5 text-5xl leading-tight text-foreground">Skill, not shortcuts</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Bloom exists so women can learn to read a stock chart with real understanding: precise lessons, careful practice, and no pressure.
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2" aria-label="What Bloom offers">
            {OFFERS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl border border-[var(--bloom-rule)] bg-card p-6">
                <Icon className="h-5 w-5 text-[var(--bloom-gold)]" />
                <h2 className="mt-3 text-2xl text-foreground">{title}</h2>
                <p className="mt-1 text-base text-muted-foreground">{body}</p>
              </div>
            ))}
          </section>

          <section aria-labelledby="questions">
            <h2 id="questions" className="text-4xl text-foreground">Common questions</h2>
            <dl className="mt-6 divide-y divide-[var(--bloom-rule)]">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="py-4">
                  <dt className="text-lg font-medium text-foreground">{q}</dt>
                  <dd className="mt-1 text-base leading-relaxed text-muted-foreground">{a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="text-center">
            <Link href="/onboarding" className="inline-flex h-12 items-center rounded-full bg-primary px-7 font-semibold text-primary-foreground transition-transform active:scale-95">
              Start free
            </Link>
          </div>

          <RiskNote />
          <p className="text-center text-sm text-muted-foreground">Bloom is operated by Cinder Vault Enterprises LLC.</p>
        </div>
      </Layout>
    </>
  );
}
