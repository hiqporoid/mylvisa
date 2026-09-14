# Vastausten ratkaisu

## Sopimus

Vastaus tarkistetaan vain pelaajan tietoisesta Enter- tai painikepainalluksesta. Resolver palauttaa yhden tilan:

- `invalid`: ei tietokantakirjoitusta, ei kierroksen vaihtoa, sama deadline jatkuu;
- `confirm`: yksi kanoninen näyttönimi ja lyhytikäinen salattu token, ei pisteitä tai rarityä;
- `accepted`: terminaalinen, palvelin laskee pisteet ja tallentaa kierroksen;
- `timeout`: terminaalinen nollatulos alkuperäisen deadlinen jälkeen;
- `skipped`: pelaajan eksplisiittinen terminaalinen nollatulos.

State machine on `READY → PREVIEW → ANSWERING → (INVALID | CONFIRM) → ANSWERING → ACCEPTED | TIMEOUT | SKIPPED → PROGRESSION → RESULT_READY`. `INVALID` ja `CONFIRM` ovat vastaustilan ohimeneviä alitiloja. Seuraava kierros alkaa vasta pelaajan toiminnasta.

## Matchaus ja canonicalisation

Kanoninen nimi, rekisteröity yksiselitteinen alias, turvallinen normalisointi ja yksiselitteinen vierekkäisten merkkien vaihto hyväksytään suoraan. `intentAliases` ovat toimituksellisia, kysymyskohtaisia kokonaisia ilmauksia. Täsmällinen intent-osuma pyytää vahvistamaan yhden nimen. Osittainen prefix, substring, yleinen fuzzy-haku, embedding-haku ja ehdotukset kirjoittamisen aikana ovat kiellettyjä.

Intent-alias hyväksytään dataan vain, jos se tunnistaa yhden vastauksen kyseisessä promptissa. Epäselvä termi palauttaa `invalid`. Nykyisessä releasessa on 32 käsin valittua intent-aliasta; niitä ei muodosteta automaattisesti.

## Token ja kilpailutilanteet

Vahvistustoken on AES-256-GCM-salattu ja sidottu runiin, käyttäjään, kysymykseen, run-versioon, normalisoituun alkuperäissyötteeseen, kanoniseen entity-ID:hen ja palvelimen deadlineen. Vahvistus hyväksytään vain, kun kaikki sidokset ovat edelleen voimassa. Client ei koskaan lähetä vapaasti luotettua entity-ID:tä.

Supabasen commit-RPC lukitsee run-rivin ja vertaa odotettua versiota. Se hyväksyy vain yhden uuden `accepted`, `timeout` tai `skipped` -tuloksen, tarkistaa laskurit ja pistemuutoksen sekä palauttaa uusinnalle jo tallennetun tilan. Invalid-yrityksiä tai confirm-tilaa ei tallenneta. Hyväksytyn tuloksen alkuperäinen syöte säilytetään recap-tarvetta varten; raakaa invalid-tekstiä ei säilytetä.

## Vuotosuoja

Vastaus ei koskaan sisällä vaihtoehtolistaa, ehdokasmäärää, vaihtoehtoisia harvinaisia vastauksia tai pisteitä ennen vahvistuscommittia. Lyhyet ja satunnaiset probe-syötteet tuottavat vain `invalid`. Rate limitin lisäksi tärkein enumerointisuoja on se, ettei endpoint tee prefix- tai substring-hakua. Tuotantobuildin client leak scan kattaa kanoniset nimet, tavalliset aliakset, intent-aliakset ja rarity-datan.
