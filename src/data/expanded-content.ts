import type { UniverseEntity, VerifiedUniverse } from "./universes";

type AuthoredExpandedQuestion = {
  id: string;
  prompt: string;
  category: string;
  universeId: string;
  explanation: string;
  tags: string[];
  scores: Record<string, number>;
  dailyEligible: boolean;
  accessibilityReview: "verified";
  accessibility: 4 | 5;
  baseUniverseId: string;
  predicateId: string;
  reviewDisposition?: "hard" | "retire";
};

type PredicateSpec = {
  id: string;
  prompt: string;
  category: string;
  ids: string[];
  basis: string;
  easy?: string[];
  rare?: string[];
  source?: { title: string; url: string; note: string };
};

const source = (title: string, url: string, note: string) => ({ title, url, note });

const countrySource = source(
  "United Nations — Member States",
  "https://www.un.org/en/about-us/member-states",
  "YK:n jäsenvaltioiden virallinen luettelo; tarkkailijavaltiot ovat erillisellä UN:n virallisella sivulla.",
);
const elementSource = source(
  "IUPAC — Periodic Table of the Elements",
  "https://iupac.org/what-we-do/periodic-table-of-elements/",
  "IUPAC:n jaksollinen järjestelmä on alkuaineiden nimien, symbolien ja järjestyslukujen ensisijainen lähde.",
);

const countries: Array<[string, string]> = [
  ["afghanistan", "Afganistan"], ["albania", "Albania"], ["algeria", "Algeria"], ["andorra", "Andorra"], ["angola", "Angola"],
  ["antigua-ja-barbuda", "Antigua ja Barbuda"], ["argentiina", "Argentiina"], ["armenia", "Armenia"], ["australia", "Australia"], ["itavalta", "Itävalta"],
  ["azerbaidzan", "Azerbaidžan"], ["bahama", "Bahama"], ["bahrain", "Bahrain"], ["bangladesh", "Bangladesh"], ["barbados", "Barbados"],
  ["belgia", "Belgia"], ["belarus", "Belarus"], ["belize", "Belize"], ["benin", "Benin"], ["bhutan", "Bhutan"], ["bolivia", "Bolivia"],
  ["bosnia-ja-hertsegovina", "Bosnia ja Hertsegovina"], ["botswana", "Botswana"], ["brasilia", "Brasilia"], ["brunei", "Brunei"], ["bulgaria", "Bulgaria"],
  ["burkina-faso", "Burkina Faso"], ["burundi", "Burundi"], ["chile", "Chile"], ["costa-rica", "Costa Rica"], ["cote-divoire", "Norsunluurannikko"],
  ["djibouti", "Djibouti"], ["dominica", "Dominica"], ["dominikaaninen-tasavalta", "Dominikaaninen tasavalta"], ["ecuador", "Ecuador"], ["egypti", "Egypti"],
  ["el-salvador", "El Salvador"], ["equatorial-guinea", "Päiväntasaajan Guinea"], ["eritrea", "Eritrea"], ["espanja", "Espanja"], ["eswatini", "Eswatini"], ["etiopia", "Etiopia"],
  ["fidzi", "Fidži"], ["filippiinit", "Filippiinit"], ["gabon", "Gabon"], ["gambia", "Gambia"], ["georgia", "Georgia"],
  ["ghana", "Ghana"], ["grenada", "Grenada"], ["guatemala", "Guatemala"], ["guinea", "Guinea"], ["guinea-bissau", "Guinea-Bissau"],
  ["guyana", "Guyana"], ["haiti", "Haiti"], ["honduras", "Honduras"], ["intia", "Intia"], ["indonesia", "Indonesia"],
  ["irak", "Irak"], ["iran", "Iran"], ["irlanti", "Irlanti"], ["islanti", "Islanti"], ["israel", "Israel"], ["ita-timor", "Itä-Timor"],
  ["italia", "Italia"], ["jamaika", "Jamaika"], ["japani", "Japani"], ["jemen", "Jemen"], ["jordania", "Jordania"],
  ["kambodza", "Kambodža"], ["kamerun", "Kamerun"], ["kanada", "Kanada"], ["kap-verde", "Kap Verde"], ["kazakstan", "Kazakstan"],
  ["kenia", "Kenia"], ["keski-afrikan-tasavalta", "Keski-Afrikan tasavalta"], ["kiribati", "Kiribati"], ["kolumbia", "Kolumbia"], ["komorit", "Komorit"],
  ["kongo", "Kongo"], ["kongon-demokraattinen-tasavalta", "Kongon demokraattinen tasavalta"], ["korean-tasavalta", "Etelä-Korea"], ["kroatia", "Kroatia"], ["kuuba", "Kuuba"],
  ["kuwait", "Kuwait"], ["kypros", "Kypros"], ["kyrgyzstan", "Kirgisia"], ["laos", "Laos"], ["latvia", "Latvia"],
  ["libanon", "Libanon"], ["lesotho", "Lesotho"], ["liberia", "Liberia"], ["libya", "Libya"], ["liechtenstein", "Liechtenstein"],
  ["liettua", "Liettua"], ["luxemburg", "Luxemburg"], ["madagaskar", "Madagaskar"], ["malawi", "Malawi"], ["malesia", "Malesia"],
  ["malediivit", "Malediivit"], ["mali", "Mali"], ["malta", "Malta"], ["marokko", "Marokko"], ["marshallinsaaret", "Marshallinsaaret"],
  ["mauritania", "Mauritania"], ["mauritius", "Mauritius"], ["meksiko", "Meksiko"], ["mikronesia", "Mikronesia"], ["moldova", "Moldova"],
  ["monaco", "Monaco"], ["mongolia", "Mongolia"], ["montenegro", "Montenegro"], ["mosambik", "Mosambik"], ["myanmar", "Myanmar"],
  ["namibia", "Namibia"], ["nauru", "Nauru"], ["nepal", "Nepal"], ["nicaragua", "Nicaragua"], ["niger", "Niger"],
  ["nigeria", "Nigeria"], ["norja", "Norja"], ["oman", "Oman"], ["pakistan", "Pakistan"],
  ["palau", "Palau"], ["panama", "Panama"], ["papua-uusi-guinea", "Papua-Uusi-Guinea"], ["paraguay", "Paraguay"], ["peru", "Peru"],
  ["pohjois-korea", "Pohjois-Korea"], ["pohjois-makedonia", "Pohjois-Makedonia"], ["portugali", "Portugali"], ["puola", "Puola"], ["qatar", "Qatar"],
  ["ranska", "Ranska"], ["romania", "Romania"], ["ruanda", "Ruanda"], ["saint-kitts-ja-nevis", "Saint Kitts ja Nevis"], ["saint-lucia", "Saint Lucia"],
  ["saint-vincent-ja-grenadiinit", "Saint Vincent ja Grenadiinit"], ["saksa", "Saksa"], ["salomonsaaret", "Salomonsaaret"], ["sambia", "Sambia"], ["samoa", "Samoa"],
  ["san-marino", "San Marino"], ["sao-tome-ja-principe", "São Tomé ja Príncipe"], ["saudi-arabia", "Saudi-Arabia"], ["senegal", "Senegal"], ["serbia", "Serbia"],
  ["seychellit", "Seychellit"], ["sierra-leone", "Sierra Leone"], ["singapore", "Singapore"], ["slovakia", "Slovakia"], ["slovenia", "Slovenia"],
  ["somalia", "Somalia"], ["sri-lanka", "Sri Lanka"], ["sudan", "Sudan"], ["suriname", "Suriname"], ["suomi", "Suomi"], ["sveitsi", "Sveitsi"], ["ruotsi", "Ruotsi"],
  ["syyria", "Syyria"], ["tadzhikistan", "Tadžikistan"], ["tansania", "Tansania"], ["tanska", "Tanska"],
  ["thaimaa", "Thaimaa"], ["togo", "Togo"], ["tonga", "Tonga"], ["trinidad-ja-tobago", "Trinidad ja Tobago"], ["tsad", "Tšad"],
  ["tsekki", "Tšekki"], ["tunisia", "Tunisia"], ["turkki", "Turkki"], ["turkmenistan", "Turkmenistan"], ["tuvalu", "Tuvalu"],
  ["uganda", "Uganda"], ["ukraina", "Ukraina"], ["unkari", "Unkari"], ["uruguay", "Uruguay"], ["uzbekistan", "Uzbekistan"],
  ["uusi-seelanti", "Uusi-Seelanti"], ["vanuatu", "Vanuatu"], ["vatikaanivaltio", "Vatikaanivaltio"], ["venezuela", "Venezuela"], ["venaja", "Venäjä"],
  ["vietnam", "Vietnam"], ["yhdistyneet-arabiemiirikunnat", "Yhdistyneet arabiemiirikunnat"], ["yhdistynyt-kuningaskunta", "Yhdistynyt kuningaskunta"], ["yhdysvallat", "Yhdysvallat"], ["zimbabwe", "Zimbabwe"],
  ["etelainen-afrikka", "Etelä-Afrikka"], ["etelainen-sudan", "Etelä-Sudan"], ["palestiina", "Palestiina"], ["alankomaat", "Alankomaat"], ["kreikka", "Kreikka"], ["viro", "Viro"], ["kiina", "Kiina"],
];

