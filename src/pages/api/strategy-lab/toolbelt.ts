import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user!.id;

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("strategy_toolbelt")
      .select("strategy_slug, personal_notes, biggest_mistake, added_at")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ toolbelt: data ?? [] });
  }

  if (req.method === "POST") {
    const { strategySlug, action, personalNotes, biggestMistake } = req.body as {
      strategySlug?: string;
      action?: "add" | "remove" | "update";
      personalNotes?: string;
      biggestMistake?: string;
    };

    if (!strategySlug || !action) {
      return res.status(400).json({ error: "strategySlug and action required" });
    }

    if (action === "add" || action === "update") {
      const { error } = await supabaseAdmin
        .from("strategy_toolbelt")
        .upsert(
          {
            user_id: userId,
            strategy_slug: strategySlug,
            personal_notes: personalNotes ?? null,
            biggest_mistake: biggestMistake ?? null,
            added_at: new Date().toISOString(),
          },
          { onConflict: "user_id,strategy_slug" }
        );

      if (error) {
        console.error("toolbelt upsert error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ ok: true, action });
    }

    if (action === "remove") {
      const { error } = await supabaseAdmin
        .from("strategy_toolbelt")
        .delete()
        .eq("user_id", userId)
        .eq("strategy_slug", strategySlug);

      if (error) {
        console.error("toolbelt delete error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ ok: true, action });
    }

    return res.status(400).json({ error: "action must be add, update, or remove" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
