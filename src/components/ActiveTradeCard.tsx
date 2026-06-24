import { useState } from "react";
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  X, AlertTriangle, Loader2,
  SplitSquareVertical, StopCircle, Target, StickyNote,
} from "lucide-react";

// ── Shared types ───────────────────────────────────────────────────────────
export interface Trade {
  id: string;
  ticker: string;
  direction: "long" | "short";
  shares: number;
  entry_price: number;
  exit_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  pnl: number | null;
  pnl_pct: number | null;
  risk_amount: number | null;
  thesis: string | null;
  exit_reason: string | null;
  status: "open" | "closed";
  entry_at: string;
  exit_at: string | null;
}

interface Props {
  trade: Trade;
  currentPrice: number | null;
  priceLoading?: boolean;
  onClose: (trade: Trade) => void;
  onCloseHalf: (trade: Trade, exitPrice: number, reason: string) => Promise<void>;
  onMoveStop: (trade: Trade, newStop: number) => Promise<void>;
  onAdjustTarget: (trade: Trade, newTarget: number) => Promise<void>;
  onAddNote: (trade: Trade, note: string) => Promise<void>;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtP(n: number | null | undefined) {
  if (n == null) return "—";
  return `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function livePnL(trade: Trade, price: number) {
  const pnl = trade.direction === "long"
    ? (price - trade.entry_price) * trade.shares
    : (trade.entry_price - price) * trade.shares;
  const pnlPct = trade.direction === "long"
    ? ((price - trade.entry_price) / trade.entry_price) * 100
    : ((trade.entry_price - price) / trade.entry_price) * 100;
  return { pnl, pnlPct };
}

function holdingTime(entryAt: string) {
  const diff = Date.now() - new Date(entryAt).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m < 1 ? "<1" : m}m`;
}

function remainingRR(trade: Trade, price: number) {
  if (!trade.stop_price || !trade.target_price) return null;
  const risk = trade.direction === "long" ? price - trade.stop_price : trade.stop_price - price;
  const reward = trade.direction === "long" ? trade.target_price - price : price - trade.target_price;
  if (risk <= 0 || reward <= 0) return null;
  return reward / risk;
}

function priceDiff(current: number, reference: number) {
  const diff = current - reference;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}$${Math.abs(diff).toFixed(2)}`;
}

// ── Mini modal shell ───────────────────────────────────────────────────────
function MiniModal({ title, onClose, children }: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0E1B30] rounded-2xl border border-[#27B7C8]/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-base font-bold text-[#F4F7FA]">{title}</h3>
          <button onClick={onClose} className="text-[#F4F7FA]/30 hover:text-[#F4F7FA]">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function inputCls(v: string) {
  return `w-full bg-[#16264A] border ${v ? "border-[#27B7C8]/40" : "border-[#27B7C8]/15"} rounded-lg px-3 py-2.5 text-[#F4F7FA] text-sm focus:outline-none focus:border-[#27B7C8] transition-colors`;
}

// ── Close-half modal ───────────────────────────────────────────────────────
function CloseHalfModal({ trade, onSubmit, onClose }: {
  trade: Trade;
  onSubmit: (exitPrice: number, reason: string) => Promise<void>;
  onClose: () => void;
}) {
  const [exitPrice, setExitPrice] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const half = trade.shares / 2;
  const ep = parseFloat(exitPrice);
  const preview = exitPrice && !isNaN(ep)
    ? (trade.direction === "long" ? ep - trade.entry_price : trade.entry_price - ep) * half
    : null;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitPrice || isNaN(ep)) return;
    setLoading(true); setErr("");
    try { await onSubmit(ep, reason); }
    catch (ex: unknown) { setErr(ex instanceof Error ? ex.message : "Failed"); setLoading(false); }
  };

  return (
    <MiniModal title={`Close ½ Position — ${trade.ticker}`} onClose={onClose}>
      <p className="text-xs text-[#F4F7FA]/40 mb-4">
        Closing {half.toFixed(4)} of {trade.shares} shares. The remaining {half.toFixed(4)} shares stay open.
      </p>
      {err && <p className="mb-3 text-xs text-[#ef4444] bg-[#ef4444]/10 rounded-lg px-3 py-2">{err}</p>}
      <form onSubmit={handle} className="space-y-3">
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">Exit Price *</label>
          <input type="number" step="any" min="0" className={inputCls(exitPrice)}
            value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="e.g. 155.00" autoFocus />
        </div>
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">Reason (optional)</label>
          <input className={inputCls(reason)} value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Lock in gains, reduce exposure…" />
        </div>
        {preview != null && (
          <p className={`text-sm font-mono font-bold rounded-lg px-3 py-2 ${preview >= 0 ? "text-[#49B06E] bg-[#49B06E]/10" : "text-[#ef4444] bg-[#ef4444]/10"}`}>
            P&L on half: {preview >= 0 ? "+" : ""}${Math.abs(preview).toFixed(2)}
          </p>
        )}
        <button type="submit" disabled={loading || !exitPrice}
          className="w-full py-3 rounded-xl bg-[#27B7C8] text-[#0E1B30] font-semibold text-sm disabled:opacity-40 hover:bg-[#27B7C8]/90 transition-colors">
          {loading ? "Closing half…" : "Close Half Position"}
        </button>
      </form>
    </MiniModal>
  );
}

