import { useState } from "react";
import { ExternalLink, Copy, Check, Shield, Wrench, ChevronDown, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { BrokerConfig } from "@/config/brokers";
import BrokerDetailModal from "./BrokerDetailModal";

interface BrokerCardProps {
  broker: BrokerConfig;
}

export default function BrokerCard({ broker }: BrokerCardProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const copyCode = () => {
    if (!broker.partnerCode) return;
    navigator.clipboard.writeText(broker.partnerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const trackClick = () => {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        supabase.from("broker_clicks").insert({
          broker_name: broker.name,
          user_id: session?.user?.id ?? null,
        });
      });
    } catch {}
  };

  return (
    <>
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
                  const fb = document.createElement("span");
                  fb.className = "text-2xl font-bold text-foreground/60";
                  fb.textContent = broker.name[0];
                  e.currentTarget.parentElement?.appendChild(fb);
                }}
              />
              <h3 className="mt-3 text-xl font-bold text-foreground">{broker.name}</h3>
            </div>
            {broker.type === "broker" ? (
              <Badge variant="outline" className="text-[10px] bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20 gap-1 shrink-0">
                <Shield className="w-3 h-3" /> Broker
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-[#27B7C8]/10 text-[#27B7C8] border-[#27B7C8]/20 gap-1 shrink-0">
                <Wrench className="w-3 h-3" /> Platform
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {broker.shortDescription}
          </p>

          {/* Promotion */}
          {broker.promotionText && (
            <div className="mt-3 rounded-xl bg-primary/5 border border-primary/20 px-3 py-2">
              <p className="text-xs text-primary leading-relaxed">{broker.promotionText}</p>
            </div>
          )}

          {/* Markets */}
          <div className="mt-4 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Markets</p>
            <div className="flex flex-wrap gap-1.5">
              {broker.markets.slice(0, 4).map((m) => (
                <span key={m} className="rounded-full bg-muted/50 border border-border/50 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  {m}
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
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Best For</p>
            <div className="flex flex-wrap gap-1.5">
              {broker.bestFor.slice(0, 3).map((b) => (
                <span key={b} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Platforms */}
          {broker.platforms && (
            <div className="mt-3 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Platforms</p>
              <div className="flex flex-wrap gap-1.5">
                {broker.platforms.map((p) => (
                  <span key={p} className="rounded-full bg-muted/30 border border-border/30 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Demo badge */}
          {broker.demoAvailable && (
            <div className="mt-3">
              <Badge variant="outline" className="text-[10px] bg-[#27B7C8]/10 text-[#27B7C8] border-[#27B7C8]/20">
                Demo Account Available
              </Badge>
            </div>
          )}

          {/* Partner Code */}
          {broker.partnerCode && (
            <div className="mt-4 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Partner Code</p>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 border border-border/30 p-3">
                <code className="text-sm font-mono text-primary">{broker.partnerCode}</code>
                <button onClick={copyCode} className="transition-colors hover:text-primary" aria-label="Copy code">
                  {copiedCode ? (
                    <Check className="h-4 w-4 text-[#49B06E]" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto pt-6 space-y-2">
            {/* Primary CTA */}
            <a
              href={broker.primaryUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={trackClick}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
            >
              {broker.primaryButtonLabel}
              <ExternalLink className="h-4 w-4" />
            </a>

            {/* Secondary actions (XM has multiple) */}
            {broker.secondaryActions.length > 0 && (
              <>
                <button
                  onClick={() => setShowSecondary(!showSecondary)}
                  className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground flex items-center justify-center gap-1"
                >
                  More Options
                  <ChevronDown className={`h-3 w-3 transition-transform ${showSecondary ? "rotate-180" : ""}`} />
                </button>
                {showSecondary && (
                  <div className="space-y-1.5">
                    {broker.secondaryActions.map((action) => (
                      <a
                        key={action.label}
                        href={action.url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={trackClick}
                        className="w-full rounded-lg border border-border/30 bg-muted/10 px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground flex items-center justify-center gap-2"
                      >
                        {action.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* View Details */}
            <button
              onClick={() => setShowDetail(true)}
              className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground flex items-center justify-center gap-1.5"
            >
              <Info className="h-3.5 w-3.5" />
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <BrokerDetailModal broker={broker} onClose={() => setShowDetail(false)} onTrackClick={trackClick} />
      )}
    </>
  );
}