const countryEntities: UniverseEntity[] = countries.map(([id, canonical]) => ({ id, canonical, aliases: [] }));
const countryById = new Map(countryEntities.map((entity) => [entity.id, entity]));

const continentGroups: Record<string, string[]> = {
  afrikka: ["algeria", "angola", "benin", "botswana", "burkina-faso", "burundi", "cote-divoire", "djibouti", "egypti", "equatorial-guinea", "eritrea", "eswatini", "etiopia", "gabon", "gambia", "ghana", "guinea", "guinea-bissau", "kamerun", "kap-verde", "kenia", "keski-afrikan-tasavalta", "komorit", "kongo", "kongon-demokraattinen-tasavalta", "lesotho", "liberia", "libya", "madagaskar", "malawi", "mali", "marokko", "mauritania", "mauritius", "mosambik", "namibia", "niger", "nigeria", "ruanda", "sambia", "sao-tome-ja-principe", "senegal", "seychellit", "sierra-leone", "somalia", "sudan", "tansania", "togo", "tsad", "tunisia", "uganda", "zimbabwe", "etelainen-afrikka", "etelainen-sudan"],
  aasia: ["afghanistan", "armenia", "azerbaidzan", "bahrain", "bangladesh", "bhutan", "brunei", "filippiinit", "georgia", "intia", "indonesia", "irak", "iran", "israel", "ita-timor", "japani", "jemen", "jordania", "kambodza", "kazakstan", "kiina", "korean-tasavalta", "kuwait", "kypros", "kyrgyzstan", "laos", "libanon", "malesia", "malediivit", "mikronesia", "mongolia", "myanmar", "nepal", "oman", "pakistan", "palestiina", "pohjois-korea", "qatar", "saudi-arabia", "singapore", "sri-lanka", "syyria", "tadzhikistan", "thaimaa", "turkki", "turkmenistan", "uzbekistan", "yhdistyneet-arabiemiirikunnat", "vietnam", "venaja"],
  eurooppa: ["albania", "andorra", "itavalta", "belgia", "belarus", "bosnia-ja-hertsegovina", "bulgaria", "espanja", "irlanti", "islanti", "italia", "kroatia", "latvia", "liechtenstein", "liettua", "luxemburg", "malta", "moldova", "monaco", "montenegro", "norja", "pohjois-makedonia", "portugali", "puola", "ranska", "romania", "san-marino", "saksa", "serbia", "slovakia", "slovenia", "suomi", "sveitsi", "ruotsi", "tanska", "tsekki", "ukraina", "unkari", "viro", "vatikaanivaltio", "venaja", "yhdistynyt-kuningaskunta", "kreikka", "alankomaat"],
  "pohjois-amerikka": ["antigua-ja-barbuda", "bahama", "barbados", "belize", "costa-rica", "dominica", "dominikaaninen-tasavalta", "el-salvador", "grenada", "guatemala", "haiti", "honduras", "jamaika", "kanada", "kuuba", "meksiko", "nicaragua", "panama", "saint-kitts-ja-nevis", "saint-lucia", "saint-vincent-ja-grenadiinit", "trinidad-ja-tobago", "yhdysvallat"],
  "etela-amerikka": ["argentiina", "bolivia", "brasilia", "chile", "ecuador", "guyana", "kolumbia", "paraguay", "peru", "suriname", "uruguay", "venezuela"],
  oseania: ["australia", "fidzi", "kiribati", "marshallinsaaret", "nauru", "palau", "papua-uusi-guinea", "salomonsaaret", "samoa", "tonga", "tuvalu", "uusi-seelanti", "vanuatu", "mikronesia"],
};

