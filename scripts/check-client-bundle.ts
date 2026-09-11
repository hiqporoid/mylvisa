import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { releases } from "../src/data/releases";
async function files(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? files(join(path, e.name)) : [join(path, e.name)],
      ),
    )
  ).flat();
}
const paths = (await files(".next/static")).filter((f) =>
  /\.(js|map)$/.test(f),
);
if (!paths.length)
  throw new Error("No client bundles found; run npm run build first.");
const forbidden = releases.flatMap((r) =>
  r.questions.flatMap((q) => [q.question, q.explanation]),
);
for (const path of paths) {
  const content = await readFile(path, "utf8");
  for (const text of forbidden)
    if (
      content.includes(text) ||
      content.includes(JSON.stringify(text).slice(1, -1))
    )
      throw new Error(`Question bank leaked into ${path}`);
}
console.log(
  `PASS: no bank question text or explanations in ${paths.length} client assets.`,
);
