// Confirms the current FMP plan can price every Practice instrument.
// Usage: FMP_API_KEY=your-key node scripts/check-fmp-feed.mjs
const FEEDS = ["XAUUSD", "XAGUSD", "EURUSD", "GBPUSD", "USDJPY", "^DJI", "^GSPC"];

const key = process.env.FMP_API_KEY;
if (!key) {
  console.error("Please set FMP_API_KEY first.");
  process.exit(1);
}

let failures = 0;
for (const symbol of FEEDS) {
  const url = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
  try {
    const res = await fetch(url);
    const body = await res.json();
    const price = Array.isArray(body) ? Number(body[0]?.price) : NaN;
    if (price > 0) {
      console.log(`OK    ${symbol}: ${price}`);
    } else {
      failures += 1;
      console.log(`FAIL  ${symbol}: HTTP ${res.status}, no price returned`);
    }
  } catch (error) {
    failures += 1;
    console.log(`FAIL  ${symbol}: ${error.message}`);
  }
}

console.log(failures === 0 ? "\nAll instruments priced." : `\n${failures} instrument(s) could not be priced.`);
process.exit(failures === 0 ? 0 : 1);
