import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";

export default function Terms() {
  return (
    <Layout>
      <SEO
        title="Terms of Service - She Blooms Wealth"
        description="Terms of Service for She Blooms Wealth by Cinder Vault Enterprises LLC"
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
              By accessing or using She Blooms Wealth, you agree to be bound by these Terms of Service. If you do not agree, do not use She Blooms Wealth.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">The Service</h2>
            <p className="mb-6 text-foreground">
              She Blooms Wealth is an educational investing platform operated by Cinder Vault Enterprises LLC. She Blooms Wealth provides educational content about stocks, ETFs, mutual funds, and investing through Pansy, our AI guide. She Blooms Wealth is NOT a registered investment advisor, broker-dealer, or financial institution.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Educational Purpose Only</h2>
            <p className="mb-2 text-foreground">
              All content on She Blooms Wealth, including Pansy's analysis, market commentary, ETF suggestions, and stock information, is for EDUCATIONAL PURPOSES ONLY.
            </p>
            <p className="mb-2 text-foreground">Nothing on She Blooms Wealth constitutes:</p>
            <ul className="mb-6 space-y-2 text-foreground">
              <li>Financial advice</li>
              <li>Investment recommendations</li>
              <li>Trading signals or calls to action</li>
              <li>Guarantees of any investment returns</li>
            </ul>
            <p className="mb-6 text-foreground">
              You are solely responsible for all investment decisions you make.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Eligibility</h2>
            <p className="mb-6 text-foreground">
              You must be at least 18 years old to use She Blooms Wealth. You must be legally permitted to invest in your jurisdiction.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">User Accounts</h2>
            <p className="mb-6 text-foreground">
              You are responsible for maintaining the security of your account and password. You agree to provide accurate information when creating your account. You may not share your account with others.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Affiliate Disclosure</h2>
            <p className="mb-6 text-foreground">
              She Blooms Wealth participates in broker affiliate programs. We may earn a commission when you sign up with a recommended broker through our platform. This never affects the independence of our educational content or Pansy's analysis.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Intellectual Property</h2>
            <p className="mb-6 text-foreground">
              All content, including Pansy's character, the logo, and all app content, is owned by Cinder Vault Enterprises LLC. You may not copy, reproduce, or distribute our content without written permission.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Limitation of Liability</h2>
            <p className="mb-6 text-foreground">
              Cinder Vault Enterprises LLC shall not be liable for any investment losses or damages arising from your use of She Blooms Wealth or reliance on any content provided through our platform. Your use of She Blooms Wealth is entirely at your own risk.
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
              We may update these terms at any time. Continued use of She Blooms Wealth after changes constitutes acceptance of the new terms.
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
            This is educational content only and does not constitute financial advice. She Blooms Wealth is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}