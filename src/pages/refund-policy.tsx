import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";

export default function RefundPolicy() {
  return (
    <Layout>
      <SEO title="Refunds - Bloom" description="Bloom is now free. Here's what that means for anyone who paid for an earlier plan." />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-4xl font-semibold text-foreground">Refunds</h1>
        <p className="mt-1 text-muted-foreground">Cinder Vault Enterprises LLC</p>

        <div className="mt-6 space-y-6 text-base leading-relaxed text-foreground">
          <section>
            <h2 className="text-2xl font-semibold">Bloom is now free</h2>
            <p className="mt-2">Everything on Bloom is free to use. We don&apos;t ask for a card and there&apos;s nothing to buy, so new members have nothing to cancel or refund.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">If you paid for an earlier plan</h2>
            <p className="mt-2">
              Bloom used to offer paid subscriptions. Any remaining subscription is being cancelled, so you won&apos;t be charged again. If you have a question about an earlier payment or would like to ask for a refund,{" "}
              <Link href="/contact" className="underline underline-offset-2">please contact us</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Brokers</h2>
            <p className="mt-2">Bloom isn&apos;t a broker and doesn&apos;t hold any money for you. Deposits, fees and refunds at a broker are between you and that broker.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