// ── Move-stop modal ────────────────────────────────────────────────────────
function MoveStopModal({ trade, onSubmit, onClose }: {
  trade: Trade; onSubmit: (v: number) => Promise<void>; onClose: () => void;
}) {
  const [val, setVal] = useState(trade.stop_price?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(val);
    if (isNaN(n)) return;
    setLoading(true); setErr("");
    try { await onSubmit(n); }
    catch (ex: unknown) { setErr(ex instanceof Error ? ex.message : "Failed"); setLoading(false); }
  };

  return (
    <MiniModal title={`Move Stop — ${trade.ticker}`} onClose={onClose}>
      <p className="text-xs text-[#F4F7FA]/40 mb-4">
        Current stop: {trade.stop_price != null ? `$${trade.stop_price}` : "none"}.
        This is your invalidation level — where your thesis is wrong.
      </p>
      {err && <p className="mb-3 text-xs text-[#ef4444] bg-[#ef4444]/10 rounded-lg px-3 py-2">{err}</p>}
      <form onSubmit={handle} className="space-y-3">
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">New Invalidation Level *</label>
          <input type="number" step="any" min="0" className={inputCls(val)}
            value={val} onChange={e => setVal(e.target.value)} placeholder="e.g. 147.00" autoFocus />
        </div>
        {val && trade.entry_price && !isNaN(parseFloat(val)) && (
          <p className="text-xs text-[#F4F7FA]/40 bg-[#16264A] rounded-lg px-3 py-2">
            Risk per share: ${Math.abs(trade.entry_price - parseFloat(val)).toFixed(2)}
            {" · "}Total risk: ${(Math.abs(trade.entry_price - parseFloat(val)) * trade.shares).toFixed(2)}
          </p>
        )}
        <button type="submit" disabled={loading || !val}
          className="w-full py-3 rounded-xl bg-[#49B06E] text-white font-semibold text-sm disabled:opacity-40 hover:bg-[#49B06E]/90 transition-colors">
          {loading ? "Updating…" : "Move Stop Loss"}
        </button>
      </form>
    </MiniModal>
  );
}

