import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch all users
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from("users")
      .select("*")
      .order("join_date", { ascending: false });

    if (usersError) throw usersError;

    // Fetch broker clicks
    const { data: clicksData, error: clicksError } = await supabaseAdmin
      .from("broker_clicks")
      .select("*");

    if (clicksError) throw clicksError;

    // Fetch active subscriptions
    const { data: subsData, error: subsError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("status", "active");

    if (subsError) throw subsError;

    // Calculate stats
    const proCount = usersData?.filter(u => u.plan_type === "pro").length || 0;
    const monthlyRevenue = proCount * 7.99;
    const yearlyRevenue = (subsData?.filter(s => s.plan === "yearly").length || 0) * 57.99;
    const totalRevenue = monthlyRevenue + yearlyRevenue;

    const stats = {
      totalUsers: usersData?.length || 0,
      proSubscribers: proCount,
      monthlyRevenue: totalRevenue,
      brokerClicks: clicksData?.length || 0,
    };

    return res.status(200).json({
      stats,
      users: usersData || [],
      brokerClicks: clicksData || [],
    });
  } catch (error: unknown) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ error: (error as Error).message || "Failed to fetch admin data" });
  }
}