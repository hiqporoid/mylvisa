import "server-only";
import { GameError } from "./game";
export function privateJson(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie, Origin" } });
}
export async function readMutation(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  const protocol = request.headers.get("x-forwarded-proto") === "https" ? "https:" : url.protocol;
  if (request.headers.get("origin") !== `${protocol}//${host}` || request.headers.get("sec-fetch-site") === "cross-site")
    throw new GameError("FORBIDDEN", 403, "Pyyntö ei ole sallittu.");
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new GameError("INVALID_REQUEST", 415, "Virheellinen tietomuoto.");
  const reader = request.body?.getReader();
  if (!reader) throw new GameError("INVALID_REQUEST", 400, "Pyyntö puuttuu.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2048) { await reader.cancel(); throw new GameError("TOO_LARGE", 413, "Pyyntö on liian pitkä."); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown; }
  catch { throw new GameError("INVALID_REQUEST", 400, "Virheellinen tietomuoto."); }
}
export function apiFailure(error: unknown) {
  return error instanceof GameError ? privateJson({ error: error.message, code: error.code }, error.status) : privateJson({ error: "Yhteys tallennukseen ei onnistu. Yritä uudelleen.", code: "UNAVAILABLE" }, 503);
}
