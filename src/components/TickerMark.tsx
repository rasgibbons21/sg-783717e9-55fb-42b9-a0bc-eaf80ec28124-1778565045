import { useState, useEffect, memo } from "react";

const SIZES = {
  sm: { well: 28, img: 24, text: 10, radius: 6 },
  md: { well: 36, img: 32, text: 12, radius: 8 },
} as const;

type Size = keyof typeof SIZES;

function normalizeTicker(raw: string): string {
  let t = raw.trim().toUpperCase();
  const colon = t.indexOf(":");
  if (colon !== -1) t = t.slice(colon + 1);
  return t;
}

function monogram(ticker: string): string {
  const letters = ticker.replace(/[^A-Z]/g, "");
  return letters.slice(0, 2) || ticker.slice(0, 2).toUpperCase();
}

const logoDevKey = process.env.NEXT_PUBLIC_LOGO_DEV_KEY;

function buildUrl(ticker: string): string | null {
  if (logoDevKey) {
    return `https://img.logo.dev/ticker/${ticker}?token=${logoDevKey}&size=64&format=png`;
  }
  return `https://financialmodelingprep.com/image-stock/${ticker}.png`;
}

type CacheEntry = { ok: boolean; fetchedAt: number };
const memCache = new Map<string, CacheEntry>();

function readCache(ticker: string): CacheEntry | null {
  const mem = memCache.get(ticker);
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(`tl:${ticker}`);
    if (raw) {
      const parsed = JSON.parse(raw) as CacheEntry;
      memCache.set(ticker, parsed);
      return parsed;
    }
  } catch {}
  return null;
}

function writeCache(ticker: string, ok: boolean) {
  const entry: CacheEntry = { ok, fetchedAt: Date.now() };
  memCache.set(ticker, entry);
  try { localStorage.setItem(`tl:${ticker}`, JSON.stringify(entry)); } catch {}
}

function shouldRetry(entry: CacheEntry): boolean {
  const age = Date.now() - entry.fetchedAt;
  if (!entry.ok) return age > 24 * 60 * 60 * 1000;
  return age > 30 * 24 * 60 * 60 * 1000;
}

interface Props {
  ticker: string;
  size?: Size;
  className?: string;
}

export const TickerMark = memo(function TickerMark({ ticker, size = "md", className }: Props) {
  const t = normalizeTicker(ticker);
  const s = SIZES[size];
  const url = buildUrl(t);
  const [showImg, setShowImg] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) { setFailed(true); return; }
    const cached = readCache(t);
    if (cached && !shouldRetry(cached)) {
      setShowImg(cached.ok);
      setFailed(!cached.ok);
      return;
    }
    setShowImg(false);
    setFailed(false);
    const img = new Image();
    img.onload = () => { writeCache(t, true); setShowImg(true); setFailed(false); };
    img.onerror = () => { writeCache(t, false); setFailed(true); setShowImg(false); };
    img.src = url;
    return () => { img.onload = null; img.onerror = null; };
  }, [t, url]);

  const mono = monogram(t);

  return (
    <div
      className={`shrink-0 flex items-center justify-center overflow-hidden ${className || ""}`}
      style={{
        width: s.well,
        height: s.well,
        borderRadius: s.radius,
        background: "#131B27",
        border: "1px solid #1C2430",
      }}
      role="img"
      aria-label={showImg && !failed ? `${t} logo` : `${t} monogram`}
    >
      {showImg && !failed && url ? (
        <img
          src={url}
          alt=""
          width={s.img}
          height={s.img}
          loading="lazy"
          decoding="async"
          style={{ objectFit: "contain", width: s.img, height: s.img }}
          onError={() => { writeCache(t, false); setFailed(true); setShowImg(false); }}
        />
      ) : (
        <span
          style={{
            fontSize: s.text,
            fontWeight: 600,
            color: "#27B7C8",
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          {mono}
        </span>
      )}
    </div>
  );
});

export default TickerMark;
