# Bank quality report — 12 September 2026

Release `2026-09-11-editorial-v4`, generated from repository authorship and editorial patches. This report supersedes earlier 85/376-question claims.

**NOT_READY_FOR_CONNECTED_BETA_SETUP**: the content readiness floor is not met. Structural validation alone did not detect the prior false memberships; see [editorial audit](editorial-audit-2026-09.md).

- Total records: 549.
- Daily: 69; non-Daily retained/review: 38; retired: 442.
- Daily canonical answer entries: 871.
- Gaming: 3; Internet/digital: 3; concentration: 8.7% (limit 15%).
- Original audit: PASS 14, RESCORE 30, REWRITE 22, DEMOTE 37, RETIRE 273.
- 69/69 have reachable 100; every daily seven reaches 700.
- All Daily accessibility scores meet >=4, with editorial caveats explained in the audit.
- Complete repeat-free horizon: 9 days; first repeat in the 60-day simulation: 2026-09-10.
- All 19 categories appear; no same-day family/universe collisions in the 60-day simulation.
- Additional one-year selection test checks seven questions, 700 maximum, semantic-family uniqueness and gaming/digital caps.

| Category | Daily |
|---|---:|
| Suomi | 5 |
| Suomen historia | 3 |
| Maailmanhistoria | 7 |
| Maantiede | 8 |
| Yhteiskunta | 8 |
| Tiede | 5 |
| Luonto | 2 |
| Kirjallisuus | 1 |
| Suomen kieli | 1 |
| Taide | 1 |
| Musiikki | 5 |
| Elokuvat ja televisio | 8 |
| Urheilu | 3 |
| Teknologia | 1 |
| Talous | 1 |
| Ruoka ja kulttuuri | 1 |
| Maailma | 3 |
| Videopelit | 3 |
| Internet ja digikulttuuri | 3 |

| Points | Before (376 questions) | After (69 questions) |
|---:|---:|---:|
| 10 | 732 | 145 |
| 15 | 554 | 141 |
| 30 | 893 | 190 |
| 60 | 554 | 172 |
| 85 | 421 | 113 |
| 100 | 420 | 110 |

## Checks

`npm run generate:bank` reproduces the snapshot. `npm run validate:bank` runs schema, completeness, source-presence, accessibility, rarity, max-score, category concentration and repeat/family simulations without network. Source-presence validation is not a guarantee that an external page proves every answer; editorial source review is a separate requirement. Do not weaken gates to rehabilitate retired content.

The existing readiness unit test (>=350 Daily and >=10 per category) fails as expected. This is a real unmet requirement, not a waived test. Gaming/digital quantity targets and the old repeat horizon are also unmet. All other check outcomes and deployment details are recorded in the completion report and Supabase setup document.
