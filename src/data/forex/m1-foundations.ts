import type { ForexLesson } from "./types";

export const M1_FOUNDATIONS: ForexLesson[] = [
  {
    module: "foundations",
    slug: "what-is-forex",
    title: "What Is Forex?",
    subtitle: "The largest financial market in the world — and you can learn it from your phone.",
    pansyIntro: "Welcome to Forex 101! I'm Pansy, and I'll walk you through the foreign exchange market step by step. No jargon bombs, no assumptions — just clear explanations with real examples. Ready? Let's go.",
    difficulty: "Beginner",
    readingMinutes: 5,
    sections: [
      {
        heading: "The Basics",
        content: "Forex — short for foreign exchange — is simply the act of exchanging one currency for another. When you swap dollars for euros at the airport, you're doing forex. The difference is that traders do it electronically, 24 hours a day, five days a week, trying to profit from changes in exchange rates.\n\nThe forex market is the largest financial market on earth. Over $7.5 trillion changes hands every single day. That's more than all the world's stock markets combined. The participants range from central banks and hedge funds to individual traders working from a laptop."
      },
      {
        heading: "Why Currencies Move",
        content: "Currency values change because of supply and demand. When more people want to buy a currency, its price goes up. When more people sell it, the price falls. What drives that demand?\n\nInterest rates are the biggest driver. When a country's central bank raises interest rates, its currency tends to strengthen because investors earn more by holding it. Economic data — employment numbers, inflation reports, GDP growth — also moves currencies because it signals how healthy an economy is.\n\nPolitical events, trade balances, and even market sentiment (fear vs. greed) all play a role. The key takeaway: currencies reflect the economic health and policies of their countries."
      },
      {
        heading: "How Forex Trading Works",
        content: "Unlike stocks, forex doesn't have a central exchange. It's an over-the-counter (OTC) market — a network of banks, brokers, and electronic platforms connected globally. Trading happens in sessions that follow the sun: Sydney opens first, then Tokyo, then London, then New York. Because these sessions overlap, the market is active 24 hours on weekdays.\n\nAs a retail trader, you access the market through a broker. You open an account, deposit funds, and use the broker's platform (like MetaTrader 4 or 5) to place trades. The broker connects your orders to the broader market."
      },
      {
        heading: "A Quick Example",
        content: "Say the EUR/USD exchange rate is 1.0850. That means 1 euro costs $1.0850. You believe the euro will strengthen, so you buy EUR/USD. The rate rises to 1.0900. You close the trade. You gained 50 pips (we'll cover pips in the next lesson) — and depending on your position size, that's real profit.\n\nIf you were wrong and the rate fell to 1.0800, you'd lose 50 pips. Every forex trade is a bet that one currency will strengthen against another."
      },
      {
        heading: "Key Takeaways",
        content: "Forex is the exchange of one currency for another. It's the world's largest market, open 24/5, driven by interest rates, economic data, and global events. You access it through a broker and profit (or lose) based on changes in exchange rates. None of this is a recommendation to trade — it's the foundation you need to understand what comes next."
      }
    ],
    keyTakeaways: [
      "Forex is exchanging one currency for another to profit from rate changes.",
      "Over $7.5 trillion trades daily — the largest market on earth.",
      "Currencies move based on interest rates, economic data, and global events.",
      "The market is open 24 hours, five days a week across four major sessions."
    ],
    quiz: [
      {
        q: "What primarily drives currency values in the forex market?",
        options: [
          "The number of retail traders online",
          "Interest rates, economic data, and global events",
          "Stock market performance only",
          "The time of day"
        ],
        correct: 1,
        explanation: "Currency values are driven by supply and demand, which is influenced by interest rates (the biggest driver), economic data like employment and GDP, and global events including political changes and trade policy."
      },
      {
        q: "How many hours per day is the forex market typically active on weekdays?",
        options: [
          "8 hours",
          "12 hours",
          "24 hours",
          "16 hours"
        ],
        correct: 2,
        explanation: "The forex market operates 24 hours a day on weekdays because trading sessions in Sydney, Tokyo, London, and New York overlap, creating continuous activity around the clock."
      },
      {
        q: "If you buy EUR/USD at 1.0850 and it rises to 1.0900, what happened?",
        options: [
          "You lost money because the dollar strengthened",
          "Nothing — the rate didn't change enough to matter",
          "You gained 50 pips because the euro strengthened against the dollar",
          "You need to wait for the market to close to know"
        ],
        correct: 2,
        explanation: "Buying EUR/USD means you expect the euro to strengthen. When the rate moves from 1.0850 to 1.0900, the euro gained value — that's a 50-pip profit (1.0900 - 1.0850 = 0.0050 = 50 pips)."
      }
    ],
    brokerContext: ["forex-basics"],
    seoKeywords: ["what is forex", "forex trading for beginners", "foreign exchange market explained"],
  },

  {
    module: "foundations",
    slug: "currency-pairs",
    title: "Currency Pairs — Base, Quote, and the Big Three Categories",
    subtitle: "Every forex trade involves two currencies. Here's how to read and understand any pair.",
    pansyIntro: "Think of a currency pair as a fraction — the top currency divided by the bottom one. Once you see it that way, the whole market makes sense. Let me break it down.",
    difficulty: "Beginner",
    readingMinutes: 5,
    sections: [
      {
        heading: "Base and Quote",
        content: "Every forex quote shows two currencies. In EUR/USD = 1.0850, the euro (EUR) is the base currency and the US dollar (USD) is the quote currency. The number tells you how much of the quote currency it costs to buy one unit of the base.\n\nSo 1.0850 means: 1 euro costs $1.085. If you buy EUR/USD, you're buying euros and selling dollars. If you sell EUR/USD, you're selling euros and buying dollars. Every forex trade is always a pair — you're always long one currency and short the other."
      },
      {
        heading: "Majors",
        content: "The seven major pairs all include the US dollar:\n\nEUR/USD (Euro/Dollar) — the most traded pair in the world, about 23% of all forex volume.\nUSD/JPY (Dollar/Yen) — second most traded, sensitive to interest rate differences between the US and Japan.\nGBP/USD (Pound/Dollar) — called \"Cable\" from the transatlantic telegraph cable that once transmitted rates.\nUSD/CHF (Dollar/Swiss Franc) — the Swiss franc is considered a safe-haven currency.\nAUD/USD, NZD/USD, USD/CAD — commodity-linked pairs tied to Australia, New Zealand, and Canada's exports.\n\nMajors have the tightest spreads (lowest trading costs) and the most liquidity. They're where most beginners start."
      },
      {
        heading: "Minors and Exotics",
        content: "Minor pairs (or crosses) are pairs without the US dollar but between other major currencies: EUR/GBP, EUR/JPY, GBP/JPY, AUD/NZD. They still have good liquidity but slightly wider spreads than majors.\n\nExotic pairs combine a major currency with one from a smaller or emerging economy: USD/TRY (Turkish Lira), USD/ZAR (South African Rand), EUR/PLN (Polish Zloty). Exotics can have very wide spreads and sharp, unpredictable moves. They're not where beginners should start."
      },
      {
        heading: "Correlation",
        content: "Some pairs tend to move together. EUR/USD and GBP/USD often move in the same direction because both are priced against the dollar. USD/JPY and USD/CHF sometimes move together too. Conversely, EUR/USD and USD/CHF often move in opposite directions.\n\nWhy does this matter? If you open two trades on highly correlated pairs, you're essentially doubling your risk on the same bet. Understanding correlation helps you diversify rather than accidentally concentrate."
      }
    ],
    keyTakeaways: [
      "The base currency is first, the quote is second — the number tells you the cost of one base unit.",
      "Majors (include USD) have the tightest spreads and most liquidity.",
      "Minors are crosses without USD; exotics pair a major with an emerging-market currency.",
      "Watch correlation — two correlated trades double your exposure to the same move."
    ],
    quiz: [
      {
        q: "In the pair GBP/USD = 1.2650, what does the number mean?",
        options: [
          "1 US dollar costs 1.2650 British pounds",
          "1 British pound costs 1.2650 US dollars",
          "The spread between GBP and USD is 1.2650",
          "GBP is 1.2650 times stronger than it was yesterday"
        ],
        correct: 1,
        explanation: "GBP is the base currency and USD is the quote. The rate tells you how many units of the quote (dollars) it costs to buy one unit of the base (pounds). So 1 GBP = $1.2650."
      },
      {
        q: "Which of these is an exotic currency pair?",
        options: [
          "EUR/USD",
          "GBP/JPY",
          "USD/TRY",
          "AUD/NZD"
        ],
        correct: 2,
        explanation: "USD/TRY (US Dollar/Turkish Lira) is an exotic pair because it combines a major currency with one from an emerging economy. EUR/USD is a major, GBP/JPY and AUD/NZD are minors (crosses)."
      },
      {
        q: "Why should beginners be cautious about trading two highly correlated pairs at the same time?",
        options: [
          "Correlated pairs always lose money",
          "It doubles your exposure to essentially the same directional move",
          "Brokers charge extra fees for correlated trades",
          "It's against forex regulations"
        ],
        correct: 1,
        explanation: "If EUR/USD and GBP/USD are both moving based on US dollar strength, going long on both means you're effectively doubling your bet on dollar weakness. If you're wrong, both trades lose."
      }
    ],
    brokerContext: ["forex-basics", "currency-pairs"],
    seoKeywords: ["currency pairs explained", "forex majors minors exotics", "base quote currency"],
  },

  {
    module: "foundations",
    slug: "pips-lots-pip-value",
    title: "Pips, Lots, and Pip Value",
    subtitle: "The measuring units of forex — how to know exactly how much you stand to gain or lose.",
    pansyIntro: "Before you place a single trade, you need to know what a pip is, what a lot is, and how to calculate what each pip is worth in actual money. These are the building blocks. Let's nail them.",
    difficulty: "Beginner",
    readingMinutes: 6,
    sections: [
      {
        heading: "What Is a Pip?",
        content: "A pip (percentage in point) is the smallest standard price move in a currency pair. For most pairs, it's the fourth decimal place. If EUR/USD moves from 1.0850 to 1.0851, that's 1 pip.\n\nThe exception is pairs involving the Japanese yen (JPY), where a pip is the second decimal place. If USD/JPY moves from 149.50 to 149.51, that's 1 pip.\n\nSome brokers show a fifth decimal (called a pipette or fractional pip) — for example, 1.08507. That last digit is one-tenth of a pip. It gives you finer pricing but the standard unit of measure is still the pip."
      },
      {
        heading: "What Is a Lot?",
        content: "A lot is the standard unit of trade size in forex. There are three common sizes:\n\nStandard lot = 100,000 units of the base currency. If you buy 1 standard lot of EUR/USD, you're buying 100,000 euros.\n\nMini lot = 10,000 units. One-tenth of a standard lot.\n\nMicro lot = 1,000 units. One-hundredth of a standard lot.\n\nMany brokers also offer nano lots (100 units), which are great for practice. The lot size you choose determines how much each pip is worth — and that directly controls your risk."
      },
      {
        heading: "Calculating Pip Value",
        content: "For any pair where the quote currency is USD (like EUR/USD, GBP/USD):\n\n1 standard lot → 1 pip = $10\n1 mini lot → 1 pip = $1\n1 micro lot → 1 pip = $0.10\n\nWorked example: You buy 1 mini lot of EUR/USD at 1.0850. The rate rises to 1.0880. That's 30 pips × $1 per pip = $30 profit.\n\nFor pairs where USD is the base (like USD/JPY), the calculation involves dividing by the current exchange rate. If USD/JPY is 149.50 and you trade 1 standard lot: pip value = (0.01 / 149.50) × 100,000 = $6.69 per pip. Most trading platforms calculate this for you automatically."
      },
      {
        heading: "Why This Matters",
        content: "Every trade decision should start with: \"If I'm wrong, how much do I lose?\" Knowing your lot size and pip value gives you the answer. If you set a stop-loss 20 pips away on a mini lot, you know your maximum risk is 20 × $1 = $20. Without this math, you're guessing — and guessing is how accounts blow up."
      }
    ],
    keyTakeaways: [
      "A pip is the 4th decimal for most pairs (2nd for JPY pairs).",
      "Standard lot = 100K units, mini = 10K, micro = 1K.",
      "On USD-quoted pairs: 1 standard lot = $10/pip, 1 mini = $1/pip, 1 micro = $0.10/pip.",
      "Always calculate your per-pip risk before entering a trade."
    ],
    quiz: [
      {
        q: "EUR/USD moves from 1.1200 to 1.1235. How many pips did it move?",
        options: [
          "3.5 pips",
          "35 pips",
          "350 pips",
          "0.35 pips"
        ],
        correct: 1,
        explanation: "1.1235 - 1.1200 = 0.0035. Since a pip is the fourth decimal place, that's 35 pips."
      },
      {
        q: "You buy 1 mini lot (10,000 units) of GBP/USD and gain 25 pips. What's your profit?",
        options: [
          "$2.50",
          "$25",
          "$250",
          "$0.25"
        ],
        correct: 1,
        explanation: "For a USD-quoted pair, 1 mini lot = $1 per pip. So 25 pips × $1 = $25 profit."
      },
      {
        q: "What is the pip value for 1 standard lot on a USD-quoted pair like EUR/USD?",
        options: [
          "$0.10",
          "$1",
          "$10",
          "$100"
        ],
        correct: 2,
        explanation: "For USD-quoted pairs, 1 standard lot (100,000 units) has a pip value of $10. This is a key number to memorize."
      }
    ],
    brokerContext: ["forex-basics", "pip-value"],
    seoKeywords: ["what is a pip in forex", "forex lot sizes explained", "pip value calculator"],
  },

  {
    module: "foundations",
    slug: "bid-ask-spreads",
    title: "Bid, Ask, and Spreads",
    subtitle: "The hidden cost of every trade — and how to minimize it.",
    pansyIntro: "Every time you open a trade, you pay a cost called the spread. It's small — but it adds up fast if you don't understand it. Let me show you exactly what's happening.",
    difficulty: "Beginner",
    readingMinutes: 5,
    sections: [
      {
        heading: "Bid and Ask",
        content: "Every currency pair has two prices displayed at any moment:\n\nThe bid is the price at which the market will buy from you (the price you get when you sell). The ask is the price at which the market will sell to you (the price you pay when you buy).\n\nThe ask is always higher than the bid. For example, EUR/USD might show: Bid 1.0848 / Ask 1.0850. If you buy right now, you enter at 1.0850. If you sell right now, you enter at 1.0848."
      },
      {
        heading: "The Spread",
        content: "The spread is the difference between the bid and ask: 1.0850 - 1.0848 = 0.0002 = 2 pips. That's your cost of entry on every trade.\n\nThink of it this way: the moment you open a buy trade, you're already 2 pips in the negative because you bought at the ask but your position is valued at the bid. The market has to move at least 2 pips in your favor just to break even.\n\nSpreads vary by pair and market conditions. EUR/USD typically has a spread of 0.5–2 pips. An exotic like USD/TRY might have a spread of 15–50 pips."
      },
      {
        heading: "Fixed vs. Variable Spreads",
        content: "Some brokers offer fixed spreads — the spread stays the same regardless of market conditions. Others offer variable (floating) spreads that tighten when liquidity is high and widen when it's low.\n\nVariable spreads are usually tighter during peak hours (London/New York overlap) and wider during quiet hours or around major news releases. Some ECN/raw-spread accounts offer near-zero spreads but charge a separate commission per trade."
      },
      {
        heading: "How Spreads Affect Your Trading",
        content: "Worked example: You trade EUR/USD 10 times per day with a 1.5-pip spread on mini lots ($1/pip). That's 10 × 1.5 × $1 = $15 per day in spread costs. Over 20 trading days, that's $300/month — before you've made a single pip of profit.\n\nThis is why scalpers (who aim for tiny profits on many trades) need the tightest possible spreads, while swing traders (holding for days) care less because the spread is small relative to their target.\n\nTip: Always check the typical spread for your pair before choosing a broker. A broker with a 3-pip EUR/USD spread is twice as expensive as one with 1.5 pips."
      }
    ],
    keyTakeaways: [
      "The bid is what you get when selling; the ask is what you pay when buying.",
      "The spread (ask minus bid) is your cost per trade — you start every trade slightly negative.",
      "Spreads widen during low liquidity and around major news events.",
      "High-frequency traders need tight spreads; swing traders can tolerate wider ones."
    ],
    quiz: [
      {
        q: "EUR/USD shows Bid 1.0920 / Ask 1.0923. What is the spread?",
        options: [
          "1 pip",
          "2 pips",
          "3 pips",
          "0.3 pips"
        ],
        correct: 2,
        explanation: "The spread = Ask - Bid = 1.0923 - 1.0920 = 0.0003 = 3 pips."
      },
      {
        q: "When you open a buy trade, why are you immediately in a small loss?",
        options: [
          "Because the broker charges an upfront fee",
          "Because you enter at the ask but the position is valued at the lower bid price",
          "Because the market always dips right after you buy",
          "Because of currency conversion fees"
        ],
        correct: 1,
        explanation: "You buy at the ask (higher price) but your position is immediately marked against the bid (lower price). The difference — the spread — is your cost, so you start slightly negative."
      },
      {
        q: "When are forex spreads typically the tightest?",
        options: [
          "During the weekend",
          "Right before a central bank announcement",
          "During the London–New York session overlap",
          "At market open on Sunday evening"
        ],
        correct: 2,
        explanation: "The London–New York overlap (roughly 13:00–17:00 UTC) has the highest liquidity because two major sessions are active simultaneously, which compresses spreads to their tightest."
      }
    ],
    brokerContext: ["spreads", "broker-choice"],
    seoKeywords: ["forex spread explained", "bid ask spread", "forex trading costs"],
  },

  {
    module: "foundations",
    slug: "trading-sessions",
    title: "The Four Trading Sessions",
    subtitle: "The market runs 24 hours — but not all hours are equal.",
    pansyIntro: "Forex never sleeps on weekdays, but it does have moods. Some hours are fast and volatile, others are quiet and range-bound. Knowing which session you're in changes everything about how you trade.",
    difficulty: "Beginner",
    readingMinutes: 5,
    sections: [
      {
        heading: "The Four Sessions",
        content: "The forex market follows the sun through four major sessions (all times approximate UTC):\n\nSydney: 22:00 – 07:00 UTC. The quietest session. AUD and NZD pairs are most active.\n\nTokyo: 00:00 – 09:00 UTC. JPY pairs come alive. Moderate volatility with clean trends.\n\nLondon: 08:00 – 17:00 UTC. The biggest session — about 35% of all daily forex volume. EUR, GBP, and CHF pairs are most active. This is when the sharpest moves often happen.\n\nNew York: 13:00 – 22:00 UTC. USD pairs dominate. Major US economic data is released during this session."
      },
      {
        heading: "Session Overlaps",
        content: "The magic hours are the overlaps:\n\nTokyo–London overlap (08:00–09:00 UTC): A brief window where Asian and European traders are both active. Can produce sharp moves in EUR/JPY and GBP/JPY.\n\nLondon–New York overlap (13:00–17:00 UTC): The highest-volume period of the entire day. EUR/USD, GBP/USD, and USD/CAD see their tightest spreads and biggest moves here. This is when most professional traders are active.\n\nIf you can only trade during one window, the London–New York overlap gives you the best liquidity and the best opportunities."
      },
      {
        heading: "How Sessions Affect Your Strategy",
        content: "Different sessions suit different strategies:\n\nRange trading often works during Sydney and early Tokyo — prices tend to bounce between support and resistance when volume is low.\n\nBreakout trading thrives during London open — the flood of European liquidity often breaks the ranges that formed overnight.\n\nTrend following does well during London and the London–New York overlap when volume sustains directional moves.\n\nWorked example: EUR/USD has been stuck between 1.0830 and 1.0860 during the Tokyo session. At 08:00 UTC, London opens and heavy volume pushes the pair through 1.0860 to 1.0895. That's a classic London breakout — and understanding sessions helped you anticipate it."
      },
      {
        heading: "Watch Out For",
        content: "Spreads widen during the gap between New York close and Sydney open (around 22:00 UTC Friday to 22:00 Sunday). Avoid trading during this thin-liquidity window.\n\nMajor news releases (like US Non-Farm Payrolls at 13:30 UTC on the first Friday of each month) cause extreme volatility regardless of which session is active. Check an economic calendar daily."
      }
    ],
    keyTakeaways: [
      "Four sessions: Sydney, Tokyo, London, New York — each has different characteristics.",
      "The London–New York overlap (13:00–17:00 UTC) has the most volume and tightest spreads.",
      "Match your strategy to the session: ranges in quiet hours, breakouts at London open.",
      "Avoid the thin-liquidity gap around the weekly open and close."
    ],
    quiz: [
      {
        q: "Which trading session accounts for the largest share of daily forex volume?",
        options: [
          "Sydney",
          "Tokyo",
          "London",
          "New York"
        ],
        correct: 2,
        explanation: "The London session accounts for roughly 35% of all daily forex volume, making it the largest and most active session."
      },
      {
        q: "When is the London–New York overlap (approximately, in UTC)?",
        options: [
          "00:00 – 04:00",
          "08:00 – 12:00",
          "13:00 – 17:00",
          "20:00 – 24:00"
        ],
        correct: 2,
        explanation: "The London–New York overlap runs approximately from 13:00 to 17:00 UTC, when both sessions are active simultaneously. This is the highest-volume window of the day."
      },
      {
        q: "Why might a range-trading strategy work well during the Sydney session?",
        options: [
          "Because the AUD is the strongest currency",
          "Because volume is high and trends are strong",
          "Because low volume means prices tend to bounce between support and resistance",
          "Because spreads are at their tightest"
        ],
        correct: 2,
        explanation: "The Sydney session has lower volume and liquidity compared to London or New York. Without heavy volume to push prices directionally, pairs often trade in ranges — bouncing between established support and resistance levels."
      }
    ],
    brokerContext: ["forex-basics", "sessions"],
    seoKeywords: ["forex trading sessions", "best time to trade forex", "london new york overlap"],
  },
];
