/** Places to start studying once her savings reach a milestone. The same for every member and every milestone. */
export interface Idea {
  title: string;
  explainer: string;
  lessonSlug: string;
  examples: string[];
}

export const STUDY_LABEL = "To study, not to buy";

export const IDEAS_LEAD =
  "Lovely work. Many people build an emergency fund of about 3 to 6 months of essentials before they invest. When you're ready to learn, here are some places to start studying.";

export const IDEAS_FOOTER = "Bloom is education only and isn't investment advice. Investing involves risk, and you can lose money.";

export const IDEAS: Idea[] = [
  {
    title: "Broad index ETFs",
    explainer:
      "An index ETF holds many companies at once, such as the 500 in the S&P 500. Studying one shows you how the whole market moves.",
    lessonSlug: "reading-a-stock-chart",
    examples: ["SPY", "DIA", "IWM"],
  },
  {
    title: "Large established companies",
    explainer:
      "These are big, well-known businesses with long histories. Their charts are a good place to practise reading trends and structure.",
    lessonSlug: "trend-and-swings",
    examples: ["AAPL", "MSFT"],
  },
  {
    title: "Dividend payers",
    explainer:
      "Some companies share part of their profit with shareholders as dividends. Their prices often move more steadily, which makes support and resistance easier to see.",
    lessonSlug: "support-and-resistance",
    examples: ["KO", "JPM"],
  },
  {
    title: "Growth and technology",
    explainer:
      "Growth and technology stocks can move quickly and on heavy volume. They are useful for studying volume and fast moves, and they carry more risk.",
    lessonSlug: "candles-and-volume",
    examples: ["QQQ", "NVDA"],
  },
];
