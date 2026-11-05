import { describe, expect, it } from "vitest";
import { exitReasonAt } from "./stops";

const long = { direction: "long" as const, stop_price: 3950, target_price: 4100 };
const short = { direction: "short" as const, stop_price: 4050, target_price: 3900 };

describe("exitReasonAt", () => {
  it("closes a bought trade at its stop or target", () => {
    expect(exitReasonAt(long, 3950)).toBe("Stopped out");
    expect(exitReasonAt(long, 3940)).toBe("Stopped out");
    expect(exitReasonAt(long, 4100)).toBe("Hit target");
    expect(exitReasonAt(long, 4000)).toBeNull();
  });

  it("closes a sold trade at its stop or target", () => {
    expect(exitReasonAt(short, 4050)).toBe("Stopped out");
    expect(exitReasonAt(short, 3900)).toBe("Hit target");
    expect(exitReasonAt(short, 4000)).toBeNull();
  });

  it("leaves trades with no stop or target alone", () => {
    expect(exitReasonAt({ direction: "long", stop_price: null, target_price: null }, 1)).toBeNull();
  });
});
