> Gameplay release (14 September 2026): the Supabase-connected Daily, authoritative round deadlines and leaderboard remain in place. Invalid answer attempts are non-terminal, editorial canonicalisation is available after submission, and accepted answers advance the Mylvintäaalto. The trusted Daily bank still contains 69 questions; the separate 300–400 question expansion is intentionally deferred.

# Mylvisa

Mylvisa on suomalainen päivittäinen rarity-tietopeli. Kysymyksessä on suljettu joukko oikeita vastauksia: jokainen hyväksytty vastaus on onnistuminen, mutta harvinaisemman vastauksen löytäminen tuottaa enemmän pisteitä.

Päivän visa on kaikille sama Helsinki-kalenteripäivän aikana. Pelissä on seitsemän kierrosta, kolmen sekunnin lukuvaihe ja sen jälkeen 25 sekunnin vastausaika. Virheellistä yritystä saa korjata alkuperäisen kellon käydessä. Maksimi on 700 pistettä eli 7000 MYLV. Tuotannon Daily-run ja tulos tallennetaan Supabaseen; harjoitus käyttää paikallista transcriptia.

## Kehitys

Käytä Node 22.12:ta tai uudempaa ja asenna riippuvuudet lukon perusteella:

```sh
nvm use
npm ci
npm run dev
```

Avaa `http://localhost:3000`. Tuotantotarkistukset:

```sh
npm run typecheck
npm run lint
npm test
npm run validate:bank
npm run build
npm run check:client
npm run test:e2e
```

`npm run generate:bank` muodostaa versionhallittavan JSON-snapshotin toimituksellisesta lähdedatasta. E2E-testit käynnistävät tuotantorakennuksen ja testaavat Chromiumilla työpöytä- ja mobiilinäkymän.

## Rakenne

```text
src/data/releases/             aktiivinen, jäädytetty rarity-kysymyspankki
src/data/retired/              aiempi 112 kysymyksen pankki historiallisena
src/lib/quiz/                  schema, valinta, normalisointi, pisteet ja ajastin
src/lib/server/                server-only pankki ja pelipalvelu
src/lib/client/                paikallinen tila ja jakaminen
src/components/                pelin käyttöliittymä
scripts/                       pankin generointi, validointi ja client-leak-tarkistus
tests/                         Vitest- ja Playwright-testit
```

Palvelin lähettää selaimeen ennen vastausta vain kysymyksen, kategorian, numeron ja universumin tunnisteen. Hyväksytyt vastaukset, aliakset, intent-aliakset, pisteet, lähteet ja selitykset pysyvät server-only-moduuleissa. `check:client` etsii tuotannon JavaScript- ja source map -tiedostoista pankin tekstejä ja vastausolioita. Katso [vastausten resolver](docs/answer-resolution.md) ja [Mylvintäaalto](docs/mylvinta-progression.md).

## Päivävalinta ja ajastin

`helsinkiDate` käyttää aina `Europe/Helsinki`-aikavyöhykettä. Aktiivinen release valitaan sen `effectiveFrom`-päivän perusteella. Valitsin käyttää versionoitua FNV-1a-hajautusta, kierroksia ja ilman korvaamista tapahtuvaa valintaa. Daily-eligible-kysymys ei toistu saman valitsinsyklin aikana; todellinen kiertohorisontti on `floor(dailyEligibleCount / 7)` päivää.

Kierroskello tallentaa absoluuttiset aikaleimat `startedAt`, `previewUntil` ja `deadline`. Selain piirtää jäljellä olevan ajan näistä aikaleimoista, joten välilehden taustalla olo, virheellinen yritys, vahvistus tai hidastunut renderöinti ei palauta aikaa. Palvelin tarkistaa saman 28 sekunnin ikkunan jokaisella yrityksellä ja päättää myöhästyneen yrityksen aikakatkaisuun.

## Kysymysmalli ja vastausten tarkistus

Jokainen kysymys sisältää `id`, `prompt`, `category`, `universeId`, objektiivisen `referenceDefinition`-rajauksen, vastausoliot, lähteen, elinkaaritiedot ja accessibility-metadatan. Vastausolio sisältää `canonical`-nimen, suoraan hyväksyttävät `aliases`-aliakset, valinnaiset kysymyskohtaiset `intentAliases`-ilmaukset, pisteet, rarity-nimen ja provenienssin. Intent-alias voi vain vahvistaa yhden jo tunnistetun käsitteen; se ei ole typeahead tai vihjehaku.

Tuetut pisteet ovat **10, 15, 30, 60, 85 ja 100**. 10 ja 15 ovat helposti mieleen tulevia vastauksia; 60–100 ovat harvinaisempia oivalluksia. Mikään hyväksytty vastaus ei ole huono.

Normalisointi tekee NFKC-Unicode-normalisoinnin, pienaakkoset, reunojen ja toistuvan välilyönnin siistimisen sekä turvalliset välimerkkimuunnokset. Ääkköset säilyvät. Aliakset rekisteröidään erikseen. Lisäksi sallitaan yksi vierekkäisten merkkien vaihtuminen vain, jos tulos yhdistyy täsmälleen yhteen vastausolioon. Yleistä Levenshtein-etäisyyttä, osumista tai epämääräistä kirjoitusvirheiden hyväksymistä ei käytetä.

## Pankin laajentaminen

Lue [kysymysten kirjoittajan opas](docs/question-authoring.md) ja [rarity-malli](docs/rarity-model.md). Lisää kysymyksiä toimituksen lähdeskriptiin, muodosta snapshot ja aja validointi. `npm run validate:bank` ilmoittaa muun muassa vähimmäisvastausten puuttumisesta, pisteistä, alias- ja ID-törmäyksistä, päällekkäisestä tekstistä, vanhentumisesta, epätasaisesta rarity-jakaumasta, accessibility-portista ja lähdepuutteista. Daily-kysymys tarvitsee vähintään yhden 10/15-pisteen sisääntulon ja tosiasiallisen 100-pisteen vastauksen.

Nykyinen julkaisu sisältää 549 säilytettyä kysymystietuetta, joista 69 on daily-eligible. Se ei vielä täytä 300–400 aktiivisen Daily-kysymyksen sisältötavoitetta. Yksityiskohtainen auditointi on [bank-quality-report-2026-09.md](docs/bank-quality-report-2026-09.md).

## Vercel ja Supabase

Sovellus on Next.js App Router -sovellus Vercelissä. Supabase Auth antaa anonyymin identiteetin, `daily_runs` säilyttää yhden versionoidun runin käyttäjää ja Helsinki-päivää kohden, ja service-role-only RPC lukitsee yhden terminaalituloksen kierrosta kohden. Leaderboard käyttää edelleen vain pistemäärää; MYLV on siitä johdettu esitysarvo. Asennusohje on [docs/supabase-setup.md](docs/supabase-setup.md).
