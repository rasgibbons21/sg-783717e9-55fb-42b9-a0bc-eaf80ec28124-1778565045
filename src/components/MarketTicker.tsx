import { memo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TickerQuote {
  symbol: string;
  price: number;
  changesPercentage: number;
}

interface MarketTickerProps {
  indices: TickerQuote[];
  briefingSnippet?: string;
  movers?: Array<{ symbol: string; change: number }>;
}

function TickerContent({ indices, briefingSnippet, movers }: MarketTickerProps) {
  return (
    <>
      {indices.map((q) => {
        const sym = q.symbol.includes("VIX") ? "VIX" : q.symbol;
        const isUp = q.changesPercentage >= 0;
        const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
        const color = isUp ? "#49B06E" : "#EF4444";
        return (
          <span key={q.symbol} className="inline-flex items-center gap-1 mx-5 shrink-0">
            <span className="font-bold text-[#F3EDE3]/80 text-[11px]">{sym}</span>
            <span className="text-[#F3EDE3]/40 text-[10px]">${q.price.toFixed(2)}</span>
            <Arrow className="w-3 h-3" style={{ color }} />
            <span className="font-bold text-[10px]" style={{ color }}>
              {isUp ? "+" : ""}{q.changesPercentage.toFixed(2)}%
            </span>
            <span className="text-[#F3EDE3]/10 ml-3">|</span>
          </span>
        );
      })}

      {briefingSnippet && (
        <span className="inline-flex items-center gap-1.5 mx-5 shrink-0">
          <span className="text-[10px]">🌸</span>
          <span className="text-[10px] text-[#A855F7]/80 italic max-w-[280px] truncate">
            {briefingSnippet}
          </span>
          <span className="text-[#F3EDE3]/10 ml-3">|</span>
        </span>
      )}

      {movers?.map((m) => (
        <span key={m.symbol} className="inline-flex items-center gap-1 mx-4 shrink-0">
          <span className="text-[10px] font-semibold text-[#F3EDE3]/50">{m.symbol}</span>
          <span className="text-[10px] font-bold text-[#49B06E]">+{m.change.toFixed(1)}%</span>
        </span>
      ))}
    </>
  );
}

export const MarketTicker = memo(function MarketTicker(props: MarketTickerProps) {
  const { indices, briefingSnippet, movers } = props;

  if (indices.length === 0) return null;

  return (
    <div
      className="overflow-hidden relative rounded-lg mb-4"
      style={{
        background: "rgba(13,17,23,0.9)",
        border: "1px solid rgba(39,183,200,0.08)",
        height: 30,
      }}
    >
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(13,17,23,0.95), transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, rgba(13,17,23,0.95), transparent)" }}
      />

      <div className="flex items-center h-full whitespace-nowrap ticker-scroll">
        <TickerContent indices={indices} briefingSnippet={briefingSnippet} movers={movers} />
        <TickerContent indices={indices} briefingSnippet={briefingSnippet} movers={movers} />
      </div>

      <style>{`
        .ticker-scroll {
          animation: ticker-marquee 35s linear infinite;
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
});
