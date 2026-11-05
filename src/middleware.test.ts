import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

const request = (host: string, path: string) =>
  new NextRequest(`https://${host}${path}`, { headers: { host } });

describe("middleware", () => {
  it("sends the old academy subdomain to the lessons", () => {
    const response = middleware(request("academy.shebloomswealth.app", "/patterns"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://shebloomswealth.app/lessons");
  });

  it("leaves the main site alone", () => {
    const response = middleware(request("shebloomswealth.app", "/lessons"));
    expect(response.headers.get("location")).toBeNull();
  });
});
