// Pages removed in the 2026 redesign. Each redirects permanently so existing
// links and search traffic land somewhere useful. `:path*` also matches the bare path.
const toLessons = [
  "/scanner/:path*",
  "/signals",
  "/gap-scanner",
  "/gap-and-go-scanner",
  "/free-stock-screener",
  "/backtest",
  "/stock-alerts",
  "/discover",
  "/stock/:path*",
  "/research",
  "/compare",
  "/earnings-calendar",
  "/news",
  "/market-insights/:path*",
  "/portfolio",
  "/learn",
  "/university/:path*",
  "/forex/:path*",
  "/academy/:path*",
  "/progression",
  "/daily-bloom",
  "/budget-tracker",
  "/side-hustle",
  "/goals",
  "/position-calculator",
  "/app/debug-scanner",
];

const toHome = ["/subscription/:path*", "/subscription-offer", "/ebook-premium", "/ebook", "/ebook-preview", "/share", "/refer"];

const toPractice = ["/paper-trader-v2"];
const toProfile = ["/certificate", "/more"];

// The gold lessons from the first redesign. "support-and-resistance" is left out because the stock course reuses that address.
const oldGoldLessons = [
  "what-is-gold-trading", "why-gold-moves", "how-gold-is-quoted", "lots-and-ounces", "how-leverage-works",
  "the-costs-of-trading", "reading-candles", "spotting-a-trend", "the-one-percent-idea", "stop-losses",
  "common-beginner-mistakes", "what-is-a-demo-account", "opening-a-demo", "placing-a-practice-order",
  "major-forex-pairs", "what-moves-currencies", "what-are-indices", "silver-and-other-metals",
].map((slug) => `/lessons/${slug}`);

export const RETIRED_ROUTES = [
  ...oldGoldLessons.map((source) => ({ source, destination: "/lessons", permanent: true })),
  ...toLessons.map((source) => ({ source, destination: "/lessons", permanent: true })),
  ...toHome.map((source) => ({ source, destination: "/", permanent: true })),
  ...toPractice.map((source) => ({ source, destination: "/practice", permanent: true })),
  ...toProfile.map((source) => ({ source, destination: "/profile", permanent: true })),
];
