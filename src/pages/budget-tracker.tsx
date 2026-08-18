import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingDown, TrendingUp as TrendUp, DollarSign, PieChart, Sparkles, AlertTriangle, CheckCircle, ArrowRight, Target, Wallet } from "lucide-react";
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

function analyzeSpending(totals: Record<string, number>, total: number, entryCount: number, income?: number | null): SpendingInsight[] {
  if (entryCount < 3 || total < 10) return [];
  const insights: SpendingInsight[] = [];
  const pct = (cat: string) => total > 0 ? ((totals[cat] || 0) / total) * 100 : 0;
  const incPct = (cat: string) => income && income > 0 ? ((totals[cat] || 0) / income) * 100 : 0;

  if (income && income > 0) {
    const spendRatio = (total / income) * 100;
    const disposable = income - total;
    if (spendRatio > 95) {
      insights.push({ severity: "warning", emoji: "🚨", title: "Almost no money left this month", message: `You've spent ${spendRatio.toFixed(0)}% of your $${income.toLocaleString()} income. That leaves only $${Math.max(0, disposable).toFixed(0)} for savings and emergencies. Let's find your biggest cost and see if we can trim it.` });
    } else if (spendRatio > 80) {
      insights.push({ severity: "info", emoji: "📊", title: `$${disposable.toFixed(0)} left to work with`, message: `You've used ${spendRatio.toFixed(0)}% of your income. Aim to keep spending under 80% so you can save at least 20% ($${(income * 0.2).toFixed(0)}/month). Even small cuts compound.` });
    } else if (spendRatio <= 60 && total > 100) {
      insights.push({ severity: "positive", emoji: "💪", title: `$${disposable.toFixed(0)} in disposable income!`, message: `Only ${spendRatio.toFixed(0)}% of your income is going to expenses. That surplus is powerful — consider putting it into a high-yield savings account or index fund.` });
    }
  }

  const housingVal = totals["Rent/Housing"] || 0;
  const housingInc = income && income > 0 ? incPct("Rent/Housing") : 0;
  const housingPct = pct("Rent/Housing");

  if (income && income > 0 && housingVal > 0) {
    if (housingInc > 30) {
      insights.push({ severity: "warning", emoji: "🏠", title: "Housing takes too much of your income", message: `${housingInc.toFixed(0)}% of your income goes to housing. The 30% rule says this should be lower. Above that, savings and fun money get squeezed hard.` });
    } else if (housingInc <= 30) {
      insights.push({ severity: "positive", emoji: "🏠", title: "Housing costs look healthy", message: `${housingInc.toFixed(0)}% of your income on housing — that's within the 30% guideline. You've got room to breathe.` });
    }
  } else if (housingPct > 40) {
    insights.push({ severity: "warning", emoji: "🏠", title: "Housing is eating your budget", message: `${housingPct.toFixed(0)}% of your spending is on housing. The guideline is under 30%. Add your income above so Pansy can give you a clearer picture.` });
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

function DonutChart({ data, total, size = 200 }: { data: { label: string; value: number; color: string; emoji: string }[]; total: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.62;
  const gapAngle = 0.02;

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="currentColor" strokeWidth={outerR - innerR} className="text-muted/30" strokeDasharray="4 4" />
        </svg>
        <p className="text-xs text-muted-foreground mt-2">Add expenses to see your chart</p>
      </div>
    );
  }

  const arcs: { path: string; color: string; label: string; emoji: string; pct: number }[] = [];
  let startAngle = -Math.PI / 2;

  data.forEach(d => {
    const pct = d.value / total;
    const sweep = pct * Math.PI * 2 - gapAngle;
    if (sweep <= 0) return;
    const endAngle = startAngle + sweep;

    const x1o = cx + outerR * Math.cos(startAngle);
    const y1o = cy + outerR * Math.sin(startAngle);
    const x2o = cx + outerR * Math.cos(endAngle);
    const y2o = cy + outerR * Math.sin(endAngle);
    const x1i = cx + innerR * Math.cos(endAngle);
    const y1i = cy + innerR * Math.sin(endAngle);
    const x2i = cx + innerR * Math.cos(startAngle);
    const y2i = cy + innerR * Math.sin(startAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;

    const path = `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2i} ${y2i} Z`;
    arcs.push({ path, color: d.color, label: d.label, emoji: d.emoji, pct: pct * 100 });

    startAngle = endAngle + gapAngle;
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <motion.path
            key={i}
            d={arc.path}
            fill={arc.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        <circle cx={cx} cy={cy} r={innerR - 1} className="fill-card" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Spent</span>
      </div>
    </div>
  );
}

function DonutLegend({ data, total }: { data: { label: string; value: number; color: string; emoji: string }[]; total: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
      {data.map(d => {
        const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : "0";
        return (
          <div key={d.label} className="flex items-center gap-2 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-muted-foreground truncate">{d.emoji} {d.label}</span>
            <span className="text-xs font-semibold text-foreground ml-auto shrink-0">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
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
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
  const [showIncomeInput, setShowIncomeInput] = useState(false);
  const [incomeDraft, setIncomeDraft] = useState("");

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

  useEffect(() => {
    const saved = localStorage.getItem("sbw_monthly_budget");
    if (saved) setMonthlyBudget(parseFloat(saved));
    const savedIncome = localStorage.getItem("sbw_monthly_income");
    if (savedIncome) setMonthlyIncome(parseFloat(savedIncome));
  }, []);

  const totalSpent = entries.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
  const insights = analyzeSpending(categoryTotals, totalSpent, entries.length, monthlyIncome);
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

        {/* ── MONTH TOTAL + BUDGET RING ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-foreground">{monthLabel(now)}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowIncomeInput(o => !o); setShowBudgetInput(false); haptic(); }}
                className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5" />
                {monthlyIncome ? `$${monthlyIncome.toLocaleString()}` : "Set income"}
              </button>
              <button
                onClick={() => { setShowBudgetInput(o => !o); setShowIncomeInput(false); haptic(); }}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                {monthlyBudget ? `$${monthlyBudget.toLocaleString()} goal` : "Set budget"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showIncomeInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Monthly take-home pay</label>
                <div className="flex gap-2 pb-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="3,500"
                      value={incomeDraft}
                      onChange={e => setIncomeDraft(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const v = parseFloat(incomeDraft);
                      if (!isNaN(v) && v > 0) {
                        setMonthlyIncome(v);
                        localStorage.setItem("sbw_monthly_income", String(v));
                        setShowIncomeInput(false);
                        setIncomeDraft("");
                        haptic(12);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold"
                  >
                    Set
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showBudgetInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Monthly spending budget</label>
                <div className="flex gap-2 pb-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="2,000"
                      value={budgetDraft}
                      onChange={e => setBudgetDraft(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const v = parseFloat(budgetDraft);
                      if (!isNaN(v) && v > 0) {
                        setMonthlyBudget(v);
                        localStorage.setItem("sbw_monthly_budget", String(v));
                        setShowBudgetInput(false);
                        setBudgetDraft("");
                        haptic(12);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                  >
                    Set
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {monthlyBudget && totalSpent > 0 ? (
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-foreground">${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-sm text-muted-foreground ml-1">/ ${monthlyBudget.toLocaleString()}</span>
                </div>
                <span className={`text-sm font-bold ${totalSpent <= monthlyBudget ? "text-[#49B06E]" : "text-[#E05A6A]"}`}>
                  {totalSpent <= monthlyBudget
                    ? `$${(monthlyBudget - totalSpent).toLocaleString("en-US", { maximumFractionDigits: 0 })} left`
                    : `$${(totalSpent - monthlyBudget).toLocaleString("en-US", { maximumFractionDigits: 0 })} over`}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalSpent / monthlyBudget) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: totalSpent <= monthlyBudget * 0.75
                      ? "linear-gradient(90deg, #49B06E, #27B7C8)"
                      : totalSpent <= monthlyBudget
                      ? "linear-gradient(90deg, #F59E0B, #F97316)"
                      : "linear-gradient(90deg, #E05A6A, #EF4444)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{((totalSpent / monthlyBudget) * 100).toFixed(0)}% used</span>
                <span>{entries.length} expense{entries.length === 1 ? "" : "s"}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
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
            </div>
          )}
        </motion.div>

        {/* ── INCOME vs SPENDING ─────────────────────────────── */}
        {monthlyIncome && monthlyIncome > 0 && totalSpent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendUp className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-foreground">Income vs Spending</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Income</span>
                <span className="font-bold text-[#49B06E]">${monthlyIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Spent so far</span>
                <span className="font-bold text-foreground">${totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalSpent / monthlyIncome) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: totalSpent <= monthlyIncome * 0.6
                      ? "linear-gradient(90deg, #49B06E, #27B7C8)"
                      : totalSpent <= monthlyIncome * 0.8
                      ? "linear-gradient(90deg, #F59E0B, #F97316)"
                      : "linear-gradient(90deg, #E05A6A, #EF4444)",
                  }}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">{((totalSpent / monthlyIncome) * 100).toFixed(0)}% of income used</span>
                <span className={`text-sm font-bold ${totalSpent <= monthlyIncome ? "text-[#49B06E]" : "text-[#E05A6A]"}`}>
                  {totalSpent <= monthlyIncome
                    ? `$${(monthlyIncome - totalSpent).toLocaleString("en-US", { maximumFractionDigits: 0 })} left`
                    : `$${(totalSpent - monthlyIncome).toLocaleString("en-US", { maximumFractionDigits: 0 })} over`}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ADD EXPENSE BUTTON / FORM ──────────────────────── */}
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95, y: 1 }}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 28px rgba(39,183,200,0.3)" }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
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

        {/* ── SPENDING CHART ──────────────────────────────────── */}
        {sortedCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Spending Breakdown</h3>
            </div>

            <div className="flex justify-center">
              <DonutChart
                data={sortedCategories.map(([cat, val]) => {
                  const info = getCatInfo(cat);
                  return { label: cat, value: val, color: info.color, emoji: info.emoji };
                })}
                total={totalSpent}
              />
            </div>

            <DonutLegend
              data={sortedCategories.map(([cat, val]) => {
                const info = getCatInfo(cat);
                return { label: cat, value: val, color: info.color, emoji: info.emoji };
              })}
              total={totalSpent}
            />
          </motion.div>
        )}

        {/* ── CATEGORY BARS ────────────────────────────────────── */}
        {sortedCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">By Category</h3>
              <span className="text-xs text-muted-foreground">{sortedCategories.length} categories</span>
            </div>

            {sortedCategories.map(([cat, catTotal], i) => {
              const info = getCatInfo(cat);
              const pct = totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0;
              const maxVal = sortedCategories[0][1];
              const barWidth = maxVal > 0 ? (catTotal / maxVal) * 100 : 0;
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="py-2.5 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: info.color + "18" }}>
                        {info.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{cat}</p>
                        <p className="text-[10px] text-muted-foreground">{pct.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">${catTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.6, delay: 0.05 * i, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                  </div>
                </motion.div>
              );
            })}
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
