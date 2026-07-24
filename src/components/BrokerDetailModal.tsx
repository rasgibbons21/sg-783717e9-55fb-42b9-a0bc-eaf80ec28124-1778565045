import { useEffect } from "react";
import { X, ExternalLink, AlertTriangle, Shield, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BrokerConfig } from "@/config/brokers";

interface Props {
  broker: BrokerConfig;
  onClose: () => void;
  onTrackClick: () => void;
}

export default function BrokerDetailModal({ broker, onClose, onTrackClick }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={broker.logo} alt={broker.name} className="h-8 w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div>
              <h2 className="text-lg font-bold text-foreground">{broker.name}</h2>
              <p className="text-xs text-muted-foreground">{broker.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            {broker.type === "broker" ? (
              <Badge variant="outline" className="text-[10px] bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20 gap-1">
                <Shield className="w-3 h-3" /> Broker
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-[#27B7C8]/10 text-[#27B7C8] border-[#27B7C8]/20 gap-1">
                <Wrench className="w-3 h-3" /> Platform
              </Badge>
            )}
            {broker.demoAvailable && (
              <Badge variant="outline" className="text-[10px] bg-[#27B7C8]/10 text-[#27B7C8] border-[#27B7C8]/20">
                Demo Available
              </Badge>
            )}
          </div>

          {/* Overview */}
          <Section title="Overview">
            <p className="text-sm text-foreground/80 leading-relaxed">{broker.shortDescription}</p>
          </Section>

          {/* Promotion */}
          {broker.promotionText && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
              <p className="text-xs text-primary leading-relaxed">{broker.promotionText}</p>
            </div>
          )}

          {/* Markets */}
          <Section title="Markets">
            <div className="flex flex-wrap gap-1.5">
              {broker.markets.map((m) => (
                <span key={m} className="rounded-full bg-muted/50 border border-border/50 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  {m}
                </span>
              ))}
            </div>
          </Section>

          {/* Platforms */}
          {broker.platforms && (
            <Section title="Platforms">
              <div className="flex flex-wrap gap-1.5">
                {broker.platforms.map((p) => (
                  <span key={p} className="rounded-full bg-muted/30 border border-border/30 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Best For */}
          <Section title="Best Suited For">
            <div className="flex flex-wrap gap-1.5">
              {broker.bestFor.map((b) => (
                <span key={b} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  {b}
                </span>
              ))}
            </div>
          </Section>

          {/* Key Info */}
          {(broker.minimumDeposit || broker.regulation) && (
            <div className="grid grid-cols-2 gap-3">
              {broker.minimumDeposit && (
                <div className="rounded-lg bg-muted/30 border border-border/30 p-3">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Min Deposit</p>
                  <p className="mt-0.5 font-semibold text-foreground text-sm">{broker.minimumDeposit}</p>
                </div>
              )}
              {broker.regulation && (
                <div className="rounded-lg bg-muted/30 border border-border/30 p-3">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Regulation</p>
                  <p className="mt-0.5 font-semibold text-foreground text-sm">{broker.regulation}</p>
                </div>
              )}
            </div>
          )}

          {/* Important Considerations */}
          <Section title="Important Considerations">
            <div className="rounded-xl bg-muted/20 border border-border/30 p-3 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Check availability and terms on the provider&apos;s website. Regional restrictions, deposit requirements, fees, and platform features may vary.
              </p>
            </div>
          </Section>

          {/* Risk Warning */}
          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-[11px] text-destructive/80 leading-relaxed">
                Trading and investing involve risk. CFDs, leveraged products, options, forex, and futures can result in substantial losses. Past performance does not guarantee future results.
              </p>
            </div>
          </div>

          {/* Affiliate Disclosure */}
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
            Affiliate Disclosure: This link is an affiliate or referral link. Bloom may receive compensation if you open an account or purchase a service, at no additional cost to you.
          </p>

          {/* CTA */}
          <a
            href={broker.primaryUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={onTrackClick}
            className="w-full rounded-xl bg-primary hover:bg-primary/90 px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
          >
            {broker.primaryButtonLabel}
            <ExternalLink className="h-4 w-4" />
          </a>

          {/* Secondary actions */}
          {broker.secondaryActions.length > 0 && (
            <div className="space-y-1.5">
              {broker.secondaryActions.map((action) => (
                <a
                  key={action.label}
                  href={action.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={onTrackClick}
                  className="w-full rounded-lg border border-border/30 bg-muted/10 px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground flex items-center justify-center gap-2"
                >
                  {action.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
