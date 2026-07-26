interface DigitalGoodsService {
  getDetails(itemIds: string[]): Promise<ItemDetails[]>;
  listPurchases(): Promise<PurchaseDetails[]>;
  listPurchaseHistory(): Promise<PurchaseDetails[]>;
}

interface ItemDetails {
  itemId: string;
  title: string;
  description: string;
  price: PaymentCurrencyAmount;
  type: "product" | "subscription";
  iconURLs?: string[];
  subscriptionPeriod?: string;
  freeTrialPeriod?: string;
  introductoryPrice?: PaymentCurrencyAmount;
  introductoryPricePeriod?: string;
  introductoryPriceCycles?: number;
  offerToken?: string;
}

interface PurchaseDetails {
  itemId: string;
  purchaseToken: string;
}

interface PaymentCurrencyAmount {
  currency: string;
  value: string;
}

interface Window {
  getDigitalGoodsService(
    paymentMethod: string
  ): Promise<DigitalGoodsService>;
}
