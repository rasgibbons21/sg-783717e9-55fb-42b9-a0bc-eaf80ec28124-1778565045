import type { NextApiRequest, NextApiResponse } from "next";

const MAX_BODY_BYTES = 50 * 1024; // 50KB
const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_TURNS = 20;
const MAX_TURN_CHARS = 2000;
const MAX_COMPARE_ASSETS = 5;

export function rejectOversizedBody(req: NextApiRequest, res: NextApiResponse): boolean {
  const raw = JSON.stringify(req.body);
  if (raw && raw.length > MAX_BODY_BYTES) {
    res.status(400).json({ error: "Request body too large" });
    return true;
  }
  return false;
}

export function validateMessage(message: unknown): string | null {
  if (!message || typeof message !== "string") return null;
  return message.slice(0, MAX_MESSAGE_CHARS);
}

export type SanitizedTurn = { role: "user" | "assistant"; content: string };

export function sanitizeHistory(history: unknown): SanitizedTurn[] {
  if (!Array.isArray(history)) return [];

  const valid: SanitizedTurn[] = [];
  for (const turn of history) {
    if (!turn || typeof turn !== "object") continue;
    const role = (turn as Record<string, unknown>).role;
    const content = (turn as Record<string, unknown>).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;
    valid.push({ role, content: content.slice(0, MAX_TURN_CHARS) });
  }

  if (valid.length > MAX_HISTORY_TURNS) {
    return valid.slice(valid.length - MAX_HISTORY_TURNS);
  }
  return valid;
}

export function validateAssets(assets: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(assets)) {
    return { valid: false, error: "assets must be an array" };
  }
  if (assets.length < 2) {
    return { valid: false, error: "At least 2 assets required for comparison" };
  }
  if (assets.length > MAX_COMPARE_ASSETS) {
    return { valid: false, error: `Maximum ${MAX_COMPARE_ASSETS} assets per comparison` };
  }
  return { valid: true };
}
