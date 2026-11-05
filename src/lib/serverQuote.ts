// Server-side quote for honest paper fills: a fresh price from the server at
// placement time, so a spoofed client price can never set the fill.

import { getInstrument } from "@/config/instruments";

export interface ServerQuote {
  price: number;
  ts: number; // ms epoch when fetched
}

async function fmpQuote(feedSymbol: string): Promise<ServerQuote | null> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(feedSymbol)}&apikey=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const body = await r.json();
    const price = Number(Array.isArray(body) ? body[0]?.price : NaN);
    if (!price || price <= 0) return null;
    return { price, ts: Date.now() };
  } catch {
    return null;
  }
}

/** Older stock positions can still be priced here so members can close them. */
async function finnhubQuote(sym: string): Promise<ServerQuote | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;
  if (!/^[A-Z0-9]{1,10}$/.test(sym)) return null;
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const d = await r.json();
    const price = Number(d?.c);
    if (!price || price <= 0) return null;
    return { price, ts: Date.now() };
  } catch {
    return null;
  }
}

export async function getServerQuote(ticker: string): Promise<ServerQuote | null> {
  const sym = (ticker || "").toUpperCase().trim();
  const instrument = getInstrument(sym);
  return instrument ? fmpQuote(instrument.feedSymbol) : finnhubQuote(sym);
}
