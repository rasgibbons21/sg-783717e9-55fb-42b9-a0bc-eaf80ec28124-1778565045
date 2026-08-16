import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingDown, DollarSign, PieChart, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface BudgetEntry {
  id: string;
  category: string;
  amount: number;
  note: string | null;
  date: string;
}

const CATEGORIES = [
  { name: "Rent/Housing", emoji: "🏠", color: "#E05A6A" },
  { name: "Food",         emoji: "🍕", color: "#F59E0B" },
  { name: "Transport",    emoji: "🚗", color: "#27B7C8" },
  { name: "Utilities",    emoji: "💡", color: "#8B5CF6" },
  { name: "Phone/Internet", emoji: "📱", color: "#3B82F6" },
  { name: "Shopping",     emoji: "🛍️", color: "#EC4899" },
  { name: "Entertainment", emoji: "🎬", color: "#10B981" },
  { name: "Health",       emoji: "💊", color: "#EF4444" },
  { name: "Subscriptions", emoji: "📦", color: "#6366F1" },
  { name: "Savings",      emoji: "🐷", color: "#49B06E" },
  { name: "Debt Payments", emoji: "💳", color: "#F97316" },
  { name: "Other",        emoji: "📝", color: "#6B7280" },
] as const;

const PANSY_TIPS = [
  "Tracking your spending is the first real step to financial freedom. Most people never even look.",
  "The 50/30/20 rule: 50% needs, 30% wants, 20% savings. You don't have to be perfect — just aware.",
  "Every dollar you save today is a dollar that can work for you tomorrow. Even $5 matters.",
  "If you're spending more than 30% on housing, that's worth looking at. No judgment — just awareness.",
  "Subscriptions add up fast. When was the last time you actually used all of them?",
  "Eating out vs. cooking — the gap is usually bigger than people think. Track it and see.",
  "The goal isn't to stop spending. It's to spend on purpose, not on autopilot.",
];

function getCatInfo(name: string) {
  return CATEGORIES.find(c => c.name === name) ?? { name, emoji: "📝", color: "#6B7280" };
}

function monthLabel(date: Date) {
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

export default function BudgetTracker() {
  const router = useRouter();
  const { userId, isLoggedIn } = useSubscription();

  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [tip] = useState(() => PANSY_TIPS[Math.floor(Math.random() * PANSY_TIPS.length)]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    const { data } = await db
      .from("budget_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("date", monthStart)
      .order("date", { ascending: false });
    if (data) setEntries(data as BudgetEntry[]);
    setLoading(false);
  }, [userId, monthStart]);

  useEffect(() => {
    if (!isLoggedIn && !loading) { router.push("/onboarding"); return; }
    fetchEntries();
  }, [isLoggedIn, loading, router, fetchEntries]);

  const totalSpent = entries.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);

  const handleAdd = async () => {
    if (!userId || !category || !amount || saving) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;

    setSaving(true);
    haptic(12);

    const { error } = await db.from("budget_entries").insert({
      user_id: userId,
      category,
      amount: parsed,
      note: note.trim() || null,
      date: new Date().toISOString(),
    });

    if (!error) {
      setCategory("");
      setAmount("");
      setNote("");
      setShowForm(false);
      await fetchEntries();

      if (entries.length === 0) {
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: ["#27B7C8", "#49B06E", "#F4F7FA"] });
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    haptic(6);
    await db.from("budget_entries").delete().eq("id", id).eq("user_id", userId);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <Layout>
      <SEO title="Budget Tracker — Bloom" description="Track where your money goes with Pansy's guidance." />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── PANSY HEADER ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl shrink-0">🌺</div>
            <div>
              <p className="text-sm font-bold text-foreground mb-1">Hey sis,</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Money comes in, money goes out. But do you <em>know</em> where it&apos;s going?
                That&apos;s where this starts. Not fancy strategies. Just the truth.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── MONTH TOTAL ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 text-center"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {monthLabel(now)}
          </p>
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="w-7 h-7 text-primary" />
            <span className="text-4xl font-bold text-foreground">
              {totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {entries.length === 0
              ? "Track your first expense below"
              : `${entries.length} expense${entries.length === 1 ? "" : "s"} tracked`}
          </p>
        </motion.div>

        {/* ── ADD EXPENSE BUTTON / FORM ──────────────────────── */}
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowForm(true); haptic(); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" /> Track an Expense
            </motion.button>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-border rounded-2xl p-5 space-y-4"
            >
              {/* Category picker */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">What did you spend on?</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <motion.button
                      key={cat.name}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { setCategory(cat.name); haptic(); }}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                        category === cat.name
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="leading-tight text-center">{cat.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">How much?</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-xl text-foreground text-lg font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Any notes? <span className="font-normal text-muted-foreground">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g., groceries for the week"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  maxLength={120}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowForm(false); setCategory(""); setAmount(""); setNote(""); }}
                  className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted/50"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAdd}
                  disabled={!category || !amount || saving}
                  className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Track This"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CATEGORY BREAKDOWN ─────────────────────────────── */}
        {sortedCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Where your money went</h3>
            </div>

            <div className="space-y-3">
              {sortedCategories.map(([cat, total]) => {
                const info = getCatInfo(cat);
                const pct = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <span>{info.emoji}</span>
                        <span className="font-medium text-foreground">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">{pct.toFixed(0)}%</span>
                        <span className="font-semibold text-foreground">${total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: info.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── PANSY TIP ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-accent/10 border border-accent/20 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Pansy&apos;s tip:</strong> {tip}
            </p>
          </div>
        </motion.div>

        {/* ── RECENT EXPENSES ────────────────────────────────── */}
        {entries.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Recently tracked</h3>
            </div>

            <div className="space-y-1">
              {entries.slice(0, 15).map(entry => {
                const info = getCatInfo(entry.category);
                const d = new Date(entry.date);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-2.5 border-b border-border last:border-0 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">{info.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{entry.category}</p>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground truncate">{entry.note}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60">
                          {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-foreground">${entry.amount.toFixed(2)}</span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ENCOURAGEMENT ───────────────────────────────────── */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-4"
          >
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">You&apos;re doing the hardest part.</strong><br />
              Seeing where your money goes. Now we build from here. 🌱
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
