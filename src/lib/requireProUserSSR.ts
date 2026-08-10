/**
 * Server-side Pro verification for getServerSideProps.
 *
 * Architecture note: The Bloom client uses Supabase with localStorage session
 * storage (storageKey: 'bloom-auth-token', flowType: 'pkce'). This means the
 * access token is NOT automatically available in request cookies, so pure SSR
 * auth is not possible without migrating to cookie-based session storage
 * (e.g. @supabase/auth-helpers-nextjs). Until that migration happens, this
 * helper implements best-effort SSR gating:
 *
 *   1. Attempt to read the Supabase session from cookies that the PKCE
 *      callback may have set (sb-<ref>-auth-token).
 *   2. If a verifiable Pro session is found → allow server-side rendering
 *      with full data.
 *   3. If no cookie session → return { requiresClientAuth: true }. The page
 *      renders a loading skeleton and immediately performs a client-side Pro
 *      check via the Bearer-gated API routes. Content is never rendered
 *      client-side without a successful Pro API call.
 *
 * All API routes (progress, quiz, bookmark) are Bearer-gated with the
 * existing requireProUser() and are the authoritative content gate.
 */

import { createClient } from "@supabase/supabase-js";
import type { IncomingMessage } from "http";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SUPABASE_COOKIE = "sb-sbzwaiyxmnnzcenhgunr-auth-token";

function parseSupabaseCookie(cookieStr: string | undefined): string | null {
  if (!cookieStr) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(cookieStr));
    // Supabase auth cookie stores { access_token, refresh_token, ... }
    return typeof parsed?.access_token === "string" ? parsed.access_token : null;
  } catch {
    return null;
  }
}

function extractCookies(req: IncomingMessage): Record<string, string> {
  const raw = req.headers.cookie ?? "";
  return Object.fromEntries(
    raw.split(";").map((s) => {
      const [k, ...v] = s.trim().split("=");
      return [k.trim(), v.join("=")];
    })
  );
}

export type SSRProResult =
  | { status: "ok";               userId: string }
  | { status: "not-pro" }
  | { status: "unauthenticated" }
  | { status: "no-cookie" };      // client must verify

export async function requireProUserSSR(
  req: IncomingMessage
): Promise<SSRProResult> {
  const cookies = extractCookies(req);
  const token   = parseSupabaseCookie(cookies[SUPABASE_COOKIE]);

  if (!token) return { status: "no-cookie" };

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { status: "unauthenticated" };

  // All content is free — skip Pro check, just require valid login
  return { status: "ok", userId: user.id };
}
