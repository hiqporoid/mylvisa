"use client";
import { createBrowserClient } from "@supabase/ssr";
export function browserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? createBrowserClient(url, key) : null;
}
let initializing: Promise<boolean> | undefined;
export function ensureIdentity() {
  if (initializing) return initializing;
  initializing = (async () => {
    const client = browserSupabase();
    if (!client) return false;
    const initialize = async () => {
      const { data, error } = await client.auth.getUser();
      if (data.user) return true;
      // A network error must not replace an existing identity.
      const session = await client.auth.getSession();
      if (session.data.session || (error && error.name !== "AuthSessionMissingError")) return false;
      const signed = await client.auth.signInAnonymously();
      return !signed.error;
    };
    return navigator.locks ? navigator.locks.request("mylvisa-identity", initialize) : initialize();
  })().catch(() => false).finally(() => { initializing = undefined; });
  return initializing;
}
