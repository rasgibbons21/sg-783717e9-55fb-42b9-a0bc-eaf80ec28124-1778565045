export interface SecondaryAction {
  label: string;
  url: string;
}

export interface BrokerConfig {
  id: string;
  name: string;
  category: "Stocks & ETFs" | "Forex & CFDs" | "Charting & Research";
  type: "broker" | "platform";
  logo: string;
  shortDescription: string;
  markets: string[];
  platforms: string[] | null;
  bestFor: string[];
  demoAvailable: boolean | null;
  minimumDeposit: string | null;
  regulation: string | null;
  primaryUrl: string;
  primaryButtonLabel: string;
  secondaryActions: SecondaryAction[];
  partnerCode: string | null;
  promotionText: string | null;
  enabled: boolean;
  displayOrder: number;
}

export const brokers: BrokerConfig[] = [
  // ── Stocks & ETFs ──
  {
    id: "webull",
    name: "Webull",
    category: "Stocks & ETFs",
    type: "broker",
    logo: "/logos/webull-logo.svg",
    shortDescription: "Commission-free trading platform for stocks, ETFs, and options with advanced charting.",
    markets: ["Stocks", "ETFs", "Options", "Crypto"],
    platforms: ["Desktop App", "Mobile App", "Web Platform"],
    bestFor: ["Stocks", "ETFs", "Options", "Beginners"],
    demoAvailable: null,
    minimumDeposit: null,
    regulation: null,
    primaryUrl: "https://www.webull.com/s/3KhusTF68dPXmGVxdq",
    primaryButtonLabel: "View Promotion",
    secondaryActions: [],
    partnerCode: null,
    promotionText: "Eligible users may receive promotional fractional shares.",
    enabled: true,
    displayOrder: 1,
  },

  // ── Forex & CFDs ──
  {
    id: "deriv",
    name: "Deriv",
    category: "Forex & CFDs",
    type: "broker",
    logo: "/logos/deriv-logo.svg",
    shortDescription: "Trade forex, commodities, and synthetic indices with flexible leverage.",
    markets: ["Forex", "Commodities", "Synthetics", "Crypto", "Indices"],
    platforms: ["DTrader", "DBot", "MT5", "Mobile App"],
    bestFor: ["Beginners", "Forex", "Synthetic Trading"],
    demoAvailable: true,
    minimumDeposit: null,
    regulation: null,
    primaryUrl: "https://deriv.com",
    primaryButtonLabel: "Open Account",
    secondaryActions: [],
    partnerCode: "NPQCUG86TJTE",
    promotionText: null,
    enabled: true,
    displayOrder: 2,
  },
  {
    id: "xm",
    name: "XM",
    category: "Forex & CFDs",
    type: "broker",
    logo: "/logos/xm-logo.svg",
    shortDescription: "Global forex and CFD broker with educational resources for all experience levels.",
    markets: ["Forex", "CFDs", "Commodities", "Indices", "Stocks"],
    platforms: ["MT4", "MT5", "Mobile App", "Web Platform"],
    bestFor: ["Forex Trading", "CFDs", "Education"],
    demoAvailable: true,
    minimumDeposit: null,
    regulation: null,
    primaryUrl: "https://clicks.pipaffiliates.com/c?c=1269286&l=en&p=3022",
    primaryButtonLabel: "Open Real Account",
    secondaryActions: [
      { label: "Visit XM", url: "https://clicks.pipaffiliates.com/c?c=1269286&l=en&p=0" },
      { label: "Download Mobile App", url: "https://clicks.pipaffiliates.com/c?c=1269286&l=en&p=5" },
    ],
    partnerCode: null,
    promotionText: null,
    enabled: true,
    displayOrder: 3,
  },
  {
    id: "exness",
    name: "Exness",
    category: "Forex & CFDs",
    type: "broker",
    logo: "/logos/exness-logo.svg",
    shortDescription: "Forex and CFD broker with fast execution and comprehensive trading tools.",
    markets: ["Forex", "Metals", "Energy", "Indices", "Crypto"],
    platforms: ["MT4", "MT5", "Mobile App", "Web Platform"],
    bestFor: ["Forex Trading", "Active Traders"],
    demoAvailable: true,
    minimumDeposit: null,
    regulation: null,
    primaryUrl: "https://one.exnessonelink.com/a/t13zv0dpdi",
    primaryButtonLabel: "Open Account",
    secondaryActions: [],
    partnerCode: null,
    promotionText: null,
    enabled: true,
    displayOrder: 4,
  },
  {
    id: "vantage",
    name: "Vantage",
    category: "Forex & CFDs",
    type: "broker",
    logo: "/logos/vantage-logo.svg",
    shortDescription: "Forex and CFD trading platform with tight spreads and professional tools.",
    markets: ["Forex", "CFDs", "Stocks", "Indices", "Commodities"],
    platforms: ["MT4", "MT5", "cTrader", "Mobile App"],
    bestFor: ["Active Trading", "Forex", "CFDs"],
    demoAvailable: true,
    minimumDeposit: null,
    regulation: null,
    primaryUrl: "https://www.vantagemarkets.com/open-live-account?cpaAffid=MjAzMTQwMDM",
    primaryButtonLabel: "Open Live Account",
    secondaryActions: [],
    partnerCode: "CPA00ixMG",
    promotionText: null,
    enabled: true,
    displayOrder: 5,
  },
  {
    id: "avatrade",
    name: "AvaTrade",
    category: "Forex & CFDs",
    type: "broker",
    logo: "/logos/avatrade-logo.svg",
    shortDescription: "Multi-asset broker offering forex, CFDs, options, futures, and more.",
    markets: ["Forex", "CFDs", "Stocks", "Commodities", "Indices", "Crypto", "Options"],
    platforms: null,
    bestFor: ["Multi-Asset Trading", "Forex", "CFDs"],
    demoAvailable: null,
    minimumDeposit: null,
    regulation: null,
    primaryUrl: "https://www.avatrade.com?tag=222519",
    primaryButtonLabel: "Open Account",
    secondaryActions: [],
    partnerCode: null,
    promotionText: null,
    enabled: true,
    displayOrder: 6,
  },

  // ── Charting & Research ──
  {
    id: "tradingview",
    name: "TradingView",
    category: "Charting & Research",
    type: "platform",
    logo: "/logos/tradingview-logo.svg",
    shortDescription: "Advanced charting, indicators, screeners, alerts, and market research tools.",
    markets: ["Stocks", "Forex", "Crypto", "Indices", "Commodities", "Bonds"],
    platforms: ["Web Platform", "Desktop App", "Mobile App"],
    bestFor: ["Charting", "Technical Analysis", "Market Research"],
    demoAvailable: null,
    minimumDeposit: null,
    regulation: null,
    primaryUrl: "https://www.tradingview.com/?aff_id=169003",
    primaryButtonLabel: "Open TradingView",
    secondaryActions: [],
    partnerCode: null,
    promotionText: null,
    enabled: true,
    displayOrder: 7,
  },
];

export const CATEGORIES = ["Stocks & ETFs", "Forex & CFDs", "Charting & Research"] as const;

export const getEnabledBrokers = () => {
  return brokers
    .filter((b) => b.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
};

export const getBrokersByCategory = (category: string) => {
  return getEnabledBrokers().filter((b) => b.category === category);
};

export const getBrokerById = (id: string) => {
  return brokers.find((b) => b.id === id);
};
