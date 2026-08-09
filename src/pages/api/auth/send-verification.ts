import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user?.email) return res.status(401).json({ error: "Unauthorized" });

  const code = String(Math.floor(100000 + Math.random() * 900000));

  await supabaseAdmin
    .from("profiles")
    .update({ verification_code: code, verification_sent_at: new Date().toISOString() })
    .eq("id", user.id);

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "there";

  await resend.emails.send({
    from: "Bloom <hello@shebloomswealth.app>",
    to: user.email,
    subject: "Your Bloom verification code",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#e2e8f0;background:#0E1B30;border-radius:12px">
        <h1 style="color:#27B7C8;font-size:24px;margin:0 0 16px">Hey ${firstName}!</h1>
        <p style="line-height:1.6;margin:0 0 16px">Here's your verification code:</p>
        <div style="background:rgba(39,183,200,0.1);border:1px solid rgba(39,183,200,0.3);border-radius:12px;padding:20px;text-align:center;margin:0 0 24px">
          <p style="margin:0;font-size:36px;font-weight:700;color:#27B7C8;letter-spacing:8px">${code}</p>
        </div>
        <p style="line-height:1.6;margin:0 0 16px">Enter this code in the app to verify your email. It expires in 10 minutes.</p>
        <p style="margin:0;font-size:13px;color:#94a3b8">If you didn't sign up for Bloom, you can ignore this email.</p>
      </div>
    `,
  });

  return res.status(200).json({ sent: true });
}
