import { helsinkiDate } from "@/lib/quiz/date";
import { GameError, play } from "@/lib/server/game";
import { backendConfigured } from "@/lib/supabase/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Origin",
};
function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers });
}
export async function GET() {
  try {
    const lobby = play({ date: helsinkiDate(), mode: "daily", answers: [] });
    if (backendConfigured()) lobby.current = null;
    return json({ ...lobby, supportsPersistence: backendConfigured(), persistence: "local" });
  } catch {
    return json(
      {
        code: "UNAVAILABLE",
        error: "Visan lataus ei onnistunut. Yritä pian uudelleen.",
      },
      503,
    );
  }
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  // Next.js can reconstruct request.url with an internal hostname. Compare with
  // the actual incoming Host; browser scripts cannot override that header.
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  const protocol = request.headers.get("x-forwarded-proto") === "https" ? "https:" : url.protocol;
  const expectedOrigin = `${protocol}//${host}`;
  if (
    (origin && origin !== expectedOrigin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return json({ code: "FORBIDDEN", error: "Pyyntö ei ole sallittu." }, 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json(
      { code: "INVALID_REQUEST", error: "Virheellinen tietomuoto." },
      415,
    );
  // Count streamed bytes too; Content-Length is untrusted and can be absent.
  const reader = request.body?.getReader();
  if (!reader)
    return json({ code: "INVALID_REQUEST", error: "Vastaus puuttuu." }, 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24_000) {
        await reader.cancel();
        return json(
          { code: "TOO_LARGE", error: "Vastaus on liian pitkä." },
          413,
        );
      }
      chunks.push(value);
    }
    let input: unknown;
    try {
      input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return json(
        { code: "INVALID_REQUEST", error: "Virheellinen tietomuoto." },
        400,
      );
    }
    if (backendConfigured() && (input as { mode?: string })?.mode !== "practice")
      return json({ code: "CONNECTED_REQUIRED", error: "Päivän peli tarvitsee tallennusyhteyden. Yritä uudelleen; aiempia tuloksia ei poisteta." }, 503);
    return json(play(input));
  } catch (error) {
    if (error instanceof GameError)
      return json(
        { code: error.code, error: error.message, today: helsinkiDate() },
        error.status,
      );
    return json(
      {
        code: "UNAVAILABLE",
        error: "Vastauksen tarkistus ei onnistunut. Yritä uudelleen.",
      },
      503,
    );
  }
}
