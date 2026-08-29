import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUser(req: NextApiRequest) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const { data } = await supabaseAdmin.auth.getUser(token);
  return data.user;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const { data } = await supabaseAdmin
      .from("late_bloomers")
      .select("id, active, signup_date")
      .eq("user_id", user.id)
      .single();

    return res.status(200).json({ subscribed: !!data, active: data?.active ?? false });
  }

  if (req.method === "POST") {
    const { data: existing } = await supabaseAdmin
      .from("late_bloomers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return res.status(200).json({ subscribed: true, already: true });
    }

    const { error } = await supabaseAdmin.from("late_bloomers").insert({
      user_id: user.id,
      email: user.email,
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ subscribed: true });
  }

  if (req.method === "DELETE") {
    await supabaseAdmin
      .from("late_bloomers")
      .update({ active: false })
      .eq("user_id", user.id);

    return res.status(200).json({ subscribed: false });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
