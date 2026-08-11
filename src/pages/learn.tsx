/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { Search, ArrowLeft, Clock, CheckCircle2, Circle, ChevronRight, Bookmark, BookmarkCheck, Award, Lock, Building2, BookOpen, Sparkles, Route, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { UpgradeModal } from "@/components/UpgradeModal";
import { BloomGarden } from "@/components/BloomGarden";
import { PansyContextCard } from "@/components/PansyContextCard";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

type Category = "All" | "Stocks" | "ETFs" | "Mutual Funds" | "Dividends" | "Bonds" | "Retirement" | "Trading Psychology" | "Income Streams";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

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
  quiz: QuizQuestion[];
  isPro?: boolean;
}


export default function Learn() {
  const router = useRouter();
  const { isPro, isLoading: subscriptionLoading } = useSubscription();
  const [user, setUser] = useState<any>(null);
  const [showLearnUpgradeModal, setShowLearnUpgradeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [bookmarkedLessons, setBookmarkedLessons] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<{ experience_level: string | null; investment_goals: string[] | null; risk_tolerance: string | null } | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const lessons: Lesson[] = [
    {
      id: "what-is-stock",
      title: "What is a Stock",
      category: "Stocks",
      isPro: false,
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
      quiz: [
        {
          question: "When you buy a stock, what are you actually buying?",
          options: ["A loan to the company", "A tiny piece of ownership in the company", "A guaranteed return on investment", "The company's debt"],
          correctAnswer: 1,
          explanation: "Exactly girl! You're buying actual ownership in the company. You become a part owner even if it's just a tiny piece 💪"
        },
        {
          question: "What's the best way to approach stock investing according to Pansy?",
          options: ["Day trade for quick profits", "Sell immediately when prices drop", "Think long term and hold for years", "Only buy when prices are at their highest"],
          correctAnswer: 2,
          explanation: "Yes! Long term thinking is key. Day to day the market is crazy but over years it historically goes up. Patience wins sis 🌱"
        },
        {
          question: "What happens to your stock's value when the company does well?",
          options: ["It automatically gets sold", "The price usually goes up", "You have to pay more taxes", "Nothing changes"],
          correctAnswer: 1,
          explanation: "That's right! When the company makes money and grows the stock price usually increases. Your tiny slice becomes more valuable 📈"
        }
      ]
    },
    {
      id: "what-is-etf",
      title: "What is an ETF",
      category: "ETFs",
      isPro: false,
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
      quiz: [
        {
          question: "What's the main benefit of buying an ETF over individual stocks?",
          options: ["ETFs guarantee profits", "You get instant diversification across many companies", "ETFs never lose value", "You can only buy ETFs through special brokers"],
          correctAnswer: 1,
          explanation: "Exactly! ETFs give you instant diversification. One purchase = tiny pieces of hundreds of companies. If one tanks the others hold you up 💪"
        },
        {
          question: "How many companies does VOO (an S&P 500 ETF) hold?",
          options: ["50 companies", "100 companies", "500 companies", "1000 companies"],
          correctAnswer: 2,
          explanation: "Yes girl! VOO holds 500 of the biggest US companies. That's Apple Microsoft Amazon Google Tesla and 495 others all in one 🧺"
        },
        {
          question: "What are typical ETF fees compared to mutual funds?",
          options: ["ETFs cost much more", "ETFs cost about the same", "ETFs cost much less (like 0.03% vs 1%+)", "ETFs have no fees at all"],
          correctAnswer: 2,
          explanation: "That's right! ETFs have super low fees (0.03% for VOO) vs mutual funds (1%+). Over 30 years that difference is HUGE 💰"
        }
      ]
    },
    {
      id: "what-is-mutual-fund",
      title: "What is a Mutual Fund",
      category: "Mutual Funds",
      isPro: false,
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
      quiz: [
        {
          question: "What's the main difference between a mutual fund and an ETF?",
          options: ["Mutual funds can only be bought by wealthy investors", "Mutual funds have a professional manager actively picking stocks", "ETFs are illegal in most states", "There is no difference"],
          correctAnswer: 1,
          explanation: "Yes! Mutual funds have a professional manager actively buying and selling trying to beat the market. ETFs just track an index 📊"
        },
        {
          question: "What percentage of actively managed mutual funds underperform the S&P 500?",
          options: ["About 20%", "About 50%", "About 80%", "About 100%"],
          correctAnswer: 2,
          explanation: "Yep about 80%! Most actively managed funds lose to a simple S&P 500 index fund after fees. The data doesn't lie girl 📉"
        },
        {
          question: "Why do mutual funds typically charge higher fees than ETFs?",
          options: ["Because they're older", "To pay the professional fund manager", "They don't - fees are the same", "Government regulations require it"],
          correctAnswer: 1,
          explanation: "Correct! You're paying that fund manager's salary. They charge 1-2% vs 0.03% for ETFs. That adds up over time 💸"
        }
      ]
    },
    {
      id: "what-are-dividends",
      title: "What are Dividends",
      category: "Dividends",
      isPro: false,
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
      quiz: [
        {
          question: "How often are dividends typically paid?",
          options: ["Once a year", "Every month", "Every quarter (4 times a year)", "Every day"],
          correctAnswer: 2,
          explanation: "That's right! Most dividend stocks pay quarterly so you get that cash hitting your account 4 times a year 💰"
        },
        {
          question: "If a stock costs $100 and pays $4 per year in dividends, what's the yield?",
          options: ["2%", "4%", "8%", "10%"],
          correctAnswer: 1,
          explanation: "Yes! $4 ÷ $100 = 4% yield. That's how much you're earning just for holding the stock. Compare that to a 0.5% savings account 📈"
        },
        {
          question: "What type of companies typically pay consistent dividends?",
          options: ["Brand new startup companies", "Stable mature businesses like Coca-Cola", "Companies that are losing money", "Only tech companies"],
          correctAnswer: 1,
          explanation: "Exactly! Stable mature companies that have been around forever usually pay dividends. They're not going anywhere and they reward loyalty 💪"
        }
      ]
    },
    {
      id: "bull-vs-bear",
      title: "Bull vs Bear Market",
      category: "Stocks",
      isPro: false,
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
      quiz: [
        {
          question: "What defines a bull market?",
          options: ["When prices drop 20% or more", "When prices rise 20% or more", "When prices stay flat", "When you buy cattle stocks"],
          correctAnswer: 1,
          explanation: "Yes! Bull market = prices rising 20%+ from a recent low. Think bull charging forward with horns up 📈"
        },
        {
          question: "How long does the average bear market last?",
          options: ["About 9 months", "About 5 years", "About 1 month", "They never end"],
          correctAnswer: 0,
          explanation: "That's right! Average bear market is about 9 months. They're temporary girl. Every single one has ended eventually 💪"
        },
        {
          question: "What should you do during a bear market according to Pansy?",
          options: ["Panic and sell everything", "Stop investing completely", "Stay calm and keep buying (stocks are on sale)", "Move all money to cash"],
          correctAnswer: 2,
          explanation: "Exactly! Bear markets = stocks on sale. The best investors keep buying because they know the market always recovers. Stay calm sis 🌱"
        }
      ]
    },
    {
      id: "market-cap",
      title: "What is Market Cap",
      category: "Stocks",
      isPro: false,
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
      quiz: [
        {
          question: "How do you calculate market cap?",
          options: ["Stock price ÷ number of shares", "Stock price × number of shares", "Stock price + number of shares", "Stock price - number of shares"],
          correctAnswer: 1,
          explanation: "Yes! Market cap = stock price × total shares. Super simple math that tells you the company's total value 🎯"
        },
        {
          question: "Which type of company is typically considered safest?",
          options: ["Small cap (under $2 billion)", "Mid cap ($2-10 billion)", "Large cap ($10 billion+)", "They're all equally safe"],
          correctAnswer: 2,
          explanation: "That's right! Large caps like Apple and Microsoft are usually safer but grow slower. They're the steady reliable friend 💪"
        },
        {
          question: "Can a $10 stock be more valuable than a $1000 stock?",
          options: ["No, higher price always means more valuable", "Yes, if the $10 stock has a much higher market cap", "Stock price and value are completely unrelated", "Only if it's a tech company"],
          correctAnswer: 1,
          explanation: "Exactly! Market cap tells the full story not just stock price. A $10 stock of a huge company can be worth way more than a $1000 stock of a tiny company 💡"
        }
      ]
    },
    {
      id: "pe-ratio",
      title: "What is PE Ratio",
      category: "Stocks",
      isPro: false,
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
      quiz: [
        {
          question: "What does PE ratio stand for?",
          options: ["Price to Earnings", "Profit to Equity", "Price to Equity", "Performance to Earnings"],
          correctAnswer: 0,
          explanation: "Yes! PE = Price to Earnings. It shows how much you're paying for each dollar of the company's profits 🔍"
        },
        {
          question: "What's the average PE ratio for the S&P 500?",
          options: ["Around 5", "Around 15-20", "Around 50", "Around 100"],
          correctAnswer: 1,
          explanation: "That's right! S&P 500 average is usually 15-20. Higher than that = expensive. Lower = cheap (or there's a problem) 📊"
        },
        {
          question: "Is a high PE ratio always bad?",
          options: ["Yes, high PE always means overpriced", "No, it can mean investors expect high growth", "PE ratio doesn't matter", "Only for tech companies"],
          correctAnswer: 1,
          explanation: "Exactly! High PE can mean investors believe the company will grow like crazy (like Tesla). It's not automatically bad girl 💪"
        }
      ]
    },
    {
      id: "index-funds",
      title: "Index Funds Explained",
      category: "ETFs",
      isPro: false,
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
      quiz: [
        {
          question: "What does an S&P 500 index fund do?",
          options: ["Tries to beat the market by picking stocks", "Tracks the 500 biggest US companies", "Only invests in tech stocks", "Guarantees 10% returns"],
          correctAnswer: 1,
          explanation: "Yes! It tracks the 500 biggest US companies. You're betting on America as a whole not individual stocks 🎯"
        },
        {
          question: "What are typical index fund fees compared to active funds?",
          options: ["Higher (2%+)", "About the same (1%)", "Much lower (0.03%)", "Index funds have no fees"],
          correctAnswer: 2,
          explanation: "That's right! Index funds like VOO charge 0.03% vs 1%+ for active funds. That difference is HUGE over 30 years 💰"
        },
        {
          question: "What percentage of active fund managers underperform index funds?",
          options: ["About 20%", "About 50%", "About 90%", "About 10%"],
          correctAnswer: 2,
          explanation: "Yep about 90%! Most professionals with fancy degrees lose to a boring index fund. That's why Warren Buffett recommends them 📈"
        }
      ]
    },
    {
      id: "dollar-cost-averaging",
      title: "Dollar Cost Averaging",
      category: "Retirement",
      isPro: false,
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
      quiz: [
        {
          question: "What is dollar cost averaging?",
          options: ["Investing all your money at once", "Investing the same amount at regular intervals", "Only buying when prices are low", "Trying to time the market perfectly"],
          correctAnswer: 1,
          explanation: "Yes! DCA = same amount regularly (like $200 every month). No timing stress no guessing. Just consistency 📅"
        },
        {
          question: "What's the main benefit of dollar cost averaging?",
          options: ["It guarantees profits", "It removes the stress of trying to time the market", "You only buy when prices are high", "It's faster than investing all at once"],
          correctAnswer: 1,
          explanation: "Exactly! DCA takes away the timing stress. You're not sitting there wondering when to buy — you just buy on schedule 💡"
        },
        {
          question: "When does DCA cause you to buy more shares?",
          options: ["When prices are high", "When prices are low", "Only on Mondays", "It doesn't matter"],
          correctAnswer: 1,
          explanation: "That's right! When prices drop your $200 buys MORE shares. You're automatically buying more when things are on sale 🛍️"
        }
      ]
    },
    {
      id: "roth-ira",
      title: "What is a Roth IRA",
      category: "Retirement",
      isPro: false,
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
      quiz: [
        {
          question: "What's the biggest benefit of a Roth IRA?",
          options: ["Your money grows tax-free forever", "You get an immediate tax deduction", "Guaranteed 10% returns", "No contribution limits"],
          correctAnswer: 0,
          explanation: "Yes! Tax-free growth FOREVER. You pay taxes going in but then all that growth is yours to keep. Zero taxes in retirement 🚀"
        },
        {
          question: "What's the 2024 contribution limit for a Roth IRA?",
          options: ["$3,000 per year", "$6,500 per year", "$10,000 per year", "Unlimited"],
          correctAnswer: 1,
          explanation: "That's right! $6,500 per year (or $7,000 if you're over 50). Max that out if you can — future you will be so grateful 💰"
        },
        {
          question: "Can you withdraw your Roth IRA contributions before retirement?",
          options: ["No, never without penalty", "Yes, contributions (not growth) can be withdrawn anytime", "Only if you're over 65", "Only with IRS approval"],
          correctAnswer: 1,
          explanation: "Exactly! You can withdraw your contributions anytime penalty free. But leave the growth alone until retirement for max benefit 💪"
        }
      ]
    },
    {
      id: "drip-investing",
      title: "DRIP Investing",
      category: "Dividends",
      isPro: false,
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
      quiz: [
        {
          question: "What does DRIP stand for?",
          options: ["Dividend Reduction Investment Plan", "Dividend Reinvestment Plan", "Daily Return Investment Program", "Diversified Risk Investment Portfolio"],
          correctAnswer: 1,
          explanation: "Yes! Dividend Reinvestment Plan. Your dividends automatically buy more shares instead of sitting as cash 🔄"
        },
        {
          question: "How much extra could DRIP add to a $10k investment over 30 years?",
          options: ["Nothing - it's the same", "About $10,000", "About $30,000", "About $100,000"],
          correctAnswer: 2,
          explanation: "That's right! About $30k extra from compound growth. Your dividends buying more shares that pay more dividends that buy MORE shares 💸"
        },
        {
          question: "When should you turn off DRIP according to Pansy?",
          options: ["Never turn it off", "When you're young and don't need income", "When you retire and want dividend cash", "Only on weekends"],
          correctAnswer: 2,
          explanation: "Exactly! Keep DRIP on when you're young to maximize growth. Turn it off in retirement when you want that dividend cash for living expenses 🌱"
        }
      ]
    },
    {
      id: "active-vs-passive",
      title: "Active vs Passive Investing",
      category: "ETFs",
      isPro: false,
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
      quiz: [
        {
          question: "What's the main difference between active and passive investing?",
          options: [
            "Active tries to beat the market, passive tracks it",
            "They're exactly the same",
            "Passive is illegal in most states",
            "Active only works for millionaires"
          ],
          correctAnswer: 0,
          explanation: "Yes! Active = trying to beat the market by picking stocks. Passive = just tracking the market with index funds 🎯"
        },
        {
          question: "What percentage of active fund managers underperform the S&P 500?",
          options: [
            "About 10%",
            "About 50%",
            "About 90%",
            "About 100%"
          ],
          correctAnswer: 2,
          explanation: "That's right! About 90% of professionals lose to a simple S&P 500 index fund. The data is wild girl 📊"
        },
        {
          question: "What's Pansy's recommendation for beginners?",
          options: [
            "100% active stock picking",
            "100% passive index funds",
            "80-90% passive, 10-20% active",
            "Don't invest at all"
          ],
          correctAnswer: 2,
          explanation: "Exactly! 80-90% passive for stability, 10-20% active for fun. Best of both worlds without risking everything 💪"
        }
      ]
    },
    {
      id: "risk-reward-rule",
      title: "The 3:1 Risk to Reward Rule",
      category: "Trading Psychology",
      isPro: true,
      readTime: 4,
      difficulty: "Intermediate",
      summary: "Win rate matters less than you think",
      content: `Girl let me blow your mind with some math that changes everything about how you think about investing 🤯

Make 10 trades: 5 winners and 5 losers. You were literally wrong half the time. Sounds bad right? Watch this:

**The Bad Trades:**
Lose $100 on each losing trade = -$500 total

**The Good Trades:**
Win $300 on each winning trade = +$1,500 total

**Net Profit = +$1,000**

You were wrong HALF the time and still made a thousand dollars. How? Because your winners were 3 times bigger than your losers. That's the 3:1 risk to reward rule.

Most beginners obsess over win rate. "I need to be right 80% of the time!" But professional traders know that's backwards thinking. You can be wrong MORE than you're right and still crush it if you cut losses quickly and let winners run.

The discipline part is the hard part: taking that $100 loss and not holding on hoping it comes back. That's where people mess up. They hold losers too long trying to "get back to even" and they sell winners too early taking profits too soon.

**The Rules:**
- Set your stop loss BEFORE you enter the trade
- Risk $1 to make $3 minimum
- Take the loss when it hits your stop
- Let winners run until they hit your target

This isn't about being smart or picking perfectly. It's about math and discipline. Risk to reward matters way more than win rate sis 💪`,
      keyTakeaway: "You can be wrong 50% of the time and still profit big. Risk small, win big. 3:1 minimum risk to reward ratio.",
      relatedTopics: ["investment-rules", "dollar-cost-averaging", "bull-vs-bear"],
      quiz: [
        {
          question: "In the 3:1 example, you were right what percentage of the time?",
          options: [
            "80%",
            "70%",
            "50%",
            "30%"
          ],
          correctAnswer: 2,
          explanation: "Exactly! You were right only 50% of the time but still made $1,000 profit. Win rate isn't everything girl 💪"
        },
        {
          question: "If you risk $100 per trade, what should your minimum profit target be?",
          options: [
            "$100",
            "$200",
            "$300",
            "$500"
          ],
          correctAnswer: 2,
          explanation: "Yes! 3:1 ratio means if you risk $100 you should target at least $300 profit. That's how the math works in your favor 🎯"
        },
        {
          question: "What's the hardest part of the 3:1 rule according to Pansy?",
          options: [
            "Picking winning stocks",
            "Having discipline to cut losses and let winners run",
            "Using complex math",
            "Timing the market perfectly"
          ],
          correctAnswer: 1,
          explanation: "That's right! The discipline to take losses quickly and let winners run is where most people fail. It's emotional not intellectual 💛"
        }
      ]
    },
    {
      id: "investment-rules",
      title: "Investment Rules That Work",
      category: "Trading Psychology",
      isPro: true,
      readTime: 5,
      difficulty: "Intermediate",
      summary: "Systematic rules eliminate emotional decisions",
      content: `Here's the framework that removes 90% of the emotional stress from investing. You don't need to be smart — you need to follow the system 🎯

**THE RULES:**

**When Your Stock Drops:**
- Drop 10%? Hold. This is just normal noise.
- Drop 20%? Buy 15% more. It's on sale.
- Drop 30%? Buy 30% more. Major discount baby.

**When Your Stock Rises:**
- Rise 30%? Sell 10%. Lock in some gains.
- Rise 50%? Sell 30%. Take profits girl.
- Rise 100%? Sell 60%. You doubled your money — secure it.

Why does this work? Because it forces you to buy low and sell high which is literally what everyone says to do but nobody actually does when emotions kick in 😂

**The Problem Without Rules:**

Stock drops 20%: "Oh no I'm losing money! Should I sell?" (Panic)
Stock rises 30%: "It might go higher! Should I hold?" (Greed)

You're making emotional decisions based on fear and hope. That's how people lose money.

**The Solution With Rules:**

Stock drops 20%: "Time to buy 15% more per my system."
Stock rises 30%: "Time to sell 10% per my system."

No thinking. No emotion. Just execute the plan. The decision was already made before you entered the position.

This isn't about being clever or timing perfectly. It's about having a disciplined framework that takes emotion out of it. Most people fail at investing not because they're dumb but because they let feelings override logic.

Set your rules before you invest. Write them down. Follow them no matter how you feel. Discipline over intelligence every time girl 🏆`,
      keyTakeaway: "Systematic buy/sell rules eliminate emotional decisions. Follow the framework regardless of feelings. Discipline beats intelligence.",
      relatedTopics: ["risk-reward-rule", "dollar-cost-averaging", "bull-vs-bear"],
      quiz: [
        {
          question: "According to Pansy's rules, what should you do when a stock drops 20%?",
          options: [
            "Panic sell everything",
            "Buy 15% more",
            "Do nothing and hope",
            "Check the news constantly"
          ],
          correctAnswer: 1,
          explanation: "Yes! Stock drops 20% = buy 15% more. It's on sale. The rule eliminates the emotional panic response 💪"
        },
        {
          question: "If your stock rises 100% (doubles), how much should you sell?",
          options: [
            "Sell nothing - let it ride",
            "Sell 10%",
            "Sell 30%",
            "Sell 60%"
          ],
          correctAnswer: 3,
          explanation: "That's right! Rise 100% = sell 60%. You doubled your money — secure most of it and let some ride. Lock in wins sis 🏆"
        },
        {
          question: "What's the main advantage of having investment rules?",
          options: [
            "Rules guarantee profits",
            "Rules eliminate emotional decisions",
            "Rules let you time the market perfectly",
            "Rules make investing faster"
          ],
          correctAnswer: 1,
          explanation: "Exactly! Rules remove emotion from investing. You decided what to do BEFORE feelings kicked in. That's how discipline beats fear and greed 🎯"
        }
      ]
    },
    {
      id: "what-is-fomo",
      title: "What is FOMO",
      category: "Trading Psychology",
      isPro: false,
      readTime: 4,
      difficulty: "Beginner",
      summary: "Fear of missing out destroys portfolios",
      content: `FOMO (Fear Of Missing Out) is literally the #1 way people lose money in the stock market girl. Let me paint you a picture 🎨

You're scrolling Twitter or watching YouTube and everyone's talking about this stock that's up 40% in a week. Green candles everywhere. People posting screenshots of their gains. Your timeline is full of "I told you so" posts.

Now you're thinking: "Everyone's making money except me. I need to get in NOW before I miss it!"

So you buy at $150. It feels good for 30 minutes. Then the stock drops to $105. You're down 30% in 2 days. What happened? You bought at the top after the move already happened. Classic FOMO trap.

**Here's the truth:**

The market will ALWAYS be there sis. There will always be another opportunity. Another stock. Another rally. Another chance. You're not missing out on your last opportunity ever — you're just missing THIS particular move that already happened.

**The FOMO Rule:**

If you didn't plan the trade before market open, do NOT take it that day. Walk away. Come back tomorrow with a clear head and a plan.

Why? Because when you have FOMO you're trading from emotion not logic. You're chasing instead of planning. You're reacting instead of thinking. That's when bad decisions happen.

The stocks that everyone's talking about? You're late. The gains already happened. You're buying someone else's exit. They're selling to you at the top while posting celebration tweets.

**What to do instead:**

- Make a watchlist the night before
- Set price alerts for entry points
- Wait for pullbacks
- Plan your entries when emotions are low
- If you missed the move accept it and move on

Missing a move feels bad but losing money feels worse. Protect your capital sis. The market will give you another chance 🌸`,
      keyTakeaway: "FOMO makes you buy at tops after moves already happened. If you didn't plan it before market open, don't take it that day. Market will always be there.",
      relatedTopics: ["investment-rules", "revenge-trading", "risk-reward-rule"],
      quiz: [
        {
          question: "When does FOMO typically make you buy a stock?",
          options: [
            "After careful planning and research",
            "After it already ran 40% and everyone's talking about it",
            "When prices are at yearly lows",
            "Based on fundamental analysis"
          ],
          correctAnswer: 1,
          explanation: "Exactly! FOMO hits when everyone's posting gains and you feel left out. That's when you buy at the top girl 📈"
        },
        {
          question: "What's Pansy's FOMO rule?",
          options: [
            "Buy immediately when you see gains",
            "If you didn't plan it before market open, don't take it that day",
            "Always follow what Twitter says",
            "Buy every stock that's up 40%"
          ],
          correctAnswer: 1,
          explanation: "Yes! If it wasn't on your plan before markets opened, walk away. Come back tomorrow with a clear head 🌸"
        },
        {
          question: "Why is missing a move better than chasing it?",
          options: [
            "Missing moves guarantees future profits",
            "The market only has one opportunity ever",
            "Protecting capital is more important - there's always another opportunity",
            "Chasing moves always works out"
          ],
          correctAnswer: 2,
          explanation: "That's right! Missing a move feels bad but losing money feels worse. The market will give you another chance sis 💪"
        }
      ]
    },
    {
      id: "revenge-trading",
      title: "Revenge Trading Warning",
      category: "Trading Psychology",
      isPro: true,
      readTime: 4,
      difficulty: "Intermediate",
      summary: "The fastest way to blow up your account",
      content: `Girl this is the emotional trap that destroys accounts. Let me show you how it happens step by step 💥

**The Revenge Trading Spiral:**

1. You lose $200 on a trade. It stings. You're frustrated.

2. Emotion says: "I need to recover that loss NOW. I can't end the day down."

3. You risk $400 on the next trade trying to make it all back at once.

4. You lose again. Now you're down $600 total.

5. Panic sets in. "I NEED to win this back!" You risk $800.

6. Three losing trades later you're down $2,000. Your account is bleeding.

What started as a $200 loss turned into a $2,000 disaster because you couldn't walk away. This is revenge trading and it's one of the fastest ways to blow up an account.

**Here's what you need to understand:**

The market doesn't owe you anything. It doesn't care that you lost $200. It doesn't know you exist. There's no cosmic balance that says you "deserve" to win it back. The next trade is completely independent of the last one.

**When you feel revenge trading coming — and you WILL feel it — do this:**

1. Stop trading immediately
2. Close your charts and apps
3. Go for a walk
4. Come back tomorrow

Not in 10 minutes. Not after lunch. TOMORROW. Give your emotions time to reset.

**Why this is so hard:**

Your ego gets involved. Losing money makes you feel stupid. You want to prove you're not stupid by winning it back. But that's ego talking not logic. Capital preservation is more important than ego sis 💅

**The Pro Move:**

Accept the loss. Take it on the chin. Journal about what went wrong. Learn from it. Come back tomorrow with a clear head and your original system.

One $200 loss won't ruin you. Revenge trading that turns $200 into $2,000 WILL ruin you.

Protect your capital. Your ego can recover but your account might not 🛡️`,
      keyTakeaway: "Losing $200 then risking $400 to 'win it back' spirals into disaster. Walk away. Capital is more important than ego.",
      relatedTopics: ["what-is-fomo", "investment-rules", "risk-reward-rule"],
      quiz: [
        {
          question: "What typically triggers revenge trading?",
          options: [
            "A well-planned winning trade",
            "Losing money and wanting to recover it immediately",
            "Following your trading plan",
            "Taking a break from trading"
          ],
          correctAnswer: 1,
          explanation: "Yes! You lose money, emotion kicks in, and you think 'I need to win it back NOW.' That's when revenge trading starts 💥"
        },
        {
          question: "What should you do when you feel revenge trading coming?",
          options: [
            "Risk more money to win it back faster",
            "Check the charts constantly",
            "Stop trading, close charts, go for a walk",
            "Keep trading but with smaller sizes"
          ],
          correctAnswer: 2,
          explanation: "Exactly! Stop. Close everything. Walk away. Come back TOMORROW not in 10 minutes. Let emotions reset sis 🌸"
        },
        {
          question: "Why is revenge trading so dangerous according to Pansy?",
          options: [
            "It violates market regulations",
            "Your ego gets involved and turns small losses into huge disasters",
            "It's too time consuming",
            "It requires complex math"
          ],
          correctAnswer: 1,
          explanation: "That's right! Ego makes you risk bigger to 'prove' you're not stupid. One $200 loss becomes $2,000. Capital > ego girl 💅"
        }
      ]
    },
    {
      id: "self-assessment",
      title: "Self Assessment Before Every Trade",
      category: "Trading Psychology",
      isPro: true,
      readTime: 5,
      difficulty: "Intermediate",
      summary: "The 6-question checklist that saves accounts",
      content: `This is the checklist that separates emotional traders from disciplined traders. Before you place ANY trade — before you even think about clicking that buy button — you need to honestly answer these six questions 🧠

**THE SIX QUESTIONS:**

**1. Am I calm right now?**
If you're anxious, excited, angry, frustrated, or feeling ANY strong emotion — STOP. Emotions cloud judgment. Come back when you're neutral.

**2. Is this trade in my plan?**
Did you identify this setup yesterday? Is it on your watchlist? Or are you reacting to something you just saw 5 minutes ago? Reactive trades lose money.

**3. Do I have entry, exit, and stop loss defined?**
You need all three BEFORE you enter. If you're figuring it out as you go, you're gambling not trading.

**4. What is my risk to reward ratio?**
Minimum 3:1. Risk $100 to make $300. If you can't clearly state your risk to reward, you shouldn't take the trade.

**5. Am I trading to make money or prove something?**
Be brutally honest. Are you trying to win back a loss? Prove you're smart? Show someone else you're right? If it's anything other than "make money systematically" — walk away.

**6. Can I afford to lose this amount?**
Not "can my account handle it" — can YOU emotionally handle it? If losing this trade would stress you out or keep you up at night, your position is too big.

**If you cannot answer all six questions honestly and confidently — DO NOT place the trade.**

That's it. That's the system. It sounds simple but most people skip this because they don't want to miss the move. But here's the truth: The best trades are the ones you DON'T take when your answers are wrong.

**What this prevents:**

- FOMO trades (fails question 2)
- Revenge trades (fails question 5)
- Oversized positions (fails question 6)
- Emotional decisions (fails question 1)
- Undefined risk (fails questions 3 and 4)

Print these six questions out. Put them on your screen. Make yourself answer them every single time. It takes 30 seconds and it will save your account sis 💪`,
      keyTakeaway: "Six questions before every trade: calm, planned, defined risk, risk/reward, making money (not proving something), can afford loss. No trade if you can't answer honestly.",
      relatedTopics: ["risk-management", "what-is-fomo", "revenge-trading"],
      quiz: [
        {
          question: "What's the first question you should ask before any trade?",
          options: [
            "What's the current price?",
            "Am I calm right now?",
            "What's the company's earnings?",
            "What did Twitter say?"
          ],
          correctAnswer: 1,
          explanation: "Yes! Emotional state comes FIRST. If you're feeling strong emotions, stop. Come back when you're neutral 🧠"
        },
        {
          question: "What's the minimum risk to reward ratio Pansy requires?",
          options: [
            "1:1",
            "2:1",
            "3:1",
            "5:1"
          ],
          correctAnswer: 2,
          explanation: "That's right! Minimum 3:1. Risk $100 to make $300. If you can't clearly state it, don't take the trade 🎯"
        },
        {
          question: "What should you do if you can't answer all 6 questions honestly?",
          options: [
            "Take the trade anyway - YOLO",
            "Answer the ones you can and guess the rest",
            "Do NOT place the trade",
            "Ask someone else what to do"
          ],
          correctAnswer: 2,
          explanation: "Exactly! If all 6 answers aren't clear and honest, walk away. The best trades are ones you DON'T take when answers are wrong sis 💪"
        }
      ]
    },
    {
      id: "risk-management",
      title: "Risk Management Like a Pro",
      category: "Trading Psychology",
      isPro: true,
      readTime: 5,
      difficulty: "Intermediate",
      summary: "The 3% rule that professional traders live by",
      content: `This is THE most important lesson in this entire app. Risk management isn't sexy but it's the difference between surviving and blowing up your account. Let me show you the math that pros use 🛡️

**THE 3% RULE:**

Never risk more than 3% of your account on a single trade. EVER.

**Here's the math:**

Account: $10,000
Max risk per trade: 3% = $300

Even if you have TEN losses in a row (which hopefully won't happen if you're following the other lessons), you still keep 70% of your capital.

Trade 1: -$300 (down to $9,700)
Trade 2: -$291 (down to $9,409)
Trade 3: -$282 (down to $9,127)
... keep going ...
Trade 10: -$232 (down to $7,374)

You had a TERRIBLE losing streak — literally wrong 10 times in a row — and you still have $7,374. You can recover from that. You live to trade another day.

**Now watch what happens if you risk 10% per trade:**

Trade 1: -$1,000 (down to $9,000)
Trade 2: -$900 (down to $8,100)
Trade 3: -$810 (down to $7,290)
... keep going ...
Trade 10: -$387 (down to $3,486)

Same ten losses. But now you're down 65% of your account. That's DEVASTATING. You need to make 186% just to get back to even. You're probably done.

**Why 3% works:**

- Keeps emotions in check (losses don't hurt as much)
- Allows for long losing streaks without destruction
- Forces you to take smaller positions (prevents YOLO trades)
- Lets your winners compound over time
- Professional risk management = professional results

**Small consistent gains beat big gambles every single time.**

Think about it: If you make 2% per week for a year that's 104% return. You've doubled your account taking tiny gains. But most people want to 10x in a month and end up losing everything instead.

**The Pro Mindset:**

- Protect capital FIRST
- Profits come AFTER
- Survive to thrive
- Consistency over excitement

That's it. Risk 3% max per trade. It's boring. It's not exciting. It won't make you rich overnight. But it will keep you in the game long enough to actually build wealth sis 💛`,
      keyTakeaway: "Never risk more than 3% per trade. $10k account = $300 max risk. Ten losses in a row still keeps 70% capital. Protect capital first, profits second.",
      relatedTopics: ["self-assessment", "risk-reward-rule", "investment-rules"],
      quiz: [
        {
          question: "What's the maximum you should risk on a single trade?",
          options: [
            "1% of account",
            "3% of account",
            "10% of account",
            "Whatever feels right"
          ],
          correctAnswer: 1,
          explanation: "Yes! Maximum 3% per trade. It's the pro standard. Keeps you alive through losing streaks sis 🛡️"
        },
        {
          question: "If your account is $10,000, what's your max risk per trade?",
          options: [
            "$100",
            "$300",
            "$1,000",
            "$3,000"
          ],
          correctAnswer: 1,
          explanation: "That's right! $10,000 × 3% = $300 maximum risk per trade. Even 10 losses in a row keeps you at 70% capital 💪"
        },
        {
          question: "What comes FIRST in professional trading?",
          options: [
            "Making big profits quickly",
            "Protecting capital",
            "Being right all the time",
            "Impressing other traders"
          ],
          correctAnswer: 1,
          explanation: "Exactly! Protect capital FIRST. Profits come AFTER. Survive to thrive. Boring but effective girl 💛"
        }
      ]
    },
    {
      id: "trading-psychology-checklist",
      title: "Trading Psychology Checklist",
      category: "Trading Psychology",
      isPro: true,
      readTime: 3,
      difficulty: "Beginner",
      summary: "Your pre-trade, during-trade, and post-trade system",
      content: `This is your complete trading checklist girl. Print this out. Pin it to your screen. Follow it EVERY SINGLE TIME and you'll automatically be in the top 10% of traders. Why? Because most people skip steps. You won't 🌸

**BEFORE YOU TRADE:**

✓ I am calm and not trading from emotion
✓ This trade is in my plan, not impulsive
✓ I have entry, stop loss, and profit target defined
✓ Risk to reward is at least 2:1 (preferably 3:1)
✓ I am risking less than 3% of my account

If ANY checkbox is unchecked — do NOT place the trade. Walk away. Come back when all five are true.

**DURING THE TRADE:**

✓ I will not move my stop loss to avoid a loss
✓ I will not add to a losing position out of hope

These are the two biggest ways people blow up winning systems. You set your stop for a REASON. Honor it. Don't move it down because you "feel" like the stock will bounce. It won't care about your feelings.

And never average down on a losing trade thinking it'll come back. That's how small losses become catastrophic ones.

**AFTER THE TRADE:**

✓ I will journal this trade (win or lose)
✓ I will not revenge trade if I lose

Win or lose, write it down. What was your entry? Exit? Why did you take it? How did you feel? What worked? What didn't? This is how you improve.

And if you lose — which you will sometimes even with perfect execution — do NOT immediately jump into another trade trying to win it back. That's revenge trading and it destroys accounts.

**Why This Works:**

Before = Prevents emotional and impulsive trades
During = Keeps you disciplined when emotions spike
After = Builds your edge through reflection and prevents spiraling

**The Truth:**

You don't need a complicated strategy. You don't need insider information. You don't need expensive software. You need THIS checklist and the discipline to follow it.

Follow this and you're automatically in the top 10% of traders. Most people skip steps. Be the one who doesn't sis 🌸`,
      keyTakeaway: "Three-phase checklist: BEFORE (5 checks), DURING (2 rules), AFTER (2 actions). Follow religiously = top 10% of traders. Most skip steps — don't be most.",
      relatedTopics: ["self-assessment", "risk-management", "revenge-trading"],
      quiz: [
        {
          question: "How many checks must pass BEFORE you take a trade?",
          options: [
            "You don't need checks - just trade",
            "At least 3 out of 5",
            "All 5 must be checked",
            "Whatever feels right"
          ],
          correctAnswer: 2,
          explanation: "Yes! ALL FIVE must be checked. If even ONE is unchecked, walk away. No exceptions sis 🌸"
        },
        {
          question: "What should you NEVER do during a trade?",
          options: [
            "Check the price",
            "Move your stop loss to avoid a loss",
            "Take profits at your target",
            "Follow your plan"
          ],
          correctAnswer: 1,
          explanation: "That's right! Never move your stop loss down. You set it for a REASON. Honor it. Don't let hope override logic 🛡️"
        },
        {
          question: "What must you do after EVERY trade?",
          options: [
            "Celebrate if you won, forget if you lost",
            "Immediately jump into the next trade",
            "Journal the trade and avoid revenge trading",
            "Tell everyone on Twitter"
          ],
          correctAnswer: 2,
          explanation: "Exactly! Journal every trade (win or lose) and absolutely NO revenge trading after losses. Reflection builds edge sis 💪"
        }
      ]
    },

    // MODULE 1 — Real Estate Income & Loans
    {
      id: "income-real-estate-cash-flow",
      title: "What Is Real Estate Cash Flow?",
      category: "Income Streams",
      readTime: 4,
      difficulty: "Beginner",
      summary: "How rental property makes money explained simply",
      isPro: false,
      content: `Okay girl let's talk about making money from real estate — and I don't mean flipping houses or being a landlord with 50 properties. I mean simple rental income that pays you every month 🏡

Cash flow = rent minus expenses. That's it. If you rent out a property for $1,800 a month and your mortgage + insurance + taxes + maintenance costs $1,400 you're cash flowing $400 per month. That's $4,800 a year just for owning that property.

Here's what a lot of people don't get: you don't need to own the property outright to make money from it. If you put 20% down on a $200,000 property that's $40,000 of your money. But that property generates income every single month even though you're using the bank's money for the other $160,000.

**Your expenses usually are:**
- Mortgage payment (principal + interest)
- Property taxes
- Insurance
- HOA fees (if any)
- Maintenance (budget 1% of property value per year)
- Vacancy (assume property sits empty 1 month per year)
- Property management (if you hire someone — usually 8-10% of rent)

If your rent covers all that AND leaves money left over you're cash flowing. If it doesn't you're feeding the property money every month which defeats the whole purpose.

Real estate isn't passive income at first — there's work involved finding the property setting it up managing tenants. But once it's running smoothly it becomes monthly income that shows up whether you worked that day or not 💰

**Real talk:** This isn't get-rich-quick. It's build-wealth-slowly. One rental property cash flowing $300/month won't change your life. But 3 properties doing that is $10,800 a year. Over 10 years that compounds. Plus the property value usually goes up and your tenants are paying down your mortgage for you.

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Cash flow = rent minus all expenses. Positive cash flow = property pays you monthly. Negative = you feed it money. Aim for positive.",
      relatedTopics: ["income-ways-into-real-estate", "income-dscr-loans"],
      quiz: [
        {
          question: "What does cash flow mean in real estate?",
          options: ["Total property value", "Rent minus all expenses", "Your mortgage payment", "How fast you can sell"],
          correctAnswer: 1,
          explanation: "Yes! Cash flow = rent minus expenses. If it's positive the property pays you. If it's negative you're feeding it money 🏡"
        },
        {
          question: "Do you need to own a property outright to make money from it?",
          options: ["Yes you must own 100%", "No you can use the bank's money and still cash flow", "Only if property value goes up", "Only in certain states"],
          correctAnswer: 1,
          explanation: "That's right! You can put 20% down and cash flow using the bank's money for the rest. That's the leverage power of real estate 💰"
        },
        {
          question: "What should you budget for maintenance per year?",
          options: ["Nothing - tenants pay for everything", "About 1% of property value", "About 10% of property value", "Just fix things as they break"],
          correctAnswer: 1,
          explanation: "Exactly! Budget about 1% of property value per year for maintenance. A $200k house = $2k/year. Things break and it's your responsibility 🏡"
        }
      ]
    },
    {
      id: "income-ways-into-real-estate",
      title: "Ways Women Get Into Real Estate",
      category: "Income Streams",
      readTime: 4,
      difficulty: "Beginner",
      summary: "House hacking, rentals, and REITs vs owning property",
      isPro: false,
      content: `There are three main paths into real estate income and they're very different from each other. Let me break them down so you can see which one feels right for you 🏠

**Path 1: House Hacking (Lowest Barrier)**

This is where you live in one unit of a multi-family property (duplex triplex fourplex) and rent out the others. Or you buy a single-family house and rent out the extra bedrooms. Your tenants cover most or all of your mortgage.

Example: You buy a duplex with a 3.5% FHA loan (only $10,500 down on a $300k property). You live in one unit rent the other for $1,400/month. Your total mortgage is $1,800. You're only paying $400/month to live there and you're building equity.

After 1 year you can move out rent your unit too and both units cash flow. That's your first rental property and you barely needed any money down.

**Path 2: Traditional Rental Property**

You buy a property specifically to rent out. This usually requires 20-25% down and the property needs to cash flow from day one since you're not living there. More money upfront but you're not sharing walls with tenants.

This is the "investor" path. You're treating real estate like a business. Higher barrier to entry but more flexibility in choosing properties and locations.

**Path 3: REITs (Real Estate Investment Trusts)**

You buy shares of a REIT like a stock and earn dividends from the properties they own. No being a landlord no property management no maintenance calls. Just collect quarterly dividend checks.

REITs typically yield 3-7% and you can buy them with as little as $100. The downside? You don't own actual property you own shares. And REIT dividends are taxed as ordinary income not capital gains.

**Which Path Is Right For You?**

- Want to minimize cash needed upfront? House hack.
- Have 20%+ saved and ready to be a landlord? Traditional rental.
- Want real estate exposure with zero landlord work? REITs.

You can mix these too. Start with house hacking or REITs while you save for a traditional rental. Real estate is one of the few wealth-building tools where you can literally use other people's money (the bank's + your tenants' rent) to build your net worth 💪

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Three paths: House hacking (live in one unit, rent others — lowest barrier). Traditional rental (20-25% down, investor path). REITs (stock-like shares, no landlord work).",
      relatedTopics: ["income-real-estate-cash-flow", "income-dscr-loans", "income-reits"],
      quiz: [
        {
          question: "What is house hacking?",
          options: ["Flipping houses for profit", "Living in a property while renting out other units/rooms", "Buying houses with no down payment", "Illegally avoiding property taxes"],
          correctAnswer: 1,
          explanation: "Yes! House hacking = live in one unit/room, rent the others. Tenants cover most or all of your mortgage. Lowest barrier entry 🏠"
        },
        {
          question: "What's the typical down payment for a traditional rental property?",
          options: ["0%", "3.5%", "20-25%", "50%"],
          correctAnswer: 2,
          explanation: "That's right! Traditional rentals typically need 20-25% down. Higher barrier but you're not living with tenants 💰"
        },
        {
          question: "What's the main advantage of REITs?",
          options: ["You own actual property", "No landlord work - just collect dividends", "Guaranteed 10% returns", "No taxes on dividends"],
          correctAnswer: 1,
          explanation: "Exactly! REITs = zero landlord work. Just buy shares and collect quarterly dividends. Perfect if you want real estate exposure without tenants 🏡"
        }
      ]
    },
    {
      id: "income-dscr-loans",
      title: "DSCR Loans Explained",
      category: "Income Streams",
      readTime: 5,
      difficulty: "Intermediate",
      summary: "Qualify on property income, not yours — for investors",
      isPro: true,
      content: `DSCR loans are a game changer if you want to buy rental property but your tax returns don't show enough income (because hello write-offs) or you're self-employed and your "official" income looks low on paper 📄

**DSCR = Debt Service Coverage Ratio.** Sounds fancy but it's simple: does the rent from this property cover the mortgage payment?

Here's the math: Monthly rent ÷ Monthly mortgage payment = DSCR

If rent is $1,800 and the mortgage payment is $1,500 your DSCR is 1.2 (you're good). If rent is $1,500 and mortgage is $1,800 your DSCR is 0.83 (won't qualify).

**Why this is huge:** Traditional mortgages qualify you based on YOUR income from your W-2 or tax returns. DSCR loans qualify you based on what the PROPERTY makes. The property's rent is what matters not your paycheck.

**Typical DSCR requirements:**
- Ratio of 1.0 or higher (rent covers mortgage at minimum)
- Ratio of 1.25+ gets you better rates
- Credit score usually 640-660 minimum
- 20-25% down payment (sometimes 15% floor)
- Property must be investment property (not your primary home)

**What they DON'T require:**
- Tax returns
- W-2s
- Pay stubs
- Employment verification

They literally don't care if you're employed or what you claim on taxes. They care if the rent covers the debt. That's it.

**The catch:** Interest rates are usually 0.5-1% higher than conventional loans. You're paying a premium for the flexibility of not showing income. But if your tax returns wouldn't qualify you anyway this is often your only path.

**Vetted DSCR lender options:**

- [Visio Lending](#) — Specializes in DSCR loans, 15-25% down, credit 660+
- [Kiavi](#) — Investor-focused, DSCR and fix-and-flip, 15-25% down
- [LendingOne](#) — DSCR 640+ credit, fast close times
- [RCN Capital](#) — DSCR loans 620+ credit, rental income focus
- [Angel Oak](#) — Non-QM and DSCR specialist, flexible requirements

Who uses DSCR loans? Self-employed people, real estate investors with multiple properties, people who write off a ton of business expenses, anyone whose "official" income doesn't reflect their actual cash situation 🏡

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "DSCR loans qualify you on the property's rent not your income. No tax returns needed. Ratio 1.0+ required, 1.25+ for best rates. Down payment 20-25%. Higher interest but flexible.",
      relatedTopics: ["income-real-estate-cash-flow", "income-conventional-loans", "income-ways-into-real-estate"],
      quiz: [
        {
          question: "What does DSCR stand for?",
          options: ["Debt Service Coverage Ratio", "Down Payment Service Calculation", "Direct Seller Credit Rating", "Debt Security Credit Record"],
          correctAnswer: 0,
          explanation: "Yes! Debt Service Coverage Ratio. It's just rent ÷ mortgage payment. Simple math that determines if you qualify 📄"
        },
        {
          question: "What documents do DSCR loans NOT require?",
          options: ["Credit report", "Tax returns and W-2s", "Property appraisal", "Down payment proof"],
          correctAnswer: 1,
          explanation: "That's right! No tax returns, W-2s, or pay stubs needed. They only care if the property's rent covers the mortgage 🏡"
        },
        {
          question: "What DSCR ratio do you need to qualify?",
          options: ["0.5 or higher", "1.0 or higher", "2.0 or higher", "Any ratio works"],
          correctAnswer: 1,
          explanation: "Exactly! You need 1.0+ minimum (rent covers mortgage). 1.25+ gets you better rates. Below 1.0 = no go 💰"
        }
      ]
    },
    {
      id: "income-conventional-loans",
      title: "Conventional & First-Property Paths",
      category: "Income Streams",
      readTime: 5,
      difficulty: "Intermediate",
      summary: "Owner-occupied loans and how to prepare",
      isPro: true,
      content: `If you're buying your first property and plan to live in it (or house hack it) you have way better loan options than DSCR. Let me show you the conventional and first-property paths that most women use 🏠

**Conventional Owner-Occupied Loans:**

These are traditional mortgages where you're living in the property as your primary residence. The rates are better and down payment can be lower because lenders view owner-occupied as less risky than pure investment.

**Requirements:**
- Credit score 620+ (640+ for best rates)
- Down payment as low as 10% (sometimes 15% if credit isn't perfect)
- Must live in property for at least 1 year
- Debt-to-income ratio under 43% (your monthly debts ÷ monthly income)
- You'll need tax returns, W-2s, pay stubs, bank statements

**FHA Loans (First-Time Buyer Friendly):**

FHA is government-backed which means lower down payment and more flexible credit requirements.

**Requirements:**
- Down payment as low as 3.5%
- Credit score can be as low as 580
- Mortgage insurance required (adds to monthly payment)
- Must live in property for at least 1 year
- Cannot be used for pure investment properties

**The House Hacking Strategy:**

Here's how savvy women combine these loans with house hacking:

1. Buy a duplex or triplex with FHA (3.5% down)
2. Live in one unit rent the others
3. Rent covers most or all of your mortgage
4. Live there for 1 year minimum (FHA requirement)
5. Move out rent your unit too
6. Now you have a cash-flowing rental property with minimal money down

**How to Prepare:**

- Get your credit score to 640+ (pay down cards, dispute errors)
- Save 3.5-20% for down payment + closing costs (add 2-4%)
- Gather 2 years tax returns and pay stubs
- Calculate your debt-to-income ratio (keep under 43%)
- Get pre-approved before house hunting

**Vetted Conventional Lenders:**

- [Rocket Mortgage](#) — Fast online process, conventional and FHA
- [Better](#) — Low fees, conventional and FHA, competitive rates
- [Navy Federal](#) — For military/veterans, excellent rates and VA loans

The beauty of owner-occupied loans is you get the best rates and lowest down payment options. Then after you live there for a year you can turn it into a rental. That's how you build a real estate portfolio without needing huge cash upfront sis 💪

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Conventional owner-occupied: 10-15% down, 620+ credit, must live 1 year. FHA: 3.5% down, 580+ credit. House hack strategy = live in one unit, rent others, then move out after 1 year.",
      relatedTopics: ["income-dscr-loans", "income-ways-into-real-estate", "income-real-estate-cash-flow"],
      quiz: [
        {
          question: "What's the minimum down payment for an FHA loan?",
          options: ["0%", "3.5%", "10%", "20%"],
          correctAnswer: 1,
          explanation: "Yes! FHA allows just 3.5% down if your credit is 580+. Perfect for first-time buyers and house hacking 🏠"
        },
        {
          question: "How long must you live in an owner-occupied property?",
          options: ["No requirement", "At least 6 months", "At least 1 year", "At least 5 years"],
          correctAnswer: 2,
          explanation: "That's right! Both FHA and conventional owner-occupied loans require you to live there at least 1 year before moving out 💰"
        },
        {
          question: "What's the house hacking strategy with FHA loans?",
          options: [
            "Buy and immediately rent all units",
            "Buy a multi-family, live in one unit, rent others, move out after 1 year",
            "Only works for single-family homes",
            "Requires 20% down"
          ],
          correctAnswer: 1,
          explanation: "Exactly! Buy multi-family with 3.5% down FHA, live in one unit, rent the others. After 1 year move out and it's a full rental 🏡"
        }
      ]
    },

    // MODULE 2 — Income From What You Already Know
    {
      id: "income-skills-to-income",
      title: "Turning Your Skills Into Income",
      category: "Income Streams",
      readTime: 4,
      difficulty: "Beginner",
      summary: "You already have sellable knowledge — the mindset shift",
      isPro: false,
      content: `Girl this might sound wild but you already have skills that people will pay for. I'm serious. The thing you're good at that feels easy to you? Someone else is struggling with it and would gladly pay you to do it or teach them 💼

**The mindset shift:**

We tend to think "that's just something I can do — it's not special." But here's the truth: your "basic" skill is someone else's struggle. Your experience in an area is valuable to someone who's starting from zero.

**Skills that people pay for (and you might already have):**

- Writing (blog posts, social captions, website copy)
- Design (Canva graphics, logos, presentations)
- Social media (posting, engagement, content planning)
- Admin work (emails, scheduling, data entry)
- Teaching or tutoring (language, music, test prep, any subject)
- Bookkeeping or basic accounting
- Photography or video editing
- Web design or no-code tools
- Resume writing or career coaching
- Virtual assistant services

You don't need to be an expert. You just need to be better than someone who has zero experience. Beginner-level skills can still earn $20-40/hour.

**Where you are right now:**

Maybe you're thinking "I don't have anything valuable to sell." But I bet if I asked you what you're good at or what people come to you for help with you'd have an answer. That's your starting point.

**The permission you need:**

You don't need a degree, a certification, or years of experience to start. You need confidence that your skills have value and willingness to try. That's it.

In the next lessons we'll talk about how to actually package your skills and find clients. But this lesson is just about the belief shift: you already have something people will pay for. You just need to start seeing it that way 💛

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "You already have skills people will pay for. Your 'basic' skill is someone else's struggle. Beginner-level skills = $20-40/hour. You don't need to be an expert.",
      relatedTopics: ["income-side-hustle-map", "income-digital-products"],
      quiz: [
        {
          question: "What's the main mindset shift Pansy talks about?",
          options: [
            "You need a degree to earn income",
            "Your 'basic' skills are valuable to someone who's starting from zero",
            "Only experts can charge for their skills",
            "You need years of experience first"
          ],
          correctAnswer: 1,
          explanation: "Yes! Your easy = someone else's hard. Your experience in an area is valuable to beginners. That's the shift 💼"
        },
        {
          question: "What can beginner-level skills earn per hour?",
          options: ["$5-10/hour", "$20-40/hour", "$100+/hour", "Nothing until you're an expert"],
          correctAnswer: 1,
          explanation: "That's right! Beginner skills can earn $20-40/hour. You don't need to be an expert to provide value sis 💰"
        },
        {
          question: "What do you need to start selling your skills according to Pansy?",
          options: [
            "A college degree and certification",
            "10+ years of experience",
            "Confidence that your skills have value and willingness to try",
            "Permission from an industry board"
          ],
          correctAnswer: 2,
          explanation: "Exactly! You need belief in your value + willingness to try. That's it. No degree or years of experience required 💛"
        }
      ]
    },
    {
      id: "income-side-hustle-map",
      title: "Side Hustle Starter Map",
      category: "Income Streams",
      readTime: 4,
      difficulty: "Beginner",
      summary: "Overview of digital products, content, affiliate, and services",
      isPro: false,
      content: `Let me give you the big picture of how women are building side income right now. These are the four main paths and you can pick one or mix them 🗺️

**Path 1: Services (Quickest Cash)**

You do work for clients and get paid directly. Writing, design, virtual assistant, social media management, tutoring, coaching. You trade your time and skills for money.

**Timeline:** First dollar in 1-4 weeks
**Income potential:** $500-5,000+/month
**Time commitment:** 5-20 hours/week
**Best for:** Women who want immediate income and like working with clients

**Path 2: Digital Products (Create Once, Sell Forever)**

You create something once (ebook, printable, template, course) and sell it repeatedly. After the upfront work it's passive-ish.

**Timeline:** First sale in 1-3 months
**Income potential:** $100-2,000+/month
**Time commitment:** 20-40 hours upfront then 2-5 hours/week
**Best for:** Women who want to build assets that earn while they sleep

**Path 3: Content & Affiliate (Build an Audience)**

You create content (YouTube, blog, Instagram, TikTok) build an audience and monetize through ads, sponsorships, and affiliate commissions.

**Timeline:** First dollar in 3-12 months
**Income potential:** $100-10,000+/month
**Time commitment:** 10-20 hours/week consistently
**Best for:** Women who enjoy creating content and have patience for audience growth

**Path 4: E-commerce & Print-on-Demand (Physical Products)**

You sell physical products either through print-on-demand (no inventory) or traditional e-commerce (buy and ship products).

**Timeline:** First sale in 2-8 weeks
**Income potential:** $200-3,000+/month
**Time commitment:** 10-15 hours/week
**Best for:** Women who like product-based businesses and visual design

**My honest take:**

Start with Services if you need cash now. Build Digital Products while you do services. Add Content/Affiliate when you're ready to play the long game. E-commerce is great if you love product businesses.

You don't have to pick just one. Most successful side hustlers mix 2-3 of these. Services pay the bills. Digital products build passive income. Content brings customers to both. That's the flywheel sis 💪

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Four paths: Services (quick cash, $500-5k/mo), Digital Products (create once sell forever), Content/Affiliate (build audience long game), E-commerce (physical products). Start with services, add products, then content.",
      relatedTopics: ["income-skills-to-income", "income-digital-products", "income-content-affiliate"],
      quiz: [
        {
          question: "Which path gives you cash the fastest?",
          options: ["Digital Products", "Services (client work)", "Content & Affiliate", "E-commerce"],
          correctAnswer: 1,
          explanation: "Yes! Services = quickest cash. You can land your first client and get paid within 1-4 weeks 💼"
        },
        {
          question: "What's the main advantage of digital products?",
          options: [
            "Instant income on day one",
            "Create once, sell repeatedly - passive income",
            "Requires no upfront work",
            "Only works for tech experts"
          ],
          correctAnswer: 1,
          explanation: "That's right! Digital products = create once, sell forever. After upfront work it earns while you sleep 🗺️"
        },
        {
          question: "What's Pansy's recommended strategy for beginners?",
          options: [
            "Pick one path and never add others",
            "Start with services, add digital products, then content",
            "Only do content creation",
            "Wait until you're an expert"
          ],
          correctAnswer: 1,
          explanation: "Exactly! Start with services for cash, build products for passive income, add content to bring customers. That's the flywheel 💪"
        }
      ]
    },
    {
      id: "income-digital-products",
      title: "Digital Products & Self-Publishing",
      category: "Income Streams",
      readTime: 5,
      difficulty: "Intermediate",
      summary: "Ebooks/KDP, printables, step-by-step to first sale",
      isPro: true,
      content: `Digital products are the dream: create something once, sell it forever, keep 100% of the profit. No inventory no shipping no refunds (usually). Pure margin 📚

**What actually sells:**

**Ebooks & Self-Publishing:**
- How-to guides and workbooks (meal planning, budgeting, fitness)
- Niche fiction (romance, cozy mystery, YA)
- Professional guides (resume templates, business plans)

**Printables:**
- Planners and organizers (budget sheets, goal trackers)
- Wall art and quotes (minimalist prints, motivational designs)
- Party decorations and invitations
- Educational worksheets

**Templates:**
- Notion templates (dashboards, habit trackers, databases)
- Canva templates (social media posts, presentations)
- Spreadsheets (budget calculators, meal planners)

**Where to sell:**

**[Amazon KDP](#) — Self-Publishing:**
- Upload ebook or paperback, Amazon prints and ships
- Ebook royalty: 35-70% depending on price
- Paperback royalty: ~40% after printing costs
- Best for: Books, guides, journals

**[Etsy](#) — Digital Downloads:**
- Upload PDF, buyer downloads instantly
- You keep 80% after Etsy fees
- Best for: Printables, templates, planners

**[Gumroad](#) — Creator Platform:**
- Sell any digital file, zero listing fees
- You keep 90% (10% fee)
- Best for: Ebooks, templates, courses

**[Shopify](#) — Your Own Store:**
- Full control, no marketplace fees
- You keep 97% (payment processing only)
- Best for: When you have traffic/audience already

**Realistic timeline & earnings:**

Month 1: Create product, set up listing, first 0-2 sales = $0-50
Months 2-3: Refine listing, get first reviews, 5-15 sales/month = $50-300
Months 4-6: Momentum building, 15-40 sales/month = $200-800
Months 6-12: Established product, 40-100+ sales/month = $500-2,000+

These are realistic numbers for ONE product. Create 5-10 products and those numbers multiply.

**The reality check:**

Most products don't sell immediately. You create it. You list it. Crickets. Then maybe 1 sale. Then nothing for a week. Then 2 sales. It's slow until it's not.

But here's the magic: once it's made you're not trading time for money anymore. You can sell it 10 times or 10,000 times — same effort from you. The 1,000th sale doesn't require you to do anything extra.

**First product checklist:**

1. Pick ONE platform to start (KDP or Etsy)
2. Solve a specific problem for a specific person
3. Create a simple first version (don't overcomplicate)
4. Price it low to get first sales and reviews ($3-15)
5. Improve based on feedback

One weekend of focused work can create a product that earns income for years. That's the leverage sis 💪

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Digital products = create once, sell forever. Platforms: KDP (books), Etsy (printables), Gumroad (templates), Shopify (own store). Realistic: $50-300/mo months 2-3, $500-2k/mo by month 12.",
      relatedTopics: ["income-side-hustle-map", "income-content-affiliate", "income-skills-to-income"],
      quiz: [
        {
          question: "What's the main advantage of digital products?",
          options: [
            "Guaranteed sales immediately",
            "Create once, sell repeatedly with pure profit margin",
            "They're free to create",
            "No competition"
          ],
          correctAnswer: 1,
          explanation: "Yes! Create once, sell forever. The 1,000th sale requires no extra effort from you. That's the leverage 📚"
        },
        {
          question: "What's a realistic beginner income timeline?",
          options: [
            "$10,000 in month 1",
            "$50-300/month by months 2-3",
            "$0 always - they never sell",
            "$5,000/month immediately"
          ],
          correctAnswer: 1,
          explanation: "That's right! Realistic = $50-300/mo by months 2-3. It's slow at first but compounds as you add more products 💰"
        },
        {
          question: "Which platform is best for printables according to Pansy?",
          options: ["Amazon KDP", "Etsy", "LinkedIn", "Twitter"],
          correctAnswer: 1,
          explanation: "Exactly! Etsy is perfect for printables - buyers download instantly, you keep 80% after fees 🗺️"
        }
      ]
    },
    {
      id: "income-content-affiliate",
      title: "Content & Affiliate Income",
      category: "Income Streams",
      readTime: 5,
      difficulty: "Intermediate",
      summary: "YouTube/blog/social, affiliate marketing, email lists",
      isPro: true,
      content: `Content creation can become income but it's a long game. Most people quit before they see a dollar. Let me give you the real timeline and math so you know what you're getting into 📱

**How content makes money:**

**1. Ad Revenue (YouTube, Blog):**
YouTube Partner Program requires 1,000 subscribers + 4,000 watch hours. Realistic CPM (cost per 1,000 views): $2-10 depending on niche.

10,000 views/month at $5 CPM = $50/month
100,000 views/month at $5 CPM = $500/month
1 million views/month at $5 CPM = $5,000/month

**2. Affiliate Income:**
You recommend products and earn commission when people buy through your link. Must disclose affiliate relationships (legally required).

Commission rates: 1-5% (Amazon), 10-30% (digital products), 30-50% (software subscriptions)

**Platforms to share affiliate links:**
- [YouTube](#) — Video reviews and tutorials
- [Instagram/TikTok](#) — Short-form content
- [Blog](#) — Long-form written guides
- [Email list](#) — Direct recommendations to subscribers

Example: Promote a $97 course at 40% commission. 10 sales/month = $388. 100 sales/month = $3,880.

**3. Sponsorships (When You're Bigger):**
Brands pay you to talk about their product. Micro-influencers (10k-50k followers) might get $100-500 per post. 100k+ followers can command $1,000-10,000+ depending on engagement.

**4. Your Own Products (Best Margin):**
Use your audience to sell your ebook, course, or coaching. If you have 10,000 followers and 1% buy your $47 product that's 100 sales = $4,700.

**The timeline reality:**

Months 0-6: Creating content, learning, building skills. Income = $0-100/month
Months 6-12: Starting to see traction. Income = $100-500/month
Year 1-2: Momentum building. Income = $500-2,000/month
Year 2-3: Established presence. Income = $2,000-10,000+/month

This assumes consistent posting (3-5x/week minimum) and quality content. Most people quit at month 3 when they have 47 followers and $0 income.

**What to create:**

Pick ONE platform to start (YouTube or TikTok or Blog). Pick ONE niche (money, fitness, parenting, productivity, tech). Stay in your lane. Algorithms reward consistency.

**Real talk:**

This is NOT fast money. If you need income in 30 days this isn't it. But if you can commit to 1-2 years of posting without much income knowing it compounds this is one of the best leverage plays.

You build an audience once and monetize it 10 different ways: ad revenue + affiliates + sponsorships + your products = diversified income from one asset (your audience) 💪

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Content income timeline: 0-6 months = $0-100, year 1-2 = $500-2k/month. Revenue: ads + affiliates + sponsorships + own products. Must disclose affiliates. Long game but compounds.",
      relatedTopics: ["income-digital-products", "income-side-hustle-map", "income-skills-to-income"],
      quiz: [
        {
          question: "What's a realistic income timeline for content creators?",
          options: [
            "$10k/month in first month",
            "$0-100/month first 6 months, $500-2k/month year 1-2",
            "$1 million in first year",
            "Income starts immediately"
          ],
          correctAnswer: 1,
          explanation: "Yes! First 6 months = $0-100 usually. Year 1-2 = $500-2k/month if consistent. It's a long game that compounds 📱"
        },
        {
          question: "Must you disclose affiliate relationships?",
          options: [
            "No disclosure needed",
            "Only if you want to",
            "Yes it's legally required",
            "Only for products over $100"
          ],
          correctAnswer: 2,
          explanation: "That's right! You MUST disclose affiliate relationships. It's an FTC requirement. Be transparent with your audience 💪"
        },
        {
          question: "What's the best monetization strategy for content creators?",
          options: [
            "Only ad revenue",
            "Only sponsorships",
            "Diversify: ad revenue + affiliates + sponsorships + your own products",
            "Don't monetize at all"
          ],
          correctAnswer: 2,
          explanation: "Exactly! Diversify income from your audience: ads + affiliates + sponsors + your products = stable income sis 🗺️"
        }
      ]
    },

    // MODULE 3 — Money That Earns While You Sleep
    {
      id: "income-passive-really",
      title: "What Is Passive Income, Really?",
      category: "Income Streams",
      readTime: 4,
      difficulty: "Beginner",
      summary: "An honest definition — passive is not effortless",
      isPro: false,
      content: `Let me be real with you about passive income because there's a lot of BS out there. "Passive" does NOT mean you do nothing and money appears. Let me break down what it actually means 💰

**True passive income = money that comes in with minimal ongoing effort AFTER you've built the system.**

Key word: AFTER. You put in significant work upfront (or money) to build the income stream. Then it runs with little maintenance.

**Examples of actual passive income:**

**Rental Property:** You buy the property (big upfront work + money). Tenants pay rent monthly. You still handle maintenance and tenant issues but it's way less work than a full-time job.

**Dividend Stocks:** You invest money (upfront). Companies pay you quarterly dividends just for holding shares. You do literally nothing except hold.

**Digital Products:** You create an ebook or course (upfront work). It sells while you sleep. Occasional updates but mostly hands-off.

**The passive income lie:**

"Make $10,000/month working 2 hours/week!" That's not how it works girl. Either:
1. They're lying about the income
2. They're lying about the time
3. They put in YEARS of work upfront to get there
4. They invested massive capital to generate that return

**The reality of "passive" income:**

- Rental property: 5-10 hours/month managing
- Dividend portfolio: 0-2 hours/month monitoring
- Digital products: 2-5 hours/week marketing and updates
- Affiliate/content: 0-10 hours/week depending on stage

It's not zero effort. It's just WAY less effort than trading your time 1:1 for money at a job.

**Active vs Passive comparison:**

**Active:** Work 1 hour = Get paid for 1 hour. Stop working = Stop getting paid.

**Passive:** Work 100 hours upfront (or invest $50k) = Get paid repeatedly for years with 0-10 hours/month maintenance.

**Why passive income matters:**

It breaks the 1:1 time-for-money trap. You're creating assets that generate income whether you're working that day or not. That's how you build wealth — you can't trade time forever but assets can earn forever 💪

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Passive ≠ effortless. Passive = money with minimal ongoing effort AFTER you build the system. You put in work/money upfront then it runs with 0-10 hours/month maintenance.",
      relatedTopics: ["income-dividends-101", "income-hysa-safe-yield", "income-real-estate-cash-flow"],
      quiz: [
        {
          question: "What does passive income really mean?",
          options: [
            "You do nothing and money appears",
            "Money with minimal ongoing effort AFTER building the system",
            "Working 1 hour gets you paid for 1 hour",
            "It's a myth that doesn't exist"
          ],
          correctAnswer: 1,
          explanation: "Yes! Passive = minimal effort AFTER you build it. You put in work/money upfront then it runs with little maintenance 💰"
        },
        {
          question: "How many hours per month does rental property income typically require?",
          options: ["0 hours - truly passive", "5-10 hours managing", "40 hours like a full job", "100+ hours"],
          correctAnswer: 1,
          explanation: "That's right! Rental property = 5-10 hours/month. Not zero but way less than a job. That's the passive part 🏡"
        },
        {
          question: "Why does passive income matter according to Pansy?",
          options: [
            "It's easy money with no work",
            "It breaks the 1:1 time-for-money trap - assets earn whether you work or not",
            "Everyone gets rich quick",
            "It requires no upfront effort"
          ],
          correctAnswer: 1,
          explanation: "Exactly! Passive breaks the time trap. Assets earn whether you're working that day or not. That's how you build wealth 💪"
        }
      ]
    },
    {
      id: "income-dividends-101",
      title: "Dividends 101",
      category: "Income Streams",
      readTime: 4,
      difficulty: "Beginner",
      summary: "How dividend stocks and ETFs pay you, and what DRIP means",
      isPro: false,
      content: `Dividends are one of my favorite forms of passive income because they're truly passive. You buy shares you hold them you get paid quarterly. That's it 💰

**What are dividends?**

Companies share their profits with shareholders every quarter. If you own 100 shares of a stock paying $1/share in dividends you get $100 deposited in your account 4 times a year = $400/year total.

**Dividend yield = how much you're getting paid**

If a stock costs $100 and pays $4/year in dividends that's a 4% yield.

$4 annual dividend ÷ $100 stock price = 4% yield

Compare that to a savings account paying 0.5% and you see why dividend investing is popular.

**Dividend stocks vs Dividend ETFs:**

**Individual Dividend Stocks:**
- Companies like Coca-Cola, Johnson & Johnson, Procter & Gamble
- Typically yield 2-5%
- Higher risk (one company could cut dividends)
- You pick which companies to own

**Dividend ETFs:**
- Bundle of 50-100+ dividend-paying stocks
- Typically yield 2-4%
- Lower risk (diversified across many companies)
- Examples: SCHD, VYM, VIG

For beginners I recommend dividend ETFs. You get instant diversification and professional rebalancing.

**DRIP = Dividend Reinvestment Plan**

Instead of taking dividends as cash they automatically buy more shares. Your money compounds on autopilot 🔄

Example: You own 100 shares. Dividend pays $100. Stock costs $50/share. Your $100 buys 2 more shares. Now you own 102 shares. Next quarter those 102 shares pay dividends. And so on forever.

**When to use DRIP:**

- When you're building wealth (under 50 and don't need the income)
- When you want maximum compound growth

**When to turn DRIP off:**

- When you retire and need the dividend income for living expenses
- When you want cash flow right now

**Building dividend income:**

To generate $1,000/month in dividends at 4% yield you need $300,000 invested. Sounds huge right?

But if you invest $500/month for 20 years at 8% total return (4% dividend + 4% growth) you'll have $300,000. That $300k then generates $1,000/month passive income forever.

Dividends are patient wealth-building. You're not getting rich overnight. But you're getting paid every quarter just for owning shares. That's real passive income girl 💛

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Dividends = quarterly cash from stocks. 4% yield on $300k = $1k/month income. DRIP = reinvest dividends to buy more shares automatically. Use DRIP when building, turn off when you need income.",
      relatedTopics: ["income-passive-really", "income-reits-tax-advantaged", "income-hysa-safe-yield"],
      quiz: [
        {
          question: "How often are dividends typically paid?",
          options: ["Once a year", "Every month", "Every quarter (4 times a year)", "Every day"],
          correctAnswer: 2,
          explanation: "Yes! Most dividend stocks pay quarterly. That cash hits your account 4 times a year 💰"
        },
        {
          question: "What does DRIP do?",
          options: [
            "Sells your dividends",
            "Automatically reinvests dividends to buy more shares",
            "Pays taxes on dividends",
            "Increases dividend rates"
          ],
          correctAnswer: 1,
          explanation: "That's right! DRIP reinvests dividends to buy more shares. More shares = more dividends = compound growth on autopilot 🔄"
        },
        {
          question: "How much do you need invested at 4% yield to earn $1,000/month?",
          options: ["$100,000", "$200,000", "$300,000", "$1,000,000"],
          correctAnswer: 2,
          explanation: "Exactly! $1k/month = $12k/year. At 4% yield you need $300k invested. Build there with $500/month over 20 years 💛"
        }
      ]
    },
    {
      id: "income-hysa-safe-yield",
      title: "HYSA, T-Bills & Safe Yield",
      category: "Income Streams",
      readTime: 5,
      difficulty: "Intermediate",
      summary: "High-yield savings, Treasury bills, money market — where to park cash",
      isPro: true,
      content: `Cash sitting in a regular bank account earning 0.01% is dying slowly. Inflation eats it. But there are safe places where your cash can earn 4-5% with zero stock market risk 🏦

**High-Yield Savings Accounts:**

**Current rates:** 4-5% APY (as of 2024-2025)
**Safety:** FDIC insured up to $250k
**Access:** Instant - transfer anytime
**Best for:** Emergency fund, short-term savings

**Top options:**
- [Ally Bank](#) — 4.5% APY, no fees, great app
- [Marcus by Goldman Sachs](#) — 4.5% APY, no minimum
- [American Express Personal Savings](#) — 4.4% APY
- [Capital One 360](#) — 4.3% APY

**Treasury Bills (T-Bills):**

**What they are:** US government debt (safest in the world)
**Terms:** 4 weeks to 52 weeks
**Current rates:** 4-5%
**Tax benefit:** State tax exempt (no state income tax on interest)
**Where to buy:** [TreasuryDirect.gov](#) or your brokerage

**Money Market Funds:**

**What they are:** Investment funds that hold cash equivalents
**Safety:** Not FDIC insured but extremely safe
**Current rates:** 4-5%
**Access:** Can write checks or transfer easily
**Where:** [Vanguard](#), [Fidelity](#), [Schwab](#) brokerages

**I-Bonds (Inflation-Protected):**

**What they are:** Bonds that adjust with inflation automatically
**Current rate:** 5-6% (changes every 6 months)
**Lock-in:** Must hold 1 year minimum, penalty if sold before 5 years
**Purchase limit:** $10,000/year per person
**Where:** [TreasuryDirect.gov](#)

**Where to put what:**

- **Emergency fund (3-6 months expenses):** High-yield savings
- **House down payment (1-3 years out):** T-bills or high-yield savings
- **Cash you won't touch for 1-5 years:** I-bonds
- **Brokerage cash waiting to invest:** Money market fund

**Why this matters:**

$10,000 in regular bank at 0.01% = $1/year
$10,000 in high-yield savings at 4.5% = $450/year

That's $449 extra just for moving your money to a better bank. Same safety same FDIC insurance. No reason not to do it.

**Pro move:** Keep 1-2 months expenses in regular checking for bills. Move the rest to high-yield savings. Set up auto-transfers so your emergency fund earns 4-5% instead of nothing 💪

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Don't let cash die at 0.01%. High-yield savings = 4-5%, FDIC insured. T-bills = 4-5%, state tax exempt. I-bonds = inflation-protected. All safe options for parking cash.",
      relatedTopics: ["income-dividends-101", "income-reits-tax-advantaged", "income-passive-really"],
      quiz: [
        {
          question: "What's a typical high-yield savings rate as of 2024-2025?",
          options: ["0.01%", "1%", "4-5%", "10%"],
          correctAnswer: 2,
          explanation: "Yes! High-yield savings currently pay 4-5% APY. That's 400-500 times more than regular bank accounts 🏦"
        },
        {
          question: "What's the main tax benefit of Treasury bills?",
          options: [
            "No taxes at all",
            "State tax exempt (no state income tax on interest)",
            "20% tax credit",
            "Capital gains treatment"
          ],
          correctAnswer: 1,
          explanation: "That's right! T-bill interest is exempt from state income tax. Federal tax applies but you save on state 💰"
        },
        {
          question: "Where should you keep your emergency fund?",
          options: ["Stocks", "High-yield savings account", "Under your mattress", "Crypto"],
          correctAnswer: 1,
          explanation: "Exactly! Emergency fund = high-yield savings. Safe, FDIC insured, instant access, earning 4-5% 🏦"
        }
      ]
    },
    {
      id: "income-reits-tax-advantaged",
      title: "REITs & Tax-Advantaged Accounts",
      category: "Income Streams",
      readTime: 5,
      difficulty: "Intermediate",
      summary: "REITs for real-estate income without owning, plus IRA/Roth/401k basics",
      isPro: true,
      content: `Let me show you two ways to build passive income: REITs for real estate exposure without being a landlord and tax-advantaged accounts that supercharge your growth 🏢

**REITs (Real Estate Investment Trusts):**

**What they are:** Companies that own income-producing real estate. By law they must pay 90% of profits as dividends.

**How it works:** You buy shares like a stock. REIT collects rent from tenants. REIT pays you dividends quarterly.

**Types:**
- Residential (apartments): O, EQR, AVB
- Commercial (offices/retail): SPG, BXP  
- Industrial (warehouses): PLD, DRE
- Data centers: DLR, EQIX
- Diversified (mix): VNQ (ETF)

**Typical yield:** 3-7% depending on type

**Tax treatment:** REIT dividends are taxed as ordinary income NOT qualified dividends. Higher tax rate. Hold REITs in tax-advantaged accounts (Roth IRA, traditional IRA) when possible.

**Who should own REITs:**

If you want real estate exposure without:
- Buying physical property
- Being a landlord
- Dealing with maintenance
- Having $200k+ for down payment

REITs give you real estate income with stock market liquidity. Try selling a house in 3 days — good luck 💪

**Tax-Advantaged Accounts for Income Growth:**

**Roth IRA:**
- Contributions: After-tax (you already paid taxes)
- Growth: Tax-free forever
- Withdrawals: Tax-free in retirement
- Limit: $6,500/year ($7,000 if 50+)

**Traditional IRA:**
- Contributions: Pre-tax (reduces taxable income now)
- Growth: Tax-deferred
- Withdrawals: Taxed as ordinary income in retirement
- Limit: $6,500/year ($7,000 if 50+)

**401(k):**
- Contributions: Pre-tax
- Growth: Tax-deferred
- Withdrawals: Taxed as ordinary income
- Limit: $22,500/year ($30,000 if 50+)
- Employer match = free money

**Why this matters for passive income:**

$6,500/year in Roth IRA from age 25-65 at 10% = $3.5 million TAX FREE

Same money in taxable account = $2.66 million after taxes (24% bracket)

That's $840,000 kept vs given to IRS. Same contributions different account massive difference.

**Strategy:**

1. Max employer 401k match (free money)
2. Max Roth IRA ($6,500)
3. Hold dividend stocks and REITs inside Roth IRA for tax-free income growth
4. In retirement turn off DRIP and take dividends as cash tax-free

**Brokers to open accounts:**
- [Vanguard](#)
- [Fidelity](#)
- [Schwab](#)
- [Betterment](#) (automated)

Tax-advantaged accounts + dividend/REIT income = wealth-building machine sis 💛

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "REITs = real estate income without owning property, yield 3-7%, taxed as ordinary income (hold in IRA). Tax-advantaged: Roth IRA = tax-free growth, Traditional IRA/401k = tax-deferred. Max accounts for wealth building.",
      relatedTopics: ["income-dividends-101", "income-hysa-safe-yield", "income-ways-into-real-estate"],
      quiz: [
        {
          question: "What percentage of profits must REITs pay as dividends by law?",
          options: ["50%", "70%", "90%", "100%"],
          correctAnswer: 2,
          explanation: "Yes! REITs must pay 90% of profits as dividends by law. That's why they're high-yield investments 🏢"
        },
        {
          question: "How are REIT dividends taxed?",
          options: [
            "Tax-free",
            "Qualified dividend rate (15-20%)",
            "Ordinary income rate (higher)",
            "No taxes ever"
          ],
          correctAnswer: 2,
          explanation: "That's right! REIT dividends = ordinary income tax (higher). Hold REITs in Roth IRA or traditional IRA when possible 💰"
        },
        {
          question: "What's the 2024 Roth IRA contribution limit?",
          options: ["$3,000", "$6,500", "$22,500", "Unlimited"],
          correctAnswer: 1,
          explanation: "Exactly! $6,500/year ($7,000 if 50+). Max it out for tax-free growth forever sis 💛"
        }
      ]
    },

    // MODULE 4 — Protection & Ownership
    {
      id: "income-protecting-money",
      title: "Why Protecting Your Money Matters",
      category: "Income Streams",
      readTime: 4,
      difficulty: "Beginner",
      summary: "Income means little if it isn't protected",
      isPro: false,
      content: `Here's what nobody talks about when they're hyping passive income: protection matters just as much as building. You can make $10,000/month but if one lawsuit or medical emergency wipes you out what was the point? 🛡️

**The harsh reality:**

You're one car accident, one health crisis, one business lawsuit, or one bad decision away from losing everything you've built. That's not fear-mongering — that's just how life works.

**What protection actually means:**

It's not just insurance (though that's part of it). It's:
- Legal structures that separate your personal assets from business risk
- Insurance that covers your income if you can't work
- Estate planning so your wealth goes where you want
- Emergency funds so one bad month doesn't destroy you

**The protection hierarchy:**

**Level 1: Emergency Fund**
3-6 months expenses in high-yield savings. This handles life's normal chaos (car breaks, lose job, medical bill).

**Level 2: Insurance**
- Term life if anyone depends on your income
- Disability insurance (1 in 4 will become disabled before retirement)
- Health insurance (medical bankruptcy is real)

**Level 3: Legal Structure**
LLC or other business entity if you're earning income outside a W-2 job. Separates personal assets from business liability.

**Level 4: Asset Protection**
Trusts, proper titling, umbrella insurance. This is advanced but matters when you have real wealth to protect.

**Why women skip protection:**

We're taught to be nice, to trust people, to not think about worst-case scenarios. "That won't happen to me." Until it does.

The women who build lasting wealth? They protect their downside FIRST then focus on upside. They're not paranoid — they're prepared.

**The real cost of no protection:**

I've seen women lose rental properties because they didn't have an LLC. Lose everything because they skipped disability insurance and got sick. Watch businesses collapse because they had no legal protection.

Don't let that be you sis. Build income AND protect it. Both matter equally 💛

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Protection = emergency fund + insurance (life, disability, health) + legal structure (LLC) + asset protection. Protect downside first then focus on upside. Both matter equally.",
      relatedTopics: ["income-insurance-explained", "income-llc-basics", "income-cash-flow-business"],
      quiz: [
        {
          question: "What's Level 1 of the protection hierarchy?",
          options: [
            "LLC formation",
            "Emergency fund (3-6 months expenses)",
            "Trusts and estate planning",
            "Stock investments"
          ],
          correctAnswer: 1,
          explanation: "Yes! Emergency fund first. 3-6 months expenses in high-yield savings. This handles life's normal chaos 🛡️"
        },
        {
          question: "What percentage of people will become disabled before retirement?",
          options: ["1 in 100", "1 in 20", "1 in 4", "1 in 2"],
          correctAnswer: 2,
          explanation: "That's right! 1 in 4 will become disabled before retirement. Disability insurance is more important than most people think 💰"
        },
        {
          question: "What should you do first according to Pansy?",
          options: [
            "Focus only on making money",
            "Protect your downside FIRST then focus on upside",
            "Ignore protection until you're wealthy",
            "Only buy insurance"
          ],
          correctAnswer: 1,
          explanation: "Exactly! Protect downside first then build upside. Women who build lasting wealth think this way 💛"
        }
      ]
    },
    {
      id: "income-insurance-explained",
      title: "Insurance, Honestly Explained",
      category: "Income Streams",
      readTime: 5,
      difficulty: "Beginner",
      summary: "Term life and key policy types in plain language, no scare tactics",
      isPro: false,
      content: `Insurance is boring until you need it. Let me break down the types that actually matter for protecting your income — no scare tactics just honest info 🛡️

**Term Life Insurance:**

**What it is:** Pure death benefit. You pay a small monthly premium (like $20-50). If you die during the term (10, 20, or 30 years) your family gets a payout (like $500k).

**Who needs it:** Anyone whose income supports other people (kids, partner, aging parents).

**Who doesn't need it:** Single with no dependents. Nobody's relying on your income so there's no one to protect.

**Cost:** $20-50/month for $500k coverage when you're young and healthy.

**Vetted quoting platforms:**
- [Policygenius](#) — Compare multiple carriers
- [Haven Life](#) — Online application, quick approval
- [Ladder](#) — Flexible coverage, easy to adjust

**Disability Insurance:**

**What it is:** Replaces 50-70% of your income if you become disabled and can't work.

**Why it matters:** 1 in 4 will become disabled before retirement. More likely to need this than life insurance.

**Who needs it:** Anyone whose ability to work = their income source. Especially self-employed or anyone without employer coverage.

**Cost:** 1-3% of your income. If you make $50k/year expect $500-1,500/year in premiums.

**Where to get it:**
- Check employer first (often included or cheap add-on)
- [Policygenius](#) for individual policies

**Health Insurance:**

**What it is:** Covers medical bills so one hospital visit doesn't bankrupt you.

**Who needs it:** Everyone. Medical bankruptcy is the #1 cause of personal bankruptcy in America.

**Where to get it:**
- Employer plan first (usually best deal)
- Healthcare.gov if self-employed or between jobs
- Consider HSA-eligible high-deductible plan + max out HSA for triple tax benefit

**What You DON'T Need (Usually):**

**Whole Life Insurance:** Expensive, slow cash value growth, most people better off with term life + investing the difference.

**Cancer Insurance:** Redundant if you have good health insurance.

**Life Insurance on Kids:** Kids don't earn income — there's nothing to replace. Skip unless you want to cover funeral costs.

**The honest approach:**

Buy term life if people depend on your income. Buy disability insurance if your income depends on your ability to work. Buy health insurance because medical bills are insane. That's the protection trifecta.

Don't let insurance salespeople scare you into expensive policies you don't need. Stick to the basics and invest the rest sis 💛

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Protection trifecta: Term life (if dependents rely on your income), Disability (1 in 4 need it), Health (medical bankruptcy is real). Skip expensive whole life and redundant policies. Basics only.",
      relatedTopics: ["income-protecting-money", "income-llc-basics", "income-cash-flow-business"],
      quiz: [
        {
          question: "Who needs term life insurance?",
          options: [
            "Everyone regardless of situation",
            "Anyone whose income supports other people (kids, partner, parents)",
            "Only people over 50",
            "Single people with no dependents"
          ],
          correctAnswer: 1,
          explanation: "Yes! Term life is for people whose income supports others. If you're single with no dependents you don't need it 🛡️"
        },
        {
          question: "What percentage of people will become disabled before retirement?",
          options: ["1 in 100", "1 in 20", "1 in 4", "None - disabilities don't happen"],
          correctAnswer: 2,
          explanation: "That's right! 1 in 4 will become disabled. Disability insurance is MORE important than life insurance for most people 💰"
        },
        {
          question: "What's the protection trifecta according to Pansy?",
          options: [
            "Whole life + cancer insurance + life on kids",
            "Term life + disability + health insurance",
            "Only health insurance",
            "No insurance needed"
          ],
          correctAnswer: 1,
          explanation: "Exactly! Term life (if dependents), disability (income protection), health (medical bills). That's the basics sis 💛"
        }
      ]
    },
    {
      id: "income-llc-basics",
      title: "Starting an LLC",
      category: "Income Streams",
      readTime: 5,
      difficulty: "Intermediate",
      summary: "When and why to form an LLC, the basics, what it protects",
      isPro: true,
      content: `Starting an LLC sounds intimidating but it's simpler than you think. Let me show you when you need one, what it actually protects, and how to set it up 🏢

**What is an LLC:**

Limited Liability Company = a legal structure that separates your personal assets from business assets. If your business gets sued they can't take your house or personal savings. It's a legal shield.

**When you NEED an LLC:**

- You're freelancing or consulting with clients
- You're running a side business generating income
- You want liability protection
- You're hiring contractors or employees
- You want to look more professional (LLC vs just your name)

**When you DON'T need an LLC:**

- You're just starting out testing an idea
- You're making under $5k/year
- You're a W-2 employee with no side business

**What it protects:**

LLC protects you from business liabilities. Someone sues your business? They can't take your personal assets. But it does NOT protect you from personal negligence (if YOU personally did something illegal or negligent).

**How to form an LLC (step by step):**

1. **Choose a name** — Check your state's business registry. Must include "LLC" in the name. Most states let you reserve for $10-50.

2. **File Articles of Organization** — Legal document that creates your LLC. File with your state (usually Secretary of State office). Costs $50-500 depending on state. Online in most states. Takes 1-3 weeks.

3. **Get an EIN** — Free from IRS.gov. Takes 5 minutes. This is your business tax ID.

4. **Open business bank account** — Separate business and personal finances (legally required for LLCs). Need: EIN, Articles of Organization, driver's license. Banks: [Chase Business](#), [Bank of America Business](#), [Capital One Business](#).

5. **Create Operating Agreement** — Not always required but smart. Free templates online or hire lawyer ($500-1,500).

6. **Get necessary licenses** — Varies by industry and location. Check your city/county. Costs $50-500/year usually.

7. **File annual reports** — Most states require annual or biennial reports. Costs $50-300/year. Miss this and your LLC gets dissolved.

**Ongoing costs:**

- State filing fee: $50-500 one-time
- Annual report: $50-300/year
- Registered agent (if required): $50-300/year
- Business banking: $10-50/month
- Accounting/bookkeeping: $100-500/month if you hire someone

**DIY LLC services:**
- [LegalZoom](#) — $79-$349 + state fees
- [ZenBusiness](#) — $49-$299 + state fees
- DIY directly with your state — Free (just pay state filing fee)

**Tax structure:**

By default LLCs are "pass-through" — profits pass through to your personal tax return. You file Schedule C with your 1040. LLC doesn't pay separate taxes.

**When to form:**

Form an LLC when your side income is consistent ($10k+/year) and you want professional protection. Don't rush to form on day 1 of your idea.

LLC = legal protection + professional credibility. It's not magic but it matters when your income grows sis 💪

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "LLC = liability protection. File Articles of Organization with state ($50-500). Get EIN from IRS (free). Open business bank. File annual reports ($50-300/year). Form when income is $10k+/year consistent.",
      relatedTopics: ["income-protecting-money", "income-cash-flow-business", "income-insurance-explained"],
      quiz: [
        {
          question: "What's the main benefit of forming an LLC?",
          options: [
            "Automatic tax savings",
            "Separates personal assets from business liabilities",
            "Guarantees business success",
            "No paperwork required"
          ],
          correctAnswer: 1,
          explanation: "Yes! LLC = liability protection. Business debts/lawsuits can't touch your personal assets. That's the shield 🏢"
        },
        {
          question: "What's an EIN and where do you get it?",
          options: [
            "Employer Identification Number from IRS (free, takes 5 minutes)",
            "Employee Insurance Number from state ($500)",
            "Not needed for LLCs",
            "Must hire lawyer to get one"
          ],
          correctAnswer: 0,
          explanation: "That's right! EIN = business tax ID from IRS.gov. Free, takes 5 minutes. You'll need it for banking 💰"
        },
        {
          question: "When should you form an LLC according to Pansy?",
          options: [
            "Day 1 of having a business idea",
            "When side income is consistent ($10k+/year)",
            "Never form an LLC",
            "Only after making $1 million"
          ],
          correctAnswer: 1,
          explanation: "Exactly! Form when income is steady $10k+/year. Don't rush on day 1 — test your idea first sis 💪"
        }
      ]
    },
    {
      id: "income-cash-flow-business",
      title: "Building a Cash-Flow Business",
      category: "Income Streams",
      readTime: 5,
      difficulty: "Intermediate",
      summary: "Turning a hustle into a small business, reinvesting, simple systems",
      isPro: true,
      content: `There's a difference between having a side hustle and building a business. Let me show you how to turn your hustle into something that cash flows and grows 💼

**The hustle → business transition:**

**Hustle stage:** You trade time for money. Every dollar requires your direct effort. If you stop working income stops.

**Business stage:** Systems + people do the work. You manage strategy. Income continues even when you're not directly working.

**How to make the transition:**

**Step 1: Systematize Everything**

Write down your process for every task. Client onboarding. Service delivery. Invoicing. Follow-up. If it's only in your head you can't scale it.

Create templates, checklists, SOPs (Standard Operating Procedures). Boring but essential.

**Step 2: Reinvest Profits**

Don't take every dollar as personal income. Reinvest 30-50% back into the business:
- Tools and software that save time
- Contractors to handle repeatable tasks
- Marketing to bring in more clients
- Training to improve skills

**Step 3: Hire Your First Helper**

Start with contractors not employees (way simpler). Outsource the tasks you hate or that take the most time:
- Admin work (VA from Upwork/Fiverr)
- Customer service (support from OnlineJobs.ph)
- Content creation (writers from Upwork)
- Design work (designers from Fiverr)

Pay $15-30/hour for good contractors. If they save you 10 hours/week that's $150-300/week you can spend on higher-value work.

**Step 4: Build Simple Systems**

You don't need fancy software. You need:
- CRM or spreadsheet to track clients
- Project management tool (Trello, Asana, Notion)
- Automated invoicing (FreshBooks, Wave, QuickBooks)
- Email templates for common questions
- Onboarding checklist for new clients

**Step 5: Track Numbers Weekly**

- Revenue (how much came in)
- Expenses (what went out)
- Profit (what's left)
- Client count (how many you're serving)
- Hours worked (your time investment)

If you don't measure you can't improve.

**The cash flow business model:**

**Month 1:** $3k revenue, you work 60 hours
**Month 6:** $5k revenue, contractor handles 20 hours, you work 40 hours
**Month 12:** $8k revenue, 2 contractors handle 40 hours, you work 30 hours
**Month 24:** $12k revenue, team handles 60 hours, you work 20 hours managing

You're earning MORE while working LESS because systems + people scale.

**Real talk:**

This takes 1-2 years minimum. It's not sexy. It's documenting processes, training people, fixing mistakes, refining systems. But this is how you build something that outlasts your hustle energy.

You can't hustle forever. But systems and teams can run indefinitely sis 💪

Bloom is for educational purposes only and does not provide financial, tax, legal, or investment advice. All investing and borrowing involves risk. Always consult a licensed professional before making financial decisions.`,
      keyTakeaway: "Hustle = time for money. Business = systems + people do work. Transition: systematize → reinvest 30-50% → hire contractors → build simple systems → track numbers. Takes 1-2 years but scales.",
      relatedTopics: ["income-llc-basics", "income-protecting-money", "income-skills-to-income"],
      quiz: [
        {
          question: "What's the main difference between a hustle and a business?",
          options: [
            "Businesses make more money",
            "Hustles are illegal",
            "Hustle = time for money, Business = systems + people do work",
            "There is no difference"
          ],
          correctAnswer: 2,
          explanation: "Yes! Hustle = you trade time for money. Business = systems + people scale the work. That's the shift 💼"
        },
        {
          question: "How much of profits should you reinvest according to Pansy?",
          options: ["0% - take it all", "10%", "30-50%", "100%"],
          correctAnswer: 2,
          explanation: "That's right! Reinvest 30-50% into tools, contractors, marketing, training. That's how you grow 💰"
        },
        {
          question: "What should you hire out first?",
          options: [
            "CEO position",
            "Tasks you hate or that take the most time (admin, support, content)",
            "Everything immediately",
            "Never hire anyone"
          ],
          correctAnswer: 1,
          explanation: "Exactly! Outsource tasks you hate or that eat time. VA, support, content. Frees you for high-value work sis 💪"
        }
      ]
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

        if (scrollPosition >= scrollHeight - 50) {
          setHasScrolledToBottom(true);
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
        .select("lesson_id, quiz_score, quiz_completed")
        .eq("user_id", userId)
        .eq("completed", true);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("bookmarked_lessons, experience_level, investment_goals, risk_tolerance")
        .eq("id", userId)
        .single();

      if (progressData) {
        setCompletedLessons(progressData.map((p) => p.lesson_id));
      }

      if (profileData) {
        if (profileData.bookmarked_lessons) {
          setBookmarkedLessons(profileData.bookmarked_lessons);
        }
        setUserProfile({
          experience_level: profileData.experience_level,
          investment_goals: profileData.investment_goals as string[] | null,
          risk_tolerance: profileData.risk_tolerance,
        });
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

  const handleSubmitQuiz = async () => {
    if (!user?.id || !selectedLesson) return;

    const lesson = lessons.find((l) => l.id === selectedLesson);
    if (!lesson) return;

    let score = 0;
    quizAnswers.forEach((answer, index) => {
      if (answer === lesson.quiz[index].correctAnswer) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    try {
      const { error } = await supabase
        .from("lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_id: selectedLesson,
          completed: true,
          completed_at: new Date().toISOString(),
          quiz_score: score,
          quiz_completed: true,
          quiz_attempts: 1,
        });

      if (!error && !completedLessons.includes(selectedLesson)) {
        setCompletedLessons([...completedLessons, selectedLesson]);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers([null, null, null]);
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const toggleBookmark = async (lessonId: string) => {
    if (!user?.id) return;

    const isBookmarked = bookmarkedLessons.includes(lessonId);
    const newBookmarks = isBookmarked
      ? bookmarkedLessons.filter((id) => id !== lessonId)
      : [...bookmarkedLessons, lessonId];

    try {
      const { error } = await supabase
        .from("profiles")
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
    "Trading Psychology",
  ];

  const completionPercentage = Math.round(
    (completedLessons.length / lessons.length) * 100
  );

  const TOPIC_TO_CATEGORIES: Record<string, string[]> = {
    stocks_etfs: ["Stocks", "ETFs"],
    budgeting: ["Trading Psychology"],
    retirement: ["Retirement"],
    crypto: ["Stocks"],
    real_estate: ["Income Streams"],
    trading: ["Trading Psychology", "Stocks"],
  };

  const GOAL_TO_CATEGORIES: Record<string, string[]> = {
    grow_wealth: ["Stocks", "ETFs"],
    retirement: ["Retirement", "ETFs"],
    passive_income: ["Dividends", "Income Streams"],
    emergency_fund: ["Trading Psychology", "Bonds"],
    financial_confidence: ["Stocks", "ETFs", "Mutual Funds"],
    college_fund: ["Retirement", "ETFs"],
  };

  const getPersonalizedLessons = () => {
    if (!userProfile) return [];

    const topicCategories = new Set<string>();
    (userProfile.investment_goals || []).forEach(t => {
      (TOPIC_TO_CATEGORIES[t] || []).forEach(c => topicCategories.add(c));
    });

    const goalCategories = new Set<string>();
    (GOAL_TO_CATEGORIES[userProfile.risk_tolerance || ""] || []).forEach(c => goalCategories.add(c));

    const isBeginnerish = !userProfile.experience_level || userProfile.experience_level === "beginner";

    const uncompleted = lessons.filter(l => !completedLessons.includes(l.id));

    const scored = uncompleted.map(lesson => {
      let score = 0;
      if (topicCategories.has(lesson.category)) score += 3;
      if (goalCategories.has(lesson.category)) score += 2;
      if (isBeginnerish && lesson.difficulty === "Beginner") score += 1;
      if (!isBeginnerish && lesson.difficulty === "Intermediate") score += 1;
      return { lesson, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5).map(s => s.lesson);
  };

  const roadmapLessons = getPersonalizedLessons();

  const getPansyGuidance = (): { message: string; tip?: string; variant: "default" | "celebration" | "tip" | "coach"; action?: { label: string; href: string } } | null => {
    const completedCategories = new Set(
      lessons.filter(l => completedLessons.includes(l.id)).map(l => l.category)
    );
    const allCategories = [...new Set(lessons.map(l => l.category))];
    const unexplored = allCategories.filter(c => !completedCategories.has(c));

    if (completedLessons.length === 0) {
      return {
        message: "Start with \"What is a Stock\" — it takes 3 minutes and sets the foundation for everything else.",
        variant: "coach",
      };
    }
    if (completedLessons.length === 1) {
      return {
        message: "First lesson done! You just took the hardest step. The next one builds directly on what you learned.",
        variant: "celebration",
      };
    }
    if (completedLessons.length >= 3 && completedLessons.length < 8 && unexplored.length > 0) {
      return {
        message: `You've been doing great! Have you checked out ${unexplored[0]} yet? It pairs well with what you've learned.`,
        tip: "Exploring different categories gives you a wider perspective on how markets work.",
        variant: "tip",
      };
    }
    if (unexplored.length === 0) {
      return {
        message: "You've explored every category! Try revisiting quizzes to strengthen your knowledge, or head to Practice.",
        variant: "celebration",
        action: { label: "Practice Trading", href: "/practice" },
      };
    }
    if (completedLessons.length >= 8) {
      return {
        message: `${completedLessons.length} lessons completed — you're building real knowledge. ${unexplored.length} categor${unexplored.length === 1 ? "y" : "ies"} left to explore.`,
        variant: "default",
      };
    }
    return null;
  };
  const pansyGuidance = getPansyGuidance();

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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedLesson(null);
                  setHasScrolledToBottom(false);
                  resetQuiz();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to lessons
              </Button>
            </div>

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
                  alt="Pansy"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">Pansy</p>
                  <p className="text-sm text-muted-foreground">
                    Bloom's Investing Expert
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border rounded-2xl">
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {lesson.content}
                </p>
              </div>

              <div className="mt-8 p-4 bg-primary/10 border-l-4 border-primary rounded-r-lg">
                <p className="text-sm font-semibold text-primary mb-2">
                  Key Takeaway
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {lesson.keyTakeaway}
                </p>
              </div>

              <p className="mt-6 text-xs text-muted-foreground text-center">
                This is educational content only and does not constitute
                financial advice. Always invest what feels right for you 💛
              </p>
            </Card>

            <Card className="p-6 bg-card border-accent/30 rounded-2xl space-y-6">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-accent" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Test Your Knowledge
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    See how much you learned from this lesson!
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {lesson.quiz.map((question, qIndex) => (
                  <div key={qIndex} className="space-y-3">
                    <p className="font-medium text-foreground">
                      {qIndex + 1}. {question.question}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => {
                        const isSelected = quizAnswers[qIndex] === oIndex;
                        const isCorrect = oIndex === question.correctAnswer;
                        const showFeedback = quizSubmitted;

                        return (
                          <button
                            key={oIndex}
                            onClick={() => {
                              if (!quizSubmitted) {
                                const newAnswers = [...quizAnswers];
                                newAnswers[qIndex] = oIndex;
                                setQuizAnswers(newAnswers);
                              }
                            }}
                            disabled={quizSubmitted}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              showFeedback && isCorrect
                                ? "border-primary bg-primary/10 text-foreground"
                                : showFeedback && isSelected && !isCorrect
                                ? "border-destructive bg-destructive/10 text-foreground"
                                : isSelected
                                ? "border-accent bg-accent/10 text-foreground"
                                : "border-border bg-muted/30 text-muted-foreground hover:border-accent hover:bg-accent/5"
                            } ${quizSubmitted ? "cursor-default" : "cursor-pointer"}`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  showFeedback && isCorrect
                                    ? "border-primary bg-primary"
                                    : showFeedback && isSelected && !isCorrect
                                    ? "border-destructive bg-destructive"
                                    : isSelected
                                    ? "border-accent bg-accent"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {showFeedback && isCorrect && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                                {showFeedback && isSelected && !isCorrect && (
                                  <span className="text-white text-xs">✗</span>
                                )}
                              </div>
                              <span className="text-sm">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <div className="p-3 bg-accent/10 border-l-4 border-accent rounded-r-lg">
                        <p className="text-sm text-foreground">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!quizSubmitted ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={quizAnswers.includes(null)}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-primary/10 via-accent/5 to-[#EC4899]/10 border border-primary/20 rounded-2xl text-center space-y-3">
                    <div className="text-5xl" style={{ animation: "gardenBloom 0.6s ease-out" }}>
                      {quizScore === 3 ? "🌸" : quizScore === 2 ? "🌺" : "🌱"}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground mb-1">
                        {quizScore === 3 ? "Perfect! You earned a bloom!" : quizScore === 2 ? "Great work! Flower earned!" : "Keep growing!"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quizScore}/3 correct — {quizScore === 3
                          ? "This bloom is now in your garden 🌸"
                          : quizScore === 2
                          ? "A new flower joins your garden 💪"
                          : "Review and try again to earn a bloom 💛"}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                      <span>{completedLessons.length} flowers in your garden</span>
                    </div>
                  </div>

                  {(() => {
                    const currentIdx = lessons.findIndex(l => l.id === selectedLesson);
                    const nextLesson = currentIdx >= 0 && currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;
                    return nextLesson ? (
                      <Button
                        onClick={() => {
                          setSelectedLesson(nextLesson.id);
                          setHasScrolledToBottom(false);
                          resetQuiz();
                          window.scrollTo(0, 0);
                        }}
                        className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
                      >
                        Next Lesson: {nextLesson.title} <ChevronRight className="w-5 h-5 ml-1" />
                      </Button>
                    ) : null;
                  })()}

                  <Button
                    onClick={resetQuiz}
                    variant="outline"
                    className="w-full border-border"
                  >
                    Retake Quiz
                  </Button>
                  <style jsx global>{`
                    @keyframes gardenBloom {
                      from { opacity: 0; transform: scale(0.3) rotate(-20deg); }
                      to { opacity: 1; transform: scale(1) rotate(0deg); }
                    }
                  `}</style>
                </div>
              )}
            </Card>

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
                        resetQuiz();
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
        title="Bloom Basics - Learn Investing"
        description="Everything about investing explained by Pansy in girlfriend language"
      />
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Bloom Basics 🌱
            </h1>
            <p className="text-muted-foreground">
              Your foundation — investing explained by Pansy in girlfriend language
            </p>
          </div>

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
            {completedLessons.length >= 5 && (
              <button
                onClick={() => router.push("/certificate?type=basics")}
                className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #C9A84C, #D4AF37)" }}
              >
                🌸 {completedLessons.length >= lessons.length ? "Download Your Certificate" : "Preview Your Certificate"}
              </button>
            )}
          </Card>

          <BloomGarden
            completedLessons={completedLessons}
            totalLessons={lessons.length}
            lessonNames={lessons.map(l => ({ id: l.id, title: l.title, category: l.category }))}
          />

          {roadmapLessons.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Route className="w-5 h-5 text-[#27B7C8]" />
                  <h3 className="font-serif text-lg font-bold text-foreground">Your Roadmap</h3>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Based on your goals</span>
              </div>
              <div className="space-y-0">
                {roadmapLessons.map((lesson, i) => {
                  const isLast = i === roadmapLessons.length - 1;
                  return (
                    <div key={lesson.id} className="flex gap-3 cursor-pointer group" onClick={() => setSelectedLesson(lesson.id)}>
                      <div className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors group-hover:scale-110"
                          style={{
                            background: i === 0 ? "linear-gradient(135deg, #27B7C8, #49B06E)" : "rgba(39,183,200,0.12)",
                            color: i === 0 ? "white" : "#27B7C8",
                            border: i === 0 ? "none" : "1px solid rgba(39,183,200,0.25)",
                          }}
                        >
                          {i === 0 ? <Star className="w-4 h-4" /> : i + 1}
                        </div>
                        {!isLast && (
                          <div className="w-px h-full min-h-[24px] bg-border" />
                        )}
                      </div>
                      <div className={`flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
                        <p className="text-sm font-semibold text-foreground group-hover:text-[#27B7C8] transition-colors leading-tight">{lesson.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px] px-1.5 py-0">{lesson.category}</Badge>
                          <span className="text-[10px] text-muted-foreground">{lesson.readTime} min</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0 group-hover:text-[#27B7C8] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/university", icon: <BookOpen className="w-5 h-5 text-accent shrink-0" />, title: "Bloom University", sub: "Advanced modules" },
              { href: "/brokers", icon: <Building2 className="w-5 h-5 text-accent shrink-0" />, title: "Find a Broker", sub: "Compare platforms" },
            ].map((item, i) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => haptic()}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-accent/40 transition-colors"
                >
                  {item.icon}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {pansyGuidance && (
            <PansyContextCard
              message={pansyGuidance.message}
              tip={pansyGuidance.tip}
              variant={pansyGuidance.variant}
              action={pansyGuidance.action}
            />
          )}

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

          {/* Lessons Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isBookmarked = bookmarkedLessons.includes(lesson.id);
                const isGated = lesson.isPro === true && !isPro;
                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5), type: "spring", stiffness: 400, damping: 30 }}
                    whileTap={{ scale: 0.97 }}
                  >
                  <Card
                    className={`p-4 bg-card border-border rounded-xl hover:border-accent/50 transition-all cursor-pointer group ${isGated ? "opacity-50" : ""}`}
                    onClick={() => {
                      haptic();
                      if (isGated) {
                        setShowLearnUpgradeModal(true);
                      } else {
                        setSelectedLesson(lesson.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src="/bloom-logo.png"
                        alt="Pansy"
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                                {lesson.category}
                              </Badge>
                              {isGated && (
                                <Badge className="bg-muted text-muted-foreground border-muted-foreground/30 text-xs flex items-center gap-1">
                                  <Lock className="w-3 h-3" />Pro
                                </Badge>
                              )}
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
                  </motion.div>
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

          <Card className="p-6 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20 rounded-2xl">
            <div className="flex items-start gap-4">
              <img
                src="/bloom-logo.png"
                alt="Pansy"
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
                  — Pansy 🌺
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30 border-border rounded-xl">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              This is educational content only and does not constitute financial
              advice. Bloom is not liable for any investment decisions or
              losses.
            </p>
          </Card>
        </div>
      </div>

      <UpgradeModal
        isOpen={showLearnUpgradeModal}
        onClose={() => setShowLearnUpgradeModal(false)}
        trigger="view_limit"
      />
    </Layout>
  );
}