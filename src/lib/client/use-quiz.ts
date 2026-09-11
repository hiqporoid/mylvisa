"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Mode, QuizRequest, QuizResponse } from "@/lib/quiz/contracts";
import { readGame, saveGame, STORAGE_PREFIX } from "./storage";
export type Phase = "home" | "question" | "feedback" | "complete";
class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}
async function request(input?: QuizRequest): Promise<QuizResponse> {
  const response = await fetch(
    "/api/quiz",
    input
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        }
      : { cache: "no-store", signal: AbortSignal.timeout(15_000) },
  );
  const value = await response.json();
  if (!response.ok)
    throw new ApiError(
      value.error ?? "Jokin meni vikaan. Yritä uudelleen.",
      value.code,
    );
  return value as QuizResponse;
}
export function useQuiz() {
  const [game, setGame] = useState<QuizResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("home");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [storageAvailable, setStorageAvailable] = useState(true);
  const answers = useRef<string[]>([]);
  const lock = useRef(false);
  const generation = useRef(0);
  const clockAnchor = useRef({ received: 0, server: 0 });
  const accept = useCallback((next: QuizResponse) => {
    clockAnchor.current = {
      received: Date.now(),
      server: Date.parse(next.serverNow),
    };
    setGame(next);
  }, []);
  const persist = useCallback(
    (next: QuizResponse, started: boolean, feedback: boolean) => {
      if (next.mode !== "daily") return;
      setStorageAvailable(
        saveGame({
          version: 1,
          date: next.date,
          answers: answers.current,
          started,
          feedback,
          ...(next.summary ? { result: next } : {}),
        }),
      );
    },
    [],
  );
  const loadToday = useCallback(
    (message = "") => {
      const version = ++generation.current;
      return request().then(async (today) => {
        if (version !== generation.current) return;
        setError("");
        let saved = null;
        try { saved = readGame(today.date); }
        catch { setStorageAvailable(false); }
        const next = saved?.started
          ? await request({ date: today.date, mode: "daily", answers: saved.answers, releaseId: today.releaseId })
          : today;
        if (version !== generation.current) return;
        answers.current = saved?.answers ?? [];
        accept(next);
        setPhase(next.summary ? "complete" : saved?.started ? (saved.feedback && next.results.length ? "feedback" : "question") : "home");
        setNotice(message);
      }).catch((e: unknown) => {
        if (version === generation.current) setError(e instanceof ApiError ? e.message : "Yhteys katkesi. Tarkista verkkoyhteys ja yritä uudelleen.");
      }).finally(() => {
        if (version === generation.current) setBusy(false);
      });
    },
    [accept],
  );
  useEffect(() => {
    const activeGeneration = generation;
    void loadToday();
    return () => {
      activeGeneration.current++;
    };
  }, [loadToday]);
  useEffect(() => {
    if (!game) return;
    const check = () => {
      const estimatedNow =
        clockAnchor.current.server +
        (Date.now() - clockAnchor.current.received);
      if (estimatedNow >= Date.parse(game.nextRollover) && !lock.current)
        void loadToday("Päivä vaihtui — uusi visa on täällä.");
    };
    const timeout = window.setTimeout(
      check,
      Math.max(
        100,
        Date.parse(game.nextRollover) - Date.parse(game.serverNow) + 100,
      ),
    );
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    const onStorage = (event: StorageEvent) => {
      if (
        game.mode === "daily" &&
        event.key === STORAGE_PREFIX + game.date &&
        !lock.current
      )
        void loadToday("Pelitilanne päivitettiin toisesta välilehdestä.");
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", check);
    window.addEventListener("storage", onStorage);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", check);
      window.removeEventListener("storage", onStorage);
    };
  }, [game, loadToday]);
  async function start(mode: Mode = "daily", date?: string) {
    if (!game || lock.current) return;
    if (mode === "daily") {
      persist(game, true, false);
      setPhase("question");
      setNotice("");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const next = await request({ date: date!, mode, answers: [] });
      answers.current = [];
      accept(next);
      setPhase("question");
      setNotice("");
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Harjoituksen lataus ei onnistunut. Yritä uudelleen.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function submit(answer: string) {
    if (!game?.current || phase !== "question" || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const action = async () => {
      try {
        if (game.mode === "daily") {
          let saved = null;
          try {
            saved = readGame(game.date);
          } catch {
            setStorageAvailable(false);
          }
          if (saved && saved.answers.length > answers.current.length) {
            await loadToday(
              "Vastaus oli jo tallennettu toisessa välilehdessä.",
            );
            return;
          }
        }
        const submitted = [...answers.current, answer];
        const next = await request({
          date: game.date,
          mode: game.mode,
          answers: submitted,
          releaseId: game.releaseId,
        });
        answers.current = submitted;
        accept(next);
        persist(next, true, true);
        setPhase("feedback");
      } catch (e) {
        if (e instanceof ApiError && e.code === "DAY_CHANGED") {
          await loadToday(e.message);
        } else
          setError(
            e instanceof ApiError
              ? e.message
              : "Vastausta ei saatu tarkistettua. Vastauksesi säilyi kentässä — yritä uudelleen.",
          );
      }
    };
    try {
      if (navigator.locks && game.mode === "daily")
        await navigator.locks.request(`mylvisa:${game.date}`, action);
      else await action();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function next() {
    if (!game || busy) return;
    persist(game, true, false);
    setPhase(game.summary ? "complete" : "question");
  }
  return {
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
  };
}
