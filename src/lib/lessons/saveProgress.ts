import { practiceFetch } from "@/lib/practice/api";

type Post = (path: string, options: RequestInit) => Promise<{ ok: boolean; status: number; data: { isNew?: boolean; error?: string } }>;

const PENDING_KEY = "bloom-pending-completions";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface SaveResult {
  saved: boolean;
  isNew: boolean;
}

/** Records a finished lesson through the server. Repeating a lesson can never earn extra blooms. */
export async function completeLesson(slug: string, score: number, post: Post = practiceFetch, retries = 2, retryDelayMs = 800): Promise<SaveResult> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const { ok, data } = await post("/api/lessons/complete", { method: "POST", body: JSON.stringify({ slug, score }) });
    if (ok) return { saved: true, isNew: data.isNew === true };
    if (attempt < retries) await wait(retryDelayMs);
  }
  return { saved: false, isNew: false };
}

function readPending(): Record<string, number> {
  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writePending(pending: Record<string, number>): void {
  try {
    if (Object.keys(pending).length === 0) localStorage.removeItem(PENDING_KEY);
    else localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // Private browsing can block storage. The save on the completion screen still runs.
  }
}

/** Remembers a finished lesson until the server confirms it, so a lost connection can't lose it. */
export function queueCompletion(slug: string, score: number): void {
  writePending({ ...readPending(), [slug]: score });
}

export function clearCompletion(slug: string): void {
  const pending = readPending();
  delete pending[slug];
  writePending(pending);
}

/** Tries any lessons still waiting to be saved, and returns the ones that succeeded. */
export async function flushPendingCompletions(post: Post = practiceFetch, retries = 0, retryDelayMs = 0): Promise<string[]> {
  const saved: string[] = [];
  for (const [slug, score] of Object.entries(readPending())) {
    const result = await completeLesson(slug, score, post, retries, retryDelayMs);
    if (result.saved) {
      clearCompletion(slug);
      saved.push(slug);
    }
  }
  return saved;
}
