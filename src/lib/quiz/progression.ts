import { MAX_GAME_SCORE } from "./catalog";

export const MYLV_PER_POINT = 10;
export const MAX_MYLV = MAX_GAME_SCORE * MYLV_PER_POINT;

export const MYLVINTA_MILESTONES = [
  { mylv: 0, label: "Hiljainen murahdus" },
  { mylv: 700, label: "Huone värähtää" },
  { mylv: 1700, label: "Ikkunat helisevät" },
  { mylv: 3000, label: "Kortteli kuulee" },
  { mylv: 4500, label: "Naapurikunta kuulee" },
  { mylv: 6000, label: "Seismografi reagoi" },
  { mylv: 7000, label: "Täydellinen mylvintä" },
] as const;

export function mylvFromPoints(points: number) {
  return Math.max(0, Math.min(MAX_MYLV, points * MYLV_PER_POINT));
}

export function mylvintaMilestone(mylv: number) {
  return [...MYLVINTA_MILESTONES].reverse().find((milestone) => mylv >= milestone.mylv) ?? MYLVINTA_MILESTONES[0];
}

export function progressionDuration(points: number) {
  if (points <= 0) return 0;
  return Math.round(1200 + Math.min(100, points) * 10);
}
