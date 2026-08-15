import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Trophy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_pnl: number;
  total_trades: number;
  win_rate: number;
  rank: number;
}

export const LeaderboardMini = ({ userId }: { userId?: string | null }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/practice/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      const top: LeaderboardEntry[] = data.top ?? [];
      setEntries(top.slice(0, 3));
      setUserRank(data.me ?? null);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const C = {
    accent: "#27B7C8",
    accentDim: "rgba(39, 183, 200, 0.12)",
    green: "#49B06E",
    red: "#E5484D",
    text: "#F4F7FA",
    textDim: "rgba(244, 247, 250, 0.6)",
    textMuted: "rgba(244, 247, 250, 0.35)",
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, #0E1B30, #162540)",
        border: "1px solid rgba(39, 183, 200, 0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5" style={{ color: "#facc15" }} />
        <h3 className="text-sm font-bold" style={{ color: C.text }}>
          This Week&apos;s Top Traders
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.accent }} />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs py-3 text-center" style={{ color: C.textMuted }}>
          Close trades to climb the leaderboard
        </p>
      ) : (
        <div className="space-y-2 mb-3">
          {entries.map((e) => {
            const medal = e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : "🥉";
            const isMe = userId === e.user_id;
            return (
              <div
                key={e.user_id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{ background: isMe ? C.accentDim : "transparent" }}
              >
                <span className="text-sm">{medal}</span>
                <span
                  className="text-xs flex-1 truncate"
                  style={{ color: isMe ? C.accent : C.textDim }}
                >
                  {e.display_name}
                </span>
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: e.total_pnl >= 0 ? C.green : C.red }}
                >
                  {e.total_pnl >= 0 ? "+" : ""}${Math.abs(e.total_pnl).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {userRank && !entries.find((e) => e.user_id === userRank.user_id) && (
        <div
          className="mt-2 pt-2 px-2 py-1.5 rounded-lg text-sm font-bold"
          style={{
            borderTop: `1px solid rgba(39, 183, 200, 0.15)`,
            background: C.accentDim,
            color: C.accent,
          }}
        >
          You&apos;re #{userRank.rank} &middot; +
          {userRank.total_pnl >= 0 ? "" : "-"}${Math.abs(userRank.total_pnl).toFixed(2)}
        </div>
      )}

      <Link
        href="/leaderboard"
        className="text-xs underline mt-3 inline-block transition-colors hover:brightness-125"
        style={{ color: C.accent }}
      >
        See full leaderboard →
      </Link>
    </div>
  );
};
