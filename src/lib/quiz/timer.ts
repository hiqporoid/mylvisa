import { PREVIEW_SECONDS, ROUND_SECONDS } from "./catalog";

export type RoundClock = {
  startedAt: number;
  previewUntil: number;
  deadline: number;
};

export function createRoundClock(startedAt = Date.now()): RoundClock {
  return {
    startedAt,
    previewUntil: startedAt + PREVIEW_SECONDS * 1000,
    deadline: startedAt + (PREVIEW_SECONDS + ROUND_SECONDS) * 1000,
  };
}

export function roundStatus(clock: RoundClock, now = Date.now()): "preview" | "answering" | "expired" {
  if (now < clock.previewUntil) return "preview";
  if (now < clock.deadline) return "answering";
  return "expired";
}

export function remainingSeconds(clock: RoundClock, now = Date.now()): number {
  if (now < clock.previewUntil) return 0;
  return Math.max(0, Math.ceil((clock.deadline - now) / 1000));
}