export const countryBase: VerifiedUniverse = {
  id: "world-countries-195-2026",
  description: "YK:n jäsen- ja tarkkailijavaltioiden 195 valtion joukko.",
  asOf: "2026-01-01",
  source: countrySource,
  membershipBasis: "YK:n jäsenvaltioiden virallinen luettelo sekä YK:n kaksi tarkkailijavaltiota, Pyhä istuin ja Palestiina; riippuvaisia alueita ei lasketa.",
  expectedCount: countryEntities.length,
  entities: countryEntities,
};

const elementNames = [
  ["vety", "vety", "H"], ["helium", "helium", "He"], ["litium", "litium", "Li"], ["beryllium", "beryllium", "Be"], ["boori", "boori", "B"], ["hiili", "hiili", "C"], ["typpi", "typpi", "N"], ["happi", "happi", "O"], ["fluori", "fluori", "F"], ["neon", "neon", "Ne"], ["natrium", "natrium", "Na"], ["magnesium", "magnesium", "Mg"], ["alumiini", "alumiini", "Al"], ["pii", "pii", "Si"], ["fosfori", "fosfori", "P"], ["rikki", "rikki", "S"], ["kloori", "kloori", "Cl"], ["argon", "argon", "Ar"], ["kalium", "kalium", "K"], ["kalsium", "kalsium", "Ca"], ["skandium", "skandium", "Sc"], ["titaani", "titaani", "Ti"], ["vanadiini", "vanadiini", "V"], ["kromi", "kromi", "Cr"], ["mangaani", "mangaani", "Mn"], ["rauta", "rauta", "Fe"], ["koboltti", "koboltti", "Co"], ["nikkeli", "nikkeli", "Ni"], ["kupari", "kupari", "Cu"], ["sinkki", "sinkki", "Zn"], ["gallium", "gallium", "Ga"], ["germanium", "germanium", "Ge"], ["arseeni", "arseeni", "As"], ["seleeni", "seleeni", "Se"], ["bromi", "bromi", "Br"], ["krypton", "krypton", "Kr"], ["rubidium", "rubidium", "Rb"], ["strontium", "strontium", "Sr"], ["yttrium", "yttrium", "Y"], ["zirkonium", "zirkonium", "Zr"], ["niobium", "niobium", "Nb"], ["molybdeeni", "molybdeeni", "Mo"], ["teknetium", "teknetium", "Tc"], ["rutenium", "rutenium", "Ru"], ["rodium", "rodium", "Rh"], ["palladium", "palladium", "Pd"], ["hopea", "hopea", "Ag"], ["kadmium", "kadmium", "Cd"], ["indium", "indium", "In"], ["tina", "tina", "Sn"], ["antimoni", "antimoni", "Sb"], ["telluuri", "telluuri", "Te"], ["jodi", "jodi", "I"], ["ksenon", "ksenon", "Xe"], ["cesium", "cesium", "Cs"], ["barium", "barium", "Ba"], ["lantaani", "lantaani", "La"], ["cerium", "cerium", "Ce"], ["praseodyymi", "praseodyymi", "Pr"], ["neodyymi", "neodyymi", "Nd"], ["prometium", "prometium", "Pm"], ["samarium", "samarium", "Sm"], ["europium", "europium", "Eu"], ["gadolinium", "gadolinium", "Gd"], ["terbium", "terbium", "Tb"], ["dysprosium", "dysprosium", "Dy"], ["holmium", "holmium", "Ho"], ["erbium", "erbium", "Er"], ["tulium", "tulium", "Tm"], ["ytterbium", "ytterbium", "Yb"], ["lutetium", "lutetium", "Lu"], ["hafnium", "hafnium", "Hf"], ["tantaali", "tantaali", "Ta"], ["volframi", "volframi", "W"], ["renium", "renium", "Re"], ["osmium", "osmium", "Os"], ["iridium", "iridium", "Ir"], ["platina", "platina", "Pt"], ["kulta", "kulta", "Au"], ["elohopea", "elohopea", "Hg"], ["tallium", "tallium", "Tl"], ["lyijy", "lyijy", "Pb"], ["vismutti", "vismutti", "Bi"], ["polonium", "polonium", "Po"], ["astatiini", "astatiini", "At"], ["radon", "radon", "Rn"], ["frankium", "frankium", "Fr"], ["radium", "radium", "Ra"], ["aktinium", "aktinium", "Ac"], ["torium", "torium", "Th"], ["protaktinium", "protaktinium", "Pa"], ["uraani", "uraani", "U"], ["neptunium", "neptunium", "Np"], ["plutonium", "plutonium", "Pu"], ["amerikium", "amerikium", "Am"], ["curium", "curium", "Cm"], ["berkelium", "berkelium", "Bk"], ["kalifornium", "kalifornium", "Cf"], ["einsteinium", "einsteinium", "Es"], ["fermium", "fermium", "Fm"], ["mendelevium", "mendelevium", "Md"], ["nobelium", "nobelium", "No"], ["lawrencium", "lawrencium", "Lr"], ["rutherfordium", "rutherfordium", "Rf"], ["dubnium", "dubnium", "Db"], ["seaborgium", "seaborgium", "Sg"], ["bohrium", "bohrium", "Bh"], ["hassium", "hassium", "Hs"], ["meitnerium", "meitnerium", "Mt"], ["darmstadtium", "darmstadtium", "Ds"], ["rontgenium", "röntgenium", "Rg"], ["kopernikium", "kopernikium", "Cn"], ["nihonium", "nihonium", "Nh"], ["flerovium", "flerovium", "Fl"], ["moskovium", "moskovium", "Mc"], ["livermorium", "livermorium", "Lv"], ["tennessine", "tennessine", "Ts"], ["oganesson", "oganesson", "Og"],
] as const;
export const elementBase: VerifiedUniverse = {
  id: "iupac-alkuaineet-118-2026",
  description: "IUPAC:n jaksollisen järjestelmän 118 alkuainetta.",
  asOf: "2026-01-01",
  source: elementSource,
  membershipBasis: "IUPAC:n jaksollisen järjestelmän kaikki 118 alkuainetta järjestysluvun 1–118 mukaan.",
  expectedCount: elementNames.length,
  entities: elementNames.map(([id, canonical, symbol]) => ({ id, canonical, aliases: [symbol] })),
};

