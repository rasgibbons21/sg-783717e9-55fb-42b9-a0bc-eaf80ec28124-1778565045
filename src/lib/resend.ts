import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Radar <hello@shebloomswealth.app>";

export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name.trim().split(" ")[0] || "there";
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Radar — your 7-day Core trial starts now",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#C8C2B8;background:#07080C;border-radius:12px">
        <h1 style="color:#27B7C8;font-size:24px;margin:0 0 16px">Hey ${firstName}!</h1>
        <p style="line-height:1.6;margin:0 0 16px">Welcome to <strong style="color:#27B7C8">Radar</strong> — your stock screener is live.</p>
        <p style="line-height:1.6;margin:0 0 16px">Your <strong style="color:#27B7C8">7-day Radar Core trial</strong> is active. Full access to:</p>
        <ul style="line-height:1.8;margin:0 0 16px;padding-left:20px">
          <li>Stock screener — scored and ranked using trading strategies</li>
          <li>Price alerts — screen matches and level notifications</li>
          <li>Pansy AI analyst — entries, stops, and targets</li>
          <li>Paper trading simulator — practice risk-free</li>
        </ul>
        <p style="line-height:1.6;margin:0 0 24px">You have a full week to explore everything. Dive in!</p>
        <a href="https://shebloomswealth.app" style="display:inline-block;background:#27B7C8;color:#07080C;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none">Open Radar</a>
        <p style="margin:32px 0 0;font-size:13px;color:#8F8A7E">Questions? Just reply to this email.</p>
      </div>
    `,
  });
}

export async function sendTrialExpiringEmail(to: string, name: string) {
  const firstName = name.trim().split(" ")[0] || "there";
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Your Radar Core trial ends soon!",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#e2e8f0;background:#07080C;border-radius:12px">
        <h1 style="color:#27B7C8;font-size:24px;margin:0 0 16px">Hey ${firstName},</h1>
        <p style="line-height:1.6;margin:0 0 16px">Your Radar Core trial ends <strong style="color:#27B7C8">soon</strong>.</p>
        <p style="line-height:1.6;margin:0 0 24px">Subscribe to keep full access to the stock screener, price alerts, and unlimited Pansy AI analysis.</p>
        <a href="https://shebloomswealth.app/subscription" style="display:inline-block;background:#49B06E;color:#07080C;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none">Subscribe Now</a>
        <p style="margin:32px 0 0;font-size:13px;color:#94a3b8">No pressure — you can still use Radar's free features after the trial.</p>
      </div>
    `,
  });
}

export interface LateBloomersStock {
  symbol: string;
  price: number;
  why: string;
  entry_zone: string;
  risk: string;
  technical_brief?: string;
  fundamental_brief?: string;
  timeframe?: string;
}

export async function sendLateBloomersEmail(
  to: string,
  stocks: LateBloomersStock[]
) {
  const stockCards = stocks
    .map(
      (s) => {
        const techFundSection = (s.technical_brief || s.fundamental_brief) ? `
          <div style="margin:10px 0;padding:10px;background:rgba(148,163,184,0.06);border-radius:6px">
            ${s.technical_brief ? `<div style="margin:0 0 6px"><strong style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Technical:</strong> <span style="color:#cbd5e1;font-size:13px">${s.technical_brief}</span></div>` : ""}
            ${s.fundamental_brief ? `<div style="margin:0"><strong style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Fundamental:</strong> <span style="color:#cbd5e1;font-size:13px">${s.fundamental_brief}</span></div>` : ""}
          </div>` : "";

        const timeframeTag = s.timeframe ? `
          <div style="margin:10px 0 0;color:#64748b;font-size:11px">
            <strong>Timeframe:</strong> ${s.timeframe}
          </div>` : "";

        return `
      <div style="border-left:4px solid #49B06E;padding:16px;margin:16px 0;background:rgba(73,176,110,0.06);border-radius:0 8px 8px 0">
        <h3 style="margin:0 0 10px;color:#27B7C8;font-size:18px">${s.symbol} @ $${s.price.toFixed(2)}</h3>
        <div style="margin:8px 0">
          <strong style="color:#e2e8f0">Why I'm looking:</strong><br/>
          <span style="color:#94a3b8">${s.why}</span>
        </div>
        ${techFundSection}
        <div style="margin:8px 0;background:rgba(39,183,200,0.08);padding:10px;border-radius:6px">
          <strong style="color:#e2e8f0">Entry zone:</strong>
          <span style="color:#94a3b8"> ${s.entry_zone}</span>
        </div>
        <div style="margin:8px 0;color:#f87171">
          <strong>Risk I see:</strong>
          <span style="color:#f87171"> ${s.risk}</span>
        </div>
        ${timeframeTag}
      </div>`;
      }
    )
    .join("");

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Weekly Watchlist: 3 stocks I'm looking at this week",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#e2e8f0;background:#07080C;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#27B7C8;font-size:22px;margin:0 0 8px">Hey sis,</h1>
          <p style="color:#94a3b8;margin:0;font-size:14px">Here's what I'm looking at this week</p>
        </div>

        ${stockCards}

        <div style="background:rgba(73,176,110,0.08);border-left:4px solid #49B06E;padding:14px;margin:24px 0;border-radius:0 8px 8px 0">
          <strong style="color:#e2e8f0">Not a buy signal.</strong>
          <span style="color:#94a3b8"> Just my research. Do your own due diligence. Never FOMO into anything.</span>
        </div>

        <div style="text-align:center;margin-top:28px;padding-top:20px;border-top:1px solid rgba(148,163,184,0.15)">
          <p style="color:#94a3b8;font-size:12px;margin:0 0 8px">Educational content from Pansy at Radar</p>
          <a href="https://shebloomswealth.app" style="color:#27B7C8;font-size:12px">Open App</a>
          <span style="color:#475569;margin:0 8px">·</span>
          <a href="https://shebloomswealth.app/unsubscribe" style="color:#64748b;font-size:12px">Unsubscribe</a>
        </div>
      </div>
    `,
  });
}

export { resend };
