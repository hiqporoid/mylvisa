# Eläkkeelle siirretyt kysymykset

`legacy-2026-09-01.json` sisältää edellisen MVP:n 112 yhden vastauksen kysymystä. Se on säilytetty historian ja mahdollisten vanhojen tulosten vuoksi, mutta sitä ei tuoda `src/data/releases.ts`-tiedostoon eikä valita päiväpeliin. Uudet julkaisut käyttävät rarity-settimallia.

Commitin 4326639 255 rarity-kysymyksen täydellinen PASS/FIX/RETIRE-manifesti on [docs/content-audit-2026-09-11.md](../../../docs/content-audit-2026-09-11.md). Sen 230 RETIRE-riviä eivät pääse tuotantopankkiin; aktiivinen snapshot rakennetaan vain `src/data/universes.ts`-rekisterin verifioiduista joukoista.
