import { useEffect, useState, memo } from "react";

interface SparklineProps {
  symbol: string;
  width?: number;
  height?: number;
}

const sparkCache = new Map<string, number[]>();

function SparkSVG({ prices, width, height, id }: {
  prices: number[]; width: number; height: number; id: string;
}) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pad = height * 0.1;

  const pts = prices.map((p, i) => ({
    x: (i / (prices.length - 1)) * width,
    y: height - pad - ((p - min) / range) * (height - pad * 2),
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? "#49B06E" : "#EF4444";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const Sparkline = memo(function Sparkline({ symbol, width = 100, height = 36 }: SparklineProps) {
  const [prices, setPrices] = useState<number[] | null>(sparkCache.get(symbol) ?? null);

  useEffect(() => {
    if (sparkCache.has(symbol)) {
      setPrices(sparkCache.get(symbol)!);
      return;
    }
    let cancelled = false;
    fetch(`/api/proxy/yahoo-chart?ticker=${encodeURIComponent(symbol)}&interval=5m&range=1d`)
      .then(r => r.ok ? r.json() : null)
      .then(raw => {
        if (cancelled || !raw) return;
        const closes: (number | null)[] = raw?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
        const valid = closes.filter((c): c is number => c != null);
        if (valid.length >= 2) {
          sparkCache.set(symbol, valid);
          setPrices(valid);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [symbol]);

  if (!prices || prices.length < 2) {
    return <div style={{ width, height }} className="rounded bg-white/5 animate-pulse" />;
  }

  const gradId = `sp-${symbol.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div style={{ width, height }}>
      <SparkSVG prices={prices} width={width} height={height} id={gradId} />
    </div>
  );
});
