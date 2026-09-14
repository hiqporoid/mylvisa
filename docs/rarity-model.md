# Rarity-malli

Mylvisa ei mittaa sitä, kuinka vaikea yksittäinen fakta on. Se arvioi, minkä vastauksen suomalainen yleissivistyspelaaja kirjoittaisi ensimmäisenä 25 sekunnin aikana. Kaikki listan hyväksytyt vastaukset ovat oikein ja positiivisia onnistumisia; pisteet palkitsevat ajattelun leveyttä.

## Suljetut joukot

Hyvä kysymys kertoo, mitä joukkoa haetaan ja mihin lähteeseen jäsenyys perustuu. “Nimeä Itämeren rannikkovaltio” on tarkistettava lista. “Nimeä kuuluisa kaupunki” ei ole, ellei kuuluisa ole sidottu nimettyyn viralliseen luetteloon. Kysymyksen pitää antaa useimmille pelaajille ainakin yksi mahdollinen lähtökohta. Harvinaisuus syntyy siitä, että pelaaja yrittää löytää toisen, vähemmän ilmeisen jäsenen.

## Kuusi tieriä

| Pisteet | Nimi | Toimituksellinen merkitys |
| ---: | --- | --- |
| 10 | Ilmeinen valinta | Monelle ensimmäinen spontaani vastaus |
| 15 | Ensimmäinen mieleen | Erittäin tavallinen, mutta ei aina ensimmäinen |
| 30 | Hyvä oivallus | Yleinen tieto, joka vaatii pienen haun muistista |
| 60 | Harvinainen löytö | Vähemmän kulttuurisesti näkyvä jäsen |
| 85 | Syvä tieto | Vastaus, jonka muistaminen vaatii laajaa tietoa |
| 100 | Täysosuma | Erittäin harvinainen mutta täysin puolustettava jäsen |

Nimet eivät arvota pelaajaa. Myös 10 pisteen vastaus on hyväksytty ja hyvä tulos. Kysymys tarvitsee vähintään yhden matalan ja yhden korkean tierin sekä mielellään 8–30 vastausta, jotta valinta tuntuu kiinnostavalta.

## Toimituksellinen arvio

Arvioi ensin suomalaisen aikuisen spontaani muistikuva, ei jäsenen objektiivista merkittävyyttä, kokoa tai vaikeusastetta. Läheisyys Suomeen, koulussa toistuminen, mediaesiintyvyys ja nimen lyhyys voivat tehdä vastauksesta ilmeisen. Jos arvio on epävarma, käytä varovaisempaa tieriä ja merkitse `rarityReview: "calibrate"`.

Yksikään kysymys ei tarvitse kaikkia kuutta tieriä. Validator tarkistaa pisteiden tuen, mutta liputtaa vain mekaanisia tai poikkeuksellisen tasaisia jakaumia. Tuleva empiirinen kalibrointi voi kerätä vain vähimmäistiedon:

```text
question_id
canonical_answer_id
plays
answer_count
```

Raakaa vapaatekstiä ei tarvitse säilyttää. Kun havaintoja kertyy, `answer_count / plays` voi järjestää vastaukset kuuteen vakaaseen ämpäriin. `editorialTier` säilyttää alkuperäisen päätöksen ja `effectiveTier` uuden käytössä olevan arvon; kysymysten API ja pelaajan kokemus pysyvät samoina.

## Kysymysten saavutettavuus

Promptin pitää olla heti ymmärrettävä, universumin tuttu ja riittävän laaja: useimmille syntyy ilmeinen 10–15 pisteen lähtövastaus, mutta joukossa on mielekäs pitkä häntä. Tietokantamainen rajaus kuuluu lähde- ja completeness-metadataan; pelaajan tekstin tulee olla mahdollisimman luonnollinen täsmällisyyttä menettämättä. Kapeita, akateemisia muistilistoja ei pidä ottaa Dailyyn vain siksi, että niiden jäsenyys on helppo validoida.

## Ajastin ja luottamusraja

Kierros alkaa 3 sekunnin previewlla. Sen jälkeen pelaajalla on 25 sekuntia löytää yksi hyväksytty vastaus. Virheelliset yritykset ja canonicalisation-vahvistus eivät päätä kierrosta tai siirrä deadlinea. Hyväksytty vastaus, aikakatkaisu tai eksplisiittinen ohitus ovat terminaalisia. Asiakas käyttää `startedAt`-, `previewUntil`- ja `deadline`-aikaleimoja; palvelin omistaa saman absoluuttisen deadlinen.

Selaimeen lähetetään ennen vastausta vain promptin näyttämiseen tarvittavat tiedot. Hyväksytyt listat, aliaset, intent-aliakset, tierit ja selitykset jäävät server-only-koodiin. Ennen commitia palvelin voi palauttaa vain yhden vahvistettavan kanonisen nimen ilman pisteitä. Tarkempi malli on kuvattu [answer-resolution.md](answer-resolution.md).
