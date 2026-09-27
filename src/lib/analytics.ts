type EventParams = Record<string, string | number | boolean | undefined>;

function event(name: string, params?: EventParams) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}

// ── Onboarding & Auth ─────────────────────────────────────────────────────
export function trackSignup(method: string) {
  event("sign_up", { method });
}

export function trackLogin(method: string) {
  event("login", { method });
}

export function trackOnboardingStep(step: string) {
  event("onboarding_step", { step });
}

export function trackOnboardingComplete() {
  event("onboarding_complete");
}

// ── Subscription & Billing ────────────────────────────────────────────────
export function trackViewPricing() {
  event("view_pricing");
}

export function trackBeginCheckout(plan: string, interval: string) {
  event("begin_checkout", { plan, interval });
}

export function trackPurchase(plan: string, interval: string, value: number) {
  event("purchase", { plan, interval, value, currency: "USD" });
}

// ── Core Features ─────────────────────────────────────────────────────────
export function trackAlertSet(ticker: string) {
  event("alert_set", { ticker });
}

export function trackAlertTriggered(ticker: string) {
  event("alert_triggered", { ticker });
}

export function trackWatchlistAdd(ticker: string) {
  event("watchlist_add", { ticker });
}

export function trackScannerView(strategy?: string) {
  event("scanner_view", { strategy: strategy || "all" });
}

export function trackSignalTap(ticker: string, strategy: string) {
  event("signal_tap", { ticker, strategy });
}

export function trackPaperTrade(action: "open" | "close", ticker: string) {
  event("paper_trade", { action, ticker });
}

export function trackJournalEntry() {
  event("journal_entry");
}

export function trackBacktestRun(strategy: string, days?: number) {
  event("backtest_run", { strategy, days });
}

// ── Engagement ────────────────────────────────────────────────────────────
export function trackPansyChat() {
  event("pansy_chat");
}

export function trackShareCard(type: "trade" | "stats") {
  event("share_card", { type });
}

export function trackReferralShare() {
  event("referral_share");
}

export function trackReferralCopy() {
  event("referral_copy");
}

export function trackEarningsView() {
  event("earnings_view");
}

export function trackGapScannerView() {
  event("gap_scanner_view");
}

export function trackPositionCalcUse() {
  event("position_calc_use");
}

export function trackBrokerClick(broker: string) {
  event("broker_click", { broker });
}

export function trackNotificationOptIn() {
  event("notification_opt_in");
}

export function trackSeoPageView(page: string) {
  event("seo_page_view", { page });
}
