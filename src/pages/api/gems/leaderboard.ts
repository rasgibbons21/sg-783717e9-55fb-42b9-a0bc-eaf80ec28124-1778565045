import type { NextApiRequest, NextApiResponse } from "next";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { getLeaderboardView } from "@/lib/gems";

// Top-10 gems leaderboard + the caller's own ranked row (so they always see
// where they stand, even outside the top 10). Any logged-in user.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  try {
    const view = await getLeaderboardView(auth.user!.id, 10);
    return res.status(200).json(view);
  } catch (error: unknown) {
    console.error("Gems leaderboard route error:", error);
    return res.status(500).json({ error: (error as Error).message || String(error) });
  }
}
