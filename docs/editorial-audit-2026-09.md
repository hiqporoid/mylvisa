# Editorial sanity audit — September 2026

## Daily difficulty audit

Working update, 22 September 2026. **NOT_READY_FOR_SMALL_PUBLIC_BETA.** This section supersedes the older release verdict and editorial examples below for the current question-bank task. The gameplay beta architecture is preserved. No new bank release has been published: the runtime still uses the 69-question historical release introduced at baseline commit `17762d237e8e7d21423ab84031e34b3e88e0a1e1`. The user subsequently reduced the question-bank scope and requested publication of the completed code and draft work; the incomplete draft remains outside the runtime.

Every one of those 69 prompts and its answer/score vector received an individual semantic decision in `docs/internal/daily-difficulty-audit-2026-09.tsv`. Current mutually exclusive decisions: KEEP 13, RESCORE 0, REWRITE 12, HARD 18, RETIRE 26. Rewrites can include score corrections. The surviving original projection is 25 standard and 18 hard; this is **not** a claim that all 43 have completed renewed source verification. The generated draft tracks source review separately and excludes pending originals from its compiled content.

Ten retirements explicitly involve excessive specialist or institutional difficulty: EU institutions, Council of Europe membership, IUCN categories, economics Nobel laureates, ASEAN, Gulf Cooperation Council, Baltic Sea Council, EEA membership, Alpine Convention signatories, and the dated DNS top-level-domain standard. Other retirements concern inadequate universe size, weak rarity tails, confusing scope or repetitive derivatives. Hard is not a rescue category for those failures.

Examples rewritten for accessibility: “Nimeä Suomen maakunta (2026)” replaces administrative classification wording; the president prompt drops catalogue terminology; Windows uses familiar consumer-version wording; Disney uses the dated animation canon rather than the Renaissance label. The UNESCO question now uses September 2026 membership, adding Aalto Works after reading the Finnish Heritage Agency's complete eight-property list. Merenkurkun saaristo changes from 85 to 60; the new property is 60, without mechanically awarding novelty 100.

The current source-checked working content contains 35 additions and 23 reconciled originals. Each record has an explicit source count, dated definition and separate accessibility, rarity, completeness and alias rationale. This 58-question draft is far below the original release threshold. A successful structural validator cannot prove factual completeness, fun, or an 80% recall rate. No population statistics are claimed. Source reconciliation found two omissions in the historical 69: Melbourne in the Summer Olympic host universe and Great Britain in the men’s ice-hockey world champion universe. Both are corrected in the unpublished draft, and the latter question is now dated through 2026.

### Selector verification

The new selector consumes unused questions before previously used ones, enforces seven rounds, at most one hard prompt, unique base universes and semantic families, at least five categories, at most two questions per category and at most two gaming/digital questions combined. Hard positions vary deterministically across rounds 2–7. Historical releases without difficulty metadata retain their exact previous selector so saved Daily runs remain reproducible.

The 120-date report is `docs/internal/beta-selection-simulation-2026-09.json`. The 58-question source-checked draft has zero days with more than one hard prompt and zero semantic/base collisions, but repeats after only five complete days; it is explicitly not an approved bank. The 43-original editorial projection repeats after four complete days. The unchanged historical 69-question selector repeats after nine complete days and, when retrospectively labelled by this audit, reaches five hard prompts. A separate 360-question synthetic fixture demonstrates at least 50 complete days before reuse over 120 dates; that verifies the algorithm, not the real bank's release horizon. The final full-bank simulation and 75-question semantic spot audit remain outstanding.

### Production test-data cleanup

Removed only the explicitly requested `MylvTest719541` profile and its single run from the Mylvisa Supabase project. The transaction asserted one exact nickname/UUID match, an anonymous identity without email, and one run. Before/after hashes of all other profile and run rows were identical. Post-transaction counts were four profiles and thirteen runs; the target had zero remaining profile/run rows. Its anonymous Auth identity was retained. The production all-time leaderboard still displayed the other existing results and omitted the deleted entry.

