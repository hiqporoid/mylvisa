// Versioned, immutable snapshots. Runtime code accesses these ONLY via lib/server/bank.ts.
import initial from "./releases/2026-09-11.json" with { type: "json" };
export const releases = [
  {
    id: "2026-09-11-editorial-v4",
    effectiveFrom: "2026-09-01",
    length: 7,
    questions: initial,
  },
] as const;
