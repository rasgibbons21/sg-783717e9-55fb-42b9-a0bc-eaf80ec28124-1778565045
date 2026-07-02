import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  user_id: string;
  challenge_name: string;
  gems: number;
  universityLessons: number;
  learnLessons: number;
  rank: number;
}

interface View {
  top: Row[];
  me: Row | null;
}

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function RankRow({ row, isMe }: { row: Row; isMe: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
        isMe ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
      }`}
    >
      <span className="w-7 text-center text-sm font-semibold text-muted-foreground">
        {MEDALS[row.rank] ?? row.rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {row.challenge_name}
          {isMe && <span className="ml-1.5 text-xs text-primary">(you)</span>}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.universityLessons + row.learnLessons} lesson
          {row.universityLessons + row.learnLessons === 1 ? "" : "s"} completed
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm leading-none">💎</span>
        <span className="text-sm font-bold text-foreground">{row.gems.toLocaleString()}</span>
      </div>
    </div>
  );
}

export function GemsLeaderboard() {
  const [view, setView] = useState<View | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      try {
        const res = await fetch("/api/gems/leaderboard", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) setView(await res.json());
      } catch {
        /* leave view null → card hides */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Hide entirely until we have a board with at least one ranked learner.
  if (loading || !view || view.top.length === 0) return null;

  const meInTop = view.me ? view.top.some((r) => r.user_id === view.me!.user_id) : false;

  return (
    <Card className="p-6 bg-card border-border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif font-bold text-foreground text-lg">🏆 Lessons Leaderboard</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Top learners by gems earned — complete lessons to climb.
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {view.top.map((row) => (
          <RankRow key={row.user_id} row={row} isMe={view.me?.user_id === row.user_id} />
        ))}

        {/* Viewer outside the top 10 — show their standing below a divider */}
        {view.me && !meInTop && (
          <>
            <div className="my-1 text-center text-xs text-muted-foreground">···</div>
            <RankRow row={view.me} isMe />
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Set your leaderboard name on your{" "}
        <a href="/profile" className="text-primary hover:underline">profile</a>.
      </p>
    </Card>
  );
}
