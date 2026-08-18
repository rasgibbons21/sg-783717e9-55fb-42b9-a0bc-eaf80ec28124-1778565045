import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { canShowExternalPayment } from "@/lib/payments";

export default function RefundPolicy() {
  if (!canShowExternalPayment) {
    return (
      <Layout>
        <SEO title="Refund Policy - Bloom" description="Refund policy for Bloom" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
          <div className="rounded-full bg-muted p-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Refund Policy</h1>
            <p className="text-muted-foreground max-w-sm">
              Billing information is not available in this version of the app.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Refund & Cancellation Policy - Bloom"
        description="Refund and cancellation policy for Bloom by Cinder Vault Enterprises LLC"
      />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <div>
          <h1 className="mb-2 font-serif text-4xl font-bold text-primary">Refund &amp; Cancellation Policy</h1>
          <p className="text-muted-foreground">Cinder Vault Enterprises LLC — She Blooms Wealth / Bloom</p>
          <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        </div>

        <Card className="p-6">
          <div className="prose prose-sm max-w-none">

            {/* ── Subscriptions ── */}
            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Subscriptions &amp; Billing</h2>
            <p className="mb-4 text-foreground">
              Bloom Pro is a paid subscription that gives you access to premium educational content,
              the Practice Trader, Bloom University, and AI-powered features. Subscriptions are
              billed through Stripe, our secure payment processor.
            </p>
            <ul className="mb-6 space-y-2 text-foreground">
              <li>
                <strong>Monthly plan:</strong> Billed once per month on the same date you originally subscribed.
              </li>
              <li>
                <strong>Annual plan:</strong> Billed once per year on the same date you originally subscribed,
                at the annual rate shown at checkout.
              </li>
              <li>
                <strong>Automatic renewal:</strong> Your subscription renews automatically at the end of each
                billing period until you cancel. You will not receive a separate reminder before renewal.
              </li>
              <li>
                <strong>Price changes:</strong> If we change subscription pricing, we will notify you in advance.
                Your rate will not change until your next renewal after the notice period.
              </li>
            </ul>

            {/* ── How to Cancel ── */}
            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">How to Cancel</h2>
            <p className="mb-4 text-foreground">
              You can cancel your Bloom Pro subscription at any time — no questions asked.
            </p>
            <ul className="mb-6 space-y-2 text-foreground">
              <li>
                <strong>Self-service:</strong> Log in to Bloom, go to your Account settings, and select
                &ldquo;Manage Subscription.&rdquo; You can cancel directly from there.
              </li>
              <li>
                <strong>By email:</strong> Email us at{" "}
                <a href="mailto:cindervaultenterprisesllc@gmail.com" className="text-primary hover:underline">
                  cindervaultenterprisesllc@gmail.com
                </a>{" "}
                with your account email and we will cancel on your behalf within 1 business day.
              </li>
              <li>
                <strong>What happens after cancellation:</strong> Cancelling stops all future charges.
                Your Pro access remains active until the end of the current paid billing period — you
                will not lose access immediately upon cancelling.
              </li>
            </ul>

            {/* ── Refunds ── */}
            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Refunds</h2>

            <p className="mb-4 text-foreground">
              We want you to feel confident starting your journey with Bloom. If Bloom Pro isn&apos;t
              the right fit, you may request a full refund within 7 days of your initial purchase.
            </p>
            <ul className="mb-6 space-y-2 text-foreground">
              <li>
                <strong>New subscribers:</strong> A full refund is available within 7 days of your
                first Pro payment, no questions asked.
              </li>
              <li>
                <strong>After 7 days:</strong> Subscription payments are non-refundable, but you can
                cancel anytime to stop all future charges (see Cancellation above).
              </li>
              <li>
                <strong>Renewals:</strong> Recurring renewal payments (monthly or annual) are
                non-refundable after they process. To avoid a renewal charge, cancel before your
                renewal date.
              </li>
            </ul>

            <p className="mb-6 text-foreground">
              Regardless of refund eligibility, you may always cancel to stop future charges.
              If you believe you were charged in error, contact us and we&apos;ll review your case promptly.
            </p>

            {/* ── How to Request a Refund ── */}
            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">How to Request a Refund</h2>
            <p className="mb-4 text-foreground">
              To request a refund, email us at{" "}
              <a href="mailto:cindervaultenterprisesllc@gmail.com" className="text-primary hover:underline">
                cindervaultenterprisesllc@gmail.com
              </a>{" "}
              with the following information:
            </p>
            <ul className="mb-6 space-y-2 text-foreground">
              <li>Your full name and the email address associated with your Bloom account</li>
              <li>The date of the charge you are disputing</li>
              <li>A brief description of your reason for requesting a refund</li>
            </ul>
            <p className="mb-6 text-foreground">
              We aim to respond to all refund requests within 3 business days. Approved refunds are
              processed through Stripe and typically appear on your original payment method within
              5–10 business days, depending on your bank.
            </p>

            {/* ── Educational Disclaimer ── */}
            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Educational Platform Disclaimer</h2>
            <p className="mb-4 text-foreground">
              Bloom is an educational platform operated by Cinder Vault Enterprises LLC. Your
              subscription provides access to educational content — including lessons, the Practice
              Trader simulator, and AI-powered learning tools — and does not constitute financial
              advice, investment advice, or brokerage services.
            </p>
            <p className="mb-6 text-foreground">
              The Practice Trader uses virtual money only. No real trades are executed. Bloom does
              not manage money, execute orders, or hold securities on behalf of any user.
              Subscriptions are purchased for access to educational content, not for financial
              outcomes. All investing involves risk of loss.
            </p>

            {/* ── Contact ── */}
            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Contact Us</h2>
            <p className="mb-2 text-foreground">
              Questions about billing, cancellation, or this policy? We&apos;re here to help.
            </p>
            <ul className="space-y-2 text-foreground">
              <li>
                Email:{" "}
                <a href="mailto:cindervaultenterprisesllc@gmail.com" className="text-primary hover:underline">
                  cindervaultenterprisesllc@gmail.com
                </a>
              </li>
              <li>Company: Cinder Vault Enterprises LLC</li>
            </ul>

          </div>
        </Card>
      </div>
    </Layout>
  );
}
