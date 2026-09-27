import { useState, useRef } from "react";
import { Share2, Download, X, TrendingUp, TrendingDown } from "lucide-react";
import { trackShareCard } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#07080C",
  card: "#121821",
  teal: "#27B7C8",
  green: "#49B06E",
  red: "#EF4444",
  amber: "#F59E0B",
  ivory: "#F3EDE3",
  dim: "rgba(243,237,227,0.5)",
};

interface TradeData {
  ticker: string;
  direction: string | null;
  pnl: number | null;
  pnlPct: number | null;
  entryPrice: number | null;
  exitPrice: number | null;
  grade: string | null;
  date: string;
}

interface StatsData {
  winRate: number;
  totalPnl: number;
  totalTrades: number;
  profitFactor: number;
  bestStreak: number;
  avgWin: number;
  avgLoss: number;
}

type ShareMode = { type: "trade"; data: TradeData } | { type: "stats"; data: StatsData };

function gradeAccent(g: string | null) {
  if (g === "A") return C.green;
  if (g === "B") return C.teal;
  if (g === "C") return C.amber;
  return C.red;
}

function TradeCardContent({ data }: { data: TradeData }) {
  const win = (data.pnl ?? 0) >= 0;
  const accent = win ? C.green : C.red;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${C.bg}, ${C.card})`,
        border: `1px solid ${accent}33`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accent}22`,
        width: 340,
      }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
      <div className="p-6">
        {/* Ticker + Direction */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className="text-2xl font-bold font-mono"
              style={{ color: C.ivory }}
            >
              {data.ticker}
            </span>
            {data.direction && (
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1"
                style={{
                  background: `${data.direction === "long" ? C.green : C.red}20`,
                  color: data.direction === "long" ? C.green : C.red,
                }}
              >
                {data.direction === "long" ? (
                  <TrendingUp style={{ width: 10, height: 10 }} />
                ) : (
                  <TrendingDown style={{ width: 10, height: 10 }} />
                )}
                {data.direction.toUpperCase()}
              </span>
            )}
          </div>
          {data.grade && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-lg"
              style={{
                background: `${gradeAccent(data.grade)}15`,
                color: gradeAccent(data.grade),
                border: `1px solid ${gradeAccent(data.grade)}30`,
              }}
            >
              {data.grade}
            </div>
          )}
        </div>

        {/* P&L */}
        <div className="text-center mb-4">
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: accent }}
          >
            {win ? "Profit" : "Loss"}
          </p>
          <p
            className="text-4xl font-bold font-mono"
            style={{ color: accent }}
          >
            {win ? "+" : "-"}${Math.abs(data.pnl ?? 0).toFixed(2)}
          </p>
          {data.pnlPct != null && (
            <p className="text-sm mt-1" style={{ color: `${accent}99` }}>
              {data.pnlPct >= 0 ? "+" : ""}{data.pnlPct.toFixed(1)}%
            </p>
          )}
        </div>

        {/* Entry / Exit */}
        {data.entryPrice != null && data.exitPrice != null && (
          <div
            className="grid grid-cols-2 gap-px rounded-xl overflow-hidden mb-4"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="p-3 text-center" style={{ background: C.bg }}>
              <p className="text-[8px] font-bold uppercase tracking-wider mb-0.5" style={{ color: C.green }}>
                Entry
              </p>
              <p className="font-mono text-sm" style={{ color: `${C.ivory}CC` }}>
                ${data.entryPrice.toFixed(2)}
              </p>
            </div>
            <div className="p-3 text-center" style={{ background: C.bg }}>
              <p className="text-[8px] font-bold uppercase tracking-wider mb-0.5" style={{ color: C.teal }}>
                Exit
              </p>
              <p className="font-mono text-sm" style={{ color: `${C.ivory}CC` }}>
                ${data.exitPrice.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Date + Branding */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-[10px]" style={{ color: C.dim }}>{data.date}</span>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 14 }}>&#127800;</span>
            <span className="text-xs font-semibold" style={{ color: C.dim }}>
              Radar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCardContent({ data }: { data: StatsData }) {
  const positive = data.totalPnl >= 0;
  const accent = positive ? C.green : C.red;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${C.bg}, ${C.card})`,
        border: `1px solid ${C.teal}33`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${C.teal}22`,
        width: 340,
      }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.teal}, ${C.teal}88)` }} />
      <div className="p-6">
        {/* Header */}
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1 text-center"
          style={{ color: C.teal }}
        >
          Trading Performance
        </p>
        <p className="text-center mb-5">
          <span className="text-3xl font-bold font-mono" style={{ color: accent }}>
            {positive ? "+" : "-"}${Math.abs(data.totalPnl).toFixed(2)}
          </span>
          <span className="text-xs ml-2" style={{ color: C.dim }}>
            / {data.totalTrades} trades
          </span>
        </p>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 gap-px rounded-xl overflow-hidden mb-4"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {[
            { label: "Win Rate", value: `${data.winRate}%`, color: data.winRate >= 50 ? C.green : C.red },
            { label: "Profit Factor", value: data.profitFactor === Infinity ? "∞" : data.profitFactor.toFixed(2), color: data.profitFactor >= 1.5 ? C.green : data.profitFactor >= 1 ? C.amber : C.red },
            { label: "Avg Win", value: `+$${Math.abs(data.avgWin).toFixed(2)}`, color: C.green },
            { label: "Avg Loss", value: `-$${Math.abs(data.avgLoss).toFixed(2)}`, color: C.red },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 text-center" style={{ background: C.bg }}>
              <p className="text-[8px] font-bold uppercase tracking-wider mb-1" style={{ color: `${C.ivory}60` }}>
                {label}
              </p>
              <p className="font-mono text-base font-bold" style={{ color }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Best streak */}
        <div className="text-center mb-4">
          <span className="text-[10px]" style={{ color: C.dim }}>
            Best win streak:{" "}
          </span>
          <span className="text-sm font-bold" style={{ color: C.green }}>
            {data.bestStreak}
          </span>
        </div>

        {/* Branding */}
        <div
          className="flex items-center justify-center gap-2 pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span style={{ fontSize: 14 }}>&#127800;</span>
          <span className="text-xs font-semibold" style={{ color: C.dim }}>
            Radar
          </span>
        </div>

        {/* Disclaimer */}
        <p
          className="text-center mt-2"
          style={{ color: `${C.ivory}25`, fontSize: 7, lineHeight: "1.4" }}
        >
          HYPOTHETICAL / HISTORICAL SIMULATION. Not real money.
        </p>
      </div>
    </div>
  );
}

export function ShareCardModal({ mode, onClose }: { mode: ShareMode; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const doCapture = async () => {
    if (!cardRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    });
  };

  const handleShare = async () => {
    setBusy(true);
    trackShareCard(mode.type);
    try {
      const canvas = await doCapture();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (!blob) return;

      if (navigator.share) {
        const file = new File([blob], "radar-trade.png", { type: "image/png" });
        await navigator.share({
          title: "My trade on Radar",
          text: "Check out my trade on Radar! shebloomswealth.app",
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `radar-${mode.type}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      /* user cancelled */
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const canvas = await doCapture();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `radar-${mode.type}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      /* failed */
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm"
        >
          {/* Close */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <X className="w-4 h-4" style={{ color: C.dim }} />
            </button>
          </div>

          {/* Card */}
          <div ref={cardRef} className="flex justify-center">
            {mode.type === "trade" ? (
              <TradeCardContent data={mode.data} />
            ) : (
              <StatsCardContent data={mode.data} />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleShare}
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{ background: C.teal, color: C.bg }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleDownload}
              disabled={busy}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{ border: `1px solid ${C.teal}44`, color: C.teal }}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-sm"
            style={{ color: C.dim }}
          >
            Maybe later
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
