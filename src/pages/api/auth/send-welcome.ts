import type { NextApiRequest, NextApiResponse } from "next";
import { sendWelcomeEmail } from "@/lib/resend";

const sent = new Set<string>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, name } = req.body;
  if (!email || typeof email !== "string") return res.status(400).json({ error: "Missing email" });

  const key = email.toLowerCase().trim();
  if (sent.has(key)) return res.status(200).json({ sent: true, cached: true });

  try {
    await sendWelcomeEmail(key, name || "");
    sent.add(key);
    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error("Welcome email failed:", err);
    return res.status(500).json({ error: "Failed to send" });
  }
}
