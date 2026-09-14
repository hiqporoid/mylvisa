/**
 * Editorial, question-specific intent phrases. These are deliberately sparse.
 * Each phrase must identify exactly one canonical answer inside its question.
 */
export const editorialIntentAliases: Record<string, Record<string, string[]>> = {
  "suomi-presidentit": {
    "Kaarlo Juho Ståhlberg": ["Suomen ensimmäinen presidentti"],
    "Carl Gustaf Emil Mannerheim": ["marsalkka presidenttinä"],
    "Tarja Halonen": ["Suomen ensimmäinen naispresidentti"],
    "Alexander Stubb": ["nykyinen Suomen presidentti"],
  },
  "yhteiskunta-eu-toimielimet": {
    "Euroopan parlamentti": ["EU:n kansanedustuslaitos"],
    "Euroopan komissio": ["EU:n toimeenpaneva elin"],
    "Euroopan keskuspankki": ["eurosta vastaava keskuspankki"],
  },
  "tiede-aurinkokunta": {
    Maa: ["kotiplaneetta"],
    Mars: ["punainen planeetta"],
    Jupiter: ["aurinkokunnan suurin planeetta"],
    Saturnus: ["rengasplaneetta"],
  },
  "elokuvat-ja-televisio-bond-nayttelijat": {
    "Sean Connery": ["ensimmäinen Eon Bond"],
    "Pierce Brosnan": ["GoldenEye Bond"],
    "Daniel Craig": ["uusin Bond näyttelijä"],
  },
  "content-fi-recent-prime-ministers-all": {
    "Alexander Stubb": ["presidentiksi noussut 2010 luvun pääministeri"],
    "Sanna Marin": ["korona ajan pääministeri"],
    "Petteri Orpo": ["vuoden 2025 pääministeri"],
  },
  "content-literature-harry-potter-books-all": {
    "Viisasten kivi": ["ensimmäinen Harry Potter romaani"],
    "Liekehtivä pikari": ["kolmivelhoturnajaisten kirja"],
    "Kuoleman varjelukset": ["viimeinen Harry Potter romaani"],
  },
  "content-music-abba-albums-all": {
    Arrival: ["Dancing Queen albumi"],
    Voyage: ["ABBA comeback albumi"],
  },
  "content-fi-museums-all": {
    "Ateneumin taidemuseo": ["klassisen taiteen museo"],
    "Nykytaiteen museo Kiasma": ["nykytaiteen museo"],
  },
  "games-orange-box-steam": {
    "Half-Life 2": ["Gordon Freemanin peli"],
    Portal: ["portaaleilla ratkottava peli"],
    "Team Fortress 2": ["luokkapohjainen tiimiräiskintä"],
  },
  "digital-historic-generic-tlds": {
    ".com": ["kaupallisten sivustojen pääte"],
    ".org": ["järjestöjen verkkotunnuspääte"],
    ".edu": ["oppilaitosten verkkotunnuspääte"],
    ".gov": ["hallinnon verkkotunnuspääte"],
    ".mil": ["sotilasorganisaatioiden verkkotunnuspääte"],
  },
};

export const INTENT_ALIAS_COUNT = Object.values(editorialIntentAliases)
  .flatMap((answers) => Object.values(answers))
  .reduce((count, aliases) => count + aliases.length, 0);
