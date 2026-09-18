import type { NextApiRequest, NextApiResponse } from "next";
import {
  type CryptoCandidate,
  type FMPCryptoQuote,
  scoreCrypto,
  cryptoTotalScore,
  classifyCrypto,
  filterAndSortCrypto,
  type CryptoSort,
} from "@/lib/cryptoScanner";

let cryptoCache: { data: CryptoCandidate[]; ts: number } | null = null;
const CACHE_MS = 2 * 60 * 1000;
const STALE_CACHE_MS = 60 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "FMP_API_KEY not configured" });

  const sortBy = (req.query.sortBy as CryptoSort) || "score";

  if (cryptoCache && Date.now() - cryptoCache.ts < CACHE_MS) {
    return res.status(200).json({
      candidates: filterAndSortCrypto(cryptoCache.data, sortBy),
      cached: true,
      timestamp: cryptoCache.ts,
    });
  }

  try {
    const url = `https://financialmodelingprep.com/api/v3/quotes/crypto?apikey=${apiKey}`;
    const fmpRes = await fetch(url);
    if (!fmpRes.ok) throw new Error(`FMP crypto: ${fmpRes.status}`);
    const allQuotes: FMPCryptoQuote[] = await fmpRes.json();

    const movers = allQuotes.filter((q) =>
      q.price > 0 &&
      q.changesPercentage >= 2 &&
      q.volume > 0 &&
      q.marketCap > 1_000_000 &&
      q.symbol.endsWith("USD")
    );

    const candidates: CryptoCandidate[] = movers
      .map((q) => {
        const breakdown = scoreCrypto(q);
        const score = cryptoTotalScore(breakdown);
        const vRatio = q.avgVolume > 0 ? Math.round((q.volume / q.avgVolume) * 10) / 10 : 0;

        const flags: string[] = [];
        if (q.changesPercentage > 50) flags.push("Extreme move — reversal risk");
        if (vRatio < 2) flags.push("Volume below 2x average");
        if (q.marketCap < 10_000_000) flags.push("Micro cap — high risk");
        if (q.volume * q.price < 500_000) flags.push("Low dollar volume — thin liquidity");

        return {
          symbol: q.symbol,
          name: q.name || q.symbol.replace("USD", ""),
          price: q.price,
          change: Math.round(q.changesPercentage * 100) / 100,
          changeAbs: Math.round(q.change * 100) / 100,
          volume: q.volume,
          avgVolume: q.avgVolume,
          volumeRatio: vRatio,
          marketCap: q.marketCap,
          dayHigh: q.dayHigh,
          dayLow: q.dayLow,
          priceAvg50: q.priceAvg50,
          priceAvg200: q.priceAvg200,
          score,
          scoreBreakdown: breakdown,
          status: classifyCrypto(score),
          flags,
          timestamp: Date.now(),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    cryptoCache = { data: candidates, ts: Date.now() };

    return res.status(200).json({
      candidates: filterAndSortCrypto(candidates, sortBy),
      cached: false,
      timestamp: Date.now(),
      totalScanned: allQuotes.length,
      movers: movers.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Crypto scanner failed";
    console.error("Crypto scanner error:", message);
    if (cryptoCache && Date.now() - cryptoCache.ts < STALE_CACHE_MS) {
      return res.status(200).json({
        candidates: filterAndSortCrypto(cryptoCache.data, sortBy),
        cached: true,
        stale: true,
        timestamp: cryptoCache.ts,
      });
    }
    return res.status(200).json({ candidates: [], cached: false, timestamp: Date.now() });
  }
}
