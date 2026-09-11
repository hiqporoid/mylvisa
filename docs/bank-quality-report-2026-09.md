# Mylvisa question-bank quality report — 2026-09-11

This report describes release `2026-09-01-rarity-v3` after the accessibility and max-score gates were added.

## Release totals

- 204 question records in the release.
- 85 daily-eligible questions.
- 119 retained for review/future modes; 0 retired in this snapshot.
- 2,849 canonical answers in the daily bank; median 22 answers/question.
- 85/85 daily questions have a reachable 100-point answer and a 10- or 15-point entry answer.
- Seven selected daily questions therefore have a derived reachable maximum of `7 × 100 = 700`.
- The current repeat horizon is `floor(85 / 7) = 12` complete days, not the requested 45–50 days. The bank is not large enough for the public-beta target.

## Accessibility and review gates

All daily records have `contentReview: verified`, `rarityReview: editorial-reviewed`, `accessibilityReview: verified`, and accessibility score 4. The retained review records are intentionally excluded from normal selection. No active record is selected by position; scores remain attached to stable entity IDs.

Accessibility distribution across the release:

| Score | Questions |
| ---: | ---: |
| 1 | 0 |
| 2 | 0 |
| 3 | 18 |
| 4 | 186 |
| 5 | 0 |

The score-3 records are retained for harder modes and are not daily eligible.

## Score tiers in the daily bank

| Points | Canonical answers |
| ---: | ---: |
| 10 | 251 |
| 15 | 20 |
| 30 | 2,198 |
| 60 | 31 |
| 85 | 24 |
| 100 | 325 |

## Category distribution

| Category | Daily questions |
| --- | ---: |
| Suomi | 1 |
| Suomen historia | 0 |
| Maailmanhistoria | 0 |
| Maantiede | 28 |
| Yhteiskunta | 2 |
| Tiede | 23 |
| Luonto | 1 |
| Kirjallisuus | 0 |
| Suomen kieli | 8 |
| Taide | 0 |
| Musiikki | 0 |
| Elokuvat ja televisio | 0 |
| Urheilu | 0 |
| Teknologia | 0 |
| Talous | 5 |
| Ruoka ja kulttuuri | 0 |
| Maailma | 17 |

The distribution is not yet broad enough for a polished 400-question daily product. More verified source families are needed before filling the empty categories.

## Verified universes

The release retains the original 25 verified universes and adds two base families:

- UN country membership snapshot: `world-countries-195-2026`.
- IUPAC periodic-table snapshot: `iupac-alkuaineet-118-2026`.

The new bank contains 179 deterministic derived-universe records. Each derived record stores `baseUniverseId`, `predicateId`, expected count, source, and membership basis. The source references are [United Nations member states](https://www.un.org/about-us/member-states), [IUPAC’s periodic table](https://iupac.org/what-we-do/periodic-table-of-elements/), EU, NATO, OECD, OPEC, G20, HELCOM, and Commonwealth primary pages.

## Audit of the original 25 questions

Kept as Daily after the new gates:

`suomi-presidentit`, `suomi-kansallispuistot`, `maantiede-itameri`, `maantiede-etel-amerikka`, `yhteiskunta-eu-jasenet`, `yhteiskunta-g7`, and `tiede-yksikirjaimiset-symbolit`.

Retained for review/future modes because the set is small, lacks a defensible 100-point tail, or needs a broader accessibility review:

`suomi-unesco-kohteet`, `suomi-maakunnat`, `suomi-nobel-suomi`, `kirjallisuus-nobel-kirjallisuus`, `maantiede-mustameri`, `maantiede-suurimmat-valtameret`, `yhteiskunta-yk-kielet`, `yhteiskunta-eu-toimielimet`, `tiede-aurinkokunta`, `tiede-si-perusyksikot`, `tiede-sahkomagneettinen-spektri`, `musiikki-eurovision-voittajat`, `elokuvat-ja-televisio-bond-nayttelijat`, `elokuvat-ja-televisio-miyazaki`, `maailmanhistoria-apollo-lennot`, `maailmanhistoria-antiikin-ihmeet`, `urheilu-jalkapallon-maailmanmestarit`, and `urheilu-kymmenottelu`.

## Release verdict

`NOT_READY_FOR_PUBLIC_BETA`

The gameplay/scoring invariants are release-safe, but the bank is still below the requested 360–400 truthful daily questions, the repeat horizon is only 12 days, and the category distribution needs more verified source families. The implementation deliberately reports this gap instead of manufacturing completeness or a false 400-question target.
