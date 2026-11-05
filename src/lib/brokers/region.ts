import type { BrokerConfig } from "@/config/brokers";

export type BrokerNotice = "us" | "general";

export function brokerNotice(country: string | null): BrokerNotice {
  return country?.toUpperCase() === "US" ? "us" : "general";
}

/** CFD brokers don't generally accept US residents, and a broker with no link has nothing to open. */
export function canShowOpenButton(broker: BrokerConfig, notice: BrokerNotice): boolean {
  if (!broker.affiliateUrl) return false;
  if (notice === "us") return broker.regions?.includes("US") === true;
  return true;
}
