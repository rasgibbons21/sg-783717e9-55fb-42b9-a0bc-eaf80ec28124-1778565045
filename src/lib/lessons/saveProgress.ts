import { practiceFetch } from "@/lib/practice/api";

type Post = (path: string, options: RequestInit) => Promise<{ ok: boolean; status: number; data: { isNew?: boolean; error?: string } }>;

const PENDING_KEY = "bloom-pending-completions";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface SaveResult {
  saved: boolean;
  isNew: boolean;
}

/** Records a finished lesson through the server. Repeating a lesson can never earn extra blooms. */
export async function completeLesson(
  slug: string,
  score: number,
  post: Post = practiceFetch,
  retries = 2,
  retryDelayMs = 800,
  total?: number,
): Promise<SaveResult> {
  const body = total === undefined ? { slug, score } : { slug, score, total };
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const { ok, data } = await post("/api/lessons/complete", { method: "POST", body: JSON.stringify(body) });
    if (ok) return { saved: true, isNew: data.isNew === true };
    if (attempt < retries) await wait(retryDelayMs);
  }
  return { saved: false, isNew: false };
}

/** Older versions stored just the score; newer ones store the score with the test total. */
type Pending = Record<string, number | { score: number; total: number }>;

function readPending(): Pending {
  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writePending(pending: Pending): void {
  try {
    if (Object.keys(pending).length === 0) localStorage.removeItem(PENDING_KEY);
    else localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // Private browsing can block storage. The save on the completion screen still runs.
  }
}

/** Remembers a finished lesson until the server confirms it, so a lost connection can't lose it. */
export function queueCompletion(slug: string, score: number, total?: number): void {
  writePending({ ...readPending(), [slug]: total === undefined ? score : { score, total } });
}

export function clearCompletion(slug: string): void {
  const pending = readPending();
  delete pending[slug];
  writePending(pending);
}

/** Tries any lessons still waiting to be saved, and returns the ones that succeeded. */
export async function flushPendingCompletions(post: Post = practiceFetch, retries = 0, retryDelayMs = 0): Promise<string[]> {
  const saved: string[] = [];
  for (const [slug, entry] of Object.entries(readPending())) {
    const { score, total } = typeof entry === "number" ? { score: entry, total: undefined } : entry;
    const result = await completeLesson(slug, score, post, retries, retryDelayMs, total);
    if (result.saved) {
      clearCompletion(slug);
      saved.push(slug);
    }
  }
  return saved;
}
