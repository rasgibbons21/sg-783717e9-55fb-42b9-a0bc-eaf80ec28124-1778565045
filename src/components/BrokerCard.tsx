import { useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  Shield,
  Wrench,
  ChevronDown,
  ChevronUp,
  Info,
  Bookmark,
  BookmarkCheck,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { BrokerConfig } from "@/config/brokers";

interface BrokerCardProps {
  broker: BrokerConfig;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onCompare?: (broker: BrokerConfig) => void;
  isInCompare?: boolean;
  onViewDetail?: (broker: BrokerConfig) => void;
  compact?: boolean;
}

export default function BrokerCard({
  broker,
  isSaved,
  onToggleSave,
  onCompare,
  isInCompare,
  onViewDetail,
  compact,
}: BrokerCardProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showMore, setShowMore] = useState(false);

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

  const assetLabels: { key: keyof BrokerConfig["supportedAssets"]; label: string }[] = [
    { key: "stocks", label: "Stocks" },
    { key: "etfs", label: "ETFs" },
    { key: "forex", label: "Forex" },
    { key: "cfds", label: "CFDs" },
    { key: "crypto", label: "Crypto" },
    { key: "options", label: "Options" },
    { key: "commodities", label: "Commodities" },
    { key: "futures", label: "Futures" },
    { key: "bonds", label: "Bonds" },
    { key: "fractionalShares", label: "Fractional" },
    { key: "mutualFunds", label: "Mutual Funds" },
  ];

  const supportedAssets = assetLabels.filter((a) => broker.supportedAssets[a.key] === true);

  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 p-5 flex flex-col h-full">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={broker.logoPath}
              alt={broker.name}
              className="h-10 w-10 object-contain shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-foreground truncate">{broker.name}</h3>
              <p className="text-xs text-muted-foreground">{broker.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(broker.id)}
                className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label={isSaved ? "Unsave broker" : "Save broker"}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                ) : (
                  <Bookmark className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            )}
            {broker.type === "broker" ? (
              <Badge variant="outline" className="text-[10px] bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20 gap-1">
                <Shield className="w-3 h-3" /> Broker
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-[#27B7C8]/10 text-[#27B7C8] border-[#27B7C8]/20 gap-1">
                <Wrench className="w-3 h-3" /> Platform
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {broker.shortDescription}
        </p>

        {/* Quick facts row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {broker.beginnerFriendly && (
            <Badge variant="outline" className="text-[10px] bg-[#49B06E]/10 text-[#49B06E] border-[#49B06E]/20">
              Beginner Friendly
            </Badge>
          )}
          {broker.paperTrading && (
            <Badge variant="outline" className="text-[10px] bg-[#27B7C8]/10 text-[#27B7C8] border-[#27B7C8]/20">
              Demo Available
            </Badge>
          )}
          {broker.educationLevel === "strong" && (
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Strong Education
            </Badge>
          )}
        </div>

        {/* Promotion */}
        {broker.promotionText && (
          <div className="mb-3 rounded-xl bg-primary/5 border border-primary/20 px-3 py-2">
            <p className="text-xs text-primary leading-relaxed">{broker.promotionText}</p>
          </div>
        )}

        {/* Best For */}
        <div className="mb-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Best For</p>
          <div className="flex flex-wrap gap-1.5">
            {broker.bestFor.slice(0, 4).map((b) => (
              <span key={b} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Supported Assets */}
        {supportedAssets.length > 0 && (
          <div className="mb-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Assets</p>
            <div className="flex flex-wrap gap-1.5">
              {supportedAssets.slice(0, compact ? 4 : 6).map((a) => (
                <span key={a.key} className="rounded-full bg-muted/50 border border-border/50 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  {a.label}
                </span>
              ))}
              {supportedAssets.length > (compact ? 4 : 6) && (
                <span className="rounded-full bg-muted/50 border border-border/50 px-2.5 py-0.5 text-[11px] text-muted-foreground/60">
                  +{supportedAssets.length - (compact ? 4 : 6)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Expandable details */}
        {!compact && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            {showMore ? "Less" : "More details"}
            {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        {showMore && !compact && (
          <div className="space-y-3 mb-3 animate-in fade-in duration-200">
            {/* Strengths */}
            {broker.strengths.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Strengths</p>
                <ul className="space-y-1">
                  {broker.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-xs text-foreground/80">
                      <Check className="w-3 h-3 text-[#49B06E] mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Limitations */}
            {broker.limitations.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Limitations</p>
                <ul className="space-y-1">
                  {broker.limitations.map((l) => (
                    <li key={l} className="text-xs text-muted-foreground leading-relaxed">
                      • {l}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Platforms */}
            {broker.platforms && (
              <div className="space-y-1.5">
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

            {/* Regions */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Regions</p>
              <div className="flex flex-wrap gap-1.5">
                {broker.regions.map((r) => (
                  <span key={r} className="rounded-full bg-muted/30 border border-border/30 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Partner Code */}
            {broker.partnerCode && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Partner Code</p>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 border border-border/30 p-2.5">
                  <code className="text-sm font-mono text-primary">{broker.partnerCode}</code>
                  <button onClick={copyCode} className="transition-colors hover:text-primary" aria-label="Copy code">
                    {copiedCode ? <Check className="h-4 w-4 text-[#49B06E]" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-4 space-y-2">
          {/* Primary CTA */}
          <a
            href={broker.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={trackClick}
            className="w-full rounded-xl bg-primary hover:bg-primary/90 px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
          >
            Visit {broker.name}
            <ExternalLink className="h-4 w-4" />
          </a>

          {/* Secondary row */}
          <div className="flex gap-2">
            {onCompare && (
              <button
                onClick={() => onCompare(broker)}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isInCompare
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                {isInCompare ? "In Compare" : "Compare"}
              </button>
            )}
            {onViewDetail && (
              <button
                onClick={() => onViewDetail(broker)}
                className="flex-1 rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground flex items-center justify-center gap-1.5"
              >
                <Info className="h-3.5 w-3.5" />
                Details
              </button>
            )}
          </div>

          {/* XM secondary actions */}
          {broker.secondaryActions.length > 0 && showMore && (
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
        </div>
      </div>
    </div>
  );
}
