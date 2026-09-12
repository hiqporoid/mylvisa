import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await (await serverSupabase()).auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(new URL("/profile?saved=1", url.origin));
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }
  const response = NextResponse.redirect(new URL("/profile?auth_error=1", url.origin));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
