import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  UserPlus,
  FileText,
  Landmark,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Choose a Broker",
    body: "Compare platforms based on fees, available markets, educational resources, and whether they're regulated in your region. Use our comparison tool above to find the right fit.",
  },
  {
    icon: UserPlus,
    title: "2. Create Your Account",
    body: "Visit the broker's website or app and sign up. You'll need your full name, email address, date of birth, and a phone number. Most brokers let you start in under 10 minutes.",
  },
  {
    icon: FileText,
    title: "3. Verify Your Identity",
    body: "Upload a government-issued ID (passport, driver's license, or national ID) and a proof of address (utility bill or bank statement). This is a legal requirement called KYC (Know Your Customer).",
  },
  {
    icon: Landmark,
    title: "4. Fund Your Account",
    body: "Link your bank account or use a debit card to deposit funds. Most brokers accept bank transfers, cards, and some accept e-wallets. Start with an amount you're comfortable with — even $50 is enough to begin.",
  },
  {
    icon: ShieldCheck,
    title: "5. Set Up Security",
    body: "Enable two-factor authentication (2FA) and set a strong password. Some brokers also offer biometric login. Protecting your account is just as important as choosing the right investments.",
  },
  {
    icon: Sparkles,
    title: "6. Start Exploring",
    body: "Before placing real trades, explore the platform. Many brokers offer demo accounts or paper trading so you can practice without risking real money. Take your time learning the interface.",
  },
];

export default function OpenBrokerageGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left group"
      >
        <Card className="p-5 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border-accent/30 rounded-2xl hover:border-accent/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/15">
                <Landmark className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-serif text-lg md:text-xl font-bold text-foreground">
                  How to Open a Brokerage Account
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A step-by-step guide for first-time investors
                </p>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors shrink-0">
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </Card>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            {steps.map((step) => (
              <Card
                key={step.title}
                className="p-4 bg-card/80 border-border/50 rounded-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-accent/10 shrink-0">
                    <step.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-3 p-4 bg-primary/5 border-primary/20 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm shrink-0">
                🌺
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  Pansy's tip:
                </span>{" "}
                Don't rush into trading. Open a demo account first, learn how
                orders work, and only move to real money when you feel confident.
                There's no prize for going fast — slow and steady builds real
                wealth.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
