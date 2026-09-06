import Head from 'next/head';

export default function EbookPremium() {
  return (
    <>
      <Head>
        <title>From Broke to Blooming - Premium Ebook</title>
      </Head>

      <div className="bg-white text-slate-900" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        {/* Page 1: Premium Cover */}
        <div
          className="min-h-screen flex flex-col justify-center items-center text-white p-8"
          style={{
            background: 'linear-gradient(135deg, #0E1B30 0%, #27B7C8 100%)',
          }}
        >
          <div className="text-center max-w-2xl">
            <div className="text-8xl mb-6 opacity-80">🌸</div>
            <h1 className="text-6xl font-black mb-6 leading-tight" style={{ fontWeight: 900 }}>
              From Broke to Blooming
            </h1>
            <p className="text-3xl font-light mb-8 opacity-90">
              The Real Path to Financial Freedom
            </p>
            <p className="text-lg opacity-75 mb-12 leading-relaxed max-w-lg mx-auto">
              How I went from unpaid rent and broken dreams to financially free in 12 years. How you&apos;ll do it faster.
            </p>

            {/* Premium Badge */}
            <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur rounded-full mb-12 border border-white/30">
              <p className="text-sm font-semibold">By Pansy &middot; She Blooms Wealth</p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 pt-12 border-t border-white/20">
              <div>
                <p className="text-4xl font-bold">12 Years</p>
                <p className="text-sm opacity-75 mt-2">Condensed into this guide</p>
              </div>
              <div>
                <p className="text-4xl font-bold">3 Phases</p>
                <p className="text-sm opacity-75 mt-2">The proven system</p>
              </div>
              <div>
                <p className="text-4xl font-bold">&infin; Freedom</p>
                <p className="text-sm opacity-75 mt-2">Your destination</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2: The Problem (Pain Points) */}
        <div className="min-h-screen p-12 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black mb-12" style={{ color: '#0E1B30' }}>
              You&apos;re Not Broken
            </h2>

            <p className="text-2xl font-light mb-12 leading-relaxed text-slate-700">
              But the system wants you to think you are.
            </p>

            {/* Pain Points */}
            <div className="space-y-6">
              <div
                className="p-8 rounded-xl border-2"
                style={{ borderColor: '#E11D48', backgroundColor: '#FFE7EB' }}
              >
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#991B1B' }}>
                  You&apos;re Told to Trade First
                </h3>
                <p className="text-lg text-slate-800 leading-relaxed mb-3">
                  &ldquo;Start investing!&rdquo; &ldquo;Get rich quick!&rdquo; &ldquo;This stock will moon!&rdquo;
                </p>
                <p className="text-slate-700">
                  <strong>Reality:</strong> You don&apos;t HAVE money to invest. You&apos;re trying to multiply zero. So you open an account with $200, lose it in 2 weeks, and think you&apos;re not cut out for this.
                </p>
              </div>

              <div
                className="p-8 rounded-xl border-2"
                style={{ borderColor: '#F59E0B', backgroundColor: '#FEF3C7' }}
              >
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#92400E' }}>
                  You&apos;re Broke, Not Stupid
                </h3>
                <p className="text-lg text-slate-800 leading-relaxed mb-3">
                  You have a job. You work hard. But at the end of the month? Nothing left.
                </p>
                <p className="text-slate-700">
                  <strong>The problem:</strong> Nobody taught you the system. You&apos;re not wasting money on luxuries — you&apos;re hemorrhaging it on things you didn&apos;t even notice.
                </p>
              </div>

              <div
                className="p-8 rounded-xl border-2"
                style={{ borderColor: '#8B5CF6', backgroundColor: '#F3E8FF' }}
              >
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#5B21B6' }}>
                  You See Others Building Wealth (But Not You)
                </h3>
                <p className="text-lg text-slate-800 leading-relaxed mb-3">
                  Instagram wealth. TikTok success stories. People your age with portfolios.
                </p>
                <p className="text-slate-700">
                  <strong>What you don&apos;t see:</strong> The 5 years of boring budgeting. The side hustle grind. The discipline nobody talks about.
                </p>
              </div>

              <div
                className="p-8 rounded-xl border-2"
                style={{ borderColor: '#10B981', backgroundColor: '#ECFDF5' }}
              >
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#065F46' }}>
                  You&apos;re Running Out of Time
                </h3>
                <p className="text-lg text-slate-800 leading-relaxed mb-3">
                  Compound interest is real. Every year you wait is thousands of dollars lost.
                </p>
                <p className="text-slate-700">
                  <strong>But here&apos;s the thing:</strong> You&apos;re not too late. You just need the RIGHT system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page 3: The Plot Twist */}
        <div
          className="min-h-screen p-12 flex flex-col justify-center"
          style={{ background: 'linear-gradient(135deg, #0E1B30 0%, #1E293B 100%)', color: 'white' }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-emerald-400 font-bold text-lg">THE PLOT TWIST</span>
            </div>

            <h2 className="text-5xl font-black mb-8">
              I Was Broken.
            </h2>

            <div className="space-y-6 text-lg leading-relaxed opacity-95">
              <p>
                Single mom. $0 in savings. Rent I couldn&apos;t pay. Kids who needed things I couldn&apos;t afford. I&apos;d lie awake at night wondering if I was failing them.
              </p>

              <p>
                I tried trading. Lost $200. Felt like an idiot.
              </p>

              <p>
                But then something clicked. I realized I wasn&apos;t broken — the system I was using was.
              </p>

              <div
                className="p-6 rounded-lg border-l-4 mt-8"
                style={{ borderColor: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.1)' }}
              >
                <p className="text-2xl font-bold text-emerald-300 mb-3">
                  &ldquo;I didn&apos;t need to trade better. I needed to BUILD first.&rdquo;
                </p>
                <p className="text-sm opacity-75">
                  — Pansy, 12 years into her journey
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page 4: The 3 Phases */}
        <div className="min-h-screen p-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black mb-4" style={{ color: '#0E1B30' }}>
              The 3-Phase System
            </h2>
            <p className="text-xl text-slate-600 mb-12">
              What I learned in 12 years. What you&apos;ll learn in weeks.
            </p>

            {/* Phase 1 */}
            <div className="mb-12">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-6 font-black text-white text-2xl"
                style={{ backgroundColor: '#27B7C8' }}
              >
                1
              </div>
              <h3 className="text-3xl font-black mb-4" style={{ color: '#0E1B30' }}>
                Budget Like Your Life Depends On It
              </h3>
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                This is where everyone fails because they skip it. But this is your foundation.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF', borderLeft: '4px solid #27B7C8' }}>
                  <p className="font-bold text-slate-900 mb-2">Find Your Leaks</p>
                  <p className="text-sm text-slate-700">Most people waste $200-500/month without realizing it</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF', borderLeft: '4px solid #27B7C8' }}>
                  <p className="font-bold text-slate-900 mb-2">Turn Leaks Into Wealth</p>
                  <p className="text-sm text-slate-700">$300/month saved = $3,600/year = Your first investment</p>
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: '#ECFDF5', borderLeft: '4px solid #10B981' }}>
                <p className="font-bold text-emerald-900 mb-2">The Win</p>
                <p className="text-emerald-800">You gain visibility. You control your money instead of it controlling you.</p>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="mb-12">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-6 font-black text-white text-2xl"
                style={{ backgroundColor: '#49B06E' }}
              >
                2
              </div>
              <h3 className="text-3xl font-black mb-4" style={{ color: '#0E1B30' }}>
                Build Multiple Income Streams
              </h3>
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                One income = one risk. Multiple income = security + capital.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', borderLeft: '4px solid #49B06E' }}>
                  <p className="font-bold text-slate-900 mb-2">Freelance Writing</p>
                  <p className="text-sm text-slate-700">$500-2,000/month</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', borderLeft: '4px solid #49B06E' }}>
                  <p className="font-bold text-slate-900 mb-2">Reselling</p>
                  <p className="text-sm text-slate-700">$500-1,000/month</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', borderLeft: '4px solid #49B06E' }}>
                  <p className="font-bold text-slate-900 mb-2">Online Courses</p>
                  <p className="text-sm text-slate-700">$1,000-5,000/month</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', borderLeft: '4px solid #49B06E' }}>
                  <p className="font-bold text-slate-900 mb-2">Virtual Assistant</p>
                  <p className="text-sm text-slate-700">$15-30/hour</p>
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: '#ECFDF5', borderLeft: '4px solid #10B981' }}>
                <p className="font-bold text-emerald-900 mb-2">The Win</p>
                <p className="text-emerald-800">After 2 years, you have $5K-10K saved. Real capital to invest.</p>
              </div>
            </div>

            {/* Phase 3 */}
            <div>
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-6 font-black text-white text-2xl"
                style={{ backgroundColor: '#F59E0B' }}
              >
                3
              </div>
              <h3 className="text-3xl font-black mb-4" style={{ color: '#0E1B30' }}>
                Invest With Real Capital
              </h3>
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                NOW you learn the markets. Now you trade. Now you compound.
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7', borderLeft: '4px solid #F59E0B' }}>
                  <p className="text-sm"><strong>Paper Trading:</strong> Learn without risk</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7', borderLeft: '4px solid #F59E0B' }}>
                  <p className="text-sm"><strong>Small Real Money:</strong> Start with $500-1,000</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7', borderLeft: '4px solid #F59E0B' }}>
                  <p className="text-sm"><strong>Scale Slowly:</strong> 6-12 months before serious capital</p>
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: '#ECFDF5', borderLeft: '4px solid #10B981' }}>
                <p className="font-bold text-emerald-900 mb-2">The Win</p>
                <p className="text-emerald-800">Compound interest starts working FOR you. Financial freedom is no longer a dream — it&apos;s a timeline.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page 5: Why This Works */}
        <div className="min-h-screen p-12 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black mb-12" style={{ color: '#0E1B30' }}>
              Why This Actually Works
            </h2>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="text-4xl flex-shrink-0">&#127919;</div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">It&apos;s Not Sexy</h3>
                  <p className="text-lg text-slate-700">
                    Budgeting isn&apos;t glamorous. Side hustles are grinding work. But this is why it works — nobody quits.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-4xl flex-shrink-0">&#129504;</div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">It Compounds</h3>
                  <p className="text-lg text-slate-700">
                    Year 1: You save $3,600. Year 2: You save $7,200 + earn $500/mo from side hustle. Year 3: You have real capital + discipline + systems.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-4xl flex-shrink-0">&#127891;</div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">You Learn the REAL Game</h3>
                  <p className="text-lg text-slate-700">
                    Trading isn&apos;t about picks. It&apos;s about discipline, psychology, and systems. By the time you trade, you have all three.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-4xl flex-shrink-0">&#128101;</div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re Not Alone</h3>
                  <p className="text-lg text-slate-700">
                    Hundreds of women are walking this path. Late Bloomers isn&apos;t just stock analysis — it&apos;s a community of people doing the same hard work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page 6: The Call Out */}
        <div
          className="min-h-screen p-12 flex flex-col justify-center"
          style={{ background: 'linear-gradient(135deg, #49B06E 0%, #27B7C8 100%)', color: 'white' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl font-black mb-8">
              What Took Me 12 Years...
            </h2>
            <p className="text-3xl font-light mb-12 leading-relaxed">
              You&apos;ll learn in weeks.
            </p>
            <p className="text-2xl font-light opacity-90 mb-8">
              Not because you&apos;re smarter than me.
            </p>
            <p className="text-2xl font-bold">
              Because I already walked the path and mapped it for you.
            </p>
          </div>
        </div>

        {/* Page 7: 5 Mistakes */}
        <div className="min-h-screen p-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black mb-12" style={{ color: '#0E1B30' }}>
              5 Mistakes Don&apos;t Make
            </h2>

            <div className="space-y-6">
              <div className="p-8 rounded-xl" style={{ backgroundColor: '#FFE7EB', borderLeft: '6px solid #E11D48' }}>
                <p className="text-2xl font-black mb-3" style={{ color: '#991B1B' }}>Mistake 1: Waiting to Be Perfect</p>
                <p className="text-lg text-slate-800">You don&apos;t need $10K to start. You don&apos;t need to understand everything. Start messy. Start today.</p>
              </div>

              <div className="p-8 rounded-xl" style={{ backgroundColor: '#FEF3C7', borderLeft: '6px solid #F59E0B' }}>
                <p className="text-2xl font-black mb-3" style={{ color: '#92400E' }}>Mistake 2: Skipping Phase 1</p>
                <p className="text-lg text-slate-800">You think you can jump straight to trading. You can&apos;t. That&apos;s how you blow up your account. Do it in order.</p>
              </div>

              <div className="p-8 rounded-xl" style={{ backgroundColor: '#E0E7FF', borderLeft: '6px solid #6366F1' }}>
                <p className="text-2xl font-black mb-3" style={{ color: '#312E81' }}>Mistake 3: Comparing Day 1 to Someone&apos;s Day 365</p>
                <p className="text-lg text-slate-800">You see 6-figure portfolios. You don&apos;t see the years of work. You&apos;re on day 1. That&apos;s okay. Keep going.</p>
              </div>

              <div className="p-8 rounded-xl" style={{ backgroundColor: '#E0F2FE', borderLeft: '6px solid #0284C7' }}>
                <p className="text-2xl font-black mb-3" style={{ color: '#0C2340' }}>Mistake 4: FOMO Trading</p>
                <p className="text-lg text-slate-800">Everyone&apos;s making money on this stock. That&apos;s when you lose the most. Trade your plan. Boring beats exciting.</p>
              </div>

              <div className="p-8 rounded-xl" style={{ backgroundColor: '#F3E8FF', borderLeft: '6px solid #8B5CF6' }}>
                <p className="text-2xl font-black mb-3" style={{ color: '#5B21B6' }}>Mistake 5: Quitting After One Loss</p>
                <p className="text-lg text-slate-800">You lose $100 and think it&apos;s not for you. Losses teach more than wins. Stay curious. Stay in the game.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page 8: Your First Week */}
        <div className="min-h-screen p-12 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black mb-4" style={{ color: '#0E1B30' }}>
              Your First 7 Days
            </h2>
            <p className="text-xl text-slate-600 mb-12">
              Stop waiting. Start today.
            </p>

            <div className="space-y-6">
              {[
                { day: 1, task: "Track ONE Day", desc: "Write down everything you spend. Coffee, gas, food, everything." },
                { day: 2, task: "Track FIVE Days", desc: "Keep going. Look for patterns. What's your daily average?" },
                { day: 3, task: "Cut ONE Leak", desc: "Find ONE thing you're overspending on. A subscription, daily coffee. Cut it." },
                { day: 4, task: "Open Savings Account", desc: "Separate from checking. Move your first $5-10. Watch it grow." },
                { day: 5, task: "Download the App", desc: "Use the Budget Tracker. Log your spending. Visualize it." },
                { day: 6, task: "Research ONE Side Hustle", desc: "Pick one from this guide. See if it fits your life." },
                { day: 7, task: "Join Late Bloomers", desc: "Get Pansy's weekly stock analysis. Join the community." },
              ].map((item) => (
                <div key={item.day} className="flex gap-6 p-6 rounded-lg bg-white border border-slate-200">
                  <div
                    className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-black text-white text-sm"
                    style={{ backgroundColor: '#27B7C8' }}
                  >
                    Day {item.day}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{item.task}</h4>
                    <p className="text-slate-700">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page 9: Final CTA */}
        <div
          className="min-h-screen p-12 flex flex-col justify-center"
          style={{
            background: 'linear-gradient(135deg, #0E1B30 0%, #27B7C8 100%)',
            color: 'white'
          }}
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-black mb-8">
              You Have the Map
            </h2>

            <p className="text-2xl font-light mb-12 leading-relaxed opacity-95">
              The question is: Are you going to walk the path?
            </p>

            <div className="space-y-6 mb-12">
              <div className="p-8 rounded-xl bg-white/10 backdrop-blur border border-white/20">
                <p className="text-emerald-300 font-bold text-sm mb-2">STEP 1</p>
                <p className="text-2xl font-bold mb-2">Download the App</p>
                <p className="text-white/80">Track your spending. Start Phase 1 today.</p>
              </div>

              <div className="p-8 rounded-xl bg-white/10 backdrop-blur border border-white/20">
                <p className="text-emerald-300 font-bold text-sm mb-2">STEP 2</p>
                <p className="text-2xl font-bold mb-2">Join Late Bloomers (Free)</p>
                <p className="text-white/80">Every Friday, Pansy shares 3 stocks she&apos;s researching. Real breakdowns. No pumps.</p>
              </div>

              <div className="p-8 rounded-xl bg-white/10 backdrop-blur border border-white/20">
                <p className="text-emerald-300 font-bold text-sm mb-2">STEP 3</p>
                <p className="text-2xl font-bold mb-2">Start Your 7-Day Trial</p>
                <p className="text-white/80">Full access to Budget Tracker, Paper Trader, Lessons. No credit card needed.</p>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-white/20">
              <p className="text-lg font-semibold mb-4">Download She Blooms Wealth</p>
              <div className="space-y-2 text-white/90 mb-12">
                <p className="text-sm">Android: play.google.com/store/apps/details?id=app.shebloomswealth.mobile</p>
                <p className="text-sm">Web: shebloomswealth.app</p>
                <p className="text-sm">iOS: Coming soon</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold mb-4">&mdash; Pansy</p>
                <p className="text-lg opacity-90">She Blooms Wealth</p>
                <p className="text-sm opacity-75 mt-4 italic max-w-lg mx-auto">
                  &ldquo;What took me 12 years, you&apos;ll do faster. Not because you&apos;re smarter. Because I already walked the path and mapped it for you.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-slate-100 p-8 text-center text-xs text-slate-600">
          <p>&copy; 2026 Cinder Vault Enterprises LLC. Educational content only. Not financial advice.</p>
          <p className="mt-2">She Blooms Wealth is not a broker, investment adviser, or financial planner. We do not recommend buying or selling any security.</p>
        </div>
      </div>
    </>
  );
}