Distributed resolver rate limiting remains outstanding. No paid service or gameplay retry restriction has been introduced. A new question-bank release, its 75-question semantic audit and new-content production smoke test remain outstanding. The completed recap feature can ship independently while the draft stays out of the runtime.

## Historical audit — 12 September 2026

Release: `2026-09-11-editorial-v4`. Baseline: commit `bf4534f528e803659d464f5e6a9649954f478f60`, 376 Daily-eligible questions. This is an internal repository report; it is not served from `public/` or imported by client components.

## Finding and release decision

**NOT_READY_FOR_CONNECTED_BETA_SETUP.** The earlier completeness flags were not reliable editorial evidence. The audit found false membership, incomplete lists, vague open universes, incorrect time periods, specialist prompts and mechanical rarity scoring. Preserving 376 by retaining these errors would violate the quality gates. There are now **69 Daily questions**, 66 retained/repaired originals plus 3 new questions. The requested 20–30 gaming and 15–25 digital questions have **not** been achieved. Adding that many to this reduced bank would also violate the 15% concentration limit without repairing substantial broad content first.

## Review method and classifications

All 376 original Daily prompts and their complete accepted-answer/score vectors were read for Finnish clarity, wording versus membership, 25-second entry recall, general-knowledge accessibility, obvious/common tiers, exceptional tails, famous over-scoring, obscure under-scoring, strategy variety and normal-input aliases (A–J). The internal per-question ledger is `docs/internal/editorial-decisions-2026-09.json`; actual membership/wording/score/alias patches are `src/data/editorial-corrections-2026-09.json`. Family-level failures share a reason where the same defect affects several derived prompts. This is an editorial plausibility audit, **not** a human playtest, an empirical frequency study, or independent primary-source re-verification of every surviving answer.

Classification precedence: RETIRE (unbounded/incorrect construction), DEMOTE (not suitable for Daily), REWRITE (membership/wording rebuilt, sometimes also scores), RESCORE, PASS. Counts are mutually exclusive and refer only to the 376 original Daily questions:

| Classification | Count |
|---|---:|
| PASS | 14 |
| RESCORE | 30 |
| REWRITE | 22 |
| DEMOTE | 37 |
| RETIRE | 273 |

PASS means no question-specific substantive patch was required; shared Finnish country alias improvements can still apply. 48 retained original questions have changed score maps and/or membership; REWRITE and RESCORE overlap in their actual corrections, not in the classification counts. The generator excludes DEMOTE and RETIRE from Daily. Retired data remains repository history, not a playable Daily set.

## Representative corrections

The following 40 examples deliberately show only a small sample, not whole answer banks. Scores mean likelihood of spontaneous Finnish recall in this exact prompt, not factual importance. Revised derived universes can have different scores: e.g. Yellow Submarine is 30 in the full Beatles catalogue but 100 in the late-period subset. These judgments still need real beta-player calibration.

