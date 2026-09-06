import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { AdMobBanner } from "@/components/AdMobBanner";
import { Trophy, Loader2, ArrowLeft, Share2 } from "lucide-react";
import { useShareAchievement } from "@/components/ShareAchievement";

interface LeaderboardRow {
  user_id: string;
  display_name: string;
  total_pnl: number;
  total_trades: number;
  win_rate: number;
  rank: number;
}

const C = {
  bg: "#0E1B30",
  card: "#162540",
  cardBorder: "rgba(39, 183, 200, 0.15)",
  accent: "#27B7C8",
  accentDim: "rgba(39, 183, 200, 0.12)",
  text: "#F4F7FA",
  textDim: "rgba(244, 247, 250, 0.6)",
  textMuted: "rgba(244, 247, 250, 0.35)",
  green: "#49B06E",
  red: "#E5484D",
};

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export default function LeaderboardPage() {
  const { isPro, isLoggedIn, isLoading: authLoading, userId } = useSubscription();
  const [top, setTop] = useState<LeaderboardRow[]>([]);
  const [me, setMe] = useState<LeaderboardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const { share, ShareModal } = useShareAchievement();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch("/api/practice/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setTop(data.top ?? []);
      setMe(data.me ?? null);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isLoggedIn) fetchLeaderboard();
    else if (!authLoading) setLoading(false);
  }, [authLoading, isLoggedIn, fetchLeaderboard]);

  const showAds = !isPro;

  return (
    <>
      <Head>
        <title>Leaderboard | She Blooms Wealth</title>
      </Head>
      <Layout>
        <div className="min-h-screen" style={{ background: C.bg }}>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <Link
              href="/practice"
              className="inline-flex items-center gap-1.5 text-xs mb-4 transition-colors hover:brightness-125"
              style={{ color: C.accent }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Practice Trader
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: C.accentDim }}
              >
                <Trophy className="w-5 h-5" style={{ color: C.accent }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: C.text }}>
                  Trading Leaderboard
                </h1>
                <p className="text-xs" style={{ color: C.textDim }}>
                  Ranked by total P&L from closed trades
                </p>
              </div>
            </div>

            {showAds && (
              <div className="mb-4">
                <AdMobBanner format="banner" />
              </div>
            )}

            {(authLoading || loading) && (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: C.accent }} />
              </div>
            )}

            {!authLoading && !isLoggedIn && (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-sm mb-4" style={{ color: C.textDim }}>
                  Sign in to view the leaderboard
                </p>
                <Link
                  href="/auth"
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
                  style={{ background: C.accent, color: C.bg }}
                >
                  Sign In
                </Link>
              </div>
            )}

            {!authLoading && !loading && isLoggedIn && top.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: C.accentDim }}
                >
                  <Trophy className="w-6 h-6" style={{ color: C.accent }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: C.textDim }}>
                  No traders yet
                </p>
                <p className="text-xs max-w-[220px]" style={{ color: C.textMuted }}>
                  Close your first trade to appear on the leaderboard
                </p>
              </div>
            )}

            {!authLoading && !loading && isLoggedIn && top.length > 0 && (
              <div className="space-y-2">
                {top.map((row) => {
                  const isMe = userId === row.user_id;
                  const medal =
                    row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : null;
                  return (
                    <div
                      key={row.user_id}
                      className="flex items-center gap-3 p-3.5 rounded-xl transition-colors"
                      style={{
                        background: isMe ? "rgba(39,183,200,0.08)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isMe ? "rgba(39,183,200,0.3)" : C.cardBorder}`,
                      }}
                    >
                      <span
                        className="w-8 text-center text-sm font-bold"
                        style={{ color: C.textDim }}
                      >
                        {medal ?? `#${row.rank}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: isMe ? C.accent : C.text }}
                        >
                          {row.display_name}
                          {isMe && " (you)"}
                        </p>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>
                          {row.total_trades} trades &middot; {row.win_rate}% win rate
                        </p>
                      </div>
                      <span
                        className="text-sm font-mono font-bold"
                        style={{ color: row.total_pnl >= 0 ? C.green : C.red }}
                      >
                        {row.total_pnl >= 0 ? "+" : ""}$
                        {Math.abs(row.total_pnl).toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {me && !top.find((r) => r.user_id === me.user_id) && (
                  <>
                    <div className="flex items-center gap-2 py-2">
                      <div className="flex-1 border-t" style={{ borderColor: C.cardBorder }} />
                      <span className="text-[10px]" style={{ color: C.textMuted }}>
                        Your rank
                      </span>
                      <div className="flex-1 border-t" style={{ borderColor: C.cardBorder }} />
                    </div>
                    <div
                      className="flex items-center gap-3 p-3.5 rounded-xl"
                      style={{
                        background: "rgba(39,183,200,0.08)",
                        border: "1px solid rgba(39,183,200,0.3)",
                      }}
                    >
                      <span
                        className="w-8 text-center text-sm font-bold"
                        style={{ color: C.textDim }}
                      >
                        #{me.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: C.accent }}
                        >
                          {me.display_name} (you)
                        </p>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>
                          {me.total_trades} trades &middot; {me.win_rate}% win rate
                        </p>
                      </div>
                      <span
                        className="text-sm font-mono font-bold"
                        style={{ color: me.total_pnl >= 0 ? C.green : C.red }}
                      >
                        {me.total_pnl >= 0 ? "+" : ""}$
                        {Math.abs(me.total_pnl).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {showAds && (
              <div className="mt-6">
                <AdMobBanner format="rectangle" />
              </div>
            )}

            {!authLoading && !loading && isLoggedIn && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={fetchLeaderboard}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors"
                  style={{
                    color: C.textDim,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${C.cardBorder}`,
                  }}
                >
                  Refresh
                </button>
                {me && (
                  <button
                    onClick={() => share({
                      type: 'leaderboard',
                      title: `#${me.rank} on Bloom`,
                      subtitle: `${me.total_trades} trades · ${me.win_rate}% win rate`,
                      emoji: me.rank === 1 ? '🥇' : me.rank === 2 ? '🥈' : me.rank === 3 ? '🥉' : '🏆',
                      stats: [
                        { label: 'Rank', value: `#${me.rank}` },
                        { label: 'P&L', value: `${me.total_pnl >= 0 ? '+' : ''}$${Math.abs(me.total_pnl).toFixed(2)}` },
                        { label: 'Win Rate', value: `${me.win_rate}%` },
                      ],
                      accentColor: '#D4AF37',
                    })}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                    style={{
                      color: C.accent,
                      background: "rgba(39,183,200,0.08)",
                      border: `1px solid rgba(39,183,200,0.2)`,
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </button>
                )}
              </div>
            )}

            {ShareModal}

            <div className="mt-8 text-center">
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                Educational simulator — not a brokerage, not financial advice.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
