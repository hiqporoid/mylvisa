import { z } from "zod";
import { identity } from "@/lib/server/connected";
import { adminSupabase } from "@/lib/supabase/server";
import { apiFailure, privateJson, readMutation } from "@/lib/server/http";
import { validateNickname } from "@/lib/profile/nickname";
import { GameError } from "@/lib/server/game";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await identity();
    const db = adminSupabase();
    const profile = await db.from("profiles").select("nickname").eq("user_id", user.id).maybeSingle();
    const history = await db.from("daily_runs").select("quiz_date,total_score,accepted_count,status").eq("user_id", user.id).order("quiz_date", { ascending: false }).limit(60);
    if (profile.error || history.error) throw profile.error ?? history.error;
    return privateJson({ nickname: profile.data?.nickname ?? null, anonymous: Boolean(user.is_anonymous), history: history.data });
  } catch (error) { return apiFailure(error); }
}
export async function POST(request: Request) {
  try {
    const body = z.strictObject({ nickname: z.string().max(80) }).safeParse(await readMutation(request));
    if (!body.success) throw new GameError("INVALID_REQUEST", 400, "Virheellinen nimimerkki.");
    let nickname: string;
    try { nickname = validateNickname(body.data.nickname).nickname; }
    catch (error) { throw new GameError("NICKNAME_INVALID", 400, (error as Error).message); }
    const user = await identity();
    const result = await adminSupabase().rpc("mylvisa_set_nickname", { owner_id: user.id, new_nickname: nickname });
    if (result.error?.code === "23505") throw new GameError("NICKNAME_TAKEN", 409, "Nimimerkki on jo käytössä.");
    if (result.error?.message.includes("nickname_rate_limit")) throw new GameError("RATE_LIMIT", 429, "Nimimerkkiä voi vaihtaa kerran vuorokaudessa.");
    if (result.error) throw result.error;
    return privateJson({ nickname });
  } catch (error) { return apiFailure(error); }
}
