import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, planType } = req.body;

  if (!userId || !planType) {
    return res.status(400).json({ error: "Missing userId or planType" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ risk_tolerance: planType })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, user: data });
  } catch (error: unknown) {
    console.error("Error updating user plan:", error);
    return res.status(500).json({ error: (error as Error).message || "Failed to update user plan" });
  }
}