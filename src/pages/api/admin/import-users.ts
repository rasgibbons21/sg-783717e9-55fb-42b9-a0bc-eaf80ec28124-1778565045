import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireAdminUser, sendAuthError } from "@/lib/requireProUser";
import { sendWelcomeEmail } from "@/lib/resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

interface ImportUser {
  email: string;
  name?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireAdminUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const { users, sendWelcome = false } = req.body as {
    users: ImportUser[];
    sendWelcome?: boolean;
  };

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: "Provide a non-empty users array" });
  }

  if (users.length > 100) {
    return res.status(400).json({ error: "Max 100 users per batch" });
  }

  const results: { email: string; status: string; error?: string }[] = [];

  for (const u of users) {
    const email = u.email?.trim().toLowerCase();
    if (!email) {
      results.push({ email: u.email || "", status: "skipped", error: "Invalid email" });
      continue;
    }

    try {
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const alreadyExists = (existing?.users ?? []).some(
        (eu: { email?: string }) => eu.email?.toLowerCase() === email
      );

      if (alreadyExists) {
        results.push({ email, status: "exists" });
        continue;
      }

      const tempPassword = crypto.randomUUID();
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: u.name || "" },
      });

      if (createErr) {
        results.push({ email, status: "error", error: createErr.message });
        continue;
      }

      if (sendWelcome && created.user) {
        try {
          await sendWelcomeEmail(email, u.name || "");
        } catch {
          // User created but email failed — still a success
        }
      }

      results.push({ email, status: "created" });
    } catch (err) {
      results.push({ email, status: "error", error: (err as Error).message });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  const existed = results.filter((r) => r.status === "exists").length;
  const errors = results.filter((r) => r.status === "error").length;

  return res.status(200).json({
    summary: { total: users.length, created, existed, errors },
    results,
  });
}
