export const CATEGORIES = {
  suomi: "Suomi",
  historia: "Historia",
  maantiede: "Maantiede",
  yhteiskunta: "Yhteiskunta",
  tiede: "Tiede",
  luonto: "Luonto",
  kirjallisuus: "Kirjallisuus",
  kieli: "Kieli",
  taide: "Taide",
  musiikki: "Musiikki",
  "elokuvat-ja-televisio": "Elokuvat ja televisio",
  urheilu: "Urheilu",
  teknologia: "Teknologia",
  talous: "Talous",
  "ruoka-ja-kulttuuri": "Ruoka ja kulttuuri",
  maailma: "Maailma",
} as const;
export type Category = keyof typeof CATEGORIES;
export const DIFFICULTIES = ["helppo", "keskitaso", "vaikea"] as const;
export const SCORE_TIERS = [10, 20, 30, 40, 50, 70, 100] as const;
export const DEFAULT_QUIZ_LENGTH = 7;
export const MAX_ANSWER_LENGTH = 160;
export const FIRST_QUIZ_DATE = "2026-09-01";
