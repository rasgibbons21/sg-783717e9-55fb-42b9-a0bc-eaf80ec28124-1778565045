import { useState } from "react";
import { ExternalLink, Copy, Check, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { BrokerConfig } from "@/config/brokers";

interface BrokerCardProps {
  broker: BrokerConfig;
}

export default function BrokerCard({ broker }: BrokerCardProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const trackAndOpen = async (url: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("broker_clicks").insert({
        broker_name: broker.name,
        user_id: session?.user?.id ?? null,
      });
    } catch {}
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const primaryLink = broker.affiliateLinks.openAccount
    || broker.affiliateLinks.homepage
    || broker.website;

  const demoLink = broker.affiliateLinks.demoAccount
    || broker.affiliateLinks.openAccount
    || broker.website;

  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={broker.logo}
              alt={broker.name}
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = document.createElement("span");
                fallback.className = "text-2xl font-bold text-foreground/60";
                fallback.textContent = broker.name[0];
                e.currentTarget.parentElement?.appendChild(fallback);
              }}
            />
            <h3 className="mt-3 text-xl font-bold text-foreground">{broker.name}</h3>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i < Math.floor(broker.beginnerRating)
                        ? "bg-primary"
                        : "bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                Beginner: {broker.beginnerRating}/5
              </span>
            </div>
          </div>
          {broker.regulated ? (
            <Badge variant="outline" className="text-[10px] bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20 gap-1 shrink-0">
              <Shield className="w-3 h-3" /> Regulated
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] bg-[#27B7C8]/10 text-[#27B7C8] border-[#27B7C8]/20 shrink-0">
              Tool
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {broker.description}
        </p>

        {/* Markets */}
        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Available Markets
          </p>
          <div className="flex flex-wrap gap-1.5">
            {broker.markets.slice(0, 4).map((market) => (
              <span
                key={market}
                className="rounded-full bg-muted/50 border border-border/50 px-2.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {market}
              </span>
            ))}
            {broker.markets.length > 4 && (
              <span className="rounded-full bg-muted/50 border border-border/50 px-2.5 py-0.5 text-[11px] text-muted-foreground/60">
                +{broker.markets.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Best For */}
        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Best For
          </p>
          <div className="flex flex-wrap gap-1.5">
            {broker.bestFor.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Key Info */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/30 border border-border/30 p-3">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Min Deposit</p>
            <p className="mt-0.5 font-semibold text-foreground text-sm">{broker.minimumDeposit}</p>
          </div>
          <div className="rounded-lg bg-muted/30 border border-border/30 p-3">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Platforms</p>
            <p className="mt-0.5 font-semibold text-foreground text-sm">{broker.platforms.length}+</p>
          </div>
        </div>

        {/* Referral Code */}
        {broker.referralCode && (
          <div className="mt-4 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Referral Code
            </p>
            <div className="flex items-center justify-between rounded-lg bg-muted/30 border border-border/30 p-3">
              <code className="text-sm font-mono text-primary">{broker.referralCode}</code>
              <button
                onClick={() => copyToClipboard(broker.referralCode!, "referral")}
                className="transition-colors hover:text-primary"
              >
                {copiedCode === "referral" ? (
                  <Check className="h-4 w-4 text-[#49B06E]" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-6 space-y-2">
          {broker.demoAccountAvailable && (
            <button
              onClick={() => trackAndOpen(demoLink)}
              className="w-full rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/50"
            >
              Try Demo Account
            </button>
          )}
          <button
            onClick={() => trackAndOpen(primaryLink)}
            className="w-full rounded-xl bg-primary hover:bg-primary/90 px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
          >
            {broker.regulated ? "Open Account" : "Visit Platform"}
            <ExternalLink className="h-4 w-4" />
          </button>
          {broker.educationLink && (
            <button
              onClick={() => window.open(broker.educationLink!, "_blank", "noopener,noreferrer")}
              className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground flex items-center justify-center gap-2"
            >
              View Resources
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
