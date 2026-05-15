import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { Search, CheckCircle2, Circle, Clock } from "lucide-react";

type Category = "all" | "stocks" | "etfs" | "mutual-funds" | "dividends" | "bonds" | "retirement";

type Lesson = {
  id: string;
  title: string;
  category: Category;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  content: string;
  completed?: boolean;
};

export default function Learn() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const lessons: Lesson[] = [
    {
      id: "what-is-stock",
      title: "What is a Stock?",
      category: "stocks",
      duration: "3 min",
      difficulty: "Beginner",
      summary: "Understanding what you actually own when you buy stocks",
      content: `Okay so when you buy a stock you're basically buying a tiny piece of a real company. Like if you buy Apple stock you literally own a small slice of Apple. 

If Apple does well and makes more money, their stock price usually goes up and so does your investment. If they have a bad year, the price might drop. That's the risk but also the opportunity 🍎

The cool part? Some companies pay you dividends just for holding their stock. It's like getting a bonus check every few months just for being an owner. And if the company grows a lot over time, your little slice can be worth WAY more than what you paid for it.

Think of it like buying a piece of your favorite local bakery. When they're successful and busy, your ownership stake becomes more valuable. When they have slow days, maybe not so much. But if you believe in the bakery long-term, you stick with it through the ups and downs 🥐`,
    },
    {
      id: "what-is-etf",
      title: "What is an ETF?",
      category: "etfs",
      duration: "4 min",
      difficulty: "Beginner",
      summary: "Why ETFs are like buying a combo meal instead of individual items",
      content: `Think of an ETF like ordering a combo meal instead of picking every single item yourself. An ETF bundles together lots of different stocks (or bonds, or other stuff) so you get a little bit of everything in one purchase 🧺

VOO for example holds all 500 of the biggest US companies. So instead of you having to pick between Apple, Microsoft, Amazon, etc., you just buy VOO and you own tiny pieces of ALL of them automatically. It's like betting on America as a whole instead of trying to pick winners.

The biggest advantage? It's WAY less risky than putting all your money in one company. If one company has a terrible year, the other 499 in your ETF help balance it out. You're diversified without having to think about it.

Plus ETFs are super easy to buy and sell - just like individual stocks. And most of them have really low fees compared to mutual funds. That's why so many people love them, including me 💪`,
    },
    {
      id: "dividends-explained",
      title: "How Dividends Work",
      category: "dividends",
      duration: "5 min",
      difficulty: "Beginner",
      summary: "Getting paid just for holding stocks - yes really",
      content: `Okay this is one of my FAVORITE topics because dividends are literally free money for holding stocks. Well, not free exactly - you had to buy the stock - but you know what I mean 💰

Here's how it works: Some companies (usually the big established ones) share their profits with shareholders every quarter. If you own the stock, they deposit money directly into your account. No work required.

Let's say you own 100 shares of a stock that pays a $2 dividend per year. That's $200 deposited into your account annually, just for holding the stock. And if the stock price also goes up? Even better. You're making money two ways.

The dividend yield tells you what percentage return you're getting from dividends alone. A 3% yield means if you invest $10,000, you'll get about $300 per year in dividend payments. Some people build entire portfolios around high-dividend stocks and live off the passive income. 

It's like owning rental property but without dealing with tenants or toilets. The companies do all the work, you just collect the checks 🌸`,
    },
    {
      id: "bonds-basics",
      title: "Bonds for Beginners",
      category: "bonds",
      duration: "4 min",
      difficulty: "Beginner",
      summary: "The boring investment that protects your money",
      content: `Okay so bonds are honestly pretty boring compared to stocks, but that's kind of the point. They're the stable friend in your portfolio who always shows up on time and never causes drama 😌

When you buy a bond, you're basically lending money to a company or government. They promise to pay you back with interest after a set time - could be a few months, could be 30 years. In the meantime, you get regular interest payments.

Bonds don't usually make you rich, but they also don't crash the way stocks can. When the stock market is having a meltdown, bonds typically stay calm. That's why financial advisors always tell you to have "some" bonds in your portfolio - they balance out the crazy.

The rule of thumb: younger women can afford to take more risk with stocks because you have time to recover from crashes. As you get closer to retirement, you shift more money into bonds for safety. But even in your 20s and 30s, having like 10-20% in bonds can help you sleep better when markets get wild.

Think of bonds as the vegetables of your investment plate. Not exciting, but good for you 🥬`,
    },
    {
      id: "retirement-accounts",
      title: "401k vs IRA vs Roth",
      category: "retirement",
      duration: "6 min",
      difficulty: "Intermediate",
      summary: "Which retirement account is right for you",
      content: `Let me break down retirement accounts in a way that actually makes sense, because this stuff confuses everyone at first.

**401(k)**: This is through your employer. You contribute money from your paycheck BEFORE taxes (so it lowers your taxable income right now), your employer might match some of it (free money!), and it grows tax-free. You pay taxes when you take it out in retirement. Max contribution: $23,000/year.

**Traditional IRA**: Similar to 401k but you open it yourself. Same tax treatment - contribute pre-tax, pay taxes later. Max contribution: $7,000/year. Good if your employer doesn't offer a 401k or you want to save even more.

**Roth IRA**: My personal favorite for younger women. You contribute money AFTER paying taxes on it (so no immediate tax break), but then it grows tax-free forever and you can withdraw it tax-free in retirement. This is huge if you think you'll be in a higher tax bracket later. Max: also $7,000/year.

Here's my girlfriend take: If your employer matches 401k contributions, contribute at LEAST enough to get the full match - that's literally free money. Then max out your Roth IRA if you can. Then go back and put more in your 401k if you still have money to invest.

The Roth is especially good if you're young because you're probably in a lower tax bracket now than you will be in 30 years. Pay the taxes now while they're cheap 💎`,
    },
    {
      id: "market-volatility",
      title: "Don't Panic When Markets Drop",
      category: "stocks",
      duration: "5 min",
      difficulty: "Intermediate",
      summary: "What to do when your portfolio turns red",
      content: `Listen, the market WILL drop. Sometimes a lot. And when it happens it feels TERRIBLE to watch your portfolio turn red. But here's what you need to understand: market drops are normal and expected.

Since 1928, the S&P 500 has had a correction (drop of 10%+) every single year on average. And every few years there's a big crash of 20-30% or more. But over time, it always recovers and hits new highs. Always.

The key is TIME. If you're investing for retirement in 30 years, a crash today literally doesn't matter. In fact, it's a SALE. You're buying stocks at a discount while everyone else is panicking.

**What NOT to do when markets crash:**
- Don't sell everything in a panic
- Don't check your portfolio every hour
- Don't stop contributing to your 401k

**What TO do:**
- Keep investing like normal (or invest MORE if you can)
- Remember your long-term goals
- Maybe take a break from financial news for a bit

I know it's easier said than done when you see your money disappearing. But I promise you, the women who get rich from investing are the ones who hold steady through the scary times. The market rewards patience, not panic 🌸

If seeing red makes you too anxious, honestly just don't look at your portfolio during crashes. Set up automatic investments and check back in a year. Future you will thank you.`,
    },
    {
      id: "index-funds",
      title: "Why Index Funds Win",
      category: "etfs",
      duration: "5 min",
      difficulty: "Beginner",
      summary: "The simple strategy that beats most professional investors",
      content: `Here's a secret that the finance industry doesn't really want you to know: you don't need to be a genius to be a successful investor. You just need to buy index funds and be patient.

An index fund is an ETF or mutual fund that owns ALL the stocks in a particular index (like the S&P 500). It doesn't try to pick winners - it just owns everything. Sounds boring right?

But here's the kicker: over 90% of professional fund managers FAIL to beat index funds over time. These are literally PhDs with teams of analysts, and they can't beat the simple strategy of owning everything.

Why? Because trying to pick winning stocks is really hard. And even if you pick a winner, the fees you pay to actively managed funds eat up your gains. Index funds charge almost nothing (like 0.03% per year) so you keep more of your returns.

**The classic boring portfolio:**
- 70% S&P 500 index fund (VOO or VFIAX)
- 20% Total International index (VXUS)
- 10% Bonds (BND or AGG)

That's it. That's the portfolio. Invest regularly, rebalance once a year, and ignore the noise. It's not sexy but it works.

Warren Buffett literally told his wife to invest everything in index funds when he dies. If it's good enough for one of the best investors ever, it's good enough for us 💪`,
    },
    {
      id: "dollar-cost-averaging",
      title: "The Power of Investing Consistently",
      category: "stocks",
      duration: "4 min",
      difficulty: "Beginner",
      summary: "Why investing the same amount every month works magic",
      content: `Okay so dollar-cost averaging sounds complicated but it's actually the simplest strategy ever: invest the same amount of money at regular intervals, no matter what the market is doing.

Let's say you invest $500 every month into VOO:
- When prices are high, your $500 buys fewer shares
- When prices are low, your $500 buys MORE shares
- Over time, you automatically buy more when things are on sale

You don't have to time the market or stress about whether now is a "good time" to invest. You just set it and forget it.

The real magic happens over decades. That $500/month turns into $6,000/year. Invested for 30 years at average market returns (about 10%), you'd end up with over $1 million. From just $500 a month! 🤯

**Why this works:**
- You never try to time the market (which nobody can do anyway)
- You invest through crashes automatically (buying low)
- You build the habit of consistent saving
- It's emotionally easier than trying to invest lump sums

Even if you can only do $50 or $100 a month, START. The habit is more important than the amount when you're young. You can increase it as you earn more.

Set up automatic transfers from your checking to your investment account. Make it so automatic you forget it's happening. That's how wealth gets built - slowly, boringly, consistently 🌱`,
  
    },
    {
      id: "expense-ratios",
      title: "Why Fees Matter More Than You Think",
      category: "etfs",
      duration: "3 min",
      difficulty: "Intermediate",
      summary: "How tiny fees can cost you hundreds of thousands",
      content: `Let me blow your mind with some math real quick. A 1% fee doesn't sound like much right? But over your investing lifetime it can cost you literally hundreds of thousands of dollars.

If you invest $500/month for 30 years at 10% returns:
- With a 0.03% fee (index fund): $1,035,000
- With a 1% fee (actively managed fund): $865,000

That 1% fee cost you $170,000! Over a million dollars became $170,000 less just from fees. That's insane.

This is why I'm obsessed with low-cost index funds. Vanguard, Fidelity, and Schwab have funds with fees as low as 0.03%. Meanwhile some mutual funds charge 1-2% or more. They're literally taking a huge chunk of YOUR returns.

**Look for these on any fund:**
- Expense ratio under 0.20% = good
- Under 0.10% = great  
- Under 0.05% = amazing

The fund industry makes billions off investors who don't pay attention to fees. Don't be one of them. Every 0.1% you save in fees is more money that compounds for YOU instead of going to some fund company 💰

Always check the expense ratio before you invest. It's usually listed right on the fund's page. This one number can make or break your retirement.`,
    },
    {
      id: "mutual-funds-vs-etfs",
      title: "Mutual Funds vs ETFs",
      category: "mutual-funds",
      duration: "4 min",
      difficulty: "Beginner",
      summary: "What's the actual difference and which should you choose",
      content: `Okay so mutual funds and ETFs are super similar - both let you buy a basket of stocks in one purchase. But there are some key differences that actually matter.

**ETFs:**
- Trade like stocks (buy/sell anytime during market hours)
- Usually lower fees
- More tax-efficient
- Can be bought with fractional shares (on most platforms)
- Examples: VOO, SCHD, QQQ

**Mutual Funds:**
- Only trade once per day after market closes
- Sometimes higher fees (but not always)
- Can have minimum investments ($1,000+ sometimes)
- Examples: VFIAX, FXAIX, VTSAX

For most people, especially if you're just starting out, ETFs are the way to go. Lower fees, more flexibility, easier to buy and sell.

BUT there are some good mutual funds too, especially index mutual funds from Vanguard and Fidelity. If your 401k only offers mutual funds, that's fine - just make sure you're picking the low-cost index ones.

The most important thing isn't whether you choose ETF vs mutual fund. It's:
1. Picking low-cost options (under 0.20% expense ratio)
2. Diversifying broadly (like an S&P 500 fund)
3. Investing consistently

Don't overthink this decision. Both can work great. Just avoid the high-fee actively managed funds that try to convince you they're worth the extra cost (they're not) 🎯`,
    },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    const profile = await authService.getCurrentUser();
    setUser(profile);
    await loadCompletedLessons(session.user.id);
  };

  const loadCompletedLessons = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("completed", true);

      if (error) throw error;

      setCompletedLessons(data?.map((item) => item.lesson_id) || []);
    } catch (error) {
      console.error("Error loading lesson progress:", error);
      setCompletedLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLessonComplete = async (lessonId: string) => {
    if (!user?.id) return;

    const isCompleted = completedLessons.includes(lessonId);

    try {
      if (isCompleted) {
        // Mark as incomplete
        await supabase
          .from("lesson_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId);

        setCompletedLessons((prev) => prev.filter((id) => id !== lessonId));
      } else {
        // Mark as complete
        await supabase.from("lesson_progress").upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        });

        setCompletedLessons((prev) => [...prev, lessonId]);
      }
    } catch (error) {
      console.error("Error updating lesson progress:", error);
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesCategory =
      activeCategory === "all" || lesson.category === activeCategory;
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const progressPercentage = (completedLessons.length / lessons.length) * 100;

  const categories: { value: Category; label: string }[] = [
    { value: "all", label: "All" },
    { value: "stocks", label: "Stocks" },
    { value: "etfs", label: "ETFs" },
    { value: "mutual-funds", label: "Mutual Funds" },
    { value: "dividends", label: "Dividends" },
    { value: "bonds", label: "Bonds" },
    { value: "retirement", label: "Retirement" },
  ];

  return (
    <Layout>
      <SEO
        title="Bloom University - Learn Investing"
        description="Everything about investing explained by Dahlia in girlfriend language"
      />

      <div className="max-w-4xl mx-auto space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎓</span>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Bloom University</h1>
              <p className="text-muted-foreground">
                Everything about investing explained by Dahlia in girlfriend language
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Your Progress</p>
                <p className="text-xs text-muted-foreground">
                  {completedLessons.length} of {lessons.length} lessons completed
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary">
                {Math.round(progressPercentage)}%
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </Card>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border text-foreground h-12 rounded-xl"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={activeCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.value)}
              className={
                activeCategory === category.value
                  ? "bg-primary text-primary-foreground rounded-full"
                  : "border-border text-foreground hover:bg-primary/10 rounded-full"
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length > 0 ? (
          <div className="space-y-4">
            {filteredLessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              return (
                <Card
                  key={lesson.id}
                  className="p-6 bg-card border-border rounded-2xl hover:border-accent/50 transition-colors"
                >
                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLessonComplete(lesson.id)}
                      className={
                        isCompleted
                          ? "text-primary hover:text-primary/80"
                          : "text-muted-foreground hover:text-foreground"
                      }
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </Button>

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {lesson.title}
                          </h3>
                          {isCompleted && (
                            <Badge className="bg-primary/10 text-primary border-primary text-xs">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{lesson.summary}</p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration}</span>
                        </div>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {lesson.difficulty}
                        </Badge>
                        <span>•</span>
                        <span className="capitalize">{lesson.category.replace("-", " ")}</span>
                      </div>

                      {/* Lesson Content (Expandable) */}
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-accent hover:text-accent/80 transition-colors list-none">
                          Read lesson →
                        </summary>
                        <div className="mt-4 p-4 bg-muted/30 rounded-xl">
                          <div className="prose prose-sm max-w-none text-foreground">
                            <p className="whitespace-pre-line leading-relaxed">
                              {lesson.content}
                            </p>
                            <div className="mt-4 p-3 bg-card rounded-lg border border-border">
                              <p className="text-xs text-muted-foreground italic">
                                This is educational content only · Not financial advice · Always do
                                your own research before investing 💛 — Dahlia
                              </p>
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 bg-card border-border rounded-2xl text-center">
            <p className="text-muted-foreground mb-2">No lessons found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or category filter
            </p>
          </Card>
        )}

        {/* Dahlia's Encouragement */}
        <Card className="p-6 bg-accent/5 border-accent/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <img
              src="/bloom-logo.png"
              alt="Dahlia"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-accent">Dahlia's Tip 🌸</p>
              <p className="text-sm text-foreground leading-relaxed">
                Learning about investing is just as important as actually investing. Take your time
                with these lessons - there's no rush. The knowledge you gain here will help you make
                confident decisions with your money for the rest of your life. You've got this! 💛
              </p>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="p-4 bg-muted/30 border-muted-foreground/20 rounded-xl">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not
            liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}