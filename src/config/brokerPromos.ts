export interface BrokerPromo {
  id: string;
  name: string;
  logoDomain: string;
  tagline: string;
  affiliateUrl: string;
  active: boolean;
}

export const brokerPromos: BrokerPromo[] = [
  {
    id: "webull",
    name: "Webull",
    logoDomain: "webull.com",
    tagline: "Commission-free stocks, ETFs & options with extended hours trading.",
    affiliateUrl: "https://www.webull.com/s/3KhusTF68dPXmGVxdq",
    active: true,
  },
  {
    id: "xm",
    name: "XM",
    logoDomain: "xm.com",
    tagline: "Trade forex & CFDs with tight spreads and a free $100K demo account.",
    affiliateUrl: "https://clicks.pipaffiliates.com/c?c=1269286&l=en&p=3022",
    active: true,
  },
  {
    id: "exness",
    name: "Exness",
    logoDomain: "exness.com",
    tagline: "Instant withdrawals, low spreads, and no minimum deposit.",
    affiliateUrl: "https://one.exnessonelink.com/a/t13zv0dpdi",
    active: true,
  },
  {
    id: "avatrade",
    name: "AvaTrade",
    logoDomain: "avatrade.com",
    tagline: "Regulated in 9 jurisdictions with a free demo and education hub.",
    affiliateUrl: "https://www.avatrade.com?tag=222519",
    active: true,
  },
  {
    id: "tradingview",
    name: "TradingView",
    logoDomain: "tradingview.com",
    tagline: "Professional charting, screening, and community-driven ideas.",
    affiliateUrl: "https://www.tradingview.com/?aff_id=169003",
    active: true,
  },
  {
    id: "deriv",
    name: "Deriv",
    logoDomain: "deriv.com",
    tagline: "Trade forex, indices, and synthetic markets with a free demo account.",
    affiliateUrl: "https://deriv.com",
    active: true,
  },
  {
    id: "vantage",
    name: "Vantage",
    logoDomain: "vantagemarkets.com",
    tagline: "Forex & CFD trading with raw ECN spreads and fast execution.",
    affiliateUrl: "https://www.vantagemarkets.com/open-live-account?cpaAffid=MjAzMTQwMDM",
    active: true,
  },
];

export function getActivePromos(): BrokerPromo[] {
  return brokerPromos.filter((b) => b.active);
}

export function getFeaturedPromo(): BrokerPromo {
  return brokerPromos.find((b) => b.id === "xm") || brokerPromos[0];
}

let _promoIndex = Math.floor(Math.random() * brokerPromos.filter((b) => b.active).length);

export function getNextPromo(): BrokerPromo {
  const active = getActivePromos();
  if (active.length === 0) return brokerPromos[0];
  const promo = active[_promoIndex % active.length];
  _promoIndex++;
  return promo;
}
