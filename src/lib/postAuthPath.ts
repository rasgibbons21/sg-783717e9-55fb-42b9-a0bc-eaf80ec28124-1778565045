export const FIRST_LESSON_PATH = "/lessons/what-is-gold-trading";

/** Only a plain lesson path may be used as a return address, so links can't send people off Bloom. */
const SAFE_RETURN = /^\/lessons(\/[a-z0-9-]+)?$/;

export function postAuthPath(
  profile: { onboarding_complete?: boolean | null } | null,
  returnTo?: string | null,
): string {
  if (returnTo && SAFE_RETURN.test(returnTo)) return returnTo;
  return profile?.onboarding_complete ? "/home" : FIRST_LESSON_PATH;
}