const commonCountries = ["suomi", "ruotsi", "yhdysvallat", "kanada", "saksa", "ranska", "italia", "espanja", "japani", "brasilia", "argentiina", "australia", "kiina"];
const rareCountries = ["tuvalu", "nauru", "kiribati", "palau", "suriname", "guyana", "bhutan", "lesotho", "djibouti", "komorit", "liechtenstein", "san-marino", "vanuatu", "sao-tome-ja-principe", "marshallinsaaret", "mikronesia", "eritrea", "eswatini", "tadzhikistan", "saudi-arabia"];
const commonElements = ["vety", "happi", "hiili", "rauta", "kupari", "hopea", "kulta", "uraani", "natrium", "kalsium", "helium", "hiili"];
const rareElements = ["frankium", "astatiini", "rutherfordium", "meitnerium", "darmstadtium", "rontgenium", "nihonium", "oganesson", "prometium", "protaktinium", "einsteinium", "lawrencium"];

function scoresFor(entities: UniverseEntity[], easy: string[], rare: string[]) {
  const easySet = new Set(easy);
  const rareSet = new Set(rare);
  const points: Record<string, number> = {};
  for (const entity of entities) {
    if (rareSet.has(entity.id)) points[entity.id] = 100;
    else if (easySet.has(entity.id)) points[entity.id] = 10;
    else if (entity.id === "suomi" || entity.id === "rauta" || entity.id === "vety") points[entity.id] = 15;
    else points[entity.id] = 30;
  }
  return points;
}

