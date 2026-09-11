# Mylvisa

**Pieni visa. Avara maailma.** A Finnish daily general-knowledge game: seven free-text questions, one shared quiz per Helsinki calendar date, server-side answer checking, and a little explanation after every answer.

Built with Next.js 16 App Router, React 19, TypeScript, and ordinary CSS. No account, database, analytics, external API, production secret, or paid service is required. Fonts and their license are committed and self-hosted. This is an original application and question bank, not a copy of another quiz.

## Playable MVP

- One daily attempt per browser by default, with saved answers, progress and completed result.
- Single-answer questions and multiple valid answers with editorial score tiers: **10, 20, 30, 40, 50, 70, 100**.
- Feedback with the accepted/canonical answer, earned points and an explanation; a complete score breakdown at the end.
- Spoiler-free sharing through Web Share, clipboard, or a selectable text fallback.
- Previous 30 days available as **unscored practice**, from 1 September 2026 onward.
- Mobile and desktop layouts, Finnish copy, keyboard support, visible focus, reduced-motion support, and accessible native forms/disclosures.
- 112 seed questions; every category has **3 easy, 3 medium and 1 hard** question. Total: **48 easy, 48 medium, 16 hard**.

| Category              | Questions |
| --------------------- | --------: |
| Suomi                 |         7 |
| Historia              |         7 |
| Maantiede             |         7 |
| Yhteiskunta           |         7 |
| Tiede                 |         7 |
| Luonto                |         7 |
| Kirjallisuus          |         7 |
| Kieli                 |         7 |
| Taide                 |         7 |
| Musiikki              |         7 |
| Elokuvat ja televisio |         7 |
| Urheilu               |         7 |
| Teknologia            |         7 |
| Talous                |         7 |
| Ruoka ja kulttuuri    |         7 |
| Maailma               |         7 |

## Local development

Use **Node 22.12 or newer**; `.nvmrc` selects Node 22. Vitest 5 requires Node 22.12+. npm and a lockfile are used throughout.

```sh
nvm use
npm ci
npm run dev
```

Open `http://localhost:3000`. No `.env` file is needed. The server must be running: this app cannot be deployed as a static export because answers are checked on the server.

```sh
npm run typecheck
npm run lint
npm test
npm run validate:bank
npm run build
npm run check:client
npx playwright install chromium
npm run test:e2e
```

The end-to-end suite starts the production server after a build. It tests desktop and mobile Chromium, full play and resume, sharing, unscored practice, accessibility using axe, network recovery, blocked storage, keyboard operation and an open-tab midnight rollover. CI uses the same commands. `npm run test:watch` is available during development.

ESLint is pinned to the 9.x version compatible with Next.js's bundled React lint plugin. ESLint 10 currently causes that plugin to crash (`getFilename` API incompatibility); no lint rules are disabled to work around it. Review this compatibility pin when upgrading the Next.js toolchain.

## Architecture

```text
src/data/releases/           Immutable JSON question-bank snapshots
src/data/releases.ts        Effective dates, release IDs, quiz length
src/lib/quiz/               Pure date, schema, selection, matching, scoring, validation
src/lib/server/             server-only bank loading and game service
src/app/api/quiz/route.ts    Bounded, validated, uncached HTTP interface
src/lib/client/             Browser persistence, game state and sharing
src/components/             Presentation and accessible interactions
```

The page sends only the date and quiz length into the client component. The bank and game service import `server-only`. Neither answer data nor the question bank is part of a client bundle. The build scan checks client JS/source maps for bank question text and explanations, and tests assert the precise pre-answer response shape.

`GET /api/quiz` returns today's first public question, date, length and server timestamps. `POST /api/quiz` takes `{ date, mode, answers, releaseId? }`, where `answers` is the ordered transcript submitted so far. It recomputes the daily set and evaluates only submitted positions, then returns their feedback and the next public question. An empty string explicitly skips a question. A maximum/total summary appears only once all questions are answered.

The browser never sends an authoritative score or arbitrary question ID. The server checks the complete payload, rejects unsupported fields, limits answers to 160 characters, limits body size while streaming, rejects cross-origin browser requests, and uses `private, no-store` responses. React renders text without raw HTML. Security headers block framing and embedded objects. See [architecture](docs/architecture.md) for boundaries and extension points.

## Daily selection

1. Convert the current instant with `Intl.DateTimeFormat` and the explicit **Europe/Helsinki** time zone.
2. Select the immutable release with the latest effective date at or before that date. Length defaults to seven and is stored per release, not taken from the browser.
3. Split dates into deterministic deck cycles: `floor(active release size / quiz length)` days, with a minimum of one. The initial bank therefore has a 16-day cycle.
4. Replay the requested cycle from its start. For each day, filter active questions by inclusive validity dates and draw without replacement where possible.
5. Allocate difficulty quotas proportionally to the remaining deck using the largest-remainder method. Prefer unused categories within the daily quota, then balance difficulty/order using a stable FNV-1a seed from the engine version, release, cycle, day, position and question ID. Ties use stable ID order.

