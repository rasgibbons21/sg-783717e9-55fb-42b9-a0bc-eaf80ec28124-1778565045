export interface BrokerConfig {
  id: string;
  name: string;
  logo: string;
  description: string;
  bestFor: string[];
  markets: string[];
  minimumDeposit: string;
  website: string;
  affiliateLinks: {
    homepage?: string;
    openAccount?: string;
    realAccount?: string;
    mobileApp?: string;
    demoAccount?: string;
    partner?: string;
  };
  partnerCode?: string;
  referralCode?: string;
  educationLink?: string;
  signUpBonus?: string;
  beginnerRating: number;
  demoAccountAvailable: boolean;
  platforms: string[];
  regulated: boolean;
  enabled: boolean;
  displayOrder: number;
}

export const brokers: BrokerConfig[] = [
  {
    id: "deriv",
    name: "Deriv",
    logo: "/logos/deriv-logo.svg",
    description: "Trade forex, commodities, and synthetic indices with flexible leverage and 24/7 market access.",
    bestFor: ["Beginners", "Forex", "Commodities", "Crypto", "Synthetic Trading"],
    markets: ["Forex", "Commodities", "Synthetics", "Crypto", "Indices", "Derivatives"],
    minimumDeposit: "$1",
    website: "https://deriv.com",
    affiliateLinks: {
      homepage: "https://deriv.com",
    },
    referralCode: "NPQCUG86TJTE",
    educationLink: "https://deriv.com/en/education",
    signUpBonus: "Free demo account with $10,000 virtual funds, $1 minimum deposit to start live trading",
    beginnerRating: 4.7,
    demoAccountAvailable: true,
    platforms: ["DTrader", "DBot", "MT5", "Mobile App"],
    regulated: true,
    enabled: true,
    displayOrder: 1,
  },
  {
    id: "xm",
    name: "XM",
    logo: "/logos/xm-logo.svg",
    description: "Global forex and CFD broker with extensive educational resources, tight spreads, and bonus programs for all experience levels.",
    bestFor: ["Forex Trading", "CFDs", "Commodities", "Indices", "Stocks"],
    markets: ["Forex", "CFDs", "Commodities", "Indices", "Stocks"],
    minimumDeposit: "$5",
    website: "https://xm.com",
    affiliateLinks: {
      homepage: "https://affs.click/TTcBd",
      realAccount: "https://affs.click/bNamY",
      mobileApp: "https://affs.click/NQLlp",
      partner: "https://affs.click/wAcmB",
    },
    partnerCode: "TFDCK",
    referralCode: "TFDCK",
    educationLink: "https://www.xm.com/education",
    signUpBonus: "Up to $5,000 deposit bonus, free educational webinars, and loyalty program rewards",
    beginnerRating: 4.8,
    demoAccountAvailable: true,
    platforms: ["MT4", "MT5", "Mobile App", "Web Platform"],
    regulated: true,
    enabled: true,
    displayOrder: 2,
  },
  {
    id: "exness",
    name: "Exness",
    logo: "/logos/exness-logo.svg",
    description: "Award-winning forex and CFD broker with unlimited leverage, fast execution, and comprehensive trading tools.",
    bestFor: ["Forex Trading", "High Leverage", "Active Traders", "Beginners"],
    markets: ["Forex", "Metals", "Energy", "Indices", "Crypto"],
    minimumDeposit: "$1",
    website: "https://exness.com",
    affiliateLinks: {
      openAccount: "https://one.exnessonelink.com/a/t13zv0dpdi",
    },
    educationLink: "https://exness.com/en/education",
    signUpBonus: "Instant withdrawals, unlimited leverage on qualifying accounts, $1 minimum deposit",
    beginnerRating: 4.9,
    demoAccountAvailable: true,
    platforms: ["MT4", "MT5", "Mobile App", "Web Platform"],
    regulated: true,
    enabled: true,
    displayOrder: 3,
  },
  {
    id: "vantage",
    name: "Vantage",
    logo: "/logos/vantage-logo.svg",
    description: "Premium forex and CFD trading platform with tight spreads, professional tools, and fast execution.",
    bestFor: ["Active Trading", "Forex", "CFDs", "Stocks"],
    markets: ["Forex", "CFDs", "Stocks", "Indices", "Commodities"],
    minimumDeposit: "$200",
    website: "https://vantage.com",
    affiliateLinks: {
      openAccount: "https://www.vantagemarkets.com/open-live-account?cpaAffid=MjAzMTQwMDM",
    },
    referralCode: "CPA00ixMG",
    educationLink: "https://www.vantagemarkets.com/en/education",
    signUpBonus: "Up to 50% deposit bonus, raw ECN spreads from 0.0 pips, free VPS hosting",
    beginnerRating: 4.5,
    demoAccountAvailable: true,
    platforms: ["MT4", "MT5", "cTrader", "Mobile App"],
    regulated: true,
    enabled: true,
    displayOrder: 4,
  },
  {
    id: "avatrade",
    name: "AvaTrade",
    logo: "/logos/avatrade-logo.svg",
    description: "Multi-asset broker offering forex, CFDs, stocks, and more with award-winning platforms and strong regulation.",
    bestFor: ["Multi-Asset Trading", "Forex", "CFDs", "Copy Trading"],
    markets: ["Forex", "CFDs", "Stocks", "Commodities", "Indices", "Crypto", "Options"],
    minimumDeposit: "$100",
    website: "https://avatrade.com",
    affiliateLinks: {
      homepage: "https://avatrade.com?tag=222519",
      openAccount: "https://avatrade.com?tag=222519",
    },
    educationLink: "https://www.avatrade.com/education",
    signUpBonus: "Welcome bonus on first deposit, free AvaProtect risk management tool, copy trading via AvaSocial",
    beginnerRating: 4.6,
    demoAccountAvailable: true,
    platforms: ["MT4", "MT5", "AvaTradeGO", "WebTrader", "Mobile App"],
    regulated: true,
    enabled: true,
    displayOrder: 5,
  },
  {
    id: "webull",
    name: "Webull",
    logo: "/logos/webull-logo.svg",
    description: "Commission-free trading platform for stocks, ETFs, and options with advanced charting and extended trading hours.",
    bestFor: ["Stocks", "ETFs", "Options", "Beginners"],
    markets: ["Stocks", "ETFs", "Options", "Crypto"],
    minimumDeposit: "$0",
    website: "https://webull.com",
    affiliateLinks: {
      homepage: "https://webull.com",
      openAccount: "https://webull.com",
    },
    educationLink: "https://www.webull.com/blog",
    signUpBonus: "Commission-free trading, free stocks on sign-up, extended trading hours (4am-8pm ET)",
    beginnerRating: 4.5,
    demoAccountAvailable: true,
    platforms: ["Desktop App", "Mobile App", "Web Platform"],
    regulated: true,
    enabled: true,
    displayOrder: 6,
  },
  {
    id: "tradingview",
    name: "TradingView",
    logo: "/logos/tradingview-logo.svg",
    description: "The world's leading charting and market research platform with social trading features, screeners, and broker integrations.",
    bestFor: ["Charting", "Market Research", "Technical Analysis", "Social Trading"],
    markets: ["Stocks", "Forex", "Crypto", "Indices", "Commodities", "Bonds"],
    minimumDeposit: "Free",
    website: "https://tradingview.com",
    affiliateLinks: {
      homepage: "https://tradingview.com?aff_id=169003",
      openAccount: "https://tradingview.com?aff_id=169003",
    },
    educationLink: "https://www.tradingview.com/education",
    signUpBonus: "Free plan available, up to $30 off Premium with annual billing, community scripts and indicators",
    beginnerRating: 4.8,
    demoAccountAvailable: false,
    platforms: ["Web Platform", "Desktop App", "Mobile App"],
    regulated: false,
    enabled: true,
    displayOrder: 7,
  },
];

export const getEnabledBrokers = () => {
  return brokers
    .filter((broker) => broker.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
};

export const getBrokerById = (id: string) => {
  return brokers.find((broker) => broker.id === id);
};

export const getAllMarkets = () => {
  const markets = new Set<string>();
  brokers.forEach((broker) => {
    broker.markets.forEach((market) => markets.add(market));
  });
  return Array.from(markets).sort();
};
