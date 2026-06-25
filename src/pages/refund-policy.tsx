import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";

export default function RefundPolicy() {
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
                <a href="mailto:support@shebloomswealth.app" className="text-primary hover:underline">
                  support@shebloomswealth.app
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

            <div className="mb-6 rounded-lg border-2 border-dashed border-amber-400/60 bg-amber-400/5 p-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-500">
                ✏️ Placeholder — Edit this section with your actual refund terms before publishing
              </p>
              <p className="text-sm text-foreground/70">
                Example options (choose one or adapt):
              </p>
              <ul className="mt-2 space-y-1 text-sm text-foreground/70">
                <li>• <em>&ldquo;We offer a full refund within [X] days of your initial purchase if you are not satisfied. After [X] days, no refunds are issued.&rdquo;</em></li>
                <li>• <em>&ldquo;All sales are final. Because Bloom delivers immediate access to digital educational content, we do not offer refunds on subscription payments.&rdquo;</em></li>
                <li>• <em>&ldquo;Annual subscribers may request a prorated refund within [X] days of their annual renewal date. Monthly subscriptions are non-refundable.&rdquo;</em></li>
              </ul>
            </div>

            <p className="mb-6 text-foreground">
              Regardless of refund eligibility, you may always cancel to stop future charges.
              If you believe you were charged in error, contact us and we will review your case promptly.
            </p>

            {/* ── How to Request a Refund ── */}
            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">How to Request a Refund</h2>
            <p className="mb-4 text-foreground">
              To request a refund, email us at{" "}
              <a href="mailto:support@shebloomswealth.app" className="text-primary hover:underline">
                support@shebloomswealth.app
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
                <a href="mailto:support@shebloomswealth.app" className="text-primary hover:underline">
                  support@shebloomswealth.app
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
