import { useEffect, useState } from "react";
import { ProgressLine } from "@/components/ProgressLine";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Award, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { RiskNote } from "@/components/RiskNote";
import { Switch } from "@/components/ui/switch";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ALL_LESSONS, hasFinishedCourse } from "@/data/lessons-stocks";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { supabase } from "@/integrations/supabase/client";
import { money, practiceFetch, type PracticeAccount, type PracticeTrade } from "@/lib/practice/api";
import { marginFor } from "@/lib/practice/maths";
import { authService } from "@/services/authService";

const sanitizeName = (raw: string) =>
  raw
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);

interface PracticeSummary {
  balance: number;
  closedCount: number;
  result: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading, userId } = useSubscription();
  const { completed } = useLearningProgress();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [boardName, setBoardName] = useState("");
  const [savedBoardName, setSavedBoardName] = useState("");
  const [showOnBoard, setShowOnBoard] = useState(true);
  const [summary, setSummary] = useState<PracticeSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.replace("/onboarding");
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [{ data: profile }, accountRes, tradesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        practiceFetch<{ account: PracticeAccount }>("/api/practice/account"),
        practiceFetch<{ trades: PracticeTrade[] }>("/api/practice/trades"),
      ]);
      if (profile) {
        setFullName(profile.full_name ?? "");
        setEmail(profile.email ?? "");
        setBoardName(profile.challenge_name ?? "");
        setSavedBoardName(profile.challenge_name ?? "");
        setShowOnBoard((profile as { show_on_leaderboard?: boolean }).show_on_leaderboard !== false);
      }
      if (accountRes.ok && tradesRes.ok) {
        const trades = tradesRes.data.trades ?? [];
        const closed = trades.filter((trade) => trade.status === "closed");
        const reserved = trades
          .filter((trade) => trade.status === "open")
          .reduce((sum, trade) => sum + marginFor(trade.ticker, Number(trade.entry_price), Number(trade.shares)), 0);
        setSummary({
          balance: Number(accountRes.data.account.cash_balance) + reserved,
          closedCount: closed.length,
          result: closed.reduce((sum, trade) => sum + Number(trade.pnl ?? 0), 0),
        });
      }
    })();
  }, [userId]);

  const saveBoardName = async () => {
    if (!userId) return;
    const clean = sanitizeName(boardName);
    if (clean.length < 3) return setMessage("Your leaderboard name needs at least 3 characters.");
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ challenge_name: clean }).eq("id", userId);
    setSaving(false);
    if (error) return setMessage("We couldn't save that just now. Please try again.");
    setBoardName(clean);
    setSavedBoardName(clean);
    setMessage("Your leaderboard name is saved.");
  };

  const toggleBoard = async (show: boolean) => {
    if (!userId) return;
    setShowOnBoard(show);
    const { error } = await supabase.from("profiles").update({ show_on_leaderboard: show } as never).eq("id", userId);
    if (error) {
      setShowOnBoard(!show);
      setMessage("We couldn't change that just now. Please try again.");
    } else {
      setMessage(show ? "You're showing on the leaderboards." : "You're now hidden from the leaderboards.");
    }
  };

  const signOut = async () => {
    await authService.signOut();
    window.location.href = "/";
  };

  const finishedCount = ALL_LESSONS.filter((lesson) => completed.includes(lesson.slug)).length;

  return (
    <>
      <SEO title="Your profile - Bloom" description="Your lessons, practice results and settings on Bloom." />
      <Layout>
        {!isLoggedIn ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
            <header>
              <h1 className="text-3xl font-semibold text-foreground">{fullName ? `Hello, ${fullName.split(" ")[0]}` : "Your profile"}</h1>
              {email && <p className="mt-1 text-base text-muted-foreground">{email}</p>}
            </header>

            <section className="rounded-3xl bg-secondary p-5" aria-labelledby="progress-heading">
              <h2 id="progress-heading" className="text-xl font-semibold text-foreground">Your garden</h2>
              <p className="mt-1 text-base text-muted-foreground">
                {finishedCount === 0 ? "Your first bloom is one lesson away." : `${finishedCount} of ${ALL_LESSONS.length} lessons finished.`}
              </p>
              <div className="mt-3">
                <ProgressLine done={finishedCount} total={ALL_LESSONS.length} label="Lessons finished" />
              </div>
              <Link href="/lessons" className="mt-3 inline-block text-sm font-semibold text-primary underline underline-offset-2">
                Go to lessons
              </Link>
              {hasFinishedCourse(completed) && (
                <Link href="/app/certificate?course=gold-foundations&level=beginner" className="mt-4 flex items-center gap-2 rounded-2xl bg-card p-4 font-semibold text-foreground">
                  <Award className="h-5 w-5 text-primary" /> See your certificate
                </Link>
              )}
            </section>

            <section className="rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)]" aria-labelledby="practice-heading">
              <h2 id="practice-heading" className="text-xl font-semibold text-foreground">Your practice</h2>
              {summary ? (
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <dt className="text-xs text-muted-foreground">Simulated balance</dt>
                    <dd className="font-serif text-lg font-semibold text-foreground">{money(summary.balance)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Closed trades</dt>
                    <dd className="font-serif text-lg font-semibold text-foreground">{summary.closedCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Results</dt>
                    <dd className={`font-serif text-lg font-semibold ${summary.result >= 0 ? "text-primary" : "text-[var(--bloom-blush)]"}`}>
                      {summary.result >= 0 ? "+" : "-"}
                      {money(Math.abs(summary.result))}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-2 text-base text-muted-foreground">Your practice results will appear here.</p>
              )}
              <Link href="/practice" className="mt-3 inline-block text-sm font-semibold text-primary underline underline-offset-2">
                Go to Practice
              </Link>
            </section>

            <section className="rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)]" aria-labelledby="board-heading">
              <h2 id="board-heading" className="text-xl font-semibold text-foreground">Leaderboards</h2>
              <div className="mt-3 flex items-center justify-between gap-4">
                <label htmlFor="show-on-board" className="text-base text-foreground">
                  Show me on the leaderboards
                </label>
                <Switch id="show-on-board" checked={showOnBoard} onCheckedChange={toggleBoard} />
              </div>
              <label className="mt-4 block text-sm font-medium text-foreground">
                Your leaderboard name
                <input
                  value={boardName}
                  onChange={(event) => setBoardName(event.target.value)}
                  maxLength={20}
                  placeholder={fullName ? fullName.split(" ")[0] : "Choose a name"}
                  className="mt-1 h-12 w-full rounded-2xl border border-border bg-background px-4 text-base font-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <p className="mt-1 text-sm text-muted-foreground">If you leave this empty, we&apos;ll show your first name only.</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={saveBoardName}
                disabled={saving || sanitizeName(boardName) === savedBoardName}
                className="mt-3 h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                Save name
              </motion.button>
              {message && (
                <p role="status" className="mt-3 text-sm text-foreground">
                  {message}
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-border p-5" aria-labelledby="account-heading">
              <h2 id="account-heading" className="text-xl font-semibold text-foreground">Your account</h2>
              <p className="mt-1 text-base text-muted-foreground">Everything on Bloom is free, so there&apos;s nothing to pay or manage.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={signOut} className="h-11 rounded-full border border-primary px-5 text-sm font-semibold text-primary transition-transform active:scale-95">
                  Sign out
                </button>
                <Link href="/delete-account" className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-muted-foreground underline underline-offset-2">
                  Delete my account
                </Link>
              </div>
            </section>

            <RiskNote />
          </div>
        )}
      </Layout>
    </>
  );
}
