import "server-only";
import { randomUUID } from "node:crypto";
import { backendConfigured, serverSupabase, adminSupabase } from "@/lib/supabase/server";
import { helsinkiDate } from "@/lib/quiz/date";
import { GameError } from "./game";
import { getDailyQuiz } from "./bank";
import type { Resolution } from "@/lib/quiz/contracts";
import { bankHash, resolveRunCommand, runCommand, runResponse, type Run } from "./run-engine";

export async function identity() {
  if (!backendConfigured()) throw new GameError("NOT_CONFIGURED", 503, "Tulostaulun tallennus ei ole käytössä.");
  const auth = await serverSupabase();
  const { data, error } = await auth.auth.getUser();
  if (error || !data.user) throw new GameError("AUTH_REQUIRED", 401, "Pelaajaprofiilin yhteys puuttuu. Päivitä sivu.");
  return data.user;
}
export async function connectedRun(input?: unknown) {
  const user = await identity();
  const db = adminSupabase();
  const now = new Date();
  const date = helsinkiDate(now);
  const selected = await db.from("daily_runs").select("*").eq("user_id", user.id).eq("quiz_date", date).maybeSingle();
  if (selected.error) throw selected.error;
  let run = selected.data as Run | null;
  const quiz = getDailyQuiz(date, run?.release_id);
  let resolution: Resolution | undefined;
  if (input !== undefined) {
    const parsed = runCommand.safeParse(input);
    if (!parsed.success) throw new GameError("INVALID_REQUEST", 400, "Pelin tiedot eivät kelpaa.");
    if (parsed.data.action === "start" && !run) {
      const initial: Run = {
        id: randomUUID(), user_id: user.id, quiz_date: date, release_id: quiz.releaseId, bank_hash: bankHash(quiz.questions),
        question_ids: quiz.questions.map(q => q.id), started_at: now.toISOString(), completed_at: null,
        round_started_at: now.toISOString(), current_round: 0, total_score: 0, accepted_count: 0, status: "answering", version: 0, rounds: [],
      };
      const insert = await db.from("daily_runs").insert(initial).select("*").single();
      if (insert.error?.code === "23505") {
        const existing = await db.from("daily_runs").select("*").eq("user_id", user.id).eq("quiz_date", date).single();
        if (existing.error) throw existing.error;
        run = existing.data as Run;
      } else if (insert.error) throw insert.error;
      else run = insert.data as Run;
    } else if (run && parsed.data.action !== "start") {
      const transition = resolveRunCommand(run, parsed.data, quiz.questions, now);
      const next = transition.run;
      resolution = transition.resolution;
      if (next.version !== run.version) {
        const saved = await db.rpc("mylvisa_commit_run", { run_id: run.id, owner_id: user.id, expected_version: run.version, next_state: next });
        if (saved.error) throw saved.error;
        run = saved.data as Run;
        if (run.version !== next.version) resolution = undefined;
      } else if (resolution) {
        // Invalid and confirm are intentionally ephemeral. Re-read after resolving so
        // a terminal commit from another tab always wins over this stale response.
        const latest = await db.from("daily_runs").select("*").eq("id", run.id).eq("user_id", user.id).single();
        if (latest.error) throw latest.error;
        const current = latest.data as Run;
        if (current.version !== run.version) resolution = undefined;
        run = current;
      }
    }
  }
  if (!run) return { available: true, game: null };
  if (run.release_id !== quiz.releaseId || run.bank_hash !== bankHash(quiz.questions)) throw new GameError("RELEASE_CHANGED", 409, "Pelin sisältö on päivittynyt. Vanhaa tulosta ei korvata.");
  const response = runResponse(run, quiz.questions, now, resolution);
  if (response.summary) {
    const [profile, leaderboard] = await Promise.all([
      db.from("profiles").select("nickname").eq("user_id", user.id).maybeSingle(),
      db.rpc("mylvisa_leaderboard", { first_date: date, last_date: date }),
    ]);
    const nickname = profile.data?.nickname;
    if (!profile.error && nickname && !leaderboard.error) {
      const ownRow = (leaderboard.data as { nickname: string; rank: number }[] | null)?.find((row) => row.nickname === nickname);
      if (ownRow) response.summary.placement = Number(ownRow.rank);
    }
  }
  return { available: true, game: response };
}
