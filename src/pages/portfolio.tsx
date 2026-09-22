import { useState, useEffect, useCallback } from "react";
import type { GetServerSideProps } from "next";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notificationService";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Search, Bell, BellOff, Trash2, TrendingUp, TrendingDown,
  Loader2, Eye,
} from "lucide-react";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const result = await requireProUserSSR(req as Parameters<typeof requireProUserSSR>[0]);
  if (result.status === "not-pro") return { props: {} };
  if (result.status === "unauthenticated") return { redirect: { destination: "/auth", permanent: false } };
  return { props: {} };
};

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface WatchlistItem {
  id: string;
  ticker: string;
  asset_type: string;
  added_at: string | null;
}

interface PriceAlert {
  id: string;
  ticker: string;
  alert_type: string;
  threshold: number;
  enabled: boolean | null;
  last_triggered_at: string | null;
}

interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  previousClose: number;
}

// ── Add ticker modal ──────────────────────────────────────────────────────
function AddTickerModal({ open, onClose, onAdd }: {
  open: boolean;
  onClose: () => void;
  onAdd: (ticker: string) => void;
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    const t = query.trim().toUpperCase();
    if (t && /^[A-Z]{1,6}$/.test(t)) {
      onAdd(t);
      setQuery("");
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl overflow-hidden"
        style={{ background: "#0E1520", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#F3EDE3]">Add to Watchlist</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5">
              <X className="w-4 h-4 text-[#F3EDE3]/40" />
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F3EDE3]/30" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="Ticker (e.g. AAPL)"
                maxLength={6}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F3EDE3] placeholder:text-[#F3EDE3]/25 outline-none focus:border-[#27B7C8]/40"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="px-4 rounded-xl text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #27B7C8, #2CDBA8)", color: "#07080C" }}
            >
              Add
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Add alert modal ───────────────────────────────────────────────────────
function AddAlertModal({ open, ticker, onClose, onAdd }: {
  open: boolean;
  ticker: string;
  onClose: () => void;
  onAdd: (type: "target_price", threshold: number) => void;
}) {
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [price, setPrice] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    const p = parseFloat(price);
    if (!isNaN(p) && p > 0) {
      onAdd("target_price", direction === "below" ? -p : p);
      setPrice("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl overflow-hidden"
        style={{ background: "#0E1520", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#F3EDE3]">Price Alert — {ticker}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5">
              <X className="w-4 h-4 text-[#F3EDE3]/40" />
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            {(["above", "below"] as const).map(d => (
              <button
                key={d}
                onClick={() => { haptic(); setDirection(d); }}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: direction === d ? (d === "above" ? "rgba(73,176,110,0.15)" : "rgba(239,68,68,0.15)") : "rgba(255,255,255,0.04)",
                  color: direction === d ? (d === "above" ? "#49B06E" : "#EF4444") : "rgba(243,237,227,0.4)",
                  border: `1px solid ${direction === d ? (d === "above" ? "rgba(73,176,110,0.3)" : "rgba(239,68,68,0.3)") : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {d === "above" ? "↑ Above" : "↓ Below"}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#F3EDE3]/30">$</span>
              <input
                autoFocus
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F3EDE3] placeholder:text-[#F3EDE3]/25 outline-none focus:border-[#27B7C8]/40"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="px-4 rounded-xl text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #27B7C8, #2CDBA8)", color: "#07080C" }}
            >
              Set
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Watchlist row ─────────────────────────────────────────────────────────
function WatchlistRow({ item, quote, alerts, onRemove, onOpenAlert, onDeleteAlert, onToggleAlert }: {
  item: WatchlistItem;
  quote?: QuoteData;
  alerts: PriceAlert[];
  onRemove: () => void;
  onOpenAlert: () => void;
  onDeleteAlert: (id: string) => void;
  onToggleAlert: (id: string, enabled: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const up = (quote?.change ?? 0) >= 0;
  const tickerAlerts = alerts.filter(a => a.ticker === item.ticker);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={() => { haptic(); setExpanded(!expanded); }}
      >
        {/* Ticker + Change indicator */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/stock/${item.ticker}`}
              onClick={e => e.stopPropagation()}
              className="text-sm font-bold text-[#F3EDE3] hover:text-[#27B7C8] transition-colors"
            >
              {item.ticker}
            </Link>
            {tickerAlerts.length > 0 && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#27B7C8]/10 text-[#27B7C8]">
                <Bell className="w-2.5 h-2.5" /> {tickerAlerts.length}
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#F3EDE3]/30 mt-0.5">{item.asset_type}</p>
        </div>

        {/* Price */}
        <div className="text-right">
          {quote ? (
            <>
              <p className="text-sm font-bold font-mono text-[#F3EDE3]">
                ${quote.price.toFixed(2)}
              </p>
              <p className={`text-[10px] font-bold font-mono flex items-center justify-end gap-0.5 ${up ? "text-[#49B06E]" : "text-[#EF4444]"}`}>
                {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {up ? "+" : ""}{quote.changesPercentage.toFixed(2)}%
              </p>
            </>
          ) : (
            <Loader2 className="w-4 h-4 text-[#F3EDE3]/20 animate-spin ml-auto" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              {/* Quick stats */}
              {quote && (
                <div className="grid grid-cols-4 gap-1.5 pt-2">
                  {[
                    { label: "Open", value: `$${quote.open.toFixed(2)}` },
                    { label: "High", value: `$${quote.dayHigh.toFixed(2)}` },
                    { label: "Low", value: `$${quote.dayLow.toFixed(2)}` },
                    { label: "Prev Close", value: `$${quote.previousClose.toFixed(2)}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-[7px] text-[#F3EDE3]/25 uppercase tracking-wider">{label}</p>
                      <p className="text-[10px] font-mono text-[#F3EDE3]/60">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Active alerts */}
              {tickerAlerts.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[8px] text-[#F3EDE3]/25 uppercase tracking-wider">Alerts</p>
                  {tickerAlerts.map(a => {
                    const isAbove = a.threshold > 0;
                    const absThresh = Math.abs(a.threshold);
                    return (
                      <div key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02]">
                        <span className={`text-[10px] font-bold ${isAbove ? "text-[#49B06E]" : "text-[#EF4444]"}`}>
                          {isAbove ? "↑" : "↓"} ${absThresh.toFixed(2)}
                        </span>
                        <span className="flex-1 text-[9px] text-[#F3EDE3]/30">
                          {isAbove ? "Above" : "Below"} target
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); haptic(); onToggleAlert(a.id, !a.enabled); }}
                          className="p-1 rounded hover:bg-white/5"
                        >
                          {a.enabled ? (
                            <Bell className="w-3 h-3 text-[#27B7C8]" />
                          ) : (
                            <BellOff className="w-3 h-3 text-[#F3EDE3]/20" />
                          )}
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); haptic(); onDeleteAlert(a.id); }}
                          className="p-1 rounded hover:bg-white/5"
                        >
                          <Trash2 className="w-3 h-3 text-[#EF4444]/50" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action row */}
              <div className="flex gap-2 pt-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={e => { e.stopPropagation(); haptic(); onOpenAlert(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold text-[#27B7C8] bg-[#27B7C8]/8 border border-[#27B7C8]/15"
                >
                  <Bell className="w-3 h-3" /> Set Alert
                </motion.button>
                <Link href={`/stock/${item.ticker}`} onClick={e => e.stopPropagation()} className="flex-1">
                  <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold text-[#F3EDE3]/50 bg-white/[0.04] border border-white/[0.06]">
                    <Eye className="w-3 h-3" /> View Chart
                  </div>
                </Link>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={e => { e.stopPropagation(); haptic(); onRemove(); }}
                  className="px-3 py-2 rounded-xl text-[10px] font-bold text-[#EF4444]/60 bg-[#EF4444]/5 border border-[#EF4444]/10"
                >
                  <Trash2 className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function WatchlistPage() {
  const { userId } = useSubscription();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [alertModal, setAlertModal] = useState<{ open: boolean; ticker: string }>({ open: false, ticker: "" });

  // Fetch watchlist + alerts
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const [wl, pa] = await Promise.all([
      supabase.from("watchlist").select("*").eq("user_id", userId).order("added_at", { ascending: false }),
      notificationService.getPriceAlerts(userId),
    ]);

    setItems(wl.data ?? []);
    setAlerts(pa);
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Fetch live quotes when items change
  useEffect(() => {
    if (items.length === 0) return;
    const tickers = items.map(i => i.ticker).join(",");
    let cancelled = false;

    const fetchQuotes = async () => {
      try {
        const res = await fetch(`/api/stock-data?tickers=${tickers}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const map: Record<string, QuoteData> = {};
        for (const q of data) map[q.symbol] = q;
        setQuotes(map);
      } catch {}
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [items]);

  // Add ticker to watchlist
  const addTicker = async (ticker: string) => {
    if (!userId) return;
    if (items.some(i => i.ticker === ticker)) return;

    const { data, error } = await supabase.from("watchlist").insert({
      user_id: userId,
      ticker,
      asset_type: "stock",
    }).select().single();

    if (!error && data) {
      setItems(prev => [data, ...prev]);
      haptic(15);
    }
  };

  // Remove from watchlist
  const removeTicker = async (id: string) => {
    await supabase.from("watchlist").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Add price alert
  const addAlert = async (ticker: string, type: "target_price", threshold: number) => {
    if (!userId) return;
    const result = await notificationService.createPriceAlert(userId, ticker, type, threshold);
    if (result) {
      setAlerts(prev => [result, ...prev]);
      haptic(15);
    }
  };

  // Delete alert
  const deleteAlert = async (id: string) => {
    await notificationService.deleteAlert(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Toggle alert
  const toggleAlert = async (id: string, enabled: boolean) => {
    await notificationService.toggleAlert(id, enabled);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled } : a));
  };

  const activeAlertCount = alerts.filter(a => a.enabled).length;

  return (
    <Layout>
      <SEO title="Watchlist | Radar" description="Track stocks and set price alerts." />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#F3EDE3]">Watchlist</h1>
            <p className="text-[10px] text-[#F3EDE3]/30 mt-0.5">
              {items.length} stock{items.length !== 1 ? "s" : ""} · {activeAlertCount} alert{activeAlertCount !== 1 ? "s" : ""} active
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { haptic(); setAddOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #27B7C8, #2CDBA8)", color: "#07080C" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </motion.button>
        </div>

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(39,183,200,0.08)" }}>
              <Eye className="w-7 h-7 text-[#27B7C8]/40" />
            </div>
            <p className="text-sm font-semibold text-[#F3EDE3]/50 mb-1">No stocks yet</p>
            <p className="text-xs text-[#F3EDE3]/25 mb-4">Add tickers to track prices and set alerts.</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { haptic(); setAddOpen(true); }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #27B7C8, #2CDBA8)", color: "#07080C" }}
            >
              Add Your First Stock
            </motion.button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#27B7C8] animate-spin" />
          </div>
        )}

        {/* Watchlist items */}
        {!loading && items.length > 0 && (
          <div className="space-y-1.5">
            {items.map(item => (
              <WatchlistRow
                key={item.id}
                item={item}
                quote={quotes[item.ticker]}
                alerts={alerts}
                onRemove={() => removeTicker(item.id)}
                onOpenAlert={() => setAlertModal({ open: true, ticker: item.ticker })}
                onDeleteAlert={deleteAlert}
                onToggleAlert={toggleAlert}
              />
            ))}
          </div>
        )}

        {/* Disclaimer */}
        {items.length > 0 && (
          <p className="text-[9px] text-[#F3EDE3]/15 text-center mt-6 leading-relaxed max-w-xs mx-auto">
            Prices refresh every 60 seconds during market hours. Alerts are price-level notifications, not trade recommendations.
          </p>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {addOpen && <AddTickerModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addTicker} />}
      </AnimatePresence>
      <AnimatePresence>
        {alertModal.open && (
          <AddAlertModal
            open={alertModal.open}
            ticker={alertModal.ticker}
            onClose={() => setAlertModal({ open: false, ticker: "" })}
            onAdd={(type, threshold) => addAlert(alertModal.ticker, type, threshold)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
