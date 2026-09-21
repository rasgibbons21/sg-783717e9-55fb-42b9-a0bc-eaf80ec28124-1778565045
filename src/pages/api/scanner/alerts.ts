import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(200).json({ alerts: [], timestamp: Date.now() });
  }

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const limit = Math.min(Number(req.query.limit) || 20, 50);

  try {
    const { data, error } = await sb
      .from("scanner_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Alerts fetch error:", error.message);
      return res.status(200).json({ alerts: [], timestamp: Date.now(), error: error.message });
    }

    return res.status(200).json({ alerts: data ?? [], timestamp: Date.now() });
  } catch (err: any) {
    return res.status(200).json({ alerts: [], timestamp: Date.now(), error: err?.message });
  }
}
