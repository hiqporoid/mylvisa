"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, MAX_ANSWER_LENGTH, ROUND_SECONDS } from "@/lib/quiz/catalog";
import { formatDate } from "@/lib/quiz/date";
import { remainingSeconds } from "@/lib/quiz/timer";
import { useQuiz } from "@/lib/client/use-quiz";
import { ShareResult } from "./share-result";

export function QuizApp({ initialDate, length }: { initialDate: string; length: number }) {
  const { game, phase, busy, error, notice, storageAvailable, roundClock, clockNow, start, submit, next, loadToday } = useQuiz();
  const [answer, setAnswer] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const date = game?.today ?? initialDate;
  const count = game?.length ?? length;
  const result = phase === "feedback" ? game?.results.at(-1) : undefined;
  const current = game?.current;
  const roundNumber = result ? game!.results.length : current?.number ?? 1;
  const remaining = roundClock ? remainingSeconds(roundClock, clockNow) : ROUND_SECONDS;
  const previewLeft = roundClock ? Math.max(0, Math.ceil((roundClock.previewUntil - clockNow) / 1000)) : 3;

  useEffect(() => {
    if (phase === "question") input.current?.focus();
    if (phase === "feedback" || phase === "complete") heading.current?.focus();
  }, [phase, current?.id]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(answer);
  }

  function advance() {
    setAnswer("");
    next();
  }

  return (
    <div className="app-shell">
      <header className="game-header">
        <Link className="wordmark" href="/" onClick={() => void loadToday()} aria-label="Mylvisa, etusivu">MYLVISA<span aria-hidden="true">·</span></Link>
        <div className="header-date"><time dateTime={date}>{formatDate(date, true)}</time></div>
      </header>
      <main id="main" className="game-main">
        {notice && <p className="notice" role="status">{notice}</p>}
        {!storageAvailable && <p className="notice" role="status">Selain ei salli tallentamista. Tulos säilyy vain tämän istunnon ajan.</p>}
        {error && <div className="error-notice" role="alert"><p>{error}</p><button className="button button-ghost" onClick={() => void loadToday()} disabled={busy}>Yritä uudelleen</button></div>}

        {phase === "home" && (
          <section className="home-screen" aria-labelledby="home-title">
            <p className="kicker">PÄIVÄN VISA</p>
            <h1 id="home-title">Nimeä oikea.<br /><em>Löydä harvinainen.</em></h1>
            <p className="home-lead">Oikeita vastauksia on monta. Mitä harvinaisemman keksit, sitä enemmän pisteitä saat.</p>
            <div className="home-meta"><span>7 kysymystä</span><span>25 sekuntia / kysymys</span><span>Sama visa kaikille</span></div>
            <button className="button button-primary button-large" onClick={() => void start()} disabled={busy || !game}>Aloita <span aria-hidden="true">→</span></button>
            <p className="home-foot">Seuraava visa avautuu keskiyöllä Suomen aikaa.</p>
          </section>
        )}

        {(phase === "preview" || phase === "question") && game && current && (
          <section className="round-screen" aria-labelledby="question-heading">
            <div className="round-bar"><span>{String(roundNumber).padStart(2, "0")} / {count}</span><span>{game.results.reduce((sum, item) => sum + item.points, 0)} p</span></div>
            <div className="round-progress" aria-hidden="true"><span style={{ width: `${(game.results.length / count) * 100}%` }} /></div>
            <div className="question-content">
              <p className="category-label">{CATEGORIES[current.category]}</p>
              <h1 ref={heading} tabIndex={-1} id="question-heading">{current.prompt}</h1>
              {phase === "preview" ? (
                <div className="preview-message" role="status"><span className="preview-number">{previewLeft}</span><span>Lue kysymys rauhassa</span></div>
              ) : (
                <form className="answer-form" onSubmit={onSubmit}>
                  <div className={`timer ${remaining <= 5 ? "timer-warning" : ""}`} role="timer" aria-live="polite" aria-label={`${remaining} sekuntia jäljellä`}>
                    <span className="timer-ring" aria-hidden="true">
                      <svg viewBox="0 0 40 40"><circle className="timer-ring-track" cx="20" cy="20" r="17" /><circle className="timer-ring-progress" cx="20" cy="20" r="17" style={{ strokeDashoffset: `${106.8 * (1 - remaining / ROUND_SECONDS)}` }} /></svg>
                      <b>{remaining}</b>
                    </span>
                    <small>sek</small>
                  </div>
                  <label htmlFor="answer">Vastauksesi</label>
                  <input ref={input} id="answer" value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={MAX_ANSWER_LENGTH} autoComplete="off" autoCapitalize="sentences" spellCheck={false} placeholder="Kirjoita yksi vastaus" disabled={busy} />
                  <p className="input-note">Yksi hyväksytty vastaus riittää. Kirjainkoolla ei ole väliä.</p>
                  <div className="answer-actions"><button className="button button-primary" disabled={busy || !answer.trim()}>Lukitse <span aria-hidden="true">→</span></button><button type="button" className="button button-ghost" onClick={() => void submit("")} disabled={busy}>Ohita</button></div>
                </form>
              )}
            </div>
          </section>
        )}

        {phase === "feedback" && game && result && (
          <section className={`feedback-screen ${result.accepted ? "is-accepted" : "is-missed"}`} aria-labelledby="feedback-heading">
            <p className="feedback-status" id="feedback-heading">{result.accepted ? "Hyväksytty" : result.answer ? "Ei hyväksytty" : "Aika loppui"}</p>
            {result.accepted && <p className="feedback-answer">{result.canonicalAnswer}</p>}
            <div className="feedback-score"><strong>{result.points}</strong><span>p</span></div>
            {result.accepted && <p className="feedback-tier">{result.tier}</p>}
            {result.accepted && result.explanation && <p className="feedback-explanation">{result.explanation}</p>}
            <button className="button button-primary button-large" onClick={advance}>{roundNumber === count ? "Katso tulos" : "Seuraava"} <span aria-hidden="true">→</span></button>
          </section>
        )}

        {phase === "complete" && game?.summary && (
          <section className="result-screen" aria-labelledby="result-heading">
            <p className="kicker">MYLVISA · {formatDate(game.date)}</p>
            <h1 ref={heading} tabIndex={-1} id="result-heading">Päivän tulos</h1>
            <div className="total-score"><strong>{game.summary.points}</strong><span>/ {game.summary.maxPoints}</span></div>
            <p className="result-count">{game.summary.correct} / {game.length} vastausta hyväksyttiin</p>
            <ol className="result-list">{game.results.map((item, index) => <li key={`${item.id}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><span className={item.accepted ? "result-tier" : "result-muted"}>{item.accepted ? item.tier : "Ei osumaa"}</span><strong>{item.points} p</strong></li>)}</ol>
            <ShareResult game={game} />
            <p className="result-next">Huomenna uusi joukko. Sama lähtöviiva kaikille.</p>
          </section>
        )}

        <p className="privacy-note">Vastaukset tarkistetaan palvelimella. Hyväksyttyjen vastausten listaa ei lähetetä selaimeen.</p>
      </main>
    </div>
  );
}
