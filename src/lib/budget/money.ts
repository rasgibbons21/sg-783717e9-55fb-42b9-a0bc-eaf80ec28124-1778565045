/** The largest amount Bloom accepts: one billion, in cents. */
export const MAX_CENTS = 100_000_000_000;

const GROUPED = /^\d{1,3}(,\d{3})+(\.\d{1,2})?$/;
const PLAIN = /^\d+(\.\d{1,2})?$/;

/**
 * Reads an amount typed the way people type it ("1,250.50", "$30", " 45.5 ") into whole cents.
 * Returns null for anything that isn't a plain, non-negative amount with at most two decimals.
 */
export function parseMoney(input: string): number | null {
  const cleaned = input.trim().replace(/^[^\d.,-]+/, "").trim();
  if (!GROUPED.test(cleaned) && !PLAIN.test(cleaned)) return null;
  const cents = Math.round(Number(cleaned.replace(/,/g, "")) * 100);
  if (!Number.isFinite(cents) || cents < 0 || cents > MAX_CENTS) return null;
  return cents;
}

export function formatMoney(cents: number, currency: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${currency} ${(cents / 100).toFixed(2)}`;
  }
}

const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  IE: "EUR",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  ZA: "ZAR",
  NG: "NGN",
  KE: "KES",
  GH: "GHS",
  IN: "INR",
  JM: "JMD",
  TT: "TTD",
};

/** Her likely currency from the country we see, falling back to US dollars. */
export function currencyForCountry(country: string | null | undefined): string {
  return (country && COUNTRY_CURRENCY[country.toUpperCase()]) || "USD";
}

/** A currency she typed herself under "Other": any three-letter code, such as PHP or MXN. */
export function customCurrency(input: string): string | null {
  const code = input.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : null;
}