function makeDerived(base: VerifiedUniverse, spec: PredicateSpec) {
  const entities = spec.ids.map((id) => countryById.get(id) ?? elementBase.entities.find((entity) => entity.id === id)).filter((entity): entity is UniverseEntity => Boolean(entity));
  const id = `${base.id}-${spec.id}`;
  const sourceRecord = spec.source ?? base.source;
  const question: AuthoredExpandedQuestion = {
    id: `derived-${spec.id}`,
    prompt: spec.prompt,
    category: spec.category,
    universeId: id,
    explanation: `Hyväksytty vastaus kuuluu lähteessä määriteltyyn täydelliseen joukkoon. Jäsenyys muodostetaan deterministisesti predicate-tunnuksella ${spec.id}.`,
    tags: ["derived-universe", "toimittajan-tarkistama", "rarity"],
    scores: scoresFor(entities, spec.easy ?? [], spec.rare ?? []),
    dailyEligible: entities.length >= 8 && entities.some((entity) => (spec.rare ?? []).includes(entity.id)) && entities.some((entity) => (spec.easy ?? []).includes(entity.id)),
    accessibilityReview: "verified",
    accessibility: 4,
    baseUniverseId: base.id,
    predicateId: spec.id,
  };
  const universe: VerifiedUniverse = {
    id,
    description: `${base.description} Johdettu kysymys: ${spec.prompt}`,
    asOf: base.asOf,
    source: sourceRecord,
    membershipBasis: spec.basis,
    expectedCount: entities.length,
    entities,
    baseUniverseId: base.id,
    predicateId: spec.id,
  };
  return { universe, question };
}

function idsWhere(predicate: (entity: UniverseEntity) => boolean, base: UniverseEntity[] = countryEntities) {
  return base.filter(predicate).map((entity) => entity.id);
}

const countrySpecs: PredicateSpec[] = [];
for (const [continent, ids] of Object.entries(continentGroups)) {
  countrySpecs.push({ id: `continent-${continent}`, prompt: `Nimeä ${continent.replaceAll("-", " ")}n valtio.`, category: "maantiede", ids, basis: `YK:n maa- ja aluekoodeista johdettu ${continent}-ryhmä; jäsenyys on kaikkien ryhmän valtioiden deterministinen unioni.`, easy: commonCountries, rare: rareCountries });
  for (const letter of ["a", "e", "i", "o", "n", "r", "s"]) {
    const selected = idsWhere((entity) => entity.canonical.toLocaleLowerCase("fi-FI").includes(letter), ids.map((id) => countryById.get(id)!).filter(Boolean));
    if (selected.length >= 8) countrySpecs.push({ id: `continent-${continent}-contains-${letter}`, prompt: `Nimeä ${continent.replaceAll("-", " ")}n valtio, jonka nimessä on kirjain ${letter.toUpperCase()}.`, category: "maantiede", ids: selected, basis: `YK:n valtiojoukon ${continent}-jäsenet, joista valitaan deterministisesti nimet, joissa esiintyy kirjain ${letter}.`, easy: commonCountries, rare: rareCountries });
  }
}

for (const [continent, ids] of Object.entries(continentGroups)) {
  const members = ids.map((id) => countryById.get(id)).filter((entity): entity is UniverseEntity => Boolean(entity));
  for (const letter of ["a", "e", "i", "o", "n", "r", "s", "k", "m", "t", "l", "p"]) {
    const selected = members.filter((entity) => entity.canonical.toLocaleLowerCase("fi-FI").startsWith(letter)).map((entity) => entity.id);
    if (selected.length >= 8) countrySpecs.push({ id: `continent-${continent}-starts-${letter}`, prompt: `Nimeä ${continent.replaceAll("-", " ")}n valtio, jonka nimi alkaa kirjaimella ${letter.toUpperCase()}.`, category: "maantiede", ids: selected, basis: `YK:n ${continent}-joukosta kaikki valtiot, joiden vakiintunut suomenkielinen nimi alkaa kirjaimella ${letter}.`, easy: commonCountries, rare: rareCountries });
  }
}

const globalNameFilters: Array<[string, string, (name: string) => boolean]> = [
  ["single-word", "jonka nimi on yksisanainen", (name) => !name.includes(" ") && !name.includes("-" )],
  ["multi-word", "jonka nimi koostuu useasta sanasta", (name) => name.includes(" ")],
  ["hyphenated", "jonka nimessä on yhdysmerkki", (name) => name.includes("-")],
  ["long-name", "jonka nimi on vähintään kymmenen kirjainta pitkä", (name) => name.replaceAll(" ", "").length >= 10],
  ["short-name", "jonka nimi on korkeintaan kuusi kirjainta pitkä", (name) => name.replaceAll(" ", "").length <= 6],
  ["starts-vowel", "jonka nimi alkaa vokaalilla", (name) => /^[aeiouyäö]/iu.test(name)],
  ["starts-s", "jonka nimi alkaa S-kirjaimella", (name) => /^s/iu.test(name)],
  ["starts-k", "jonka nimi alkaa K-kirjaimella", (name) => /^k/iu.test(name)],
  ["starts-m", "jonka nimi alkaa M-kirjaimella", (name) => /^m/iu.test(name)],
  ["contains-a", "jonka nimessä on A-kirjain", (name) => /a/iu.test(name)],
  ["contains-o", "jonka nimessä on O-kirjain", (name) => /o/iu.test(name)],
  ["contains-y", "jonka nimessä on Y-kirjain", (name) => /y/iu.test(name)],
];
for (const [id, label, predicate] of globalNameFilters) {
  const ids = idsWhere((entity) => predicate(entity.canonical));
  if (ids.length >= 8) countrySpecs.push({ id: `country-${id}`, prompt: `Nimeä valtio, ${label}.`, category: "maailma", ids, basis: `YK:n täydellisestä valtiojoukosta deterministisesti rajattu joukko: ${label}.`, easy: commonCountries, rare: rareCountries });
}

