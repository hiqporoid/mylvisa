import { writeFile } from "node:fs/promises";
import { questionAuthorship } from "../src/data/question-authorship.ts";
import { universeById } from "../src/data/universes.ts";

import { corrections, decisions } from "../src/data/editorial.ts";
import { editorialIntentAliases } from "../src/data/intent-aliases-2026-09.ts";

const tierNames = {
  10: "Ilmeinen valinta",
  15: "Ensimmäinen mieleen",
  30: "Hyvä oivallus",
  60: "Harvinainen löytö",
  85: "Harvoin muistettu",
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
const questions = questionAuthorship.map((original) => {
  const edit = corrections[original.id];
  const decision = decisions[original.id];
  const authored = { ...original, ...(edit?.prompt ? { prompt: edit.prompt } : {}), ...(edit?.category ? { category: edit.category } : {}), ...(edit?.familyId ? { familyId: edit.familyId } : {}) };
  if (decision?.classification === "RETIRE" || decision?.classification === "DEMOTE") { authored.dailyEligible = false; authored.reviewDisposition = decision.classification === "RETIRE" ? "retire" : "hard"; authored.accessibility = 3; authored.accessibilityReview = "needs-review"; }
  if (seenIds.has(authored.id)) fail(`duplicate question id ${authored.id}`);
  seenIds.add(authored.id);
  const universe = universeById.get(authored.universeId);
  if (universe && edit) authored.scores = Object.fromEntries(universe.entities.map(entity => [entity.id, edit.members?.find(member => member.canonical === entity.canonical)?.points ?? edit.scores?.[entity.canonical] ?? authored.scores[entity.id]]));
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
  const intentKeys = new Map();
  for (const [canonical, aliases] of Object.entries(editorialIntentAliases[authored.id] ?? {})) {
    const entity = universe.entities.find((candidate) => candidate.canonical === canonical);
    if (!entity) fail(`${authored.id} assigns intent aliases to unknown answer ${canonical}`);
    for (const alias of aliases) {
      const key = normalize(alias);
      if (key.length < 3) fail(`${authored.id} has a probing-length intent alias ${alias}`);
      if (answerKeys.has(key)) fail(`${authored.id} intent alias duplicates a direct answer: ${alias}`);
      const owner = intentKeys.get(key);
      if (owner && owner !== entity.id) fail(`${authored.id} has an ambiguous intent alias: ${alias}`);
      intentKeys.set(key, entity.id);
    }
  }

  const scoreIds = Object.keys(authored.scores);
  if (scoreIds.length !== universe.entities.length)
    fail(`${authored.id} has ${scoreIds.length} rarity assignments for ${universe.entities.length} members`);
  for (const id of scoreIds) {
    if (!entityIds.has(id)) fail(`${authored.id} assigns a score to unknown member ${id}`);
    if (!supportedScores.has(authored.scores[id])) fail(`${authored.id} assigns unsupported score ${authored.scores[id]}`);
  }

  const maximum = Math.max(...Object.values(authored.scores));
  const dailyEligible = authored.dailyEligible ?? (maximum === 100 && universe.expectedCount >= 8);
  if (dailyEligible && universe.expectedCount < 8 && edit?.members) authored.dailyEligibilityReason = original.id.includes("museums") ? "Kansallisgallerian kolme museota ovat virallinen täydellinen joukko; Ateneum ja Kiasma ovat tuttuja, Sinebrychoffin museo on harvemmin spontaanisti muistettu." : "NASAn kuusi rakennettua lentokelpoista sukkulaa ovat suljettu joukko; Challenger ja Discovery tarjoavat sisääntulon, Endeavour harvemmin muistetun vaihtoehdon.";
  const accessibility = authored.accessibility ?? (dailyEligible ? 4 : 3);
  const accessibilityReview = authored.accessibilityReview ?? (dailyEligible ? "verified" : "needs-review");
  if (dailyEligible && maximum !== 100) fail(`${authored.id} is daily eligible but has no 100-point answer`);
  if (dailyEligible && !Object.values(authored.scores).some((points) => points === 10 || points === 15))
    fail(`${authored.id} is daily eligible but has no 10- or 15-point entry answer`);
  if (dailyEligible && universe.expectedCount < 3) fail(`${authored.id} is daily eligible but has fewer than three answers`);

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
        intentAliases: editorialIntentAliases[authored.id]?.[entity.canonical] ?? [],
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
    status: dailyEligible ? "active" : authored.reviewDisposition === "retire" ? "retired" : "review",
    dailyEligible,
    accessibilityReview,
    accessibility,
    ...(authored.dailyEligibilityReason ? { dailyEligibilityReason: authored.dailyEligibilityReason } : {}),
    ...(authored.baseUniverseId ? { baseUniverseId: authored.baseUniverseId } : {}),
    ...(authored.predicateId ? { predicateId: authored.predicateId } : {}),
    familyId: authored.familyId ?? authored.baseUniverseId ?? authored.universeId,
    version: 5,
    author: "Mylvisa editorial 2026-09-13",
    contentReview: decision?.classification === "RETIRE" ? "retire" : decision?.classification === "DEMOTE" ? "pending" : "verified",
    rarityReview: "editorial-reviewed",
    frequency: { status: "pending" },
  };
});

if (questions.length < 7) fail(`expected at least 7 active questions, got ${questions.length}`);
await writeFile("src/data/releases/2026-09-13.json", `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Generated ${questions.length} question records, including ${questions.filter(question => question.dailyEligible).length} Daily-eligible questions, from ${universeById.size} universes`);
