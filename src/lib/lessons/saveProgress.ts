import type { SupabaseClient } from "@supabase/supabase-js";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Records a finished lesson. The unique member-and-lesson key means repeating a
 * lesson can never earn extra blooms. Returns false if every attempt failed.
 */
export async function completeLesson(
  client: SupabaseClient,
  userId: string,
  slug: string,
  score: number,
  retries = 2,
  retryDelayMs = 800,
): Promise<boolean> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const { error } = await client.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: slug,
        completed: true,
        completed_at: new Date().toISOString(),
        quiz_score: score,
        quiz_completed: true,
      },
      { onConflict: "user_id,lesson_id" },
    );
    if (!error) return true;
    if (attempt < retries) await wait(retryDelayMs);
  }
  return false;
}
