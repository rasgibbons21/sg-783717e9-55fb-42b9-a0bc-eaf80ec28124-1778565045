/** True only when the auth server says there's no valid session. Network problems don't count. */
export function isDefinitelySignedOut(error: { name?: string; status?: number } | null | undefined): boolean {
  if (!error) return false;
  if (error.name === "AuthSessionMissingError") return true;
  return error.status === 401 || error.status === 403;
}
