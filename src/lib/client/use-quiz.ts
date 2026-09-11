"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Mode, QuizRequest, QuizResponse } from "@/lib/quiz/contracts";
import { createRoundClock, roundStatus, type RoundClock } from "@/lib/quiz/timer";
import { readGame, saveGame, STORAGE_PREFIX } from "./storage";

export type Phase = "home" | "preview" | "question" | "feedback" | "complete";

class ApiError extends Error {
  constructor(message: string, public code: string) { super(message); }
}

async function request(input?: QuizRequest): Promise<QuizResponse> {
  const response = await fetch(
    "/api/quiz",
    input
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store", signal: AbortSignal.timeout(15_000) }
      : { cache: "no-store", signal: AbortSignal.timeout(15_000) },
  );
  const value = await response.json();
  if (!response.ok) throw new ApiError(value.error ?? "Jokin meni vikaan. Yritä uudelleen.", value.code);
  return value as QuizResponse;
}

export function useQuiz() {
  const [game, setGame] = useState<QuizResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("home");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [roundClock, setRoundClock] = useState<RoundClock | null>(null);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const answers = useRef<string[]>([]);
  const lock = useRef(false);
  const generation = useRef(0);
  const submitRef = useRef<(answer: string) => Promise<void>>(async () => undefined);

  const accept = useCallback((next: QuizResponse) => setGame(next), []);
  const persist = useCallback((next: QuizResponse, started: boolean, feedback: boolean, clock?: RoundClock | null) => {
    if (next.mode !== "daily") return;
    const ok = saveGame({
      version: 2,
      date: next.date,
      answers: answers.current,
      started,
      feedback,
      ...(clock ? { roundStartedAt: new Date(clock.startedAt).toISOString() } : {}),
      ...(next.summary ? { result: next } : {}),
    });
    setStorageAvailable(ok);
  }, []);

  const loadToday = useCallback((message = "") => {
    const version = ++generation.current;
    setBusy(true);
    return request().then(async (today) => {
      if (version !== generation.current) return;
      let saved = null;
      try { saved = readGame(today.date); } catch { setStorageAvailable(false); }
      const savedStarted = saved?.roundStartedAt ? Date.parse(saved.roundStartedAt) : NaN;
      const savedClock = Number.isFinite(savedStarted) ? createRoundClock(savedStarted) : null;
      const restoredExpired = Boolean(saved?.started && !saved.feedback && savedClock && roundStatus(savedClock) === "expired");
      const restoredAnswers = restoredExpired ? [...(saved?.answers ?? []), ""] : (saved?.answers ?? []);
      answers.current = restoredAnswers;
      let next = today;
      if (saved?.started) {
        next = await request({
          date: today.date,
          mode: "daily",
          answers: restoredAnswers,
          releaseId: today.releaseId,
          ...(saved.feedback || restoredExpired ? {} : saved.roundStartedAt ? { roundStartedAt: saved.roundStartedAt } : {}),
        });
      }
      if (version !== generation.current) return;
      accept(next);
      setError("");
      setNotice(message);
      if (saved?.started && (saved.feedback || restoredExpired) && next.results.length) {
        setRoundClock(null);
        setPhase("feedback");
        if (restoredExpired) persist(next, true, true);
      } else if (next.summary) {
        setRoundClock(null);
        setPhase("complete");
      } else if (saved?.roundStartedAt) {
        const started = Date.parse(saved.roundStartedAt);
        const clock = Number.isFinite(started) ? createRoundClock(started) : createRoundClock();
        setRoundClock(clock);
        setClockNow(Date.now());
        setPhase(roundStatus(clock) === "preview" ? "preview" : "question");
      } else {
        setRoundClock(null);
        setPhase("home");
      }
    }).catch((error: unknown) => {
      if (version === generation.current) setError(error instanceof ApiError ? error.message : "Yhteys katkesi. Tarkista verkkoyhteys ja yritä uudelleen.");
    }).finally(() => {
      if (version === generation.current) setBusy(false);
    });
  }, [accept, persist]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadToday(); }, 0);
    const active = generation;
    return () => { window.clearTimeout(timer); active.current++; };
  }, [loadToday]);

  useEffect(() => {
    if (!roundClock || (phase !== "preview" && phase !== "question")) return;
    const reconcile = () => {
      const now = Date.now();
      setClockNow(now);
      const status = roundStatus(roundClock, now);
      if (status === "expired" && (phase === "question" || phase === "preview") && !lock.current) void submitRef.current("");
      if (status === "answering" && phase === "preview") setPhase("question");
    };
    const interval = window.setInterval(reconcile, 250);
    const onVisibility = () => { if (document.visibilityState === "visible") reconcile(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", reconcile);
    reconcile();
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", reconcile);
    };
  }, [roundClock, phase]);

  useEffect(() => {
    if (!game) return;
    const check = () => {
      if (Date.now() >= Date.parse(game.nextRollover) && !lock.current) void loadToday("Päivä vaihtui — uusi visa on täällä.");
    };
    const timeout = window.setTimeout(check, Math.max(100, Date.parse(game.nextRollover) - Date.parse(game.serverNow) + 100));
    const onStorage = (event: StorageEvent) => {
      if (game.mode === "daily" && event.key === STORAGE_PREFIX + game.date && !lock.current) void loadToday("Pelitilanne päivitettiin toisesta välilehdestä.");
    };
    window.addEventListener("focus", check);
    window.addEventListener("storage", onStorage);
    return () => { window.clearTimeout(timeout); window.removeEventListener("focus", check); window.removeEventListener("storage", onStorage); };
  }, [game, loadToday]);

  async function start(mode: Mode = "daily", date?: string) {
    if (!game || lock.current) return;
    setError("");
    if (mode === "daily") {
      answers.current = [];
      const clock = createRoundClock();
      setRoundClock(clock);
      setClockNow(clock.startedAt);
      setPhase("preview");
      persist(game, true, false, clock);
      setNotice("");
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const next = await request({ date: date!, mode, answers: [] });
      answers.current = [];
      accept(next);
      const clock = createRoundClock();
      setRoundClock(clock);
      setClockNow(clock.startedAt);
      setPhase("preview");
      setNotice("");
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Harjoituksen lataus ei onnistunut. Yritä uudelleen.");
    } finally { lock.current = false; setBusy(false); }
  }

  const submit = useCallback(async (answer: string) => {
    if (!game?.current || (phase !== "question" && phase !== "preview") || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const action = async () => {
      try {
        if (game.mode === "daily") {
          try {
            const saved = readGame(game.date);
            if (saved && saved.answers.length > answers.current.length) {
              await loadToday("Vastaus oli jo tallennettu toisessa välilehdessä.");
              return;
            }
          } catch { setStorageAvailable(false); }
        }
        const submitted = [...answers.current, answer];
        const next = await request({
          date: game.date,
          mode: game.mode,
          answers: submitted,
          releaseId: game.releaseId,
          ...(roundClock ? { roundStartedAt: new Date(roundClock.startedAt).toISOString() } : {}),
        });
        answers.current = submitted;
        accept(next);
        setRoundClock(null);
        persist(next, true, true);
        setPhase("feedback");
      } catch (error) {
        if (error instanceof ApiError && error.code === "DAY_CHANGED") await loadToday(error.message);
        else setError(error instanceof ApiError ? error.message : "Vastausta ei saatu tarkistettua. Vastauksesi säilyi kentässä — yritä uudelleen.");
      }
    };
    try {
      if (navigator.locks && game.mode === "daily") await navigator.locks.request(`mylvisa:${game.date}`, action);
      else await action();
    } finally { lock.current = false; setBusy(false); }
  }, [accept, game, loadToday, persist, phase, roundClock]);

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  function next() {
    if (!game || busy || phase !== "feedback") return;
    if (game.summary) {
      persist(game, true, false);
      setPhase("complete");
      return;
    }
    const clock = createRoundClock();
    setRoundClock(clock);
    setClockNow(clock.startedAt);
    persist(game, true, false, clock);
    setPhase("preview");
  }

  return { game, phase, busy, error, notice, storageAvailable, roundClock, clockNow, start, submit, next, loadToday };
}
