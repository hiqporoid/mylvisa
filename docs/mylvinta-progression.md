# Mylvintäaalto

Mylvintäaalto on Mylvisan oma vaakasuora etenemismaailma. Pelaaja pysyy ankkuroituna tummaan suomalaiseen yömaisemaan; metsät, talot, ikkunat, liikennemerkki ja radiomasto reagoivat kasvavaan äänipaineeseen. Se ei käytä syvyyttä, vedenalaista kuvastoa tai toisen tuotteen hahmoja ja trade dressiä.

## Mittarit ja liike

Päämittari on edelleen 0–700 pistettä. MYLV on johdettu makuarvo: `1 piste = 10 MYLV`, joten maksimi on 7000 MYLV eikä se vaikuta leaderboardiin. Jokainen hyväksytty vastaus näyttää kanonisen vastauksen, pisteet ja rarity-tierin, lähettää äänenpainepulssin, animoi molemmat numerot ja siirtää maisemaa. Kesto on pisteistä riippuen 1,2–2,2 sekuntia. Invalid ei liikuta maailmaa; timeout ja skip näyttävät rauhallisen nollatuloksen.

Milestones ovat:

| MYLV | Tila |
| ---: | --- |
| 0 | Hiljainen murahdus |
| 700 | Huone värähtää |
| 1700 | Ikkunat helisevät |
| 3000 | Kortteli kuulee |
| 4500 | Naapurikunta kuulee |
| 6000 | Seismografi reagoi |
| 7000 | Täydellinen mylvintä |

## Saavutettavuus

Liike välittää etenemistä, mutta tieto näkyy aina myös numeroina, palkkina ja milestone-tekstinä. `prefers-reduced-motion` siirtää maiseman ja luvut suoraan uuteen asemaan, poistaa pulssianimaation ja säilyttää labelit. Pelinäkymä käyttää `100svh`-kehystä ja safe-area-paddingia; matalalla mobiilinäppäimistön avaamalla viewportilla maisema tiivistyy mutta promptti, kello ja vastaustoiminto säilyvät.
