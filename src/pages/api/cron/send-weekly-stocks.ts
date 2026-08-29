import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { sendLateBloomersEmail } from "@/lib/resend";
import { generateWeeklyPicks } from "@/lib/pansyWeeklyAnalysis";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = { maxDuration: 60 };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekOf = weekStart.toISOString().split("T")[0];

    // Check if we already have picks for this week (manual or prior run)
    const { data: existing } = await supabaseAdmin
      .from("weekly_stocks")
      .select("symbol, price, why, entry_zone, risk, technical_brief, fundamental_brief, timeframe")
      .eq("week_of", weekOf);

    let stocks = existing;

    // If no picks exist yet, generate them with AI
    if (!stocks || stocks.length === 0) {
      console.log("No picks for this week — generating with Pansy AI...");
      const picks = await generateWeeklyPicks();

      for (const pick of picks) {
        await supabaseAdmin.from("weekly_stocks").insert({
          week_of: weekOf,
          symbol: pick.symbol,
          price: pick.price,
          why: pick.why,
          entry_zone: pick.entry_zone,
          risk: pick.risk,
          technical_brief: pick.technical_brief,
          fundamental_brief: pick.fundamental_brief,
          timeframe: pick.timeframe,
        });
      }

      stocks = picks;
      console.log(`Generated picks: ${picks.map((p) => p.symbol).join(", ")}`);
    }

    if (!stocks || stocks.length === 0) {
      return res.status(200).json({ sent: 0, reason: "No stocks available" });
    }

    const { data: subscribers } = await supabaseAdmin
      .from("late_bloomers")
      .select("email")
      .eq("active", true);

    if (!subscribers || subscribers.length === 0) {
      return res.status(200).json({
        sent: 0,
        reason: "No active subscribers",
        stocks: stocks.map((s: any) => s.symbol),
      });
    }

    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      try {
        await sendLateBloomersEmail(sub.email, stocks as any);
        sent++;
      } catch {
        failed++;
      }
    }

    return res.status(200).json({
      sent,
      failed,
      total: subscribers.length,
      stocks: stocks.map((s: any) => s.symbol),
    });
  } catch (err: any) {
    console.error("Weekly stocks cron error:", err);
    return res.status(500).json({ error: err.message || "Failed to send emails" });
  }
}
