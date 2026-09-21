import { useState, useEffect, useCallback } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import {
  NotebookPen, Search, Filter, ChevronDown, ChevronUp,
  AlertTriangle, Loader2, X, Check, TrendingUp, TrendingDown, Lock,
  Target, ShieldCheck, Clock, Brain, Heart, Scale, Award,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { canShowExternalPayment } from "@/lib/payments";

// ── Types ──────────────────────────────────────────────────────────────────
interface JournalEntry {
  id: string;
  trade_id: string | null;
  ticker: string;
  direction: string | null;
  entry_price: number | null;
  exit_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  shares: number | null;
  pnl: number | null;
  pnl_pct: number | null;
  risk_amount: number | null;
  duration_minutes: number | null;
  thesis: string | null;
  exit_reason: string | null;
  closed_at: string | null;
  score_pl: number | null;
  score_rr: number | null;
  score_entry: number | null;
  score_exit: number | null;
  score_discipline: number | null;
  overall_grade: string | null;
  what_went_well: string | null;
  what_to_improve: string | null;
  followed_plan: string | null;
  remember_next: string | null;
  chart_pattern: string | null;
  candlestick_confirmation: string | null;
  indicator_used: string | null;
  market_trend: string | null;
  emotion_before: string | null;
  emotion_during: string | null;
  emotion_after: string | null;
  related_lesson: string | null;
  what_i_learned: string | null;
  personal_notes: string | null;
  created_at: string;
}

interface PageProps { requiresClientAuth?: boolean }

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

// ── Helpers ────────────────────────────────────────────────────────────────
async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = await getToken();
  return fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
  });
}

function fmt(n: number | null, prefix = "$") {
  if (n == null) return "—";
  return `${prefix}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDuration(minutes: number | null) {
  if (minutes == null) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function gradeColor(g: string | null) {
  if (!g) return { text: "text-[#F3EDE3]/30", bg: "rgba(39,183,200,0.08)", border: "rgba(39,183,200,0.15)" };
  if (g === "A") return { text: "text-[#49B06E]", bg: "rgba(73,176,110,0.1)", border: "rgba(73,176,110,0.3)" };
  if (g === "B") return { text: "text-[#27B7C8]", bg: "rgba(39,183,200,0.1)", border: "rgba(39,183,200,0.3)" };
  if (g === "C") return { text: "text-yellow-400", bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)" };
  if (g === "D") return { text: "text-orange-400", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)" };
  return { text: "text-[#ef4444]", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" };
}

const EMOTIONS = ["😤 Frustrated", "😰 Anxious", "😐 Neutral", "🧘 Calm", "🔥 Confident", "🤑 Greedy", "😱 Fearful"];

function ScoreRing({ label, score, icon: Icon }: { label: string; score: number | null; icon: typeof Target }) {
  if (score == null) return null;
  const color = score >= 80 ? "#49B06E" : score >= 55 ? "#FACC15" : "#EF4444";
  const pct = Math.min(100, score);
  const dash = 2 * Math.PI * 18;
  const offset = dash - (pct / 100) * dash;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle cx="20" cy="20" r="18" fill="none" stroke={color} strokeWidth="3" strokeDasharray={dash} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <span className="text-[9px] text-[#F3EDE3]/40 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

// ── Editable field ─────────────────────────────────────────────────────────
function EditableField({ label, value, placeholder, onSave, multiline }: {
  label: string; value: string | null; placeholder?: string; onSave: (v: string) => Promise<void>; multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try { await onSave(val); setEditing(false); }
    finally { setSaving(false); }
  };

  if (editing) {
    return (
      <div>
        <label className="text-[9px] text-[#F3EDE3]/30 uppercase tracking-wide block mb-1">{label}</label>
        <div className="flex gap-1.5">
          {multiline ? (
            <textarea
              className="flex-1 text-xs bg-[#07080C] border border-[#27B7C8]/30 rounded-lg px-3 py-2 text-[#F3EDE3] resize-none focus:outline-none focus:border-[#27B7C8]"
              rows={3}
              value={val}
              onChange={e => setVal(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          ) : (
            <input
              className="flex-1 text-xs bg-[#07080C] border border-[#27B7C8]/30 rounded-lg px-3 py-2 text-[#F3EDE3] focus:outline-none focus:border-[#27B7C8]"
              value={val}
              onChange={e => setVal(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          )}
          <div className="flex flex-col gap-1">
            <button onClick={save} disabled={saving}
              className="p-1.5 rounded-lg bg-[#49B06E]/20 text-[#49B06E] hover:bg-[#49B06E]/30 disabled:opacity-40">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setVal(value ?? ""); setEditing(false); }}
              className="p-1.5 rounded-lg bg-[#ef4444]/10 text-[#ef4444]/70 hover:bg-[#ef4444]/20">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => { haptic(); setEditing(true); }} className="text-left w-full group">
      <p className="text-[9px] text-[#F3EDE3]/30 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-xs leading-relaxed rounded-lg px-2 py-1.5 transition-colors ${value ? "text-[#F3EDE3]/65 bg-transparent" : "text-[#F3EDE3]/20 italic bg-white/[0.02]"} group-hover:bg-[#27B7C8]/5`}>
        {value || placeholder || `Tap to add…`}
      </p>
    </button>
  );
}

