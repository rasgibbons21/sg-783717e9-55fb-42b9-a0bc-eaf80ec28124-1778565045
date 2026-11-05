import { describe, expect, it } from "vitest";
import { isDefinitelySignedOut } from "./authState";

describe("isDefinitelySignedOut", () => {
  it("trusts a clear answer from the auth server", () => {
    expect(isDefinitelySignedOut({ name: "AuthSessionMissingError" })).toBe(true);
    expect(isDefinitelySignedOut({ name: "AuthApiError", status: 401 })).toBe(true);
    expect(isDefinitelySignedOut({ name: "AuthApiError", status: 403 })).toBe(true);
  });

  it("does not sign a member out over a network problem", () => {
    expect(isDefinitelySignedOut({ name: "AuthRetryableFetchError", status: 0 })).toBe(false);
    expect(isDefinitelySignedOut({ name: "AuthRetryableFetchError", status: 503 })).toBe(false);
    expect(isDefinitelySignedOut(new TypeError("Failed to fetch"))).toBe(false);
  });
});
