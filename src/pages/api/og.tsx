import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = { runtime: "edge" };

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Radar";
  const subtitle = searchParams.get("subtitle") || "Stock Screener & Trade Alerts";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #070B12 0%, #0D1B2A 50%, #16264A 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(39,183,200,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 100,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(73,176,110,0.14) 0%, transparent 70%)",
          }}
        />

        {/* Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #27B7C8, #49B06E)",
            marginBottom: 32,
            fontSize: 42,
          }}
        >
          📡
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#F3EDE3",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 900,
            padding: "0 40px",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(243,237,227,0.55)",
            marginTop: 20,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          {subtitle}
        </div>

        {/* Brand bar */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#27B7C8",
              letterSpacing: "0.05em",
            }}
          >
            Radar
          </div>
          <div
            style={{
              fontSize: 16,
              color: "rgba(243,237,227,0.35)",
            }}
          >
            shebloomswealth.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
