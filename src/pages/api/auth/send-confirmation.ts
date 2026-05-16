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
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Bloom</title>
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
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; font-family: 'Cormorant Garamond', Georgia, serif;">Welcome to Bloom</h1>
                      </td>
                    </tr>
                    
                    <!-- Pansy's Greeting -->
                    <tr>
                      <td style="padding: 40px;">
                        <div style="display: flex; align-items: start; margin-bottom: 24px;">
                          <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #C9A84C 0%, #D4AF37 100%); display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px;">🌺</div>
                          <div style="flex: 1;">
                            <p style="margin: 0 0 8px; color: #2D3E2E; font-size: 16px; line-height: 1.6;">
                              Hey ${name || 'there'}! I'm Pansy, your investing guide at Bloom 💛
                            </p>
                            <p style="margin: 0; color: #5A6B5A; font-size: 14px; line-height: 1.6;">
                              I'm so excited you're here! I know investing can feel overwhelming but I'm going to break everything down for you in a way that actually makes sense. No confusing jargon, no pressure — just real talk about your money.
                            </p>
                          </div>
                        </div>
                        
                        <p style="margin: 24px 0; color: #2D3E2E; font-size: 15px; line-height: 1.6;">
                          First things first — let's confirm your email so you can start exploring your investment journey 🌸
                        </p>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                          <tr>
                            <td align="center">
                              <a href="${confirmationUrl}" style="display: inline-block; padding: 16px 48px; background-color: #4A6B4E; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(74, 107, 78, 0.2);">
                                Confirm Your Email
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 24px 0 0; color: #5A6B5A; font-size: 13px; line-height: 1.6; text-align: center;">
                          If the button doesn't work, copy and paste this link into your browser:<br>
                          <a href="${confirmationUrl}" style="color: #4A6B4E; word-break: break-all;">${confirmationUrl}</a>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #FAF8F4; padding: 32px 40px; border-top: 1px solid #E5E3DC;">
                        <p style="margin: 0 0 12px; color: #2D3E2E; font-size: 14px; line-height: 1.6; font-weight: 600;">
                          Ready to start investing?
                        </p>
                        <p style="margin: 0 0 24px; color: #5A6B5A; font-size: 13px; line-height: 1.6;">
                          Once you confirm your email, I'll walk you through setting up your personalized investing profile. We'll talk about your goals, your comfort with risk, and what you want to achieve. Then I'll show you some solid picks to get you started 💪
                        </p>
                        
                        <div style="padding: 16px; background-color: #ffffff; border-left: 3px solid #C9A84C; border-radius: 4px; margin-bottom: 24px;">
                          <p style="margin: 0; color: #5A6B5A; font-size: 12px; line-height: 1.5; font-style: italic;">
                            Educational content only. This is not financial advice. Bloom is not liable for any investment decisions or losses. Always invest what feels right for you 💛
                          </p>
                        </div>
                        
                        <p style="margin: 0; color: #8A9B8A; font-size: 11px; line-height: 1.5; text-align: center;">
                          © ${new Date().getFullYear()} Bloom - Invest in yourself first 🌸<br>
                          If you didn't create a Bloom account, you can safely ignore this email.
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
    console.error("Error sending confirmation email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}