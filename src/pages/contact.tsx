import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Mail, Clock, Globe, Building2 } from "lucide-react";

export default function Contact() {
  return (
    <Layout>
      <SEO
        title="Contact Us - Bloom"
        description="Contact Cinder Vault Enterprises LLC for Bloom support and inquiries"
      />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <div className="text-center">
          <h1 className="mb-2 font-serif text-4xl font-bold text-primary">Contact Us</h1>
          <p className="text-muted-foreground">We're here to help you on your wealth building journey</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-primary mb-4">Get in Touch</h2>
            
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-accent mt-0.5" shrink-0 />
              <div>
                <p className="font-medium text-foreground">Company</p>
                <p className="text-muted-foreground">Cinder Vault Enterprises LLC</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-accent mt-0.5" shrink-0 />
              <div>
                <p className="font-medium text-foreground">General Inquiries</p>
                <a href="mailto:info@vanguardapexholdings.com" className="text-primary hover:underline">
                  info@vanguardapexholdings.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-accent mt-0.5" shrink-0 />
              <div>
                <p className="font-medium text-foreground">Support</p>
                <a href="mailto:admin@vanguardapexholdings.com" className="text-primary hover:underline">
                  admin@vanguardapexholdings.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-accent mt-0.5" shrink-0 />
              <div>
                <p className="font-medium text-foreground">Website</p>
                <a href="https://shebloomswealth.app" className="text-primary hover:underline">
                  shebloomswealth.app
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-accent mt-0.5" shrink-0 />
              <div>
                <p className="font-medium text-foreground">Response Time</p>
                <p className="text-muted-foreground">Within 24-48 hours</p>
              </div>
            </div>
          </Card>

          <Card className="border-accent bg-gradient-to-br from-accent/20 to-background p-8 flex flex-col justify-center">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-3xl shadow-lg">
                🌺
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary">
                Pansy's Support Team
              </h3>
              <p className="text-foreground leading-relaxed">
                Have questions about Bloom, your account, or need technical help? Our team is ready to assist you. 
                Just send us an email and we'll get back to you as soon as possible 💛
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}