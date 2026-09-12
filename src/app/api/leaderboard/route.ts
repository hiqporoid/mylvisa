import { backendConfigured, adminSupabase } from "@/lib/supabase/server";
import { helsinkiDate, addDays } from "@/lib/quiz/date";
import { leaderboardModes, publicLeaderboard } from "@/lib/profile/leaderboard";
import { apiFailure, privateJson } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!backendConfigured()) return privateJson({ rows: [], unavailable: true });
  const mode = new URL(request.url).searchParams.get("mode") ?? "today";
  if (!leaderboardModes.includes(mode as typeof leaderboardModes[number])) return privateJson({ error: "Tuntematon tulostaulu." }, 400);
  try {
    const today = helsinkiDate();
    const { data, error } = await adminSupabase().rpc("mylvisa_leaderboard", { first_date: mode === "all" ? "2026-09-01" : mode === "week" ? addDays(today, -6) : today, last_date: today });
    if (error) throw error;
    return privateJson({ rows: publicLeaderboard(data ?? []), unavailable: false });
  } catch (error) { return apiFailure(error); }
}
