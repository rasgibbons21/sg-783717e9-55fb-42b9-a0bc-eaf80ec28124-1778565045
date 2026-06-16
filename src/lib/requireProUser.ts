import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Service-role client — only used server-side to verify tokens and read profiles.
// Never exposed to the browser.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

type ProResult =
  | { user: { id: string; email?: string }; error?: never }
  | { error: 401 | 403; user?: never };

/**
 * Verifies the Bearer token from the Authorization header and confirms
 * the user has an active Pro subscription before letting the route proceed.
 * Returns the verified user, or an error status (401 = unauthenticated, 403 = not Pro).
 */
export async function requireProUser(req: NextApiRequest): Promise<ProResult> {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { error: 401 };

  const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !user) return { error: 401 };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_pro, subscription_status")
    .eq("id", user.id)
    .single();

  const isPro = profile?.is_pro === true || profile?.subscription_status === "active";
  if (!isPro) return { error: 403 };

  return { user };
}

/**
 * Verifies the Bearer token from the Authorization header.
 * Only requires a valid logged-in session — does NOT check Pro status.
 * Returns the verified user, or 401 if unauthenticated.
 */
export async function requireLoggedInUser(req: NextApiRequest): Promise<ProResult> {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { error: 401 };

  const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !user) return { error: 401 };

  return { user };
}

export function sendAuthError(res: NextApiResponse, status: 401 | 403) {
  const message = status === 401
    ? "Authentication required"
    : "Bloom Pro subscription required";
  return res.status(status).json({ error: message });
}
