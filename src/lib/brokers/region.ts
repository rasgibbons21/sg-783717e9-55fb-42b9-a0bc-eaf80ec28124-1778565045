import type { BrokerConfig } from "@/config/brokers";

export type BrokerNotice = "us" | "general" | "unknown";

export function brokerNotice(country: string | null): BrokerNotice {
  if (!country) return "unknown";
  return country.toUpperCase() === "US" ? "us" : "general";
}

/** CFD brokers don't generally accept US residents, so their links wait until we know the country isn't the US. */
export function canShowOpenButton(broker: BrokerConfig, notice: BrokerNotice): boolean {
  if (!broker.affiliateUrl) return false;
  if (notice === "general") return true;
  return notice === "us" && broker.regions?.includes("US") === true;
}
