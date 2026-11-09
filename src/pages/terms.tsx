import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";

export default function Terms() {
  return (
    <Layout>
      <SEO
        title="Terms of Service - Bloom"
        description="Terms of Service for Bloom by Cinder Vault Enterprises LLC"
      />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <div>
          <h1 className="mb-2 font-serif text-4xl font-bold text-primary">Terms of Service</h1>
          <p className="text-muted-foreground">Cinder Vault Enterprises LLC</p>
          <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
        </div>

        <Card className="p-6">
          <div className="prose prose-sm max-w-none">
            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Acceptance of Terms</h2>
            <p className="mb-6 text-foreground">
              By accessing or using Bloom, you agree to be bound by these Terms of Service. If you do not agree, do not use Bloom.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">The Service</h2>
            <p className="mb-6 text-foreground">
              Bloom is a free education platform operated by Cinder Vault Enterprises LLC. Bloom provides lessons about analysing US stocks and ETFs, a practice area using simulated money, leaderboards, and Pansy, our AI learning companion. Bloom is NOT a registered investment advisor, broker-dealer, or financial institution, and it does not hold money or place real trades.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Educational Purpose Only</h2>
            <p className="mb-2 text-foreground">
              All content on Bloom, including lessons, practice results, leaderboards and Pansy's replies, is for EDUCATIONAL PURPOSES ONLY. Pansy is an AI and can make mistakes.
            </p>
            <p className="mb-2 text-foreground">Nothing on Bloom constitutes:</p>
            <ul className="mb-6 space-y-2 text-foreground">
              <li>Financial advice</li>
              <li>Investment recommendations</li>
              <li>Trade calls or calls to action</li>
              <li>Guarantees of any investment returns</li>
            </ul>
            <p className="mb-6 text-foreground">
              You are solely responsible for all investment decisions you make.
            </p>
            <p className="mb-6 text-foreground">
              Budgeting tools are educational. Savings projections are estimates based on the figures you enter, not guarantees, and Ideas to study are general learning topics, not recommendations.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Eligibility</h2>
            <p className="mb-6 text-foreground">
              You must be at least 18 years old to use Bloom. You must be legally permitted to invest in your jurisdiction.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">User Accounts</h2>
            <p className="mb-6 text-foreground">
              You are responsible for maintaining the security of your account and password. You agree to provide accurate information when creating your account. You may not share your account with others.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Affiliate Disclosure</h2>
            <p className="mb-6 text-foreground">
              Bloom is free because it participates in broker affiliate programs. We may earn a commission if you open an account with a broker through a link on Bloom, at no extra cost to you. This never affects what we teach or what Pansy says. Listing a broker isn't a recommendation, and availability depends on your country.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Intellectual Property</h2>
            <p className="mb-6 text-foreground">
              All content, including Pansy's character, the logo, and all app content, is owned by Cinder Vault Enterprises LLC. You may not copy, reproduce, or distribute our content without written permission.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Limitation of Liability</h2>
            <p className="mb-6 text-foreground">
              Cinder Vault Enterprises LLC shall not be liable for any investment losses or damages arising from your use of Bloom or reliance on any content provided through our platform. Your use of Bloom is entirely at your own risk.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Termination</h2>
            <p className="mb-6 text-foreground">
              We reserve the right to terminate or suspend your account at any time for violation of these terms.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Governing Law</h2>
            <p className="mb-6 text-foreground">
              These terms are governed by the laws of the United States of America.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Changes to Terms</h2>
            <p className="mb-6 text-foreground">
              We may update these terms at any time. Continued use of Bloom after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Contact</h2>
            <p className="text-foreground">
              Cinder Vault Enterprises LLC<br />
              <a href="mailto:cindervaultenterprisesllc@gmail.com" className="text-primary hover:underline">cindervaultenterprisesllc@gmail.com</a><br />
              <a href="https://shebloomswealth.app" className="text-primary hover:underline">shebloomswealth.app</a>
            </p>
          </div>
        </Card>

        <Card className="border-accent bg-accent/5 p-4">
          <p className="text-sm text-muted-foreground">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}