// ── Emotion Picker ─────────────────────────────────────────────────────────
function EmotionField({ label, value, onSave }: { label: string; value: string | null; onSave: (v: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="text-[9px] text-[#F3EDE3]/30 uppercase tracking-wide mb-1">{label}</p>
      <button
        onClick={() => { haptic(); setOpen(o => !o); }}
        className="w-full text-left text-xs rounded-lg px-2.5 py-2 transition-colors"
        style={{ background: value ? "rgba(39,183,200,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {value || "Tap to pick…"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1 mt-1.5">
              {EMOTIONS.map(em => (
                <button
                  key={em}
                  onClick={async () => { haptic(); await onSave(em); setOpen(false); }}
                  className="text-[10px] px-2 py-1 rounded-full transition-all"
                  style={{
                    background: value === em ? "rgba(39,183,200,0.2)" : "rgba(255,255,255,0.04)",
                    color: value === em ? "#27B7C8" : "rgba(243,237,227,0.5)",
                    border: value === em ? "1px solid rgba(39,183,200,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Journal Entry Card ─────────────────────────────────────────────────────
function EntryCard({ entry, onUpdate }: { entry: JournalEntry; onUpdate: (updated: JournalEntry) => void }) {
  const [expanded, setExpanded] = useState(false);
  const win = (entry.pnl ?? 0) >= 0;
  const gc = gradeColor(entry.overall_grade);

  const saveField = async (field: string, value: string) => {
    const res = await apiFetch("/api/practice/journal", {
      method: "PATCH",
      body: JSON.stringify({ id: entry.id, [field]: value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Save failed");
    onUpdate(data.entry as JournalEntry);
  };

  const closedDate = entry.closed_at
    ? new Date(entry.closed_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : new Date(entry.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const followedRules = entry.followed_plan;
  const rulesBadge = followedRules === "Yes" || followedRules?.toLowerCase().includes("yes")
    ? { label: "Followed rules", color: "#49B06E", icon: "✓" }
    : followedRules === "No" || followedRules?.toLowerCase().includes("no")
    ? { label: "Broke rules", color: "#EF4444", icon: "✗" }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{ background: "#121821", borderColor: gc.border }}
    >
      {/* Collapsed header */}
      <button
        onClick={() => { haptic(); setExpanded(e => !e); }}
        className="w-full flex items-center gap-3 p-4 text-left active:bg-white/[0.02] transition-colors"
      >
        {/* Grade circle */}
        <div
          className={`text-lg font-bold font-mono w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${gc.text}`}
          style={{ background: gc.bg, border: `1px solid ${gc.border}` }}
        >
          {entry.overall_grade ?? "—"}
        </div>

        {/* Ticker + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-[#F3EDE3] text-base">{entry.ticker}</span>
            {entry.direction && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 ${entry.direction === "long" ? "bg-[#49B06E]/15 text-[#49B06E]" : "bg-[#ef4444]/15 text-[#ef4444]"}`}>
                {entry.direction === "long" ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {entry.direction.toUpperCase()}
              </span>
            )}
            {rulesBadge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${rulesBadge.color}15`, color: rulesBadge.color }}>
                {rulesBadge.icon} {rulesBadge.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#F3EDE3]/35">
            <span>{closedDate}</span>
            <span>&middot;</span>
            <span>{fmtDuration(entry.duration_minutes)}</span>
          </div>
        </div>

        {/* P/L */}
        <div className="text-right flex items-center gap-2">
          <span className={`font-mono text-sm font-bold ${win ? "text-[#49B06E]" : "text-[#ef4444]"}`}>
            {win ? "+" : "-"}{fmt(entry.pnl)}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-[#F3EDE3]/20" /> : <ChevronDown className="w-4 h-4 text-[#F3EDE3]/20" />}
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-4">

              {/* ── Trade Numbers ── */}
              <div className="grid grid-cols-4 gap-px rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                {[
                  { label: "Entry", value: fmt(entry.entry_price), color: "#49B06E" },
                  { label: "Exit", value: fmt(entry.exit_price), color: "#27B7C8" },
                  { label: "Stop", value: fmt(entry.stop_price), color: "#EF4444" },
                  { label: "Target", value: fmt(entry.target_price), color: "#F59E0B" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#0C1016] p-2.5 text-center">
                    <p className="text-[8px] font-bold uppercase tracking-wider mb-0.5" style={{ color }}>{label}</p>
                    <p className="font-mono text-xs text-[#F3EDE3]/80">{value}</p>
                  </div>
                ))}
              </div>

              {/* ── Score rings ── */}
              {entry.score_discipline != null && (
                <div className="flex justify-around py-2">
                  <ScoreRing label="P/L" score={entry.score_pl} icon={TrendingUp} />
                  <ScoreRing label="R:R" score={entry.score_rr} icon={Scale} />
                  <ScoreRing label="Entry" score={entry.score_entry} icon={Target} />
                  <ScoreRing label="Exit" score={entry.score_exit} icon={ShieldCheck} />
                  <ScoreRing label="Disc." score={entry.score_discipline} icon={Award} />
                </div>
              )}

              {/* ── Pansy Assessment ── */}
              {entry.what_went_well && (
                <div className="space-y-2">
                  <p className="text-[10px] text-[#F3EDE3]/30 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <span>🌺</span> Pansy&apos;s assessment
                  </p>
                  {[
                    { label: "What went well", text: entry.what_went_well, color: "#49B06E" },
                    { label: "What to improve", text: entry.what_to_improve, color: "#EF4444" },
                    { label: "Did you follow your plan?", text: entry.followed_plan, color: "#27B7C8" },
                    { label: "Remember next time", text: entry.remember_next, color: "#F59E0B" },
                  ].map(({ label, text, color }) => text && (
                    <div key={label} className="rounded-xl px-3 py-2.5" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                      <p className="text-[9px] uppercase tracking-wide font-bold mb-1" style={{ color }}>{label}</p>
                      <p className="text-xs text-[#F3EDE3]/60 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Your Reflection ── */}
              <div className="space-y-3">
                <p className="text-[10px] text-[#F3EDE3]/30 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" /> Your reflection
                </p>

                <EditableField
                  label="Why I took this trade"
                  value={entry.thesis}
                  placeholder="What was the setup? What convinced you to enter?"
                  onSave={v => saveField("thesis", v)}
                  multiline
                />

                <EditableField
                  label="Why I exited"
                  value={entry.exit_reason}
                  placeholder="Target hit, stopped out, changed mind?"
                  onSave={v => saveField("exit_reason", v)}
                />

                <EditableField
                  label="What I learned"
                  value={entry.what_i_learned}
                  placeholder="Key takeaway from this trade"
                  onSave={v => saveField("what_i_learned", v)}
                  multiline
                />
              </div>

              {/* ── How I Felt ── */}
              <div className="space-y-3">
                <p className="text-[10px] text-[#F3EDE3]/30 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> How I felt
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <EmotionField label="Before" value={entry.emotion_before} onSave={v => saveField("emotion_before", v)} />
                  <EmotionField label="During" value={entry.emotion_during} onSave={v => saveField("emotion_during", v)} />
                  <EmotionField label="After" value={entry.emotion_after} onSave={v => saveField("emotion_after", v)} />
                </div>
              </div>

              {/* ── Strategy Notes ── */}
              <div className="space-y-3">
                <p className="text-[10px] text-[#F3EDE3]/30 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Strategy &amp; setup
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <EditableField label="Chart Pattern" value={entry.chart_pattern} placeholder="e.g. Bull flag" onSave={v => saveField("chart_pattern", v)} />
                  <EditableField label="Indicator" value={entry.indicator_used} placeholder="e.g. VWAP, 9 EMA" onSave={v => saveField("indicator_used", v)} />
                  <EditableField label="Market Trend" value={entry.market_trend} placeholder="Bullish / Bearish / Choppy" onSave={v => saveField("market_trend", v)} />
                  <EditableField label="Candlestick" value={entry.candlestick_confirmation} placeholder="e.g. Hammer" onSave={v => saveField("candlestick_confirmation", v)} />
                </div>
              </div>

              {/* ── Personal Notes ── */}
              <EditableField
                label="Personal notes"
                value={entry.personal_notes}
                placeholder="Anything else you want to remember about this trade"
                onSave={v => saveField("personal_notes", v)}
                multiline
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Pro gate ───────────────────────────────────────────────────────────────
function ProGate() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Lock className="w-10 h-10 text-[#27B7C8]/40 mb-4" />
      <h2 className="font-serif text-xl font-bold text-[#F3EDE3] mb-2">Pro Feature</h2>
      {canShowExternalPayment ? (
        <>
          <p className="text-sm text-[#F3EDE3]/50 mb-6 max-w-xs">
            The Trade Journal is available to Pro subscribers. Upgrade to track your process and build better habits.
          </p>
          <Link href="/subscription-offer"
            className="px-6 py-3 rounded-xl bg-[#27B7C8] text-[#07080C] font-semibold text-sm hover:bg-[#27B7C8]/90 transition-colors">
            Upgrade to Pro
          </Link>
        </>
      ) : (
        <p className="text-sm text-[#F3EDE3]/50 max-w-xs">
          This feature isn&apos;t available in this version.
        </p>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function JournalPage(_props: PageProps) {
  const { isPro, isLoading: authLoading } = useSubscription();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ticker, setTicker] = useState("");
  const [grade, setGrade] = useState("all");
  const [direction, setDirection] = useState("all");
  const [range, setRange] = useState("all");

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (ticker.trim()) params.set("ticker", ticker.trim());
      if (grade !== "all") params.set("grade", grade);
      if (direction !== "all") params.set("direction", direction);
      if (range !== "all") params.set("range", range);

      const res = await apiFetch(`/api/practice/journal?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load journal");
      setEntries(data.entries ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading journal");
    } finally {
      setLoading(false);
    }
  }, [ticker, grade, direction, range]);

  useEffect(() => {
    if (!authLoading && isPro) loadEntries();
    else if (!authLoading && !isPro) setLoading(false);
  }, [authLoading, isPro, loadEntries]);

  const updateEntry = (updated: JournalEntry) => {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const showProGate = !authLoading && !isPro;

  // Stats
  const totalTrades = entries.length;
  const wins = entries.filter(e => (e.pnl ?? 0) > 0).length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  const totalPnl = entries.reduce((sum, e) => sum + (e.pnl ?? 0), 0);
  const followedCount = entries.filter(e => e.followed_plan?.toLowerCase().includes("yes")).length;

  return (
    <>
      <Head>
        <title>Trade Journal — Bloom Radar</title>
      </Head>
      <Layout>
        <div className="min-h-screen bg-[#07080C] px-4 py-4 max-w-lg mx-auto pb-32">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-[#27B7C8]" />
                <h1 className="text-2xl font-bold text-[#F3EDE3]">Trade Journal</h1>
              </div>
              <p className="text-xs text-[#F3EDE3]/40 mt-0.5">Track, reflect, improve</p>
            </div>
            <Link href="/practice" className="text-xs text-[#27B7C8] px-3 py-1.5 rounded-lg" style={{ background: "rgba(39,183,200,0.1)", border: "1px solid rgba(39,183,200,0.2)" }}>
              Practice Trader
            </Link>
          </div>

          <div className="rounded-lg px-3 py-2 mb-4 flex items-start gap-2" style={{ background: "rgba(39,183,200,0.06)", border: "1px solid rgba(39,183,200,0.12)" }}>
            <AlertTriangle className="w-3.5 h-3.5 text-[#27B7C8] flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#27B7C8]/80 leading-relaxed">
              <strong>Educational simulator.</strong> All trades are virtual. Not financial advice.
            </p>
          </div>

          {(authLoading || (loading && isPro)) && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-5 h-5 text-[#27B7C8] animate-spin" />
              <span className="text-sm text-[#F3EDE3]/50">Loading journal…</span>
            </div>
          )}

          {showProGate && <ProGate />}

          {!loading && !authLoading && isPro && error && (
            <div className="rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 px-4 py-3 text-sm text-[#ef4444] mb-4">
              {error} <button onClick={loadEntries} className="underline ml-2">Retry</button>
            </div>
          )}

          {!authLoading && !loading && isPro && !error && (
            <>
              {/* Quick stats */}
              {totalTrades > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: "Trades", value: totalTrades, color: "#27B7C8" },
                    { label: "Win rate", value: `${winRate}%`, color: winRate >= 50 ? "#49B06E" : "#EF4444" },
                    { label: "P/L", value: `${totalPnl >= 0 ? "+" : ""}${fmt(totalPnl)}`, color: totalPnl >= 0 ? "#49B06E" : "#EF4444" },
                    { label: "Followed", value: `${followedCount}/${totalTrades}`, color: followedCount >= totalTrades * 0.7 ? "#49B06E" : "#F59E0B" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color }}>{label}</p>
                      <p className="text-sm font-bold text-[#F3EDE3]">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Filters */}
              <div className="rounded-xl p-3 mb-4 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3 text-[#F3EDE3]/30" />
                  <span className="text-[9px] text-[#F3EDE3]/30 uppercase tracking-wide">Filter</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F3EDE3]/25" />
                  <input
                    className="w-full bg-[#07080C] border border-white/8 rounded-lg pl-8 pr-3 py-2 text-xs text-[#F3EDE3] placeholder-[#F3EDE3]/20 focus:outline-none focus:border-[#27B7C8]/50"
                    placeholder="Search by ticker…"
                    value={ticker}
                    onChange={e => setTicker(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Grade", value: grade, onChange: setGrade, opts: [["all", "All"], ["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["F", "F"]] },
                    { label: "Direction", value: direction, onChange: setDirection, opts: [["all", "All"], ["long", "Long"], ["short", "Short"]] },
                    { label: "Period", value: range, onChange: setRange, opts: [["all", "All time"], ["week", "This week"], ["month", "This month"]] },
                  ].map(({ label, value, onChange, opts }) => (
                    <div key={label}>
                      <label className="text-[8px] text-[#F3EDE3]/25 uppercase tracking-wide block mb-0.5">{label}</label>
                      <select
                        className="w-full bg-[#07080C] border border-white/8 rounded-lg px-2 py-1.5 text-[10px] text-[#F3EDE3] focus:outline-none focus:border-[#27B7C8]/50"
                        value={value} onChange={e => onChange(e.target.value)}
                      >
                        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  {ticker || grade !== "all" || direction !== "all" || range !== "all" ? (
                    <>
                      <Search className="w-10 h-10 text-[#F3EDE3]/15 mb-4" />
                      <p className="text-sm text-[#F3EDE3]/40">No entries match your filters.</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-[#27B7C8]/10 flex items-center justify-center mb-4">
                        <NotebookPen className="w-6 h-6 text-[#27B7C8]/60" />
                      </div>
                      <p className="text-sm font-medium text-[#F3EDE3]/50 mb-1">No journal entries yet</p>
                      <p className="text-xs text-[#F3EDE3]/30 max-w-[280px] mb-5">
                        Close a practice trade and Pansy will generate your first review automatically.
                      </p>
                      <Link href="/practice"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#27B7C8]/15 text-[#27B7C8] border border-[#27B7C8]/25 hover:bg-[#27B7C8]/25 transition-colors">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Go to Practice Trader
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map(e => (
                    <EntryCard key={e.id} entry={e} onUpdate={updateEntry} />
                  ))}
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-[10px] text-[#F3EDE3]/25 leading-relaxed max-w-sm mx-auto">
                  Bloom Trade Journal is an educational tool. Simulated trades only. Not financial advice.
                </p>
              </div>
            </>
          )}
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const result = await requireProUserSSR(req as Parameters<typeof requireProUserSSR>[0]);
  if (result.status === "not-pro") return { props: {} };
  if (result.status === "unauthenticated") return { redirect: { destination: "/auth", permanent: false } };
  return { props: { requiresClientAuth: result.status === "no-cookie" } };
};