// ── Adjust-target modal ────────────────────────────────────────────────────
function AdjustTargetModal({ trade, onSubmit, onClose }: {
  trade: Trade; onSubmit: (v: number) => Promise<void>; onClose: () => void;
}) {
  const [val, setVal] = useState(trade.target_price?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(val);
    if (isNaN(n)) return;
    setLoading(true); setErr("");
    try { await onSubmit(n); }
    catch (ex: unknown) { setErr(ex instanceof Error ? ex.message : "Failed"); setLoading(false); }
  };

  return (
    <MiniModal title={`Adjust Target — ${trade.ticker}`} onClose={onClose}>
      <p className="text-xs text-[#F4F7FA]/40 mb-4">
        Current target: {trade.target_price != null ? `$${trade.target_price}` : "none"}.
      </p>
      {err && <p className="mb-3 text-xs text-[#ef4444] bg-[#ef4444]/10 rounded-lg px-3 py-2">{err}</p>}
      <form onSubmit={handle} className="space-y-3">
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">New Take-Profit Target *</label>
          <input type="number" step="any" min="0" className={inputCls(val)}
            value={val} onChange={e => setVal(e.target.value)} placeholder="e.g. 170.00" autoFocus />
        </div>
        {val && trade.entry_price && trade.stop_price && !isNaN(parseFloat(val)) && (
          (() => {
            const risk = Math.abs(trade.entry_price - trade.stop_price);
            const reward = Math.abs(parseFloat(val) - trade.entry_price);
            const rr = risk > 0 ? reward / risk : null;
            return rr != null ? (
              <p className={`text-xs rounded-lg px-3 py-2 ${rr >= 1.5 ? "text-[#49B06E] bg-[#49B06E]/10" : rr >= 1 ? "text-yellow-400 bg-yellow-400/10" : "text-[#ef4444] bg-[#ef4444]/10"}`}>
                New R/R: 1 : {rr.toFixed(2)}
              </p>
            ) : null;
          })()
        )}
        <button type="submit" disabled={loading || !val}
          className="w-full py-3 rounded-xl bg-[#49B06E] text-white font-semibold text-sm disabled:opacity-40 hover:bg-[#49B06E]/90 transition-colors">
          {loading ? "Updating…" : "Adjust Target"}
        </button>
      </form>
    </MiniModal>
  );
}

// ── Add-notes modal ────────────────────────────────────────────────────────
function AddNoteModal({ trade, onSubmit, onClose }: {
  trade: Trade; onSubmit: (v: string) => Promise<void>; onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setLoading(true); setErr("");
    try { await onSubmit(note.trim()); }
    catch (ex: unknown) { setErr(ex instanceof Error ? ex.message : "Failed"); setLoading(false); }
  };

  return (
    <MiniModal title={`Add Note — ${trade.ticker}`} onClose={onClose}>
      {trade.thesis && (
        <div className="mb-4 max-h-28 overflow-y-auto rounded-lg bg-[#16264A] border border-[#27B7C8]/10 px-3 py-2 text-xs text-[#F4F7FA]/50 whitespace-pre-wrap">
          {trade.thesis}
        </div>
      )}
      {err && <p className="mb-3 text-xs text-[#ef4444] bg-[#ef4444]/10 rounded-lg px-3 py-2">{err}</p>}
      <form onSubmit={handle} className="space-y-3">
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">New Note</label>
          <textarea className={`${inputCls(note)} resize-none`} rows={4}
            value={note} onChange={e => setNote(e.target.value)}
            placeholder="Price action update, changed bias, why you're holding…" autoFocus />
        </div>
        <button type="submit" disabled={loading || !note.trim()}
          className="w-full py-3 rounded-xl bg-[#16264A] border border-[#27B7C8]/30 text-[#27B7C8] font-semibold text-sm disabled:opacity-40 hover:bg-[#27B7C8]/10 transition-colors">
          {loading ? "Saving…" : "Save Note"}
        </button>
      </form>
    </MiniModal>
  );
}

