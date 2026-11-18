/** The group Bloom belongs to, shown in the footer to match the CinderVault Capital site's footer. */
export const GROUP_NAME = "CinderVault Enterprises Fintech Group";

/** CinderVault Capital's site, from NEXT_PUBLIC_CINDERVAULT_CAPITAL_URL. Only a plain https address is used. */
export function cinderVaultCapitalUrl(value: string | undefined = process.env.NEXT_PUBLIC_CINDERVAULT_CAPITAL_URL): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}
