import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { releases } from "../src/data/releases";

async function files(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]))).flat();
}

const paths = (await files(".next/static")).filter((path) => /\.(js|map)$/u.test(path));
if (!paths.length) throw new Error("No client bundles found; run npm run build first.");
const forbidden = new Set<string>();
for (const release of releases) for (const question of release.questions) {
  for (const value of [question.prompt, question.explanation, question.referenceDefinition, ...question.answers.flatMap((answer) => [answer.canonical, ...answer.aliases])])
    if (value.length >= 12) forbidden.add(value);
}
for (const path of paths) {
  const content = await readFile(path, "utf8");
  for (const value of forbidden) {
    if (content.includes(value) || content.includes(JSON.stringify(value).slice(1, -1)))
      throw new Error(`Question bank leaked into ${path}: ${value.slice(0, 40)}`);
  }
}
console.log(`PASS: ${paths.length} client assets contain no question prompts, explanations or answer records.`);