// ── Action button ──────────────────────────────────────────────────────────
function ActionBtn({ icon, label, onClick, variant = "default" }: {
  icon: React.ReactNode; label: string; onClick: () => void; variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-lg text-[10px] font-semibold transition-colors ${
        variant === "danger"
          ? "bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 border border-[#ef4444]/20"
          : "bg-[#0E1B30] text-[#F4F7FA]/60 hover:text-[#F4F7FA] border border-[#27B7C8]/10 hover:border-[#27B7C8]/30"
      }`}
    >
      <span className="w-4 h-4">{icon}</span>
      {label}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function ActiveTradeCard({
  trade, currentPrice, priceLoading,
  onClose, onCloseHalf, onMoveStop, onAdjustTarget, onAddNote,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [modal, setModal] = useState<"close-half" | "stop" | "target" | "note" | null>(null);

  const hasPrice = currentPrice != null;
  const { pnl, pnlPct } = hasPrice ? livePnL(trade, currentPrice) : { pnl: 0, pnlPct: 0 };
  const isUp = hasPrice ? pnl >= 0 : null;
  const pnlColor = isUp === true ? "text-[#49B06E]" : isUp === false ? "text-[#ef4444]" : "text-[#F4F7FA]/50";
  const rr = hasPrice ? remainingRR(trade, currentPrice) : null;

  // Warn if price is at or past stop
  const stopBreached = hasPrice && trade.stop_price != null && (
    trade.direction === "long" ? currentPrice <= trade.stop_price : currentPrice >= trade.stop_price
  );
  // Notify if price reached target
  const targetHit = hasPrice && trade.target_price != null && (
    trade.direction === "long" ? currentPrice >= trade.target_price : currentPrice <= trade.target_price
  );

  return (
    <>
      <div className={`rounded-xl border overflow-hidden transition-colors ${
        stopBreached ? "border-[#ef4444]/40 bg-[#ef4444]/5" :
        targetHit ? "border-[#49B06E]/40 bg-[#49B06E]/5" :
        "border-[#27B7C8]/20 bg-[#16264A]"
      }`}>

        {/* Stop/target alerts */}
        {stopBreached && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ef4444]/10 border-b border-[#ef4444]/20">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444] flex-shrink-0" />
            <span className="text-xs text-[#ef4444]">Price at or below stop — your invalidation level has been reached</span>
          </div>
        )}
        {targetHit && !stopBreached && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#49B06E]/10 border-b border-[#49B06E]/20">
            <Target className="w-3.5 h-3.5 text-[#49B06E] flex-shrink-0" />
            <span className="text-xs text-[#49B06E]">Target reached — consider taking profit</span>
          </div>
        )}

        {/* Header row — always visible */}
        <div
          className="flex items-center gap-3 p-3 cursor-pointer select-none"
          onClick={() => setExpanded(e => !e)}
        >
          {/* Direction dot */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${trade.direction === "long" ? "bg-[#49B06E]" : "bg-[#ef4444]"}`} />

          {/* Ticker + direction */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono font-bold text-[#F4F7FA] text-sm">{trade.ticker}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${trade.direction === "long" ? "bg-[#49B06E]/15 text-[#49B06E]" : "bg-[#ef4444]/15 text-[#ef4444]"}`}>
              {trade.direction === "long" ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
              {" "}{trade.direction.toUpperCase()}
            </span>
          </div>

          {/* Live price */}
          <div className="flex-1 text-right min-w-0">
            {priceLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-[#27B7C8]/50 animate-spin ml-auto" />
            ) : hasPrice ? (
              <div>
                <span className="font-mono text-sm text-[#F4F7FA]">${currentPrice!.toFixed(2)}</span>
                <span className={`ml-2 font-mono text-xs font-semibold ${pnlColor}`}>
                  {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#F4F7FA]/30">loading price…</span>
            )}
          </div>

          {expanded ? <ChevronUp className="w-4 h-4 text-[#F4F7FA]/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#F4F7FA]/30 flex-shrink-0" />}
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="border-t border-[#27B7C8]/10">

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-px bg-[#27B7C8]/8 border-b border-[#27B7C8]/10">
              {[
                ["Entry", `$${trade.entry_price.toFixed(2)}`],
                ["Stop", trade.stop_price != null ? `$${trade.stop_price.toFixed(2)}` : "—"],
                ["Target", trade.target_price != null ? `$${trade.target_price.toFixed(2)}` : "—"],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#16264A] px-3 py-2 text-center">
                  <p className="text-[9px] text-[#F4F7FA]/35 uppercase tracking-wide">{label}</p>
                  <p className="font-mono text-xs text-[#F4F7FA] mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Live metrics */}
            {hasPrice && (
              <div className="grid grid-cols-3 gap-px bg-[#27B7C8]/8 border-b border-[#27B7C8]/10">
                <div className="bg-[#16264A] px-3 py-2 text-center">
                  <p className="text-[9px] text-[#F4F7FA]/35 uppercase tracking-wide">vs Entry</p>
                  <p className={`font-mono text-xs mt-0.5 ${(currentPrice! - trade.entry_price) >= 0 ? "text-[#49B06E]" : "text-[#ef4444]"}`}>
                    {priceDiff(currentPrice!, trade.entry_price)}
                  </p>
                </div>
                <div className="bg-[#16264A] px-3 py-2 text-center">
                  <p className="text-[9px] text-[#F4F7FA]/35 uppercase tracking-wide">Rem. R/R</p>
                  <p className={`font-mono text-xs mt-0.5 ${rr != null && rr >= 1 ? "text-[#49B06E]" : "text-[#F4F7FA]/50"}`}>
                    {rr != null ? `1:${rr.toFixed(2)}` : "—"}
                  </p>
                </div>
                <div className="bg-[#16264A] px-3 py-2 text-center">
                  <p className="text-[9px] text-[#F4F7FA]/35 uppercase tracking-wide">Held</p>
                  <p className="font-mono text-xs text-[#F4F7FA]/70 mt-0.5">{holdingTime(trade.entry_at)}</p>
                </div>
              </div>
            )}

            {/* Position size detail */}
            <div className="px-3 py-2 border-b border-[#27B7C8]/10 flex items-center justify-between text-xs text-[#F4F7FA]/40">
              <span>{trade.shares} shares · cost ${(trade.entry_price * trade.shares).toFixed(2)}</span>
              {trade.risk_amount != null && <span>risk ${trade.risk_amount.toFixed(2)}</span>}
            </div>

            {/* Thesis */}
            {trade.thesis && (
              <div className="px-3 py-2 border-b border-[#27B7C8]/10">
                <p className="text-[10px] text-[#F4F7FA]/30 uppercase tracking-wide mb-1">Plan / Notes</p>
                <p className="text-xs text-[#F4F7FA]/55 leading-relaxed whitespace-pre-wrap line-clamp-4">{trade.thesis}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="p-3 grid grid-cols-5 gap-1.5">
              <ActionBtn
                icon={<X className="w-4 h-4" />}
                label="Close"
                onClick={() => onClose(trade)}
                variant="danger"
              />
              <ActionBtn
                icon={<SplitSquareVertical className="w-4 h-4" />}
                label="Close ½"
                onClick={() => setModal("close-half")}
              />
              <ActionBtn
                icon={<StopCircle className="w-4 h-4" />}
                label="Move Stop"
                onClick={() => setModal("stop")}
              />
              <ActionBtn
                icon={<Target className="w-4 h-4" />}
                label="Adj. Target"
                onClick={() => setModal("target")}
              />
              <ActionBtn
                icon={<StickyNote className="w-4 h-4" />}
                label="Add Note"
                onClick={() => setModal("note")}
              />
            </div>

          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "close-half" && (
        <CloseHalfModal
          trade={trade}
          onSubmit={async (ep, r) => { await onCloseHalf(trade, ep, r); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "stop" && (
        <MoveStopModal
          trade={trade}
          onSubmit={async (v) => { await onMoveStop(trade, v); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "target" && (
        <AdjustTargetModal
          trade={trade}
          onSubmit={async (v) => { await onAdjustTarget(trade, v); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "note" && (
        <AddNoteModal
          trade={trade}
          onSubmit={async (v) => { await onAddNote(trade, v); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
