"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { LeaderboardRow } from "@/lib/profile/leaderboard";
export default function LeaderboardPage() {
  const [mode, setMode] = useState("today");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [message, setMessage] = useState("Ladataan…");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/leaderboard?mode=${mode}`, { cache: "no-store", signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok || data.unavailable) throw new Error("Tulostaulu ei ole juuri nyt käytettävissä.");
      setRows(data.rows); setMessage(data.rows.length ? "" : "Ei vielä julkaistuja tuloksia. Pelaa päivän visa ja valitse nimimerkki.");
    }).catch(error => { if (!controller.signal.aborted) { setRows([]); setMessage(error.message); } });
    return () => controller.abort();
  }, [mode]);
  return <div className="app-shell"><header className="game-header"><Link className="wordmark" href="/">MYLVISA·</Link><Link href="/profile">Oma profiili</Link></header><main id="main" className="game-main"><h1>Tulostaulu</h1><div className="account-tabs" aria-label="Ajanjakso">{[["today", "Tänään"], ["week", "Viimeiset 7 päivää"], ["all", "Kaikki ajat"]].map(([value, label]) => <button className="button button-ghost" aria-pressed={mode === value} key={value} onClick={() => { setRows([]); setMessage("Ladataan…"); setMode(value); }}>{label}</button>)}</div><p>{mode === "today" ? "Päivän pisteet / 700. Tasapisteillä sama sijoitus." : mode === "week" ? "Tämän ja kuuden edellisen Suomen kalenteripäivän yhteispisteet." : "Kertyneet yhteispisteet. Pelimäärä vaikuttaa yhteistulokseen."}</p>{message && <p role="status">{message}</p>}{rows.length > 0 && <div className="table-scroll"><table><thead><tr><th>Sija</th><th>Nimimerkki</th><th>Pisteet</th>{mode !== "today" && <><th>Pelejä</th><th>Keskiarvo</th><th>Paras</th></>}</tr></thead><tbody>{rows.map(row => <tr key={row.nickname}><td>{row.rank}</td><td>{row.nickname}</td><td>{row.score}{mode === "today" ? " / 700" : ""}</td>{mode !== "today" && <><td>{row.games}</td><td>{row.average}</td><td>{row.best}</td></>}</tr>)}</tbody></table></div>}<Link className="button button-primary" href="/">Päivän visaan →</Link></main></div>;
}
