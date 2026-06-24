import type { NextApiRequest, NextApiResponse } from "next";
import { requireProUser } from "@/lib/requireProUser";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = await requireProUser(req);
  if (auth.error) return res.status(auth.error).json({ error: "Unauthorized" });
  const userId = auth.user!.id;

  const { trade_id, stop_price, target_price, note } = req.body;
  if (!trade_id) return res.status(400).json({ error: "trade_id required" });

  // Verify the trade belongs to this user and is open
  const { data: trade, error: fetchErr } = await supabaseAdmin
    .from("practice_trades")
    .select("id, thesis, stop_price, target_price, status")
    .eq("id", trade_id)
    .eq("user_id", userId)
    .eq("status", "open")
    .single();

  if (fetchErr || !trade) return res.status(404).json({ error: "Open trade not found" });

  const patch: Record<string, unknown> = {};
  if (stop_price !== undefined) patch.stop_price = stop_price === null ? null : Number(stop_price);
  if (target_price !== undefined) patch.target_price = target_price === null ? null : Number(target_price);
  if (note) {
    const ts = new Date().toISOString().slice(0, 16).replace("T", " ");
    const existing = trade.thesis ?? "";
    patch.thesis = existing ? `${existing}\n[${ts}] ${note}` : `[${ts}] ${note}`;
  }

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("practice_trades")
    .update(patch)
    .eq("id", trade_id)
    .select()
    .single();

  if (updateErr) return res.status(500).json({ error: updateErr.message });
  return res.status(200).json({ trade: updated });
}
