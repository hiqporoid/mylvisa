"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, MAX_ANSWER_LENGTH, ROUND_SECONDS, FIRST_QUIZ_DATE } from "@/lib/quiz/catalog";
import { addDays, formatDate } from "@/lib/quiz/date";
import { MAX_MYLV, mylvFromPoints, mylvintaMilestone } from "@/lib/quiz/progression";
import { remainingSeconds } from "@/lib/quiz/timer";
import { useQuiz } from "@/lib/client/use-quiz";
import { MylvintaWave, AnimatedNumber } from "./mylvinta-wave";
import { ProfileLink } from "./profile-link";
import { ShareResult } from "./share-result";

function outcomeLabel(outcome: string) {
  if (outcome === "timeout") return "Aika loppui";
  if (outcome === "skipped") return "Ohitettu";
  return outcome === "accepted" ? "Hyväksytty" : "Ei osumaa";
}

export function QuizApp({ initialDate, length }: { initialDate: string; length: number }) {
  const { game, phase, busy, error, notice, storageAvailable, roundClock, clockNow, start, submit, confirm, skip, clearResolution, next, loadToday } = useQuiz();
  const [answer, setAnswer] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const count = game?.length ?? length;
  const result = (phase === "progression" || phase === "feedback") ? game?.results.at(-1) : undefined;
  const current = game?.current;
  const roundNumber = result ? game!.results.length : current?.number ?? 1;
  const totalPoints = game?.results.reduce((sum, item) => sum + item.points, 0) ?? 0;
  const remaining = roundClock ? remainingSeconds(roundClock, clockNow) : ROUND_SECONDS;
  const previewLeft = roundClock ? Math.max(0, Math.ceil((roundClock.previewUntil - clockNow) / 1000)) : 3;
  const confirmation = game?.resolution?.status === "confirm" ? game.resolution : null;
  const invalidMessage = game?.resolution?.status === "invalid" ? game.resolution.message : "";
  const isGameStage = phase === "preview" || phase === "question" || phase === "progression" || phase === "feedback";

  useEffect(() => {
    if (phase === "question") input.current?.focus();
    if (phase === "question" && confirmation) confirmButton.current?.focus();
    if (phase === "feedback" || phase === "complete") heading.current?.focus();
  }, [phase, current?.id, invalidMessage, confirmation]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmation) await confirm(confirmation.confirmationToken);
    else await submit(answer);
  }

  function editAnswer() {
    clearResolution();
    window.setTimeout(() => input.current?.focus(), 0);
  }

  function advance() {
    setAnswer("");
    clearResolution();
    void next();
  }

  return (
    <div className={`app-shell ${isGameStage ? "is-game-stage" : ""}`}>
      <header className="game-header">
        <Link className="wordmark" href="/" onClick={() => void loadToday()} aria-label="Mylvisa, etusivu">MYLVISA<span aria-hidden="true">·</span></Link>
        {isGameStage && game ? (
          <div className="stage-hud" aria-label="Pelitilanne">
            <span>Kierros <b>{roundNumber} / {count}</b></span>
            <span><b><AnimatedNumber value={totalPoints} /></b> p</span>
            <span><b><AnimatedNumber value={mylvFromPoints(totalPoints)} /></b> MYLV</span>
          </div>
        ) : <nav className="account-tabs" aria-label="Pelaaja"><Link href="/leaderboard">Tulostaulu</Link><ProfileLink /></nav>}
      </header>
      <main id="main" className="game-main">
        {notice && !isGameStage && <p className="notice" role="status">{notice}</p>}
        {!storageAvailable && <p className="notice" role="status">Selain ei salli tallentamista. Tulos säilyy vain tämän istunnon ajan.</p>}
        {error && <div className="error-notice" role="alert"><p>{error}</p><button className="button button-ghost" onClick={() => void loadToday()} disabled={busy}>Yritä uudelleen</button></div>}

        {phase === "home" && (
          <section className="home-screen" aria-labelledby="home-title">
            <p className="kicker">PÄIVÄN VISA · {formatDate(game?.today ?? initialDate, true)}</p>
            <h1 id="home-title">Nimeä oikea.<br /><em>Löydä harvinainen.</em></h1>
            <p className="home-lead">Oikeita vastauksia on monta. Mitä harvinaisemman keksit, sitä enemmän pisteitä ja mylvintää saat.</p>
            <div className="home-meta"><span>7 kysymystä</span><span>25 sekuntia / kysymys</span><span>0–7000 MYLV</span></div>
            <button className="button button-primary button-large" onClick={() => void start()} disabled={busy || !game}>Aloita <span aria-hidden="true">→</span></button>
            {error && game && game.today > FIRST_QUIZ_DATE && <button className="button button-ghost" onClick={() => void start("practice", addDays(game.today, -1))} disabled={busy}>Pelaa edellispäivän harjoitus</button>}
            <p className="home-foot">Seuraava visa avautuu keskiyöllä Suomen aikaa.</p>
          </section>
        )}

        {(phase === "preview" || phase === "question") && game && current && (
          <section className="round-screen" aria-labelledby="question-heading">
            <div className="question-content">
              <p className="category-label">{CATEGORIES[current.category]}</p>
              <h1 ref={heading} tabIndex={-1} id="question-heading">{current.prompt}</h1>
            </div>
            <MylvintaWave points={totalPoints} />
            {phase === "preview" ? (
              <div className="interaction-dock preview-dock" role="status"><span className="preview-number">{previewLeft}</span><span><b>Lue kysymys rauhassa</b><small>Vastausaika alkaa automaattisesti.</small></span></div>
            ) : (
              <form className="interaction-dock answer-form" onSubmit={onSubmit}>
                <div className={`timer ${remaining <= 5 ? "timer-warning" : ""}`} role="timer" aria-live="off" aria-label={`${remaining} sekuntia jäljellä`}>
                  <span className="timer-ring" aria-hidden="true">
                    <svg viewBox="0 0 40 40"><circle className="timer-ring-track" cx="20" cy="20" r="17" /><circle className="timer-ring-progress" cx="20" cy="20" r="17" style={{ strokeDashoffset: `${106.8 * (1 - remaining / ROUND_SECONDS)}` }} /></svg>
                    <b>{remaining}</b>
                  </span><small>sek</small>
                </div>
                {confirmation ? (
                  <div className="confirmation-panel" aria-live="polite">
                    <span>Tarkoititko tätä?</span>
                    <strong>{confirmation.canonicalAnswer}</strong>
                    <div className="answer-actions"><button ref={confirmButton} className="button button-primary" disabled={busy}>Hyväksy vastaus</button><button type="button" className="button button-ghost" onClick={editAnswer} disabled={busy}>Muokkaa</button></div>
                  </div>
                ) : (
                  <div className="answer-entry">
                    <label htmlFor="answer">Vastauksesi</label>
                    <input ref={input} id="answer" value={answer} onChange={(event) => { setAnswer(event.target.value); if (game.resolution) clearResolution(); }} maxLength={MAX_ANSWER_LENGTH} autoComplete="off" autoCapitalize="sentences" spellCheck={false} placeholder="Kirjoita yksi vastaus" disabled={busy} />
                    <p className={`answer-message ${invalidMessage ? "is-invalid" : ""}`} aria-live="polite">{invalidMessage || "Enter tarkistaa vastauksen. Virheellinen yritys ei päätä kierrosta."}</p>
                    <div className="answer-actions"><button className="button button-primary" disabled={busy || !answer.trim()}>Tarkista <span aria-hidden="true">→</span></button><button type="button" className="button button-ghost" onClick={() => void skip()} disabled={busy}>Ohita</button></div>
                  </div>
                )}
              </form>
            )}
          </section>
        )}

        {(phase === "progression" || phase === "feedback") && game && result && (
          <section className={`round-screen feedback-screen ${result.accepted ? "is-accepted" : "is-missed"}`} aria-labelledby="feedback-heading">
            <div className="feedback-copy">
              <p className="feedback-status" id="feedback-heading">{outcomeLabel(result.outcome)}</p>
              {result.accepted && <p className="feedback-answer">{result.canonicalAnswer}</p>}
              <div className="feedback-score"><strong>{result.points}</strong><span>p</span></div>
              {result.accepted && <><p className="feedback-tier">{result.tier}</p><p className="feedback-mylv">+{mylvFromPoints(result.points)} MYLV</p></>}
            </div>
            <MylvintaWave points={totalPoints} pulsePoints={result.points} active={phase === "progression" && result.accepted} />
            <div className="interaction-dock result-dock">
              {phase === "progression" ? <p role="status">Mylvintäaalto etenee…</p> : <button className="button button-primary button-large" onClick={advance}>{roundNumber === count ? "Katso yhteenveto" : "Jatka mylvintää"} <span aria-hidden="true">→</span></button>}
            </div>
          </section>
        )}

        {phase === "complete" && game?.summary && (
          <section className="result-screen" aria-labelledby="result-heading">
            <p className="kicker">MYLVISA · {formatDate(game.date)}</p>
            <h1 ref={heading} tabIndex={-1} id="result-heading">Mylvintäsi tänään</h1>
            <div className="result-summary-grid">
              <div className="total-score"><strong>{game.summary.points}</strong><span>/ 700 p</span></div>
              <div className="mylv-total"><strong>{mylvFromPoints(game.summary.points)}</strong><span>/ {MAX_MYLV} MYLV</span></div>
            </div>
            <p className="result-milestone">{mylvintaMilestone(mylvFromPoints(game.summary.points)).label}</p>
            <p className="result-count">{game.summary.correct} / {game.length} vastausta hyväksyttiin{game.summary.placement ? ` · päivän sijoitus ${game.summary.placement}.` : ""}</p>
            <MylvintaWave points={game.summary.points} />
            <ol className="recap-list">
              {game.results.map((item, index) => (
                <li key={`${item.id}-${index}`}>
                  <span className="recap-number">{String(index + 1).padStart(2, "0")}</span>
                  <div className="recap-content">
                    <p>{item.prompt}</p>
                    {item.accepted ? (
                      <>
                        {item.canonicalized && item.originalAnswer && <small>Vastauksesi: {item.originalAnswer}</small>}
                        <strong>{item.canonicalized ? `Hyväksytty: ${item.canonicalAnswer}` : item.canonicalAnswer}</strong>
                        <span>{item.tier}</span>
                      </>
                    ) : <strong className="result-muted">{outcomeLabel(item.outcome)}</strong>}
                    {item.correctAnswers && (
                      <details className="recap-answers">
                        <summary>Kaikki hyväksytyt vastaukset ({item.correctAnswers.length})</summary>
                        <ol>
                          {item.correctAnswers.map(answer => <li key={answer.canonical}><span>{answer.canonical}{item.accepted && answer.canonical === item.canonicalAnswer && <small> · Sinun vastauksesi</small>}</span><strong>{answer.points} p</strong></li>)}
                        </ol>
                      </details>
                    )}
                  </div>
                  <strong className="recap-points">{item.points} p</strong>
                </li>
              ))}
            </ol>
            <ShareResult game={game} />
            <p className="result-next">Huomenna uusi joukko. Sama lähtöviiva kaikille.</p>
          </section>
        )}

        {!isGameStage && <p className="privacy-note">Vastaukset tarkistetaan palvelimella. Kaikki hyväksytyt vastaukset avautuvat tallennetun päivän pelin jälkeen.</p>}
      </main>
    </div>
  );
}
