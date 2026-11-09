export interface ScoreRow {
  lesson_id: string;
  test_score: number | null;
  test_total: number | null;
}

/** Her lesson tests on Profile: the average first-try percentage, and her best score per lesson. */
export function testSummary(rows: ScoreRow[]): { averagePct: number | null; best: { slug: string; score: number; total: number }[] } {
  const best = rows
    .filter((row) => row.test_total !== null && row.test_total > 0 && row.test_score !== null)
    .map((row) => ({ slug: row.lesson_id, score: row.test_score as number, total: row.test_total as number }));
  if (best.length === 0) return { averagePct: null, best: [] };
  const averagePct = Math.round((best.reduce((sum, row) => sum + row.score / row.total, 0) / best.length) * 100);
  return { averagePct, best };
}
