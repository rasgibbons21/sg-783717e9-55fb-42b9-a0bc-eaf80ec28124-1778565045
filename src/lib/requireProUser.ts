import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Service-role client — only used server-side to verify tokens and read profiles.
// Never exposed to the browser.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

type AuthResult =
  | { user: { id: string; email?: string }; error?: never }
  | { error: 401 | 403; user?: never };

function extractToken(req: NextApiRequest): string | null {
  const auth = req.headers.authorization;
  return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
}

/**
 * Verifies the Bearer token and confirms the user has an active Pro subscription.
 * Returns the verified user, or 401 (unauthenticated) / 403 (not Pro).
 */
export async function requireProUser(req: NextApiRequest): Promise<AuthResult> {
  const token = extractToken(req);
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
 * Verifies the Bearer token — requires a valid session, no Pro check.
 * Returns the verified user, or 401 if unauthenticated.
 */
export async function requireLoggedInUser(req: NextApiRequest): Promise<AuthResult> {
  const token = extractToken(req);
  if (!token) return { error: 401 };

  const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !user) return { error: 401 };

  return { user };
}

/**
 * Verifies the Bearer token, then checks the user's ID against the
 * ADMIN_USER_IDS env var (comma-separated Supabase user UUIDs).
 * Returns the verified user, or 401 (unauthenticated) / 403 (not admin).
 */
export async function requireAdminUser(req: NextApiRequest): Promise<AuthResult> {
  const token = extractToken(req);
  if (!token) return { error: 401 };

  const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !user) return { error: 401 };

  const allowlist = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!allowlist.includes(user.id)) return { error: 403 };

  return { user };
}

export function sendAuthError(res: NextApiResponse, status: 401 | 403) {
  const message =
    status === 401 ? "Authentication required" : "Access denied";
  return res.status(status).json({ error: message });
}

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (resets on cold start / serverless restarts).
// Good enough to stop bots burning the Anthropic bill on free-tier routes;
// use a Redis-backed solution if you need cross-instance or persistent limits.
// ---------------------------------------------------------------------------

interface RateWindow {
  count: number;
  resetAt: number; // Unix ms
}

const rateLimitStore = new Map<string, RateWindow>();

/**
 * Allows up to `max` calls per `windowMs` per user ID.
 * Returns true if the request should be blocked (limit exceeded).
 */
export function isRateLimited(
  userId: string,
  key: string,
  max: number,
  windowMs: number
): boolean {
  const storeKey = `${key}:${userId}`;
  const now = Date.now();
  const window = rateLimitStore.get(storeKey);

  if (!window || now > window.resetAt) {
    rateLimitStore.set(storeKey, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (window.count >= max) return true;

  window.count += 1;
  return false;
}
