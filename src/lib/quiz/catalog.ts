export const CATEGORIES = {
  suomi: "Suomi",
  "suomen-historia": "Suomen historia",
  maailmanhistoria: "Maailmanhistoria",
  maantiede: "Maantiede",
  yhteiskunta: "Yhteiskunta",
  tiede: "Tiede",
  luonto: "Luonto",
  kirjallisuus: "Kirjallisuus",
  "suomen-kieli": "Suomen kieli",
  taide: "Taide",
  musiikki: "Musiikki",
  "elokuvat-ja-televisio": "Elokuvat ja televisio",
  urheilu: "Urheilu",
  teknologia: "Teknologia",
  talous: "Talous",
  "ruoka-ja-kulttuuri": "Ruoka ja kulttuuri",
  maailma: "Maailma",
  videopelit: "Videopelit",
  "internet-ja-digikulttuuri": "Internet ja digikulttuuri",
} as const;
export type Category = keyof typeof CATEGORIES;
export const SCORE_TIERS = [10, 15, 30, 60, 85, 100] as const;
export const RARITY_TIERS = {
  10: "Ilmeinen valinta",
  15: "Ensimmäinen mieleen",
  30: "Hyvä oivallus",
  60: "Harvinainen löytö",
  85: "Harvoin muistettu",
  100: "Täysosuma",
} as const;
export type RarityTier = keyof typeof RARITY_TIERS;
export const DEFAULT_QUIZ_LENGTH = 7;
export const MAX_ANSWER_LENGTH = 160;
export const PREVIEW_SECONDS = 3;
export const ROUND_SECONDS = 25;
export const MAX_GAME_SCORE = 700;
export const FIRST_QUIZ_DATE = "2026-09-01";
