"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LocalRoundOutcome, Mode, QuizAttempt, QuizRequest, QuizResponse } from "@/lib/quiz/contracts";
import { progressionDuration } from "@/lib/quiz/progression";
import { createRoundClock, roundStatus, type RoundClock } from "@/lib/quiz/timer";
import { readGame, saveGame, STORAGE_PREFIX } from "./storage";
import { ensureIdentity } from "@/lib/supabase/browser";

async function persistentRequest(command?: unknown): Promise<QuizResponse | null> {
  const response = await fetch("/api/daily", command
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(command), cache: "no-store", signal: AbortSignal.timeout(15_000) }
    : { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.error, data.code);
  return data.game;
}

export type Phase = "home" | "preview" | "question" | "progression" | "feedback" | "complete";

class ApiError extends Error {
  constructor(message: string, public code: string) { super(message); }
}

async function request(input?: QuizRequest): Promise<QuizResponse> {
  const response = await fetch("/api/quiz", input
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store", signal: AbortSignal.timeout(15_000) }
    : { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  const value = await response.json();
  if (!response.ok) throw new ApiError(value.error ?? "Jokin meni vikaan. Yritä uudelleen.", value.code);
  return value as QuizResponse;
}

function clockFromServer(game: QuizResponse): RoundClock | null {
  if (!game.roundStartedAt) return null;
  return createRoundClock(Date.now() + Date.parse(game.roundStartedAt) - Date.parse(game.serverNow));
}

function localOutcome(game: QuizResponse): LocalRoundOutcome[] {
  return game.results.map((result) => result.outcome === "timeout" ? "timeout" : result.outcome === "skipped" ? "skipped" : "answer");
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
  const outcomes = useRef<LocalRoundOutcome[]>([]);
  const lock = useRef(false);
  const generation = useRef(0);
  const connected = useRef(false);
  const timeoutRef = useRef<() => Promise<void>>(async () => undefined);
  const progressionTimer = useRef<number | null>(null);

  const persist = useCallback((next: QuizResponse, started: boolean, feedback: boolean, clock?: RoundClock | null) => {
    if (next.mode !== "daily") return;
    const ok = saveGame({
      version: 3,
      date: next.date,
      releaseId: next.releaseId,
      answers: answers.current,
      outcomes: outcomes.current,
      started,
      feedback,
      ...(clock ? { roundStartedAt: new Date(clock.startedAt).toISOString() } : {}),
      ...(next.summary ? { result: next } : {}),
    });
    setStorageAvailable(ok);
  }, []);

  const showRestored = useCallback((next: QuizResponse) => {
    setGame(next);
    setError("");
    const clock = clockFromServer(next);
    if (clock) {
      setRoundClock(clock);
      setClockNow(Date.now());
      setPhase(roundStatus(clock) === "preview" ? "preview" : "question");
    } else {
      setRoundClock(null);
      setPhase(next.summary ? "complete" : next.results.length ? "feedback" : "home");
    }
  }, []);

  const loadToday = useCallback((message = "") => {
    const version = ++generation.current;
    setBusy(true);
    return request().then(async (today) => {
      if (version !== generation.current) return;
      connected.current = false;
      if (today.supportsPersistence) {
        connected.current = await ensureIdentity();
        if (!connected.current) throw new ApiError("Profiilin yhteys ei onnistu. Päivän peliä ei aloitettu eikä aiempia tuloksia poistettu. Yritä uudelleen.", "AUTH_UNAVAILABLE");
        const restored = await persistentRequest();
        if (version !== generation.current) return;
        if (restored) {
          showRestored(restored);
          setNotice("Tulos tallennetaan profiiliisi. Julkaisu tulostaululla edellyttää nimimerkkiä.");
        } else {
          setGame(today); setPhase("home"); setRoundClock(null); setNotice(message);
        }
        return;
      }

      let saved = null;
      try { saved = readGame(today.date); } catch { setStorageAvailable(false); }
      const savedRelease = saved?.releaseId ?? saved?.result?.releaseId;
      if (saved && savedRelease !== today.releaseId) {
        if (saved.result?.summary) {
          setGame(saved.result); setPhase("complete"); setRoundClock(null);
          setNotice("Aiemman julkaisun paikallinen tulos. Sitä ei siirretä tulostaululle.");
          return;
        }
        saved = null;
        message = "Kysymyspankki päivittyi. Uusi paikallinen peli alkaa alusta.";
      }
      answers.current = saved?.answers ?? [];
      outcomes.current = saved?.outcomes ?? [];
      let next = today;
      let restoredExpired = false;
      if (saved?.started) {
        const savedStart = saved.roundStartedAt ? Date.parse(saved.roundStartedAt) : NaN;
        restoredExpired = !saved.feedback && Number.isFinite(savedStart) && roundStatus(createRoundClock(savedStart)) === "expired";
        next = await request({
          date: today.date,
          mode: "daily",
          answers: answers.current,
          outcomes: outcomes.current,
          releaseId: today.releaseId,
          ...(restoredExpired && saved.roundStartedAt ? { roundStartedAt: saved.roundStartedAt, attempt: { action: "timeout" } as const } : {}),
        });
        if (restoredExpired) {
          answers.current = next.results.map((result) => result.originalAnswer ?? result.answer);
          outcomes.current = localOutcome(next);
          persist(next, true, true);
        }
      }
      if (version !== generation.current) return;
      setGame(next);
      setError("");
      setNotice(message || "Paikallinen peli: tulosta ei tallenneta tulostaululle.");
      if (next.summary) { setRoundClock(null); setPhase("complete"); }
      else if (saved?.feedback || restoredExpired) { setRoundClock(null); setPhase("feedback"); }
      else if (saved?.roundStartedAt) {
        const clock = createRoundClock(Date.parse(saved.roundStartedAt));
        setRoundClock(clock); setClockNow(Date.now()); setPhase(roundStatus(clock) === "preview" ? "preview" : "question");
      } else { setRoundClock(null); setPhase("home"); }
    }).catch((caught: unknown) => {
      if (version === generation.current) setError(caught instanceof ApiError ? caught.message : "Yhteys katkesi. Tarkista verkkoyhteys ja yritä uudelleen.");
    }).finally(() => { if (version === generation.current) setBusy(false); });
  }, [persist, showRestored]);

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
      if (status === "expired" && !lock.current) void timeoutRef.current();
      else if (status === "answering" && phase === "preview") setPhase("question");
    };
    const interval = window.setInterval(reconcile, 250);
    const onVisibility = () => { if (document.visibilityState === "visible") reconcile(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", reconcile);
    reconcile();
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisibility); window.removeEventListener("focus", reconcile); };
  }, [roundClock, phase]);

  useEffect(() => {
    if (!game) return;
    const check = () => { if (Date.now() >= Date.parse(game.nextRollover) && !lock.current) void loadToday("Päivä vaihtui, uusi visa on täällä."); };
    const timer = window.setTimeout(check, Math.max(100, Date.parse(game.nextRollover) - Date.parse(game.serverNow) + 100));
    const onStorage = (event: StorageEvent) => { if (game.mode === "daily" && event.key === STORAGE_PREFIX + game.date && !lock.current) void loadToday("Pelitilanne päivitettiin toisesta välilehdestä."); };
    window.addEventListener("focus", check); window.addEventListener("storage", onStorage);
    return () => { window.clearTimeout(timer); window.removeEventListener("focus", check); window.removeEventListener("storage", onStorage); };
  }, [game, loadToday]);

  useEffect(() => () => { if (progressionTimer.current) window.clearTimeout(progressionTimer.current); }, []);

  async function start(mode: Mode = "daily", date?: string) {
    if (!game || lock.current) return;
    setError("");
    if (mode === "daily" && connected.current) {
      lock.current = true; setBusy(true);
      try { const next = await persistentRequest({ action: "start" }); if (next) showRestored(next); }
      catch (caught) { setError(caught instanceof Error ? caught.message : "Pelin aloitus epäonnistui."); }
      finally { lock.current = false; setBusy(false); }
      return;
    }
    if (mode === "daily" && game.supportsPersistence) { setError("Tallennusyhteys puuttuu. Yritä uudelleen tai pelaa edellispäivän harjoitus."); return; }
    let next = game;
    if (mode === "practice") {
      setBusy(true);
      try { next = await request({ date: date!, mode, answers: [], outcomes: [] }); }
      catch (caught) { setError(caught instanceof ApiError ? caught.message : "Harjoituksen lataus ei onnistunut."); setBusy(false); return; }
      setBusy(false);
    }
    answers.current = []; outcomes.current = []; setGame(next);
    const clock = createRoundClock(); setRoundClock(clock); setClockNow(clock.startedAt); setPhase("preview"); setNotice("");
    persist(next, true, false, clock);
  }

  const attempt = useCallback(async (quizAttempt: QuizAttempt) => {
    if (!game?.current || (phase !== "question" && phase !== "preview") || lock.current || !roundClock) return;
    lock.current = true; setBusy(true); setError("");
    const action = async () => {
      try {
        let next: QuizResponse | null;
        if (connected.current && game.mode === "daily") {
          const command = quizAttempt.action === "answer"
            ? { action: "answer", version: game.runVersion, questionId: game.current!.id, answer: quizAttempt.answer }
            : quizAttempt.action === "confirm"
              ? { action: "confirm", version: game.runVersion, questionId: game.current!.id, confirmationToken: quizAttempt.confirmationToken }
              : { action: quizAttempt.action, version: game.runVersion, questionId: game.current!.id };
          next = await persistentRequest(command);
        } else {
          next = await request({
            date: game.date, mode: game.mode, answers: answers.current, outcomes: outcomes.current,
            releaseId: game.releaseId, roundStartedAt: new Date(roundClock.startedAt).toISOString(), attempt: quizAttempt,
          });
        }
        if (!next) return;
        setGame(next);
        if (next.resolution?.status === "invalid" || next.resolution?.status === "confirm") {
          setPhase("question");
          return;
        }
        if (next.runStatus === "answering" && next.results.length === game.results.length) {
          const restoredClock = clockFromServer(next);
          if (restoredClock) { setRoundClock(restoredClock); setClockNow(Date.now()); }
          setPhase(restoredClock && roundStatus(restoredClock) === "preview" ? "preview" : "question");
          return;
        }
        answers.current = next.results.map((result) => result.originalAnswer ?? result.answer);
        outcomes.current = localOutcome(next);
        setRoundClock(null);
        persist(next, true, true);
        const result = next.results.at(-1);
        if (result?.accepted) {
          setPhase("progression");
          progressionTimer.current = window.setTimeout(() => setPhase("feedback"), progressionDuration(result.points));
        } else setPhase("feedback");
      } catch (caught) {
        if (caught instanceof ApiError && caught.code === "DAY_CHANGED") await loadToday(caught.message);
        else if (caught instanceof ApiError && caught.code === "INVALID_CONFIRMATION") {
          setGame((current) => current ? { ...current, resolution: undefined } : current);
          setError(caught.message);
        } else setError(caught instanceof ApiError ? caught.message : "Vastausta ei saatu tarkistettua. Vastauksesi säilyi kentässä, yritä uudelleen.");
      }
    };
    try {
      if (navigator.locks && game.mode === "daily") await navigator.locks.request(`mylvisa:${game.date}`, action);
      else await action();
    } finally { lock.current = false; setBusy(false); }
  }, [game, loadToday, persist, phase, roundClock]);

  const submit = useCallback((answer: string) => attempt({ action: "answer", answer }), [attempt]);
  const confirm = useCallback((confirmationToken: string) => attempt({ action: "confirm", confirmationToken }), [attempt]);
  const skip = useCallback(() => attempt({ action: "skip" }), [attempt]);
  const timeout = useCallback(() => attempt({ action: "timeout" }), [attempt]);
  useEffect(() => { timeoutRef.current = timeout; }, [timeout]);

  const clearResolution = useCallback(() => {
    setGame((current) => current ? { ...current, resolution: undefined } : current);
  }, []);

  async function next() {
    if (!game || busy || phase !== "feedback") return;
    if (game.summary) { persist(game, true, false); setPhase("complete"); return; }
    if (connected.current && game.mode === "daily") {
      lock.current = true; setBusy(true);
      try { const updated = await persistentRequest({ action: "next", version: game.runVersion }); if (updated) showRestored(updated); }
      catch (caught) { setError(caught instanceof Error ? caught.message : "Kierroksen avaus epäonnistui."); }
      finally { lock.current = false; setBusy(false); }
      return;
    }
    const clock = createRoundClock(); setRoundClock(clock); setClockNow(clock.startedAt); persist(game, true, false, clock); setPhase("preview");
  }

  return { game, phase, busy, error, notice, storageAvailable, roundClock, clockNow, start, submit, confirm, skip, clearResolution, next, loadToday };
}
