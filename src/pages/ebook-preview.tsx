import Head from "next/head";

const C = {
  deep: "#0E1B30",
  surface: "#16264A",
  teal: "#27B7C8",
  green: "#49B06E",
  ivory: "#F4F7FA",
};

export default function EbookPreview() {
  return (
    <>
      <Head>
        <title>From Broke to Blooming — She Blooms Wealth</title>
        <style>{`
          @media print {
            .page-break { page-break-before: always; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        `}</style>
      </Head>

      <div id="ebook-content" style={{ fontFamily: "'DM Sans', sans-serif", color: "#1e293b" }}>

        {/* COVER */}
        <div style={{ background: `linear-gradient(135deg, ${C.deep}, ${C.surface})`, color: C.ivory, padding: "80px 48px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>&#x1F338;</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
            From Broke to Blooming
          </h1>
          <p style={{ fontSize: 24, opacity: 0.85, marginBottom: 32 }}>The Real Path to Financial Freedom</p>
          <p style={{ fontSize: 16, opacity: 0.6, maxWidth: 520, lineHeight: 1.7 }}>
            How I went from unpaid rent and broken dreams to financially free. And how you can too — faster.
          </p>
          <div style={{ marginTop: 60, fontSize: 14, opacity: 0.5 }}>
            By Pansy &middot; She Blooms Wealth
          </div>
        </div>

        {/* TABLE OF CONTENTS */}
        <div className="page-break" style={{ padding: "80px 48px", minHeight: "100vh", background: "#f8fafc" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: C.deep, marginBottom: 40 }}>What&apos;s Inside</h2>
          {[
            { n: "1", t: "My Story", d: "From broke to free: The 12-year journey" },
            { n: "2", t: "Phase 1: Budget Like Your Life Depends On It", d: "Why budgeting is your foundation, not trading" },
            { n: "3", t: "Phase 2: Build Multiple Income Streams", d: "How to earn $2-5K/month extra while working" },
            { n: "4", t: "Phase 3: Invest With Real Capital", d: "Now you have money to grow" },
            { n: "5", t: "5 Mistakes Women Make", d: "And how to avoid them" },
            { n: "6", t: "Your First 7 Days", d: "Actionable steps to get started today" },
          ].map((ch) => (
            <div key={ch.n} style={{ display: "flex", gap: 20, marginBottom: 28 }}>
              <span style={{ color: C.teal, fontWeight: 700, fontSize: 24, width: 32, flexShrink: 0 }}>{ch.n}</span>
              <div>
                <p style={{ fontSize: 18, fontWeight: 600, color: C.deep, marginBottom: 4 }}>{ch.t}</p>
                <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>{ch.d}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CH 1: MY STORY */}
        <div className="page-break" style={{ padding: "80px 48px", minHeight: "100vh" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: C.deep, marginBottom: 32 }}>My Story</h2>
          <div style={{ maxWidth: 640, fontSize: 17, lineHeight: 1.8, color: "#334155" }}>
            <p style={{ marginBottom: 20 }}>
              I was broke. Like, really broke. Single mom, two kids who needed school supplies, rent I couldn&apos;t pay, utilities I couldn&apos;t afford. I&apos;d lie awake at night wondering if I was failing my kids.
            </p>
            <p style={{ marginBottom: 20 }}>
              Everyone around me said: &ldquo;Start trading. Get rich quick. That&apos;s how people build wealth.&rdquo;
            </p>
            <p style={{ marginBottom: 20 }}>
              So I tried. Opened an account with $200 I scraped together. Lost it in 2 weeks. Felt like an idiot.
            </p>
            <p style={{ marginBottom: 20 }}>
              But then something clicked. I realized I couldn&apos;t trade because I didn&apos;t HAVE money. I was trying to multiply nothing.
            </p>
            <p style={{ marginBottom: 20 }}>
              So I did something different. I learned to budget. Not boring budgeting — strategic budgeting. I found $300/month I was wasting. Then I built side hustles while working full-time. Freelance writing. Reselling. Online courses. Small things that added up.
            </p>
            <p style={{ marginBottom: 20 }}>
              After 2 years, I had $5K saved. Real capital. Then I learned to trade. The RIGHT way. Technical analysis. Fundamental research. Not FOMO.
            </p>
            <p style={{ marginBottom: 20 }}>
              12 years later, I&apos;m financially free. Not rich. Free. There&apos;s a difference.
            </p>
            <p style={{ color: C.green, fontWeight: 700 }}>
              And this ebook is everything I learned in those 12 years — condensed, so you don&apos;t have to take 12 years.
            </p>
          </div>
        </div>

        {/* CH 2: PHASE 1 — BUDGETING */}
        <div className="page-break" style={{ padding: "80px 48px", minHeight: "100vh", background: "#f8fafc" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: C.deep, marginBottom: 32 }}>Phase 1: Budget Like Your Life Depends On It</h2>

          <div style={{ maxWidth: 640 }}>
            <div style={{ background: "white", padding: 28, borderRadius: 12, borderLeft: `4px solid ${C.teal}`, marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.deep, marginBottom: 12 }}>Why Budgeting Comes FIRST</h3>
              <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
                Everyone skips this. They jump straight to trading. That&apos;s why most people fail.
              </p>
              <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7 }}>
                Budgeting isn&apos;t about restriction. It&apos;s about visibility. You can&apos;t build wealth if you don&apos;t know where your money goes.
              </p>
            </div>

            <div style={{ background: "white", padding: 28, borderRadius: 12, marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.deep, marginBottom: 16 }}>Your First Step: Track Everything</h3>
              {["Food / Groceries", "Transport / Gas", "Utilities / Rent", "Phone / Internet", "Shopping / Entertainment", "Health / Insurance", "Everything else"].map((item) => (
                <p key={item} style={{ fontSize: 15, color: "#475569", marginBottom: 8 }}>&#10003; {item}</p>
              ))}
              <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: C.teal }}>
                Track for ONE MONTH. That&apos;s it. See where your money actually goes.
              </p>
            </div>

            <div style={{ background: "white", padding: 28, borderRadius: 12 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.deep, marginBottom: 12 }}>Find Your Leaks</h3>
              <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>Most people waste $200-500/month without realizing it:</p>
              {["Subscriptions you forgot about", "Eating out instead of cooking", "Impulse shopping", "Premium services you don't use"].map((item) => (
                <p key={item} style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}>&bull; {item}</p>
              ))}
              <p style={{ marginTop: 16, fontWeight: 600, color: C.teal }}>
                Even $300/month = $3,600/year = Your first investment account.
              </p>
            </div>
          </div>
        </div>

        {/* CH 3: PHASE 2 — SIDE HUSTLES */}
        <div className="page-break" style={{ padding: "80px 48px", minHeight: "100vh" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: C.deep, marginBottom: 32 }}>Phase 2: Build Multiple Income Streams</h2>

          <div style={{ maxWidth: 640 }}>
            <div style={{ background: "#f0fdf4", padding: 28, borderRadius: 12, marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.deep, marginBottom: 12 }}>Why &ldquo;Side Hustle&rdquo; Not &ldquo;Side Gig&rdquo;</h3>
              <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7 }}>
                A side gig is temporary. A side hustle compounds. You&apos;re building multiple income sources while you work your main job.
              </p>
            </div>

            <div style={{ background: "white", border: "1px solid #e2e8f0", padding: 28, borderRadius: 12, marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.deep, marginBottom: 20 }}>Real Examples (That Actually Work)</h3>
              {[
                { name: "Freelance Writing / Content", detail: "$20-100 per article. Start on Fiverr or Upwork. $500-2,000/month possible" },
                { name: "Reselling (Thrift Stores to eBay/Poshmark)", detail: "Buy low, sell high. $200 investment = $500-1,000/month" },
                { name: "Online Courses / Teaching", detail: "Teach what you know. $1,000-5,000/month once it scales" },
                { name: "Virtual Assistant Work", detail: "Manage schedules, emails, social media. $15-30/hour, flexible" },
              ].map((h) => (
                <div key={h.name} style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: C.deep }}>{h.name}</p>
                  <p style={{ fontSize: 14, color: "#64748b" }}>{h.detail}</p>
                </div>
              ))}
            </div>

            <div style={{ background: "white", padding: 28, borderRadius: 12 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.deep, marginBottom: 12 }}>The Real Goal</h3>
              <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7 }}>
                Build to $2-5K/month extra. That&apos;s $24-60K/year on top of your job. Now you have REAL capital to invest.
              </p>
              <p style={{ marginTop: 12, fontWeight: 600, color: C.green }}>
                This took me 2 years. You can do it faster.
              </p>
            </div>
          </div>
        </div>

        {/* CH 4: PHASE 3 — INVESTING */}
        <div className="page-break" style={{ padding: "80px 48px", minHeight: "100vh", background: "#f8fafc" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: C.deep, marginBottom: 32 }}>Phase 3: Invest With Real Capital</h2>

          <div style={{ maxWidth: 640 }}>
            <div style={{ background: "white", padding: 28, borderRadius: 12, borderLeft: `4px solid ${C.green}`, marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.deep, marginBottom: 12 }}>NOW You&apos;re Ready to Trade</h3>
              <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7 }}>
                You have money. You understand budgeting. You built discipline through side hustles. NOW you learn the markets.
              </p>
            </div>

            <div style={{ background: "white", padding: 28, borderRadius: 12, marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.deep, marginBottom: 20 }}>The Path</h3>
              {[
                { n: "1", t: "Paper Trading (Practice)", d: "Use virtual money to learn technical analysis, candlesticks, support/resistance" },
                { n: "2", t: "Small Real Money", d: "Start with $500-1,000. Learn what real fear and greed feels like" },
                { n: "3", t: "Scale Slowly", d: "Double down on what works. Pull back on what doesn't. 6-12 months before serious capital" },
              ].map((s) => (
                <div key={s.n} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <span style={{ color: C.green, fontWeight: 700, fontSize: 20 }}>{s.n}</span>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: C.deep }}>{s.t}</p>
                    <p style={{ fontSize: 14, color: "#64748b" }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#f0fdf4", padding: 24, borderRadius: 12 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#166534", lineHeight: 1.6 }}>
                This is where most people get it backwards. They skip phases 1 &amp; 2, jump to phase 3, and blow up their account. Don&apos;t be that person.
              </p>
            </div>
          </div>
        </div>

        {/* CH 5: 5 MISTAKES */}
        <div className="page-break" style={{ padding: "80px 48px", minHeight: "100vh" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: C.deep, marginBottom: 32 }}>5 Mistakes Women Make (And How to Avoid Them)</h2>

          <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { t: "Mistake 1: Waiting to Be Perfect", d: "You don't need $10K to start budgeting. You don't need perfect knowledge to begin. Start with what you have. Imperfect action beats perfect planning." },
              { t: "Mistake 2: Skipping Phases 1 & 2", d: '"I\'ll learn to trade first, make money, then budget." No. You\'ll blow up the account. Do it in order. Phase 1, then 2, then 3.' },
              { t: "Mistake 3: Comparing Your Beginning to Someone Else's Middle", d: "You see someone with a 6-figure portfolio. You don't see the 10 years of work behind it. You're on day 1. That's okay." },
              { t: "Mistake 4: FOMO Trading", d: '"Everyone\'s making money on this stock." That\'s when you lose. Trade your plan, not the hype. Boring beats exciting.' },
              { t: "Mistake 5: Giving Up After One Loss", d: "You lose $100 and think it's not for you. Wrong. Losses teach more than wins. Stay curious. Keep learning. Keep going." },
            ].map((m) => (
              <div key={m.t} style={{ background: "white", padding: 24, borderRadius: 12, borderLeft: "4px solid #ef4444" }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.deep, marginBottom: 8 }}>{m.t}</h3>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7 }}>{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CH 6: YOUR FIRST 7 DAYS */}
        <div className="page-break" style={{ padding: "80px 48px", minHeight: "100vh", background: "#f8fafc" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: C.deep, marginBottom: 32 }}>Your First 7 Days: Action Plan</h2>

          <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { day: "Day 1", title: "Track ONE Day", desc: "Write down everything you spend. Coffee, gas, food, everything. See what one day costs." },
              { day: "Day 2", title: "Track FIVE Days", desc: "Keep tracking. Look for patterns. What's your daily average?" },
              { day: "Day 3", title: "Identify One Leak", desc: "Find ONE thing you're overspending on. A subscription, daily coffee, whatever. Cut it." },
              { day: "Day 4", title: "Open a Savings Account", desc: "Separate from your checking. Move your first $5-10 into it. See it grow." },
              { day: "Day 5", title: "Download She Blooms Wealth App", desc: "Use the Budget Tracker to log your spending. See it visualized. Makes it real." },
              { day: "Day 6", title: "Research ONE Side Hustle", desc: "Pick one from this ebook. Read about it. See if it fits your life." },
              { day: "Day 7", title: "Join Late Bloomers", desc: "Get Pansy's weekly stock analysis. Join the community. You're not alone in this." },
            ].map((d) => (
              <div key={d.day} style={{ background: "white", padding: 24, borderRadius: 12 }}>
                <p style={{ fontWeight: 700, color: C.green, marginBottom: 8 }}>{d.day}: {d.title}</p>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="page-break" style={{ background: `linear-gradient(135deg, ${C.deep}, ${C.surface})`, color: C.ivory, padding: "80px 48px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, marginBottom: 24 }}>You&apos;re Ready</h2>
            <p style={{ fontSize: 18, opacity: 0.85, lineHeight: 1.7, marginBottom: 24 }}>
              This took me 12 years to figure out. Financial freedom wasn&apos;t about trading — it was about discipline. Budgeting. Building income. Then investing.
            </p>
            <p style={{ fontSize: 18, opacity: 0.85, lineHeight: 1.7, marginBottom: 40 }}>
              You have the map now. The question is: Are you going to walk the path?
            </p>

            {[
              { step: "Next Step 1", title: "Download the She Blooms Wealth App", desc: "Track your spending. Start Phase 1 today." },
              { step: "Next Step 2", title: "Join Late Bloomers (Free)", desc: "Every Friday, I share 3 stocks I'm researching. Learn from my research process." },
              { step: "Next Step 3", title: "Start Your Free Trial", desc: "Full access to Budget Tracker + Paper Trader + Lessons." },
            ].map((s) => (
              <div key={s.step} style={{ background: "rgba(255,255,255,0.08)", padding: 24, borderRadius: 12, marginBottom: 16 }}>
                <p style={{ fontSize: 13, opacity: 0.55, marginBottom: 4 }}>{s.step}:</p>
                <p style={{ fontWeight: 700 }}>{s.title}</p>
                <p style={{ fontSize: 14, opacity: 0.65, marginTop: 4 }}>{s.desc}</p>
              </div>
            ))}

            <div style={{ marginTop: 48, textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Download She Blooms Wealth</p>
              <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 6 }}>Android: play.google.com/store/apps/details?id=app.shebloomswealth.mobile</p>
              <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 6 }}>Web: shebloomswealth.app</p>
              <p style={{ fontSize: 14, opacity: 0.6 }}>iOS: Coming soon</p>
            </div>

            <div style={{ marginTop: 48, textAlign: "center" }}>
              <p style={{ fontSize: 14, opacity: 0.5 }}>— Pansy</p>
              <p style={{ fontSize: 14, opacity: 0.5 }}>She Blooms Wealth</p>
              <p style={{ fontSize: 13, opacity: 0.4, marginTop: 12, fontStyle: "italic", lineHeight: 1.6 }}>
                &ldquo;What took me 12 years, you&apos;ll do faster. Not because you&apos;re smarter. Because I already walked the path and mapped it for you.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div style={{ padding: "40px 48px", textAlign: "center", background: "#f8fafc" }}>
          <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
            &copy; 2026 Cinder Vault Enterprises LLC. Educational content only. Not financial advice. She Blooms Wealth is not a broker, investment adviser, or financial planner. We do not recommend buying or selling any security.
          </p>
        </div>
      </div>
    </>
  );
}
