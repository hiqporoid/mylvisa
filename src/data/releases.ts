// Versioned, immutable snapshots. Runtime code accesses these ONLY via lib/server/bank.ts.
import initial from "./releases/2026-09-11.json" with { type: "json" };
import mylvinta from "./releases/2026-09-13.json" with { type: "json" };
export const releases = [
  {
    id: "2026-09-11-editorial-v4",
    effectiveFrom: "2026-09-01",
    length: 7,
    questions: initial,
  },
  {
    id: "2026-09-13-mylvinta-v5",
    effectiveFrom: "2026-09-13",
    length: 7,
    questions: mylvinta,
  },
] as const;
