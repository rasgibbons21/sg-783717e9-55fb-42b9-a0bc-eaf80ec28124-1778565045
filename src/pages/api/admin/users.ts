import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireAdminUser, sendAuthError } from "@/lib/requireProUser";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireAdminUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let publicUsers: any[] = [];
    const { data: uData, error: uError } = await supabaseAdmin.from("users").select("*");

    if (uError) {
      const { data: pData, error: pError } = await supabaseAdmin.from("profiles").select("id, full_name, risk_tolerance, experience_level, created_at, join_date, is_pro, subscription_status");
      if (!pError && pData) publicUsers = pData;
    } else if (uData) {
      publicUsers = uData;
    }

    const users = authData.users.map(au => {
      const pub = publicUsers.find(u => u.id === au.id) || {};
      const isPro = pub.is_pro === true || pub.subscription_status === "active";
      return {
        id: au.id,
        email: au.email || "",
        full_name: pub.full_name || au.user_metadata?.full_name || "",
        risk_tolerance: pub.risk_tolerance || "",
        onboarding_complete: !!pub.experience_level,
        is_pro: isPro,
        subscription_status: pub.subscription_status || null,
        created_at: au.created_at || pub.created_at || pub.join_date || new Date().toISOString(),
        last_sign_in: au.last_sign_in_at || null,
        email_confirmed: !!au.email_confirmed_at
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalSignups = users.length;
    const completedOnboarding = users.filter(u => u.onboarding_complete).length;
    const stuckOnOnboarding = totalSignups - completedOnboarding;
    const stuckUsers = users.filter(u => !u.onboarding_complete);

    const health = {
      anthropic: !!(process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY),
      apiKeys: {
        finnhub: !!process.env.FINNHUB_API_KEY,
        fmp: !!process.env.FMP_API_KEY
      }
    };

    return res.status(200).json({
      users,
      onboarding: { totalSignups, completedOnboarding, stuckOnOnboarding, stuckUsers },
      health
    });
  } catch (error: unknown) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
}