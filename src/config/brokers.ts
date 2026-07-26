// ─── Broker comparison data model ───
// All facts must be verified. Use null for unverified fields.
// relationshipType: "affiliate" = monetised link, "informational" = no partnership.
// Admin: update verifiedAt when you re-check a broker's details.

export type RelationshipType = "affiliate" | "informational";

export interface SecondaryAction {
  label: string;
  url: string;
}

export interface BrokerConfig {
  id: string;
  name: string;
  slug: string;
  logoPath: string;

  // Relationship
  relationshipType: RelationshipType;
  affiliateUrl: string;
  disclosureRequired: boolean;
  secondaryActions: SecondaryAction[];
  partnerCode: string | null;
  promotionText: string | null;

  // Classification
  type: "broker" | "platform";
  category: "Stocks & ETFs" | "Forex & CFDs" | "Charting & Research";

  // Comparison fields
  bestFor: string[];
  beginnerFriendly: boolean;
  regions: string[]; // e.g. ["US","EU","APAC","LATAM","MENA","Africa","Global"]
  supportedAssets: {
    stocks: boolean | null;
    etfs: boolean | null;
    fractionalShares: boolean | null;
    options: boolean | null;
    mutualFunds: boolean | null;
    forex: boolean | null;
    cfds: boolean | null;
    crypto: boolean | null;
    commodities: boolean | null;
    futures: boolean | null;
    bonds: boolean | null;
  };
  paperTrading: boolean | null;
  retirementAccounts: boolean | null;
  minimumDeposit: string | null;
  feeSummary: string | null;
  educationLevel: "strong" | "moderate" | "basic" | null;
  supportChannels: string[];

  // Qualitative (verified text)
  shortDescription: string;
  overview: string | null;
  strengths: string[];
  limitations: string[];
  platforms: string[] | null;
  markets: string[];

  // Admin
  verifiedAt: string | null;   // ISO date
  sourceNotes: string | null;
  active: boolean;
  displayOrder: number;
}

// ─── Broker data ───
// Only brokers with confirmed affiliate URLs approved for this repository.
// No unapproved brokers. No invented facts.

