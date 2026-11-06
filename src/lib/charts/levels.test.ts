import { describe, expect, it } from "vitest";
import { defaultLevels, defaultZone, handleHitRects } from "./levels";
import { priceScale } from "./scale";

const MIN = 90;
const MAX = 110;
const HEIGHT = 222;
const PAD = 14;
const scale = priceScale(MIN, MAX, HEIGHT, PAD);
const gap = (a: number, b: number) => Math.abs(scale.toY(a) - scale.toY(b));

describe("defaultLevels", () => {
  it("spaces the lines far enough apart to grab each one", () => {
    for (const last of [91, 95, 100, 105, 109.5]) {
      const { entry, stop, target } = defaultLevels(last, MIN, MAX, HEIGHT, PAD);
      expect(gap(entry, stop), `last ${last}`).toBeGreaterThanOrEqual(50);
      expect(gap(entry, target), `last ${last}`).toBeGreaterThanOrEqual(50);
      expect(gap(stop, target), `last ${last}`).toBeGreaterThanOrEqual(50);
      for (const price of [entry, stop, target]) {
        expect(price).toBeGreaterThanOrEqual(MIN);
        expect(price).toBeLessThanOrEqual(MAX);
      }
    }
  });

  it("starts as a buy plan, with the stop below the entry and the target above", () => {
    const { entry, stop, target } = defaultLevels(100, MIN, MAX, HEIGHT, PAD);
    expect(stop).toBeLessThan(entry);
    expect(target).toBeGreaterThan(entry);
  });
});

describe("defaultZone", () => {
  it("is tall enough that both edges can be grabbed", () => {
    for (const centre of [90.5, 100, 109.5]) {
      const zone = defaultZone(centre, MIN, MAX, HEIGHT, PAD);
      expect(gap(zone.top, zone.bottom)).toBeGreaterThanOrEqual(50);
      expect(zone.bottom).toBeGreaterThanOrEqual(MIN);
      expect(zone.top).toBeLessThanOrEqual(MAX);
    }
  });
});

describe("handleHitRects", () => {
  it("never lets the two edge handles overlap, however close they are", () => {
    for (const [top, bottom] of [
      [100, 110],
      [100, 104],
      [100, 100.5],
    ]) {
      const { top: a, bottom: b } = handleHitRects(top, bottom, 44);
      expect(a.y + a.height).toBeLessThanOrEqual(b.y);
    }
  });

  it("keeps a full-size hit area when the edges are far apart", () => {
    const { top, bottom } = handleHitRects(100, 200, 44);
    expect(top.height).toBe(44);
    expect(bottom.height).toBe(44);
  });
});
