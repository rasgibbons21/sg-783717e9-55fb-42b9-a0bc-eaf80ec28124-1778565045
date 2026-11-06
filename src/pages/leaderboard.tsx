import { useCallback, useEffect, useState } from "react";
import { BloomMark } from "@/components/brand/BloomMark";
import Link from "next/link";
import { motion } from "framer-motion";
import { EyeOff, Loader2, Share2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { RiskNote } from "@/components/RiskNote";
import { useShareAchievement } from "@/components/ShareAchievement";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { money, practiceFetch } from "@/lib/practice/api";
import { cn } from "@/lib/utils";

type Tab = "learning" | "practice";

interface BoardRow {
  id: string;
  name: string;
  rank: number;
  value: number;
  process?: number;
}

interface Board {
  rows: BoardRow[];
  me: BoardRow | null;
  hidden: boolean;
  gap: number | null;
}

const EMPTY_BOARD: Board = { rows: [], me: null, hidden: false, gap: null };

interface LearningRow {
  user_id: string;
  challenge_name: string;
  rank: number;
  gems: number;
}

interface PracticeRow {
  user_id: string;
  display_name: string;
  rank: number;
  total_pnl: number;
  avg_process?: number;
}

interface View<T> {
  top: T[];
  me: T | null;
  hidden?: boolean;
  gap_to_next?: number | null;
}

const fromLearning = (row: LearningRow): BoardRow => ({ id: row.user_id, name: row.challenge_name, rank: row.rank, value: row.gems });
const fromPractice = (row: PracticeRow): BoardRow => ({ id: row.user_id, name: row.display_name, rank: row.rank, value: row.total_pnl, process: row.avg_process });

function toBoard<T>(view: View<T>, convert: (row: T) => BoardRow): Board {
  return {
    rows: (view.top ?? []).map(convert),
    me: view.me ? convert(view.me) : null,
    hidden: view.hidden === true,
    gap: view.gap_to_next ?? null,
  };
}

const signedMoney = (value: number) => `${value >= 0 ? "+" : "-"}${money(Math.abs(value))}`;

function BoardRows({ board, tab, userId }: { board: Board; tab: Tab; userId: string | null }) {
  const format = (value: number) => (tab === "learning" ? `${value} points` : signedMoney(value));

  if (board.rows.length === 0) {
    return (
      <div className="rounded-3xl bg-card p-6 text-center shadow-[var(--bloom-shadow)]">
        <div className="mx-auto w-fit"><BloomMark size={56} /></div>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Be the first to bloom here</h2>
        <p className="mt-1 text-base text-muted-foreground">
          {tab === "learning" ? "Finish a lesson and you'll appear on this board." : "Close a practice trade and you'll appear on this board."}
        </p>
        <Link
          href={tab === "learning" ? "/lessons" : "/practice"}
          className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground"
        >
          {tab === "learning" ? "Go to lessons" : "Go to Practice"}
        </Link>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-3xl bg-card px-4 shadow-[var(--bloom-shadow)]">
      {board.rows.map((row) => (
        <li key={row.id} className={cn("flex items-center gap-3 py-3", row.id === userId && "font-semibold")}>
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold",
              row.rank <= 3 ? "bg-[var(--bloom-gold)] text-[var(--bloom-ink)]" : "bg-secondary text-foreground",
            )}
          >
            {row.rank}
          </span>
          <span className="min-w-0 flex-1 truncate text-foreground">
            {row.name}
            {row.id === userId && <span className="ml-1 text-sm font-normal text-muted-foreground">(you)</span>}
          </span>
          <span className="shrink-0 text-right">
            <span className={cn("block font-medium", tab === "practice" && row.value < 0 ? "text-[var(--bloom-blush)]" : "text-primary")}>{format(row.value)}</span>
            {tab === "practice" && row.process !== undefined && <span className="block text-xs text-muted-foreground">Process {row.process}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function LeaderboardPage() {
  const { isLoggedIn, isLoading: authLoading, userId } = useSubscription();
  const { share, ShareModal } = useShareAchievement();
  const [tab, setTab] = useState<Tab>("learning");
  const [learning, setLearning] = useState<Board>(EMPTY_BOARD);
  const [practice, setPractice] = useState<Board>(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    const [learningRes, practiceRes] = await Promise.all([
      practiceFetch<View<LearningRow>>("/api/gems/leaderboard"),
      practiceFetch<View<PracticeRow>>("/api/practice/leaderboard"),
    ]);
    if (learningRes.ok) setLearning(toBoard(learningRes.data, fromLearning));
    if (practiceRes.ok) setPractice(toBoard(practiceRes.data, fromPractice));
    setFailed(!learningRes.ok || !practiceRes.ok);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) load();
    else if (!authLoading) setLoading(false);
  }, [authLoading, isLoggedIn, load]);

  const board = tab === "learning" ? learning : practice;
  const me = board.me;

  const shareMyPlace = () => {
    if (!me) return;
    share({
      type: "leaderboard",
      title: `Number ${me.rank} on Bloom`,
      subtitle: tab === "learning" ? "Learning gold, one lesson at a time" : "Practising with simulated money",
      emoji: "🌸",
      stats: [
        { label: "Place", value: `${me.rank}` },
        tab === "learning" ? { label: "Points", value: `${me.value}` } : { label: "Simulated gains", value: signedMoney(me.value) },
      ],
    });
  };

  return (
    <>
      <SEO title="Leaderboard - Bloom" description="See who's learning and practising alongside you on Bloom." />
      <Layout>
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
          <header className="relative overflow-hidden rounded-3xl bg-secondary p-6">
            <h1 className="max-w-[80%] text-3xl font-semibold leading-tight text-foreground">Growing together</h1>
            <p className="mt-2 max-w-[85%] text-base text-muted-foreground">Every lesson and every practice trade counts. Cheer each other on.</p>
          </header>

          {!authLoading && !isLoggedIn ? (
            <div className="rounded-3xl bg-card p-6 text-center shadow-[var(--bloom-shadow)]">
              <h2 className="text-xl font-semibold text-foreground">Join us on the leaderboards</h2>
              <p className="mt-1 text-base text-muted-foreground">Start free and your first lesson puts you on the board.</p>
              <Link href="/onboarding" className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground">
                Start free
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1" role="tablist" aria-label="Leaderboards">
                {(
                  [
                    ["learning", "Learning"],
                    ["practice", "Practice gains (stocks)"],
                  ] as const
                ).map(([value, label]) => (
                  <motion.button
                    key={value}
                    whileTap={{ scale: 0.97 }}
                    role="tab"
                    aria-selected={tab === value}
                    onClick={() => setTab(value)}
                    className={cn("h-11 rounded-full text-sm font-semibold", tab === value ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {tab === "learning" ? "Earn points by finishing lessons." : "Simulated money, real practice. Ranked by results from closed stock trades, with each member's average process score."}
              </p>

              {failed && (
                <div role="alert" className="rounded-2xl bg-accent/70 p-4 text-base text-foreground">
                  We couldn&apos;t load everything just now.{" "}
                  <button onClick={load} className="font-semibold underline underline-offset-2">
                    Try again
                  </button>
                </div>
              )}

              {loading ? (
                <div className="flex min-h-[30vh] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
                </div>
              ) : (
                <>
                  {me && (
                    <section className="flex items-center justify-between gap-3 rounded-3xl bg-accent/60 p-5">
                      <div>
                        {board.hidden ? (
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <EyeOff className="h-4 w-4" /> Only you can see this.
                          </p>
                        ) : (
                          <p className="font-serif text-2xl font-semibold text-foreground">You&apos;re number {me.rank}</p>
                        )}
                        <p className="text-base text-foreground">{tab === "learning" ? `${me.value} points` : `${signedMoney(me.value)} simulated`}</p>
                        {board.gap != null && !board.hidden && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {tab === "learning" ? `${board.gap} more points to reach the next place.` : `${money(board.gap)} of simulated gains to reach the next place.`}
                          </p>
                        )}
                        {board.gap == null && !board.hidden && <p className="mt-1 text-sm text-muted-foreground">You&apos;re at the top. How lovely.</p>}
                      </div>
                      {!board.hidden && (
                        <button
                          onClick={shareMyPlace}
                          aria-label="Share my place"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      )}
                    </section>
                  )}
                  <BoardRows board={board} tab={tab} userId={userId} />
                </>
              )}

              <p className="text-center text-sm text-muted-foreground">
                Prefer to keep things private? You can hide yourself in your{" "}
                <Link href="/profile" className="underline underline-offset-2">profile</Link>.
              </p>
            </>
          )}

          <RiskNote />
        </div>
        {ShareModal}
      </Layout>
    </>
  );
}
