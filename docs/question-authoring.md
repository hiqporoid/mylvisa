# Kysymysten kirjoittajan opas

Mylvisa-kysymys pyytää nimeämään yhden jäsenen objektiivisesti määritellystä joukosta. Kysymys, johon tavallinen suomalainen pelaaja ei keksi yhtäkään vastausta, on huono; haastavuuden pitää syntyä harvinaisemman jäsenen löytämisestä.

## Kaksi erillistä lähdettä

`src/data/universes.ts` on jäsenyyden lähde. Jokainen universe sisältää:

- virallisen tai muuten perustellun lähde-URL:n;
- näkyvän viitepäivän;
- jäsenyyden perusteen;
- `expectedCount`-määrän;
- jokaisen kanonisen vastauksen ja vain yksiselitteiset aliakset.

`src/data/question-authorship.ts` on kysymys- ja rarity-toimitus. Sen `scores`-kartta käyttää universe-jäsenen pysyvää ID:tä, ei taulukkoindeksiä. `scripts/generate-rarity-bank.mjs` saa vain yhdistää nämä lähteet release-JSON:ksi; se ei saa keksiä, leikata tai järjestää jäsenyyttä eikä laskea pisteitä.

Tuotantokysymyksellä on lisäksi `completeness.status: "verified"`, `contentReview: "verified"` ja `rarityReview: "editorial-reviewed"`. Raaka, tarkistamaton tai osittainen kysymys jää pois aktiivisesta release-snapshotista.

## Rarity-arvio

Pisteet ovat 10, 15, 30, 60, 85 tai 100. Ne arvioivat suomalaisen yleissivistyspelaajan spontaania recall-todennäköisyyttä 25 sekunnissa:

- 10: erittäin ilmeinen/default-vastaus;
- 15: hyvin tavallinen;
- 30: tuttu mutta ei automaattinen;
- 60: melko harvinainen;
- 85: harvinainen;
- 100: poikkeuksellinen mutta puolustettava.

Älä käytä järjestystä, aakkosia, väkilukua, kronologiaa, listan pituutta tai satunnaisuutta pisteiden määrittämiseen. Kaikkia kuutta tieriä ei tarvitse käyttää: yhdellä kysymyksellä voi olla yksi jäsen, toisella useita 10-pisteen jäseniä ja kolmannella ei lainkaan 100-pisteen jäseniä.

Aliakset osoittavat täsmälleen yhteen kanoniseen vastaukseen. Normalisointi hoitaa kirjainkoon, turvalliset välimerkit ja yhden vierekkäisen merkkienvaihdon; yleisiä kirjoitusvirheitä ei lisätä aliaksiksi.

## Julkaisun tarkistus

1. Hae täydellinen jäsenlista nimetystä auktoritatiivisesta lähteestä.
2. Rajaa kysymys lähteen ja viitepäivän mukaiseksi; lisää päivämäärä promptiin, jos nykyinen jäsenyys voi muuttua.
3. Tarkista, että tavallinen pelaaja voi nimetä vähintään yhden vastauksen.
4. Arvioi pisteet jäsenkohtaisesti: “kuinka todennäköisesti suomalainen aikuinen kirjoittaa tämän 25 sekunnissa?”
5. Aja `npm run generate:bank`, `npm run validate:bank` ja testit. Generatorin virhe tarkoittaa, että toimitusdataa pitää korjata.

Jos täydellistä lähdejoukkoa ei voi todentaa, kysymys rajataan objektiivisesti tai retiretetään. Osittaista käsin valittua esimerkkilistaa ei julkaista täydellisenä universumina.
