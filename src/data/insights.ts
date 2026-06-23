export interface Insight {
  slug: "sector-spotlights" | "earnings-season" | "macro-context" | "investor-psychology";
  title: string;
  subtitle: string;
  icon: string;
  body: string; // double-newline separated paragraphs
  takeaway: string;
}

export const INSIGHTS: Insight[] = [
  {
    slug: "sector-spotlights",
    title: "Sector Spotlights",
    subtitle: "What each sector does and why it moves the way it does.",
    icon: "📈",
    body: `The stock market is not one thing — it is eleven distinct sectors, each representing a different slice of the economy. Technology companies, healthcare providers, energy producers, consumer brands, banks, utilities, real estate trusts: they all behave differently, for different reasons, at different points in the economic cycle. Learning to read sectors is one of the most practical skills in investing.

Think of it this way: when interest rates rise, utility stocks often fall — because utilities carry a lot of debt, and higher rates make that debt more expensive to service. At the same time, bank stocks can benefit, because banks earn more on the loans they make. The same event, opposite reactions. That is sector behavior in action.

The S&P 500 uses the Global Industry Classification Standard (GICS) to divide the market into 11 sectors: Information Technology, Health Care, Financials, Consumer Discretionary, Consumer Staples, Industrials, Energy, Utilities, Real Estate, Materials, and Communication Services. Each sector has an ETF that tracks it — for example, XLK tracks Technology, XLF tracks Financials, XLE tracks Energy. These are useful tools for watching how a sector is performing relative to the broader market.

Cyclical sectors — like Consumer Discretionary, Industrials, and Materials — tend to do well when the economy is expanding and consumers are spending freely. Defensive sectors — like Consumer Staples, Health Care, and Utilities — tend to hold their value better during recessions, because people still buy groceries, fill prescriptions, and pay electricity bills regardless of the economic climate. Understanding this cycle is not about timing the market; it is about understanding why your portfolio moves the way it does.

Sector rotation is the term investors use to describe money moving from one sector to another as economic conditions shift. When you see technology stocks leading a rally, it often signals that investors expect growth. When you see utilities and consumer staples outperforming, it can signal caution or defensiveness in the market. Reading these movements builds your intuition over time — not as a signal to trade, but as a way to understand the story the market is telling.`,
    takeaway: "The market's eleven sectors each respond differently to the same economic events. Understanding why helps you read what the market is doing — not predict it.",
  },
  {
    slug: "earnings-season",
    title: "Earnings Season",
    subtitle: "How to understand earnings reports without drowning in numbers.",
    icon: "🔍",
    body: `Four times a year, every publicly traded company in the United States reports its financial results to shareholders and the public. This reporting window — known as earnings season — typically runs for several weeks following the end of each calendar quarter (March, June, September, December). During this period, stock prices can move significantly in a short time, and understanding why requires knowing what the market is actually looking at.

An earnings report contains a great deal of information: revenue (the total money a company brought in), earnings per share or EPS (the profit divided across all shares), operating margins, guidance for the next quarter, and commentary from management about what they are seeing in their business. Of these, two numbers tend to move markets most: revenue and EPS — and specifically, how those numbers compare to what analysts were expecting.

This is the concept of "beating" or "missing" expectations. If a company earns $1.20 per share and analysts had expected $1.00, the stock often rises — even if $1.20 is lower than last year's number. Markets are forward-looking and consensus-driven. A company can have growing profits and fall in price on earnings day if growth was slower than anticipated. That feels counterintuitive until you understand that prices already reflect expectations; the report is the market getting new information.

Guidance matters as much as the results. When a company lowers its forecast for the next quarter — called "guiding down" — it is telling investors that business conditions are softer than expected. When it raises guidance, it is signaling confidence. Pay attention to what management says on the earnings call about demand, costs, and the competitive landscape. These qualitative comments often move the stock more than the headline numbers.

You do not need to read every earnings report to be a thoughtful investor. But understanding the structure — revenue, EPS, expectations, guidance — means you can follow the financial news with clarity rather than confusion. Over time, patterns become visible: which companies consistently beat, which consistently disappoint, which industries are expanding and which are contracting.`,
    takeaway: "Markets move on whether results beat or miss expectations — not on whether results are good or bad in absolute terms. The comparison to what was expected is everything.",
  },
  {
    slug: "macro-context",
    title: "Macro Context",
    subtitle: "Interest rates, inflation, and what they mean for your portfolio.",
    icon: "🌍",
    body: `Behind every market move is a macroeconomic backdrop — the big-picture conditions that shape how businesses operate, how consumers behave, and how investors allocate money. Three forces dominate this backdrop more than any others: interest rates, inflation, and economic growth. Learning to read these is not about predicting markets; it is about understanding what environment you are investing in.

Interest rates are set by the Federal Reserve (the "Fed"), which adjusts its benchmark rate to influence borrowing costs across the entire economy. When the Fed raises rates, it becomes more expensive for companies to borrow money to expand, and for consumers to take on mortgages, car loans, and credit card debt. This typically slows economic activity — which is exactly the point when the Fed is fighting inflation. When the Fed cuts rates, it loosens those conditions, making borrowing cheaper and stimulating growth. Stock markets tend to respond positively to rate cuts and negatively to aggressive rate hikes, though the relationship is more nuanced than a simple rule.

Inflation is the rate at which prices rise over time. Moderate inflation (around 2%) is considered healthy — it signals a functioning economy. High inflation erodes purchasing power and forces the Fed to act by raising rates. The Consumer Price Index (CPI) and the Personal Consumption Expenditures index (PCE) are the two main reports investors watch. When inflation runs hot, the market knows the Fed will likely keep rates higher for longer, which adds pressure to stock valuations, especially for growth companies whose value is tied to future earnings.

Bonds play a critical role in this picture. The yield on the 10-year U.S. Treasury note is often called "the most important number in finance." When yields rise, the present value of future corporate earnings falls — which is why technology and growth stocks are often more sensitive to rate changes than value stocks paying consistent dividends. A rising 10-year yield can act as a headwind for equities even when the economy looks healthy.

Gross Domestic Product (GDP) — the total value of all goods and services produced in an economy — tells you whether the economy is expanding or contracting. Two consecutive quarters of negative GDP growth is the technical definition of a recession. Watching GDP alongside inflation and rates gives you the three-part framework that professional investors use to orient themselves: Is growth accelerating or slowing? Is inflation rising or falling? What is the Fed likely to do next?`,
    takeaway: "Rates, inflation, and growth interact constantly. You do not need to predict them — you need to understand how they affect the assets you already own.",
  },
  {
    slug: "investor-psychology",
    title: "Investor Psychology",
    subtitle: "Why markets behave the way they do — and how to keep a clear head.",
    icon: "🧠",
    body: `Markets are made of people, and people are not perfectly rational. Two centuries of financial history and decades of behavioral research have made one thing clear: emotion is among the greatest drivers of short-term market price movements. Understanding the psychological forces at work — in the market and in yourself — is one of the most underrated edges an investor can develop.

Fear and greed are the two dominant market emotions, and they run in cycles. During bull markets, optimism compounds: prices rise, confidence grows, and investors who were cautious become comfortable. The news turns positive, friends talk about their returns, and the instinct is to put more money in just as valuations are stretching. During bear markets, the pattern reverses: prices fall, confidence collapses, and investors who were engaged begin to reconsider whether they should be in markets at all. The instinct is to sell — just as prices are reaching their most attractive levels relative to value.

This is why Warren Buffett's most-quoted line remains useful: "Be fearful when others are greedy, and greedy when others are fearful." It is easy to understand and genuinely difficult to execute, because acting against the emotional crowd requires conviction that most people find hard to sustain when the news is worst.

Several cognitive biases reliably affect investment decisions. Loss aversion — the psychological reality that losses feel roughly twice as painful as equivalent gains feel good — causes investors to hold losing positions too long (hoping to "get back to even") and sell winning positions too soon (locking in gains feels safe). Recency bias leads investors to expect that recent market conditions will continue, which is why people pile into assets that have already risen sharply and avoid those that have recently fallen. Confirmation bias causes us to seek information that supports what we already believe and dismiss contradictory evidence.

The antidote to most of these biases is process: having a clear investment plan before market conditions become emotional. Knowing in advance that you will keep contributing to your index funds through downturns — not because you know when the bottom will come, but because you understand that downturns are a normal part of long-run growth — removes the need for real-time decision-making under stress. Process replaces panic.`,
    takeaway: "Market behavior is driven by human psychology as much as by fundamentals. The investor who understands their own emotional patterns has a genuine, lasting edge.",
  },
];

export function getInsightBySlug(slug: string): Insight | undefined {
  return INSIGHTS.find(i => i.slug === slug);
}

export function getAdjacentInsights(slug: string): { prev: Insight | null; next: Insight | null } {
  const idx = INSIGHTS.findIndex(i => i.slug === slug);
  return {
    prev: idx > 0 ? INSIGHTS[idx - 1] : null,
    next: idx < INSIGHTS.length - 1 ? INSIGHTS[idx + 1] : null,
  };
}
