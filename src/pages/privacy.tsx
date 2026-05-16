import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <Layout>
      <SEO
        title="Privacy Policy - Bloom"
        description="Privacy Policy for Bloom by Cinder Vault Enterprises LLC"
      />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <div>
          <h1 className="mb-2 font-serif text-4xl font-bold text-primary">Privacy Policy</h1>
          <p className="text-muted-foreground">Cinder Vault Enterprises LLC</p>
          <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
        </div>

        <Card className="p-6">
          <div className="prose prose-sm max-w-none">
            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Introduction</h2>
            <p className="mb-6 text-foreground">
              Bloom ("we", "our", "us") is operated by Cinder Vault Enterprises LLC. We are committed to protecting your personal information and your right to privacy.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Information We Collect</h2>
            <ul className="mb-6 space-y-2 text-foreground">
              <li>Full name and email address at registration</li>
              <li>Risk tolerance and investment preferences</li>
              <li>App usage data and browsing behavior within Bloom</li>
              <li>Device information and IP address</li>
              <li>Watchlist and portfolio tracking data</li>
            </ul>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">How We Use Your Information</h2>
            <ul className="mb-6 space-y-2 text-foreground">
              <li>To provide and personalize the Bloom experience</li>
              <li>To send account confirmation and security emails from dahlia@shebloomswealth.app</li>
              <li>To improve our AI analysis and recommendations</li>
              <li>To send educational content and market updates only if you opt in</li>
              <li>We never sell your personal data to third parties</li>
              <li>We never share your data with advertisers</li>
            </ul>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Data Storage</h2>
            <p className="mb-6 text-foreground">
              Your data is stored securely using Supabase infrastructure with industry standard encryption. We retain your data for as long as your account is active or as required by law.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Broker Affiliate Disclosure</h2>
            <p className="mb-6 text-foreground">
              Some broker links on Bloom are affiliate partnerships. If you sign up with a recommended broker through our link, Bloom may earn a referral commission at no additional cost to you. We only recommend brokers we genuinely believe are good for our users.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Cookies</h2>
            <p className="mb-6 text-foreground">
              We use essential cookies to keep you logged in and remember your preferences. We do not use advertising or tracking cookies.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Your Rights</h2>
            <p className="mb-2 text-foreground">You have the right to:</p>
            <ul className="mb-6 space-y-2 text-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data</li>
            </ul>
            <p className="mb-6 text-foreground">
              To exercise these rights, email: <a href="mailto:info@vanguardapexholdings.com" className="text-primary hover:underline">info@vanguardapexholdings.com</a>
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Children</h2>
            <p className="mb-6 text-foreground">
              Bloom is not intended for users under 18 years old.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Changes to This Policy</h2>
            <p className="mb-6 text-foreground">
              We may update this policy periodically. We will notify you by email of significant changes.
            </p>

            <h2 className="mb-4 font-serif text-2xl font-semibold text-primary">Contact</h2>
            <p className="text-foreground">
              Cinder Vault Enterprises LLC<br />
              <a href="mailto:info@vanguardapexholdings.com" className="text-primary hover:underline">info@vanguardapexholdings.com</a><br />
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