import Link from "next/link";
import { BookOpen, Flower2, MessageCircleHeart, Sprout } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { RiskNote } from "@/components/RiskNote";
import { BloomMark } from "@/components/brand/BloomMark";

const OFFERS = [
  { icon: BookOpen, title: "Interactive lessons", body: "A gold-first path for complete beginners, then forex, indices and other metals." },
  { icon: Sprout, title: "Safe practice", body: "A simulated account to try what you've learned, without risking real money." },
  { icon: Flower2, title: "Friendly leaderboards", body: "One for learning and one for practice gains, so we can cheer each other on." },
  { icon: MessageCircleHeart, title: "Pansy", body: "Your AI learning companion, who explains things in plain language at any hour." },
];

const FAQS = [
  { q: "What is Bloom?", a: "Bloom is a free education platform that helps women learn gold trading and other markets from zero." },
  { q: "Is it really free?", a: "Yes. There's no card, no paywall and nothing to pay. Bloom earns a commission if you open an account through some of our broker links, which never costs you extra." },
  { q: "Who is Pansy?", a: "Pansy is Bloom's AI learning companion. Pansy explains concepts and helps you decide what to learn next, but never gives trade calls or financial advice." },
  { q: "Does Bloom tell me what to trade?", a: "No. Bloom teaches you how markets work and how to manage risk. It doesn't give trade calls, tips or recommendations." },
  { q: "Is practice money real?", a: "No. Practice and its leaderboard use simulated money, and results there don't predict real results." },
  { q: "Can I use Bloom in the US?", a: "Yes, you can use the lessons, Practice and Pansy. The gold and CFD brokers we talk about generally don't accept US residents, though." },
];

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Bloom"
        description="Bloom is a free, warm place for women to learn gold trading and other markets from zero, with interactive lessons, safe practice and Pansy."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }}
      />
      <Layout>
        <div className="mx-auto max-w-2xl space-y-10 px-4 py-10">
          <header className="text-center">
            <div className="mx-auto w-fit">
              <BloomMark size={56} />
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-foreground">A calm place to learn about markets</h1>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              Markets can feel like a world built for someone else. Bloom is here to change that, with plain language, small steps and no pressure.
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2" aria-label="What Bloom offers">
            {OFFERS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)]">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="mt-2 text-xl font-semibold text-foreground">{title}</h2>
                <p className="mt-1 text-base text-muted-foreground">{body}</p>
              </div>
            ))}
          </section>

          <section aria-labelledby="questions">
            <h2 id="questions" className="text-3xl font-semibold text-foreground">Common questions</h2>
            <dl className="mt-4 space-y-4">
              {FAQS.map(({ q, a }) => (
                <div key={q}>
                  <dt className="text-lg font-semibold text-foreground">{q}</dt>
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
