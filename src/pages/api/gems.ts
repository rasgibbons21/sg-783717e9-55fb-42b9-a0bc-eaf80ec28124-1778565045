import type { NextApiRequest, NextApiResponse } from "next";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { getUserGems } from "@/lib/gems";

// Returns the current user's derived gem total + breakdown.
// Gated to any logged-in user (Learn gems exist for free users too, not just Pro).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  try {
    const breakdown = await getUserGems(auth.user!.id);
    return res.status(200).json(breakdown);
  } catch (error: unknown) {
    console.error("Gems route error:", error);
    return res.status(500).json({ error: (error as Error).message || String(error) });
  }
}
