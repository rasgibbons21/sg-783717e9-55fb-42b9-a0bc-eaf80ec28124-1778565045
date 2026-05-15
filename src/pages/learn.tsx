import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { Search, ArrowLeft, Clock, CheckCircle2, Circle, ChevronRight, Bookmark, BookmarkCheck } from "lucide-react";

type Category = "All" | "Stocks" | "ETFs" | "Mutual Funds" | "Dividends" | "Bonds" | "Retirement";

interface Lesson {
  id: string;
  title: string;
  category: string;
  readTime: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  content: string;
  keyTakeaway: string;
  relatedTopics: string[];
}

export default function Learn() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [bookmarkedLessons, setBookmarkedLessons] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const lessons: Lesson[] = [
    {
      id: "what-is-stock",
      title: "What is a Stock",
      category: "Stocks",
      readTime: 3,
      difficulty: "Beginner",
      summary: "Understanding company ownership and how stocks work",
      content: `Okay so here's the deal — when you buy a stock you're literally buying a tiny piece of a real company. Like if you buy one share of Apple stock you own a little slice of Apple 🍎

Not enough to boss Tim Cook around or anything 😂 but you're officially a part owner. When the company does well and makes money their stock price usually goes up. When they have a rough quarter the price might drop.

Here's the cool part: some companies share their profits with you through dividends (we'll talk about those later). And if the company grows over time your tiny slice becomes more valuable.

That's literally how people build wealth through the stock market girl. You're not just gambling — you're owning real businesses that make real products and real money.

The key is thinking long term. Day to day the price bounces around like crazy but over years and decades stocks have historically gone up. That's why we invest instead of just saving cash 💪`,
      keyTakeaway: "A stock = tiny piece of a real company. You make money when the company grows. Think long term not day to day.",
      relatedTopics: ["what-are-dividends", "bull-vs-bear", "market-cap"],
    },
    {
      id: "what-is-etf",
      title: "What is an ETF",
      category: "ETFs",
      readTime: 4,
      difficulty: "Beginner",
      summary: "The combo meal of investing explained",
      content: `Think of an ETF like ordering a combo meal instead of picking every single item yourself. An ETF (Exchange Traded Fund) bundles together lots of different stocks into one package so you get a little bit of everything 🧺

For example VOO holds 500 of the biggest US companies. So when you buy one share of VOO you're getting a tiny piece of Apple Microsoft Amazon Google Tesla and 495 other companies all at once. It's literally diversification in a single purchase.

The genius of this is risk reduction. If one company has a terrible day but the other 499 are doing fine your investment barely notices. Compare that to putting all your money in one stock — if that company tanks you're screwed.

ETFs also have super low fees compared to mutual funds. We're talking like 0.03% per year for VOO. That's basically free. The stock market historically returns about 10% per year so you're keeping almost all of it.

Bottom line: ETFs are perfect for beginners because you get instant diversification without having to pick individual winners. You're betting on the market as a whole not on your ability to find the next Tesla. Instant diversification sis 💪`,
      keyTakeaway: "ETFs = bundle of many stocks in one. Less risk than single stocks. Perfect for beginners who want diversification.",
      relatedTopics: ["what-is-mutual-fund", "index-funds", "active-vs-passive"],
    },
    {
      id: "what-is-mutual-fund",
      title: "What is a Mutual Fund",
      category: "Mutual Funds",
      readTime: 4,
      difficulty: "Beginner",
      summary: "Professional money management explained simply",
      content: `A mutual fund is like an ETF's older more expensive cousin. It's also a bundle of stocks but with one big difference — there's a professional fund manager making the decisions for you 💼

So instead of just tracking an index like the S&P 500 this person is actively buying and selling stocks trying to beat the market. They're getting paid to be smart about your money which sounds great right?

Here's the catch: they charge way more in fees. Where an ETF might cost 0.03% per year a mutual fund might charge 1% or even 2%. That might not sound like much but over 30 years that difference is HUGE.

And here's the kicker — most actively managed funds don't even beat the market after fees. Like 80% of them underperform a basic index fund. So you're paying extra for worse results most of the time 😬

That said some women prefer having a professional manage their money especially when starting out. It feels safer. And there are some legit good mutual funds out there. Just know what you're paying for and whether it's worth it to you 🛍️`,
      keyTakeaway: "Mutual funds = professional manager picking stocks for you. Higher fees than ETFs. Most don't beat the market.",
      relatedTopics: ["what-is-etf", "index-funds", "active-vs-passive"],
    },
    {
      id: "what-are-dividends",
      title: "What are Dividends",
      category: "Dividends",
      readTime: 4,
      difficulty: "Beginner",
      summary: "Getting paid just for holding stocks",
      content: `Girl dividends are literally getting paid just for owning a stock. Companies share their profits with shareholders every quarter and that money shows up in your account 💰

Here's how it works: If you own 100 shares of a company that pays $1 per share in dividends you get $100 deposited four times a year. Just for holding the stock. You don't have to do anything.

The dividend yield tells you how much you're getting paid. If a stock costs $100 and pays $4 per year in dividends that's a 4% yield. Compare that to a savings account paying 0.5% and you can see why dividend investing is popular.

Companies that pay consistent dividends are usually stable mature businesses. Think Coca-Cola Johnson & Johnson Procter & Gamble. They've been around forever they're not going anywhere and they reward shareholders for loyalty.

You can take the dividends as cash or reinvest them to buy more shares (that's called a DRIP and we'll talk about it later). Either way it's one of my favorite parts of investing because you're getting paid while you wait for the stock price to grow 💛`,
      keyTakeaway: "Dividends = cash payments just for owning stock. Usually paid quarterly. Free money for being patient.",
      relatedTopics: ["drip-investing", "what-is-stock", "index-funds"],
    },
    {
      id: "bull-vs-bear",
      title: "Bull vs Bear Market",
      category: "Stocks",
      readTime: 3,
      difficulty: "Beginner",
      summary: "What people mean when they say the market is bullish or bearish",
      content: `Okay so you'll hear people say "we're in a bull market" or "it's a bear market right now" — here's what that actually means 📈📉

Bull market = prices going up. Think of a bull charging forward with its horns pointing up. When the market rises 20% or more from a recent low that's officially a bull market. Everyone's feeling good the news is positive and your portfolio is growing.

Bear market = prices going down. A bear swipes down with its paws. When the market drops 20% or more from a recent high that's a bear market. People panic the news is scary and your portfolio shrinks.

Here's what's important: both are completely normal and temporary. The stock market has had like 26 bear markets since 1928 and every single one ended eventually. The longest bull market lasted 11 years. The average bear market lasts about 9 months.

So when you see red don't panic and sell everything. That's literally when stocks are on sale. The best investors keep buying during bear markets because they know historically the market always recovers and reaches new highs. Stay calm and think long term girl 💪`,
      keyTakeaway: "Bull = up 20%+ (good). Bear = down 20%+ (scary but temporary). Both are normal. Don't panic sell during bear markets.",
      relatedTopics: ["what-is-stock", "dollar-cost-averaging", "index-funds"],
    },
    {
      id: "market-cap",
      title: "What is Market Cap",
      category: "Stocks",
      readTime: 3,
      difficulty: "Beginner",
      summary: "How to measure a company's total value",
      content: `Market cap (market capitalization) is just a fancy way of saying how much the entire company is worth. It's calculated super simply: stock price × total number of shares 🎯

So if a company's stock is $100 and there are 1 million shares out there the market cap is $100 million. That's how much it would theoretically cost to buy the entire company.

Companies get grouped into size categories:
- Large cap: $10 billion or more (Apple Microsoft Amazon)
- Mid cap: $2-10 billion (stable growing companies)
- Small cap: Under $2 billion (newer riskier companies)

Large caps are usually safer but grow slower. They're the steady reliable friend. Small caps can explode in value but they can also crash hard. They're the wild unpredictable friend 😂

Most financial advisors suggest having a mix. Put the bulk of your money in large caps for stability then sprinkle in some mid and small caps for growth potential. That way you're not too boring or too risky — you're balanced.

Don't confuse market cap with stock price btw. A $10 stock of a huge company might be a better value than a $1000 stock of a tiny company. Market cap tells the full story 💡`,
      keyTakeaway: "Market cap = company's total value (price × shares). Large cap = safer. Small cap = riskier but more growth potential.",
      relatedTopics: ["what-is-stock", "what-is-etf", "active-vs-passive"],
    },
    {
      id: "pe-ratio",
      title: "What is PE Ratio",
      category: "Stocks",
      readTime: 4,
      difficulty: "Intermediate",
      summary: "Is this stock expensive or a bargain?",
      content: `The PE ratio (Price to Earnings ratio) tells you if a stock is expensive or cheap compared to how much money the company actually makes. It's like asking "am I paying $50 for a $10 shirt or is this actually worth it?" 🔍

The formula is: Stock Price ÷ Earnings Per Share = PE Ratio

So if a stock costs $100 and the company earns $5 per share the PE is 20. That means you're paying $20 for every $1 of earnings. The lower the number the cheaper the stock relative to its profits.

Average PE for the S&P 500 is usually around 15-20. If you see a PE of 50 that stock is expensive — investors are betting on huge future growth. If you see a PE of 8 that's cheap — either it's a value opportunity or something's wrong with the company.

High PE isn't always bad. Tech companies like Tesla or Netflix have high PEs because investors believe they'll grow like crazy. Low PE isn't always good — sometimes there's a reason nobody wants the stock 🤔

Use PE to compare companies in the same industry. Comparing Apple's PE to a utility company's PE is pointless — they're in totally different businesses with different growth expectations. Stay in your lane when comparing girl 💪`,
      keyTakeaway: "PE ratio = stock price ÷ earnings. Low = cheap. High = expensive (or high growth expected). Compare within same industry only.",
      relatedTopics: ["what-is-stock", "market-cap", "active-vs-passive"],
    },
    {
      id: "index-funds",
      title: "Index Funds Explained",
      category: "ETFs",
      readTime: 4,
      difficulty: "Beginner",
      summary: "Why boring investing wins",
      content: `An index fund is a type of mutual fund or ETF that tracks a market index like the S&P 500. Instead of trying to beat the market it just copies it. Sounds boring right? That's exactly why it works 🎯

The S&P 500 for example holds the 500 biggest US companies. When you buy an S&P 500 index fund you own a piece of all 500. You're not betting on individual companies — you're betting on American business as a whole.

Here's why this strategy crushes most active investing:
- Super low fees (0.03% vs 1%+ for active funds)
- No risk of picking the wrong stocks
- Historically returns 10% per year on average
- Warren Buffett literally recommends this

The math is wild: if you invest $500 a month in an S&P 500 index fund for 30 years at 10% returns you end up with over $1 million. That's from just $180k of your own money. The rest is compound growth doing the work 🚀

Index funds are my #1 recommendation for beginners. They're boring they're simple and they work. You don't need to watch the market or pick stocks. Just buy and hold and let time do its thing. Boring wins sis 💰`,
      keyTakeaway: "Index funds = tracks the whole market (like S&P 500). Boring simple and historically beats 90% of active investors. Start here.",
      relatedTopics: ["what-is-etf", "dollar-cost-averaging", "active-vs-passive"],
    },
    {
      id: "dollar-cost-averaging",
      title: "Dollar Cost Averaging",
      category: "Retirement",
      readTime: 4,
      difficulty: "Beginner",
      summary: "The strategy that removes timing stress",
      content: `Dollar cost averaging (DCA) means investing the same amount of money at regular intervals no matter what the market is doing. Like $200 every month on the 1st. That's it. Super simple 📅

Why is this brilliant? Because it takes away the stress of trying to time the market. You're not sitting there wondering "is now a good time to buy?" You just buy automatically like clockwork.

Here's what happens: when prices are high your $200 buys fewer shares. When prices are low your $200 buys more shares. Over time you average out the cost and you end up buying more when things are cheap 💡

Compare this to trying to time the market perfectly — which is literally impossible even for professionals. People who wait for the "perfect moment" usually miss it or panic and buy at the top. DCA removes that emotional roller coaster.

This works especially well with 401k contributions. You're automatically investing every paycheck regardless of what the market is doing. You're buying the highs the lows and everything in between. And historically that strategy beats trying to be clever.

Set it and forget it girl. That's the secret to building wealth without the stress. Consistency beats timing every single time 💪`,
      keyTakeaway: "DCA = invest same amount regularly (like $200/month). Removes timing stress. You buy more when prices are low. Set and forget.",
      relatedTopics: ["index-funds", "roth-ira", "bull-vs-bear"],
    },
    {
      id: "roth-ira",
      title: "What is a Roth IRA",
      category: "Retirement",
      readTime: 5,
      difficulty: "Beginner",
      summary: "Tax-free growth for your future self",
      content: `A Roth IRA is literally one of the best deals the government gives us for retirement. You put in money you've already paid taxes on and then it grows TAX FREE forever. When you take it out in retirement you pay ZERO taxes 🚀

Let me show you why this is huge: Say you put in $6,500 per year (the 2024 limit) from age 25 to 65. That's $260k of your own money. At 10% returns that grows to $3.5 MILLION. And you don't pay taxes on that $3.2 million of growth. That's insane.

Compare that to a traditional 401k where you pay taxes when you withdraw. If you're in the 24% tax bracket that's $840,000 going to the IRS. With a Roth IRA that money stays in your pocket 💰

Rules to know:
- You can contribute $6,500 per year (or $7,000 if you're over 50)
- You need earned income to contribute
- You can withdraw your contributions anytime penalty free
- Income limits apply but there are workarounds

Start a Roth IRA as early as possible. Time is your biggest advantage here. Even small contributions in your 20s become massive amounts by retirement because of compound growth. Future you will thank present you so much girl 💛`,
      keyTakeaway: "Roth IRA = tax-free growth forever. Contribute early for maximum compound growth. One of the best retirement accounts period.",
      relatedTopics: ["dollar-cost-averaging", "index-funds", "what-are-dividends"],
    },
    {
      id: "drip-investing",
      title: "DRIP Investing",
      category: "Dividends",
      readTime: 4,
      difficulty: "Beginner",
      summary: "Automatically reinvesting dividends for compound growth",
      content: `DRIP stands for Dividend Reinvestment Plan. It's basically autopilot for growing your wealth through dividends 🔄

Here's how it works: Instead of taking dividend payments as cash they automatically buy more shares of the stock. So if you own 100 shares of a stock paying $1 per share and it costs $50 per share your $100 dividend buys 2 more shares. Now you own 102 shares.

Next quarter those 102 shares pay dividends which buy even more shares. And so on forever. This is compound growth in action — your money making money that makes more money 💸

Why is this powerful? Let's say you invest $10,000 in a dividend stock with a 4% yield. Without DRIP in 30 years at 8% total returns you'd have about $100,000. With DRIP reinvesting those dividends you'd have closer to $130,000. That's an extra $30k for literally doing nothing.

Most brokerages offer automatic DRIP enrollment. Just turn it on and forget about it. You won't see the dividend cash hit your account but your share count will slowly grow every quarter.

When you're young and don't need the income DRIP is the move. When you retire you can turn it off and take the dividends as cash for living expenses. It's like planting a money tree and watching it grow sis 🌱`,
      keyTakeaway: "DRIP = automatically reinvest dividends to buy more shares. Compound growth on autopilot. Turn it on and forget it.",
      relatedTopics: ["what-are-dividends", "dollar-cost-averaging", "index-funds"],
    },
    {
      id: "active-vs-passive",
      title: "Active vs Passive Investing",
      category: "ETFs",
      readTime: 5,
      difficulty: "Intermediate",
      summary: "Two completely different philosophies",
      content: `This is probably the biggest debate in investing. Active means trying to beat the market by picking individual stocks. Passive means buying index funds and holding forever 🎯

Active investing: You're constantly researching buying and selling trying to find undervalued stocks before everyone else. It's exciting hands-on and potentially very profitable. But it's also time consuming stressful and statistically most people lose to the market.

Passive investing: You buy a total market index fund or S&P 500 fund and hold it for decades. Boring as hell but historically returns 10% per year. No research needed no stress just patience 😴

Here's what the data shows: Over 15 years about 90% of active fund managers underperform the S&P 500. Read that again. The professionals with fancy degrees and insider access lose to a simple index fund.

So why doesn't everyone just do passive? Because it's not exciting. Humans want to feel smart and in control. Buying an index fund and forgetting about it doesn't feel like investing — it feels like giving up.

My take: If you're new go passive with index funds. Put 80-90% of your portfolio there. If you want to scratch the active itch use 10-20% to pick individual stocks. That way you get the stability of passive plus the fun of active without risking everything. Best of both worlds girl 💪`,
      keyTakeaway: "Active = pick stocks (exciting but usually loses). Passive = index funds (boring but wins). Go 80% passive 20% active to balance.",
      relatedTopics: ["index-funds", "what-is-etf", "what-is-mutual-fund"],
    },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedLesson && contentRef.current) {
      const handleScroll = () => {
        const element = contentRef.current;
        if (!element || hasScrolledToBottom) return;

        const scrollPosition = element.scrollTop + element.clientHeight;
        const scrollHeight = element.scrollHeight;

        // If scrolled to within 50px of bottom, mark as read
        if (scrollPosition >= scrollHeight - 50) {
          setHasScrolledToBottom(true);
          handleCompleteLesson(selectedLesson);
        }
      };

      const element = contentRef.current;
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [selectedLesson, hasScrolledToBottom]);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    const profile = await authService.getCurrentUser();
    setUser(profile);
    await loadProgress(session.user.id);
  };

  const loadProgress = async (userId: string) => {
    try {
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("completed", true);

      const { data: userData } = await supabase
        .from("users")
        .select("bookmarked_lessons")
        .eq("id", userId)
        .single();

      if (progressData) {
        setCompletedLessons(progressData.map((p) => p.lesson_id));
      }

      if (userData?.bookmarked_lessons) {
        setBookmarkedLessons(userData.bookmarked_lessons);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    if (!user?.id || completedLessons.includes(lessonId)) return;

    try {
      const { error } = await supabase
        .from("lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      if (!error) {
        setCompletedLessons([...completedLessons, lessonId]);
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  const toggleBookmark = async (lessonId: string) => {
    if (!user?.id) return;

    const isBookmarked = bookmarkedLessons.includes(lessonId);
    const newBookmarks = isBookmarked
      ? bookmarkedLessons.filter((id) => id !== lessonId)
      : [...bookmarkedLessons, lessonId];

    try {
      const { error } = await supabase
        .from("users")
        .update({ bookmarked_lessons: newBookmarks })
        .eq("id", user.id);

      if (!error) {
        setBookmarkedLessons(newBookmarks);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || lesson.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: Category[] = [
    "All",
    "Stocks",
    "ETFs",
    "Mutual Funds",
    "Dividends",
    "Bonds",
    "Retirement",
  ];

  const completionPercentage = Math.round(
    (completedLessons.length / lessons.length) * 100
  );

  if (selectedLesson) {
    const lesson = lessons.find((l) => l.id === selectedLesson);
    if (!lesson) return null;

    const isCompleted = completedLessons.includes(lesson.id);
    const isBookmarked = bookmarkedLessons.includes(lesson.id);
    const relatedLessons = lessons.filter((l) =>
      lesson.relatedTopics.includes(l.id)
    );

    return (
      <Layout>
        <SEO
          title={`${lesson.title} - Bloom University`}
          description={lesson.summary}
        />
        <div
          ref={contentRef}
          className="min-h-screen bg-background pb-20 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedLesson(null);
                  setHasScrolledToBottom(false);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to lessons
              </Button>
            </div>

            {/* Lesson Header */}
            <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-accent/20 text-accent border-accent/30">
                      {lesson.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-muted-foreground/30 text-muted-foreground"
                    >
                      {lesson.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {lesson.readTime} min read
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {lesson.title}
                  </h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(lesson.id)}
                  className={
                    isBookmarked
                      ? "text-accent hover:text-accent/80"
                      : "text-muted-foreground hover:text-accent"
                  }
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src="/bloom-logo.png"
                  alt="Dahlia"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">Dahlia</p>
                  <p className="text-sm text-muted-foreground">
                    Bloom's Investing Expert
                  </p>
                </div>
              </div>
            </Card>

            {/* Lesson Content */}
            <Card className="p-6 bg-card border-border rounded-2xl">
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {lesson.content}
                </p>
              </div>

              {/* Key Takeaway */}
              <div className="mt-8 p-4 bg-primary/10 border-l-4 border-primary rounded-r-lg">
                <p className="text-sm font-semibold text-primary mb-2">
                  Key Takeaway
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {lesson.keyTakeaway}
                </p>
              </div>

              {/* Mark Complete Button */}
              {!isCompleted && (
                <Button
                  onClick={() => handleCompleteLesson(lesson.id)}
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              )}

              {isCompleted && (
                <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                  <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-primary">
                    Lesson completed! 🎉
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <p className="mt-6 text-xs text-muted-foreground text-center">
                This is educational content only and does not constitute
                financial advice. Always invest what feels right for you 💛
              </p>
            </Card>

            {/* Related Topics */}
            {relatedLessons.length > 0 && (
              <Card className="p-6 bg-card border-border rounded-2xl">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Related Topics
                </h3>
                <div className="space-y-3">
                  {relatedLessons.map((related) => (
                    <button
                      key={related.id}
                      onClick={() => {
                        setSelectedLesson(related.id);
                        setHasScrolledToBottom(false);
                        window.scrollTo(0, 0);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {completedLessons.includes(related.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="text-left">
                          <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                            {related.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs border-muted-foreground/30 text-muted-foreground"
                            >
                              {related.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {related.readTime} min
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Bloom University - Learn Investing"
        description="Everything about investing explained by Dahlia in girlfriend language"
      />
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Bloom University 🎓
            </h1>
            <p className="text-muted-foreground">
              Everything about investing explained by Dahlia in girlfriend
              language
            </p>
          </div>

          {/* Progress Bar */}
          <Card className="p-6 bg-card border-accent/20 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">
                Your Learning Progress
              </p>
              <Badge className="bg-accent/20 text-accent border-accent/30">
                {completionPercentage}%
              </Badge>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedLessons.length} of {lessons.length} lessons completed
            </p>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-foreground"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? "bg-accent text-white border-accent"
                    : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Lesson Cards */}
          <div className="space-y-3">
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isBookmarked = bookmarkedLessons.includes(lesson.id);
                return (
                  <Card
                    key={lesson.id}
                    className="p-4 bg-card border-border rounded-xl hover:border-accent/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedLesson(lesson.id)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src="/bloom-logo.png"
                        alt="Dahlia"
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                                {lesson.category}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {lesson.summary}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {lesson.readTime} min
                              </div>
                              <Badge
                                variant="outline"
                                className="text-xs border-muted-foreground/30 text-muted-foreground"
                              >
                                {lesson.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(lesson.id);
                              }}
                              className={`p-1 rounded transition-colors ${
                                isBookmarked
                                  ? "text-accent hover:text-accent/80"
                                  : "text-muted-foreground hover:text-accent"
                              }`}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-5 h-5" />
                              ) : (
                                <Bookmark className="w-5 h-5" />
                              )}
                            </button>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-8 bg-card border-border rounded-xl text-center">
                <p className="text-muted-foreground mb-2">No lessons found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or category filter
                </p>
              </Card>
            )}
          </div>

          {/* Dahlia's Encouragement */}
          <Card className="p-6 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20 rounded-2xl">
            <div className="flex items-start gap-4">
              <img
                src="/bloom-logo.png"
                alt="Dahlia"
                className="w-14 h-14 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-2">
                  Keep learning girl! 💛
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Every lesson you complete gets you one step closer to
                  financial confidence. Take your time absorb the info and come
                  back whenever you need a refresher. I'm always here to break
                  things down for you.
                </p>
                <p className="text-sm text-foreground/80 mt-2">
                  You've got this! 💪
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  — Dahlia 🌺
                </p>
              </div>
            </div>
          </Card>

          {/* Disclaimer */}
          <Card className="p-4 bg-muted/30 border-border rounded-xl">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              This is educational content only and does not constitute financial
              advice. Bloom is not liable for any investment decisions or
              losses.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}