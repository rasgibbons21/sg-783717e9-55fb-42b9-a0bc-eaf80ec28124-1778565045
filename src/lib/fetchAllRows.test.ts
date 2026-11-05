import { describe, expect, it, vi } from "vitest";
import { fetchAllRows } from "./fetchAllRows";

describe("fetchAllRows", () => {
  it("keeps reading until a page comes back short", async () => {
    const pages = [[1, 2], [3, 4], [5]];
    const page = vi.fn(async (from: number, to: number) => {
      expect(to - from + 1).toBe(2);
      return { data: pages[from / 2], error: null };
    });
    await expect(fetchAllRows(page, 2)).resolves.toEqual([1, 2, 3, 4, 5]);
    expect(page).toHaveBeenCalledTimes(3);
  });

  it("reports a failed page instead of returning partial totals", async () => {
    const page = vi.fn(async () => ({ data: null, error: { message: "column does not exist" } }));
    await expect(fetchAllRows(page, 2)).rejects.toThrow("column does not exist");
  });
});
