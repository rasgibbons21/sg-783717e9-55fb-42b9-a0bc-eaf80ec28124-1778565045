export interface Broker {
  id: string;
  name: string;
  logo: string;
  description: string;
  rating: number;
  minDeposit: string;
  categories: string[];
  affiliateLink: string;
  features: string[];
  regulated: boolean;
  spreadType: string;
}

export const brokers: Broker[] = [
  {
    id: "deriv",
    name: "Deriv",
    logo: "/brokers/deriv.png",
    description: "Trade forex, commodities, and synthetics with a trusted global broker",
    rating: 4.8,
    minDeposit: "$1",
    categories: ["Beginner Friendly", "Low Fees"],
    affiliateLink: "YOUR_DERIV_LINK",
    features: ["24/7 Trading", "Low Spreads", "Mobile App"],
    regulated: true,
    spreadType: "Variable",
  },
  {
    id: "xm",
    name: "XM",
    logo: "/brokers/xm.png",
    description: "Global forex and CFD broker with extensive education and bonus programs",
    rating: 4.7,
    minDeposit: "$5",
    categories: ["Most Popular", "Regulated"],
    affiliateLink: "YOUR_XM_LINK",
    features: ["Low Spreads", "Education", "Bonus"],
    regulated: true,
    spreadType: "Variable",
  },
  {
    id: "exness",
    name: "Exness",
    logo: "/brokers/exness.png",
    description: "High-leverage forex broker with fast execution and copy trading",
    rating: 4.9,
    minDeposit: "$1",
    categories: ["Beginner Friendly", "High Leverage"],
    affiliateLink: "YOUR_EXNESS_LINK",
    features: ["Unlimited Leverage", "Fast Execution", "Copy Trading"],
    regulated: true,
    spreadType: "Variable",
  },
  {
    id: "vantage",
    name: "Vantage",
    logo: "/brokers/vantage.png",
    description: "Premium trading experience with tight spreads and fast execution",
    rating: 4.6,
    minDeposit: "$200",
    categories: ["Most Popular", "Low Fees"],
    affiliateLink: "YOUR_VANTAGE_LINK",
    features: ["Tight Spreads", "Fast Execution", "Support"],
    regulated: true,
    spreadType: "Fixed",
  },
];

export const getBrokersByCategory = (category: string) => {
  return brokers.filter((broker) => broker.categories.includes(category));
};

export const getAllCategories = () => {
  const categories = new Set<string>();
  brokers.forEach((broker) => {
    broker.categories.forEach((cat) => categories.add(cat));
  });
  return Array.from(categories);
};
