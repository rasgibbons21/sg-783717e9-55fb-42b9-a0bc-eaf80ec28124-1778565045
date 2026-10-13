import { X, ExternalLink, Check, Minus } from "lucide-react";
import type { BrokerConfig } from "@/config/brokers";

interface Props {
  brokers: BrokerConfig[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

function BoolCell({ value }: { value: boolean | null }) {
  if (value === true) return <Check className="w-4 h-4 text-[#49B06E] mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-destructive/50 mx-auto" />;
  return <Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" />;
}

export default function BrokerComparisonTable({ brokers, onRemove, onClose }: Props) {
  if (brokers.length === 0) return null;

  const rows: {
    label: string;
    render: (b: BrokerConfig) => React.ReactNode;
  }[] = [
    { label: "Type", render: (b) => <span className="capitalize">{b.type}</span> },
    { label: "Category", render: (b) => b.category },
    { label: "Beginner Friendly", render: (b) => <BoolCell value={b.beginnerFriendly} /> },
    { label: "Demo / Paper", render: (b) => <BoolCell value={b.paperTrading} /> },
    { label: "Stocks", render: (b) => <BoolCell value={b.supportedAssets.stocks} /> },
    { label: "ETFs", render: (b) => <BoolCell value={b.supportedAssets.etfs} /> },
    { label: "Forex", render: (b) => <BoolCell value={b.supportedAssets.forex} /> },
    { label: "CFDs", render: (b) => <BoolCell value={b.supportedAssets.cfds} /> },
    { label: "Crypto", render: (b) => <BoolCell value={b.supportedAssets.crypto} /> },
    { label: "Options", render: (b) => <BoolCell value={b.supportedAssets.options} /> },
    { label: "Commodities", render: (b) => <BoolCell value={b.supportedAssets.commodities} /> },
    { label: "Fractional Shares", render: (b) => <BoolCell value={b.supportedAssets.fractionalShares} /> },
    { label: "Education", render: (b) => b.educationLevel ? <span className="capitalize">{b.educationLevel}</span> : <Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" /> },
    { label: "Regions", render: (b) => b.regions.join(", ") },
    { label: "Best For", render: (b) => b.bestFor.join(", ") },
    { label: "Min Deposit", render: (b) => b.minimumDeposit || "—" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Compare Platforms</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Broker headers */}
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 w-36 sticky left-0 bg-card z-[1]">
                  Feature
                </th>
                {brokers.map((b) => (
                  <th key={b.id} className="p-4 text-center min-w-[140px]">
                    <div className="flex flex-col items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.logoPath}
                        alt={b.name}
                        className="h-8 w-8 object-contain"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      <span className="font-bold text-foreground text-sm">{b.name}</span>
                      <button
                        onClick={() => onRemove(b.id)}
                        className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-muted/10" : ""}>
                  <td className="p-3 text-xs font-medium text-muted-foreground sticky left-0 bg-inherit z-[1]">
                    {row.label}
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-3 text-xs text-center text-foreground/80">
                      {row.render(b)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* CTA row */}
              <tr className="border-t border-border">
                <td className="p-4 sticky left-0 bg-card z-[1]" />
                {brokers.map((b) => (
                  <td key={b.id} className="p-4 text-center">
                    <a
                      href={b.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2 text-xs font-semibold text-primary-foreground transition-all"
                    >
                      Visit
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Disclosure */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed text-center">
            Affiliate Disclosure: Links above are affiliate or referral links. Bloom may receive compensation at no additional cost to you. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