| Category after audit | Question and answer | Before → after | Reason |
|---|---|---:|---|
| Suomi | `suomi-maakunnat` — Ahvenanmaa | 100 → 30 | Distinctive, familiar island region is not exceptional recall. |
| Suomi | `suomi-maakunnat` — Keski-Pohjanmaa | 85 → 100 | Less salient mainland region provides the tail. |
| Suomen historia | `content-fi-recent-prime-ministers-all` — Mari Kiviniemi | 60 → 100 | Short tenure is less readily recalled than Sorsa. |
| Suomen historia | `content-fi-recent-prime-ministers-after-2000` — Antti Rinne | 100 → 60 | Recent PM is a less common alternative, not exceptional recall. |
| Maailmanhistoria | `maailmanhistoria-antiikin-ihmeet` — Babylonin riippuvat puutarhat | 100 → 15 | Iconic wonder was incorrectly the tail. |
| Maailmanhistoria | `maailmanhistoria-antiikin-ihmeet` — Halikarnassoksen mausoleumi | 85 → 100 | Much less likely spontaneous recall. |
| Maailmanhistoria | `content-history-us-presidents-modern` — Joe Biden | 100 → 15 | Recent prominent president is readily recalled. |
| Maailmanhistoria | `content-history-us-presidents-modern` — George H. W. Bush | 85 → 100 | Often confused with his son; context-specific tail. |
| Maantiede | `maantiede-itameri` — Venäjä | 100 → 30 | Familiar Baltic neighbour was over-rewarded. |
| Maantiede | `maantiede-itameri` — Liettua | 85 → 100 | Less salient Baltic coastline for Finnish players. |
| Maantiede | `content-geo-persian-gulf-coasts-all` — Yhdistyneet arabiemiirikunnat | 100 → 15 | Dubai/Abu Dhabi provide accessible entry. |
| Yhteiskunta | `content-nato-members-all` — Albania | 15 → 85 | Small member is not a common default answer. |
| Yhteiskunta | `yhteiskunta-eu-toimielimet` — Euroopan keskuspankki | 60 → 15 | Prominent institution, unlike two easily confused councils. |
| Tiede | `content-science-vitamins-all` — B9-vitamiini | 100 → 60 | Folate is more familiar than B5/B7. |
| Tiede | `content-science-vitamins-all` — B5-vitamiini | 85 → 100 | Less commonly recalled B vitamin. |
| Tiede | `content-science-dwarf-planets-all` — Eris | 100 → 60 | Better-known alternative than Haumea. |
| Luonto | `content-nature-iucn-categories-all` — sukupuuttoon kuollut | 30 → 10 | An immediately familiar conservation status. |
| Luonto | `content-nature-iucn-categories-all` — arvioimatta | 85 → 100 | Legitimate but less spontaneously named category. |
| Kirjallisuus | `content-literature-harry-potter-books-all` — Kuoleman varjelukset | 100 → 30 | Famous finale should not be the exceptional tail. |
| Kirjallisuus | `content-literature-harry-potter-books-all` — Puoliverinen prinssi | 85 → 100 | Less salient middle-series title. |
| Suomen kieli | `content-language-finnish-cases-all` — illatiivi | 60 → 30 | Familiar school grammar alternative. |
| Suomen kieli | `content-language-finnish-cases-all` — allatiivi | 85 → 60 | Less familiar than illative, but not maximal tail. |
| Taide | `content-fi-museums-all` — Sinebrychoffin taidemuseo | 85 → 100 | Closed three-museum National Gallery universe; less salient than Ateneum/Kiasma. |
| Musiikki | `content-music-beatles-albums-all` — The Beatles | 85 → 15 | White Album alias makes its former high score indefensible. |
| Musiikki | `content-music-beatles-albums-all` — Beatles for Sale | 60 → 100 | Less salient catalogue title. |
| Musiikki | `content-music-metallica-albums-all` — St. Anger | 85 → 30 | Widely discussed album is not rare enough for 85. |
| Musiikki | `content-music-metallica-albums-all` — Hardwired...to Self-Destruct | 30 → 100 | Less likely exact album recall. |
| Elokuvat ja televisio | `content-film-star-wars-all` — The Rise of Skywalker | 100 → 30 | Main saga finale is prominent. |
| Elokuvat ja televisio | `content-film-disney-renaissance-all` — Notre Damen kellonsoittaja | 100 → 30 | Familiar film was over-rewarded. |
| Elokuvat ja televisio | `content-film-bond-films-all` — The Living Daylights | 85 → 100 | Less salient Bond title, with Finnish title alias. |
| Urheilu | `content-sport-summer-olympic-hosts-all` — Helsinki | 85 → 10 | Finnish home Olympics must be an obvious entry. |
| Urheilu | `content-sport-ice-hockey-world-champions-all` — Neuvostoliitto | 100 → 30 | Iconic hockey power, not exceptional recall. |
| Maailma | `content-world-brics-all` — Yhdistyneet arabiemiirikunnat | 100 → 60 | Known new member is less obscure than Ethiopia. |
| Maailma | `content-world-brics-all` — Etiopia | 85 → 100 | Less spontaneously recalled member. |
| Talous | `content-economics-nobel-recent-all` — Bengt Holmström | 15 → 10 | Finnish winner is the main accessible entry. |
| Talous | `content-economics-nobel-recent-all` — Lars Peter Hansen | 30 → 100 | Specialist name must not inherit default 30. |
| Videopelit | `content-tech-nintendo-home-consoles-all` — Nintendo Switch 2 | 100 → 30 | Prominent current family should not be 100. |
| Internet ja digikulttuuri | `content-tech-windows-releases-all` — Windows Vista | 85 → 30 | Well-known consumer release, not long tail. |
| Ruoka ja kulttuuri | `content-food-finnish-protected-names-all` — Kainuun rönttönen | 85 → 60 | Recognisable protected food alternative. |
| Ruoka ja kulttuuri | `content-food-finnish-protected-names-all` — Lapin puikula | 60 → 30 | Familiar Finnish potato product. |

