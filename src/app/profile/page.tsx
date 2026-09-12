"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { browserSupabase, ensureIdentity } from "@/lib/supabase/browser";
type History = { quiz_date: string; total_score: number; accepted_count: number; status: string };
export default function ProfilePage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [otpType, setOtpType] = useState<"email" | "email_change" | null>(null);
  const [anonymous, setAnonymous] = useState(true);
  const [history, setHistory] = useState<History[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(true);
  async function refresh() {
    const response = await fetch("/api/account", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setNickname(data.nickname ?? ""); setAnonymous(data.anonymous); setHistory(data.history);
  }
  useEffect(() => {
    ensureIdentity().then(async ok => { if (!ok) throw new Error("Profiilin tallennus ei ole käytettävissä. Voit palata päivän visaan."); await refresh(); if (new URLSearchParams(location.search).has("auth_error")) setMessage("Linkki ei kelvannut tai on vanhentunut. Pyydä uusi linkki."); }).catch(error => setMessage(error.message)).finally(() => setBusy(false));
  }, []);
  async function perform(action: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : "Tallennus epäonnistui."); } finally { setBusy(false); }
  }
  async function saveNickname(event: React.FormEvent) {
    event.preventDefault();
    await perform(async () => {
      const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nickname }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setNickname(data.nickname); setMessage("Nimimerkki tallennettu. Valmiit tuloksesi näkyvät nyt tulostaululla.");
    });
  }
  async function emailFlow(existing: boolean) {
    await perform(async () => {
      const client = browserSupabase(); if (!client) throw new Error("Profiilin tallennus ei ole käytössä.");
      const redirect = `${location.origin}/auth/callback`;
      const result = existing ? await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: redirect } }) : await client.auth.updateUser({ email }, { emailRedirectTo: redirect });
      if (result.error) throw new Error("Sähköpostin lähetys ei onnistunut. Jos osoitteella on jo tili, käytä kirjautumista.");
      setOtpType(existing ? "email" : "email_change"); setMessage("Tarkista sähköpostisi. Avaa vahvistuslinkki tässä selaimessa tai syötä viestin koodi alle.");
    });
  }
  return <div className="app-shell"><header className="game-header"><Link className="wordmark" href="/">MYLVISA·</Link><Link href="/leaderboard">Tulostaulu</Link></header><main id="main" className="game-main account-page"><h1>Oma profiili</h1><p>Nimimerkki näkyy tulostaululla. Sähköpostiasi ei julkaista.</p><form onSubmit={saveNickname}><label htmlFor="nickname">Nimimerkki</label><input id="nickname" value={nickname} onChange={event => setNickname(event.target.value)} maxLength={20} autoComplete="nickname" /><p>3–20 merkkiä. Voit vaihtaa nimimerkkiä kerran vuorokaudessa.</p><button className="button button-primary" disabled={busy}>Tallenna nimimerkki</button></form><h2>{anonymous ? "Tallenna profiilisi" : "Profiilisi on tallennettu"}</h2><p>Lisää sähköpostisi, niin voit käyttää samaa nimimerkkiä ja pelihistoriaa myös toisella laitteella.</p><form onSubmit={event => { event.preventDefault(); void emailFlow(!anonymous); }}><label htmlFor="email">Sähköpostiosoite</label><input id="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /><div className="account-tabs">{anonymous && <button className="button button-primary" disabled={busy}>Lähetä vahvistuslinkki</button>}<button type={anonymous ? "button" : "submit"} className="button button-ghost" disabled={busy || !email.includes("@")} onClick={anonymous ? () => void emailFlow(true) : undefined}>Kirjaudu olemassa olevaan profiiliin</button></div></form><p className="privacy-note">Olemassa olevaan profiiliin kirjautuminen avaa sen historian. Tämän selaimen erillistä vierasprofiilia ei yhdistetä automaattisesti.</p>{otpType && <form onSubmit={event => { event.preventDefault(); void perform(async () => { const result = await browserSupabase()!.auth.verifyOtp({ email, token, type: otpType }); if (result.error) throw new Error("Koodi ei kelpaa tai on vanhentunut."); setOtpType(null); await refresh(); setMessage("Profiili vahvistettu."); }); }}><label htmlFor="otp">Sähköpostin koodi</label><input id="otp" autoComplete="one-time-code" inputMode="numeric" value={token} onChange={event => setToken(event.target.value)} /><button className="button button-primary" disabled={busy}>Vahvista</button></form>}{message && <p role="status" className="notice">{message}</p>}<h2>Pelihistoria</h2>{history.length ? <ul className="result-list">{history.map(run => <li key={run.quiz_date}><span>{run.quiz_date}</span><span>{run.status === "completed" ? `${run.total_score} / 700` : "Kesken"}</span></li>)}</ul> : <p>Ei vielä tallennettuja pelejä.</p>}<Link className="button button-primary" href="/">Päivän visaan →</Link></main></div>;
}
