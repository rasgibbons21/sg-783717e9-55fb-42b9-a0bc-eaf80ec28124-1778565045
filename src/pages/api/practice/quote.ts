import type { NextApiRequest, NextApiResponse } from "next";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { getServerQuote } from "@/lib/serverQuote";
import { isMarketOpen } from "@/lib/practice/marketHours";

const CACHE_MS = 10_000;
const cache = new Map<string, { price: number; ts: number }>();

/** A display price for the Practice screen. Fills always re-quote on the server. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const ticker = String(req.query.ticker ?? "").toUpperCase().trim();
  if (!ticker) return res.status(400).json({ error: "ticker required" });

  const cached = cache.get(ticker);
  const quote = cached && Date.now() - cached.ts < CACHE_MS ? cached : await getServerQuote(ticker);
  if (!quote) return res.status(502).json({ error: "We can't get a price just now. Please try again in a moment." });

  cache.set(ticker, quote);
  return res.status(200).json({ price: quote.price, marketOpen: isMarketOpen(ticker, new Date()) });
}
