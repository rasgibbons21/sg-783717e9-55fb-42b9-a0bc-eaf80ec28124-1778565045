import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

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

  try {
    // 1. Fetch all Supabase Auth Users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // 2. Fetch Public Users (Try 'users' then 'profiles')
    // We use any[] type to handle dynamic database schema checking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let publicUsers: any[] = [];
    const { data: uData, error: uError } = await supabaseAdmin.from("users").select("*");
    
    if (uError) {
      const { data: pData, error: pError } = await supabaseAdmin.from("profiles").select("*");
      if (!pError && pData) publicUsers = pData;
    } else if (uData) {
      publicUsers = uData;
    }

    // 3. Map all auth users to their public profiles
    const users = authData.users.map(au => {
      const pub = publicUsers.find(u => u.id === au.id) || {};
      return {
        id: au.id,
        email: au.email || "",
        full_name: pub.full_name || au.user_metadata?.full_name || "",
        risk_tolerance: pub.risk_tolerance || "",
        onboarding_complete: !!pub.experience_level,
        created_at: au.created_at || pub.created_at || pub.join_date || new Date().toISOString(),
        last_sign_in: au.last_sign_in_at || null,
        email_confirmed: !!au.email_confirmed_at
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 4. Calculate Stats
    const totalSignups = users.length;
    const completedOnboarding = users.filter(u => u.onboarding_complete).length;
    const stuckOnOnboarding = totalSignups - completedOnboarding;
    const stuckUsers = users.filter(u => !u.onboarding_complete);

    // 5. App Health
    const health = {
      anthropic: !!(process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY),
      finnhub: !!process.env.NEXT_PUBLIC_FINNHUB_API_KEY,
      fmp: !!process.env.NEXT_PUBLIC_FMP_API_KEY
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