import type { NextApiRequest, NextApiResponse } from "next";

/** The visitor's country from Vercel's edge, or null when it isn't known (such as in local development). */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const header = req.headers["x-vercel-ip-country"];
  const country = (Array.isArray(header) ? header[0] : header) || null;
  res.setHeader("Cache-Control", "private, max-age=3600");
  return res.status(200).json({ country });
}
