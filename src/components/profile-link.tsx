"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { browserSupabase, ensureIdentity } from "@/lib/supabase/browser";

export function ProfileLink() {
  const [nickname, setNickname] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!browserSupabase()) return;
    void ensureIdentity().then(async ready => {
      if (!ready) return;
      const response = await fetch("/api/account", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (active && typeof data.nickname === "string") setNickname(data.nickname);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return <Link href="/profile">{nickname ? `Pelaaja: ${nickname}` : "Valitse nimimerkki"}</Link>;
}
