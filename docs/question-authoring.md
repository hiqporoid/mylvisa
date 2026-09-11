# Kysymysten kirjoittajan opas

Mylvisa on suomenkielinen yleistietovisa. Kirjoita yksi yksiselitteinen kysymys kerrallaan. Kysymyksen pitää ratketa tiedolla, ei sillä, arvaako pelaaja kirjoittajan ajatuksen. Muotoile kysymys ja selitys itse; älä kopioi tietovisoja tai pitkiä lähdetekstejä.

## Tietue

```json
{
  "id": "suomi-kekkonen",
  "question": "Kuka oli Suomen presidentti vuosina 1956–1982?",
  "category": "suomi",
  "subcategory": "presidentit",
  "difficulty": "helppo",
  "answers": [
    {
      "canonical": "Urho Kekkonen",
      "points": 30,
      "aliases": ["Kekkonen", "Urho Kaleva Kekkonen"]
    }
  ],
  "canonicalAnswer": "Urho Kekkonen",
  "explanation": "Urho Kekkonen toimi presidenttinä yli 25 vuotta. Hänen kautensa päättyi vuonna 1982.",
  "sources": [
    { "title": "Tasavallan presidentin kanslia: Suomen presidentit" }
  ],
  "tags": ["suomi", "presidentit"],
  "evergreen": true,
  "status": "active",
  "version": 1,
  "author": "Mylvisa"
}
```

`id` säilyy samana saman kysymyksen uusissa versioissa. Käytä pieniä ASCII-kirjaimia, numeroita ja yhdysmerkkejä. `category` on yksi tiedoston `src/lib/quiz/catalog.ts` avaimista. Vaikeusaste on `helppo`, `keskitaso` tai `vaikea`. Älä muuta historiallisia tunnisteita vain otsikon parantamiseksi.

`answers` sisältää yhden tai useita vaihtoehtoja. Jokaisella on oma pistemääränsä, näyttönimensä ja haluttaessa aliasluettelonsa. Yhden vastauksen rinnakkaismuodot kuuluvat samaan vastausobjektiin. Vaihtoehtoiset oikeat vastaukset kuuluvat eri objekteihin, vaikka niiden pistemäärä olisi sama.

`canonicalAnswer` on palautteessa näytettävä oikea vastaus, kun pelaaja ei vastaa oikein. Monivastauskysymyksessä sen tulee kertoa kaikki hyväksyttävät vaihtoehdot selkeästi. Oikein vastannut näkee oman vastauksensa kanonisen muodon. Koko vastauslistaa tai pistetaulukkoa ei lähetetä ennen vastaamista.

## Monen oikean vastauksen kysymys

Rajaa joukko täsmällisesti: esimerkiksi "Nimeä yksi Aurinkokunnan neljästä jättiläisplaneetasta." Kaikki neljä vaihtoehtoa on hyväksyttävä. Älä kirjoita "Nimeä jokin kuuluisa säveltäjä", jos kaikkia päteviä vastauksia ei voi määritellä.

```json
"answers": [
  { "canonical": "Jupiter", "points": 20, "aliases": [] },
  { "canonical": "Saturnus", "points": 30, "aliases": [] },
  { "canonical": "Uranus", "points": 70, "aliases": [] },
  { "canonical": "Neptunus", "points": 100, "aliases": [] }
]
```

Kysymyksen enimmäispistemäärä on suurin yksittäinen pistemäärä. Pisteet ovat toimituksen arvio vastauksen vaikeudesta, eivät tutkimustulos vastausten suosiosta. Yksittäinen vastaus voi tarvittaessa sisältää oman `explanation`-kentän; muuten käytetään kysymyksen yhteistä selitystä.

## Aliakset ja rajatapaukset

- Lisää tunnetut sukunimet, rinnakkaisnimet, numeromuodot ja tarpeelliset taivutusmuodot erikseen.
- Älä lisää kirjainkokovariantteja, ylimääräisiä välilyöntejä tai välimerkkivariantteja, jotka normalisoituvat jo samaksi.
- Älä hyväksy toista mahdollista henkilöä pelkän etunimen perusteella.
- Ä, ö ja å eivät muutu a:ksi tai o:ksi. Harkittu kirjoitusasu ilman diakriittejä voidaan lisätä erikseen.
- Lyhenteet hyväksytään vain silloin, kun ne yksilöivät kysytyn vastauksen.
- Älä lisää kirjoitusvirheitä summittaisesti. Lähellä oleva väärä vastaus ei saa muuttua oikeaksi.
- Kirjoita kysymykseen yksikkö. Jos kysyt kilometrejä, merkitse selkeästi, hyväksytäänkö myös metreinä kirjoitettu vastaus.
- Vastauksen normalisointi säilyttää numeroiden etumerkin ja desimaalipisteen. Testaa uudet lukumuodot aina.