Same date and release always yield the same questions **in the same order**, independently of process, request, machine time zone and input array order. No `Math.random()` is used, and the bank is never mutated. Seven unique categories are preferred; late in a deck, depleted categories may make repetition necessary. The seed bank has one hard question every day of a cycle. No question repeats within its 16-day cycle. At cycle boundaries a recent question can reappear. Remainders shorter than a full quiz sit out that cycle. Validity changes can require reuse earlier if the eligible fresh pool becomes too small.

The engine rejects invalid lengths and insufficient eligible pools. Never edit an already effective release in place. Schedule a new snapshot for a future Helsinki date to preserve today's and historical quizzes. Also version the selection algorithm when changing it; keep the old implementation for releases already published. Full instructions: [question authoring](docs/question-authoring.md).

## Midnight rollover

Both initial HTML and API responses are dynamic, without daily CDN caching. The API is the source of time truth. It supplies `serverNow` and the next Helsinki midnight. The client schedules a refresh based on the server-relative delay and checks on tab focus/visibility. The server rejects an answer for yesterday with `DAY_CHANGED`; the client switches to the new day. A quiz must be completed before midnight.

The next-midnight function searches for the first instant belonging to the next Helsinki date, so spring's 23-hour and autumn's 25-hour days work correctly. Browser local time zones do not choose the quiz. Tests cover summer, winter and both DST transitions.

## Question schema and matching

Each question has a stable ID, Finnish question text, category, optional subcategory, difficulty, answer objects (`canonical`, `points`, `aliases`, optional answer-specific `explanation`), canonical display answer, shared explanation, source notes/optional HTTPS URLs, tags, evergreen flag, optional validity bounds, status, version and optional author. Zod validates records at build time and the server boundary.

Matching uses **NFKC Unicode normalization**, Finnish case-folding, trimmed/collapsed whitespace, common punctuation normalization, normalized apostrophes and word-internal hyphens. Numeric decimal comma and point are equivalent; numeric minus signs are preserved. Finnish ä/ö/å and other diacritics are preserved. Exceptions such as `Lonnrot` are explicit editorial aliases, not blanket accent removal. There is no fuzzy distance, substring matching, stemming, or automatic acceptance of plausible typos. `Kekkonen` and `Urho Kekkonen` are listed explicitly; `Kekonen` and `Urho` do not pass. Multiple-answer questions still ask for **one** response.

Wrong/blank answers earn zero. A multi-answer question's maximum is its highest single answer score, not the sum of alternatives. The final maximum includes unanswered questions. Practice scores are zero and cannot be shared as daily scores. Score tiers are editorial choices, not measured popularity statistics.

## Maintaining and expanding content

Read [docs/question-authoring.md](docs/question-authoring.md). Run `npm run validate:bank` before every content change. Validation reports malformed records, unknown/missing active categories, duplicate IDs, duplicate and near-identical text, missing answers, unsupported tiers, normalized alias collisions, invalid/reversed dates and expired records. Cross-answer collisions are errors; redundant aliases and similar question text are review warnings.

Every initial question includes a provenance/source note. Selected records also have directly checked primary-source URLs. This is a curated seed, **not a completed independent fact audit of all 112 records**. The next content pass should verify each source, add direct links, check natural accepted Finnish forms and assess difficulty with players. Published explanations are original short summaries. No content is fetched at runtime.

## Vercel

Import the repository as a Next.js project. Use Node 22, `npm ci`, and `npm run build`; leave the output directory at the framework default. API routes use the Node runtime. No secret, cron, database, DNS change or custom domain is needed for this MVP. No live deployment has been configured by this task.

Use a normal single production deployment for all users. A rolling deployment serving two incompatible engine versions can briefly disagree; release IDs help detect stale clients, and future-dated immutable bank releases prevent most content-related disagreement. Run the production build and client-leak check before deployment.

## Deliberate MVP limits and next steps

- Local storage is a convenience rule, **not anti-cheat**. Clearing it, private browsing, another device or manual API replay allows another attempt. The transcript is not authenticated. Do not trust this protocol for prizes or global rankings.
- Source files are version controlled. Anyone with repository access can read the bank; keeping it out of browser assets does not hide a public repository.
- No accounts, leaderboard, server-side attempt ledger, global rate-limit store, aggregate analytics or streak UI. No offline answering. Archive attempts are intentionally temporary and may contain questions seen on other dates.
- Daily answers and results stay on the device. They are sent to this application's server for checking, but application code does not log them or store them remotely. Clearing browser site data removes local results.
- Before adding a leaderboard, add durable server-owned attempts, atomic per-question submissions, idempotency, authentication/anonymous device sessions, rate limiting and a privacy policy. Reuse the pure engine and keep the presentation contract.
- Expand to a reviewed, balanced bank of 500–1,000 questions with direct source links, editorial review metadata, a larger range of multi-answer questions, and release stability fixtures. Consider committed daily schedules if the bank or traffic grows substantially.
