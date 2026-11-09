import { describe, expect, it } from "vitest";
import { SAMPLE_PLAN, sampleAllocation } from "./sample";

describe("the example plan shown before sign-up", () => {
  it("uses the same maths as a real plan", () => {
    expect(sampleAllocation()).toMatchObject({ pay: 200000, save: 20000, bills: 90000, spend: 90000 });
  });

  it("is $2,000 a month, 10% saved, with $900 rent", () => {
    expect(SAMPLE_PLAN).toMatchObject({ payCents: 200000, payFrequency: "monthly", savePct: 10, currency: "USD" });
    expect(SAMPLE_PLAN.bills).toEqual([{ name: "Rent", amountCents: 90000, frequency: "monthly" }]);
  });
});
