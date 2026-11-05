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

const toHome = ["/subscription/:path*", "/subscription-offer", "/ebook-premium", "/refer"];

const toPractice = ["/paper-trader-v2"];
const toProfile = ["/certificate"];

export const RETIRED_ROUTES = [
  ...toLessons.map((source) => ({ source, destination: "/lessons", permanent: true })),
  ...toHome.map((source) => ({ source, destination: "/", permanent: true })),
  ...toPractice.map((source) => ({ source, destination: "/practice", permanent: true })),
  ...toProfile.map((source) => ({ source, destination: "/profile", permanent: true })),
];
