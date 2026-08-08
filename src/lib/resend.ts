import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Bloom <hello@shebloomswealth.app>";

export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name.trim().split(" ")[0] || "there";
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Bloom — your 3-day Pro trial starts now 🌸",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#e2e8f0;background:#0E1B30;border-radius:12px">
        <h1 style="color:#27B7C8;font-size:24px;margin:0 0 16px">Hey ${firstName}!</h1>
        <p style="line-height:1.6;margin:0 0 16px">Welcome to <strong style="color:#49B06E">Bloom</strong> — we're thrilled you're here.</p>
        <p style="line-height:1.6;margin:0 0 16px">Your <strong style="color:#27B7C8">3-day Pro trial</strong> is now active. That means full access to:</p>
        <ul style="line-height:1.8;margin:0 0 16px;padding-left:20px">
          <li>Practice Trader with real market prices</li>
          <li>AI-powered financial lessons</li>
          <li>Bloom University courses</li>
          <li>Pansy, your personal finance coach</li>
        </ul>
        <p style="line-height:1.6;margin:0 0 24px">Make the most of it — start exploring today.</p>
        <a href="https://shebloomswealth.app" style="display:inline-block;background:#27B7C8;color:#0E1B30;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none">Open Bloom</a>
        <p style="margin:32px 0 0;font-size:13px;color:#94a3b8">Questions? Just reply to this email.</p>
      </div>
    `,
  });
}

export async function sendTrialExpiringEmail(to: string, name: string) {
  const firstName = name.trim().split(" ")[0] || "there";
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Your Bloom Pro trial ends tomorrow",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#e2e8f0;background:#0E1B30;border-radius:12px">
        <h1 style="color:#27B7C8;font-size:24px;margin:0 0 16px">Hey ${firstName},</h1>
        <p style="line-height:1.6;margin:0 0 16px">Your 3-day Pro trial ends <strong style="color:#27B7C8">tomorrow</strong>.</p>
        <p style="line-height:1.6;margin:0 0 24px">Subscribe to keep full access to Practice Trader, Bloom University, and Pansy coaching.</p>
        <a href="https://shebloomswealth.app/subscription" style="display:inline-block;background:#49B06E;color:#0E1B30;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none">Subscribe Now</a>
        <p style="margin:32px 0 0;font-size:13px;color:#94a3b8">No pressure — you can still use Bloom's free features after the trial.</p>
      </div>
    `,
  });
}

export { resend };
