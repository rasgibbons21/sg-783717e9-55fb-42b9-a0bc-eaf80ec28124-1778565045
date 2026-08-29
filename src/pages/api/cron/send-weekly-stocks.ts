import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { sendLateBloomersEmail } from "@/lib/resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekOf = weekStart.toISOString().split("T")[0];

    const { data: stocks } = await supabaseAdmin
      .from("weekly_stocks")
      .select("symbol, price, why, entry_zone, risk")
      .eq("week_of", weekOf);

    if (!stocks || stocks.length === 0) {
      return res.status(200).json({ sent: 0, reason: "No stocks for this week" });
    }

    const { data: subscribers } = await supabaseAdmin
      .from("late_bloomers")
      .select("email")
      .eq("active", true);

    if (!subscribers || subscribers.length === 0) {
      return res.status(200).json({ sent: 0, reason: "No active subscribers" });
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

    return res.status(200).json({ sent, failed, total: subscribers.length });
  } catch (err: any) {
    console.error("Weekly stocks cron error:", err);
    return res.status(500).json({ error: "Failed to send emails" });
  }
}
