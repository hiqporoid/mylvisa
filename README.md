# Mylvisa

Mylvisa on suomalainen päivittäinen rarity-tietopeli. Kysymyksessä on suljettu joukko oikeita vastauksia: jokainen hyväksytty vastaus on onnistuminen, mutta harvinaisemman vastauksen löytäminen tuottaa enemmän pisteitä.

Päivän visa on kaikille sama Helsinki-kalenteripäivän aikana. Pelissä on seitsemän kierrosta, kolmen sekunnin lukuvaihe ja sen jälkeen 25 sekunnin vastausaika. Maksimi on 700 pistettä. Päivän yritys ja tulos tallennetaan selaimen paikalliseen tallennustilaan.

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

Palvelin lähettää selaimeen ennen vastausta vain kysymyksen, kategorian, numeron ja universumin tunnisteen. Hyväksytyt vastaukset, aliakset, pisteet, lähteet ja selitykset pysyvät server-only-moduuleissa. `check:client` etsii tuotannon JavaScript- ja source map -tiedostoista pankin tekstejä ja vastausolioita.

## Päivävalinta ja ajastin

`helsinkiDate` käyttää aina `Europe/Helsinki`-aikavyöhykettä. Aktiivinen release valitaan sen `effectiveFrom`-päivän perusteella. Valitsin käyttää versionoitua FNV-1a-hajautusta, kierroksia ja ilman korvaamista tapahtuvaa valintaa. Seitsemän eri kategoriaa ja universumia ovat ensisijaisia tavoitteita, eikä kysymys toistu saman 36 päivän siemenvaiheen aikana. Kun pankki kasvaa vähintään 630 kysymykseen, sama rakenne antaa vähintään 90 päivän käytännön kierron.

Kierroskello tallentaa absoluuttiset aikaleimat `startedAt`, `previewUntil` ja `deadline`. Selain piirtää jäljellä olevan ajan näistä aikaleimoista, joten välilehden taustalla olo tai hidastunut renderöinti ei palauta aikaa. Palvelin tarkistaa saman 28 sekunnin ikkunan lähetyksen yhteydessä ja muuttaa myöhästyneen vastauksen aikakatkaisuksi.

## Kysymysmalli ja vastausten tarkistus

Jokainen kysymys sisältää `id`, `prompt`, `category`, `universeId`, objektiivisen `referenceDefinition`-rajauksen, vähintään viisi vastausoliota, `explanation`-tekstin, lähteen, tagit, elinkaaritiedot ja rarity-metadatan. Vastausolio sisältää `canonical`-nimen, eksplisiittiset `aliases`-aliakset, pisteet, suomalaisen rarity-nimen, toimituksellisen ja tulevan empiirisen tierin sekä provenienssin.

Tuetut pisteet ovat **10, 15, 30, 60, 85 ja 100**. 10 ja 15 ovat helposti mieleen tulevia vastauksia; 60–100 ovat harvinaisempia oivalluksia. Mikään hyväksytty vastaus ei ole huono.

Normalisointi tekee NFKC-Unicode-normalisoinnin, pienaakkoset, reunojen ja toistuvan välilyönnin siistimisen sekä turvalliset välimerkkimuunnokset. Ääkköset säilyvät. Aliakset rekisteröidään erikseen. Lisäksi sallitaan yksi vierekkäisten merkkien vaihtuminen vain, jos tulos yhdistyy täsmälleen yhteen vastausolioon. Yleistä Levenshtein-etäisyyttä, osumista tai epämääräistä kirjoitusvirheiden hyväksymistä ei käytetä.

## Pankin laajentaminen

Lue [kysymysten kirjoittajan opas](docs/question-authoring.md) ja [rarity-malli](docs/rarity-model.md). Lisää kysymyksiä toimituksen lähdeskriptiin, muodosta snapshot ja aja validointi. `npm run validate:bank` ilmoittaa muun muassa vähimmäisvastausten puuttumisesta, pisteistä, alias- ja ID-törmäyksistä, päällekkäisestä tekstistä, vanhentumisesta, epätasaisesta rarity-jakaumasta, lähdepuutteista ja epämääräisistä joukkorajauksista. Kaikki 17 aktiivista kategoriaa vaaditaan.

Siemenpankissa on 255 aktiivista kysymystä ja 2 101 kanonista vastausta. Kysymykset on jaettu 15 kappaleeseen jokaiseen kategoriaan: Suomi, Suomen historia, Maailmanhistoria, Maantiede, Yhteiskunta, Tiede, Luonto, Kirjallisuus, Suomen kieli, Taide, Musiikki, Elokuvat ja televisio, Urheilu, Teknologia, Talous, Ruoka ja kulttuuri sekä Maailma. Vanha 112 kysymyksen snapshot on `src/data/retired/`-hakemistossa eikä osallistu valintaan.

## Vercel ja tulevat laajennukset

Sovellus on tavallinen Next.js App Router -sovellus ja tuotantorakennus toimii Vercelissä Node-runtime-reitillä. Tietokantaa, salaisuuksia, cron-tehtävää tai live-deploymentia ei ole tässä tehtävässä lisätty.

Seuraava versio voi lisätä `attempt`-rajapinnan, kirjautumisen, idempotenssiavaimen, palvelimen yhden yrityksen eston, nimettömän taajuuskeräyksen ja leaderboardin ilman että puhdasta valinta-, normalisointi- tai pisteytysmoottoria tarvitsee vaihtaa. Taajuuskalibroinnin suunnitelma on [docs/rarity-model.md](docs/rarity-model.md).