const countryOrganizations: Array<[string, string, string[], string, string]> = [
  ["eu", "Euroopan unionin jäsenvaltio", ["belgia", "bulgaria", "itavalta", "espanja", "irlanti", "italia", "kroatia", "kypros", "latvia", "liettua", "luxemburg", "malta", "portugali", "puola", "ranska", "romania", "saksa", "slovakia", "slovenia", "suomi", "tanska", "tsekki", "unkari", "viro", "kreikka", "alankomaat", "ruotsi"], "yhteiskunta", "https://european-union.europa.eu/principles-countries-history/country-profiles_en"],
  ["nato", "Naton jäsenvaltio", ["albania", "belgia", "bulgaria", "kanada", "kroatia", "tsekki", "tanska", "espanja", "viro", "suomi", "ranska", "saksa", "kreikka", "unkari", "islanti", "italia", "latvia", "liettua", "luxemburg", "montenegro", "alankomaat", "pohjois-makedonia", "norja", "puola", "portugali", "romania", "slovakia", "slovenia", "turkki", "yhdistynyt-kuningaskunta", "yhdysvallat"], "yhteiskunta", "https://www.nato.int/nato-welcome/index.html"],
  ["eurozone", "euroalueen jäsenvaltio", ["itavalta", "belgia", "kypros", "viro", "suomi", "ranska", "saksa", "kreikka", "irlanti", "italia", "latvia", "liettua", "luxemburg", "malta", "alankomaat", "portugali", "slovakia", "slovenia", "espanja", "kroatia"], "talous", "https://economy-finance.ec.europa.eu/euro/euro-area_en"],
  ["commonwealth", "Kansainyhteisön jäsenmaa", ["antigua-ja-barbuda", "australia", "bahama", "bangladesh", "barbados", "belize", "botswana", "brunei", "kanada", "dominica", "fidzi", "ghana", "grenada", "guyana", "inti a", "jamaika", "kenia", "kiribati", "lesotho", "malawi", "malesia", "malta", "mauritius", "mosambik", "namibia", "nauru", "nigeria", "pakistan", "papua-uusi-guinea", "ruanda", "samoa", "seychellit", "sierra-leone", "singapore", "salomonsaaret", "etelainen-afrikka", "sri-lanka", "saint-kitts-ja-nevis", "saint-lucia", "saint-vincent-ja-grenadiinit", "tansania", "tonga", "trinidad-ja-tobago", "tuvalu", "uganda", "yhdistynyt-kuningaskunta", "vanuatu", "sambia", "zimbabwe"], "maailma", "https://thecommonwealth.org/our-member-countries"],
  ["oecd", "OECD:n jäsenmaa", ["australia", "itavalta", "belgia", "kanada", "chile", "kolumbia", "costa-rica", "tsekki", "tanska", "viro", "suomi", "ranska", "saksa", "kreikka", "unkari", "islanti", "irlanti", "israel", "italia", "japani", "korean-tasavalta", "latvia", "liettua", "luxemburg", "meksiko", "alankomaat", "uusi-seelanti", "norja", "puola", "portugali", "slovakia", "slovenia", "espanja", "ruotsi", "sveitsi", "turkki", "yhdistynyt-kuningaskunta", "yhdysvallat"], "talous", "https://www.oecd.org/about/members-and-partners/"],
  ["opec", "OPECin jäsenmaa", ["algeria", "angola", "kongo", "ecuador", "gabon", "iran", "irak", "kuwait", "libya", "nigeria", "saudi-arabia", "yhdistyneet-arabiemiirikunnat", "venezuela"], "talous", "https://www.opec.org/opec_web/en/about_us/25.htm"],
  ["baltic-sea", "Itämeren rannikkovaltio", ["suomi", "ruotsi", "viro", "latvia", "liettua", "puola", "saksa", "tanska", "venaja"], "maantiede", "https://helcom.fi/about-us/facts-and-figures/"],
  ["south-america", "Etelä-Amerikan valtio", continentGroups["etela-amerikka"], "maantiede", "https://unstats.un.org/unsd/methodology/m49/"],
  ["g20", "G20-ryhmän valtio", ["argentiina", "australia", "brasilia", "kanada", "kiina", "ranska", "saksa", "inti a", "indonesia", "italia", "japani", "meksiko", "venaja", "saudi-arabia", "etelainen-afrikka", "korean-tasavalta", "turkki", "yhdistynyt-kuningaskunta", "yhdysvallat"], "talous", "https://g20.org/about-g20/"],
  ["nordic", "Pohjoismaa", ["suomi", "ruotsi", "norja", "tanska", "islanti", "alankomaat", "saksan"], "maantiede", "https://www.norden.org/en/information/nordic-region"],
];
for (const [id, label, ids, category, url] of countryOrganizations) {
  const filtered = ids.filter((candidate) => countryById.has(candidate));
  if (filtered.length >= 8) countrySpecs.push({ id: `country-group-${id}`, prompt: id === "baltic-sea" ? "Nimeä HELCOMin Itämeren alueen rannikkovaltio." : `Nimeä ${label}.`, category, ids: filtered, basis: `Jäsenyys perustuu järjestön viralliseen luetteloon: ${label}.`, source: source(label, url, "Virallinen organisaatiolähde; luettelo jäädytetty 1.1.2026."), easy: commonCountries, rare: rareCountries });
}

