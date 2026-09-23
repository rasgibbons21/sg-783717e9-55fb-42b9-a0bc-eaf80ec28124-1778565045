import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  const results: Record<string, unknown> = {
    fmpKeySet: !!fmpKey,
    finnhubKeySet: !!finnhubKey,
    fmpKeyPrefix: fmpKey ? fmpKey.slice(0, 4) + "..." : null,
  };

  // Test 1: FMP single quote
  if (fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/stable/quote?symbol=AAPL&apikey=${fmpKey}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const body = await r.text();
      results.fmpQuote = { status: r.status, ok: r.ok, body: body.slice(0, 300) };
    } catch (e: any) {
      results.fmpQuote = { error: e.message };
    }
  }

  // Test 2: FMP gainers (the one scanner uses)
  if (fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/stable/biggest-gainers?apikey=${fmpKey}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const body = await r.text();
      results.fmpGainers = { status: r.status, ok: r.ok, body: body.slice(0, 300) };
    } catch (e: any) {
      results.fmpGainers = { error: e.message };
    }
  }

  // Test 3: Finnhub quote
  if (finnhubKey) {
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${finnhubKey}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const body = await r.text();
      results.finnhubQuote = { status: r.status, ok: r.ok, body: body.slice(0, 300) };
    } catch (e: any) {
      results.finnhubQuote = { error: e.message };
    }
  }

  return res.status(200).json(results);
}
