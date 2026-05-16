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

  const { email, resetUrl, name } = req.body;

  if (!email || !resetUrl) {
    return res.status(400).json({ error: "Email and reset URL required" });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Dahlia from Bloom <dahlia@shebloomswealth.app>",
      to: email,
      subject: "Reset your Bloom password 🌸",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Bloom Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F4; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header with Logo -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #4A6B4E 0%, #5A8059 100%); padding: 40px 40px 30px; text-align: center;">
                        <img src="https://shebloomswealth.app/bloom-logo.png" alt="Bloom" style="width: 64px; height: 64px; margin-bottom: 16px;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; font-family: 'Cormorant Garamond', Georgia, serif;">Reset Your Password</h1>
                      </td>
                    </tr>
                    
                    <!-- Dahlia's Message -->
                    <tr>
                      <td style="padding: 40px;">
                        <div style="display: flex; align-items: start; margin-bottom: 24px;">
                          <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #C9A84C 0%, #D4AF37 100%); display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px;">🌺</div>
                          <div style="flex: 1;">
                            <p style="margin: 0 0 8px; color: #2D3E2E; font-size: 16px; line-height: 1.6;">
                              Hey ${name || 'there'}! No worries girl 💛
                            </p>
                            <p style="margin: 0; color: #5A6B5A; font-size: 14px; line-height: 1.6;">
                              Forgetting passwords happens to everyone. Let's get you back into your Bloom account so you can keep building your wealth 💪
                            </p>
                          </div>
                        </div>
                        
                        <p style="margin: 24px 0; color: #2D3E2E; font-size: 15px; line-height: 1.6;">
                          Click the button below to create a new password. This link will expire in 1 hour for security reasons.
                        </p>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                          <tr>
                            <td align="center">
                              <a href="${resetUrl}" style="display: inline-block; padding: 16px 48px; background-color: #4A6B4E; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(74, 107, 78, 0.2);">
                                Reset My Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 24px 0 0; color: #5A6B5A; font-size: 13px; line-height: 1.6; text-align: center;">
                          If the button doesn't work, copy and paste this link into your browser:<br>
                          <a href="${resetUrl}" style="color: #4A6B4E; word-break: break-all;">${resetUrl}</a>
                        </p>
                        
                        <div style="margin-top: 32px; padding: 16px; background-color: #FFF9E6; border-left: 3px solid #C9A84C; border-radius: 4px;">
                          <p style="margin: 0; color: #5A6B5A; font-size: 13px; line-height: 1.6;">
                            <strong>Didn't request a password reset?</strong><br>
                            If you didn't ask to reset your password, you can safely ignore this email. Your account is secure and your password hasn't been changed.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #FAF8F4; padding: 32px 40px; border-top: 1px solid #E5E3DC;">
                        <p style="margin: 0 0 12px; color: #2D3E2E; font-size: 14px; line-height: 1.6; font-weight: 600;">
                          Security Tips from Dahlia 🔒
                        </p>
                        <ul style="margin: 0 0 24px; padding-left: 20px; color: #5A6B5A; font-size: 13px; line-height: 1.6;">
                          <li>Use a unique password for Bloom</li>
                          <li>Make it at least 12 characters long</li>
                          <li>Mix letters, numbers, and symbols</li>
                          <li>Never share your password with anyone</li>
                        </ul>
                        
                        <div style="padding: 16px; background-color: #ffffff; border-left: 3px solid #C9A84C; border-radius: 4px; margin-bottom: 24px;">
                          <p style="margin: 0; color: #5A6B5A; font-size: 12px; line-height: 1.5; font-style: italic;">
                            Educational content only. This is not financial advice. Bloom is not liable for any investment decisions or losses. Always invest what feels right for you 💛
                          </p>
                        </div>
                        
                        <p style="margin: 0; color: #8A9B8A; font-size: 11px; line-height: 1.5; text-align: center;">
                          © ${new Date().getFullYear()} Bloom - Invest in yourself first 🌸<br>
                          This password reset link expires in 1 hour.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}