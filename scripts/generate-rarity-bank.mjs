import { writeFile } from "node:fs/promises";
import { questionAuthorship } from "../src/data/question-authorship.ts";
import { universeById } from "../src/data/universes.ts";

const tierNames = {
  10: "Ilmeinen valinta",
  15: "Ensimmäinen mieleen",
  30: "Hyvä oivallus",
  60: "Harvinainen löytö",
  85: "Syvä tieto",
  100: "Täysosuma",
};
const supportedScores = new Set(Object.keys(tierNames).map(Number));

function normalize(value) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("fi-FI")
    .replace(/[’‘ʼ]/gu, "'")
    .replace(/[‐‑‒–—]/gu, "-")
    .replace(/(?<=\p{L})-(?=\p{L})/gu, " ")
    .replace(/[.,!?;:"“”„()\[\]{}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function fail(message) {
  throw new Error(`Editorial bank generation failed: ${message}`);
}

const seenIds = new Set();
const questions = questionAuthorship.map((authored) => {
  if (seenIds.has(authored.id)) fail(`duplicate question id ${authored.id}`);
  seenIds.add(authored.id);
  const universe = universeById.get(authored.universeId);
  if (!universe) fail(`${authored.id} references unknown universe ${authored.universeId}`);
  if (universe.expectedCount !== universe.entities.length)
    fail(`${universe.id} declares ${universe.expectedCount} members but stores ${universe.entities.length}`);
  if (!universe.source.url.startsWith("https://")) fail(`${universe.id} has a non-HTTPS source`);
  if (universe.expectedCount < 1) fail(`${universe.id} has no members`);

  const entityIds = new Set();
  const answerKeys = new Map();
  for (const entity of universe.entities) {
    if (entityIds.has(entity.id)) fail(`${universe.id} repeats entity id ${entity.id}`);
    entityIds.add(entity.id);
    for (const value of [entity.canonical, ...entity.aliases]) {
      const key = normalize(value);
      if (!key) fail(`${universe.id} contains an empty answer`);
      if (answerKeys.has(key)) fail(`${universe.id} has an alias collision for ${value}`);
      answerKeys.set(key, entity.id);
    }
  }

  const scoreIds = Object.keys(authored.scores);
  if (scoreIds.length !== universe.entities.length)
    fail(`${authored.id} has ${scoreIds.length} rarity assignments for ${universe.entities.length} members`);
  for (const id of scoreIds) {
    if (!entityIds.has(id)) fail(`${authored.id} assigns a score to unknown member ${id}`);
    if (!supportedScores.has(authored.scores[id])) fail(`${authored.id} assigns unsupported score ${authored.scores[id]}`);
  }

  return {
    id: authored.id,
    prompt: authored.prompt,
    category: authored.category,
    universeId: authored.universeId,
    referenceDefinition: `${universe.description} Jäsenyysperuste: ${universe.membershipBasis} Viitepäivä: ${universe.asOf}.`,
    completeness: {
      status: "verified",
      source: universe.source.url,
      asOf: universe.asOf,
      expectedCount: universe.expectedCount,
      basis: universe.membershipBasis,
    },
    answers: universe.entities.map((entity) => {
      const points = authored.scores[entity.id];
      return {
        canonical: entity.canonical,
        aliases: entity.aliases,
        points,
        tier: tierNames[points],
        editorialTier: String(points),
        effectiveTier: String(points),
        provenance: universe.source.title,
      };
    }),
    explanation: authored.explanation,
    source: universe.source,
    tags: [...authored.tags, "rarity"],
    evergreen: true,
    status: "active",
    version: 3,
    author: "Mylvisa editorial 2026-09-11",
    contentReview: "verified",
    rarityReview: "editorial-reviewed",
    frequency: { status: "pending" },
  };
});

if (questions.length < 7) fail(`expected at least 7 active questions, got ${questions.length}`);
await writeFile("src/data/releases/2026-09-01.json", `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Generated ${questions.length} verified rarity questions from ${universeById.size} universes`);
