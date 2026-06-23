export interface Lesson {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  body: string;
  takeaway: string;
}

export const LESSONS: Lesson[] = [
  {
    slug: "what-is-stock",
    title: "What is a Stock?",
    subtitle: "Understanding company ownership and how stocks work",
    category: "Stocks",
    readTime: 3,
    difficulty: "Beginner",
    body: `When you buy a stock you're literally buying a tiny piece of a real company. Like if you buy one share of Apple stock you own a little slice of Apple.

Not enough to boss Tim Cook around or anything — but you're officially a part owner. When the company does well and makes money their stock price usually goes up. When they have a rough quarter the price might drop.

Here's the interesting part: some companies share their profits with you through dividends (we'll talk about those in another lesson). And if the company grows over time your tiny slice becomes more valuable.

That's how people build wealth through the stock market. You're not just speculating — you're owning real businesses that make real products and real money.

The key is thinking long term. Day to day the price bounces around — but over years and decades stocks have historically gone up. That's why we invest instead of just keeping cash in a savings account.

When you own stock in a company you have a genuine stake in how it performs. You benefit when the business executes well, when revenue grows, when they launch a successful product. The company's success becomes your success in a very direct way.

Most investors hold stocks through a brokerage account — a platform where you can buy and sell shares. You don't need a lot of money to start. Many platforms now offer fractional shares, which means you can buy a fraction of one share with whatever amount you have available.`,
    takeaway: "A stock = tiny piece of a real company. You make money when the company grows. Think long term, not day to day.",
  },
  {
    slug: "what-is-etf",
    title: "What is an ETF?",
    subtitle: "The combo meal of investing — diversification in one purchase",
    category: "ETFs",
    readTime: 4,
    difficulty: "Beginner",
    body: `Think of an ETF like ordering a combo meal instead of picking every single item yourself. An ETF (Exchange Traded Fund) bundles together lots of different stocks into one package so you get a little bit of everything.

For example VOO holds 500 of the biggest US companies. So when you buy one share of VOO you're getting a tiny piece of Apple, Microsoft, Amazon, Google, Tesla, and 495 other companies all at once. It's diversification in a single purchase.

The point of this is risk reduction. If one company has a terrible day but the other 499 are doing fine your investment barely notices. Compare that to putting all your money in one stock — if that company tanks you feel the full impact.

ETFs also tend to have very low fees compared to actively managed mutual funds. Something like 0.03% per year for a broad market ETF is essentially as cheap as it gets. The stock market has historically returned around 10% per year, so low fees mean you keep most of that return.

ETFs trade on stock exchanges just like individual stocks — you can buy and sell them throughout the trading day at the current market price.

For most people starting their investing journey, ETFs are the single most practical tool available. You get broad exposure to markets without needing to research and pick individual companies. The work of diversification is done for you.`,
    takeaway: "ETFs = bundle of many stocks in one. Less risk than single stocks. Perfect for beginners who want diversification without the research.",
  },
  {
    slug: "what-is-mutual-fund",
    title: "What is a Mutual Fund?",
    subtitle: "Professional money management — and what it actually costs",
    category: "Mutual Funds",
    readTime: 4,
    difficulty: "Beginner",
    body: `A mutual fund is similar to an ETF in that it holds a bundle of stocks — but with one important difference: there's a professional fund manager making the investment decisions.

So instead of just tracking an index like the S&P 500, this person is actively buying and selling stocks, trying to beat the market. They're being paid to research and make calls on your behalf.

Here's the trade-off: they charge significantly more in fees. Where an ETF might cost 0.03% per year, a mutual fund might charge 1% or even 2%. That might not sound like much — but over 30 years that difference is substantial in dollar terms.

And here's what the data consistently shows: most actively managed funds don't beat the market after fees. Research finds that roughly 80-90% of active fund managers underperform a basic index fund over a 15-year period. So on average you're paying more and getting less.

That said, there are reasons someone might choose a mutual fund. Some people value having a professional manage their money, particularly when they're just getting started. And there are some actively managed funds with long track records of good performance.

The honest takeaway is: know what you're paying for. If you choose a mutual fund over an ETF, understand the fee difference and what you're getting in return. Low-cost index ETFs have a strong track record — that's why they've become so popular.`,
    takeaway: "Mutual funds = professional manager picking stocks for you. Higher fees than ETFs. Most don't beat the market after fees.",
  },
  {
    slug: "what-are-dividends",
    title: "What is a Dividend?",
    subtitle: "Getting paid just for holding stocks",
    category: "Dividends",
    readTime: 4,
    difficulty: "Beginner",
    body: `Dividends are cash payments that companies send to their shareholders — just for owning the stock. Companies share a portion of their profits with investors on a regular schedule, and that money shows up in your brokerage account.

Here's how it works: if you own 100 shares of a company that pays $1 per share in dividends, you receive $100 — typically four times a year, once per quarter. You don't need to do anything to receive it.

The dividend yield tells you how much you're getting paid relative to the stock price. If a stock costs $100 and pays $4 per year in dividends, that's a 4% yield. Compare that to a typical savings account paying under 1%, and you start to understand why income-focused investors pay attention to dividend yields.

Companies that pay consistent dividends tend to be stable, established businesses. Think of companies that have been around for decades, operate in relatively predictable industries, and generate reliable cash flow year after year. These are businesses rewarding shareholders for their patience and loyalty.

You have a choice about what to do with dividend payments. You can take them as cash — useful if you need income. Or you can reinvest them automatically to buy more shares (this is called a DRIP, or Dividend Reinvestment Plan). Reinvesting means your share count grows over time, and those additional shares generate their own dividends, which is how compounding works in practice.

Dividends are one of the clearest demonstrations that investing in stocks means owning a piece of a real business — not just watching a price on a screen.`,
    takeaway: "Dividends = cash payments just for owning stock. Usually paid quarterly. You can reinvest them to buy more shares and compound your growth.",
  },
  {
    slug: "bull-vs-bear",
    title: "Bull vs Bear Market",
    subtitle: "What these terms actually mean — and how to think during each",
    category: "Stocks",
    readTime: 3,
    difficulty: "Beginner",
    body: `You'll hear people say "we're in a bull market" or "it's a bear market right now" all the time. Here's what those terms actually mean.

Bull market: prices going up. The conventional image is a bull charging forward with its horns pointing up. When the market rises 20% or more from a recent low, that's technically a bull market. Sentiment is positive, portfolios are growing.

Bear market: prices going down. A bear swipes downward with its paws. When the market drops 20% or more from a recent high, that's a bear market. Sentiment tends to be fearful, news coverage is negative, and portfolios shrink.

Here's the part that matters most for your actual decisions: both are completely normal and temporary. The stock market has experienced roughly 26 bear markets since 1928 — and every single one has ended. The average bear market lasts about 9 months. The average bull market lasts considerably longer.

What this means practically: when you see red in your portfolio during a bear market, the right response is not to panic and sell. Selling during a downturn locks in your loss and means you'll likely miss the recovery. Historically, investors who held through bear markets came out ahead of those who tried to exit and time the re-entry.

Bear markets are often described as "stocks going on sale." The same companies that were expensive six months ago are now cheaper. That's when patient investors who stay the course — and continue their regular investing — are picking up shares at lower prices.

The hardest part of navigating market cycles is emotional, not intellectual. Understanding that volatility is normal is the foundation of thinking clearly when markets are scary.`,
    takeaway: "Bull = up 20%+ (good). Bear = down 20%+ (scary but temporary). Every bear market in history has ended. Stay the course.",
  },
  {
    slug: "market-cap",
    title: "What is Market Cap?",
    subtitle: "How to measure a company's total value",
    category: "Stocks",
    readTime: 3,
    difficulty: "Beginner",
    body: `Market cap — short for market capitalization — is simply the total market value of a company. The formula is: stock price multiplied by the total number of shares outstanding.

So if a company's stock is $100 and there are 1 million shares, the market cap is $100 million. That's how much it would theoretically cost to buy the entire company at the current market price.

Companies are typically grouped into size categories based on market cap:
- Large cap: $10 billion or more (Apple, Microsoft, Amazon)
- Mid cap: $2 billion to $10 billion (established, growing companies)
- Small cap: Under $2 billion (newer or niche companies)

Each category comes with different risk and return characteristics. Large caps are generally considered more stable — they're established businesses with diversified revenue. They tend to grow more slowly but are less volatile. Small caps can generate higher returns but they can also fall harder during downturns.

A balanced portfolio often holds a mix. The core is typically large-cap exposure (through a broad index fund), with smaller allocations to mid and small caps for growth potential.

One important distinction: market cap and stock price are not the same thing. A stock trading at $10 could be a company with a larger market cap than a stock trading at $1,000 — it depends on how many shares exist. Market cap tells you the company's actual size. Stock price alone tells you very little.

When comparing two companies in the same industry, market cap gives you a more meaningful sense of relative size than stock price does.`,
    takeaway: "Market cap = company's total value (price × shares). Large cap = more stable. Small cap = higher risk, more growth potential.",
  },
  {
    slug: "pe-ratio",
    title: "What is a P/E Ratio?",
    subtitle: "The basic test for whether a stock is expensive or cheap",
    category: "Stocks",
    readTime: 4,
    difficulty: "Intermediate",
    body: `The P/E ratio — price to earnings — tells you how much investors are paying per dollar of a company's profits. It's one of the most commonly referenced valuation metrics in investing.

The formula: Stock Price ÷ Earnings Per Share = P/E Ratio.

So if a stock costs $100 and the company earns $5 per share, the P/E is 20. You're paying $20 for every $1 of annual earnings. The lower the number, the cheaper the stock is relative to its actual profits.

The S&P 500's historical average P/E ratio is roughly 15–20. A P/E of 30 suggests investors are paying a premium, which usually means they expect the company to grow quickly. A P/E of 8 might look cheap — but it's worth asking why. Sometimes a low P/E reflects a genuine bargain; sometimes it reflects a business in trouble.

High P/E isn't automatically bad. Companies with strong growth expectations often trade at high multiples because investors are paying for future earnings, not just current ones. But it means there's less room for error — if growth disappoints, the price tends to correct.

The most useful application of P/E is comparison within an industry. Comparing the P/E of a fast-growing tech company to a utility company doesn't tell you much — they operate under completely different dynamics. But comparing two companies in the same sector with similar business models gives you a sense of which is priced more attractively.

P/E is one input, not a verdict. It's most useful when read alongside other context: growth rate, debt levels, competitive position, and how the multiple compares to the company's own history.`,
    takeaway: "P/E = stock price ÷ earnings. Low = relatively cheap. High = premium/high-growth expected. Always compare within the same industry.",
  },
  {
    slug: "index-funds",
    title: "Index Funds Explained",
    subtitle: "Why the boring strategy wins most of the time",
    category: "ETFs",
    readTime: 4,
    difficulty: "Beginner",
    body: `An index fund is a fund that tracks a market index — like the S&P 500 — instead of trying to beat it. Rather than employing a team of analysts to pick stocks, it simply buys everything in the index in proportion. Boring by design, and that's the point.

When you buy an S&P 500 index fund, you own a tiny slice of all 500 companies in the index. You're not betting on any single company — you're betting on the broad health of the largest businesses in the US economy.

Why does this approach work so well? A few reasons:

First, costs. A low-cost index ETF might charge 0.03% per year. An actively managed fund often charges 10–50 times that. Over 30 years, that fee difference compounds into a very large gap in final portfolio value.

Second, performance. Roughly 80–90% of actively managed funds underperform their benchmark index over a 15-year period. Most professionals with access to research, data, and full-time focus still lose to a passive index. That's a consistent finding across decades of data.

Third, simplicity. Index investing removes the need to research individual stocks, make buy and sell decisions, or stay on top of company news. The strategy is: buy regularly, diversify broadly, hold for a long time.

The math on consistent, long-term index investing is compelling. Small, regular contributions into a broad market fund — held for decades — have historically produced substantial wealth. The engine is compound growth: returns generating their own returns, year after year.

This doesn't mean you can never hold individual stocks. Many investors keep the majority of their portfolio in index funds and allocate a smaller portion to individual names. But for the core of a portfolio, the evidence for index funds is hard to argue with.`,
    takeaway: "Index funds track the whole market. Low fees, broad diversification, and historically outperform most active fund managers. Start here.",
  },
  {
    slug: "dollar-cost-averaging",
    title: "Dollar Cost Averaging",
    subtitle: "The strategy that removes the stress of timing",
    category: "Investing Strategy",
    readTime: 4,
    difficulty: "Beginner",
    body: `Dollar cost averaging — DCA — means investing a fixed amount of money at regular intervals, regardless of what the market is doing. $200 every month on the first. $100 every paycheck. Same amount, same schedule, every time.

The reason this works so well psychologically is that it removes the question of timing. You're not trying to figure out whether this week is a good or bad time to buy. You just buy, automatically, like clockwork.

Here's what happens mechanically: when prices are high, your fixed amount buys fewer shares. When prices are low, your fixed amount buys more shares. Over time, you end up with an average cost per share that smooths out the volatility. You automatically buy more when things are cheap.

The alternative — trying to time the market, waiting for the "right moment" — sounds rational but rarely works in practice. Markets move in ways that are difficult to predict consistently. People waiting for the perfect entry often buy near the top after missing a rally, or stay in cash too long during a downturn. DCA bypasses this entirely.

This strategy works especially well with consistent contributions to a retirement account. Every paycheck, money goes in automatically. You buy the highs, the lows, and everything between. The consistency matters more than the timing.

Over a long period, the mathematics of DCA tend to work in your favor — not because it always produces the lowest possible average cost (it doesn't), but because it keeps you investing consistently instead of sitting on the sidelines.

The discipline is in the commitment: investing when markets are scary, when the news is negative, when it feels uncomfortable. That consistency is the strategy.`,
    takeaway: "DCA = invest the same amount on a regular schedule. Takes timing out of the equation. You buy more when prices are low. Consistency is the strategy.",
  },
  {
    slug: "roth-ira",
    title: "What is a Roth IRA?",
    subtitle: "Tax-free growth — one of the best deals available for retirement",
    category: "Retirement",
    readTime: 5,
    difficulty: "Beginner",
    body: `A Roth IRA is a type of retirement account with a specific tax structure: you contribute money you've already paid income tax on, and then it grows completely tax-free. When you withdraw in retirement, you pay no additional taxes on any of the growth.

Here's why that matters. Say you contribute $6,500 per year starting at age 25. Over 40 years at a 10% average annual return, that account could grow to several million dollars. Under a Roth structure, none of that growth is taxed when you withdraw it in retirement. Compare that to a traditional account where withdrawals are taxed as ordinary income — the difference in after-tax wealth is substantial.

Key rules to know:
- Annual contribution limit is $7,000 for 2024 ($8,000 if you're 50 or older)
- You must have earned income to contribute
- Income limits apply — above certain thresholds the ability to contribute phases out
- You can withdraw your contributions (not earnings) at any time, penalty-free
- Earnings should be left in the account until retirement age for full tax benefit

The contribution limit means you can't put unlimited money in. But maxing it out every year from a young age is one of the most powerful long-term wealth-building moves available to most people.

The earlier you start a Roth IRA, the more years of tax-free compounding you have. A dollar contributed at 25 has 40+ years to grow without being taxed. A dollar contributed at 45 has 20. That time difference is enormous in compound terms.

Roth IRAs are separate from any workplace 401k. Many people run both — contributing enough to their 401k to get any employer match, then maxing their Roth IRA before adding more to the 401k. The exact order depends on your income, tax situation, and goals.`,
    takeaway: "Roth IRA = tax-free growth forever. Contribute early to maximize compounding. One of the best retirement accounts available.",
  },
  {
    slug: "drip-investing",
    title: "DRIP Investing",
    subtitle: "Automatically reinvesting dividends for compound growth",
    category: "Dividends",
    readTime: 4,
    difficulty: "Beginner",
    body: `DRIP stands for Dividend Reinvestment Plan. Instead of receiving dividend payments as cash, you automatically use them to buy more shares of the same stock or fund.

Here's how the compounding works in practice: you own 100 shares of a stock paying $1 per share quarterly. Instead of receiving $100, those dividends buy 2 more shares at $50 each. Next quarter, you have 102 shares generating dividends. Those dividends buy more shares. And so on, indefinitely.

This is compound growth working in the background — your dividends generate their own dividends, which generate more dividends. Over decades, the accumulation from reinvestment can be significant compared to just holding a static share count and taking dividends as cash.

Most brokerage platforms offer automatic DRIP enrollment. You turn it on once, and every subsequent dividend payment is quietly reinvested. Your share count grows every quarter without any additional contribution from you.

When you're in the accumulation phase of your investing life — building wealth rather than drawing it down — DRIP is generally the better choice. You don't need the income yet, so putting it to work compounding makes sense.

When you move into the income phase — drawing down savings in retirement, or relying on investment income — you can simply turn DRIP off and let the cash flow directly to you.

The mechanism is simple; the math behind it over 20 or 30 years is powerful. DRIP is one of those strategies that rewards patience more than activity.`,
    takeaway: "DRIP = automatically reinvest dividends to buy more shares. Compound growth on autopilot. Turn it on while accumulating, off when you need income.",
  },
  {
    slug: "active-vs-passive",
    title: "Active vs Passive Investing",
    subtitle: "Two philosophies, one clear body of evidence",
    category: "Investing Strategy",
    readTime: 5,
    difficulty: "Intermediate",
    body: `Active investing means trying to beat the market by selecting individual stocks or securities based on research, analysis, and judgment. Passive investing means buying a fund that tracks a market index and holding it long term, making no attempt to outperform.

These aren't just different strategies — they represent different beliefs about markets.

Active investors believe markets are inefficient enough that skilled analysis can identify mispriced opportunities. They think careful research or better judgment can consistently produce above-market returns.

Passive investors believe markets are broadly efficient — that prices already reflect available information — making it very difficult to beat the market consistently, especially after fees.

What does the evidence show? Over 15-year periods, roughly 80–90% of actively managed funds underperform their benchmark index. This holds across most asset classes and most market conditions. It's one of the most replicated findings in financial research.

Why does active management struggle so much? Competition is a big part of it. The market price at any moment is set by millions of sophisticated participants. Finding an edge consistently is genuinely difficult. Add in the higher fees of active management, and the performance hurdle becomes even steeper.

This doesn't mean no active investor ever beats the market — some do, consistently. But identifying them in advance is very hard, and their outperformance is often difficult to separate from luck without a long track record.

A practical approach many investors use: build the core of a portfolio with low-cost index funds, which gives you broad market exposure at minimal cost. Use a smaller allocation for individual stocks if you enjoy the research and selection process. This captures the efficiency of passive investing while allowing engagement with individual companies if that's interesting to you.

The key is being honest about what you're doing and why, and understanding the evidence behind each approach.`,
    takeaway: "Active = pick stocks (exciting, usually loses to the market). Passive = index funds (boring, usually wins). Most investors benefit from a largely passive core.",
  },
];

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getAdjacentLessons(slug: string): { prev: Lesson | null; next: Lesson | null } {
  const idx = LESSONS.findIndex((l) => l.slug === slug);
  return {
    prev: idx > 0 ? LESSONS[idx - 1] : null,
    next: idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null,
  };
}
