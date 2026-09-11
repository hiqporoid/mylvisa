# Kysymysten kirjoittajan opas

Mylvisa-kysymys pyytää nimeämään yhden jäsenen objektiivisesti määritellystä joukosta. Kysymys, johon useimmat eivät keksi yhtäkään vastausta, on yleensä huono Mylvisa-kysymys. Vaikean osan pitää olla harvinaisemman hyväksytyn vastauksen löytäminen, ei minkään vastauksen löytäminen.

## Tietue

```json
{
  "id": "maantiede-itämeri",
  "prompt": "Nimeä Itämereen rannikkonsa ulottava valtio.",
  "category": "maantiede",
  "universeId": "maantiede-itameri",
  "referenceDefinition": "Suljettu lista Itämeren rannikkovaltioista, jäädytetty 1.1.2024.",
  "answers": [
    {
      "canonical": "Suomi",
      "aliases": ["Finland"],
      "points": 10,
      "tier": "Ilmeinen valinta",
      "editorialTier": "10",
      "effectiveTier": "10",
      "provenance": "Lähteen nimi"
    },
    {
      "canonical": "Liettua",
      "aliases": [],
      "points": 85,
      "tier": "Syvä tieto",
      "editorialTier": "85",
      "effectiveTier": "85",
      "provenance": "Lähteen nimi"
    }
  ],
  "explanation": "Vastaus kuuluu rajattuun rannikkovaltioiden joukkoon.",
  "source": { "title": "Julkinen lähde", "url": "https://example.org/source" },
  "tags": ["maantiede", "rarity"],
  "evergreen": true,
  "status": "active",
  "version": 2,
  "rarityReview": "editorial",
  "frequency": { "status": "pending" }
}
```

`id` on pieniä ASCII-merkkejä sisältävä pysyvä tunniste. `universeId` kertoo valitsimelle, ettei samasta vastausmaailmasta oteta kahta kysymystä samaan päivään. `referenceDefinition` kertoo täsmälleen, mikä lista on hyväksytty: käytä virallista luetteloa, standardia tai jäädytettyä tilastopäivää. Vältä sanoja kuten “kuuluisa”, “paras” ja “suosittu”, ellei niitä ole sidottu nimettyyn objektiiviseen listaan.

## Vastaukset ja rarity

Lisää yleensä 8–30 kanonista vastausta. Vähintään viisi on rakennevaatimus; poikkeus vaatii erillisen toimituksellisen perustelun. Jokaisella vastauksella on pisteet 10, 15, 30, 60, 85 tai 100. Järjestä vastaukset karkeasti sen mukaan, mitä suomalainen pelaaja kirjoittaisi spontaanisti 25 sekunnissa: 10 ja 15 ovat ilmeisiä, 60–100 harvinaisempia. Älä anna lisäpisteitä siksi, että itse fakta olisi vaikeampi.

Jokaisessa tavallisessa kysymyksessä pitää olla vähintään yksi 10/15 pisteen ja yksi 60/85/100 pisteen vastaus sekä vähintään kolme eri tieriä. `editorialTier` ja `effectiveTier` ovat nyt samat. Myöhemmin `effectiveTier` voidaan laskea havaituista vastausmääristä ilman että kysymyksen muoto muuttuu.

Aliakset osoittavat täsmälleen yhteen kanoniseen vastaukseen. Lisää vain viralliset rinnakkaisnimet, yksiselitteiset lyhenteet ja yleinen nimi, kun se ei törmää toiseen vastaukseen. Kirjainkoko, välilyönnit ja turvalliset välimerkit normalisoituvat jo. Yleisiä kirjoitusvirheitä ei lisätä; moottori sallii yhden vierekkäisen merkin vaihtumisen vain yksiselitteisessä tapauksessa.

## Lähde, elinkaari ja tarkistus

Lähde, URL ja vastauskohtainen provenienssi ovat pakollisia. Evergreen-kysymyksissä faktan pitää säilyä vakaana. Muuttuva lista saa `evergreen: false` ja sekä `validFrom` että `validUntil`. Käytä `review`-tilaa, jos jäsenyys tai suomenkielinen muoto vaatii vielä ihmisen tarkistuksen. `retired` säilyttää historian mutta ei pääse valintaan.

Ennen julkaisua:

1. Tarkista listan jäsenyys ensisijaisesta julkisesta lähteestä.
2. Kysy itseltäsi, tietääkö tavallinen pelaaja ainakin yhden vastauksen.
3. Merkitse ilmeinen, keskitasoinen ja harvinainen vastaus tietoisesti; älä käytä aakkosjärjestystä tai väkilukua ainoana proxy-arvona.
4. Aja `npm run validate:bank` ja korjaa kaikki virheet sekä arvioi varoitukset.
5. Muodosta uusi snapshot `npm run generate:bank`, lisää release aikajärjestyksessä ja aja typecheck, testit, build ja client-leak-scan.

Validointi löytää rakenteen, aliastörmäykset, puuttuvat tierit, tasaisen jakauman, päällekkäisen tekstin, vanhentuneet päivät, puuttuvan provenienssin ja kaikki kategoriavajeet. Se ei todista lähteen sisältöä tai kaikkia taivutusmuotoja; toimituksellinen faktantarkistus jää aina ihmiselle.