The original Taide bank also had a fundamental universe failure: “Nimeä kuuluisa taideteos” was retired rather than retaining arbitrary exclusions; “Viimeinen ehtoollinen” had received 60 despite being iconic. The replacement Taide question above uses the objectively bounded Kansallisgalleria museums. Thus every original category is represented in the examples, with former technology questions also illustrating both new categories. The NASA question was rebuilt as the six named Space Shuttle orbiters (including atmospheric test orbiter Enterprise), replacing a mismatched mission list.

## Membership and alias repairs

Examples of defects removed from Daily: Kongo in European/American river subsets; Feta in Italian/blue-cheese subsets; fox/wild boar in a hare set; duck/goose in a forest-grouse set; inaccurate award/decade lists. Open prompts such as “famous videogame”, generic brands, famous works and loosely bounded creative genres were not patched with invented completeness claims.

Rebuilt closed sets include Nintendo home-console families through 2025, Windows consumer releases 1995–2021, the twelve explicitly enumerated Finnish protected food names in Ruokavirasto’s 2024 list, Kansallisgalleria’s three museums, six NASA orbiters, and missing Roman emperors in the dated prompt. Country short forms, Finnish Bond and monarch titles, unique surnames and common album/platform abbreviations were added where unambiguous. Ambiguous surnames are not accepted as a unique entity.

## Final distribution

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

Gaming: 3. Internet/digital: 3. Combined 6/69 = 8.7%, below the unchanged 15% cap. Seven-question selection allows at most one of each and no repeated semantic family/universe. No uncontrolled expansion was performed; only three new questions were added, backed by Bethesda, Valve/Steam and RFC 1591.

## Score distribution

| Points | Before (376 questions) | After (69 questions) |
|---:|---:|---:|
| 10 | 732 | 145 |
| 15 | 554 | 141 |
| 30 | 893 | 190 |
| 60 | 554 | 172 |
| 85 | 421 | 113 |
| 100 | 420 | 110 |

These totals have different denominators because faulty questions were removed; they must not be interpreted as a pure before/after distribution shift for identical content. The per-question patch file is the exact reproducible record.

## Repeat horizon and remaining content work

69/69 Daily questions have a 100-point answer and a 10/15-point entry; every selected seven has a reachable 700. The 60-day deterministic simulation gives **9 complete days before the first exact repeat**, all 19 categories represented and no same-day family/universe collisions. This is substantially below the previous claimed 53 days. The unchanged original readiness test requires at least 350 questions and at least ten per category; it intentionally remains red. Carefully repair broad source-backed universes and conduct Finnish audience playtests before increasing the gaming/digital target or calling the content public-beta ready.
