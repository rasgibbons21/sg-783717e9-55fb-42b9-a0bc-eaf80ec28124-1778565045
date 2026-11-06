import type { BrokerConfig } from "@/config/brokers";

export type BrokerNotice = "us" | "general" | "unknown";

export function brokerNotice(country: string | null): BrokerNotice {
  if (!country) return "unknown";
  return country.toUpperCase() === "US" ? "us" : "general";
}

const FEATURED = ["xm", "icmarkets"];
const CHARTING = "tradingview";

/**
 * Which brokers to list. US visitors see brokers for real US shares, plus TradingView for
 * charting. Everyone else sees every current broker, with XM and IC Markets first and
 * IC Markets shown for information until it has a link.
 */
export function brokersFor(notice: BrokerNotice, all: BrokerConfig[]): BrokerConfig[] {
  const charting = all.find((b) => b.id === CHARTING);
  if (notice === "us") {
    const usBrokers = all.filter((b) => b.active && b.id !== CHARTING && b.regions?.includes("US"));
    return charting ? [...usBrokers, { ...charting, regions: ["US", ...(charting.regions ?? [])] }] : usBrokers;
  }
  const featured = FEATURED.map((id) => all.find((b) => b.id === id)).filter((b): b is BrokerConfig => Boolean(b));
  const others = all.filter((b) => b.active && !FEATURED.includes(b.id) && b.id !== CHARTING && !(b.regions?.length === 1 && b.regions[0] === "US"));
  return [...featured, ...others, ...(charting ? [charting] : [])];
}

/** CFD brokers don't generally accept US residents, so their links wait until we know the country isn't the US. */
export function canShowOpenButton(broker: BrokerConfig, notice: BrokerNotice): boolean {
  if (!broker.affiliateUrl) return false;
  if (notice === "general") return true;
  return notice === "us" && broker.regions?.includes("US") === true;
}