Lisää uusi rajatapaus tiedostoon `tests/engine.test.ts`, kun muutat normalisointisääntöä. Älä heikennä kaikkien kysymysten tarkistusta yhden puuttuvan aliaksen vuoksi.

## Lähteet ja elinkaari

Suosi museoita, arkistoja, tiedeyhteisöjä, sanakirjoja ja muita asian ensisijaisia lähteitä. `sources`-kentän `title` on pakollinen; lisää myös tarkka HTTPS-osoite `url`-kenttään ja tarvittaessa selventävä `note`. Lähdemerkintä ei yksin tarkoita, että joku muu on tarkistanut faktan. Alkuperäinen siemenpankki sisältää sekä lähdeviitteitä että erikseen tarkistettuja suoria linkkejä; koko pankin riippumaton auditointi on seuraava sisältötyö.

Vältä nykyisiä viranhaltijoita, vaihtuvia mestareita, väkilukuja, hintoja ja epämääräisiä maailmanennätyksiä. Historiallinen, vuoteen sidottu kysymys voi olla ajaton.

- `evergreen: true`: fakta on tarkoitettu pysyväksi. Silti lähde ja sanamuoto on tarkistettava.
- `evergreen: false`: **sekä `validFrom` että `validUntil` vaaditaan** muodossa `YYYY-MM-DD`.
- Voimassaolorajat ovat Suomen kalenteripäiviä ja molemmat rajapäivät sisältyvät jaksoon.
- `active`: mukaan valintaan, jos päivämäärä sallii.
- `review`: odottaa toimituksellista tarkistusta; ei koskaan peliin.
- `retired`: poistettu tulevasta käytöstä; säilyy historiassa.

## Turvallinen julkaisu sadoille tai tuhansille kysymyksille

1. Työstä kysymykset ensin tarkistuslistana tai tulevan julkaisun JSON-tiedostossa. Käytä statusarvoa `review`, kun vastaus tai rajaus on epävarma.
2. Tarkista faktat, suomen kieli, kaikki mahdolliset oikeat vastaukset ja aliasristiriidat. Vältä saman faktan kysymistä eri sanamuodoin.
3. Tasapainota aiheita myös Suomen ulkopuolelta. Pidä vaikeita kysymyksiä riittävästi koko valintakierrokselle; 1/7 on toimiva lähtökohta.
4. Kopioi hyväksytty pankki uuteen `src/data/releases/YYYY-MM-DD.json`-tilannekuvaan. Saman kysymyksen korjauksessa kasvata sen `version`-arvoa.
5. Lisää uusi julkaisu `src/data/releases.ts`-tiedostoon aikajärjestyksessä. Anna uusi `id`, **tuleva** `effectiveFrom` ja `length` (oletus 7). Julkaisupäivän on oltava myöhempi kuin Suomen tämänhetkinen päivä.
6. Älä muokkaa jo voimaan tullutta tilannekuvaa. Sama sääntö koskee valinta-algoritmia: säilytä vanha toteutus vanhoille julkaisuille, jos algoritmi muuttuu. MVP sisältää yhden algoritmiversion `deck-v1`.
7. Aja `npm run validate:bank`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` ja `npm run check:client`.
8. Tarkista varoitukset. Samankaltainen teksti on vihje, ei automaattinen tuomio. Normalisoitu alias kahdessa eri vastausobjektissa on estävä virhe.
9. Katso muutama tuleva päivä ja kierroksen raja kehitysympäristössä. Pelaa visa loppuun. Tarkista myös väärä ja tyhjä vastaus.
10. Commitoi lähde, pankki ja testit yhdessä; tarkista GitHubin CI. Julkaise ajoissa ennen uuden pankin voimaantuloa.

Valitsin ei tarvitse muutoksia kysymysmäärän kasvaessa. Hyvin suurelle pankille voidaan lisätä build-vaiheessa muodostetut, versionhallintaan tallennetut päiväkohtaiset aikataulut. Ne säilyttävät saman julkisen API-sopimuksen ja vähentävät palvelimen laskentaa.

## Validoinnin rajat

Automaattinen tarkistus löytää rakennevirheet, tunniste- ja tekstikaksoiskappaleet, sanajoukkojen suuren samankaltaisuuden, puuttuvat vastaukset, virheelliset pisteet, aliasristiriidat ja päivämääräongelmat. Se ei todista faktoja, ymmärrä kaikkia merkitykseltään samoja kysymyksiä eikä tiedä kaikkia suomenkielisiä taivutusmuotoja. Ihmisen toimituksellinen arvio on edelleen tarpeen.
