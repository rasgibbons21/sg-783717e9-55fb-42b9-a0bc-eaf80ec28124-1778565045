import { describe, expect, it } from "vitest";
import type { BrokerConfig } from "@/config/brokers";
import { brokerNotice, canShowOpenButton } from "./region";

const broker = (overrides: Partial<BrokerConfig>) =>
  ({ affiliateUrl: "https://example.com", category: "Forex & CFDs", active: true, ...overrides }) as BrokerConfig;

describe("brokerNotice", () => {
  it("gives US visitors their own notice", () => {
    expect(brokerNotice("US")).toBe("us");
    expect(brokerNotice("us")).toBe("us");
  });

  it("gives other known countries the general notice", () => {
    expect(brokerNotice("GB")).toBe("general");
  });

  it("stays unknown when the country can't be determined", () => {
    expect(brokerNotice(null)).toBe("unknown");
    expect(brokerNotice("")).toBe("unknown");
  });
});

describe("canShowOpenButton", () => {
  it("shows a CFD broker's button in a known non-US country", () => {
    expect(canShowOpenButton(broker({}), "general")).toBe(true);
  });

  it("hides CFD broker buttons from US visitors", () => {
    expect(canShowOpenButton(broker({}), "us")).toBe(false);
  });

  it("hides CFD broker buttons until the country is known", () => {
    expect(canShowOpenButton(broker({}), "unknown")).toBe(false);
  });

  it("keeps a US-available stock broker's button for US visitors", () => {
    expect(canShowOpenButton(broker({ category: "Stocks & ETFs", regions: ["US"] }), "us")).toBe(true);
  });

  it("shows no button until a broker has a link", () => {
    expect(canShowOpenButton(broker({ affiliateUrl: "" }), "general")).toBe(false);
  });
});
