import type { NextApiRequest, NextApiResponse } from "next";

/** The public half of the push key, so the browser can subscribe. Null until push is configured. */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? null });
}
