import type { ForexLesson } from "./types";

export const M2_BROKER_PLATFORM: ForexLesson[] = [
  {
    module: "broker-platform",
    slug: "leverage-and-margin",
    title: "Leverage and Margin",
    subtitle: "The double-edged sword — how brokers let you control large positions with small deposits.",
    pansyIntro: "Leverage is the most powerful — and most dangerous — tool in forex. It can multiply your gains, but it can also multiply your losses just as fast. Let me explain exactly how it works so you can use it wisely.",
    difficulty: "Beginner",
    readingMinutes: 6,
    sections: [
      {
        heading: "What Is Leverage?",
        content: "Leverage lets you control a position larger than your account balance. If your broker offers 50:1 leverage, you can control $50,000 worth of currency with just $1,000 of your own money.\n\nThink of it like a mortgage: you put down a fraction of the total value and the broker lends you the rest. But unlike a mortgage, this loan is instant, and the broker can take it back the moment your losses threaten their money."
      },
      {
        heading: "What Is Margin?",
        content: "Margin is the deposit you need to open a leveraged position. It's not a fee — it's collateral.\n\nWith 50:1 leverage, the margin requirement is 2% (1/50). To control a $50,000 position (one mini lot of EUR/USD at roughly 1.0850), you need $1,000 in margin. The rest is borrowed from the broker.\n\nKey terms:\n\nUsed margin: the amount locked up in your open positions.\nFree margin: your account equity minus used margin — the amount available to open new trades.\nMargin level: (equity / used margin) × 100. If this drops below the broker's threshold (often 50-100%), you get a margin call."
      },
      {
        heading: "The Margin Call",
        content: "A margin call happens when your losses eat into your margin to the point where the broker is at risk. When your margin level drops below the broker's minimum (say 50%), the broker will automatically close some or all of your positions to protect themselves.\n\nWorked example: You deposit $2,000 and open a 1 standard lot position on EUR/USD at 50:1 leverage. That requires $2,000 in margin — your entire account. If EUR/USD drops just 20 pips against you, that's a $200 loss. Your equity drops to $1,800, your margin level falls to 90%. A further drop could trigger liquidation.\n\nThis is why using your maximum available leverage is extremely risky."
      },
      {
        heading: "How Much Leverage Should You Use?",
        content: "Just because a broker offers 500:1 leverage doesn't mean you should use it. Professional traders rarely use more than 10:1 effective leverage.\n\nEffective leverage = total position value / account equity. If you have $5,000 and open a $50,000 position, your effective leverage is 10:1. If you open a $10,000 position (1 mini lot), your effective leverage is 2:1 — much safer.\n\nA common beginner guideline: risk no more than 1-2% of your account on any single trade. At 2:1 effective leverage, a 50-pip stop loss on EUR/USD with a mini lot risks $50 — that's 1% of a $5,000 account.\n\nRegulatory limits vary by region. The EU caps retail leverage at 30:1 for major pairs. The US caps it at 50:1. Australia recently capped at 30:1. These limits exist because regulators saw too many retail accounts blown up by excessive leverage."
      }
    ],
    keyTakeaways: [
      "Leverage lets you control more currency than your deposit — but losses are amplified equally.",
      "Margin is collateral, not a fee — a margin call forces liquidation of your positions.",
      "Effective leverage of 2:1 to 10:1 is safer than maxing out available leverage.",
      "Risk no more than 1-2% of your account per trade."
    ],
    quiz: [
      {
        q: "You have $2,000 in your account and open a $20,000 position. What is your effective leverage?",
        options: [
          "2:1",
          "5:1",
          "10:1",
          "20:1"
        ],
        correct: 2,
        explanation: "Effective leverage = position value / account equity = $20,000 / $2,000 = 10:1."
      },
      {
        q: "What triggers a margin call?",
        options: [
          "Opening too many trades in one day",
          "Your margin level dropping below the broker's minimum threshold",
          "Holding a trade overnight",
          "Depositing too little money initially"
        ],
        correct: 1,
        explanation: "A margin call is triggered when your margin level (equity / used margin × 100) falls below the broker's minimum threshold, typically 50-100%. The broker then liquidates positions to prevent further losses."
      },
      {
        q: "Why do many professional traders use effective leverage below 10:1?",
        options: [
          "Because higher leverage is illegal in most countries",
          "Because it leaves room to absorb normal market swings without getting stopped out or margin called",
          "Because brokers charge higher fees for higher leverage",
          "Because high leverage trades take longer to execute"
        ],
        correct: 1,
        explanation: "Lower effective leverage means your account can absorb larger adverse moves before reaching margin call territory. This gives trades room to breathe through normal volatility."
      }
    ],
    brokerContext: ["leverage", "margin", "broker-choice"],
    seoKeywords: ["forex leverage explained", "what is margin in forex", "margin call explained"],
  },

  {
    module: "broker-platform",
    slug: "choosing-a-broker",
    title: "Choosing a Regulated Broker",
    subtitle: "Your broker holds your money — here's how to pick one you can trust.",
    pansyIntro: "Choosing a broker is one of the most important decisions you'll make. The wrong broker can mean wider spreads, slow execution, or — in the worst case — losing your entire deposit. Let me show you what to look for.",
    difficulty: "Beginner",
    readingMinutes: 6,
    sections: [
      {
        heading: "Why Regulation Matters",
        content: "A regulated broker is supervised by a financial authority that enforces rules about how they handle your money, execute your trades, and resolve disputes. An unregulated broker answers to nobody.\n\nTop-tier regulators include:\n\nFCA (UK Financial Conduct Authority) — strict segregation of client funds, negative balance protection.\nASIC (Australian Securities and Investments Commission) — strong oversight, recently tightened leverage limits.\nCySEC (Cyprus Securities and Exchange Commission) — EU-wide passporting, investor compensation fund.\nCFTC/NFA (US) — among the strictest rules globally, limits leverage to 50:1.\n\nAlways verify a broker's license on the regulator's website — not on the broker's website. Scam brokers routinely display fake license numbers."
      },
      {
        heading: "Key Factors to Compare",
        content: "Spreads and commissions: Compare the typical spread on your main pairs. Some brokers offer raw-spread accounts with low spreads but a per-trade commission. Others wrap the cost into a wider spread. Calculate which is cheaper for your trading style.\n\nExecution speed: Faster execution means less slippage (the difference between your intended price and your actual fill). ECN/STP brokers route your orders to liquidity providers for better fills.\n\nDeposit and withdrawal: How fast can you get your money in and out? What methods are available (bank transfer, card, e-wallets)? Are there fees?\n\nPlatform: Most forex brokers offer MetaTrader 4 (MT4) or MetaTrader 5 (MT5). Some also offer cTrader or proprietary platforms. Try the demo before committing.\n\nCustomer support: Can you reach a human when something goes wrong? Test their support before depositing real money."
      },
      {
        heading: "Red Flags to Avoid",
        content: "Run from any broker that:\n\nPromises guaranteed returns — no legitimate broker can guarantee profits.\nPressures you to deposit more — especially with \"limited time\" bonus offers.\nMakes withdrawals difficult — read reviews about withdrawal experiences.\nHas no verifiable regulation — or claims regulation from an obscure jurisdiction.\nOffers 1000:1 leverage with no warnings — extreme leverage is marketed at beginners for a reason (the broker profits when you lose).\nContacts you unsolicited — legitimate brokers don't cold-call."
      },
      {
        heading: "Demo Accounts",
        content: "Every reputable broker offers a free demo account with virtual money. Use it to:\n\nLearn the platform without risking real money.\nTest your strategies in real market conditions.\nEvaluate the broker's spreads, execution, and reliability.\n\nSpend at least 2-4 weeks on a demo before considering live trading. The market will still be there when you're ready."
      }
    ],
    keyTakeaways: [
      "Only use brokers regulated by top-tier authorities (FCA, ASIC, CySEC, CFTC/NFA).",
      "Verify the license directly on the regulator's website, not the broker's.",
      "Compare spreads, execution speed, withdrawal speed, and platform quality.",
      "Practice on a demo account for at least 2-4 weeks before going live."
    ],
    quiz: [
      {
        q: "How should you verify a broker's regulatory license?",
        options: [
          "Check the broker's website for a license badge",
          "Look up the license number directly on the regulator's official website",
          "Ask the broker's customer support",
          "Check online review sites"
        ],
        correct: 1,
        explanation: "Always verify a broker's license on the regulator's official website. Scam brokers display fake or expired license numbers on their own sites. Going directly to the regulator is the only way to confirm."
      },
      {
        q: "Which of these is a red flag when evaluating a broker?",
        options: [
          "Offering a free demo account",
          "Providing multiple platform options (MT4, MT5, cTrader)",
          "Guaranteeing returns or pressuring you to deposit more",
          "Having FCA or ASIC regulation"
        ],
        correct: 2,
        explanation: "No legitimate broker can guarantee trading profits. Promising guaranteed returns or pressuring deposits with urgency tactics are classic signs of a scam or predatory broker."
      },
      {
        q: "Why is a demo account valuable even for someone who understands forex concepts?",
        options: [
          "It lets you earn real money without risk",
          "It lets you test strategies, learn the platform, and evaluate the broker in real market conditions",
          "It counts toward your trading track record",
          "It automatically transitions to a live account"
        ],
        correct: 1,
        explanation: "A demo account uses virtual money in real market conditions, letting you practice strategies, get comfortable with the platform, and evaluate the broker's spreads and execution — all without financial risk."
      }
    ],
    brokerContext: ["broker-choice", "regulation"],
    seoKeywords: ["how to choose a forex broker", "regulated forex brokers", "forex broker red flags"],
  },

  {
    module: "broker-platform",
    slug: "account-types",
    title: "Account Types and How They Differ",
    subtitle: "Standard, ECN, micro — what each account type means for your trading costs and experience.",
    pansyIntro: "Brokers offer different account types with different pricing structures. Picking the right one can save you real money. Let me walk you through the options.",
    difficulty: "Beginner",
    readingMinutes: 5,
    sections: [
      {
        heading: "Standard Accounts",
        content: "The most common account type. The broker wraps their profit into the spread — what you see is what you pay. No separate commission.\n\nTypical EUR/USD spread: 1.0–2.0 pips.\n\nBest for: beginners and casual traders who want simple, all-inclusive pricing. You always know your cost per trade just by looking at the spread."
      },
      {
        heading: "ECN / Raw Spread Accounts",
        content: "ECN (Electronic Communication Network) accounts give you direct access to interbank pricing. Spreads can be as low as 0.0 pips on major pairs, but you pay a separate commission per trade (typically $3–$7 per standard lot, per side).\n\nTypical EUR/USD spread: 0.0–0.5 pips plus commission.\n\nBest for: active traders and scalpers who need the tightest possible spreads. The total cost (spread + commission) is often lower than a standard account, especially on high-volume pairs.\n\nNote: some brokers label accounts as ECN when they're not truly routing to an ECN. Look for evidence of variable spreads and direct liquidity provider access."
      },
      {
        heading: "Micro and Cent Accounts",
        content: "Micro accounts let you trade micro lots (1,000 units) or even smaller. Cent accounts display your balance in cents — a $10 deposit shows as 1,000 cents — giving you room to practice position sizing with minimal risk.\n\nTypical minimum deposit: $1–$10.\n\nBest for: absolute beginners who want real-money experience with minimal risk. The emotional difference between demo and live trading matters, and risking $0.10 per pip beats risking $1 while you're still learning."
      },
      {
        heading: "Islamic (Swap-Free) Accounts",
        content: "In forex, holding a position overnight incurs a swap (or rollover) — an interest charge or credit based on the rate differential between the two currencies. Islamic accounts eliminate swaps to comply with Sharia law's prohibition on interest (riba).\n\nInstead of swaps, some brokers charge a flat administration fee on positions held beyond a certain period. If you require a swap-free account, compare how different brokers structure their alternatives."
      },
      {
        heading: "Which Should You Choose?",
        content: "If you're starting out: a standard account with a reputable broker is the simplest choice. Focus on learning, not on optimizing costs.\n\nIf you trade frequently (several trades per day): calculate whether an ECN account's spread-plus-commission is cheaper than a standard account's wider spread.\n\nIf you're on a very tight budget: a micro or cent account lets you trade real money while learning, with minimal financial exposure.\n\nMany brokers let you open multiple account types simultaneously. You can start with a standard account and add an ECN account later as your volume grows."
      }
    ],
    keyTakeaways: [
      "Standard accounts wrap costs into the spread — simple pricing, no commission.",
      "ECN accounts offer raw spreads plus a per-trade commission — often cheaper for active traders.",
      "Micro/cent accounts let you trade with very small positions for minimal risk.",
      "Islamic accounts remove swaps for Sharia compliance — compare the alternative fee structures."
    ],
    quiz: [
      {
        q: "An ECN account shows a EUR/USD spread of 0.2 pips with a $6 commission per round trip (standard lot). A standard account shows a 1.4-pip spread with no commission. Which is cheaper for one standard-lot trade?",
        options: [
          "The standard account — no commission means lower cost",
          "They cost exactly the same",
          "The ECN account — 0.2 pips ($2) + $6 commission = $8 total vs. 1.4 pips ($14) on the standard account",
          "It depends on the time of day"
        ],
        correct: 2,
        explanation: "On a standard lot, 1 pip = $10. The ECN total cost is 0.2 pips ($2) + $6 commission = $8. The standard account cost is 1.4 pips × $10 = $14. The ECN account is cheaper by $6 per trade."
      },
      {
        q: "Why might a beginner choose a micro account over a standard account?",
        options: [
          "Micro accounts have better spreads",
          "Micro accounts let you trade with very small positions, limiting financial risk while learning",
          "Micro accounts don't require identity verification",
          "Micro accounts guarantee profits on small trades"
        ],
        correct: 1,
        explanation: "Micro accounts allow trading in very small position sizes (micro lots or smaller), so beginners can experience live trading with real emotions and consequences while risking minimal amounts."
      },
      {
        q: "What is a swap (rollover) in forex?",
        options: [
          "A fee for opening an account",
          "The difference between bid and ask",
          "An interest charge or credit for holding a position overnight, based on the rate differential between the two currencies",
          "A penalty for closing a trade early"
        ],
        correct: 2,
        explanation: "A swap is the interest differential between the two currencies in your pair, charged or credited to your account when you hold a position past the daily rollover time (usually 5 PM New York time)."
      }
    ],
    brokerContext: ["account-types", "broker-choice"],
    seoKeywords: ["forex account types", "ECN vs standard account", "micro forex account"],
  },

  {
    module: "broker-platform",
    slug: "order-types",
    title: "Order Types — Market, Limit, Stop",
    subtitle: "The instructions you give your broker — and how each one works.",
    pansyIntro: "An order is how you tell your broker what you want to buy or sell, at what price, and under what conditions. Getting this right is fundamental. Let's cover every order type you'll actually use.",
    difficulty: "Beginner",
    readingMinutes: 6,
    sections: [
      {
        heading: "Market Orders",
        content: "A market order tells your broker: \"Buy (or sell) right now, at the best available price.\" It's the simplest order type and fills almost instantly.\n\nPros: Guaranteed execution — you will get into the trade.\nCons: You might get a slightly different price than you see (slippage), especially during high volatility or news events.\n\nUse when: You want to enter or exit a trade immediately and the exact price matters less than getting filled."
      },
      {
        heading: "Limit Orders",
        content: "A limit order tells your broker: \"Buy at this price or better\" (for a buy limit) or \"Sell at this price or better\" (for a sell limit).\n\nBuy limit: placed below the current price. You expect the price to drop to your level, then bounce up.\nSell limit: placed above the current price. You expect the price to rise to your level, then drop.\n\nPros: You control your entry price. No slippage (you get your price or better).\nCons: The price might never reach your limit, and you miss the trade entirely.\n\nWorked example: EUR/USD is at 1.0850. You want to buy at 1.0800. You set a buy limit at 1.0800. If the price drops to 1.0800, your order fills. If it goes straight up without touching 1.0800, nothing happens."
      },
      {
        heading: "Stop Orders",
        content: "A stop order becomes a market order when a specified price is reached.\n\nBuy stop: placed above the current price. Used to enter on a breakout — you want to buy if the price proves it can break through a resistance level.\nSell stop: placed below the current price. Used to enter on a breakdown.\n\nPros: Lets you automate breakout entries.\nCons: Once triggered, it executes as a market order, so slippage is possible.\n\nThe most important stop order: the stop-loss. This is a sell stop (if you're long) or a buy stop (if you're short) placed at a price where you want to exit to limit your losses. Every trade should have a stop-loss."
      },
      {
        heading: "Stop-Loss and Take-Profit",
        content: "These are exit orders attached to an open position:\n\nStop-loss (SL): Closes your position at a specified loss level to prevent further damage. If you buy EUR/USD at 1.0850 with a stop-loss at 1.0820, your maximum loss is 30 pips.\n\nTake-profit (TP): Closes your position when it reaches a specified profit level. If you set TP at 1.0910, the trade automatically closes at 60 pips profit.\n\nTogether, SL and TP define your risk/reward ratio. In this example: 30-pip risk for 60-pip reward = 1:2 risk/reward. Even if you're wrong half the time, a 1:2 ratio means you come out ahead."
      },
      {
        heading: "Trailing Stop",
        content: "A trailing stop moves your stop-loss with the market as the price moves in your favor. It locks in profits while still giving the trade room to run.\n\nExample: You buy EUR/USD at 1.0850 with a 30-pip trailing stop. As the price rises to 1.0880, your stop moves from 1.0820 to 1.0850 (breakeven). At 1.0910, your stop is at 1.0880. If the price reverses and hits 1.0880, you exit with 30 pips profit instead of a loss.\n\nTrailing stops are powerful but can sometimes get triggered by normal market noise. Use them on trades where you expect a strong directional move."
      }
    ],
    keyTakeaways: [
      "Market orders fill instantly at the current price; limit orders wait for a specific price.",
      "Stop orders trigger when a price is reached — essential for stop-losses and breakout entries.",
      "Every trade should have a stop-loss to cap your maximum risk.",
      "Stop-loss + take-profit together define your risk/reward ratio."
    ],
    quiz: [
      {
        q: "EUR/USD is at 1.0850. You want to buy only if the price drops to 1.0800. Which order type should you use?",
        options: [
          "Market order",
          "Buy stop at 1.0800",
          "Buy limit at 1.0800",
          "Sell limit at 1.0800"
        ],
        correct: 2,
        explanation: "A buy limit is placed below the current price and executes when the price drops to that level. You want to buy at 1.0800 (below the current 1.0850), so a buy limit at 1.0800 is correct."
      },
      {
        q: "You buy EUR/USD at 1.0850 with a stop-loss at 1.0830 and take-profit at 1.0910. What is your risk/reward ratio?",
        options: [
          "1:1",
          "1:2",
          "1:3",
          "2:1"
        ],
        correct: 2,
        explanation: "Risk = 1.0850 - 1.0830 = 20 pips. Reward = 1.0910 - 1.0850 = 60 pips. Risk/reward = 20:60 = 1:3."
      },
      {
        q: "What happens to a trailing stop as the price moves in your favor?",
        options: [
          "It stays at the original level",
          "It widens to give the trade more room",
          "It moves with the price, locking in profits while still giving the trade room to run",
          "It converts to a take-profit order"
        ],
        correct: 2,
        explanation: "A trailing stop follows the price at a fixed distance as it moves in your favor, continuously raising (for a long position) or lowering (for a short) the stop-loss level. If the price reverses, the stop doesn't move back — it triggers at the last trailed level."
      }
    ],
    brokerContext: ["order-types", "platform"],
    seoKeywords: ["forex order types explained", "stop loss take profit", "limit vs market order forex"],
  },

  {
    module: "broker-platform",
    slug: "platform-walkthrough",
    title: "Platform Walkthrough — MetaTrader Essentials",
    subtitle: "A practical tour of the tools you'll use every day.",
    pansyIntro: "MetaTrader is the industry standard platform for forex trading. Whether it's MT4 or MT5, the core layout is similar. Let me walk you through the essentials so you feel confident when you first open it.",
    difficulty: "Beginner",
    readingMinutes: 6,
    sections: [
      {
        heading: "The Four Main Panels",
        content: "When you open MetaTrader, you'll see four key areas:\n\n1. Market Watch (left panel): A list of currency pairs with their live bid/ask prices. Right-click to add or remove pairs, or double-click a pair to open a new order.\n\n2. Chart Window (center): The price chart for your selected pair. You can open multiple charts, switch timeframes (M1, M5, M15, H1, H4, D1, W1, MN), and add indicators.\n\n3. Navigator (left, below Market Watch): Access your accounts, indicators, expert advisors (EAs), and scripts.\n\n4. Terminal (bottom): Shows your open positions, pending orders, account history, alerts, and the journal log. This is where you monitor and manage live trades."
      },
      {
        heading: "Placing Your First Trade",
        content: "To open a trade:\n\n1. Click 'New Order' in the toolbar or press F9.\n2. Select the currency pair from the Symbol dropdown.\n3. Choose your lot size (Volume). Start with 0.01 (micro lot) while learning.\n4. Set your stop-loss and take-profit levels.\n5. Click 'Buy' or 'Sell'.\n\nThe order appears in the Terminal panel under the Trade tab. You can modify or close it by right-clicking the order.\n\nTip: always set your SL and TP before clicking the buy or sell button. Don't tell yourself you'll add them later — you might forget, and one bad trade without a stop-loss can do serious damage."
      },
      {
        heading: "Reading the Chart",
        content: "Switch between three chart types using the toolbar:\n\nLine chart: connects closing prices. Clean but shows limited information.\nBar chart (OHLC): each bar shows open, high, low, and close. More detail.\nCandlestick chart: the most popular. Each candle shows the same OHLC data but is easier to read visually. Green/white = bullish (close above open). Red/black = bearish (close below open).\n\nTimeframes matter: a 5-minute chart shows 5 minutes per candle (good for short-term moves). A daily chart shows one candle per day (good for trends). Most beginners should focus on H1 (1-hour) and H4 (4-hour) charts to avoid the noise of lower timeframes."
      },
      {
        heading: "Essential Indicators to Start With",
        content: "MetaTrader comes with dozens of built-in indicators. You don't need all of them. Start with these three:\n\nMoving Averages (MA): Shows the average price over a period. The 50-period and 200-period MAs are widely watched. When the 50 crosses above the 200, it's called a 'golden cross' (bullish signal). When it crosses below, it's a 'death cross' (bearish).\n\nRelative Strength Index (RSI): Measures momentum on a 0-100 scale. Above 70 = potentially overbought. Below 30 = potentially oversold. It's a hint, not a guarantee.\n\nBollinger Bands: Shows volatility. When the bands squeeze tight, a big move is coming. When price touches the upper or lower band, it might reverse.\n\nAdd them via Insert > Indicators. Don't pile on 10 indicators at once — they'll contradict each other and paralyze your decision-making."
      },
      {
        heading: "Managing Open Trades",
        content: "Once a trade is open, you can:\n\nModify SL/TP: Right-click the order in the Terminal > Modify. Drag the SL/TP lines on the chart if 'One Click Trading' is enabled.\n\nPartially close: Right-click > Close Order, and change the volume to a fraction of your position. This lets you lock in some profit while letting the rest run.\n\nClose entirely: Right-click > Close Order, or click the X button next to the position in the Terminal panel.\n\nCheck your margin: The Terminal's Trade tab shows your balance, equity, margin, free margin, and margin level in real time. Keep an eye on margin level if you have multiple positions open."
      }
    ],
    keyTakeaways: [
      "MetaTrader has four key panels: Market Watch, Chart, Navigator, and Terminal.",
      "Always set stop-loss and take-profit before executing a trade.",
      "Start with H1/H4 timeframes and candlestick charts — avoid the noise of lower timeframes.",
      "Begin with 2-3 indicators (MA, RSI, Bollinger Bands) — more causes confusion, not clarity."
    ],
    quiz: [
      {
        q: "Where do you monitor your open positions and account equity in MetaTrader?",
        options: [
          "The Market Watch panel",
          "The Navigator panel",
          "The Terminal panel (Trade tab)",
          "The Chart Window"
        ],
        correct: 2,
        explanation: "The Terminal panel at the bottom of MetaTrader shows your open positions, pending orders, account balance, equity, margin, and free margin under the Trade tab."
      },
      {
        q: "Which timeframes are generally recommended for beginners to focus on?",
        options: [
          "M1 and M5 (1-minute and 5-minute)",
          "H1 and H4 (1-hour and 4-hour)",
          "W1 and MN (weekly and monthly)",
          "M15 only (15-minute)"
        ],
        correct: 1,
        explanation: "H1 (1-hour) and H4 (4-hour) charts filter out the noisy, choppy movements of lower timeframes while still showing actionable price structure and trends. Very short timeframes amplify noise and often lead to overtrading."
      },
      {
        q: "What does a green (or white) candlestick indicate?",
        options: [
          "The price moved down during that period",
          "The price closed higher than it opened during that period (bullish)",
          "The trade was profitable",
          "High trading volume during that period"
        ],
        correct: 1,
        explanation: "A green or white candlestick is bullish — the closing price was higher than the opening price for that time period. A red or black candle is bearish — close was lower than open."
      }
    ],
    brokerContext: ["platform", "metatrader"],
    seoKeywords: ["metatrader tutorial beginners", "how to use MT4 MT5", "forex platform walkthrough"],
  },
];
