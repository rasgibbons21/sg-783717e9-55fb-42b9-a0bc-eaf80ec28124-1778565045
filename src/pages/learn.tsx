import { useEffect, useState, useRef } from "react";
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
import { Search, ArrowLeft, Clock, CheckCircle2, Circle, ChevronRight, Bookmark, BookmarkCheck, Award } from "lucide-react";

type Category = "All" | "Stocks" | "ETFs" | "Mutual Funds" | "Dividends" | "Bonds" | "Retirement" | "Trading Psychology";

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
}

export default function Learn() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [bookmarkedLessons, setBookmarkedLessons] = useState<string[]>([]);
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
          question: "What's the best way to approach stock investing according to Dahlia?",
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
          question: "What should you do during a bear market according to Dahlia?",
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
          question: "When should you turn off DRIP according to Dahlia?",
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
          question: "What's Dahlia's recommendation for beginners?",
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
          question: "What's the hardest part of the 3:1 rule according to Dahlia?",
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
          question: "According to Dahlia's rules, what should you do when a stock drops 20%?",
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
          question: "What's Dahlia's FOMO rule?",
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
          question: "Why is revenge trading so dangerous according to Dahlia?",
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
          question: "What's the minimum risk to reward ratio Dahlia requires?",
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

      const { data: userData } = await (supabase
        .from("users")
        .select("bookmarked_lessons")
        .eq("id", userId)
        .single() as any);

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
      const { error } = await (supabase
        .from("users") as any)
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
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                    <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-lg font-semibold text-primary mb-1">
                      You scored {quizScore} out of 3!
                    </p>
                    <p className="text-sm text-foreground">
                      {quizScore === 3
                        ? "Perfect score girl! You absolutely crushed this lesson 🎉"
                        : quizScore === 2
                        ? "Nice work! You got most of it down 💪"
                        : "That's okay! Go back and review the lesson anytime 💛"}
                    </p>
                  </div>
                  <Button
                    onClick={resetQuiz}
                    variant="outline"
                    className="w-full border-border"
                  >
                    Retake Quiz
                  </Button>
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
        title="Bloom University - Learn Investing"
        description="Everything about investing explained by Dahlia in girlfriend language"
      />
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Bloom University 🎓
            </h1>
            <p className="text-muted-foreground">
              Everything about investing explained by Dahlia in girlfriend
              language
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
          </Card>

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