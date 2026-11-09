import { describe, expect, it } from "vitest";
import { currencyForCountry, customCurrency, formatMoney, parseMoney } from "./money";

describe("parseMoney", () => {
  it("reads amounts the way people type them", () => {
    expect(parseMoney("1,250.50")).toBe(125050);
    expect(parseMoney("1250")).toBe(125000);
    expect(parseMoney(" 45.5 ")).toBe(4550);
    expect(parseMoney("$30")).toBe(3000);
    expect(parseMoney("1,000,000")).toBe(100000000);
    expect(parseMoney("0.5")).toBe(50);
    expect(parseMoney("£12")).toBe(1200);
  });

  it("rejects what isn't an amount", () => {
    expect(parseMoney("12.345")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("-5")).toBeNull();
    expect(parseMoney("1.2.3")).toBeNull();
    expect(parseMoney("2000000000")).toBeNull();
  });

  it("allows zero, so callers decide whether zero makes sense", () => {
    expect(parseMoney("0")).toBe(0);
  });
});

describe("formatMoney", () => {
  it("formats cents in her currency", () => {
    expect(formatMoney(125050, "USD", "en-US")).toBe("$1,250.50");
    expect(formatMoney(2000, "GBP", "en-GB")).toBe("£20.00");
  });
});

describe("currencyForCountry", () => {
  it("picks the local currency where Bloom knows it", () => {
    expect(currencyForCountry("NG")).toBe("NGN");
    expect(currencyForCountry("DE")).toBe("EUR");
    expect(currencyForCountry("JM")).toBe("JMD");
  });

  it("falls back to US dollars", () => {
    expect(currencyForCountry("ZZ")).toBe("USD");
    expect(currencyForCountry(null)).toBe("USD");
  });
});

describe("customCurrency", () => {
  it("accepts any three-letter code, in any case", () => {
    expect(customCurrency("php")).toBe("PHP");
    expect(customCurrency(" mxn ")).toBe("MXN");
  });

  it("rejects anything else", () => {
    expect(customCurrency("pesos")).toBeNull();
    expect(customCurrency("P1P")).toBeNull();
    expect(customCurrency("")).toBeNull();
  });
});
