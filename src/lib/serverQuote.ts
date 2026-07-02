// Server-side live quote for honest market-order fills in the Practice Trader.
// Hits the same upstream (Finnhub) the client proxy uses, but from the server
// at placement time — so fills use a fresh price, not the up-to-60s-stale client
// cache, and a spoofed client price can never set the fill.

export interface ServerQuote {
  price: number;
  ts: number; // ms epoch when fetched
}

export async function getServerQuote(ticker: string): Promise<ServerQuote | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;

  const sym = (ticker || "").toUpperCase().trim();
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
