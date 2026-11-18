import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession: async () => ({ data: { session: null } }) } } }));

import { enableSavingsNotifications, urlBase64ToUint8Array } from "./push";

describe("push helpers", () => {
  it("decodes a base64url key", () => {
    expect(Array.from(urlBase64ToUint8Array("AQID_-8"))).toEqual([1, 2, 3, 255, 239]);
  });

  it("reports unsupported outside a browser", async () => {
    await expect(enableSavingsNotifications()).resolves.toBe("unsupported");
  });
});
