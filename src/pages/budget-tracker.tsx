import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingDown, DollarSign, PieChart, Sparkles, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { AdMobBanner } from "@/components/AdMobBanner";

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

type InsightSeverity = "warning" | "positive" | "info";
interface SpendingInsight {
  severity: InsightSeverity;
  title: string;
  message: string;
  emoji: string;
}

function analyzeSpending(totals: Record<string, number>, total: number, entryCount: number): SpendingInsight[] {
  if (entryCount < 3 || total < 10) return [];
  const insights: SpendingInsight[] = [];
  const pct = (cat: string) => total > 0 ? ((totals[cat] || 0) / total) * 100 : 0;

  const housingPct = pct("Rent/Housing");
  if (housingPct > 40) {
    insights.push({ severity: "warning", emoji: "🏠", title: "Housing is eating your income", message: `${housingPct.toFixed(0)}% of your spending is on housing. The guideline is under 30%. If you're above 40%, it's squeezing everything else — savings, investing, even breathing room. Can you negotiate rent, get a roommate, or explore other options?` });
  } else if (housingPct > 0 && housingPct <= 30) {
    insights.push({ severity: "positive", emoji: "🏠", title: "Housing costs look healthy", message: `${housingPct.toFixed(0)}% on housing — that's within the recommended 30%. You've got room to breathe and invest.` });
  }

  const foodPct = pct("Food");
  if (foodPct > 25) {
    insights.push({ severity: "warning", emoji: "🍕", title: "Food spending is high", message: `${foodPct.toFixed(0)}% of your money is going to food. That's usually a sign of frequent dining out or delivery. Try meal prepping 2-3 days a week — most people save $200-400/month just from that switch.` });
  }

  const entertainmentPct = pct("Entertainment");
  const shoppingPct = pct("Shopping");
  const wantsPct = entertainmentPct + shoppingPct;
  if (wantsPct > 35) {
    insights.push({ severity: "warning", emoji: "🛍️", title: "Wants are outpacing needs", message: `Shopping + entertainment is ${wantsPct.toFixed(0)}% of your spending. I'm not saying cut the fun — but can you do 80% of the fun for 50% of the cost? Free events, library, park dates, thrift shopping. Your future self will thank you.` });
  }

  const subsPct = pct("Subscriptions");
  if (subsPct > 8) {
    insights.push({ severity: "warning", emoji: "📦", title: "Subscription creep alert", message: `${subsPct.toFixed(0)}% on subscriptions — that adds up to $${(totals["Subscriptions"] || 0).toFixed(0)}/month. Go through every subscription right now. If you haven't used it in 2 weeks, cancel it. You can always re-subscribe later.` });
  }

  const savingsPct = pct("Savings");
  if (savingsPct === 0 && total > 100) {
    insights.push({ severity: "warning", emoji: "🐷", title: "No savings tracked this month", message: "I don't see any money going to savings. Even $20/month is a start. The habit matters more than the amount. Set up an automatic transfer — even $5/week — so it happens before you can spend it." });
  } else if (savingsPct >= 20) {
    insights.push({ severity: "positive", emoji: "🐷", title: "Savings game is strong!", message: `${savingsPct.toFixed(0)}% going to savings — that's at or above the recommended 20%. You're building a foundation. Keep it up and think about where to put that money to work (HYSA, index funds).` });
  } else if (savingsPct > 0 && savingsPct < 10) {
    insights.push({ severity: "info", emoji: "🐷", title: "Savings could use a boost", message: `${savingsPct.toFixed(0)}% to savings is a start, but aim for 20%. Look at your top 2 spending categories above — even a small cut there can double your savings rate.` });
  }

  const debtPct = pct("Debt Payments");
  if (debtPct > 20) {
    insights.push({ severity: "warning", emoji: "💳", title: "Debt is taking a big cut", message: `${debtPct.toFixed(0)}% of your money goes to debt. That's real weight. Focus on the highest-interest debt first (avalanche method), or the smallest balance first for quick wins (snowball method). Either way — you're paying attention, and that's step one.` });
  }

  const catCount = Object.keys(totals).length;
  if (catCount <= 2 && entryCount >= 5) {
    insights.push({ severity: "info", emoji: "📊", title: "Track more categories", message: `You've got ${entryCount} expenses but only in ${catCount} category${catCount === 1 ? "" : "ies"}. Try logging everything for a week — coffee, gas, subscriptions, snacks. The full picture is where the real insights come from.` });
  }

  if (insights.length === 0 && total > 0) {
    insights.push({ severity: "positive", emoji: "✨", title: "Looking balanced overall", message: "Your spending looks reasonably balanced across categories. Keep tracking consistently — patterns become clearer over time, and that's when you can really optimize." });
  }

  return insights;
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
  const insights = analyzeSpending(categoryTotals, totalSpent, entries.length);
  const [showInsights, setShowInsights] = useState(false);

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

        {/* ── PANSY'S SPENDING INSIGHTS ─────────────────────── */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowInsights(o => !o); haptic(); }}
              className="w-full flex items-center justify-between p-5"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🌺</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">Pansy&apos;s Spending Insights</p>
                  <p className="text-xs text-muted-foreground">
                    {insights.filter(i => i.severity === "warning").length > 0
                      ? `${insights.filter(i => i.severity === "warning").length} thing${insights.filter(i => i.severity === "warning").length > 1 ? "s" : ""} to look at`
                      : "Looking good overall"}
                  </p>
                </div>
              </div>
              <ArrowRight
                className="w-4 h-4 text-muted-foreground transition-transform"
                style={{ transform: showInsights ? "rotate(90deg)" : "rotate(0deg)" }}
              />
            </motion.button>

            <AnimatePresence>
              {showInsights && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                    {insights.map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="rounded-xl p-4"
                        style={{
                          background: insight.severity === "warning"
                            ? "rgba(245,158,11,0.08)"
                            : insight.severity === "positive"
                            ? "rgba(73,176,110,0.08)"
                            : "rgba(39,183,200,0.08)",
                          border: `1px solid ${
                            insight.severity === "warning"
                              ? "rgba(245,158,11,0.2)"
                              : insight.severity === "positive"
                              ? "rgba(73,176,110,0.2)"
                              : "rgba(39,183,200,0.2)"
                          }`,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 mt-0.5">
                            {insight.severity === "warning" ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                            ) : insight.severity === "positive" ? (
                              <CheckCircle className="w-4 h-4 text-[#49B06E]" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-[#27B7C8]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                              <span>{insight.emoji}</span> {insight.title}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                              {insight.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
                      Based on this month&apos;s data. Not financial advice — just Pansy keeping it real.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── AD ──────────────────────────────────────────────── */}
        <AdMobBanner format="rectangle" />

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
