export const leaderboardModes = ["today", "week", "all"] as const;
export type LeaderboardRow = { nickname: string; score: number; games: number; average: number; best: number; rank: number; accepted_count: number };
/** Explicit projection even when a database function returns extra columns later. */
export function publicLeaderboard(rows: Record<string, unknown>[]): LeaderboardRow[] {
  return rows.map(row => ({ nickname: String(row.nickname), score: Number(row.score), games: Number(row.games), average: Number(row.average), best: Number(row.best), rank: Number(row.rank), accepted_count: Number(row.accepted_count) }));
}
