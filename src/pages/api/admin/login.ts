import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (password === adminPassword) {
    return res.status(200).json({ authenticated: true });
  }

  return res.status(401).json({ authenticated: false, error: "Incorrect password" });
}