export const brokers: BrokerConfig[] = [
  {
    id: "webull",
    name: "Webull",
    slug: "webull",
    logoPath: "/logos/webull-logo.svg",
    relationshipType: "affiliate",
    affiliateUrl: "https://www.webull.com/s/3KhusTF68dPXmGVxdq",
    disclosureRequired: true,
    secondaryActions: [],
    partnerCode: null,
    promotionText: "Eligible users may receive promotional fractional shares.",
    type: "broker",
    category: "Stocks & ETFs",
    bestFor: ["Stocks", "ETFs", "Options", "Beginners"],
    beginnerFriendly: true,
    regions: ["US"],
    supportedAssets: {
      stocks: true,
      etfs: true,
      fractionalShares: null,
      options: true,
      mutualFunds: null,
      forex: null,
      cfds: null,
      crypto: true,
      commodities: null,
      futures: null,
      bonds: null,
    },
    paperTrading: true,
    retirementAccounts: null,
    minimumDeposit: null,
    feeSummary: null,
    educationLevel: null,
    supportChannels: [],
    shortDescription:
      "Commission-free trading platform for stocks, ETFs, and options with advanced charting.",
    overview: null,
    strengths: [
      "Commission-free stock and ETF trades",
      "Advanced charting tools",
      "Paper trading available",
    ],
    limitations: [
      "Primarily available in the United States",
    ],
    platforms: ["Desktop App", "Mobile App", "Web Platform"],
    markets: ["Stocks", "ETFs", "Options", "Crypto"],
    verifiedAt: null,
    sourceNotes: null,
    active: true,
    displayOrder: 1,
  },

  {
    id: "deriv",
    name: "Deriv",
    slug: "deriv",
    logoPath: "/logos/deriv-logo.svg",
    relationshipType: "affiliate",
    affiliateUrl: "https://deriv.com",
    disclosureRequired: true,
    secondaryActions: [],
    partnerCode: "NPQCUG86TJTE",
    promotionText: null,
    type: "broker",
    category: "Forex & CFDs",
    bestFor: ["Beginners", "Forex", "Synthetic Trading"],
    beginnerFriendly: true,
    regions: ["Global"],
    supportedAssets: {
      stocks: null,
      etfs: null,
      fractionalShares: null,
      options: null,
      mutualFunds: null,
      forex: true,
      cfds: null,
      crypto: true,
      commodities: true,
      futures: null,
      bonds: null,
    },
    paperTrading: true,
    retirementAccounts: null,
    minimumDeposit: null,
    feeSummary: null,
    educationLevel: "moderate",
    supportChannels: [],
    shortDescription:
      "Trade forex, commodities, and synthetic indices with flexible leverage.",
    overview: null,
    strengths: [
      "Demo account available",
      "Synthetic indices unique to Deriv",
      "Available in many countries",
    ],
    limitations: [
      "Not available in the United States",
    ],
    platforms: ["DTrader", "DBot", "MT5", "Mobile App"],
    markets: ["Forex", "Commodities", "Synthetics", "Crypto", "Indices"],
    verifiedAt: null,
    sourceNotes: null,
    active: true,
    displayOrder: 2,
  },

  {
    id: "xm",
    name: "XM",
    slug: "xm",
    logoPath: "/logos/xm-logo.svg",
    relationshipType: "affiliate",
    affiliateUrl: "https://clicks.pipaffiliates.com/c?c=1269286&l=en&p=3022",
    disclosureRequired: true,
    secondaryActions: [
      {
        label: "Visit XM",
        url: "https://clicks.pipaffiliates.com/c?c=1269286&l=en&p=0",
      },
      {
        label: "Download Mobile App",
        url: "https://clicks.pipaffiliates.com/c?c=1269286&l=en&p=5",
      },
    ],
    partnerCode: null,
    promotionText: null,
    type: "broker",
    category: "Forex & CFDs",
    bestFor: ["Forex Trading", "CFDs", "Education"],
    beginnerFriendly: true,
    regions: ["Global"],
    supportedAssets: {
      stocks: true,
      etfs: null,
      fractionalShares: null,
      options: null,
      mutualFunds: null,
      forex: true,
      cfds: true,
      crypto: null,
      commodities: true,
      futures: null,
      bonds: null,
    },
    paperTrading: true,
    retirementAccounts: null,
    minimumDeposit: null,
    feeSummary: null,
    educationLevel: "strong",
    supportChannels: [],
    shortDescription:
      "Global forex and CFD broker with educational resources for all experience levels.",
    overview: null,
    strengths: [
      "Extensive educational resources",
      "Demo account available",
      "Multi-platform support (MT4, MT5)",
    ],
    limitations: [
      "Not available in the United States",
    ],
    platforms: ["MT4", "MT5", "Mobile App", "Web Platform"],
    markets: ["Forex", "CFDs", "Commodities", "Indices", "Stocks"],
    verifiedAt: null,
    sourceNotes: null,
    active: true,
    displayOrder: 3,
  },

  {
    id: "exness",
    name: "Exness",
    slug: "exness",
    logoPath: "/logos/exness-logo.svg",
    relationshipType: "affiliate",
    affiliateUrl: "https://one.exnessonelink.com/a/t13zv0dpdi",
    disclosureRequired: true,
    secondaryActions: [],
    partnerCode: null,
    promotionText: null,
    type: "broker",
    category: "Forex & CFDs",
    bestFor: ["Forex Trading", "Active Traders"],
    beginnerFriendly: false,
    regions: ["Global"],
    supportedAssets: {
      stocks: null,
      etfs: null,
      fractionalShares: null,
      options: null,
      mutualFunds: null,
      forex: true,
      cfds: null,
      crypto: true,
      commodities: null,
      futures: null,
      bonds: null,
    },
    paperTrading: true,
    retirementAccounts: null,
    minimumDeposit: null,
    feeSummary: null,
    educationLevel: null,
    supportChannels: [],
    shortDescription:
      "Forex and CFD broker with fast execution and comprehensive trading tools.",
    overview: null,
    strengths: [
      "Demo account available",
      "Fast execution speeds",
    ],
    limitations: [
      "Not available in the United States",
    ],
    platforms: ["MT4", "MT5", "Mobile App", "Web Platform"],
    markets: ["Forex", "Metals", "Energy", "Indices", "Crypto"],
    verifiedAt: null,
    sourceNotes: null,
    active: true,
    displayOrder: 4,
  },

  {
    id: "vantage",
    name: "Vantage",
    slug: "vantage",
    logoPath: "/logos/vantage-logo.svg",
    relationshipType: "affiliate",
    affiliateUrl:
      "https://www.vantagemarkets.com/open-live-account?cpaAffid=MjAzMTQwMDM",
    disclosureRequired: true,
    secondaryActions: [],
    partnerCode: "CPA00ixMG",
    promotionText: null,
    type: "broker",
    category: "Forex & CFDs",
    bestFor: ["Active Trading", "Forex", "CFDs"],
    beginnerFriendly: false,
    regions: ["Global"],
    supportedAssets: {
      stocks: true,
      etfs: null,
      fractionalShares: null,
      options: null,
      mutualFunds: null,
      forex: true,
      cfds: true,
      crypto: null,
      commodities: true,
      futures: null,
      bonds: null,
    },
    paperTrading: true,
    retirementAccounts: null,
    minimumDeposit: null,
    feeSummary: null,
    educationLevel: null,
    supportChannels: [],
    shortDescription:
      "Forex and CFD trading platform with tight spreads and professional tools.",
    overview: null,
    strengths: [
      "Multiple platform support including cTrader",
      "Demo account available",
    ],
    limitations: [
      "Not available in the United States",
    ],
    platforms: ["MT4", "MT5", "cTrader", "Mobile App"],
    markets: ["Forex", "CFDs", "Stocks", "Indices", "Commodities"],
    verifiedAt: null,
    sourceNotes: null,
    active: true,
    displayOrder: 5,
  },

  {
    id: "avatrade",
    name: "AvaTrade",
    slug: "avatrade",
    logoPath: "/logos/avatrade-logo.svg",
    relationshipType: "affiliate",
    affiliateUrl: "https://www.avatrade.com?tag=222519",
    disclosureRequired: true,
    secondaryActions: [],
    partnerCode: null,
    promotionText: null,
    type: "broker",
    category: "Forex & CFDs",
    bestFor: ["Multi-Asset Trading", "Forex", "CFDs"],
    beginnerFriendly: false,
    regions: ["Global"],
    supportedAssets: {
      stocks: true,
      etfs: null,
      fractionalShares: null,
      options: true,
      mutualFunds: null,
      forex: true,
      cfds: true,
      crypto: true,
      commodities: true,
      futures: null,
      bonds: null,
    },
    paperTrading: null,
    retirementAccounts: null,
    minimumDeposit: null,
    feeSummary: null,
    educationLevel: null,
    supportChannels: [],
    shortDescription:
      "Multi-asset broker offering forex, CFDs, options, futures, and more.",
    overview: null,
    strengths: [
      "Wide range of asset classes",
      "Available in many countries",
    ],
    limitations: [
      "Check availability and terms on the provider's website",
    ],
    platforms: null,
    markets: [
      "Forex",
      "CFDs",
      "Stocks",
      "Commodities",
      "Indices",
      "Crypto",
      "Options",
    ],
    verifiedAt: null,
    sourceNotes: null,
    active: true,
    displayOrder: 6,
  },

  {
    id: "tradingview",
    name: "TradingView",
    slug: "tradingview",
    logoPath: "/logos/tradingview-logo.svg",
    relationshipType: "affiliate",
    affiliateUrl: "https://www.tradingview.com/?aff_id=169003",
    disclosureRequired: true,
    secondaryActions: [],
    partnerCode: null,
    promotionText: null,
    type: "platform",
    category: "Charting & Research",
    bestFor: ["Charting", "Technical Analysis", "Market Research"],
    beginnerFriendly: true,
    regions: ["Global"],
    supportedAssets: {
      stocks: true,
      etfs: true,
      fractionalShares: null,
      options: null,
      mutualFunds: null,
      forex: true,
      cfds: null,
      crypto: true,
      commodities: true,
      futures: null,
      bonds: true,
    },
    paperTrading: true,
    retirementAccounts: null,
    minimumDeposit: null,
    feeSummary: null,
    educationLevel: "strong",
    supportChannels: [],
    shortDescription:
      "Advanced charting, indicators, screeners, alerts, and market research tools.",
    overview: null,
    strengths: [
      "Industry-leading charting tools",
      "Paper trading built in",
      "Large community and idea sharing",
    ],
    limitations: [
      "Charting and research tool, not a full brokerage",
    ],
    platforms: ["Web Platform", "Desktop App", "Mobile App"],
    markets: [
      "Stocks",
      "Forex",
      "Crypto",
      "Indices",
      "Commodities",
      "Bonds",
    ],
    verifiedAt: null,
    sourceNotes: null,
    active: true,
    displayOrder: 7,
  },
];

// ─── Helpers ───

export const CATEGORIES = [
  "Stocks & ETFs",
  "Forex & CFDs",
  "Charting & Research",
] as const;

export const getEnabledBrokers = () =>
  brokers.filter((b) => b.active).sort((a, b) => a.displayOrder - b.displayOrder);

export const getBrokersByCategory = (category: string) =>
  getEnabledBrokers().filter((b) => b.category === category);

export const getBrokerById = (id: string) =>
  brokers.find((b) => b.id === id);

export const REGION_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "EU", label: "Europe" },
  { value: "APAC", label: "Asia-Pacific" },
  { value: "LATAM", label: "Latin America" },
  { value: "MENA", label: "Middle East & North Africa" },
  { value: "Africa", label: "Africa" },
  { value: "Global", label: "Other / Not sure" },
] as const;

export function getBrokersForRegion(regionCode: string) {
  return getEnabledBrokers().filter(
    (b) =>
      b.regions.includes("Global") || b.regions.includes(regionCode)
  );
}
