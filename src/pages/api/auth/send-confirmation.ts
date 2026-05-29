import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, confirmationUrl, name } = req.body;

  if (!email || !confirmationUrl) {
    return res.status(400).json({ error: "Email and confirmation URL required" });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Pansy from Bloom <pansy@shebloomswealth.app>",
      to: email,
      subject: "Welcome to Bloom 🌸 Confirm your email",
      html: `
        <div style="background:#0a0a0f;color:#ffffff;font-family:Georgia,serif;padding:40px;max-width:600px;margin:0 auto;border-radius:12px;">
          <h1 style="color:#d4788a;font-size:32px;margin-bottom:8px;">Bloom 🌸</h1>
          <p style="color:#c8953a;font-size:12px;letter-spacing:3px;text-transform:uppercase;">She Blooms Wealth</p>
          <hr style="border:1px solid rgba(255,255,255,0.08);margin:24px 0;"/>
          <h2 style="color:#ffffff;font-size:22px;">Hey ${name || 'there'}, welcome! 💛</h2>
          <p style="color:rgba(255,255,255,0.7);font-size:16px;line-height:1.6;">
            I'm Pansy — your personal investing guide at Bloom. I'm so excited you're here!
            Click below to confirm your email and start your wealth building journey.
          </p>
          <a href="${confirmationUrl}" 
             style="display:inline-block;background:#3d7a54;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;margin:24px 0;">
            Confirm My Email 🌸
          </a>
          <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:24px;">
            If you didn't create a Bloom account you can safely ignore this email.
          </p>
          <hr style="border:1px solid rgba(255,255,255,0.08);margin:24px 0;"/>
          <p style="color:rgba(255,255,255,0.3);font-size:11px;">
            Bloom by Cinder Vault Enterprises LLC — shebloomswealth.app
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}