for (const [index, letter] of ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "v", "y", "z"].entries()) {
  const ids = idsWhere((entity) => entity.canonical.toLocaleLowerCase("fi-FI").startsWith(letter));
  if (ids.length >= 8) countrySpecs.push({ id: `country-start-${index}-${letter}`, prompt: `Nimeä valtio, jonka suomenkielinen nimi alkaa kirjaimella ${letter.toUpperCase()}.`, category: index % 2 ? "maailma" : "suomen-kieli", ids, basis: `YK:n täydellisestä valtiojoukosta valitaan deterministisesti kaikki valtiot, joiden vakiintunut suomenkielinen nimi alkaa kirjaimella ${letter}.`, easy: commonCountries, rare: rareCountries });
}

const countryShapeFilters: Array<[string, string, (name: string) => boolean]> = [
  ["starts-vowel", "joka alkaa vokaalilla", (name) => /^[aeiouyäö]/iu.test(name)],
  ["ends-vowel", "joka päättyy vokaaliin", (name) => /[aeiouyäö]$/iu.test(name)],
  ["has-diacritic", "jonka nimessä on suomen kielen tarke", (name) => /[äöåžš]/iu.test(name)],
  ["has-two-words", "jonka nimi koostuu vähintään kahdesta sanasta", (name) => name.trim().split(/\s+/u).length >= 2],
  ["length-8-plus", "jonka nimessä on vähintään kahdeksan kirjainta", (name) => name.replaceAll(" ", "").length >= 8],
  ["length-12-plus", "jonka nimessä on vähintään kaksitoista kirjainta", (name) => name.replaceAll(" ", "").length >= 12],
  ["contains-n", "jonka nimessä on N-kirjain", (name) => /n/iu.test(name)],
  ["contains-r", "jonka nimessä on R-kirjain", (name) => /r/iu.test(name)],
  ["contains-s", "jonka nimessä on S-kirjain", (name) => /s/iu.test(name)],
];
for (const [groupId, groupLabel, groupIds, category, url] of countryOrganizations) {
  const members = groupIds.map((id) => countryById.get(id)).filter((entity): entity is UniverseEntity => Boolean(entity));
  for (const [shapeId, shapeLabel, predicate] of countryShapeFilters) {
    const selected = members.filter((entity) => predicate(entity.canonical)).map((entity) => entity.id);
    if (selected.length >= 8) countrySpecs.push({ id: `group-${groupId}-${shapeId}`, prompt: `Nimeä ${groupLabel}, ${shapeLabel}.`, category, ids: selected, basis: `${groupLabel} virallisesta jäsenjoukosta johdettu nimimuodon predicate: ${shapeLabel}.`, source: source(groupLabel, url, "Virallinen jäsenluettelo; derived predicate jäädytetty 1.1.2026."), easy: commonCountries, rare: rareCountries });
  }
}
for (const [continent, ids] of Object.entries(continentGroups)) {
  const members = ids.map((id) => countryById.get(id)).filter((entity): entity is UniverseEntity => Boolean(entity));
  for (const [id, label, predicate] of countryShapeFilters) {
    const selected = members.filter((entity) => predicate(entity.canonical)).map((entity) => entity.id);
    if (selected.length >= 8) countrySpecs.push({ id: `continent-${continent}-shape-${id}`, prompt: `Nimeä ${continent.replaceAll("-", " ")}n valtio, ${label}.`, category: "maantiede", ids: selected, basis: `YK:n ${continent}-joukosta johdettu objektiivinen nimimuotoa koskeva predicate: ${label}.`, easy: commonCountries, rare: rareCountries });
  }
}

for (const threshold of [7, 8, 9, 10, 11, 12, 13, 14]) {
  const ids = idsWhere((entity) => entity.canonical.replaceAll(" ", "").length >= threshold);
  if (ids.length >= 8) countrySpecs.push({ id: `country-length-at-least-${threshold}`, prompt: `Nimeä valtio, jonka suomenkielisessä nimessä on vähintään ${threshold} kirjainta.`, category: "suomen-kieli", ids, basis: `YK:n täydellisestä valtiojoukosta kaikki nimet, joiden välilyönnitön pituus on vähintään ${threshold}.`, easy: commonCountries, rare: rareCountries });
}

const elementEntities = elementBase.entities;
const elementSpecs: PredicateSpec[] = [];
for (const [start, end] of [[1, 36], [19, 54], [37, 72], [55, 90], [73, 118], [1, 54], [55, 118], [11, 30], [31, 50], [51, 70], [71, 90], [91, 110]]) {
  const ids = elementEntities.slice(start - 1, end).map((entity) => entity.id);
  elementSpecs.push({ id: `atomic-range-${start}-${end}`, prompt: `Nimeä alkuaine, jonka järjestysluku on välillä ${start}–${end}.`, category: "tiede", ids, basis: `IUPAC:n 118 alkuaineen joukosta kaikki järjestysluvut ${start}–${end}, rajat mukaan lukien.`, easy: commonElements, rare: rareElements });
}
for (const [id, label, predicate] of [
  ["contains-a", "jonka nimessä on kirjain A", (name: string) => /a/iu.test(name)],
  ["contains-i", "jonka nimessä on kirjain I", (name: string) => /i/iu.test(name)],
  ["contains-o", "jonka nimessä on kirjain O", (name: string) => /o/iu.test(name)],
  ["starts-k", "jonka nimi alkaa K-kirjaimella", (name: string) => /^k/iu.test(name)],
  ["starts-p", "jonka nimi alkaa P-kirjaimella", (name: string) => /^p/iu.test(name)],
] as const) {
  const ids = elementEntities.filter((entity) => predicate(entity.canonical)).map((entity) => entity.id);
  if (ids.length >= 8) elementSpecs.push({ id: `element-${id}`, prompt: `Nimeä alkuaine, ${label}.`, category: "tiede", ids, basis: `IUPAC:n täydellisestä alkuainejoukosta johdettu nimipohjainen, deterministinen predicate: ${label}.`, easy: commonElements, rare: rareElements });
}
for (const [index, letter] of ["a", "b", "c", "d", "e", "f", "g", "h", "i", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "v"].entries()) {
  const ids = elementEntities.filter((entity) => entity.canonical.startsWith(letter)).map((entity) => entity.id);
  if (ids.length >= 8) elementSpecs.push({ id: `element-start-${index}-${letter}`, prompt: `Nimeä alkuaine, jonka suomenkielinen nimi alkaa kirjaimella ${letter.toUpperCase()}.`, category: index % 2 ? "suomen-kieli" : "tiede", ids, basis: `IUPAC:n täydellisestä alkuainejoukosta valitaan kaikki alkuaineet, joiden suomenkielinen nimi alkaa kirjaimella ${letter}.`, easy: commonElements, rare: rareElements });
}

