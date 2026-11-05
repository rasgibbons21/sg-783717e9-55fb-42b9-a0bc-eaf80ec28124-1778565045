import { describe, expect, it } from "vitest";
import { displayName, gapToNext, rankRows } from "./rank";

interface Row {
  user_id: string;
  score: number;
}

const rows: Row[] = [
  { user_id: "a", score: 20 },
  { user_id: "b", score: 50 },
  { user_id: "c", score: -5 },
  { user_id: "d", score: 20 },
  { user_id: "e", score: 90 },
];
const score = (row: Row) => row.score;
const id = (row: Row) => row.user_id;

describe("displayName", () => {
  it("prefers the name a member chose", () => {
    expect(displayName({ challenge_name: "GoldenRose", full_name: "Ana Maria Lopez" })).toBe("GoldenRose");
  });

  it("shows only a first name, never a full name", () => {
    expect(displayName({ full_name: "Ana Maria Lopez" })).toBe("Ana");
    expect(displayName({ challenge_name: "  ", full_name: " Ana Lopez " })).toBe("Ana");
  });

  it("falls back kindly when there is no name", () => {
    expect(displayName({})).toBe("Member");
    expect(displayName({ full_name: "" })).toBe("Member");
  });
});

describe("rankRows", () => {
  it("sorts highest first and keeps negative totals listed last", () => {
    const ranked = rankRows(rows, score, new Set(), id);
    expect(ranked.map((r) => r.user_id)[0]).toBe("e");
    expect(ranked[ranked.length - 1]).toMatchObject({ user_id: "c", score: -5, rank: 5 });
  });

  it("gives tied members the same rank", () => {
    const ranked = rankRows(rows, score, new Set(), id);
    expect(ranked.filter((r) => r.score === 20).map((r) => r.rank)).toEqual([3, 3]);
  });

  it("removes hidden members and closes up the ranks", () => {
    const ranked = rankRows(rows, score, new Set(["e"]), id);
    expect(ranked.find((r) => r.user_id === "e")).toBeUndefined();
    expect(ranked[0]).toMatchObject({ user_id: "b", rank: 1 });
  });

  it("copes with an empty board", () => {
    expect(rankRows([], score, new Set(), id)).toEqual([]);
  });
});

describe("gapToNext", () => {
  const ranked = rankRows(rows, score, new Set(), id);

  it("shows how far it is to the next place", () => {
    expect(gapToNext(ranked, "b", score)).toBe(40);
    expect(gapToNext(ranked, "a", score)).toBe(30);
  });

  it("is empty for first place and for anyone not on the board", () => {
    expect(gapToNext(ranked, "e", score)).toBeNull();
    expect(gapToNext(ranked, "nobody", score)).toBeNull();
  });
});
