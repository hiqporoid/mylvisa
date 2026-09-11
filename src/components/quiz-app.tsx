"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  FIRST_QUIZ_DATE,
  MAX_ANSWER_LENGTH,
} from "@/lib/quiz/catalog";
import { addDays, formatDate } from "@/lib/quiz/date";
import { useQuiz } from "@/lib/client/use-quiz";
import { ShareResult } from "./share-result";
import { Arrow, Spark } from "./brand";
export function QuizApp({
  initialDate,
  length,
}: {
  initialDate: string;
  length: number;
}) {
  const {
    game,
    phase,
    busy,
    error,
    notice,
    storageAvailable,
    start,
    submit,
    next,
    loadToday,
  } = useQuiz();
  const [answer, setAnswer] = useState("");
  const [archiveDate, setArchiveDate] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const date = game?.today ?? initialDate;
  const count = game?.length ?? length;
  const playing = phase === "question" || phase === "feedback";
  const feedback = phase === "feedback" ? game?.results.at(-1) : null;
  const number = feedback ? game!.results.length : (game?.current?.number ?? 1);
  const earliest =
    addDays(date, -30) < FIRST_QUIZ_DATE ? FIRST_QUIZ_DATE : addDays(date, -30);
  useEffect(() => {
    if (phase !== "home") heading.current?.focus();
  }, [phase, game?.current?.id]);
  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(answer);
  }
  function advance() {
    setAnswer("");
    next();
  }
  return (
    <>
      <header className="site-header">
        <Link
          className="brand"
          href="/"
          onClick={() => {
            setAnswer("");
            void loadToday();
          }}
          aria-label="Mylvisa, etusivu"
        >
          <Spark />
          mylvisa<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Päänavigaatio">
          <a href="#rules">Näin pelataan</a>
          <a href="#archive">
            Harjoittele <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>
      <main id="main">
        <div className="daily-line">
          <span>
            <span className="live-dot" /> JOKA PÄIVÄ JOTAIN UUTTA
          </span>
          <time dateTime={date}>{formatDate(date, true)}</time>
        </div>
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        {!storageAvailable && (
          <p className="notice" role="status">
            Selain ei salli tallentamista. Voit pelata, mutta tulos ja
            eteneminen katoavat, kun suljet tai päivität sivun.
          </p>
        )}
        {error && (
          <div className="error-notice" role="alert">
            <p>{error}</p>
            {!game && (
              <button
                className="button button-small"
                onClick={() => void loadToday()}
                disabled={busy}
              >
                Yritä uudelleen
              </button>
            )}
          </div>
        )}
        {phase === "home" && (
          <>
            <section className="hero" aria-labelledby="hero-title">
              <div className="hero-copy">
                <p className="eyebrow">PÄIVÄN VISA</p>
                <h1 id="hero-title">
                  Pieni visa.
                  <br />
                  <span>Avara maailma.</span>
                </h1>
                <p className="hero-description">
                  Seitsemän kysymystä. Tuttuja juttuja ja uusia oivalluksia.
                  Kuinka pitkälle uteliaisuutesi vie tänään?
                </p>
                <div className="hero-actions">
                  <button
                    className="button button-primary"
                    onClick={() => {
                      setAnswer("");
                      void start();
                    }}
                    disabled={busy || !game}
                  >
                    {busy ? "Ladataan visaa…" : "Aloita päivän visa"} <Arrow />
                  </button>
                  <span className="small muted">
                    Noin 5 minuuttia. Ei kiirettä.
                  </span>
                </div>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="orbit-label">UTELIAISUUDELLE EI OLE RAJOJA</div>
                <div className="seven-disc">
                  <span className="disc-spark">✳</span>
                  <span className="seven">{count}</span>
                  <span className="disc-label">
                    KYSYMYSTÄ
                    <br />
                    KOKO MAAILMASTA
                  </span>
                </div>
                <span className="art-foot">
                  OMA PÄÄ RIITTÄÄ. <span>↗</span>
                </span>
              </div>
            </section>
            <div className="quick-facts">
              <span>
                <b>01</b> Sama visa kaikille
              </span>
              <span>
                <b>02</b> Vastaa omin sanoin
              </span>
              <span>
                <b>03</b> Oivalla joka vastauksella
              </span>
            </div>
          </>
        )}
        {playing && game && (
          <section className="game-wrap" aria-labelledby="question-heading">
            <div className="game-topline">
              <span className="eyebrow">
                {game.mode === "daily"
                  ? "PÄIVÄN VISA"
                  : `HARJOITUS · ${formatDate(game.date)}`}
              </span>
              <span className="question-count">
                {number} <span>/ {count}</span>
              </span>
            </div>
            <ol
              className="progress"
              aria-label={`Kysymys ${number} / ${count}`}
            >
              {Array.from({ length: count }, (_, i) => (
                <li
                  key={i}
                  className={
                    i < game.results.length
                      ? "done"
                      : i === number - 1
                        ? "current"
                        : ""
                  }
                  aria-current={i === number - 1 ? "step" : undefined}
                >
                  <span className="sr-only">
                    Kysymys {i + 1}
                    {i < game.results.length ? ", vastattu" : ""}
                  </span>
                </li>
              ))}
            </ol>
            <div className="question-panel">
              <p className="category">
                <span aria-hidden="true">✳</span>{" "}
                {CATEGORIES[(feedback ?? game.current)!.category]}
              </p>
              <h1 ref={heading} tabIndex={-1} id="question-heading">
                {(feedback ?? game.current)!.question}
              </h1>
              {!feedback && (
                <form onSubmit={onSubmit} className="answer-form">
                  <label htmlFor="answer">Vastauksesi</label>
                  <input
                    ref={input}
                    id="answer"
                    name="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    maxLength={MAX_ANSWER_LENGTH}
                    autoComplete="off"
                    autoCapitalize="sentences"
                    spellCheck={false}
                    placeholder="Kirjoita tähän…"
                    disabled={busy}
                    aria-describedby="answer-help"
                  />
                  <p id="answer-help" className="muted small">
                    Yksi vastaus riittää. Kirjainkoolla ei ole väliä.
                  </p>
                  <div className="answer-actions">
                    <button
                      className="button button-primary"
                      disabled={busy || !answer.trim()}
                    >
                      {busy ? "Tarkistetaan…" : "Lukitse vastaus"} <Arrow />
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      disabled={busy}
                      onClick={() => void submit("")}
                    >
                      En tiedä — ohita
                    </button>
                  </div>
                </form>
              )}
              {feedback && (
                <div
                  className={`feedback ${feedback.accepted ? "correct" : "incorrect"}`}
                >
                  <div className="feedback-header">
                    <span>
                      {feedback.accepted
                        ? "✦ Hyvin tiedetty!"
                        : feedback.answer
                          ? "Tällä kertaa ei osunut."
                          : "Tämä jäi väliin."}
                    </span>
                    {game.mode === "daily" && (
                      <strong>
                        +{feedback.points} <small>p</small>
                      </strong>
                    )}
                  </div>
                  <p className="your-answer">
                    Vastauksesi: {feedback.answer || "—"}
                  </p>
                  <p className="eyebrow">
                    {feedback.accepted ? "HYVÄKSYTTY VASTAUS" : "OIKEA VASTAUS"}
                  </p>
                  <p className="canonical">{feedback.canonicalAnswer}</p>
                  <p className="explanation">{feedback.explanation}</p>
                  <button
                    className="button button-primary"
                    onClick={advance}
                    disabled={busy}
                  >
                    {game.summary ? "Katso tuloksesi" : "Seuraava kysymys"}{" "}
                    <Arrow />
                  </button>
                </div>
              )}
            </div>
            <p className="game-note">
              {game.mode === "daily"
                ? "Yksi yritys. Uusi mahdollisuus joka päivä."
                : "Harjoittelua ilman pisteitä. Päivän tuloksesi säilyy ennallaan."}
            </p>
          </section>
        )}
        {phase === "complete" && game?.summary && (
          <section className="results" aria-labelledby="result-heading">
            <div className="result-hero">
              <div>
                <p className="eyebrow">
                  {game.mode === "daily"
                    ? "PÄIVÄN VISA PELATTU"
                    : "HARJOITUS VALMIS"}{" "}
                  · {formatDate(game.date)}
                </p>
                <h1 ref={heading} tabIndex={-1} id="result-heading">
                  {game.summary.correct === count
                    ? "Kaikki kohdallaan!"
                    : game.summary.correct >= 4
                      ? "Hyvin oivallettu."
                      : "Aina oppii uutta."}
                </h1>
                <p>
                  {game.summary.correct} / {count} oikein.{" "}
                  {game.mode === "daily"
                    ? "Huomenna taas uusi näkökulma maailmaan."
                    : "Uteliaisuus kasvaa harjoittelemalla."}
                </p>
                {game.mode === "daily" ? (
                  <ShareResult game={game} />
                ) : (
                  <button
                    className="button button-primary"
                    onClick={() => void loadToday()}
                    disabled={busy}
                  >
                    Takaisin päivän visaan <Arrow />
                  </button>
                )}
              </div>
              <div
                className="score-disc"
                aria-label={
                  game.mode === "daily"
                    ? `${game.summary.points} pistettä, enintään ${game.summary.maxPoints}`
                    : `${game.summary.correct} oikein`
                }
              >
                <Spark />
                <strong>
                  {game.mode === "daily"
                    ? game.summary.points
                    : game.summary.correct}
                </strong>
                <span>
                  {game.mode === "daily"
                    ? `/ ${game.summary.maxPoints} pistettä`
                    : `/ ${count} oikein`}
                </span>
              </div>
            </div>
            <div className="breakdown-heading">
              <h2>Visasi kysymys kysymykseltä</h2>
              <span className="muted small">{count} pientä oivallusta</span>
            </div>
            <ol className="breakdown">
              {game.results.map((result, i) => (
                <li key={result.id}>
                  <details>
                    <summary>
                      <span className="result-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="result-question">
                        <span className="small muted">
                          {CATEGORIES[result.category]}
                        </span>
                        {result.question}
                      </span>
                      <span
                        className={`result-points ${result.accepted ? "accepted" : ""}`}
                      >
                        {game.mode === "daily"
                          ? `${result.points} p`
                          : result.accepted
                            ? "✓"
                            : "—"}
                        <span className="sr-only">
                          {result.accepted ? ", oikein" : ", väärin"}
                        </span>
                      </span>
                      <span aria-hidden="true" className="expand-icon">
                        +
                      </span>
                    </summary>
                    <div className="result-detail">
                      <p>
                        Vastauksesi:{" "}
                        <strong>{result.answer || "Ei vastausta"}</strong>
                      </p>
                      <p>
                        Oikea vastaus: <strong>{result.canonicalAnswer}</strong>
                      </p>
                      <p>{result.explanation}</p>
                      {game.mode === "daily" && (
                        <p className="small muted">
                          Kysymyksen enimmäispisteet: {result.maxPoints}
                        </p>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ol>
            {game.mode === "daily" && (
              <p className="next-day">
                <Spark />
                <span>
                  <strong>Seuraava visa keskiyöllä.</strong>
                  <br />
                  Uusi päivä, seitsemän uutta kysymystä. Suomen aikaa.
                </span>
              </p>
            )}
          </section>
        )}
        <section
          className="more-section"
          aria-label="Tietoa pelistä ja harjoittelu"
        >
          <div id="rules" className="rules">
            <p className="eyebrow">TUTTU RUTIINI, UUTTA TIETOA</p>
            <h2>
              Vähän tietoa.
              <br />
              Paljon oivalluksia.
            </h2>
            <details>
              <summary>
                Näin Mylvisa toimii <span aria-hidden="true">+</span>
              </summary>
              <p>
                Joka päivä {length} yhteistä yleistietokysymystä. Kirjoita
                vastauksesi omin sanoin ja lukitse se. Vastauksen jälkeen näet
                pisteesi ja opit jotain lisää.
              </p>
              <p>
                Joihinkin kysymyksiin on monta oikeaa vastausta. Harvinaisempi
                vastaus voi tuoda enemmän pisteitä. Väärä tai tyhjä vastaus
                antaa 0 pistettä.
              </p>
              <p>
                Päivän visan voi pelata kerran tällä selaimella. Eteneminen ja
                tulos tallentuvat laitteellesi. Uusi visa aukeaa keskiyöllä
                Suomen aikaa, myös kesä- ja talviaikaan siirryttäessä.
              </p>
            </details>
            <details>
              <summary>
                Vastausten hyväksyminen <span aria-hidden="true">+</span>
              </summary>
              <p>
                Isot ja pienet kirjaimet, ylimääräiset välilyönnit ja tavalliset
                välimerkit eivät ratkaise. Tunnetut rinnakkaisnimet hyväksytään
                erikseen. Ä ja a ovat eri kirjaimia, eikä peli arvaa
                kirjoitusvirheitä.
              </p>
              <p>
                Monen oikean vastauksen kysymykseen annetaan vain yksi vastaus.
                Pisteet on määritelty toimituksessa, eivätkä ne perustu
                pelaajien vastausten yleisyyteen.
              </p>
            </details>
          </div>
          <div id="archive" className="archive">
            <div className="archive-top">
              <Spark />
              <span className="eyebrow">LISÄÄ OIVALLETTAVAA</span>
            </div>
            <h2>Jäikö jokin päivä väliin?</h2>
            <p>
              Kokeile aiempia visoja kaikessa rauhassa. Harjoittelu ei kerrytä
              pisteitä.
            </p>
            {date > FIRST_QUIZ_DATE ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setAnswer("");
                  void start("practice", archiveDate || addDays(date, -1));
                }}
              >
                <label htmlFor="archive-date">Valitse päivä</label>
                <input
                  type="date"
                  id="archive-date"
                  value={archiveDate || addDays(date, -1)}
                  onChange={(e) => setArchiveDate(e.target.value)}
                  min={earliest}
                  max={addDays(date, -1)}
                  required
                  disabled={busy}
                />
                <button
                  className="button button-secondary"
                  disabled={busy || !game}
                >
                  Avaa harjoitus <Arrow />
                </button>
                <p className="small muted">
                  Edelliset 30 päivää, alkaen {formatDate(FIRST_QUIZ_DATE)}.
                </p>
              </form>
            ) : (
              <p>Ensimmäinen harjoitus avautuu huomenna.</p>
            )}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <Link
          href="/"
          className="footer-brand"
          onClick={() => {
            setAnswer("");
            void loadToday();
          }}
        >
          mylvisa.
        </Link>
        <p>Uteliaisuus kuuluu kaikille.</p>
        <span>
          Tehty tiedon ilosta <span aria-hidden="true">✳</span>
        </span>
      </footer>
    </>
  );
}