const elementShapeFilters: Array<[string, string, (name: string) => boolean]> = [
  ["long-name", "jonka nimessä on vähintään kahdeksan kirjainta", (name) => name.length >= 8],
  ["short-name", "jonka nimi on korkeintaan kuusi kirjainta pitkä", (name) => name.length <= 6],
  ["starts-vowel", "jonka nimi alkaa vokaalilla", (name) => /^[aeiouyäö]/iu.test(name)],
  ["ends-vowel", "jonka nimi päättyy vokaaliin", (name) => /[aeiouyäö]$/iu.test(name)],
  ["contains-r", "jonka nimessä on R-kirjain", (name) => /r/iu.test(name)],
  ["contains-t", "jonka nimessä on T-kirjain", (name) => /t/iu.test(name)],
  ["contains-m", "jonka nimessä on M-kirjain", (name) => /m/iu.test(name)],
];
for (const [id, label, predicate] of elementShapeFilters) {
  const ids = elementEntities.filter((entity) => predicate(entity.canonical)).map((entity) => entity.id);
  if (ids.length >= 8) elementSpecs.push({ id: `element-shape-${id}`, prompt: `Nimeä alkuaine, ${label}.`, category: "tiede", ids, basis: `IUPAC:n täydellisestä joukosta johdettu nimimuodon predicate: ${label}.`, easy: commonElements, rare: rareElements });
}
for (const parity of ["parillinen", "pariton"]) {
  const ids = elementEntities.filter((_, index) => parity === "parillinen" ? (index + 1) % 2 === 0 : (index + 1) % 2 === 1).map((entity) => entity.id);
  elementSpecs.push({ id: `element-atomic-${parity}`, prompt: `Nimeä alkuaine, jonka järjestysluku on ${parity}.`, category: "tiede", ids, basis: `IUPAC:n täydellisestä joukosta kaikki ${parity} järjestysluvut.`, easy: commonElements, rare: rareElements });
}
for (const lastDigit of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
  const ids = elementEntities.filter((_, index) => (index + 1) % 10 === lastDigit).map((entity) => entity.id);
  if (ids.length >= 8) elementSpecs.push({ id: `element-last-digit-${lastDigit}`, prompt: `Nimeä alkuaine, jonka järjestysluku päättyy numeroon ${lastDigit}.`, category: "tiede", ids, basis: `IUPAC:n täydellisestä joukosta kaikki alkuaineet, joiden järjestysluvun viimeinen numero on ${lastDigit}.`, easy: commonElements, rare: rareElements });
}

const derived = [
  ...countrySpecs.map((spec) => makeDerived(countryBase, spec)),
  ...elementSpecs.map((spec) => makeDerived(elementBase, spec)),
];

export const expandedBaseUniverses: VerifiedUniverse[] = [countryBase, elementBase];
export const expandedUniverses: VerifiedUniverse[] = [...expandedBaseUniverses, ...derived.map((item) => item.universe)];
const retainedDerivedPredicates = new Set([
  "continent-afrikka",
  "continent-aasia",
  "continent-eurooppa",
  "continent-pohjois-amerikka",
  "continent-etela-amerikka",
  "continent-oseania",
  "country-group-eu",
  "country-group-nato",
  "country-group-eurozone",
  "country-group-commonwealth",
  "country-group-oecd",
  "country-group-opec",
  "country-group-g20",
  "atomic-range-1-36",
  "atomic-range-19-54",
  "atomic-range-37-72",
  "atomic-range-55-90",
  "atomic-range-73-118",
  "atomic-range-1-54",
  "atomic-range-55-118",
]);

export const expandedQuestions = derived.map((item) => ({
  ...item.question,
  dailyEligible: retainedDerivedPredicates.has(item.question.predicateId) && Object.values(item.question.scores).some((points) => points === 10 || points === 15) && Object.values(item.question.scores).includes(100),
  ...(retainedDerivedPredicates.has(item.question.predicateId) && Object.values(item.question.scores).some((points) => points === 10 || points === 15) && Object.values(item.question.scores).includes(100) ? {} : { reviewDisposition: "retire" as const }),
}));
