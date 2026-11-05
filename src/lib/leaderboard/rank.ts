/** A public name: the one a member chose, or their first name. Never a full name. */
export function displayName(profile: { challenge_name?: string | null; full_name?: string | null }): string {
  const chosen = profile.challenge_name?.trim();
  if (chosen) return chosen;
  const first = profile.full_name?.trim().split(/\s+/)[0];
  return first || "Member";
}

/** Sorts highest first, leaves out hidden members, and gives tied members the same rank. */
export function rankRows<T>(
  rows: T[],
  score: (row: T) => number,
  hiddenIds: Set<string>,
  getId: (row: T) => string,
): (T & { rank: number })[] {
  const sorted = rows.filter((row) => !hiddenIds.has(getId(row))).sort((a, b) => score(b) - score(a));
  let rank = 0;
  return sorted.map((row, index) => {
    if (index === 0 || score(row) !== score(sorted[index - 1])) rank = index + 1;
    return { ...row, rank };
  });
}

/** How much further to the next place up. Empty for first place and anyone not on the board. */
export function gapToNext<T extends { user_id: string }>(rows: T[], myId: string, score: (row: T) => number): number | null {
  const mine = rows.find((row) => row.user_id === myId);
  if (!mine) return null;
  const above = rows.filter((row) => score(row) > score(mine));
  if (above.length === 0) return null;
  const nearest = Math.min(...above.map(score));
  return Math.round((nearest - score(mine)) * 100) / 100;
}
