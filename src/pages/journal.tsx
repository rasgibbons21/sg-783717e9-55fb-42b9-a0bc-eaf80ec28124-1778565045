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
} from "lucide-react";
import Link from "next/link";
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

function gradeStyle(g: string | null) {
  if (!g) return "text-[#F4F7FA]/30 bg-[#16264A] border-[#27B7C8]/10";
  if (g === "A") return "text-[#49B06E] bg-[#49B06E]/10 border-[#49B06E]/30";
  if (g === "B") return "text-[#27B7C8] bg-[#27B7C8]/10 border-[#27B7C8]/30";
  if (g === "C") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  if (g === "D") return "text-orange-400 bg-orange-400/10 border-orange-400/30";
  return "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30";
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  if (score == null) return null;
  const color = score >= 80 ? "bg-[#49B06E]" : score >= 55 ? "bg-yellow-400" : "bg-[#ef4444]";
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-[9px] text-[#F4F7FA]/40 uppercase tracking-wide">{label}</span>
        <span className="text-[9px] font-mono text-[#F4F7FA]/50">{score}</span>
      </div>
      <div className="h-1 rounded-full bg-[#0E1B30] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ── Editable field ─────────────────────────────────────────────────────────
function EditableField({ label, value, onSave }: {
  label: string; value: string | null; onSave: (v: string) => Promise<void>;
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
        <label className="text-[9px] text-[#F4F7FA]/30 uppercase tracking-wide block mb-0.5">{label}</label>
        <div className="flex gap-1">
          <textarea
            className="flex-1 text-xs bg-[#0E1B30] border border-[#27B7C8]/30 rounded-lg px-2 py-1.5 text-[#F4F7FA] resize-none focus:outline-none focus:border-[#27B7C8]"
            rows={2}
            value={val}
            onChange={e => setVal(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col gap-1">
            <button onClick={save} disabled={saving}
              className="p-1.5 rounded-lg bg-[#49B06E]/20 text-[#49B06E] hover:bg-[#49B06E]/30 disabled:opacity-40">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => { setVal(value ?? ""); setEditing(false); }}
              className="p-1.5 rounded-lg bg-[#ef4444]/10 text-[#ef4444]/70 hover:bg-[#ef4444]/20">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="text-left w-full group">
      <p className="text-[9px] text-[#F4F7FA]/30 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-xs leading-relaxed ${value ? "text-[#F4F7FA]/65" : "text-[#F4F7FA]/20 italic"} group-hover:text-[#27B7C8]/70 transition-colors`}>
        {value || `Add ${label.toLowerCase()}…`}
      </p>
    </button>
  );
}

// ── Journal Entry Card ─────────────────────────────────────────────────────
function EntryCard({ entry, onUpdate }: { entry: JournalEntry; onUpdate: (updated: JournalEntry) => void }) {
  const [expanded, setExpanded] = useState(false);
  const win = (entry.pnl ?? 0) >= 0;

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
    ? new Date(entry.closed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="rounded-xl border border-[#27B7C8]/15 bg-[#16264A] overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#27B7C8]/5 transition-colors"
      >
        {/* Grade */}
        <span className={`text-sm font-bold font-mono w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${gradeStyle(entry.overall_grade)}`}>
          {entry.overall_grade ?? "—"}
        </span>

        {/* Ticker + direction */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#F4F7FA] text-sm">{entry.ticker}</span>
            {entry.direction && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 ${entry.direction === "long" ? "bg-[#49B06E]/15 text-[#49B06E]" : "bg-[#ef4444]/15 text-[#ef4444]"}`}>
                {entry.direction === "long" ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {entry.direction.toUpperCase()}
              </span>
            )}
            <span className="text-[10px] text-[#F4F7FA]/30">{closedDate}</span>
          </div>
          <p className="text-[10px] text-[#F4F7FA]/40 mt-0.5">
            {fmtDuration(entry.duration_minutes)} · Entry {fmt(entry.entry_price)} · Exit {fmt(entry.exit_price)}
          </p>
        </div>

        {/* P/L */}
        <span className={`font-mono text-sm font-bold flex-shrink-0 ${win ? "text-[#49B06E]" : "text-[#ef4444]"}`}>
          {win ? "+" : ""}{fmt(entry.pnl)}
        </span>

        {expanded ? <ChevronUp className="w-4 h-4 text-[#F4F7FA]/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#F4F7FA]/30 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-[#27B7C8]/10">
          {/* Score bars */}
          {entry.score_discipline != null && (
            <div className="px-4 pt-3 pb-2 grid grid-cols-5 gap-3">
              <ScoreBar label="P/L" score={entry.score_pl} />
              <ScoreBar label="R/R" score={entry.score_rr} />
              <ScoreBar label="Entry" score={entry.score_entry} />
              <ScoreBar label="Exit" score={entry.score_exit} />
              <ScoreBar label="Disc." score={entry.score_discipline} />
            </div>
          )}

          {/* Pansy commentary */}
          {entry.what_went_well && (
            <div className="px-4 pb-3 space-y-2">
              {[
                { label: "What went well", text: entry.what_went_well, color: "text-[#49B06E]" },
                { label: "What to improve", text: entry.what_to_improve, color: "text-[#ef4444]" },
                { label: "Did you follow your plan?", text: entry.followed_plan, color: "text-[#27B7C8]" },
                { label: "Remember next time", text: entry.remember_next, color: "text-yellow-400" },
              ].map(({ label, text, color }) => text && (
                <div key={label} className="rounded-lg bg-[#0E1B30] px-3 py-2.5">
                  <p className={`text-[9px] uppercase tracking-wide font-semibold mb-1 ${color}`}>{label}</p>
                  <p className="text-xs text-[#F4F7FA]/70 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Trade details */}
          <div className="mx-4 mb-3 grid grid-cols-3 gap-px bg-[#27B7C8]/8 rounded-lg overflow-hidden border border-[#27B7C8]/10">
            {[
              ["Stop", entry.stop_price != null ? fmt(entry.stop_price) : "—"],
              ["Target", entry.target_price != null ? fmt(entry.target_price) : "—"],
              ["Risk", entry.risk_amount != null ? fmt(entry.risk_amount) : "—"],
            ].map(([l, v]) => (
              <div key={l} className="bg-[#0E1B30] px-2 py-2 text-center">
                <p className="text-[9px] text-[#F4F7FA]/30 uppercase tracking-wide">{l}</p>
                <p className="font-mono text-xs text-[#F4F7FA]/70 mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Thesis */}
          {entry.thesis && (
            <div className="mx-4 mb-3">
              <p className="text-[9px] text-[#F4F7FA]/30 uppercase tracking-wide mb-1">Pre-trade plan</p>
              <p className="text-xs text-[#F4F7FA]/50 leading-relaxed whitespace-pre-wrap line-clamp-4">{entry.thesis}</p>
            </div>
          )}

          {/* User-editable fields */}
          <div className="mx-4 mb-4 rounded-lg bg-[#0E1B30] border border-[#27B7C8]/10 p-3 space-y-3">
            <p className="text-[9px] text-[#F4F7FA]/30 uppercase tracking-wide font-semibold">Your notes (tap to edit)</p>
            <div className="grid grid-cols-2 gap-3">
              <EditableField label="Chart Pattern" value={entry.chart_pattern} onSave={v => saveField("chart_pattern", v)} />
              <EditableField label="Candlestick" value={entry.candlestick_confirmation} onSave={v => saveField("candlestick_confirmation", v)} />
              <EditableField label="Indicator Used" value={entry.indicator_used} onSave={v => saveField("indicator_used", v)} />
              <EditableField label="Market Trend" value={entry.market_trend} onSave={v => saveField("market_trend", v)} />
              <EditableField label="Emotion Before" value={entry.emotion_before} onSave={v => saveField("emotion_before", v)} />
              <EditableField label="Emotion During" value={entry.emotion_during} onSave={v => saveField("emotion_during", v)} />
              <EditableField label="Emotion After" value={entry.emotion_after} onSave={v => saveField("emotion_after", v)} />
              <EditableField label="Related Lesson" value={entry.related_lesson} onSave={v => saveField("related_lesson", v)} />
            </div>
            <EditableField label="What I Learned" value={entry.what_i_learned} onSave={v => saveField("what_i_learned", v)} />
            <EditableField label="Personal Notes" value={entry.personal_notes} onSave={v => saveField("personal_notes", v)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pro gate ───────────────────────────────────────────────────────────────
function ProGate() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Lock className="w-10 h-10 text-[#27B7C8]/40 mb-4" />
      <h2 className="font-serif text-xl font-bold text-[#F4F7FA] mb-2">Pro Feature</h2>
      {canShowExternalPayment ? (
        <>
          <p className="text-sm text-[#F4F7FA]/50 mb-6 max-w-xs">
            The Trade Journal is available to Pro subscribers. Upgrade to track your process and build better habits.
          </p>
          <Link href="/subscription-offer"
            className="px-6 py-3 rounded-xl bg-[#27B7C8] text-[#0E1B30] font-semibold text-sm hover:bg-[#27B7C8]/90 transition-colors">
            Upgrade to Pro
          </Link>
        </>
      ) : (
        <p className="text-sm text-[#F4F7FA]/50 max-w-xs">
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

  // Filters
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

  return (
    <>
      <Head>
        <title>Trade Journal — Bloom</title>
      </Head>
      <Layout>
        <div className="min-h-screen bg-[#0E1B30] px-4 py-6 max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <NotebookPen className="w-6 h-6 text-[#27B7C8]" />
              <h1 className="font-serif text-2xl font-bold text-[#F4F7FA]">Trade Journal</h1>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-[#27B7C8]/10 border border-[#27B7C8]/20 px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-[#27B7C8] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#27B7C8]/90 leading-relaxed">
                <strong>Educational simulator — not a brokerage.</strong> All trades are virtual. Not financial advice.
              </p>
            </div>
          </div>

          {(authLoading || (loading && isPro)) && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-5 h-5 text-[#27B7C8] animate-spin" />
              <span className="text-sm text-[#F4F7FA]/50">Loading journal…</span>
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
              {/* Filters */}
              <div className="rounded-xl bg-[#16264A] border border-[#27B7C8]/15 p-4 mb-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Filter className="w-3.5 h-3.5 text-[#27B7C8]/60" />
                  <span className="text-xs text-[#F4F7FA]/40 uppercase tracking-wide">Filter</span>
                </div>

                {/* Ticker search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4F7FA]/30" />
                  <input
                    className="w-full bg-[#0E1B30] border border-[#27B7C8]/15 rounded-lg pl-8 pr-3 py-2 text-sm text-[#F4F7FA] placeholder-[#F4F7FA]/25 focus:outline-none focus:border-[#27B7C8]"
                    placeholder="Search by ticker…"
                    value={ticker}
                    onChange={e => setTicker(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-[#F4F7FA]/30 uppercase tracking-wide block mb-1">Grade</label>
                    <select
                      className="w-full bg-[#0E1B30] border border-[#27B7C8]/15 rounded-lg px-2 py-2 text-xs text-[#F4F7FA] focus:outline-none focus:border-[#27B7C8]"
                      value={grade} onChange={e => setGrade(e.target.value)}
                    >
                      <option value="all">All</option>
                      {["A","B","C","D","F"].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-[#F4F7FA]/30 uppercase tracking-wide block mb-1">Direction</label>
                    <select
                      className="w-full bg-[#0E1B30] border border-[#27B7C8]/15 rounded-lg px-2 py-2 text-xs text-[#F4F7FA] focus:outline-none focus:border-[#27B7C8]"
                      value={direction} onChange={e => setDirection(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-[#F4F7FA]/30 uppercase tracking-wide block mb-1">Period</label>
                    <select
                      className="w-full bg-[#0E1B30] border border-[#27B7C8]/15 rounded-lg px-2 py-2 text-xs text-[#F4F7FA] focus:outline-none focus:border-[#27B7C8]"
                      value={range} onChange={e => setRange(e.target.value)}
                    >
                      <option value="all">All time</option>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary bar */}
              {entries.length > 0 && (
                <div className="flex items-center justify-between px-1 mb-3">
                  <span className="text-xs text-[#F4F7FA]/40">{entries.length} entr{entries.length === 1 ? "y" : "ies"}</span>
                  <Link href="/practice" className="text-xs text-[#27B7C8] hover:underline">← Back to Trader</Link>
                </div>
              )}

              {entries.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  {ticker || grade !== "all" || direction !== "all" || range !== "all" ? (
                    <>
                      <Search className="w-10 h-10 text-[#F4F7FA]/15 mb-4" />
                      <p className="text-sm text-[#F4F7FA]/40">No entries match your filters.</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-[#27B7C8]/10 flex items-center justify-center mb-4">
                        <NotebookPen className="w-6 h-6 text-[#27B7C8]/60" />
                      </div>
                      <p className="text-sm font-medium text-[#F4F7FA]/50 mb-1">No journal entries yet</p>
                      <p className="text-xs text-[#F4F7FA]/30 max-w-[260px] mb-5">
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
                <p className="text-[10px] text-[#F4F7FA]/25 leading-relaxed max-w-sm mx-auto">
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
