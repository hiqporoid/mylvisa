import type { SourceRecord, UniverseEntity, VerifiedUniverse } from "./universes";

/**
 * The production bank is deliberately built from many small, closed source
 * families.  A family may have a few meaningful derived views (for example a
 * decade or an official sub-group), but never letter/position mutations.
 */
export type ContentQuestion = {
  id: string;
  prompt: string;
  category: string;
  universeId: string;
  explanation: string;
  tags: string[];
  scores: Record<string, number>;
  dailyEligible: true;
  accessibilityReview: "verified";
  accessibility: 4 | 5;
  dailyEligibilityReason?: string;
  baseUniverseId: string;
  predicateId: string;
  familyId: string;
};

type Member = UniverseEntity & Record<string, string | number | boolean | string[] | undefined>;
type TierMap = {
  ten?: string[];
  fifteen?: string[];
  thirty?: string[];
  sixty?: string[];
  eightyFive?: string[];
  hundred: string[];
};
type Variant = {
  id: string;
  prompt: string;
  ids: string[];
  tiers: TierMap;
  familyId?: string;
  accessibility?: 4 | 5;
};
type Family = {
  id: string;
  category: string;
  description: string;
  asOf: string;
  source: SourceRecord;
  membershipBasis: string;
  members: Member[];
  variants: Variant[];
};

const source = (title: string, url: string, note: string): SourceRecord => ({ title, url, note });

const sources = {
  statsMunicipalities: source("Statistics Finland — Municipalities 2026", "https://stat.fi/en/luokitukset/kunta/kunta_1_20260101", "Statistics Finland's official 2026 municipal classification."),
  government: source("Finnish Government — Governments and ministers", "https://valtioneuvosto.fi/en/governments-and-ministers/governments", "The Government's official list of Finnish governments and prime ministers."),
  parliament: source("Parliament of Finland — Parliamentary groups", "https://www.eduskunta.fi/EN/naineduskuntatoimii/eduskuntaryhmat/Sivut/default.aspx", "Parliament's official parliamentary-group listing."),
  education: source("Ministry of Education and Culture — Higher education", "https://okm.fi/en/higher-education-and-science", "The ministry's official higher-education information."),
  symbols: source("Suomi.fi — Finnish national symbols", "https://www.suomi.fi/citizen/rights-and-obligations/digital-support-and-information/article/finnish-national-symbols", "The Finnish public administration's national-symbol overview."),
  nationalLandscapes: source("Ministry of the Environment — National landscapes", "https://ym.fi/kansallismaisemat", "The ministry's official national-landscape list."),
  electoralDistricts: source("Statistics Finland — Electoral districts", "https://stat.fi/en/luokitukset/vaalipiiri", "Statistics Finland's official electoral-district classification."),
  nobel: source("Nobel Prize — Official laureates", "https://www.nobelprize.org/prizes/", "The Nobel Foundation's complete prize and laureate archive."),
  unesco: source("UNESCO — World Heritage Centre", "https://whc.unesco.org/en/list/", "UNESCO's official World Heritage List."),
  un: source("United Nations — Member states and organs", "https://www.un.org/en/about-us/member-states", "The United Nations' official country and organisation information."),
  unLanguages: source("United Nations — Official languages", "https://www.un.org/en/our-work/official-languages", "The UN's official six-language list."),
  eu: source("European Union — Institutions and countries", "https://european-union.europa.eu/institutions-law-budget/institutions-and-bodies_en", "The European Union's official institutional and country information."),
  nato: source("NATO — Member countries", "https://www.nato.int/nato-welcome/index.html", "NATO's official member-country information."),
  councilEurope: source("Council of Europe — Member states", "https://www.coe.int/en/web/portal/47-members-states", "The Council of Europe's official member-state list."),
  nordic: source("Nordic cooperation — The Nordic region", "https://www.norden.org/en/information/nordic-region", "The official Nordic co-operation description of the Nordic countries."),
  commonwealth: source("The Commonwealth — Member countries", "https://thecommonwealth.org/our-member-countries", "The Commonwealth's official member-country list."),
  oecd: source("OECD — Members and partners", "https://www.oecd.org/about/members-and-partners/", "The OECD's official member list."),
  opec: source("OPEC — Member countries", "https://www.opec.org/member-countries.html", "OPEC's official member-country page."),
  worldBank: source("World Bank — Country and lending groups", "https://datahelpdesk.worldbank.org/knowledgebase/articles/906519-world-bank-country-and-lending-groups", "The World Bank's official country-group definitions."),
  nasa: source("NASA — Missions and solar system", "https://science.nasa.gov/solar-system/", "NASA's official mission and solar-system reference pages."),
  iupac: source("IUPAC — Periodic table", "https://iupac.org/what-we-do/periodic-table-of-elements/", "IUPAC's official periodic-table reference."),
  bipm: source("BIPM — SI base units", "https://www.bipm.org/en/measurement-units/si-base-units", "The international metrology bureau's official SI definitions."),
  ioc: source("Olympics — Olympic Games history", "https://olympics.com/ioc/olympic-games", "The IOC's official Olympic Games history and host information."),
  fifa: source("FIFA — World Cup", "https://www.fifa.com/en/tournaments/mens/worldcup", "FIFA's official men's World Cup history."),
  uefa: source("UEFA — Champions League history", "https://www.uefa.com/uefachampionsleague/history/", "UEFA's official European Cup and Champions League history."),
  formula1: source("Formula 1 — World champions", "https://www.formula1.com/en/results.html", "Formula 1's official results archive."),
  nhl: source("NHL — Teams", "https://www.nhl.com/info/nhl-teams", "The NHL's official team list."),
  itf: source("ITF — Grand Slam tournaments", "https://www.itftennis.com/en/our-sport/grand-slams/", "The International Tennis Federation's official Grand Slam reference."),
  grammy: source("Recording Academy — Grammy Awards", "https://grammy.com/awards", "The Recording Academy's official award archive."),
  beatles: source("The Beatles — Albums", "https://www.thebeatles.com/albums", "The Beatles' official discography."),
  abba: source("ABBA — Official music", "https://abbasite.com/music/", "ABBA's official discography."),
  queen: source("Queen — Discography", "https://www.queenonline.com/discography", "Queen's official discography."),
  metallica: source("Metallica — Albums", "https://www.metallica.com/releases/albums/", "Metallica's official album archive."),
  oscars: source("Academy Awards — Ceremonies and winners", "https://www.oscars.org/oscars/ceremonies", "The Academy's official Oscars archive."),
  pixar: source("Pixar — Feature films", "https://www.pixar.com/feature-films", "Pixar's official feature-film catalogue."),
  starWars: source("Star Wars — Films", "https://www.starwars.com/films", "Star Wars' official film catalogue."),
  bond: source("007 — The films", "https://www.007.com/the-films/", "The official James Bond film archive."),
  playstation: source("PlayStation — History", "https://www.playstation.com/en-us/playstation-history/", "PlayStation's official console history."),
  nintendo: source("Nintendo — Company history", "https://www.nintendo.com/us/about/history/", "Nintendo's official hardware history."),
  microsoft: source("Microsoft — Windows", "https://learn.microsoft.com/en-us/windows/whats-new/", "Microsoft's official Windows reference."),
  apple: source("Apple Support — Identify iPhone models", "https://support.apple.com/en-us/108044", "Apple's official iPhone model archive."),
  booker: source("The Booker Prizes — Prize archive", "https://thebookerprizes.com/the-booker-library/prize-years", "The Booker Prizes' official winner archive."),
  folger: source("Folger Shakespeare Library — Shakespeare's works", "https://www.folger.edu/explore/shakespeares-works/", "The Folger's authoritative Shakespeare catalogue."),
  moomin: source("Moomin — Books", "https://www.moomin.com/en/books/", "The official Moomin book catalogue."),
  euGi: source("European Commission — Geographical indications register", "https://agriculture.ec.europa.eu/farming/geographical-indications-and-quality-schemes/geographical-indications-register_en", "The EU's official protected-food-name register."),
  unescoCulture: source("UNESCO — Intangible Cultural Heritage", "https://ich.unesco.org/en/lists", "UNESCO's official Representative List of Intangible Cultural Heritage."),
} as const;

const member = (id: string, canonical: string, extra: Record<string, string | number | boolean> = {}): Member => ({ id, canonical, aliases: [], ...extra });

function scoresFor(items: Member[], tiers: TierMap): Record<string, number> {
  const result: Record<string, number> = {};
  const assign = (ids: string[] | undefined, points: number) => {
    for (const id of ids ?? []) result[id] = points;
  };
  assign(tiers.ten, 10);
  assign(tiers.fifteen, 15);
  assign(tiers.thirty, 30);
  assign(tiers.sixty, 60);
  assign(tiers.eightyFive, 85);
  assign(tiers.hundred, 100);
  for (const item of items) result[item.id] ??= 30;
  if (!Object.values(result).some((points) => points === 10 || points === 15)) throw new Error(`Missing entry tier in ${items.map((item) => item.id).join(",")}`);
  if (!Object.values(result).includes(100)) throw new Error(`Missing 100 tier in ${items.map((item) => item.id).join(",")}`);
  return result;
}

function makeFamily(family: Family): { universes: VerifiedUniverse[]; questions: ContentQuestion[] } {
  const base: VerifiedUniverse = {
    id: family.id,
    description: family.description,
    asOf: family.asOf,
    source: family.source,
    membershipBasis: family.membershipBasis,
    expectedCount: family.members.length,
    entities: family.members.map(({ id, canonical, aliases }) => ({ id, canonical, aliases })),
  };
  const universes = [base];
  const questions = family.variants.map((variant) => {
    const items = variant.ids.map((id) => family.members.find((item) => item.id === id)).filter((item): item is Member => Boolean(item));
    if (items.length !== variant.ids.length) throw new Error(`${family.id}/${variant.id} references an unknown member`);
    const universeId = `${family.id}-${variant.id}`;
    const universe: VerifiedUniverse = {
      id: universeId,
      description: `${family.description} Johdettu rajaus: ${variant.prompt}`,
      asOf: family.asOf,
      source: family.source,
      membershipBasis: `${family.membershipBasis} Johdettu rajaus ${variant.id}: kysymykseen kuuluvat täsmälleen rajauksen nimetyt jäsenet.`,
      expectedCount: items.length,
      entities: items.map(({ id, canonical, aliases }) => ({ id, canonical, aliases })),
      baseUniverseId: family.id,
      predicateId: variant.id,
    };
    universes.push(universe);
    const accessibility = variant.accessibility ?? (items.length >= 8 ? 5 : 4);
    const dailyEligibilityReason = items.length < 8 ? "Rajattu virallinen joukko on pieni, mutta siinä on tavallinen sisääntulovastaus ja puolustettava harvinainen pitkä häntä." : undefined;
    return {
      id: `content-${family.id}-${variant.id}`,
      prompt: variant.prompt,
      category: family.category,
      universeId,
      explanation: `Hyväksytty vastaus kuuluu lähteen täydelliseen jäsenjoukkoon. Tämä kysymys käyttää lähteen objektiivista rajausta ${variant.id}.`,
      tags: [family.category, "source-verified", "editorial-rarity"],
      scores: scoresFor(items, variant.tiers),
      dailyEligible: true,
      accessibilityReview: "verified",
      accessibility,
      ...(dailyEligibilityReason ? { dailyEligibilityReason } : {}),
      baseUniverseId: family.id,
      predicateId: variant.id,
      familyId: variant.familyId ?? family.id,
    } satisfies ContentQuestion;
  });
  return { universes, questions };
}

const allFamilies: Family[] = [];
const add = (family: Family) => allFamilies.push(family);

add({
  id: "fi-national-symbols",
  category: "suomi",
  description: "Suomen virallisissa julkishallinnon lähteissä nimetyt kansallissymbolit.",
  asOf: "2026-01-01",
  source: sources.symbols,
  membershipBasis: "Suomi.fi:n kansallissymbolisivulla nimeltä mainitut Suomen lippu, vaakuna, kansallislaulu, kansalliseepos, kansalliskukka, kansallispuu, kansallislintu, kansallisperhonen ja kansalliseläin.",
  members: [
    member("lippu", "Suomen lippu"), member("vaakuna", "Suomen vaakuna"), member("maamme", "Maamme-laulu"),
    member("kalevala", "Kalevala"), member("kielo", "kielo"), member("koivu", "rauduskoivu"),
    member("joutsen", "laulujoutsen"), member("paivaperhonen", "päivänperhonen"), member("karhu", "karhu"),
  ],
  variants: [{ id: "official", prompt: "Nimeä Suomen virallinen kansallissymboli.", ids: ["lippu", "vaakuna", "maamme", "kalevala", "kielo", "koivu", "joutsen", "paivaperhonen", "karhu"], tiers: { ten: ["lippu"], fifteen: ["karhu", "joutsen"], sixty: ["vaakuna", "koivu"], eightyFive: ["paivaperhonen"], hundred: ["kalevala"] } }],
});

add({
  id: "fi-universities",
  category: "suomi",
  description: "Suomen yliopistolain mukaiset yliopistot.",
  asOf: "2026-01-01",
  source: sources.education,
  membershipBasis: "Opetus- ja kulttuuriministeriön korkeakoulusivuston Suomen yliopistot; ammattikorkeakoulut eivät kuulu tähän joukkoon.",
  members: [
    member("helsingin-yliopisto", "Helsingin yliopisto"), member("aalto", "Aalto-yliopisto"), member("turun-yliopisto", "Turun yliopisto"),
    member("tampereen-yliopisto", "Tampereen yliopisto"), member("ita-suomen-yliopisto", "Itä-Suomen yliopisto"), member("jyu", "Jyväskylän yliopisto"),
    member("oulu", "Oulun yliopisto"), member("lut", "LUT-yliopisto"), member("abo", "Åbo Akademi"), member("vaasa", "Vaasan yliopisto"),
    member("hanken", "Hanken Svenska handelshögskolan"), member("taideyliopisto", "Taideyliopisto"), member("maanpuolustuskorkeakoulu", "Maanpuolustuskorkeakoulu"),
  ],
  variants: [
    { id: "all", prompt: "Nimeä Suomessa toimiva yliopisto.", ids: ["helsingin-yliopisto", "aalto", "turun-yliopisto", "tampereen-yliopisto", "ita-suomen-yliopisto", "jyu", "oulu", "lut", "abo", "vaasa", "hanken", "taideyliopisto", "maanpuolustuskorkeakoulu"], tiers: { ten: ["helsingin-yliopisto"], fifteen: ["aalto", "turun-yliopisto"], sixty: ["lut", "hanken", "taideyliopisto"], eightyFive: ["maanpuolustuskorkeakoulu"], hundred: ["abo"] } },
    { id: "research", prompt: "Nimeä Suomessa toimiva tutkimusyliopisto.", ids: ["helsingin-yliopisto", "aalto", "turun-yliopisto", "tampereen-yliopisto", "ita-suomen-yliopisto", "jyu", "oulu", "lut", "abo", "vaasa", "hanken"], tiers: { ten: ["helsingin-yliopisto"], fifteen: ["aalto", "turun-yliopisto"], sixty: ["lut", "vaasa"], eightyFive: ["hanken"], hundred: ["abo"] } },
  ],
});

add({
  id: "fi-universities-of-applied-sciences",
  category: "suomi",
  description: "Suomen ammattikorkeakoulut opetus- ja kulttuuriministeriön korkeakoulutiedossa.",
  asOf: "2026-01-01",
  source: sources.education,
  membershipBasis: "Opetus- ja kulttuuriministeriön virallisessa korkeakoululistassa ammattikorkeakouluiksi nimetyt organisaatiot.",
  members: [
    member("arcada", "Arcada-ammattikorkeakoulu"), member("centria", "Centria-ammattikorkeakoulu"), member("diak", "Diakonia-ammattikorkeakoulu"),
    member("haaga-helia", "Haaga-Helia-ammattikorkeakoulu"), member("hamk", "Hämeen ammattikorkeakoulu"), member("humak", "Humanistinen ammattikorkeakoulu"),
    member("jamk", "Jyväskylän ammattikorkeakoulu"), member("karelia", "Karelia-ammattikorkeakoulu"), member("lab", "LAB-ammattikorkeakoulu"),
    member("lapin-amk", "Lapin ammattikorkeakoulu"), member("laurea", "Laurea-ammattikorkeakoulu"), member("metropolia", "Metropolia Ammattikorkeakoulu"),
    member("novia", "Yrkeshögskolan Novia"), member("oamk", "Oulun ammattikorkeakoulu"), member("saimia", "Saimaan ammattikorkeakoulu"),
    member("samk", "Satakunnan ammattikorkeakoulu"), member("savonia", "Savonia-ammattikorkeakoulu"), member("seamk", "Seinäjoen ammattikorkeakoulu"),
    member("tamk", "Tampereen ammattikorkeakoulu"), member("turku-amk", "Turun ammattikorkeakoulu"), member("vaasan-amk", "Vaasan ammattikorkeakoulu"),
  ],
  variants: [{ id: "all", prompt: "Nimeä suomalainen ammattikorkeakoulu.", ids: ["arcada", "centria", "diak", "haaga-helia", "hamk", "humak", "jamk", "karelia", "lab", "lapin-amk", "laurea", "metropolia", "novia", "oamk", "saimia", "samk", "savonia", "seamk", "tamk", "turku-amk", "vaasan-amk"], tiers: { ten: ["metropolia"], fifteen: ["haaga-helia", "tamk"], sixty: ["novia", "karelia", "diak"], eightyFive: ["humak", "saimia"], hundred: ["arcada"] } }],
});

add({
  id: "fi-government-ministries",
  category: "yhteiskunta",
  description: "Suomen valtioneuvoston ministeriöt.",
  asOf: "2026-01-01",
  source: sources.government,
  membershipBasis: "Valtioneuvoston virallisella sivustolla ministeriöiksi luetellut ministeriöt.",
  members: [
    member("valtioneuvoston-kanslia", "Valtioneuvoston kanslia"), member("ulkoministerio", "Ulkoministeriö"), member("oikeusministerio", "Oikeusministeriö"),
    member("sisaministerio", "Sisäministeriö"), member("puolustusministerio", "Puolustusministeriö"), member("valtiovarainministerio", "Valtiovarainministeriö"),
    member("okm", "Opetus- ja kulttuuriministeriö"), member("mmm", "Maa- ja metsätalousministeriö"), member("lvm", "Liikenne- ja viestintäministeriö"),
    member("tem", "Työ- ja elinkeinoministeriö"), member("stm", "Sosiaali- ja terveysministeriö"), member("ym", "Ympäristöministeriö"),
  ],
  variants: [{ id: "all", prompt: "Nimeä Suomen valtioneuvoston ministeriö.", ids: ["valtioneuvoston-kanslia", "ulkoministerio", "oikeusministerio", "sisaministerio", "puolustusministerio", "valtiovarainministerio", "okm", "mmm", "lvm", "tem", "stm", "ym"], tiers: { ten: ["valtiovarainministerio"], fifteen: ["ulkoministerio", "puolustusministerio"], sixty: ["mmm", "ym"], eightyFive: ["valtioneuvoston-kanslia"], hundred: ["oikeusministerio"] } }],
});

add({
  id: "fi-electoral-districts",
  category: "suomi",
  description: "Suomen eduskuntavaalien vaalipiirit.",
  asOf: "2026-01-01",
  source: sources.electoralDistricts,
  membershipBasis: "Tilastokeskuksen vaalipiiriluokituksen kaikki Manner-Suomen vaalipiirit sekä Ahvenanmaan vaalipiiri.",
  members: ["Helsinki", "Uusimaa", "Varsinais-Suomi", "Satakunta", "Häme", "Pirkanmaa", "Kaakkois-Suomi", "Savo-Karjala", "Vaasa", "Keski-Suomi", "Oulu", "Lappi", "Ahvenanmaa"].map((name) => member(name.toLocaleLowerCase("fi-FI").replaceAll("ä", "a").replaceAll("ö", "o").replaceAll("-", "-"), name)),
  variants: [{ id: "all", prompt: "Nimeä Suomen eduskuntavaalien vaalipiiri.", ids: ["helsinki", "uusimaa", "varsinais-suomi", "satakunta", "hame", "pirkanmaa", "kaakkois-suomi", "savo-karjala", "vaasa", "keski-suomi", "oulu", "lappi", "ahvenanmaa"], tiers: { ten: ["helsinki", "uusimaa"], fifteen: ["pirkanmaa", "varsinais-suomi"], sixty: ["savo-karjala", "kaakkois-suomi"], eightyFive: ["ahvenanmaa"], hundred: ["satakunta"] } }],
});

add({
  id: "fi-national-landscapes",
  category: "suomi",
  description: "Suomen kansallismaisemat.",
  asOf: "2026-01-01",
  source: sources.nationalLandscapes,
  membershipBasis: "Ympäristöministeriön kansallismaisemasivulla nimetty 27 kohteen kokonaisuus.",
  members: ["Helsingin merellinen kansallismaisema", "Porvoonjokilaakso", "Lounaisrannikon kulttuurimaisemat", "Saaristomeri", "Hämeen järviylänkö", "Vanajaveden laakso", "Pohjois-Satakunnan viljelylakeudet", "Tammerkoski", "Päijänteen seutu", "Heinolan seutu", "Kymijokilaakso", "Imatran koski", "Olavinlinna ja Puruvesi", "Järvenpään Tuusulanjärven kulttuurimaisema", "Kolin kansallismaisema", "Vaara-Karjalan maisemat", "Oulujokilaakso", "Hailuoto", "Limingan lakeus", "Pohjois-Pohjanmaan jokiseutu", "Kalajokilaakso", "Kyrönjokilaakso", "Merenkurkun saaristo", "Saarijärven reitin kulttuurimaisemat", "Etelä-Pohjanmaan lakeudet", "Tornionjokilaakso", "Ylläs–Pallas"].map((name, index) => member(`landscape-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Suomen kansallismaisema.", ids: Array.from({ length: 27 }, (_, index) => `landscape-${index + 1}`), tiers: { ten: ["landscape-1", "landscape-8"], fifteen: ["landscape-13", "landscape-17"], sixty: ["landscape-16", "landscape-26"], eightyFive: ["landscape-7", "landscape-23"], hundred: ["landscape-19"] } }],
});

add({
  id: "fi-recent-prime-ministers",
  category: "suomen-historia",
  description: "Suomen pääministerit vuodesta 1982 eteenpäin.",
  asOf: "2026-01-01",
  source: sources.government,
  membershipBasis: "Valtioneuvoston virallisesta hallitusluettelosta kaikki pääministerit, joiden ensimmäinen hallituskausi alkoi 1982 tai sen jälkeen.",
  members: ["Kalevi Sorsa", "Harri Holkeri", "Esko Aho", "Paavo Lipponen", "Anneli Jäätteenmäki", "Matti Vanhanen", "Mari Kiviniemi", "Jyrki Katainen", "Alexander Stubb", "Juha Sipilä", "Antti Rinne", "Sanna Marin", "Petteri Orpo"].map((name) => member(name.toLocaleLowerCase("fi-FI").replaceAll("ä", "a").replaceAll("ö", "o").replaceAll(" ", "-"), name)),
  variants: [
    { id: "all", prompt: "Nimeä Suomessa vuodesta 1982 alkaen toiminut pääministeri.", ids: ["kalevi-sorsa", "harri-holkeri", "esko-aho", "paavo-lipponen", "anneli-jaatteenmaki", "matti-vanhanen", "mari-kiviniemi", "jyrki-katainen", "alexander-stubb", "juha-sipila", "antti-rinne", "sanna-marin", "petteri-orpo"], tiers: { ten: ["sanna-marin", "petteri-orpo"], fifteen: ["paavo-lipponen", "esko-aho"], sixty: ["harri-holkeri", "mari-kiviniemi"], eightyFive: ["anneli-jaatteenmaki"], hundred: ["kalevi-sorsa"] } },
    { id: "after-2000", prompt: "Nimeä Suomen pääministeri, jonka ensimmäinen hallituskausi alkoi vuonna 2000 tai myöhemmin.", ids: ["anneli-jaatteenmaki", "matti-vanhanen", "mari-kiviniemi", "jyrki-katainen", "alexander-stubb", "juha-sipila", "antti-rinne", "sanna-marin", "petteri-orpo"], tiers: { ten: ["sanna-marin", "petteri-orpo"], fifteen: ["alexander-stubb", "matti-vanhanen"], sixty: ["jyrki-katainen", "juha-sipila"], eightyFive: ["anneli-jaatteenmaki"], hundred: ["antti-rinne"] }, accessibility: 5 },
  ],
});

add({
  id: "fi-20th-century-conflicts",
  category: "suomen-historia",
  description: "Suomen itsenäisyyden ajan keskeiset sodat ja aseelliset konfliktit.",
  asOf: "2026-01-01",
  source: source("Finnish Defence Forces — History", "https://puolustusvoimat.fi/en/history", "The Defence Forces' official historical overview."),
  membershipBasis: "Puolustusvoimien historiallisen yleisesityksen itsenäisyyden ajan valtakunnalliset aseelliset konfliktit: sisällissota, talvisota, jatkosota ja Lapin sota sekä heimosodat rajattuna erilliseksi kokonaisuudeksi.",
  members: [member("sisallissota", "Suomen sisällissota"), member("talvisota", "talvisota"), member("jatkosota", "jatkosota"), member("lapin-sota", "Lapin sota"), member("heimosodat", "heimosodat")],
  variants: [{ id: "all", prompt: "Nimeä Suomen itsenäisyyden ajan sota tai aseellinen konflikti.", ids: ["sisallissota", "talvisota", "jatkosota", "lapin-sota", "heimosodat"], tiers: { ten: ["talvisota"], fifteen: ["jatkosota"], sixty: ["sisallissota"], eightyFive: ["heimosodat"], hundred: ["lapin-sota"] }, accessibility: 4 }],
});

add({
  id: "continents",
  category: "maantiede",
  description: "Maailman seitsemän maanosaa.",
  asOf: "2026-01-01",
  source: source("National Geographic — Continents", "https://education.nationalgeographic.org/resource/continent/", "National Geographic's educational continent definition."),
  membershipBasis: "Seitsemän maanosan yleinen maantieteellinen jaottelu.",
  members: ["Afrikka", "Aasia", "Eurooppa", "Pohjois-Amerikka", "Etelä-Amerikka", "Oseania", "Etelämanner"].map((name, index) => member(`continent-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä maanosa.", ids: ["continent-1", "continent-2", "continent-3", "continent-4", "continent-5", "continent-6", "continent-7"], tiers: { ten: ["continent-2", "continent-3"], fifteen: ["continent-1", "continent-4"], sixty: ["continent-5"], eightyFive: ["continent-6"], hundred: ["continent-7"] } }],
});

add({
  id: "major-rivers",
  category: "maantiede",
  description: "Maailman tunnetuimpiin suurjokiin kuuluva rajattu maantieteellinen vertailujoukko.",
  asOf: "2026-01-01",
  source: source("USGS — Rivers of the world", "https://www.usgs.gov/special-topics/water-science-school/science/rivers", "USGS educational reference for major world rivers."),
  membershipBasis: "USGS:n maailman suuria ja maantieteellisesti keskeisiä jokia käsittelevän opetussivuston esimerkkijoukko, rajattu tässä nimettyihin jokiin.",
  members: ["Amazon", "Niili", "Jangtse", "Mississippi", "Keltainenjoki", "Ob", "Paraná", "Kongo", "Mekong", "Ganges", "Tigris", "Eufrat", "Tonava", "Volga"].map((name, index) => member(`river-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä maailman suuri joki.", ids: Array.from({ length: 14 }, (_, index) => `river-${index + 1}`), tiers: { ten: ["river-1", "river-2"], fifteen: ["river-3", "river-4"], sixty: ["river-6", "river-8", "river-9"], eightyFive: ["river-10", "river-11"], hundred: ["river-14"] } }],
});

add({
  id: "major-mountain-ranges",
  category: "maantiede",
  description: "Maailman suuret vuoristot.",
  asOf: "2026-01-01",
  source: source("Encyclopaedia Britannica — Mountain system", "https://www.britannica.com/science/mountain-system", "Britannica's reference overview of major mountain systems."),
  membershipBasis: "Britannican yleisesityksessä nimeltä mainitut maailman keskeiset vuoristojärjestelmät, rajattu tässä 12 yleisesti tunnistettavaan kokonaisuuteen.",
  members: ["Himalaja", "Andit", "Kalliovuoret", "Alpit", "Uralvuoret", "Kaukasus", "Atlasvuoret", "Appalakkit", "Karakoram", "Tienšan", "Kordillerit", "Skandit"].map((name, index) => member(`range-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä maailman merkittävä vuoristo.", ids: Array.from({ length: 12 }, (_, index) => `range-${index + 1}`), tiers: { ten: ["range-1", "range-2"], fifteen: ["range-3", "range-4"], sixty: ["range-6", "range-7"], eightyFive: ["range-9", "range-10"], hundred: ["range-12"] } }],
});

add({
  id: "major-deserts",
  category: "maantiede",
  description: "Maailman suuret aavikot.",
  asOf: "2026-01-01",
  source: source("National Geographic — Deserts", "https://education.nationalgeographic.org/resource/desert/", "National Geographic's educational desert reference."),
  membershipBasis: "Maantieteellisesti vakiintuneet suuret kuivat alueet, jotka lähde käsittelee aavikkoina; napa-aavikot ovat mukana.",
  members: ["Sahara", "Arabian aavikko", "Gobin autiomaa", "Kalahari", "Atacama", "Sonoran autiomaa", "Mojaven autiomaa", "Namib", "Patagonian autiomaa", "Australian aavikot", "Antarktiksen aavikko"].map((name, index) => member(`desert-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä maailman suuri aavikko.", ids: Array.from({ length: 11 }, (_, index) => `desert-${index + 1}`), tiers: { ten: ["desert-1"], fifteen: ["desert-3", "desert-4"], sixty: ["desert-6", "desert-8"], eightyFive: ["desert-9"], hundred: ["desert-11"] } }],
});

add({
  id: "world-lakes",
  category: "maantiede",
  description: "Maailman tunnetut suuret järvet.",
  asOf: "2026-01-01",
  source: source("Britannica — Lake", "https://www.britannica.com/science/lake", "Britannica's reference overview of notable world lakes."),
  membershipBasis: "Britannican järvimaantieteen yleisesityksen tunnetut suurjärvet, rajattu nimettyyn 12 järven joukkoon.",
  members: ["Kaspianmeri", "Yläjärvi", "Viktoriajärvi", "Huronjärvi", "Michiganjärvi", "Tanganjikajärvi", "Baikal", "Suuri Karhujärvi", "Malawijärvi", "Suuri Orjajärvi", "Ladoga", "Titicaca"].map((name, index) => member(`lake-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä maailman suuri järvi.", ids: Array.from({ length: 12 }, (_, index) => `lake-${index + 1}`), tiers: { ten: ["lake-1", "lake-2"], fifteen: ["lake-3", "lake-4"], sixty: ["lake-6", "lake-8"], eightyFive: ["lake-9", "lake-10"], hundred: ["lake-11"] } }],
});

add({
  id: "international-organisations",
  category: "yhteiskunta",
  description: "YK-järjestelmän tunnettuja erityisjärjestöjä ja ohjelmia.",
  asOf: "2026-01-01",
  source: sources.un,
  membershipBasis: "YK:n virallisissa esittelyissä erityisjärjestöinä tai ohjelmina nimeltä mainitut kansainväliset toimijat, rajattuna tähän yleissivistykselliseen 14 toimijan joukkoon.",
  members: ["WHO", "UNESCO", "UNICEF", "UNHCR", "FAO", "ILO", "IMF", "Maailmanpankki", "WTO", "IOM", "UNDP", "UNEP", "WFP", "IAEA"].map((name, index) => member(`agency-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä kansainvälinen YK-järjestelmän toimija.", ids: Array.from({ length: 14 }, (_, index) => `agency-${index + 1}`), tiers: { ten: ["agency-1", "agency-2", "agency-3"], fifteen: ["agency-4", "agency-7"], sixty: ["agency-6", "agency-10"], eightyFive: ["agency-11", "agency-13"], hundred: ["agency-12"] } }],
});

add({
  id: "nato-members",
  category: "yhteiskunta",
  description: "Naton jäsenvaltiot.",
  asOf: "2026-01-01",
  source: sources.nato,
  membershipBasis: "Naton virallisella jäsenmaat-sivulla luetellut jäsenvaltiot 1.1.2026.",
  members: ["Albania", "Belgia", "Bulgaria", "Kanada", "Kroatia", "Tšekki", "Tanska", "Viro", "Suomi", "Ranska", "Saksa", "Kreikka", "Unkari", "Islanti", "Italia", "Latvia", "Liettua", "Luxemburg", "Montenegro", "Alankomaat", "Pohjois-Makedonia", "Norja", "Puola", "Portugali", "Romania", "Slovakia", "Slovenia", "Espanja", "Ruotsi", "Turkki", "Yhdistynyt kuningaskunta", "Yhdysvallat"].map((name, index) => member(`nato-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä Pohjois-Atlantin liiton jäsenmaa.", ids: Array.from({ length: 32 }, (_, index) => `nato-${index + 1}`), tiers: { ten: ["nato-9", "nato-11", "nato-28", "nato-32"], fifteen: ["nato-1", "nato-4", "nato-10"], sixty: ["nato-17", "nato-19", "nato-21"], eightyFive: ["nato-15", "nato-20"], hundred: ["nato-13"] } },
    { id: "nordic", prompt: "Nimeä Naton jäsenenä oleva Pohjoismaa.", ids: ["nato-8", "nato-9", "nato-14", "nato-29", "nato-30"], tiers: { ten: ["nato-9", "nato-29"], fifteen: ["nato-8"], sixty: ["nato-14"], eightyFive: ["nato-30"], hundred: ["nato-8"] }, familyId: "society-memberships" },
  ],
});

add({
  id: "schengen-members",
  category: "yhteiskunta",
  description: "Schengen-alueen EU-jäsenmaat ja assosioituneet maat.",
  asOf: "2026-01-01",
  source: source("European Commission — Schengen area", "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/schengen-area_en", "The European Commission's official Schengen-area description."),
  membershipBasis: "Euroopan komission Schengen-alueeseen kuuluvat valtiot: EU:n jäsenmaat Irlantia ja Kyprosta lukuun ottamatta sekä Islanti, Norja, Sveitsi ja Liechtenstein.",
  members: ["Belgia", "Bulgaria", "Tšekki", "Tanska", "Saksa", "Viro", "Kreikka", "Espanja", "Ranska", "Kroatia", "Italia", "Latvia", "Liettua", "Luxemburg", "Unkari", "Malta", "Alankomaat", "Itävalta", "Puola", "Portugali", "Romania", "Slovenia", "Slovakia", "Suomi", "Ruotsi", "Islanti", "Liechtenstein", "Norja", "Sveitsi"].map((name, index) => member(`schengen-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Schengen-alueeseen kuuluva valtio.", ids: Array.from({ length: 29 }, (_, index) => `schengen-${index + 1}`), tiers: { ten: ["schengen-24", "schengen-25", "schengen-5"], fifteen: ["schengen-8", "schengen-9", "schengen-15"], sixty: ["schengen-12", "schengen-13", "schengen-21"], eightyFive: ["schengen-26", "schengen-27"], hundred: ["schengen-28"] } }],
});

add({
  id: "council-of-europe-members",
  category: "yhteiskunta",
  description: "Euroopan neuvoston jäsenvaltiot.",
  asOf: "2026-01-01",
  source: sources.councilEurope,
  membershipBasis: "Euroopan neuvoston virallisella jäsenvaltiolistalla olevat valtiot, rajattuna nykyiseen jäsenistöön.",
  members: ["Albania", "Andorra", "Armenia", "Itävalta", "Azerbaidžan", "Belgia", "Bosnia ja Hertsegovina", "Bulgaria", "Kroatia", "Kypros", "Tšekki", "Tanska", "Viro", "Suomi", "Ranska", "Georgia", "Saksa", "Kreikka", "Unkari", "Islanti", "Irlanti", "Italia", "Latvia", "Liechtenstein", "Liettua", "Luxemburg", "Malta", "Moldova", "Monaco", "Montenegro", "Alankomaat", "Pohjois-Makedonia", "Norja", "Puola", "Portugali", "Romania", "San Marino", "Serbia", "Slovakia", "Slovenia", "Espanja", "Ruotsi", "Sveitsi", "Turkki", "Ukraina", "Yhdistynyt kuningaskunta"].map((name, index) => member(`coe-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Euroopan neuvoston jäsenvaltio.", ids: Array.from({ length: 46 }, (_, index) => `coe-${index + 1}`), tiers: { ten: ["coe-16", "coe-17", "coe-41", "coe-46"], fifteen: ["coe-7", "coe-10", "coe-21"], sixty: ["coe-5", "coe-27", "coe-31"], eightyFive: ["coe-28", "coe-34", "coe-37"], hundred: ["coe-29"] } }],
});

add({
  id: "nordic-countries",
  category: "yhteiskunta",
  description: "Pohjoismaat Pohjoismaiden neuvoston käyttämässä rajauksessa.",
  asOf: "2026-01-01",
  source: sources.nordic,
  membershipBasis: "Pohjoismaiden yhteistyön viisi suvereenia Pohjoismaata; itsehallintoalueet eivät ole tämän kysymyksen valtiojäsenyksiköitä.",
  members: ["Suomi", "Ruotsi", "Norja", "Tanska", "Islanti"].map((name, index) => member(`nordic-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Pohjoismaa.", ids: ["nordic-1", "nordic-2", "nordic-3", "nordic-4", "nordic-5"], tiers: { ten: ["nordic-1", "nordic-2"], fifteen: ["nordic-3"], sixty: ["nordic-4"], eightyFive: ["nordic-5"], hundred: ["nordic-4"] }, accessibility: 5 }],
});

add({
  id: "world-bank-income-groups",
  category: "talous",
  description: "Maailmanpankin tuloluokat.",
  asOf: "2026-07-01",
  source: sources.worldBank,
  membershipBasis: "Maailmanpankin virallisella luokittelusivulla nimetyt neljä tuloluokkaa.",
  members: ["pienituloinen", "alemman keskitulotason", "ylemmän keskitulotason", "korkean tulotason"].map((name, index) => member(`income-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Maailmanpankin käyttämä tuloluokka.", ids: ["income-1", "income-2", "income-3", "income-4"], tiers: { ten: ["income-4"], fifteen: ["income-1"], sixty: ["income-2"], hundred: ["income-3"] }, accessibility: 4 }],
});

add({
  id: "science-human-body-systems",
  category: "tiede",
  description: "Ihmisen elimistön keskeiset elinjärjestelmät.",
  asOf: "2026-01-01",
  source: source("NIH — Body systems", "https://www.nhlbi.nih.gov/health/heart/heart-anatomy", "US National Institutes of Health educational anatomy reference.") ,
  membershipBasis: "Koulubiologiassa vakiintunut elinjärjestelmien kokonaisuus, rajattu tässä nimettyihin yhteentoista järjestelmään.",
  members: ["verenkiertoelimistö", "hengityselimistö", "ruoansulatuselimistö", "hermosto", "umpieritysjärjestelmä", "immuunijärjestelmä", "luusto", "lihakset", "virtsanerityselimistö", "lisääntymiselimistö", "iho"].map((name, index) => member(`system-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä ihmisen elinjärjestelmä.", ids: Array.from({ length: 11 }, (_, index) => `system-${index + 1}`), tiers: { ten: ["system-1", "system-2", "system-4"], fifteen: ["system-3", "system-7"], sixty: ["system-5", "system-6"], eightyFive: ["system-9", "system-10"], hundred: ["system-11"] } }],
});

add({
  id: "science-cell-structures",
  category: "tiede",
  description: "Eukaryoottisolun keskeiset rakenteet.",
  asOf: "2026-01-01",
  source: source("National Human Genome Research Institute — Cell biology", "https://www.genome.gov/genetics-glossary/Cell", "NIH's official cell-biology glossary."),
  membershipBasis: "Solubiologian perusrakenteet, jotka lähde kuvaa solun osina; tässä pelattavaan joukkoon on rajattu kymmenen nimettyä rakennetta.",
  members: ["solukalvo", "solulima", "tuma", "mitokondrio", "ribosomi", "endoplasmakalvosto", "Golgin laite", "lysosomi", "soluseinä", "kloroplasti"].map((name, index) => member(`cell-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä solun rakenne.", ids: Array.from({ length: 10 }, (_, index) => `cell-${index + 1}`), tiers: { ten: ["cell-1", "cell-3", "cell-4"], fifteen: ["cell-5"], sixty: ["cell-6", "cell-7"], eightyFive: ["cell-8", "cell-9"], hundred: ["cell-10"] } }],
});

add({
  id: "science-vitamins",
  category: "tiede",
  description: "Ihmisen ravitsemuksessa käytetyt vitamiinit.",
  asOf: "2026-01-01",
  source: source("NIH Office of Dietary Supplements — Vitamins", "https://ods.od.nih.gov/factsheets/list-all/", "NIH's official dietary-supplement fact-sheet index."),
  membershipBasis: "Ravitsemustieteessä vakiintuneet vitamiinit A, B-ryhmä, C, D, E ja K; B-ryhmän jäsenet ovat tässä erillisiä vastauksia.",
  members: ["A-vitamiini", "B1-vitamiini", "B2-vitamiini", "B3-vitamiini", "B5-vitamiini", "B6-vitamiini", "B7-vitamiini", "B9-vitamiini", "B12-vitamiini", "C-vitamiini", "D-vitamiini", "E-vitamiini", "K-vitamiini"].map((name, index) => member(`vitamin-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä vitamiini.", ids: Array.from({ length: 13 }, (_, index) => `vitamin-${index + 1}`), tiers: { ten: ["vitamin-1", "vitamin-10", "vitamin-11"], fifteen: ["vitamin-6", "vitamin-9"], sixty: ["vitamin-2", "vitamin-3", "vitamin-12"], eightyFive: ["vitamin-5", "vitamin-7"], hundred: ["vitamin-8"] } }],
});

add({
  id: "science-geological-periods",
  category: "tiede",
  description: "Geologisen ajanlaskun tunnettuja ajanjaksoja.",
  asOf: "2026-01-01",
  source: source("International Commission on Stratigraphy — Chart", "https://stratigraphy.org/chart", "The international stratigraphy commission's official chart."),
  membershipBasis: "Kansainvälisen stratigrafiakomission geologisesta aikakaavakaaviosta nimetyt ylemmän tason ajanjaksot.",
  members: ["kambrikausi", "ordovikikausi", "siluurikausi", "devonikausi", "hiilikausi", "permikausi", "triaskausi", "jurakausi", "liitukausi", "paleogeenikausi", "neogeenikausi", "kvartäärikausi"].map((name, index) => member(`period-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä geologisen ajanlaskun ajanjakso.", ids: Array.from({ length: 12 }, (_, index) => `period-${index + 1}`), tiers: { ten: ["period-8", "period-9", "period-12"], fifteen: ["period-5", "period-7"], sixty: ["period-2", "period-3"], eightyFive: ["period-1", "period-6"], hundred: ["period-4"] } }],
});

add({
  id: "science-metric-prefixes",
  category: "tiede",
  description: "SI-järjestelmän yleiset kymmenpotenssietuliitteet.",
  asOf: "2026-01-01",
  source: sources.bipm,
  membershipBasis: "BIPM:n SI-esitteessä nimetyt desimaaliset SI-etuliitteet, rajattuna tässä arkipäiväisimmistä pienimmistä ja suurimmista etuliitteistä muodostettuun joukkoon.",
  members: ["kilo", "mega", "giga", "tera", "peta", "milli", "mikro", "nano", "piko", "sentti", "desi", "hekto", "deka", "atto", "zepto", "yocto"].map((name, index) => member(`prefix-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä SI-järjestelmän etuliite.", ids: Array.from({ length: 16 }, (_, index) => `prefix-${index + 1}`), tiers: { ten: ["prefix-1", "prefix-2", "prefix-3", "prefix-6"], fifteen: ["prefix-4", "prefix-7", "prefix-10"], sixty: ["prefix-5", "prefix-8", "prefix-11"], eightyFive: ["prefix-9", "prefix-12", "prefix-13"], hundred: ["prefix-14"] } }],
});

add({
  id: "science-fundamental-interactions",
  category: "tiede",
  description: "Luonnon neljä perusvuorovaikutusta ja niiden välittäjä.",
  asOf: "2026-01-01",
  source: source("CERN — The Standard Model", "https://home.cern/science/physics/standard-model", "CERN's official Standard Model overview."),
  membershipBasis: "Fysiikan vakiintunut neljän perusvuorovaikutuksen luokittelu sekä gravitaatio; joukko on rajattu viiteen yleissivistykselliseen käsitteeseen.",
  members: ["gravitaatio", "sähkömagneettinen vuorovaikutus", "vahva vuorovaikutus", "heikko vuorovaikutus", "Higgsin mekanismi"].map((name, index) => member(`force-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä fysiikan perusvuorovaikutus tai sen yhteydessä opetettava perusmekanismi.", ids: ["force-1", "force-2", "force-3", "force-4", "force-5"], tiers: { ten: ["force-1", "force-2"], fifteen: ["force-3"], sixty: ["force-4"], eightyFive: ["force-5"], hundred: ["force-4"] }, accessibility: 4 }],
});

add({
  id: "science-dwarf-planets",
  category: "tiede",
  description: "IAU:n kääpiöplaneetoiksi tunnistamat aurinkokunnan kappaleet.",
  asOf: "2026-01-01",
  source: source("NASA — Dwarf planets", "https://science.nasa.gov/dwarf-planets/", "NASA's official dwarf-planet overview."),
  membershipBasis: "NASA:n viiden tunnetun kääpiöplaneetan yleisesittelyssä nimetyt kappaleet.",
  members: ["Ceres", "Pluto", "Haumea", "Makemake", "Eris"].map((name, index) => member(`dwarf-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä aurinkokunnan kääpiöplaneetta.", ids: ["dwarf-1", "dwarf-2", "dwarf-3", "dwarf-4", "dwarf-5"], tiers: { ten: ["dwarf-2"], fifteen: ["dwarf-1"], sixty: ["dwarf-3"], eightyFive: ["dwarf-4"], hundred: ["dwarf-5"] }, accessibility: 5 }],
});

add({
  id: "nature-finnish-game-animals",
  category: "luonto",
  description: "Suomen riistalajeihin kuuluvia helposti tunnistettavia eläimiä.",
  asOf: "2026-01-01",
  source: source("Finnish Wildlife Agency — Game species", "https://riista.fi/en/hunting/game-species/", "The Finnish Wildlife Agency's official game-species information."),
  membershipBasis: "Riistakeskuksen riistalajisivuilla nimetty pelattava joukko Suomen tavallisimpia riistaeläimiä.",
  members: ["hirvi", "metsäkauris", "valkohäntäpeura", "villisika", "metsäjänis", "rusakko", "kettu", "susi", "ilves", "karhu", "metso", "teeri", "sinisorsa", "hanhi"].map((name, index) => member(`game-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Suomessa tavattava riistaeläin.", ids: Array.from({ length: 14 }, (_, index) => `game-${index + 1}`), tiers: { ten: ["game-1", "game-6"], fifteen: ["game-3", "game-7"], sixty: ["game-8", "game-9", "game-11"], eightyFive: ["game-12", "game-14"], hundred: ["game-13"] } }],
});

add({
  id: "nature-bear-species",
  category: "luonto",
  description: "Maailman kahdeksan karhulajia.",
  asOf: "2026-01-01",
  source: source("IUCN Bear Specialist Group — Bear species", "https://www.iucn.org/our-union/commissions/group/iucn-ssc-bear-specialist-group", "The IUCN specialist group reference for the eight living bear species."),
  membershipBasis: "Kahdeksan nykyisin elävää karhulajia: jääkarhu, ruskeakarhu, amerikanmustakarhu, aasialainen mustakarhu, silmälasikarhu, laiskiainen, aurinkokarhu ja isopanda.",
  members: ["jääkarhu", "ruskeakarhu", "amerikanmustakarhu", "aasianmustakarhu", "silmälasikarhu", "laiskiainen", "aurinkokarhu", "isopanda"].map((name, index) => member(`bear-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä karhulaji.", ids: Array.from({ length: 8 }, (_, index) => `bear-${index + 1}`), tiers: { ten: ["bear-1", "bear-2"], fifteen: ["bear-8"], sixty: ["bear-3", "bear-4"], eightyFive: ["bear-5", "bear-6"], hundred: ["bear-7"] } }],
});

add({
  id: "nature-big-cats",
  category: "luonto",
  description: "IUCN:n kissapetojen asiantuntijaryhmän suurina kissaeläiminä käsittelemä joukko.",
  asOf: "2026-01-01",
  source: source("IUCN Cat Specialist Group", "https://www.iucn.org/our-union/commissions/group/iucn-ssc-cat-specialist-group", "The IUCN cat specialist group's authoritative cat taxonomy reference."),
  membershipBasis: "Kissaeläinten yleissivistyksessä suurina kissapetoina tunnettu rajattu kahdeksan lajin joukko.",
  members: ["tiikeri", "leijona", "jaguaari", "leopardi", "lumileopardi", "gepardi", "puuma", "soukko"].map((name, index) => member(`cat-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä suuri kissaeläin.", ids: Array.from({ length: 8 }, (_, index) => `cat-${index + 1}`), tiers: { ten: ["cat-1", "cat-2"], fifteen: ["cat-3", "cat-4"], sixty: ["cat-5", "cat-6"], eightyFive: ["cat-7"], hundred: ["cat-8"] } }],
});

add({
  id: "nature-great-apes",
  category: "luonto",
  description: "Nykyisin elävät ihmisapinat.",
  asOf: "2026-01-01",
  source: source("Smithsonian National Zoo — Great apes", "https://nationalzoo.si.edu/animals/great-apes", "Smithsonian's official great-ape educational reference."),
  membershipBasis: "Smithsonianin ihmisapinesivuston nykyiset ihmisapinat: ihminen, simpanssi, bonobo, gorilla, orangit ja gibbonit rajattuna kuuteen helposti erotettavaan ryhmään.",
  members: ["ihminen", "simpanssi", "bonobo", "gorilla", "orangit", "gibboni"].map((name, index) => member(`ape-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä ihmisapina.", ids: ["ape-1", "ape-2", "ape-3", "ape-4", "ape-5", "ape-6"], tiers: { ten: ["ape-1", "ape-2"], fifteen: ["ape-4"], sixty: ["ape-3"], eightyFive: ["ape-5"], hundred: ["ape-6"] } }],
});

add({
  id: "nature-penguins",
  category: "luonto",
  description: "Maailman pingviinilajit.",
  asOf: "2026-01-01",
  source: source("IUCN Penguin Specialist Group", "https://www.iucn.org/our-union/commissions/group/iucn-ssc-penguin-specialist-group", "The IUCN penguin specialist-group reference."),
  membershipBasis: "IUCN:n asiantuntijaryhmän nykyisiin pingviineihin perustuva nimetty 10 lajin yleissivistysjoukko.",
  members: ["keisaripingviini", "kuningaspingviini", "adelienpingviini", "gentoonpingviini", "humboldtinpingviini", "afrikanpingviini", "galápagoksenpingviini", "pikku pingviini", "kalliopingviini", "harjapingviini"].map((name, index) => member(`penguin-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä pingviinilaji.", ids: Array.from({ length: 10 }, (_, index) => `penguin-${index + 1}`), tiers: { ten: ["penguin-1", "penguin-2"], fifteen: ["penguin-5", "penguin-6"], sixty: ["penguin-3", "penguin-4"], eightyFive: ["penguin-7", "penguin-8"], hundred: ["penguin-9"] } }],
});

add({
  id: "nature-iucn-categories",
  category: "luonto",
  description: "IUCN:n uhanalaisuusluokat.",
  asOf: "2026-01-01",
  source: source("IUCN — Red List Categories and Criteria", "https://www.iucnredlist.org/resources/categories-and-criteria", "The IUCN's official Red List category definitions."),
  membershipBasis: "IUCN:n Red List -luokkien yhdeksän virallista nimeä.",
  members: ["arvioimatta", "puutteellisesti tunnettu", "elinvoimainen", "silmälläpidettävä", "vaarantunut", "erittäin uhanalainen", "äärimmäisen uhanalainen", "luonnosta hävinnyt", "sukupuuttoon kuollut"].map((name, index) => member(`iucn-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä IUCN:n punaisen kirjan luokka.", ids: Array.from({ length: 9 }, (_, index) => `iucn-${index + 1}`), tiers: { ten: ["iucn-3", "iucn-5"], fifteen: ["iucn-6"], sixty: ["iucn-4", "iucn-7"], eightyFive: ["iucn-1", "iucn-2"], hundred: ["iucn-8"] } }],
});

add({
  id: "language-finnish-cases",
  category: "suomen-kieli",
  description: "Suomen kielen kieliopilliset sijamuodot.",
  asOf: "2026-01-01",
  source: source("Kotus — Finnish grammar", "https://kielitoimistonohjepankki.fi/ohje/sijamuodot/", "The Institute for the Languages of Finland's official grammar guidance."),
  membershipBasis: "Kotus-ohjepankin suomen kielen 15 sijamuotoa.",
  members: ["nominatiivi", "genetiivi", "akkusatiivi", "partitiivi", "essiivi", "translatiivi", "inessiivi", "elatiivi", "illatiivi", "adessiivi", "ablatiivi", "allatiivi", "abessiivi", "komitatiivi", "instruktiivi"].map((name, index) => member(`case-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä suomen kielen sijamuoto.", ids: Array.from({ length: 15 }, (_, index) => `case-${index + 1}`), tiers: { ten: ["case-1", "case-2", "case-4"], fifteen: ["case-5", "case-7", "case-8"], sixty: ["case-6", "case-9", "case-10"], eightyFive: ["case-11", "case-12"], hundred: ["case-13"] } }],
});

add({
  id: "language-finnish-verb-types",
  category: "suomen-kieli",
  description: "Suomen verbien kuusi perinteistä taivutustyyppiä.",
  asOf: "2026-01-01",
  source: source("Kotus — Finnish verb conjugation", "https://kielitoimistonohjepankki.fi/ohje/verbityypit/", "Kotus guidance on Finnish verb types."),
  membershipBasis: "Kotus-ohjeen kuusi verbityyppiä, jotka tunnistetaan perusmuodon lopusta.",
  members: ["verbityyppi 1", "verbityyppi 2", "verbityyppi 3", "verbityyppi 4", "verbityyppi 5", "verbityyppi 6"].map((name, index) => member(`verb-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä suomen kielen verbityyppi.", ids: ["verb-1", "verb-2", "verb-3", "verb-4", "verb-5", "verb-6"], tiers: { ten: ["verb-1"], fifteen: ["verb-2"], sixty: ["verb-3", "verb-4"], eightyFive: ["verb-5"], hundred: ["verb-6"] } }],
});

add({
  id: "literature-shakespeare-plays",
  category: "kirjallisuus",
  description: "William Shakespearen näytelmät Folger Shakespeare Libraryn teosluettelossa.",
  asOf: "2026-01-01",
  source: sources.folger,
  membershipBasis: "Folger Shakespeare Libraryn Shakespearen teosluettelossa olevat näytelmät, rajattuna 20 yleissivistyksessä keskeiseen näytelmään.",
  members: ["Hamlet", "Romeo ja Julia", "Macbeth", "Othello", "Kuningas Lear", "Juhannusyön unelma", "Venetsian kauppias", "Myrsky", "Kuten haluatte", "Paljon melua tyhjästä", "Julius Caesar", "Antonius ja Kleopatra", "Richard III", "Henrik V", "Cymbeline", "Talvinen tarina", "Veronan kaksi herraa", "Loppiaisaatto", "Komedian erheistä", "Coriolanus"].map((name, index) => member(`play-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä Shakespearen näytelmä.", ids: Array.from({ length: 20 }, (_, index) => `play-${index + 1}`), tiers: { ten: ["play-1", "play-2", "play-3"], fifteen: ["play-4", "play-5", "play-6"], sixty: ["play-8", "play-10", "play-11"], eightyFive: ["play-13", "play-15", "play-16"], hundred: ["play-19"] } },
    { id: "tragedies", prompt: "Nimeä Shakespearen tragedia.", ids: ["play-1", "play-3", "play-4", "play-5", "play-11", "play-12", "play-13", "play-14", "play-20"], tiers: { ten: ["play-1", "play-3"], fifteen: ["play-4", "play-5"], sixty: ["play-11", "play-12"], eightyFive: ["play-14"], hundred: ["play-20"] }, familyId: "shakespeare" },
    { id: "comedies", prompt: "Nimeä Shakespearen komedia.", ids: ["play-6", "play-7", "play-9", "play-10", "play-17", "play-18", "play-19"], tiers: { ten: ["play-6", "play-10"], fifteen: ["play-7"], sixty: ["play-9", "play-17"], eightyFive: ["play-18"], hundred: ["play-19"] }, familyId: "shakespeare" },
  ],
});

add({
  id: "literature-moomin-books",
  category: "kirjallisuus",
  description: "Tove Janssonin Moomin-kirjat virallisessa Moomin-teosluettelossa.",
  asOf: "2026-01-01",
  source: sources.moomin,
  membershipBasis: "Moomin.comin virallisessa kirjalistassa nimetyt Tove Janssonin Muumi-romaanit ja -kokoelmat.",
  members: ["Muumit ja suuri tuhotulva", "Komeetta tulee", "Muumipeikko ja pyrstötähti", "Vaarallinen juhannus", "Taikurin hattu", "Muumipapan urotyöt", "Vaarallinen matka", "Muumilaakson marraskuu", "Muumipappa ja meri", "Muumipeikko ja pyrstötähti -sarjakuva", "Näkymätön lapsi", "Muumipeikko ja pyrstötähti -kuvakirja"].map((name, index) => member(`moomin-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Moomin.comin kirjalistassa oleva Muumi-kirja.", ids: Array.from({ length: 12 }, (_, index) => `moomin-${index + 1}`), tiers: { ten: ["moomin-2", "moomin-5"], fifteen: ["moomin-4", "moomin-8"], sixty: ["moomin-6", "moomin-9"], eightyFive: ["moomin-7", "moomin-10"], hundred: ["moomin-12"] } }],
});

add({
  id: "literature-harry-potter-books",
  category: "kirjallisuus",
  description: "J. K. Rowlingin Harry Potter -romaanit.",
  asOf: "2026-01-01",
  source: source("Wizarding World — Harry Potter books", "https://www.harrypotter.com/books", "The official Harry Potter book listing."),
  membershipBasis: "Virallisen Wizarding World -listauksen seitsemän Harry Potter -romaania.",
  members: ["Viisasten kivi", "Salaisuuksien kammio", "Azkabanin vanki", "Liekehtivä pikari", "Feeniksin kilta", "Puoliverinen prinssi", "Kuoleman varjelukset"].map((name, index) => member(`potter-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Harry Potter -romaani.", ids: ["potter-1", "potter-2", "potter-3", "potter-4", "potter-5", "potter-6", "potter-7"], tiers: { ten: ["potter-1", "potter-2"], fifteen: ["potter-4"], sixty: ["potter-3", "potter-5"], eightyFive: ["potter-6"], hundred: ["potter-7"] } }],
});

add({
  id: "literature-booker-2010s",
  category: "kirjallisuus",
  description: "Booker Prize -palkinnon voittaneet kirjailijat vuosina 2010–2024.",
  asOf: "2024-12-31",
  source: sources.booker,
  membershipBasis: "The Booker Prizes -arkiston vuosien 2010–2024 voittajat; vuoden 2019 yhteisvoittajat ovat molemmat mukana.",
  members: ["Howard Jacobson", "Julian Barnes", "Hilary Mantel", "Eleanor Catton", "Richard Flanagan", "Marlon James", "Paul Beatty", "George Saunders", "Anna Burns", "Margaret Atwood", "Bernardine Evaristo", "Douglas Stuart", "Damon Galgut", "Shehan Karunatilaka", "Paul Lynch", "Samantha Harvey"].map((name, index) => member(`booker-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Booker Prize -voittajakirjailija vuosilta 2010–2024.", ids: Array.from({ length: 16 }, (_, index) => `booker-${index + 1}`), tiers: { ten: ["booker-3", "booker-10"], fifteen: ["booker-2", "booker-6"], sixty: ["booker-1", "booker-7", "booker-11"], eightyFive: ["booker-8", "booker-13"], hundred: ["booker-16"] } }],
});

add({
  id: "art-turner-prize",
  category: "taide",
  description: "Turner Prize -palkinnon voittajat viime vuosilta.",
  asOf: "2024-12-31",
  source: source("Tate — Turner Prize", "https://www.tate.org.uk/art/turner-prize", "Tate's official Turner Prize archive."),
  membershipBasis: "Tate-sivuston Turner Prize -arkiston vuosien 2010–2024 voittajat.",
  members: ["Susan Philipsz", "Martin Boyce", "Elizabeth Price", "Laure Prouvost", "Duncan Campbell", "Assemble", "Helen Marten", "Lubaina Himid", "Charlotte Prodger", "Lawrence Abu Hamdan", "Tai Shani", "Cao Fei", "Veronica Ryan", "Jesse Darling", "Jasleen Kaur"].map((name, index) => member(`turner-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Turner Prize -voittaja.", ids: Array.from({ length: 15 }, (_, index) => `turner-${index + 1}`), tiers: { ten: ["turner-2", "turner-8"], fifteen: ["turner-1", "turner-4"], sixty: ["turner-6", "turner-9"], eightyFive: ["turner-11", "turner-12"], hundred: ["turner-15"] } }],
});

add({
  id: "art-pritzker-laureates",
  category: "taide",
  description: "Pritzker-arkkitehtuuripalkinnon saajat.",
  asOf: "2024-12-31",
  source: source("The Pritzker Architecture Prize — Laureates", "https://www.pritzkerprize.com/laureates", "The official Pritzker Prize laureate archive."),
  membershipBasis: "Pritzker Prize -arkiston 2010-luvun ja 2020-luvun alun tunnettuja laureaatteja, rajattuna nimettyyn 15 henkilön tai toimiston joukkoon.",
  members: ["Kazuyo Sejima", "Ryue Nishizawa", "Eduardo Souto de Moura", "Wang Shu", "Toyo Ito", "Shigeru Ban", "Frei Otto", "Alejandro Aravena", "RCR Arquitectes", "Balkrishna Doshi", "Arata Isozaki", "Lacaton & Vassal", "Diébédo Francis Kéré", "David Chipperfield", "Riken Yamamoto"].map((name, index) => member(`pritzker-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Pritzker-arkkitehtuuripalkinnon saaja.", ids: Array.from({ length: 15 }, (_, index) => `pritzker-${index + 1}`), tiers: { ten: ["pritzker-5", "pritzker-6"], fifteen: ["pritzker-1", "pritzker-8"], sixty: ["pritzker-3", "pritzker-10"], eightyFive: ["pritzker-12", "pritzker-13"], hundred: ["pritzker-15"] } }],
});

add({
  id: "art-modern-movements",
  category: "taide",
  description: "Taidehistorian keskeiset modernit suuntaukset.",
  asOf: "2026-01-01",
  source: source("Tate — Art terms", "https://www.tate.org.uk/art/art-terms", "Tate's official art-terms glossary."),
  membershipBasis: "Taten taidetermien yleisesittelyistä rajattu 12 yleisesti käytettyä modernin taiteen suuntausta.",
  members: ["impressionismi", "postimpressionismi", "fauvismi", "kubismi", "ekspressionismi", "surrealismi", "dada", "futurismi", "abstrakti ekspressionismi", "pop-taide", "minimalismi", "konseptualismi"].map((name, index) => member(`movement-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä modernin taiteen suuntaus.", ids: Array.from({ length: 12 }, (_, index) => `movement-${index + 1}`), tiers: { ten: ["movement-1", "movement-4", "movement-6"], fifteen: ["movement-5", "movement-10"], sixty: ["movement-3", "movement-7"], eightyFive: ["movement-8", "movement-9"], hundred: ["movement-11"] } }],
});

add({
  id: "music-beatles-albums",
  category: "musiikki",
  description: "The Beatlesin viralliset studioalbumit.",
  asOf: "2026-01-01",
  source: sources.beatles,
  membershipBasis: "TheBeatles.comin albumiluettelossa olevat 13 brittiläistä studioalbumia.",
  members: ["Please Please Me", "With the Beatles", "A Hard Day's Night", "Beatles for Sale", "Help!", "Rubber Soul", "Revolver", "Sgt. Pepper's Lonely Hearts Club Band", "The Beatles", "Yellow Submarine", "Abbey Road", "Let It Be", "Magical Mystery Tour"].map((name, index) => member(`beatles-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä The Beatlesin studioalbumi.", ids: Array.from({ length: 13 }, (_, index) => `beatles-${index + 1}`), tiers: { ten: ["beatles-8", "beatles-11"], fifteen: ["beatles-5", "beatles-7"], sixty: ["beatles-1", "beatles-2", "beatles-4"], eightyFive: ["beatles-9", "beatles-10"], hundred: ["beatles-13"] } },
    { id: "late", prompt: "Nimeä The Beatlesin vuoden 1967 tai sen jälkeen julkaistu studioalbumi.", ids: ["beatles-8", "beatles-9", "beatles-10", "beatles-11", "beatles-12", "beatles-13"], tiers: { ten: ["beatles-11"], fifteen: ["beatles-8"], sixty: ["beatles-9", "beatles-12"], eightyFive: ["beatles-10"], hundred: ["beatles-13"] }, familyId: "beatles" },
    { id: "early", prompt: "Nimeä The Beatlesin vuosina 1963–1965 julkaistu studioalbumi.", ids: ["beatles-1", "beatles-2", "beatles-3", "beatles-4", "beatles-5"], tiers: { ten: ["beatles-3"], fifteen: ["beatles-5"], sixty: ["beatles-1", "beatles-4"], eightyFive: ["beatles-2"], hundred: ["beatles-1"] }, familyId: "beatles" },
  ],
});

add({
  id: "music-abba-albums",
  category: "musiikki",
  description: "ABBAn studioalbumit.",
  asOf: "2026-01-01",
  source: sources.abba,
  membershipBasis: "ABBA:n virallisen discography-sivun yhdeksän studioalbumia.",
  members: ["Ring Ring", "Waterloo", "ABBA", "Arrival", "The Album", "Voulez-Vous", "Super Trouper", "The Visitors", "Voyage"].map((name, index) => member(`abba-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä ABBAn studioalbumi.", ids: Array.from({ length: 9 }, (_, index) => `abba-${index + 1}`), tiers: { ten: ["abba-4", "abba-6"], fifteen: ["abba-2", "abba-7"], sixty: ["abba-1", "abba-5"], eightyFive: ["abba-8"], hundred: ["abba-9"] } }],
});

add({
  id: "music-queen-albums",
  category: "musiikki",
  description: "Queen-yhtyeen studioalbumit.",
  asOf: "2026-01-01",
  source: sources.queen,
  membershipBasis: "Queenonline.comin virallisen discography-sivun 15 studioalbumia.",
  members: ["Queen", "Queen II", "Sheer Heart Attack", "A Night at the Opera", "A Day at the Races", "News of the World", "Jazz", "The Game", "Flash Gordon", "Hot Space", "The Works", "A Kind of Magic", "The Miracle", "Innuendo", "Made in Heaven"].map((name, index) => member(`queen-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä Queenin studioalbumi.", ids: Array.from({ length: 15 }, (_, index) => `queen-${index + 1}`), tiers: { ten: ["queen-4", "queen-6"], fifteen: ["queen-7", "queen-8"], sixty: ["queen-2", "queen-5", "queen-11"], eightyFive: ["queen-9", "queen-14"], hundred: ["queen-15"] } },
    { id: "seventies", prompt: "Nimeä Queenin 1970-luvulla julkaistu studioalbumi.", ids: ["queen-1", "queen-2", "queen-3", "queen-4", "queen-5", "queen-6", "queen-7"], tiers: { ten: ["queen-4"], fifteen: ["queen-6"], sixty: ["queen-1", "queen-3"], eightyFive: ["queen-5"], hundred: ["queen-7"] }, familyId: "queen" },
  ],
});

add({
  id: "music-metallica-albums",
  category: "musiikki",
  description: "Metallican studioalbumit.",
  asOf: "2026-01-01",
  source: sources.metallica,
  membershipBasis: "Metallican virallisessa albumiarkistossa olevat 11 studioalbumia.",
  members: ["Kill 'Em All", "Ride the Lightning", "Master of Puppets", "...And Justice for All", "Metallica", "Load", "Reload", "St. Anger", "Death Magnetic", "Hardwired...to Self-Destruct", "72 Seasons"].map((name, index) => member(`metallica-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Metallican studioalbumi.", ids: Array.from({ length: 11 }, (_, index) => `metallica-${index + 1}`), tiers: { ten: ["metallica-3", "metallica-5"], fifteen: ["metallica-2", "metallica-4"], sixty: ["metallica-1", "metallica-6"], eightyFive: ["metallica-8", "metallica-9"], hundred: ["metallica-11"] } }],
});

add({
  id: "music-grammy-album-of-year",
  category: "musiikki",
  description: "Grammy-palkinnon vuoden albumi -voittajia 2010-luvulta ja 2020-luvun alusta.",
  asOf: "2024-12-31",
  source: sources.grammy,
  membershipBasis: "Recording Academyn virallisesta award-arkistosta vuosien 2010–2024 Album of the Year -voittajat.",
  members: ["Fearless", "21", "Random Access Memories", "Morning Phase", "1989", "25", "Golden Hour", "When We All Fall Asleep, Where Do We Go?", "Folklore", "We Are", "Harry's House", "Midnights", "Taylor Swift's 1989 (Taylor's Version)", "Cowboy Carter", "Sour"].map((name, index) => member(`grammy-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Grammy-palkinnon Album of the Year -voittaja vuosilta 2010–2024.", ids: Array.from({ length: 15 }, (_, index) => `grammy-${index + 1}`), tiers: { ten: ["grammy-2", "grammy-5"], fifteen: ["grammy-1", "grammy-3"], sixty: ["grammy-4", "grammy-7", "grammy-10"], eightyFive: ["grammy-9", "grammy-11"], hundred: ["grammy-14"] } }],
});

add({
  id: "music-eurovision-winner-eras",
  category: "musiikki",
  description: "Eurovision laulukilpailun voittajamaita EBU:n historiassa.",
  asOf: "2025-12-31",
  source: source("European Broadcasting Union — Eurovision history", "https://eurovision.tv/history/year-by-year", "EBU's official year-by-year winner archive."),
  membershipBasis: "EBU:n kilpailuhistoriassa voittaneet maat vuosilta 1956–2025, rajattu tässä voittajamaihin vuosikymmenittäin.",
  members: ["Sveitsi", "Alankomaat", "Ranska", "Luxemburg", "Yhdistynyt kuningaskunta", "Espanja", "Israel", "Irlanti", "Ruotsi", "Monaco", "Norja", "Saksa", "Turkki", "Kreikka", "Suomi", "Serbia", "Venäjä", "Azerbaidžan", "Tanska", "Ukraina", "Portugali", "Itävalta", "Italia"].map((name, index) => member(`euro-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä Eurovision laulukilpailun voittajamaa.", ids: Array.from({ length: 23 }, (_, index) => `euro-${index + 1}`), tiers: { ten: ["euro-9", "euro-8", "euro-5"], fifteen: ["euro-3", "euro-13", "euro-15"], sixty: ["euro-1", "euro-10", "euro-16"], eightyFive: ["euro-4", "euro-18"], hundred: ["euro-10"] } },
    { id: "nordic-winners", prompt: "Nimeä Eurovision laulukilpailun voittanut Pohjoismaa.", ids: ["euro-8", "euro-9", "euro-11", "euro-15", "euro-19"], tiers: { ten: ["euro-9"], fifteen: ["euro-8", "euro-11"], sixty: ["euro-15"], eightyFive: ["euro-19"], hundred: ["euro-19"] }, familyId: "eurovision" },
  ],
});

add({
  id: "film-pixar-features",
  category: "elokuvat-ja-televisio",
  description: "Pixarin pitkät animaatioelokuvat.",
  asOf: "2025-12-31",
  source: sources.pixar,
  membershipBasis: "Pixar.comin virallisessa feature films -luettelossa olevat pitkät elokuvat vuoteen 2025 asti.",
  members: ["Toy Story", "A Bug's Life", "Toy Story 2", "Monsters, Inc.", "Finding Nemo", "The Incredibles", "Cars", "Ratatouille", "WALL-E", "Up", "Toy Story 3", "Brave", "Inside Out", "Coco", "Toy Story 4", "Onward", "Soul", "Luca", "Turning Red", "Lightyear", "Elemental", "Inside Out 2", "Elio", "Cars 2", "Cars 3"].map((name, index) => member(`pixar-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä Pixarin pitkä animaatioelokuva.", ids: Array.from({ length: 25 }, (_, index) => `pixar-${index + 1}`), tiers: { ten: ["pixar-1", "pixar-5", "pixar-13"], fifteen: ["pixar-4", "pixar-8", "pixar-14"], sixty: ["pixar-9", "pixar-16", "pixar-17"], eightyFive: ["pixar-18", "pixar-20"], hundred: ["pixar-23"] } },
    { id: "oscar-era", prompt: "Nimeä vuoden 2000 jälkeen julkaistu Pixarin pitkä animaatioelokuva.", ids: ["pixar-5", "pixar-6", "pixar-7", "pixar-8", "pixar-9", "pixar-10", "pixar-11", "pixar-12", "pixar-13", "pixar-14", "pixar-15", "pixar-16", "pixar-17", "pixar-18", "pixar-19", "pixar-20", "pixar-21", "pixar-22", "pixar-23", "pixar-24", "pixar-25"], tiers: { ten: ["pixar-9", "pixar-13"], fifteen: ["pixar-5", "pixar-14"], sixty: ["pixar-16", "pixar-17", "pixar-19"], eightyFive: ["pixar-20", "pixar-21"], hundred: ["pixar-23"] }, familyId: "pixar" },
  ],
});

add({
  id: "film-star-wars",
  category: "elokuvat-ja-televisio",
  description: "Star Wars -elokuvasaagan viralliset pitkät elokuvat.",
  asOf: "2024-12-31",
  source: sources.starWars,
  membershipBasis: "StarWars.comin virallisen films-luettelon kaksitoista pitkää elokuvaa.",
  members: ["A New Hope", "The Empire Strikes Back", "Return of the Jedi", "The Phantom Menace", "Attack of the Clones", "Revenge of the Sith", "The Force Awakens", "Rogue One", "The Last Jedi", "Solo", "The Rise of Skywalker", "The Clone Wars"].map((name, index) => member(`starwars-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Star Wars -elokuva.", ids: Array.from({ length: 12 }, (_, index) => `starwars-${index + 1}`), tiers: { ten: ["starwars-1", "starwars-2", "starwars-3"], fifteen: ["starwars-4", "starwars-6", "starwars-7"], sixty: ["starwars-8", "starwars-9"], eightyFive: ["starwars-10", "starwars-12"], hundred: ["starwars-11"] } }],
});

add({
  id: "film-harry-potter",
  category: "elokuvat-ja-televisio",
  description: "Harry Potter -elokuvat.",
  asOf: "2024-12-31",
  source: source("Warner Bros. — Harry Potter films", "https://www.wizardingworld.com/films", "The official Wizarding World film catalogue."),
  membershipBasis: "Wizarding Worldin virallisen films-luettelon kahdeksan Harry Potter -elokuvaa.",
  members: ["Viisasten kivi", "Salaisuuksien kammio", "Azkabanin vanki", "Liekehtivä pikari", "Feeniksin kilta", "Puoliverinen prinssi", "Kuoleman varjelukset – osa 1", "Kuoleman varjelukset – osa 2"].map((name, index) => member(`potter-film-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Harry Potter -elokuva.", ids: Array.from({ length: 8 }, (_, index) => `potter-film-${index + 1}`), tiers: { ten: ["potter-film-1", "potter-film-2"], fifteen: ["potter-film-4"], sixty: ["potter-film-3", "potter-film-5"], eightyFive: ["potter-film-6", "potter-film-7"], hundred: ["potter-film-8"] } }],
});

add({
  id: "film-best-picture-recent",
  category: "elokuvat-ja-televisio",
  description: "Academy Awardsin parhaan elokuvan voittajia vuosilta 2010–2024.",
  asOf: "2024-12-31",
  source: sources.oscars,
  membershipBasis: "Academyn virallisesta Oscar-arkistosta vuosien 2010–2024 Best Picture -voittajat.",
  members: ["The Hurt Locker", "The King's Speech", "The Artist", "Argo", "12 Years a Slave", "Birdman", "Spotlight", "Moonlight", "The Shape of Water", "Green Book", "Parasite", "Nomadland", "CODA", "Everything Everywhere All at Once", "Oppenheimer"].map((name, index) => member(`picture-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä parhaan elokuvan Oscar-voittaja vuosilta 2010–2024.", ids: Array.from({ length: 15 }, (_, index) => `picture-${index + 1}`), tiers: { ten: ["picture-4", "picture-5", "picture-15"], fifteen: ["picture-2", "picture-9"], sixty: ["picture-1", "picture-6", "picture-10"], eightyFive: ["picture-7", "picture-12"], hundred: ["picture-3"] } }],
});

add({
  id: "film-bond-films",
  category: "elokuvat-ja-televisio",
  description: "Eon Productionsin James Bond -elokuvat.",
  asOf: "2025-12-31",
  source: sources.bond,
  membershipBasis: "007.comin virallisen films-arkiston 25 Eon Bond -elokuvaa.",
  members: ["Dr. No", "From Russia with Love", "Goldfinger", "Thunderball", "You Only Live Twice", "On Her Majesty's Secret Service", "Diamonds Are Forever", "Live and Let Die", "The Man with the Golden Gun", "The Spy Who Loved Me", "Moonraker", "For Your Eyes Only", "Octopussy", "A View to a Kill", "The Living Daylights", "Licence to Kill", "GoldenEye", "Tomorrow Never Dies", "The World Is Not Enough", "Die Another Day", "Casino Royale", "Quantum of Solace", "Skyfall", "Spectre", "No Time to Die"].map((name, index) => member(`bond-film-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä James Bond -elokuva.", ids: Array.from({ length: 25 }, (_, index) => `bond-film-${index + 1}`), tiers: { ten: ["bond-film-3", "bond-film-17", "bond-film-21"], fifteen: ["bond-film-1", "bond-film-10", "bond-film-23"], sixty: ["bond-film-4", "bond-film-11", "bond-film-19"], eightyFive: ["bond-film-6", "bond-film-15"], hundred: ["bond-film-9"] } }],
});

add({
  id: "sport-summer-olympic-hosts",
  category: "urheilu",
  description: "Kesäolympialaisten isäntäkaupungit.",
  asOf: "2024-12-31",
  source: sources.ioc,
  membershipBasis: "IOC:n Olympic Games -historiassa kesäolympialaisten isäntinä toimineet kaupungit, rajattuna 15 eri kaupunkiin.",
  members: ["Ateena", "Pariisi", "St. Louis", "Lontoo", "Tukholma", "Antwerpen", "Amsterdam", "Los Angeles", "Berliini", "Helsinki", "Rooma", "Tokio", "Mexico City", "München", "Montreal", "Moskova", "Soul", "Barcelona", "Atlanta", "Sydney", "Peking", "Rio de Janeiro"].map((name, index) => member(`summer-host-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä kesäolympialaisten isäntäkaupunki.", ids: Array.from({ length: 22 }, (_, index) => `summer-host-${index + 1}`), tiers: { ten: ["summer-host-2", "summer-host-4", "summer-host-12"], fifteen: ["summer-host-1", "summer-host-8", "summer-host-18"], sixty: ["summer-host-6", "summer-host-13", "summer-host-20"], eightyFive: ["summer-host-10", "summer-host-16"], hundred: ["summer-host-3"] } },
  ],
});

add({
  id: "sport-winter-olympic-hosts",
  category: "urheilu",
  description: "Talviolympialaisten isäntäkaupungit.",
  asOf: "2026-02-28",
  source: sources.ioc,
  membershipBasis: "IOC:n historiassa talviolympialaisten isäntinä toimineet kaupungit, rajattuna ennen vuotta 2026 järjestettyihin 14 eri kaupunkiin.",
  members: ["Chamonix", "St. Moritz", "Lake Placid", "Garmisch-Partenkirchen", "Oslo", "Cortina d'Ampezzo", "Squaw Valley", "Innsbruck", "Sapporo", "Sarajevo", "Calgary", "Albertville", "Lillehammer", "Nagano", "Salt Lake City", "Torino", "Vancouver", "Sotši", "Pyeongchang", "Peking", "Milano–Cortina"].map((name, index) => member(`winter-host-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä talviolympialaisten isäntäkaupunki.", ids: Array.from({ length: 21 }, (_, index) => `winter-host-${index + 1}`), tiers: { ten: ["winter-host-2", "winter-host-5", "winter-host-9"], fifteen: ["winter-host-8", "winter-host-13", "winter-host-17"], sixty: ["winter-host-3", "winter-host-10", "winter-host-14"], eightyFive: ["winter-host-6", "winter-host-12"], hundred: ["winter-host-1"] } }],
});

add({
  id: "sport-f1-world-champions",
  category: "urheilu",
  description: "Formula 1 -kuljettajien maailmanmestarit.",
  asOf: "2024-12-31",
  source: sources.formula1,
  membershipBasis: "Formula1.comin tulosarkistosta maailmanmestaruuden voittaneet kuljettajat, rajattuna 20 tunnettuun mestariin.",
  members: ["Giuseppe Farina", "Juan Manuel Fangio", "Alberto Ascari", "Mike Hawthorn", "Jack Brabham", "Graham Hill", "Jackie Stewart", "Emerson Fittipaldi", "Niki Lauda", "James Hunt", "Nelson Piquet", "Ayrton Senna", "Alain Prost", "Nigel Mansell", "Michael Schumacher", "Fernando Alonso", "Kimi Räikkönen", "Lewis Hamilton", "Jenson Button", "Sebastian Vettel", "Max Verstappen"].map((name, index) => member(`f1-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä Formula 1 -kuljettajien maailmanmestari.", ids: Array.from({ length: 21 }, (_, index) => `f1-${index + 1}`), tiers: { ten: ["f1-12", "f1-15", "f1-18", "f1-21"], fifteen: ["f1-9", "f1-13", "f1-20"], sixty: ["f1-2", "f1-7", "f1-11"], eightyFive: ["f1-1", "f1-4"], hundred: ["f1-6"] } },
    { id: "modern", prompt: "Nimeä Formula 1 -kuljettaja, joka voitti maailmanmestaruuden vuoden 2000 jälkeen.", ids: ["f1-15", "f1-16", "f1-17", "f1-18", "f1-19", "f1-20", "f1-21"], tiers: { ten: ["f1-15", "f1-18", "f1-21"], fifteen: ["f1-16", "f1-20"], sixty: ["f1-17", "f1-19"], eightyFive: ["f1-18"], hundred: ["f1-16"] }, familyId: "f1-champions" },
  ],
});

add({
  id: "sport-nhl-teams",
  category: "urheilu",
  description: "National Hockey Leaguen joukkueet.",
  asOf: "2026-01-01",
  source: sources.nhl,
  membershipBasis: "NHL:n virallisella joukkuesivulla nimetyt 32 nykyistä joukkuetta.",
  members: ["Anaheim Ducks", "Arizona Coyotes", "Boston Bruins", "Buffalo Sabres", "Calgary Flames", "Carolina Hurricanes", "Chicago Blackhawks", "Colorado Avalanche", "Columbus Blue Jackets", "Dallas Stars", "Detroit Red Wings", "Edmonton Oilers", "Florida Panthers", "Los Angeles Kings", "Minnesota Wild", "Montréal Canadiens", "Nashville Predators", "New Jersey Devils", "New York Islanders", "New York Rangers", "Ottawa Senators", "Philadelphia Flyers", "Pittsburgh Penguins", "San Jose Sharks", "Seattle Kraken", "St. Louis Blues", "Tampa Bay Lightning", "Toronto Maple Leafs", "Vancouver Canucks", "Vegas Golden Knights", "Washington Capitals", "Winnipeg Jets"].map((name, index) => member(`nhl-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä NHL-joukkue.", ids: Array.from({ length: 32 }, (_, index) => `nhl-${index + 1}`), tiers: { ten: ["nhl-3", "nhl-7", "nhl-20", "nhl-28"], fifteen: ["nhl-8", "nhl-12", "nhl-23"], sixty: ["nhl-2", "nhl-5", "nhl-15"], eightyFive: ["nhl-9", "nhl-25"], hundred: ["nhl-22"] } },
    { id: "canadian", prompt: "Nimeä kanadalainen NHL-joukkue.", ids: ["nhl-5", "nhl-11", "nhl-16", "nhl-21", "nhl-28", "nhl-29", "nhl-32"], tiers: { ten: ["nhl-28"], fifteen: ["nhl-16", "nhl-29"], sixty: ["nhl-5", "nhl-11"], eightyFive: ["nhl-21"], hundred: ["nhl-32"] }, familyId: "nhl" },
    { id: "original-six", prompt: "Nimeä NHL:n Original Six -joukkue.", ids: ["nhl-3", "nhl-7", "nhl-11", "nhl-16", "nhl-20", "nhl-28"], tiers: { ten: ["nhl-3", "nhl-20"], fifteen: ["nhl-7", "nhl-28"], sixty: ["nhl-11"], eightyFive: ["nhl-16"], hundred: ["nhl-16"] }, familyId: "nhl" },
  ],
});

add({
  id: "sport-champions-league-winners",
  category: "urheilu",
  description: "Euroopan Cupin tai UEFA Champions Leaguen voittaneet jalkapalloseurat.",
  asOf: "2025-06-01",
  source: sources.uefa,
  membershipBasis: "UEFA:n kilpailuhistoriassa Euroopan Cupin tai Champions Leaguen voittaneet seurat, rajattuna 20 tunnettuun moninkertaiseen tai historialliseen voittajaan.",
  members: ["Real Madrid", "Milan", "Liverpool", "Bayern München", "Barcelona", "Ajax", "Manchester United", "Inter", "Juventus", "Benfica", "Nottingham Forest", "Porto", "Chelsea", "Borussia Dortmund", "Manchester City", "Celtic", "Feyenoord", "Aston Villa", "Marseille", "PSV Eindhoven"].map((name, index) => member(`ucl-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Euroopan Cupin tai Champions Leaguen voittanut jalkapalloseura.", ids: Array.from({ length: 20 }, (_, index) => `ucl-${index + 1}`), tiers: { ten: ["ucl-1", "ucl-3", "ucl-4", "ucl-5"], fifteen: ["ucl-7", "ucl-8", "ucl-13"], sixty: ["ucl-6", "ucl-9", "ucl-10"], eightyFive: ["ucl-11", "ucl-16"], hundred: ["ucl-18"] } }],
});

add({
  id: "sport-grand-slam-tournaments",
  category: "urheilu",
  description: "Tenniksen Grand Slam -turnaukset.",
  asOf: "2026-01-01",
  source: sources.itf,
  membershipBasis: "ITF:n neljä virallista Grand Slam -turnausta; miesten ja naisten kilpailut käsitellään samoina turnausbrändeina.",
  members: ["Australian Open", "Ranskan avoimet", "Wimbledon", "US Open", "Australian Openin kaksinpeli", "Ranskan avointen kaksinpeli", "Wimbledonin kaksinpeli", "US Openin kaksinpeli"].map((name, index) => member(`slam-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä tenniksen Grand Slam -turnaus.", ids: ["slam-1", "slam-2", "slam-3", "slam-4", "slam-5", "slam-6", "slam-7", "slam-8"], tiers: { ten: ["slam-1", "slam-3"], fifteen: ["slam-2", "slam-4"], sixty: ["slam-5", "slam-7"], eightyFive: ["slam-6"], hundred: ["slam-8"] } }],
});

add({
  id: "sport-ice-hockey-world-champions",
  category: "urheilu",
  description: "Miesten jääkiekon maailmanmestaruuden voittaneita maita.",
  asOf: "2025-05-25",
  source: source("IIHF — World Championship", "https://www.iihf.com/en/events/2025/wm", "The International Ice Hockey Federation's official World Championship archive."),
  membershipBasis: "IIHF:n miesten MM-historiassa mestaruuden voittaneet maat, rajattuna kahdeksaan yleissivistyksellisesti keskeiseen voittajaan.",
  members: ["Kanada", "Neuvostoliitto", "Venäjä", "Ruotsi", "Tšekkoslovakia", "Tšekki", "Suomi", "Yhdysvallat", "Slovakia"].map((name, index) => member(`hockey-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä miesten jääkiekon maailmanmestaruuden voittanut maa.", ids: Array.from({ length: 9 }, (_, index) => `hockey-${index + 1}`), tiers: { ten: ["hockey-1", "hockey-4", "hockey-7"], fifteen: ["hockey-3", "hockey-8"], sixty: ["hockey-5", "hockey-6"], eightyFive: ["hockey-9"], hundred: ["hockey-2"] } }],
});

add({
  id: "tech-iphone-generations",
  category: "teknologia",
  description: "Applen iPhone-mallit ja sukupolvet.",
  asOf: "2025-12-31",
  source: sources.apple,
  membershipBasis: "Applen virallisessa iPhone-mallien tunnistusarkistossa nimetyt malliperheet, rajattuna 18 yleisesti tunnistettavaan sukupolveen.",
  members: ["iPhone", "iPhone 3G", "iPhone 3GS", "iPhone 4", "iPhone 5", "iPhone 6", "iPhone 6s", "iPhone 7", "iPhone 8", "iPhone X", "iPhone XR", "iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16", "iPhone 17"].map((name, index) => member(`iphone-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä iPhone-malli tai -sukupolvi.", ids: Array.from({ length: 18 }, (_, index) => `iphone-${index + 1}`), tiers: { ten: ["iphone-1", "iphone-4", "iphone-10", "iphone-12"], fifteen: ["iphone-5", "iphone-8", "iphone-13"], sixty: ["iphone-3", "iphone-7", "iphone-11"], eightyFive: ["iphone-17", "iphone-18"], hundred: ["iphone-2"] } },
    { id: "pre-x", prompt: "Nimeä iPhone-malli, joka julkaistiin ennen iPhone X:ää.", ids: ["iphone-1", "iphone-2", "iphone-3", "iphone-4", "iphone-5", "iphone-6", "iphone-7", "iphone-8", "iphone-9"], tiers: { ten: ["iphone-4", "iphone-5"], fifteen: ["iphone-1", "iphone-8"], sixty: ["iphone-2", "iphone-3"], eightyFive: ["iphone-6", "iphone-7"], hundred: ["iphone-9"] }, familyId: "iphone" },
    { id: "modern", prompt: "Nimeä iPhone-malli, joka kuuluu iPhone 12:ta uudempaan sukupolveen.", ids: ["iphone-13", "iphone-14", "iphone-15", "iphone-16", "iphone-17", "iphone-18"], tiers: { ten: ["iphone-13", "iphone-15"], fifteen: ["iphone-14"], sixty: ["iphone-16"], eightyFive: ["iphone-17"], hundred: ["iphone-18"] }, familyId: "iphone" },
  ],
});

add({
  id: "tech-playstation-consoles",
  category: "teknologia",
  description: "PlayStationin kotikonsolisukupolvet.",
  asOf: "2025-12-31",
  source: sources.playstation,
  membershipBasis: "PlayStationin virallisen konsolihistorian kuusi kotikonsolisukupolvea.",
  members: ["PlayStation", "PlayStation 2", "PlayStation 3", "PlayStation 4", "PlayStation 5", "PlayStation Vita"].map((name, index) => member(`ps-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä PlayStation-konsoli.", ids: ["ps-1", "ps-2", "ps-3", "ps-4", "ps-5", "ps-6"], tiers: { ten: ["ps-1", "ps-2", "ps-4"], fifteen: ["ps-5"], sixty: ["ps-3"], eightyFive: ["ps-6"], hundred: ["ps-6"] } }],
});

add({
  id: "tech-nintendo-home-consoles",
  category: "teknologia",
  description: "Nintendon kotikonsolit.",
  asOf: "2025-12-31",
  source: sources.nintendo,
  membershipBasis: "Nintendon virallisesta historiasta rajatut kotikäyttöön tarkoitetut konsolit.",
  members: ["Nintendo Entertainment System", "Super Nintendo", "Nintendo 64", "Nintendo GameCube", "Wii", "Wii U", "Nintendo Switch", "Nintendo Switch 2", "Color TV-Game", "Family Computer"].map((name, index) => member(`nintendo-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Nintendon kotikonsoli.", ids: Array.from({ length: 10 }, (_, index) => `nintendo-${index + 1}`), tiers: { ten: ["nintendo-1", "nintendo-5", "nintendo-7"], fifteen: ["nintendo-2", "nintendo-3"], sixty: ["nintendo-4", "nintendo-6"], eightyFive: ["nintendo-9", "nintendo-10"], hundred: ["nintendo-8"] } }],
});

add({
  id: "tech-windows-releases",
  category: "teknologia",
  description: "Microsoft Windowsin tunnetut työpöytäversiot.",
  asOf: "2025-12-31",
  source: sources.microsoft,
  membershipBasis: "Microsoftin Windows-historiassa nimetyt keskeiset työpöytäversiot, rajattuna 12 yleisesti tunnistettavaan julkaisuun.",
  members: ["Windows 1.0", "Windows 3.1", "Windows 95", "Windows 98", "Windows 2000", "Windows XP", "Windows Vista", "Windows 7", "Windows 8", "Windows 8.1", "Windows 10", "Windows 11"].map((name, index) => member(`windows-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Microsoft Windowsin työpöytäversio.", ids: Array.from({ length: 12 }, (_, index) => `windows-${index + 1}`), tiers: { ten: ["windows-3", "windows-6", "windows-8", "windows-11"], fifteen: ["windows-4", "windows-12"], sixty: ["windows-2", "windows-5", "windows-9"], eightyFive: ["windows-1", "windows-7"], hundred: ["windows-10"] } }],
});

add({
  id: "tech-nasa-missions",
  category: "teknologia",
  description: "NASA:n yleisesti tunnettuja avaruusluotaimia ja -observatorioita.",
  asOf: "2025-12-31",
  source: sources.nasa,
  membershipBasis: "NASA:n virallisista mission-sivuista rajattu 12 yleissivistyksellisesti tunnettua avaruusluotainta tai -observatoriota.",
  members: ["Voyager 1", "Voyager 2", "Hubble-avaruusteleskooppi", "James Webb -avaruusteleskooppi", "Cassini", "Juno", "New Horizons", "Galileo", "Rosetta", "Parker Solar Probe", "Mars Reconnaissance Orbiter", "Curiosity"].map((name, index) => member(`mission-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä NASA:n avaruusluotain tai -observatorio.", ids: Array.from({ length: 12 }, (_, index) => `mission-${index + 1}`), tiers: { ten: ["mission-1", "mission-3", "mission-4"], fifteen: ["mission-2", "mission-5", "mission-12"], sixty: ["mission-6", "mission-7", "mission-11"], eightyFive: ["mission-8", "mission-9"], hundred: ["mission-10"] } }],
});

add({
  id: "economics-nobel-recent",
  category: "talous",
  description: "Taloustieteen Nobel-palkinnon saajia vuosilta 2010–2024.",
  asOf: "2024-12-31",
  source: sources.nobel,
  membershipBasis: "Nobel Prize -arkiston taloustieteen laureaatit vuosilta 2010–2024; yhteispalkinnon kaikki nimetyt henkilöt ovat mukana tässä rajatussa joukossa.",
  members: ["Peter Diamond", "Dale Mortensen", "Christopher Pissarides", "Thomas Sargent", "Christopher Sims", "Lloyd Shapley", "Alvin Roth", "Eugene Fama", "Lars Peter Hansen", "Robert Shiller", "Jean Tirole", "Angus Deaton", "Oliver Hart", "Bengt Holmström", "Richard Thaler", "William Nordhaus", "Paul Romer", "Abhijit Banerjee", "Esther Duflo", "Michael Kremer", "Robert Wilson", "Paul Milgrom", "David Card", "Joshua Angrist", "Guido Imbens", "Ben Bernanke", "Douglas Diamond", "Philip Dybvig", "Claudia Goldin", "Daron Acemoglu", "Simon Johnson", "James Robinson"].map((name, index) => member(`econ-nobel-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä taloustieteen Nobel-palkinnon saaja vuosilta 2010–2024.", ids: Array.from({ length: 32 }, (_, index) => `econ-nobel-${index + 1}`), tiers: { ten: ["econ-nobel-8", "econ-nobel-11", "econ-nobel-15", "econ-nobel-23"], fifteen: ["econ-nobel-14", "econ-nobel-16", "econ-nobel-30"], sixty: ["econ-nobel-2", "econ-nobel-5", "econ-nobel-18"], eightyFive: ["econ-nobel-1", "econ-nobel-26"], hundred: ["econ-nobel-32"] } }],
});

add({
  id: "economics-stock-indices",
  category: "talous",
  description: "Tunnetut kansalliset ja kansainväliset osakeindeksit.",
  asOf: "2026-01-01",
  source: source("S&P Dow Jones Indices — Index education", "https://www.spglobal.com/spdji/en/education/", "S&P Dow Jones Indices' official index education reference."),
  membershipBasis: "Indeksitoimialan vakiintuneet kansainväliset osakeindeksit, rajattuna kymmeneen suomalaiselle yleispelaajalle tunnistettavaan nimeen.",
  members: ["S&P 500", "Dow Jones Industrial Average", "Nasdaq Composite", "DAX", "FTSE 100", "CAC 40", "Nikkei 225", "Hang Seng", "OMX Helsinki 25", "Euro Stoxx 50"].map((name, index) => member(`index-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä osakeindeksi.", ids: Array.from({ length: 10 }, (_, index) => `index-${index + 1}`), tiers: { ten: ["index-1", "index-2", "index-3"], fifteen: ["index-4", "index-9"], sixty: ["index-5", "index-6", "index-10"], eightyFive: ["index-8"], hundred: ["index-7"] } }],
});

add({
  id: "food-finnish-protected-names",
  category: "ruoka-ja-kulttuuri",
  description: "Suomen ja Ahvenanmaan EU:n suojaamat elintarvikkeiden nimet.",
  asOf: "2026-01-01",
  source: sources.euGi,
  membershipBasis: "Euroopan komission maantieteellisten merkintöjen rekisterissä Suomen tai Ahvenanmaan yhteyteen rekisteröidyt nimet, rajattuna tässä 12 tunnettuun tuotteeseen.",
  members: ["Karjalanpiirakka", "Kalakukko", "Karelian pasty", "Lapin puikula", "Lapin poron liha", "Kitkan viisas", "Puruveden muikku", "Kainuun rönttönen", "Sahti", "Suonenjoen mansikka", "Savolainen kalakukko", "Ålandspannkaka"].map((name, index) => member(`food-fi-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä EU:n suojaama suomalainen tai ahvenanmaalainen elintarvikkeen nimi.", ids: Array.from({ length: 12 }, (_, index) => `food-fi-${index + 1}`), tiers: { ten: ["food-fi-1", "food-fi-2"], fifteen: ["food-fi-3", "food-fi-9"], sixty: ["food-fi-4", "food-fi-5", "food-fi-6"], eightyFive: ["food-fi-7", "food-fi-8"], hundred: ["food-fi-12"] } }],
});

add({
  id: "food-unesco-traditions",
  category: "ruoka-ja-kulttuuri",
  description: "UNESCO:n aineettoman kulttuuriperinnön luettelon ruokaan liittyviä perinteitä.",
  asOf: "2025-12-31",
  source: sources.unescoCulture,
  membershipBasis: "UNESCO:n Representative List -luettelossa nimenomaisesti ruoka-, juoma- tai ruokaperinnöksi nimetyt kansainvälisesti tunnetut kokonaisuudet.",
  members: ["ranskalainen gastronominen ateria", "meksikolainen perinteinen keittiö", "Välimeren ruokavalio", "washoku", "napolilainen pizzaiolo-taide", "kimjang", "kuskusin valmistus", "arabialainen kahvi", "cebu-luson riisiterassit", "harissa"].map((name, index) => member(`food-unesco-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä UNESCO:n aineettomaan kulttuuriperintöön kuuluva ruokaperinne.", ids: Array.from({ length: 10 }, (_, index) => `food-unesco-${index + 1}`), tiers: { ten: ["food-unesco-1", "food-unesco-3", "food-unesco-4"], fifteen: ["food-unesco-5", "food-unesco-6"], sixty: ["food-unesco-2", "food-unesco-7"], eightyFive: ["food-unesco-8", "food-unesco-9"], hundred: ["food-unesco-10"] } }],
});

add({
  id: "food-protected-cheeses",
  category: "ruoka-ja-kulttuuri",
  description: "EU:n suojattuja juustoja.",
  asOf: "2026-01-01",
  source: sources.euGi,
  membershipBasis: "EU:n viralliseen maantieteellisten merkintöjen rekisteriin kuuluvia tunnettuja juustonimiä, rajattuna tähän 14 nimen joukkoon.",
  members: ["Parmigiano Reggiano", "Gorgonzola", "Roquefort", "Feta", "Gruyère", "Comté", "Brie de Meaux", "Camembert de Normandie", "Manchego", "Stilton", "Emmental de Savoie", "Mozzarella di Bufala Campana", "Ossau-Iraty", "Queso Manchego"].map((name, index) => member(`cheese-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä EU:n suojaama juusto.", ids: Array.from({ length: 14 }, (_, index) => `cheese-${index + 1}`), tiers: { ten: ["cheese-1", "cheese-2", "cheese-4"], fifteen: ["cheese-3", "cheese-5", "cheese-9"], sixty: ["cheese-6", "cheese-10", "cheese-12"], eightyFive: ["cheese-7", "cheese-11"], hundred: ["cheese-13"] } }],
});

add({
  id: "world-currencies",
  category: "maailma",
  description: "ISO 4217 -standardissa tunnettuja maailman valuuttoja.",
  asOf: "2026-01-01",
  source: source("ISO — Currency codes", "https://www.iso.org/iso-4217-currency-codes.html", "ISO's official currency-code standard overview."),
  membershipBasis: "ISO 4217 -valuuttastandardin tunnettuja kansallisia valuuttoja, rajattuna 15 yleissivistyksessä keskeiseen valuuttaan.",
  members: ["euro", "Yhdysvaltain dollari", "Englannin punta", "Japanin jeni", "Ruotsin kruunu", "Norjan kruunu", "Tanskan kruunu", "Sveitsin frangi", "Kanadan dollari", "Australian dollari", "Intian rupia", "Kiinan yuan", "Venäjän rupla", "Brasilian real", "Etelä-Afrikan randi"].map((name, index) => member(`currency-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä maailman valuutta.", ids: Array.from({ length: 15 }, (_, index) => `currency-${index + 1}`), tiers: { ten: ["currency-1", "currency-2", "currency-3"], fifteen: ["currency-4", "currency-8", "currency-12"], sixty: ["currency-5", "currency-6", "currency-10"], eightyFive: ["currency-11", "currency-13"], hundred: ["currency-15"] } }],
});

add({
  id: "world-new-seven-wonders",
  category: "maailma",
  description: "Vuoden 2007 New7Wonders-äänestyksen uudet seitsemän ihmettä.",
  asOf: "2007-07-07",
  source: source("New7Wonders — New Seven Wonders", "https://world.new7wonders.com/", "The organisation's published seven-wonders result."),
  membershipBasis: "New7Wonders-järjestön 7.7.2007 julkaisemassa seitsemän kohteen tulosluettelossa nimetyt kohteet.",
  members: ["Chichén Itzá", "Cristo Redentor", "Colosseum", "Kiinan muuri", "Machu Picchu", "Petra", "Taj Mahal"].map((name, index) => member(`wonder-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä New7Wondersin uusi maailmanihme.", ids: ["wonder-1", "wonder-2", "wonder-3", "wonder-4", "wonder-5", "wonder-6", "wonder-7"], tiers: { ten: ["wonder-3", "wonder-4", "wonder-5"], fifteen: ["wonder-6", "wonder-7"], sixty: ["wonder-1", "wonder-2"], eightyFive: ["wonder-6"], hundred: ["wonder-1"] } }],
});

add({
  id: "world-time-zones",
  category: "maailma",
  description: "UTC-aikavyöhykkeiden yleiset kokonaislukupoikkeamat.",
  asOf: "2026-01-01",
  source: source("IANA — Time Zone Database", "https://www.iana.org/time-zones", "The IANA time-zone database is the primary technical reference for civil time zones."),
  membershipBasis: "IANA:n aikavyöhyketiedon perusteella pelattava joukko kokonaislukuisia UTC-poikkeamia −12:sta +14:ään.",
  members: ["UTC−12", "UTC−11", "UTC−10", "UTC−9", "UTC−8", "UTC−7", "UTC−6", "UTC−5", "UTC−4", "UTC−3", "UTC−2", "UTC−1", "UTC±0", "UTC+1", "UTC+2", "UTC+3", "UTC+4", "UTC+5", "UTC+6", "UTC+7", "UTC+8", "UTC+9", "UTC+10", "UTC+11", "UTC+12", "UTC+13", "UTC+14"].map((name, index) => member(`utc-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä UTC-aikavyöhyke kokonaislukuisella poikkeamalla.", ids: Array.from({ length: 27 }, (_, index) => `utc-${index + 1}`), tiers: { ten: ["utc-13", "utc-14", "utc-15"], fifteen: ["utc-12", "utc-16", "utc-17"], sixty: ["utc-3", "utc-9", "utc-23"], eightyFive: ["utc-1", "utc-27"], hundred: ["utc-26"] } }],
});

add({
  id: "world-continents-by-ocean",
  category: "maailma",
  description: "Maanosat, joihin yleissivistyksessä liitetään nimetyt valtamerialueet.",
  asOf: "2026-01-01",
  source: source("NOAA Ocean Service — Oceans", "https://oceanservice.noaa.gov/facts/oceanwater.html", "NOAA's official five-ocean reference."),
  membershipBasis: "NOAA:n viiteen valtamereen liittyvät maanosat, rajattuna seitsemän maanosan nimettyyn joukkoon.",
  members: ["Afrikka", "Aasia", "Eurooppa", "Pohjois-Amerikka", "Etelä-Amerikka", "Oseania", "Etelämanner"].map((name, index) => member(`world-continent-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä NOAA:n valtamerijaotteluun liittyvä maanosa.", ids: Array.from({ length: 7 }, (_, index) => `world-continent-${index + 1}`), tiers: { ten: ["world-continent-2", "world-continent-4"], fifteen: ["world-continent-1"], sixty: ["world-continent-5"], eightyFive: ["world-continent-6"], hundred: ["world-continent-7"] } }],
});

function slug(value: string): string {
  return value
    .toLocaleLowerCase("fi-FI")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

function addNamedSet(args: {
  id: string;
  category: string;
  description: string;
  prompt: string;
  names: string[];
  source: SourceRecord;
  basis: string;
  ten: string[];
  fifteen: string[];
  sixty: string[];
  eightyFive: string[];
  hundred: string[];
  asOf?: string;
  familyId?: string;
}) {
  const ids = args.names.map((name, index) => `${args.id}-${slug(name)}-${index + 1}`);
  const idsFor = (names: string[]) => names.map((name) => `${args.id}-${slug(name)}-${args.names.indexOf(name) + 1}`);
  add({
    id: args.id,
    category: args.category,
    description: args.description,
    asOf: args.asOf ?? "2026-01-01",
    source: args.source,
    membershipBasis: args.basis,
    members: args.names.map((name, index) => member(ids[index], name)),
    variants: [{ id: "all", prompt: args.prompt, ids, familyId: args.familyId, tiers: { ten: idsFor(args.ten), fifteen: idsFor(args.fifteen), sixty: idsFor(args.sixty), eightyFive: idsFor(args.eightyFive), hundred: idsFor(args.hundred) } }],
  });
}

const internationalBasis = (label: string) => `Jäsenyys perustuu nimetyn kansainvälisen järjestön viralliseen nykyiseen jäsenluetteloon: ${label}.`;

addNamedSet({ id: "society-asean", category: "yhteiskunta", description: "ASEANin jäsenvaltiot.", prompt: "Nimeä ASEANin jäsenvaltio.", names: ["Brunei", "Kambodža", "Indonesia", "Laos", "Malesia", "Myanmar", "Filippiinit", "Singapore", "Thaimaa", "Vietnam"], source: source("ASEAN — Member States", "https://asean.org/member-states/", "ASEAN's official member-state list."), basis: internationalBasis("ASEAN"), ten: ["Indonesia", "Singapore"], fifteen: ["Thaimaa", "Filippiinit"], sixty: ["Malesia", "Vietnam"], eightyFive: ["Laos", "Kambodža"], hundred: ["Brunei"] });
addNamedSet({ id: "society-mercosur", category: "yhteiskunta", description: "Mercosurin täysjäsenet.", prompt: "Nimeä Mercosurin jäsenvaltio.", names: ["Argentiina", "Brasilia", "Paraguay", "Uruguay", "Bolivia", "Venezuela"], source: source("Mercosur — Member States", "https://www.mercosur.int/en/about-mercosur/mercosur-countries/", "Mercosur's official country information."), basis: internationalBasis("Mercosur"), ten: ["Brasilia", "Argentiina"], fifteen: ["Uruguay"], sixty: ["Paraguay"], eightyFive: ["Bolivia"], hundred: ["Venezuela"] });
addNamedSet({ id: "society-gulf-cooperation", category: "yhteiskunta", description: "Persianlahden yhteistyöneuvoston jäsenet.", prompt: "Nimeä Persianlahden yhteistyöneuvoston jäsenvaltio.", names: ["Bahrain", "Kuwait", "Oman", "Qatar", "Saudi-Arabia", "Yhdistyneet arabiemiirikunnat"], source: source("GCC — Member States", "https://gcc-sg.org/en-us/AboutGCC/MemberStates/Pages/default.aspx", "The Gulf Cooperation Council's official member list."), basis: internationalBasis("Persianlahden yhteistyöneuvosto"), ten: ["Saudi-Arabia", "Qatar"], fifteen: ["Oman"], sixty: ["Kuwait"], eightyFive: ["Bahrain"], hundred: ["Yhdistyneet arabiemiirikunnat"] });
addNamedSet({ id: "society-baltic-sea-council", category: "yhteiskunta", description: "Itämeren valtioiden neuvoston jäsenet.", prompt: "Nimeä Itämeren valtioiden neuvoston jäsenvaltio.", names: ["Saksa", "Tanska", "Viro", "Suomi", "Islanti", "Latvia", "Liettua", "Norja", "Puola", "Ruotsi"], source: source("Council of the Baltic Sea States", "https://cbss.org/about-us/member-states/", "The CBSS official member-state information."), basis: internationalBasis("Itämeren valtioiden neuvosto"), ten: ["Saksa", "Ruotsi", "Suomi"], fifteen: ["Tanska", "Puola"], sixty: ["Viro", "Norja"], eightyFive: ["Latvia", "Liettua"], hundred: ["Islanti"] });
addNamedSet({ id: "world-brics", category: "maailma", description: "BRICS-yhteistyön täysjäsenet laajentumisen jälkeen.", prompt: "Nimeä BRICS-maaryhmän jäsenvaltio.", names: ["Brasilia", "Venäjä", "Intia", "Kiina", "Etelä-Afrikka", "Egypti", "Etiopia", "Iran", "Yhdistyneet arabiemiirikunnat", "Indonesia"], source: source("BRICS — About BRICS", "https://brics.br/en/about-brics", "The official Brazilian BRICS presidency member information."), basis: internationalBasis("BRICS"), ten: ["Kiina", "Intia", "Brasilia"], fifteen: ["Venäjä", "Etelä-Afrikka"], sixty: ["Egypti", "Indonesia"], eightyFive: ["Etiopia", "Iran"], hundred: ["Yhdistyneet arabiemiirikunnat"] });
addNamedSet({ id: "world-caribbean-community", category: "maailma", description: "Karibian yhteisön jäsenvaltiot.", prompt: "Nimeä CARICOMin jäsenvaltio.", names: ["Antigua ja Barbuda", "Bahama", "Barbados", "Belize", "Dominica", "Grenada", "Guyana", "Haiti", "Jamaika", "Montserrat", "Saint Kitts ja Nevis", "Saint Lucia", "Saint Vincent ja Grenadiinit", "Suriname", "Trinidad ja Tobago"], source: source("CARICOM — Member States", "https://caricom.org/member-states/", "CARICOM's official member-state list."), basis: internationalBasis("CARICOM"), ten: ["Jamaika", "Bahama", "Guyana"], fifteen: ["Barbados", "Haiti"], sixty: ["Suriname", "Belize"], eightyFive: ["Dominica", "Grenada"], hundred: ["Montserrat"] });
addNamedSet({ id: "world-pacific-islands-forum", category: "maailma", description: "Tyynenmeren saarten foorumin jäsenet.", prompt: "Nimeä Tyynenmeren saarten foorumin jäsen.", names: ["Australia", "Cookinsaaret", "Fidži", "Kiribati", "Marshallinsaaret", "Mikronesia", "Nauru", "Uusi-Seelanti", "Niue", "Palau", "Papua-Uusi-Guinea", "Samoa", "Salomonsaaret", "Tonga", "Tuvalu", "Vanuatu"], source: source("Pacific Islands Forum — Members", "https://forumsec.org/who-we-are/", "The Pacific Islands Forum's official member information."), basis: internationalBasis("Tyynenmeren saarten foorumi"), ten: ["Australia", "Uusi-Seelanti"], fifteen: ["Fidži", "Papua-Uusi-Guinea"], sixty: ["Samoa", "Tonga"], eightyFive: ["Palau", "Vanuatu"], hundred: ["Niue"] });
addNamedSet({ id: "world-eea-countries", category: "maailma", description: "Euroopan talousalueen valtiot.", prompt: "Nimeä Euroopan talousalueeseen kuuluva valtio.", names: ["Islanti", "Liechtenstein", "Norja", "Belgia", "Bulgaria", "Tšekki", "Tanska", "Saksa", "Viro", "Irlanti", "Kreikka", "Espanja", "Ranska", "Kroatia", "Italia", "Kypros", "Latvia", "Liettua", "Luxemburg", "Unkari", "Malta", "Alankomaat", "Itävalta", "Puola", "Portugali", "Romania", "Slovenia", "Slovakia", "Suomi", "Ruotsi"], source: source("European Commission — European Economic Area", "https://www.efta.int/eea", "The EFTA and EU official EEA member information."), basis: internationalBasis("Euroopan talousalue"), ten: ["Suomi", "Saksa", "Ruotsi", "Ranska"], fifteen: ["Norja", "Espanja", "Italia"], sixty: ["Islanti", "Puola", "Irlanti"], eightyFive: ["Liechtenstein", "Kypros"], hundred: ["Liechtenstein"] });

const geographyBasis = (label: string) => `Jäsenyys perustuu maantieteelliseen, lähteessä kuvattuun rajaukseen: ${label}.`;
addNamedSet({ id: "geo-mediterranean-coasts", category: "maantiede", description: "Välimeren rannikkovaltiot.", prompt: "Nimeä Välimeren rannikkovaltio.", names: ["Espanja", "Ranska", "Monaco", "Italia", "Slovenia", "Kroatia", "Bosnia ja Hertsegovina", "Montenegro", "Albania", "Kreikka", "Turkki", "Kypros", "Syyria", "Libanon", "Israel", "Palestiina", "Egypti", "Libya", "Tunisia", "Algeria", "Marokko", "Malta"], source: source("Britannica — Mediterranean Sea", "https://www.britannica.com/place/Mediterranean-Sea", "Britannica's geographic reference for Mediterranean coastal states."), basis: geographyBasis("valtiot, joilla on rantaviiva Välimeren merialueella"), ten: ["Espanja", "Italia", "Ranska", "Kreikka"], fifteen: ["Turkki", "Egypti", "Kroatia"], sixty: ["Algeria", "Tunisia", "Marokko"], eightyFive: ["Libanon", "Montenegro"], hundred: ["Bosnia ja Hertsegovina"] });
addNamedSet({ id: "geo-red-sea-coasts", category: "maantiede", description: "Punaisenmeren rannikkovaltiot.", prompt: "Nimeä Punaisenmeren rannikkovaltio.", names: ["Egypti", "Sudan", "Eritrea", "Djibouti", "Jemen", "Saudi-Arabia", "Jordania", "Israel"], source: source("Encyclopaedia Britannica — Red Sea", "https://www.britannica.com/place/Red-Sea", "Britannica's geographic reference for Red Sea coasts."), basis: geographyBasis("suora rantaviiva Punaisellemerelle"), ten: ["Egypti", "Saudi-Arabia"], fifteen: ["Israel", "Jemen"], sixty: ["Sudan"], eightyFive: ["Eritrea"], hundred: ["Jordania"] });
addNamedSet({ id: "geo-persian-gulf-coasts", category: "maantiede", description: "Persianlahden rannikkovaltiot.", prompt: "Nimeä Persianlahden rannikkovaltio.", names: ["Iran", "Irak", "Kuwait", "Saudi-Arabia", "Bahrain", "Qatar", "Yhdistyneet arabiemiirikunnat", "Oman"], source: source("Encyclopaedia Britannica — Persian Gulf", "https://www.britannica.com/place/Persian-Gulf", "Britannica's geographic reference for Persian Gulf coasts."), basis: geographyBasis("suora rantaviiva Persianlahdelle"), ten: ["Iran", "Saudi-Arabia"], fifteen: ["Qatar", "Oman"], sixty: ["Kuwait", "Irak"], eightyFive: ["Bahrain"], hundred: ["Yhdistyneet arabiemiirikunnat"] });
addNamedSet({ id: "geo-equator-countries", category: "maantiede", description: "Päiväntasaajan ylittämät valtiot.", prompt: "Nimeä valtio, jonka alueen päiväntasaaja ylittää.", names: ["Ecuador", "Kolumbia", "Brasilia", "São Tomé ja Príncipe", "Gabon", "Kongon tasavalta", "Kongon demokraattinen tasavalta", "Uganda", "Kenia", "Somalia", "Indonesia", "Kiribati", "Malediivit"], source: source("National Geographic — Equator", "https://education.nationalgeographic.org/resource/equator/", "National Geographic's equator reference."), basis: geographyBasis("päiväntasaajan kulkeminen valtion maa- tai saaristoalueen kautta"), ten: ["Ecuador", "Brasilia", "Kenia"], fifteen: ["Indonesia", "Uganda"], sixty: ["Kolumbia", "Somalia"], eightyFive: ["Gabon", "Kongon tasavalta"], hundred: ["Malediivit"] });
addNamedSet({ id: "geo-tropic-of-cancer", category: "maantiede", description: "Kräävän kääntöpiirin ylittämät valtiot.", prompt: "Nimeä Kravun kääntöpiirin ylittämä valtio.", names: ["Meksiko", "Bahama", "Länsi-Sahara", "Mauritania", "Mali", "Algeria", "Niger", "Libya", "Egypti", "Saudi-Arabia", "Yhdistyneet arabiemiirikunnat", "Oman", "Intia", "Bangladesh", "Myanmar", "Taiwan", "Kiina"], source: source("National Geographic — Tropic of Cancer", "https://education.nationalgeographic.org/resource/tropic-cancer/", "National Geographic's geographic reference."), basis: geographyBasis("Kravun kääntöpiirin maantieteellinen leikkaus"), ten: ["Meksiko", "Egypti", "Intia"], fifteen: ["Kiina", "Saudi-Arabia"], sixty: ["Algeria", "Oman"], eightyFive: ["Bahama", "Taiwan"], hundred: ["Länsi-Sahara"] });
addNamedSet({ id: "geo-alpine-countries", category: "maantiede", description: "Alppien valtiot.", prompt: "Nimeä Alppeihin kuuluva valtio.", names: ["Ranska", "Monaco", "Italia", "Sveitsi", "Liechtenstein", "Saksa", "Itävalta", "Slovenia"], source: source("Alpine Convention — The Alps", "https://www.alpconv.org/en/home/", "The Alpine Convention's official Alpine-region information."), basis: geographyBasis("Alppien vuoristoalueen valtiojäsenyys"), ten: ["Sveitsi", "Itävalta"], fifteen: ["Italia", "Ranska"], sixty: ["Saksa", "Slovenia"], eightyFive: ["Liechtenstein"], hundred: ["Monaco"] });
addNamedSet({ id: "geo-danube-basin", category: "maantiede", description: "Tonavaan liittyvän jokialueen valtiot.", prompt: "Nimeä Tonavaan kuuluva valtio.", names: ["Saksa", "Itävalta", "Slovakia", "Unkari", "Kroatia", "Serbia", "Romania", "Bulgaria", "Moldova", "Ukraina", "Tšekki", "Slovenia", "Bosnia ja Hertsegovina", "Montenegro", "Sveitsi", "Italia", "Puola", "Albania", "Kosovo"], source: source("International Commission for the Hydrology of the Rhine Basin — Danube", "https://www.icpdr.org/", "The International Commission for the Protection of the Danube River's basin reference."), basis: geographyBasis("Tonavan valuma-alueen tai hydrologisen järjestelmän valtiojäsenyys"), ten: ["Saksa", "Itävalta", "Unkari", "Romania"], fifteen: ["Serbia", "Bulgaria", "Ukraina"], sixty: ["Slovakia", "Kroatia"], eightyFive: ["Moldova", "Montenegro"], hundred: ["Albania"] });

addNamedSet({ id: "nature-finnish-national-symbols", category: "luonto", description: "Suomen luonnon kansallissymboleita.", prompt: "Nimeä Suomen luonnon kansallissymboli.", names: ["kielo", "rauduskoivu", "laulujoutsen", "karhu", "päivänperhonen", "ahven", "metsäkuusi", "mustikka", "hietakastikka", "suomenhevonen"], source: sources.symbols, basis: "Suomi.fi:n kansallissymbolisivun luonnon symbolit, rajattuna kasveihin, eläimiin ja luonnontuotteisiin.", ten: ["karhu", "laulujoutsen"], fifteen: ["kielo", "rauduskoivu"], sixty: ["ahven", "mustikka"], eightyFive: ["hietakastikka", "suomenhevonen"], hundred: ["päivänperhonen"] });
addNamedSet({ id: "nature-biomes", category: "luonto", description: "Maapallon suuret biomit.", prompt: "Nimeä maapallon biomi.", names: ["trooppinen sademetsä", "savanni", "aavikko", "välimerenkasvillisuus", "lauhkea lehtimetsä", "boreaalinen havumetsä", "tundra", "jäätikkö", "aro", "mangrovemetsä"], source: source("National Geographic — Biome", "https://education.nationalgeographic.org/resource/biome/", "National Geographic's biome reference."), basis: "National Geographicin biomien opetuksellinen jaottelu, rajattuna kymmeneen nimettyyn kokonaisuuteen.", ten: ["aavikko", "trooppinen sademetsä"], fifteen: ["savanni", "tundra"], sixty: ["boreaalinen havumetsä", "lauhkea lehtimetsä"], eightyFive: ["aro", "mangrovemetsä"], hundred: ["jäätikkö"] });
addNamedSet({ id: "nature-ocean-zones", category: "luonto", description: "Meren syvyysvyöhykkeet.", prompt: "Nimeä meren syvyysvyöhyke.", names: ["epipelagiaalinen vyöhyke", "mesopelagiaalinen vyöhyke", "batypelagiaalinen vyöhyke", "abyssopelagiaalinen vyöhyke", "hadopelagiaalinen vyöhyke", "pohjaeliöstö"], source: source("NOAA Ocean Service — Ocean zones", "https://oceanservice.noaa.gov/facts/oceanlayers.html", "NOAA's official ocean-layer reference."), basis: "NOAA:n opetussivun merivyöhykkeet ja niihin liittyvä pohjavyöhyke.", ten: ["epipelagiaalinen vyöhyke"], fifteen: ["mesopelagiaalinen vyöhyke"], sixty: ["batypelagiaalinen vyöhyke"], eightyFive: ["abyssopelagiaalinen vyöhyke"], hundred: ["hadopelagiaalinen vyöhyke"] });
addNamedSet({ id: "nature-tree-types", category: "luonto", description: "Pohjoisen pallonpuoliskon tunnettuja puulajeja.", prompt: "Nimeä puulaji.", names: ["koivu", "mänty", "kuusi", "tammi", "vaahtera", "lehmus", "saarni", "haapa", "pihlaja", "leppä", "pyökki", "jalava"], source: source("Finnish Natural History Museum — Trees", "https://www.luomus.fi/en", "The Finnish Natural History Museum's botanical reference."), basis: "Kasvitieteellisesti vakiintunut 12 puulajin yleissivistysjoukko.", ten: ["koivu", "mänty", "kuusi"], fifteen: ["tammi", "vaahtera"], sixty: ["lehmus", "haapa", "pihlaja"], eightyFive: ["saarni", "pyökki"], hundred: ["jalava"] });

addNamedSet({ id: "literature-pulitzer-fiction", category: "kirjallisuus", description: "Pulitzer Prize for Fiction -voittajia 2010-luvulta ja 2020-luvun alusta.", prompt: "Nimeä Pulitzerin kaunokirjallisuuspalkinnon voittaja.", names: ["Jennifer Egan", "Paul Harding", "Adam Johnson", "Donna Tartt", "Anthony Doerr", "Viet Thanh Nguyen", "Colson Whitehead", "Andrew Sean Greer", "Richard Powers", "Jayne Anne Phillips", "Louise Erdrich", "Joshua Ferris", "Barbara Kingsolver", "Hernan Diaz", "Paul Lynch"], source: source("Pulitzer Prizes — Fiction", "https://www.pulitzer.org/prize-winners-by-category/224", "The Pulitzer Prizes' official fiction archive."), basis: "Pulitzerin virallisesta kategoriatietokannasta rajattu vuosien 2010–2024 voittajajoukko.", ten: ["Colson Whitehead", "Donna Tartt"], fifteen: ["Anthony Doerr", "Viet Thanh Nguyen"], sixty: ["Jennifer Egan", "Louise Erdrich"], eightyFive: ["Hernan Diaz", "Richard Powers"], hundred: ["Joshua Ferris"] });
addNamedSet({ id: "literature-hugo-novel", category: "kirjallisuus", description: "Hugo-palkinnon parhaan romaanin voittajia.", prompt: "Nimeä Hugo-palkinnon parhaan romaanin voittaja.", names: ["The City in the Middle of the Night", "The Calculating Stars", "The Stone Sky", "The Obelisk Gate", "The Fifth Season", "Ancillary Justice", "The Three-Body Problem", "Among Others", "Blackout/All Clear", "The Windup Girl", "The Yiddish Policemen's Union", "Rainbows End"].map((name) => name), source: source("The Hugo Awards — Best Novel", "https://www.thehugoawards.org/hugo-history/", "The official Hugo Awards history."), basis: "Hugo Awards -historian romaanikategorian nimetyt voittajat, rajattuna 12 tunnettuun teokseen 2000-luvulta.", ten: ["The Fifth Season", "The Three-Body Problem"], fifteen: ["Ancillary Justice", "The Stone Sky"], sixty: ["The Windup Girl", "The Yiddish Policemen's Union"], eightyFive: ["Among Others", "Rainbows End"], hundred: ["The City in the Middle of the Night"] });

addNamedSet({ id: "art-nobel-architecture", category: "taide", description: "Tunnettujen nykyarkkitehtuurin palkintojen saajia.", prompt: "Nimeä kansainvälisen arkkitehtuuripalkinnon saaja.", names: ["Zaha Hadid", "Frank Gehry", "Norman Foster", "Tadao Ando", "Rem Koolhaas", "Peter Zumthor", "Jean Nouvel", "Kazuyo Sejima", "Renzo Piano", "Álvaro Siza", "Glenn Murcutt", "Sverre Fehn"], source: source("The Pritzker Architecture Prize — Laureates", "https://www.pritzkerprize.com/laureates", "The official Pritzker Prize laureate archive."), basis: "Pritzker Prize -arkistossa esiintyvät kansainvälisesti tunnetut laureaatit, rajattuna 12 nimeen.", ten: ["Frank Gehry", "Zaha Hadid", "Norman Foster"], fifteen: ["Tadao Ando", "Renzo Piano"], sixty: ["Rem Koolhaas", "Jean Nouvel"], eightyFive: ["Sverre Fehn", "Glenn Murcutt"], hundred: ["Álvaro Siza"] });
addNamedSet({ id: "art-photography-genres", category: "taide", description: "Valokuvataiteen keskeisiä lajityyppejä.", prompt: "Nimeä valokuvataiteen lajityyppi.", names: ["muotokuvaus", "katukuvaus", "maisemakuvaus", "luontokuvaus", "dokumentaarinen valokuvaus", "muotikuvaus", "arkkitehtuurikuvaus", "makrokuvaus", "still life -kuvaus", "konseptuaalinen valokuvaus"], source: source("Tate — Photography terms", "https://www.tate.org.uk/art/art-terms/p/photography", "Tate's photography reference."), basis: "Taten valokuvausta käsittelevän sanaston vakiintuneet lajityypit.", ten: ["muotokuvaus", "maisemakuvaus"], fifteen: ["katukuvaus", "luontokuvaus"], sixty: ["dokumentaarinen valokuvaus", "muotikuvaus"], eightyFive: ["makrokuvaus", "still life -kuvaus"], hundred: ["konseptuaalinen valokuvaus"] });

addNamedSet({ id: "film-animated-oscar-winners", category: "elokuvat-ja-televisio", description: "Parhaan animaatioelokuvan Oscar-voittajia.", prompt: "Nimeä parhaan animaatioelokuvan Oscar-voittaja.", names: ["Toy Story 3", "Rango", "Brave", "Frozen", "Big Hero 6", "Inside Out", "Zootopia", "Spider-Man: Into the Spider-Verse", "Toy Story 4", "Soul", "Guillermo del Toro's Pinocchio", "The Boy and the Heron"], source: sources.oscars, basis: "Academyn virallisesta animaatioelokuvakategoriasta rajatut vuosien 2010–2023 voittajat.", ten: ["Frozen", "Toy Story 3", "Inside Out"], fifteen: ["Brave", "Zootopia"], sixty: ["Rango", "Soul"], eightyFive: ["The Boy and the Heron", "Guillermo del Toro's Pinocchio"], hundred: ["Big Hero 6"] });
addNamedSet({ id: "film-cannes-palme", category: "elokuvat-ja-televisio", description: "Cannesin elokuvajuhlien Kultaisen palmun voittajia.", prompt: "Nimeä Kultaisen palmun voittanut elokuva.", names: ["Pulp Fiction", "The Pianist", "The Tree of Life", "Amour", "Blue Is the Warmest Colour", "Winter Sleep", "Parasite", "Shoplifters", "The Square", "Triangle of Sadness", "The Wind That Shakes the Barley", "The Class"], source: source("Festival de Cannes — Palme d'or", "https://www.festival-cannes.com/en/the-palme-d-or/", "Cannes' official Palme d'or archive."), basis: "Cannesin virallisesta Kultaisen palmun arkistosta rajattu 12 tunnettua voittajaelokuvaa.", ten: ["Pulp Fiction", "Parasite"], fifteen: ["The Pianist", "Amour"], sixty: ["The Square", "Shoplifters"], eightyFive: ["The Class", "Winter Sleep"], hundred: ["The Wind That Shakes the Barley"] });

addNamedSet({ id: "tech-android-releases", category: "teknologia", description: "Androidin tunnetut pääjulkaisut.", prompt: "Nimeä Androidin pääjulkaisu.", names: ["Cupcake", "Donut", "Eclair", "Froyo", "Gingerbread", "Honeycomb", "Ice Cream Sandwich", "Jelly Bean", "KitKat", "Lollipop", "Marshmallow", "Nougat", "Oreo", "Pie", "Android 10", "Android 11", "Android 12", "Android 13", "Android 14", "Android 15"], source: source("Android Developers — Platform versions", "https://developer.android.com/about/versions", "Google's official Android version archive."), basis: "Android Developersin virallinen platform versions -historia, rajattuna pääjulkaisuihin.", ten: ["KitKat", "Lollipop", "Android 10", "Android 12"], fifteen: ["Gingerbread", "Jelly Bean", "Android 11"], sixty: ["Froyo", "Marshmallow", "Android 14"], eightyFive: ["Honeycomb", "Pie"], hundred: ["Donut"] });
addNamedSet({ id: "tech-web-browsers", category: "teknologia", description: "Tunnettuja verkkoselaimia.", prompt: "Nimeä verkkoselain.", names: ["Google Chrome", "Mozilla Firefox", "Safari", "Microsoft Edge", "Opera", "Brave", "Vivaldi", "Internet Explorer", "Netscape Navigator", "Tor Browser"], source: source("World Wide Web Consortium — Web browsers", "https://www.w3.org/", "W3C's web-platform reference; browser names are bounded to this named historical set."), basis: "Verkkoselainten yleisesti tunnettu historiallinen ja nykyinen 10 selaimen joukko, rajaus kirjattu toimituksellisesti.", ten: ["Google Chrome", "Mozilla Firefox", "Safari"], fifteen: ["Microsoft Edge", "Internet Explorer"], sixty: ["Opera", "Brave"], eightyFive: ["Vivaldi", "Tor Browser"], hundred: ["Netscape Navigator"] });

addNamedSet({ id: "economics-reserve-currencies", category: "talous", description: "Kansainvälisen valuuttarahaston SDR-korin valuutat.", prompt: "Nimeä IMF:n SDR-koriin kuuluva valuutta.", names: ["Yhdysvaltain dollari", "euro", "Kiinan yuan", "Japanin jeni", "Englannin punta"], source: source("IMF — Special Drawing Rights", "https://www.imf.org/en/About/Factsheets/Sheets/2023/07/27/special-drawing-rights-sdr", "The IMF's official SDR basket reference."), basis: "IMF:n SDR-korin viisi valuuttaa.", ten: ["Yhdysvaltain dollari", "euro"], fifteen: ["Englannin punta"], sixty: ["Japanin jeni"], eightyFive: ["Kiinan yuan"], hundred: ["Japanin jeni"] });
addNamedSet({ id: "economics-economic-sectors", category: "talous", description: "Talouden tuotantosektorit.", prompt: "Nimeä talouden sektori.", names: ["alkutuotanto", "jalostus", "palvelut", "julkinen sektori", "rahoitussektori", "tietosektori"], source: source("Statistics Finland — Economic classifications", "https://stat.fi/en/services/statistical-data-services/classifications", "Statistics Finland's classification reference."), basis: "Taloustieteen ja tilastollisten luokitusten vakiintuneet sektorikäsitteet, rajattuna kuuteen pelattavaan sektoriin.", ten: ["palvelut", "jalostus"], fifteen: ["alkutuotanto"], sixty: ["rahoitussektori"], eightyFive: ["julkinen sektori"], hundred: ["tietosektori"] });

addNamedSet({ id: "food-coffee-preparations", category: "ruoka-ja-kulttuuri", description: "Kahvin valmistusmenetelmiä.", prompt: "Nimeä kahvin valmistusmenetelmä.", names: ["suodatinkahvi", "espresso", "pressopannu", "moka-pannu", "Aeropress", "cold brew", "pour over", "turkkilainen kahvi", "pannukahvi", "sifonikahvi"], source: source("Specialty Coffee Association — Brewing", "https://sca.coffee/research/protocols-best-practices", "SCA's official coffee-brewing reference."), basis: "Specialty Coffee Associationin valmistusmenetelmiin liittyvät vakiintuneet nimitykset, rajattuna kymmeneen.", ten: ["espresso", "suodatinkahvi", "pressopannu"], fifteen: ["pannukahvi", "moka-pannu"], sixty: ["Aeropress", "cold brew"], eightyFive: ["pour over", "turkkilainen kahvi"], hundred: ["sifonikahvi"] });
addNamedSet({ id: "food-unesco-crafts", category: "ruoka-ja-kulttuuri", description: "UNESCO:n aineettoman kulttuuriperinnön ruoka- ja käsityöperinteitä.", prompt: "Nimeä UNESCO:n aineettomaan kulttuuriperintöön kuuluva ruokaan liittyvä perinne.", names: ["lavash-leivän valmistus", "arabialainen kahvi", "kimjang", "kuskusin valmistus", "napolilainen pizzaiolo-taide", "washoku", "meksikolainen keittiö", "ranskalainen gastronominen ateria", "Välimeren ruokavalio", "harissa"], source: sources.unescoCulture, basis: "UNESCO:n Representative List -luettelossa nimetyt ruoka- ja juomaperinteet.", ten: ["arabialainen kahvi", "washoku", "meksikolainen keittiö"], fifteen: ["kimjang", "Välimeren ruokavalio"], sixty: ["kuskusin valmistus", "napolilainen pizzaiolo-taide"], eightyFive: ["lavash-leivän valmistus", "ranskalainen gastronominen ateria"], hundred: ["harissa"] });

addNamedSet({ id: "fi-large-lakes", category: "suomi", description: "Suomen suuria ja tunnettuja järviä.", prompt: "Nimeä suomalainen järvi.", names: ["Saimaa", "Päijänne", "Inarijärvi", "Pielinen", "Oulujärvi", "Höytiäinen", "Längelmävesi", "Näsijärvi", "Kallavesi", "Vanajavesi"], source: source("Finnish Environment Institute — Lakes", "https://www.vesi.fi/en/water-information/lakes/", "The Finnish Environment Institute's lake information."), basis: "Suomen ympäristökeskuksen suurjärviä ja tunnettuja järvialueita koskeva rajattu kymmenen kohteen joukko.", ten: ["Saimaa", "Päijänne"], fifteen: ["Inarijärvi", "Näsijärvi"], sixty: ["Pielinen", "Oulujärvi"], eightyFive: ["Höytiäinen", "Vanajavesi"], hundred: ["Längelmävesi"] });
addNamedSet({ id: "fi-cities", category: "suomi", description: "Suomen suurimpia kaupunkeja.", prompt: "Nimeä suomalainen kaupunki.", names: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä", "Kuopio", "Lahti", "Pori", "Kouvola", "Joensuu"], source: sources.statsMunicipalities, basis: "Tilastokeskuksen kuntaluokituksesta rajattu Suomen väkiluvultaan suurimpien kaupunkien yleissivistysjoukko.", ten: ["Helsinki", "Tampere", "Turku"], fifteen: ["Espoo", "Vantaa", "Oulu"], sixty: ["Jyväskylä", "Kuopio"], eightyFive: ["Kouvola", "Joensuu"], hundred: ["Pori"] });
addNamedSet({ id: "fi-museums", category: "suomi", description: "Suomen valtakunnallisia ja tunnettuja museoita.", prompt: "Nimeä suomalainen museo.", names: ["Ateneum", "Kiasma", "Sinebrychoffin taidemuseo", "Suomen kansallismuseo", "Amos Rex", "Heureka", "Mannerheim-museo", "Vapriikki", "Turun linna", "Designmuseo"], source: source("Museovirasto — Museums", "https://www.museovirasto.fi/en/museums", "The Finnish Heritage Agency's museum information."), basis: "Museoviraston museo- ja kokoelmainformaatiossa nimetyt suomalaiset museokohteet, rajattuna kymmeneen.", ten: ["Ateneum", "Kiasma", "Heureka"], fifteen: ["Suomen kansallismuseo", "Amos Rex"], sixty: ["Vapriikki", "Designmuseo"], eightyFive: ["Mannerheim-museo", "Sinebrychoffin taidemuseo"], hundred: ["Turun linna"] });

addNamedSet({ id: "history-finland-treaties", category: "suomen-historia", description: "Suomen historian keskeisiä rauhan- ja valtiosopimuksia.", prompt: "Nimeä Suomen historiaan liittyvä rauhan- tai valtiosopimus.", names: ["Uudenkaupungin rauha", "Turun rauha", "Haminan rauha", "Tarton rauha", "Moskovan rauha", "Pariisin rauhansopimus", "YYA-sopimus", "Rooman sopimus", "EU:n liittymissopimus", "Ahvenanmaan sopimus"], source: source("Ministry for Foreign Affairs of Finland — Treaties", "https://um.fi/treaties", "The Ministry for Foreign Affairs' official treaty information."), basis: "Ulkoministeriön sopimustietoon ja Suomen historian virallisiin keskeisiin valtiosopimuksiin perustuva rajattu joukko.", ten: ["Haminan rauha", "Tarton rauha"], fifteen: ["Moskovan rauha", "Pariisin rauhansopimus"], sixty: ["Uudenkaupungin rauha", "YYA-sopimus"], eightyFive: ["Turun rauha", "Ahvenanmaan sopimus"], hundred: ["Rooman sopimus"] });
addNamedSet({ id: "history-finnish-historical-centres", category: "suomen-historia", description: "Suomen historian keskeisiä hallinnollisia keskuksia.", prompt: "Nimeä Suomen historian hallinnollinen keskus.", names: ["Turku", "Helsinki", "Viipuri", "Porvoo", "Hämeenlinna", "Vaasa", "Oulu", "Kuopio"], source: source("National Archives of Finland — History", "https://kansallisarkisto.fi/en/", "The National Archives' historical reference."), basis: "Suomen hallinnon ja historian vakiintuneet keskukset, rajaus kirjattu kahdeksaan nimettyyn kaupunkiin.", ten: ["Helsinki", "Turku"], fifteen: ["Viipuri", "Oulu"], sixty: ["Porvoo", "Vaasa"], eightyFive: ["Hämeenlinna"], hundred: ["Kuopio"] });
addNamedSet({ id: "history-finland-milestones", category: "suomen-historia", description: "Suomen valtiollisen historian merkkivuosia.", prompt: "Nimeä Suomen historian merkkivuosi.", names: ["1809", "1863", "1906", "1917", "1918", "1939", "1944", "1952", "1995", "2000", "2002", "2023"], source: source("National Archives of Finland — Finnish history", "https://kansallisarkisto.fi/en/", "The National Archives' historical reference."), basis: "Suomen valtiollisesta historiasta johdettu nimetty vuosilukujen kokonaisuus; jokainen vuosi liittyy lähteen historialliseen päätapahtumaan.", ten: ["1917", "1939", "1952"], fifteen: ["1906", "1995"], sixty: ["1809", "1918"], eightyFive: ["1863", "1944"], hundred: ["2002"] });

addNamedSet({ id: "language-finnish-moods", category: "suomen-kieli", description: "Suomen kielen verbin tapaluokat.", prompt: "Nimeä suomen kielen tapaluokka.", names: ["indikatiivi", "konditionaali", "potentiaali", "imperatiivi", "passiivin tapaluokka", "aktiivin tapaluokka"], source: source("Kotus — Verb forms", "https://kielitoimistonohjepankki.fi/", "Kotus grammar guidance."), basis: "Kotus-ohjeiston suomen kielen verbien tapaluokat ja niiden opetuksessa käytetty jaottelu.", ten: ["indikatiivi"], fifteen: ["konditionaali"], sixty: ["imperatiivi"], eightyFive: ["potentiaali"], hundred: ["passiivin tapaluokka"] });
addNamedSet({ id: "language-parts-of-speech", category: "suomen-kieli", description: "Suomen kielen sanaluokat.", prompt: "Nimeä suomen kielen sanaluokka.", names: ["substantiivi", "adjektiivi", "verbi", "pronomini", "numeraali", "adverbi", "prepositio", "postpositio", "konjunktio", "interjektio"], source: source("Kotus — Parts of speech", "https://kielitoimistonohjepankki.fi/", "Kotus grammar guidance."), basis: "Kotus-ohjeiston suomen kielen sanaluokkia käsittelevä vakiintunut kymmenen luokan opetuskokonaisuus.", ten: ["substantiivi", "verbi"], fifteen: ["adjektiivi", "pronomini"], sixty: ["adverbi", "konjunktio"], eightyFive: ["prepositio", "postpositio"], hundred: ["interjektio"] });
addNamedSet({ id: "language-uralic-families", category: "suomen-kieli", description: "Uralilaisten kielten ryhmiä ja kieliä.", prompt: "Nimeä uralilainen kieli tai kieliryhmä.", names: ["suomi", "viro", "unkari", "saame", "karjala", "mari", "udmurtti", "komi", "nenetsi", "hanti", "mansi", "selkuppi"], source: source("University of Helsinki — Uralic languages", "https://www.helsinki.fi/en/research-stations/languages", "University of Helsinki linguistic research reference."), basis: "Uralilaisten kielten tunnettu kielitieteellinen ryhmä, rajattuna kahteentoista yleissivistykselliseen nimeen.", ten: ["suomi", "unkari", "viro"], fifteen: ["saame", "karjala"], sixty: ["mari", "udmurtti"], eightyFive: ["hanti", "mansi"], hundred: ["selkuppi"] });
addNamedSet({ id: "language-writing-systems", category: "suomen-kieli", description: "Maailman kirjoitusjärjestelmiä.", prompt: "Nimeä kirjoitusjärjestelmä.", names: ["latinalainen kirjaimisto", "kreikkalainen kirjaimisto", "kyrillinen kirjaimisto", "arabialainen kirjaimisto", "heprealainen kirjaimisto", "devanagari", "han-merkit", "hiragana", "katakana", "hangul"], source: source("Unicode Consortium — Writing systems", "https://home.unicode.org/", "Unicode's official writing-system standard reference."), basis: "Unicode-standardissa käsiteltävät yleiset kirjoitusjärjestelmät, rajattuna kymmeneen.", ten: ["latinalainen kirjaimisto", "kyrillinen kirjaimisto", "han-merkit"], fifteen: ["arabialainen kirjaimisto", "kreikkalainen kirjaimisto"], sixty: ["heprealainen kirjaimisto", "devanagari"], eightyFive: ["hiragana", "hangul"], hundred: ["katakana"] });

addNamedSet({ id: "art-sculptors", category: "taide", description: "Kuvanveiston kansainvälisesti tunnettuja tekijöitä.", prompt: "Nimeä kuvanveistäjä.", names: ["Michelangelo", "Auguste Rodin", "Henry Moore", "Constantin Brâncuși", "Alberto Giacometti", "Louise Bourgeois", "Barbara Hepworth", "Anish Kapoor", "Pablo Picasso", "Donatello", "Claes Oldenburg", "Antony Gormley"], source: source("Tate — Sculpture", "https://www.tate.org.uk/art/art-terms/s/sculpture", "Tate's sculpture reference."), basis: "Taten kuvanveistoa käsittelevässä yleisesityksessä esiintyviä kansainvälisesti tunnettuja kuvanveistäjiä, rajattuna kahteentoista.", ten: ["Michelangelo", "Auguste Rodin", "Pablo Picasso"], fifteen: ["Henry Moore", "Donatello"], sixty: ["Louise Bourgeois", "Anish Kapoor"], eightyFive: ["Barbara Hepworth", "Claes Oldenburg"], hundred: ["Antony Gormley"] });
addNamedSet({ id: "art-artistic-techniques", category: "taide", description: "Kuvataiteen tekniikoita.", prompt: "Nimeä kuvataiteen tekniikka.", names: ["öljymaalaus", "akvarelli", "akryylimaalaus", "fresko", "grafiikka", "litografia", "puupiirros", "etsaus", "pastelli", "mosaiikki"], source: source("Tate — Art terms", "https://www.tate.org.uk/art/art-terms", "Tate's official art-terms glossary."), basis: "Taten taidetermien sanastossa käsitellyt kuvataiteen tekniikat, rajattuna kymmeneen.", ten: ["öljymaalaus", "akvarelli"], fifteen: ["akryylimaalaus", "fresko"], sixty: ["grafiikka", "litografia"], eightyFive: ["puupiirros", "etsaus"], hundred: ["mosaiikki"] });
addNamedSet({ id: "art-museum-masterpieces", category: "taide", description: "Tunnettuja taidemuseoiden teoksia.", prompt: "Nimeä kuuluisa taideteos.", names: ["Mona Lisa", "Viimeinen ehtoollinen", "Auringonkukat", "Tähtikirkas yö", "Huuto", "Guernica", "Tyttö ja helmikorvakoru", "Suutaripoika", "Amerikkalainen gootti", "Impression, auringonnousu"], source: source("Louvre — Collections", "https://www.louvre.fr/en/explore/the-palace/from-the-mona-lisa-to-the-wedding-feast-at-cana", "The Louvre's official collection highlights."), basis: "Louvren ja muiden kansallisten taidemuseoiden yleisesittelyissä nimetyt yleisesti tunnistettavat taideteokset.", ten: ["Mona Lisa", "Huuto", "Tähtikirkas yö"], fifteen: ["Auringonkukat", "Guernica"], sixty: ["Viimeinen ehtoollinen", "Tyttö ja helmikorvakoru"], eightyFive: ["Suutaripoika", "Amerikkalainen gootti"], hundred: ["Impression, auringonnousu"] });

addNamedSet({ id: "music-jazz-standards", category: "musiikki", description: "Jazzin tunnettuja sävellyksiä ja standardeja.", prompt: "Nimeä jazzin tunnettu sävellys.", names: ["Take Five", "So What", "My Favorite Things", "Round Midnight", "Sing, Sing, Sing", "A Love Supreme", "Giant Steps", "Blue in Green", "All Blues", "Body and Soul", "In a Sentimental Mood", "Strange Fruit"], source: source("Smithsonian — Jazz", "https://americanhistory.si.edu/smithsonian-jazz", "The Smithsonian's official jazz history reference."), basis: "Smithsonianin jazz-historiassa ja äänitearkistossa esiintyvä 12 sävellyksen yleissivistysjoukko.", ten: ["Take Five", "So What", "My Favorite Things"], fifteen: ["Round Midnight", "Strange Fruit"], sixty: ["A Love Supreme", "Giant Steps"], eightyFive: ["Blue in Green", "In a Sentimental Mood"], hundred: ["All Blues"] });
addNamedSet({ id: "music-classical-composers", category: "musiikki", description: "Klassisen musiikin säveltäjiä.", prompt: "Nimeä klassisen musiikin säveltäjä.", names: ["Johann Sebastian Bach", "Wolfgang Amadeus Mozart", "Ludwig van Beethoven", "Frédéric Chopin", "Antonio Vivaldi", "Joseph Haydn", "Pyotr Tchaikovsky", "Johannes Brahms", "Richard Wagner", "Claude Debussy", "Jean Sibelius", "Igor Stravinsky"], source: source("Encyclopaedia Britannica — Classical music", "https://www.britannica.com/art/classical-music", "Britannica's classical-music reference."), basis: "Klassisen musiikin historian vakiintunut 12 säveltäjän yleissivistysjoukko.", ten: ["Wolfgang Amadeus Mozart", "Ludwig van Beethoven", "Johann Sebastian Bach"], fifteen: ["Frédéric Chopin", "Antonio Vivaldi"], sixty: ["Joseph Haydn", "Johannes Brahms"], eightyFive: ["Claude Debussy", "Igor Stravinsky"], hundred: ["Jean Sibelius"] });
addNamedSet({ id: "music-finnish-classical", category: "musiikki", description: "Suomalaisia klassisen musiikin säveltäjiä.", prompt: "Nimeä suomalainen säveltäjä.", names: ["Jean Sibelius", "Oskar Merikanto", "Leevi Madetoja", "Toivo Kuula", "Kaija Saariaho", "Einojuhani Rautavaara", "Aulis Sallinen", "Kalevi Aho", "Joonas Kokkonen", "Uuno Klami"], source: source("Music Finland — Classical music", "https://musicfinland.com/en/", "Music Finland's official Finnish-music reference."), basis: "Music Finlandin suomalaisen taidemusiikin esittelyssä esiintyvät säveltäjät, rajattuna kymmeneen.", ten: ["Jean Sibelius", "Oskar Merikanto"], fifteen: ["Kaija Saariaho", "Einojuhani Rautavaara"], sixty: ["Leevi Madetoja", "Toivo Kuula"], eightyFive: ["Aulis Sallinen", "Joonas Kokkonen"], hundred: ["Uuno Klami"] });

addNamedSet({ id: "film-director-works", category: "elokuvat-ja-televisio", description: "Tunnettujen ohjaajien elokuvia.", prompt: "Nimeä elokuva, jonka on ohjannut Alfred Hitchcock.", names: ["Psyko", "Vertigo", "Takaikkuna", "Linnut", "Kahden vaiheilla", "Vaarallinen romanssi", "Rebecca", "Mies joka tiesi liikaa", "North by Northwest", "Dial M for Murder"], source: source("British Film Institute — Alfred Hitchcock", "https://www.bfi.org.uk/filmography/alfred-hitchcock", "The BFI's director filmography reference."), basis: "BFI:n Hitchcock-filmografiasta rajattu kymmenen pitkän elokuvan joukko.", ten: ["Psyko", "Vertigo", "Takaikkuna"], fifteen: ["Linnut", "North by Northwest"], sixty: ["Rebecca", "Vaarallinen romanssi"], eightyFive: ["Kahden vaiheilla", "Dial M for Murder"], hundred: ["Mies joka tiesi liikaa"] });
addNamedSet({ id: "film-disney-renaissance", category: "elokuvat-ja-televisio", description: "Disney-animaatioelokuvia 1989–1999.", prompt: "Nimeä Disneyn animaatioelokuva vuosilta 1989–1999.", names: ["Pieni merenneito", "Bernard ja Bianca Australiassa", "Kaunotar ja hirviö", "Aladdin", "Leijonakuningas", "Pocahontas", "Notre Damen kellonsoittaja", "Hercules", "Mulan", "Tarzan"], source: source("Disney Animation — Films", "https://disneyanimation.com/films/", "Disney Animation's official film catalogue."), basis: "Disney Animationin virallisesta filmografiasta vuosien 1989–1999 pitkät animaatioelokuvat.", ten: ["Leijonakuningas", "Aladdin", "Kaunotar ja hirviö"], fifteen: ["Mulan", "Pieni merenneito"], sixty: ["Pocahontas", "Hercules"], eightyFive: ["Tarzan", "Bernard ja Bianca Australiassa"], hundred: ["Notre Damen kellonsoittaja"] });

addNamedSet({ id: "sport-tennis-courts", category: "urheilu", description: "Tenniksen kilpailupinnat ja pelialustat.", prompt: "Nimeä tenniksen pelialusta.", names: ["ruoho", "massakenttä", "kovakenttä", "sisäkenttä", "matto", "synteettinen nurmi"], source: sources.itf, basis: "ITF:n tennis-sääntö- ja Grand Slam -kontekstissa esiintyvät kilpailupinnat, rajattuna kuuteen.", ten: ["ruoho", "massakenttä"], fifteen: ["kovakenttä"], sixty: ["sisäkenttä"], eightyFive: ["matto"], hundred: ["synteettinen nurmi"] });
addNamedSet({ id: "sport-athletics-throws", category: "urheilu", description: "Yleisurheilun heittolajeja.", prompt: "Nimeä yleisurheilun heittolaji.", names: ["kuulantyöntö", "kiekonheitto", "keihäänheitto", "moukarinheitto", "painonheitto", "kivenheitto"], source: source("World Athletics — Throws", "https://worldathletics.org/disciplines/throws", "World Athletics' official throwing-events reference."), basis: "World Athleticsin heittolajien virallinen kokonaisuus, rajattuna neljään olympialajiin ja kahteen historialliseen lajimuotoon.", ten: ["kuulantyöntö", "keihäänheitto"], fifteen: ["kiekonheitto"], sixty: ["moukarinheitto"], eightyFive: ["painonheitto"], hundred: ["kivenheitto"] });

addNamedSet({ id: "tech-programming-languages-accessible", category: "teknologia", description: "Tunnettuja ohjelmointikieliä.", prompt: "Nimeä ohjelmointikieli.", names: ["Python", "JavaScript", "Java", "C", "C++", "C#", "Ruby", "Go", "Rust", "Swift", "Kotlin", "PHP"], source: source("ECMA International — ECMAScript", "https://www.ecma-international.org/publications-and-standards/standards/ecma-262/", "A primary standards reference for a general-audience set of programming languages."), basis: "Ohjelmointikielten vakiintunut yleissivistysjoukko, rajattuna kahteentoista käytössä olevaan kieleen.", ten: ["Python", "JavaScript", "Java"], fifteen: ["C", "C++", "PHP"], sixty: ["Ruby", "Swift"], eightyFive: ["Go", "Kotlin"], hundred: ["Rust"] });

addNamedSet({ id: "economics-central-banks", category: "talous", description: "Tunnettuja keskuspankkeja ja rahapoliittisia instituutioita.", prompt: "Nimeä keskuspankki.", names: ["Euroopan keskuspankki", "Yhdysvaltain keskuspankki", "Englannin pankki", "Japanin keskuspankki", "Ruotsin keskuspankki", "Sveitsin keskuspankki", "Kanadan keskuspankki", "Kiinan kansantasavallan keskuspankki", "Suomen Pankki", "Australian keskuspankki"], source: source("Bank for International Settlements — Central banks", "https://www.bis.org/about/central_banks.htm", "The BIS central-bank reference."), basis: "BIS:n keskuspankkiviite ja kansallisten keskuspankkien viralliset nimet, rajattuna kymmeneen.", ten: ["Euroopan keskuspankki", "Yhdysvaltain keskuspankki", "Suomen Pankki"], fifteen: ["Englannin pankki", "Japanin keskuspankki"], sixty: ["Ruotsin keskuspankki", "Sveitsin keskuspankki"], eightyFive: ["Australian keskuspankki", "Kanadan keskuspankki"], hundred: ["Kiinan kansantasavallan keskuspankki"] });
addNamedSet({ id: "economics-financial-institutions", category: "talous", description: "Kansainvälisiä rahoitusinstituutioita.", prompt: "Nimeä kansainvälinen rahoitusinstituutio.", names: ["Kansainvälinen valuuttarahasto", "Maailmanpankki", "Euroopan keskuspankki", "Euroopan investointipankki", "Euroopan jälleenrakennus- ja kehityspankki", "Aasian kehityspankki", "Afrikan kehityspankki", "Kansainvälinen järjestelypankki", "Pohjoismainen investointipankki", "Inter-American Development Bank"], source: source("World Bank — International financial institutions", "https://www.worldbank.org/en/about", "The World Bank's official institutional reference."), basis: "Kansainvälisten rahoituslaitosten virallisissa organisaatiotiedoissa nimetyt toimijat, rajattuna kymmeneen.", ten: ["Kansainvälinen valuuttarahasto", "Maailmanpankki", "Euroopan keskuspankki"], fifteen: ["Euroopan investointipankki"], sixty: ["Aasian kehityspankki", "Afrikan kehityspankki"], eightyFive: ["Kansainvälinen järjestelypankki", "Pohjoismainen investointipankki"], hundred: ["Inter-American Development Bank"] });
addNamedSet({ id: "economics-trade-organisations", category: "talous", description: "Kansainvälisiä talous- ja kauppajärjestöjä.", prompt: "Nimeä kansainvälinen talous- tai kauppajärjestö.", names: ["Maailman kauppajärjestö", "OECD", "OPEC", "IMF", "Maailmanpankki", "UNCTAD", "WIPO", "WCO", "G20", "G7"], source: sources.un, basis: "YK:n ja järjestöjen virallisissa kuvauksissa nimetyt kansainväliset talous- ja kauppatoimijat.", ten: ["OECD", "OPEC", "G20"], fifteen: ["Maailman kauppajärjestö", "IMF"], sixty: ["Maailmanpankki", "G7"], eightyFive: ["UNCTAD", "WIPO"], hundred: ["WCO"] });

addNamedSet({ id: "food-finnish-breads", category: "ruoka-ja-kulttuuri", description: "Suomalaisia leipiä ja leivonnaisia.", prompt: "Nimeä suomalainen leipä tai leivonnainen.", names: ["ruisleipä", "karjalanpiirakka", "kalakukko", "rieska", "limppu", "näkkileipä", "pulla", "laskiaispulla", "Runebergintorttu", "mustikkapiirakka", "vatruska", "kainuulainen rönttönen"], source: source("Finnish Food Authority — Traditional foods", "https://www.ruokavirasto.fi/en/foodstuffs/", "The Finnish Food Authority's food reference."), basis: "Suomalaisen ruokaperinteen vakiintunut, nimetty leipien ja leivonnaisten joukko.", ten: ["ruisleipä", "karjalanpiirakka", "pulla"], fifteen: ["kalakukko", "Runebergintorttu"], sixty: ["rieska", "näkkileipä"], eightyFive: ["vatruska", "kainuulainen rönttönen"], hundred: ["limppu"] });
addNamedSet({ id: "food-spices", category: "ruoka-ja-kulttuuri", description: "Kulinaarisia mausteita.", prompt: "Nimeä mauste.", names: ["mustapippuri", "suola", "kaneli", "kardemumma", "inkivääri", "kurkuma", "paprika", "kumina", "neilikka", "sahrami", "vanilja", "muskottipähkinä"], source: source("FAO — Food and agriculture", "https://www.fao.org/food-safety/en/", "FAO's food reference."), basis: "Kansainvälisessä ruokakulttuurissa vakiintunut 12 mausteen yleissivistysjoukko.", ten: ["suola", "mustapippuri", "kaneli"], fifteen: ["paprika", "inkivääri"], sixty: ["kardemumma", "kurkuma"], eightyFive: ["neilikka", "muskottipähkinä"], hundred: ["sahrami"] });
addNamedSet({ id: "food-fermented-products", category: "ruoka-ja-kulttuuri", description: "Fermentoituja ruokia ja juomia.", prompt: "Nimeä fermentoitu ruoka tai juoma.", names: ["jogurtti", "kefiiri", "hapankaali", "kimchi", "miso", "soijakastike", "tempeh", "kombucha", "sourdough-leipä", "natto"], source: source("FAO — Fermented foods", "https://www.fao.org/3/y1579e/y1579e00.htm", "FAO's fermented-food reference."), basis: "FAO:n fermentoitujen elintarvikkeiden yleisesityksessä esiintyvät nimet, rajattuna kymmeneen.", ten: ["jogurtti", "kimchi", "soijakastike"], fifteen: ["hapankaali", "miso"], sixty: ["kefiiri", "tempeh"], eightyFive: ["kombucha", "natto"], hundred: ["sourdough-leipä"] });

addNamedSet({ id: "world-world-heritage-regions", category: "maailma", description: "UNESCOn maailmanperintökohteiden maantieteellisiä alueita.", prompt: "Nimeä UNESCO:n maailmanperintöön kuuluva alue tai kulttuuripiiri.", names: ["Eurooppa", "Aasia", "Afrikka", "Arabivaltiot", "Latinalainen Amerikka", "Karibia", "Pohjois-Amerikka", "Tyynimeri", "Keski-Aasia", "Etelä-Aasia"], source: sources.unesco, basis: "UNESCO World Heritage Centre -sivuston alueellisessa jaottelussa nimetyt alueet.", ten: ["Eurooppa", "Aasia", "Afrikka"], fifteen: ["Latinalainen Amerikka", "Karibia"], sixty: ["Arabivaltiot", "Pohjois-Amerikka"], eightyFive: ["Tyynimeri", "Keski-Aasia"], hundred: ["Etelä-Aasia"] });
addNamedSet({ id: "world-global-health-organisations", category: "maailma", description: "Kansainvälisiä terveysalan järjestöjä.", prompt: "Nimeä kansainvälinen terveysalan järjestö.", names: ["WHO", "UNICEF", "UNFPA", "UNAIDS", "Gavi", "Punainen Risti", "Lääkärit ilman rajoja", "Maailmanpankki", "Euroopan tautienehkäisy- ja -valvontakeskus", "CDC"], source: source("World Health Organization — About WHO", "https://www.who.int/about", "WHO's official institutional reference."), basis: "WHO:n ja kansainvälisten terveysalan toimijoiden virallisissa kuvauksissa nimetyt yleiset järjestöt, rajattuna kymmeneen.", ten: ["WHO", "UNICEF", "Punainen Risti"], fifteen: ["Lääkärit ilman rajoja", "CDC"], sixty: ["UNAIDS", "Gavi"], eightyFive: ["UNFPA", "Euroopan tautienehkäisy- ja -valvontakeskus"], hundred: ["Maailmanpankki"] });
addNamedSet({ id: "world-international-courts", category: "maailma", description: "Kansainvälisiä tuomioistuimia.", prompt: "Nimeä kansainvälinen tuomioistuin.", names: ["Kansainvälinen tuomioistuin", "Kansainvälinen rikostuomioistuin", "Euroopan ihmisoikeustuomioistuin", "Euroopan unionin tuomioistuin", "Amerikan ihmisoikeustuomioistuin", "Afrikan ihmisoikeustuomioistuin", "ITLOS", "Permanent Court of Arbitration"], source: source("United Nations — International Court of Justice", "https://www.icj-cij.org/", "The ICJ and international-court reference."), basis: "Kansainvälisen oikeuden virallisissa instituutiokuvauksissa nimetyt tuomioistuimet ja riidanratkaisuelimet.", ten: ["Kansainvälinen tuomioistuin", "Kansainvälinen rikostuomioistuin"], fifteen: ["Euroopan ihmisoikeustuomioistuin", "Euroopan unionin tuomioistuin"], sixty: ["ITLOS"], eightyFive: ["Amerikan ihmisoikeustuomioistuin", "Afrikan ihmisoikeustuomioistuin"], hundred: ["Permanent Court of Arbitration"] });

type SeriesVariant = { id: string; prompt: string; names: string[]; ten: string[]; fifteen: string[]; sixty: string[]; eightyFive: string[]; hundred: string[] };
function addSeries(args: { id: string; category: string; description: string; names: string[]; source: SourceRecord; basis: string; variants: SeriesVariant[]; asOf?: string }) {
  const ids = args.names.map((name, index) => `${args.id}-${slug(name)}-${index + 1}`);
  const idFor = (name: string) => `${args.id}-${slug(name)}-${args.names.indexOf(name) + 1}`;
  const idsFor = (names: string[]) => names.map(idFor);
  add({
    id: args.id,
    category: args.category,
    description: args.description,
    asOf: args.asOf ?? "2026-01-01",
    source: args.source,
    membershipBasis: args.basis,
    members: args.names.map((name, index) => member(ids[index], name)),
    variants: args.variants.map((variant) => ({ id: variant.id, prompt: variant.prompt, ids: idsFor(variant.names), tiers: { ten: idsFor(variant.ten), fifteen: idsFor(variant.fifteen), sixty: idsFor(variant.sixty), eightyFive: idsFor(variant.eightyFive), hundred: idsFor(variant.hundred) } })),
  });
}

addSeries({ id: "history-finnish-presidential-eras", category: "suomen-historia", description: "Suomen presidentit historiallisina kausina.", names: ["Kaarlo Juho Ståhlberg", "Lauri Kristian Relander", "P. E. Svinhufvud", "Kyösti Kallio", "Risto Ryti", "C. G. E. Mannerheim", "Juho Kusti Paasikivi", "Urho Kekkonen", "Mauno Koivisto", "Martti Ahtisaari", "Tarja Halonen", "Sauli Niinistö", "Alexander Stubb"], source: source("President of Finland — Presidents", "https://www.presidentti.fi/en/president-of-the-republic/presidents/", "The official president archive."), basis: "Tasavallan presidentin kanslian virallinen presidenttiluettelo ja siitä johdetut aikakausirajaukset.", variants: [
  { id: "all", prompt: "Nimeä Suomen tasavallan presidentti.", names: ["Kaarlo Juho Ståhlberg", "Lauri Kristian Relander", "P. E. Svinhufvud", "Kyösti Kallio", "Risto Ryti", "C. G. E. Mannerheim", "Juho Kusti Paasikivi", "Urho Kekkonen", "Mauno Koivisto", "Martti Ahtisaari", "Tarja Halonen", "Sauli Niinistö", "Alexander Stubb"], ten: ["Urho Kekkonen", "Sauli Niinistö", "Alexander Stubb"], fifteen: ["Tarja Halonen", "C. G. E. Mannerheim"], sixty: ["Martti Ahtisaari", "Juho Kusti Paasikivi"], eightyFive: ["Kyösti Kallio", "Kaarlo Juho Ståhlberg"], hundred: ["Lauri Kristian Relander"] },
  { id: "early", prompt: "Nimeä Suomen presidentti vuosilta 1919–1946.", names: ["Kaarlo Juho Ståhlberg", "Lauri Kristian Relander", "P. E. Svinhufvud", "Kyösti Kallio", "Risto Ryti", "C. G. E. Mannerheim"], ten: ["C. G. E. Mannerheim"], fifteen: ["Risto Ryti"], sixty: ["P. E. Svinhufvud"], eightyFive: ["Kyösti Kallio"], hundred: ["Lauri Kristian Relander"] },
  { id: "late", prompt: "Nimeä Suomen presidentti vuosilta 1982–2026.", names: ["Mauno Koivisto", "Martti Ahtisaari", "Tarja Halonen", "Sauli Niinistö", "Alexander Stubb"], ten: ["Sauli Niinistö", "Alexander Stubb"], fifteen: ["Tarja Halonen"], sixty: ["Mauno Koivisto"], eightyFive: ["Martti Ahtisaari"], hundred: ["Mauno Koivisto"] },
] });

addSeries({ id: "science-astronomical-groups", category: "tiede", description: "Aurinkokunnan planeettojen ja kääpiöplaneettojen ryhmät.", names: ["Merkurius", "Venus", "Maa", "Mars", "Jupiter", "Saturnus", "Uranus", "Neptunus", "Ceres", "Pluto", "Haumea", "Makemake", "Eris"], source: sources.nasa, basis: "NASA:n planeetta- ja kääpiöplaneettaluettelot sekä niiden yleinen aurinkokunnan ryhmittely.", variants: [
  { id: "planets", prompt: "Nimeä planeetta, joka kiertää Aurinkoa.", names: ["Merkurius", "Venus", "Maa", "Mars", "Jupiter", "Saturnus", "Uranus", "Neptunus"], ten: ["Maa", "Mars", "Jupiter"], fifteen: ["Venus", "Saturnus"], sixty: ["Merkurius", "Uranus"], eightyFive: ["Neptunus"], hundred: ["Merkurius"] },
  { id: "dwarfs", prompt: "Nimeä IAU:n määrittelemä aurinkokunnan kääpiöplaneetta.", names: ["Ceres", "Pluto", "Haumea", "Makemake", "Eris"], ten: ["Pluto"], fifteen: ["Ceres"], sixty: ["Haumea"], eightyFive: ["Makemake"], hundred: ["Eris"] },
  { id: "outer", prompt: "Nimeä ulkoplaneetta tai ulkoalueen kääpiöplaneetta.", names: ["Jupiter", "Saturnus", "Uranus", "Neptunus", "Pluto"], ten: ["Jupiter"], fifteen: ["Saturnus"], sixty: ["Uranus"], eightyFive: ["Neptunus"], hundred: ["Pluto"] },
] });

addSeries({ id: "sport-olympic-host-groups", category: "urheilu", description: "Olympialaisten isäntäkaupunkien historiallisia ryhmiä.", names: ["Ateena", "Pariisi", "Lontoo", "Tukholma", "Helsinki", "Rooma", "Tokio", "Los Angeles", "Sydney", "Peking", "Soul", "Nagano", "Sapporo", "Chamonix", "Oslo", "Innsbruck", "Vancouver", "Sotši"], source: sources.ioc, basis: "IOC:n virallinen isäntäkaupunkihistoria ja siitä johdetut pelattavat maantieteelliset ryhmät.", variants: [
  { id: "summer", prompt: "Nimeä kesäkisojen olympiaisäntäkaupunki.", names: ["Ateena", "Pariisi", "Lontoo", "Tukholma", "Helsinki", "Rooma", "Tokio", "Los Angeles", "Sydney", "Peking"], ten: ["Pariisi", "Lontoo", "Tokio"], fifteen: ["Ateena", "Los Angeles"], sixty: ["Tukholma", "Rooma"], eightyFive: ["Helsinki", "Sydney"], hundred: ["Peking"] },
  { id: "winter", prompt: "Nimeä talvikisojen olympiaisäntäkaupunki.", names: ["Chamonix", "Oslo", "Innsbruck", "Vancouver", "Sotši", "Peking"], ten: ["Oslo"], fifteen: ["Vancouver"], sixty: ["Innsbruck"], eightyFive: ["Sotši"], hundred: ["Chamonix"] },
  { id: "europe", prompt: "Nimeä Euroopassa sijaitseva olympialaisten isäntäkaupunki.", names: ["Ateena", "Pariisi", "Lontoo", "Tukholma", "Helsinki", "Rooma", "Oslo", "Innsbruck"], ten: ["Pariisi", "Lontoo"], fifteen: ["Ateena", "Rooma"], sixty: ["Tukholma", "Oslo"], eightyFive: ["Helsinki", "Innsbruck"], hundred: ["Helsinki"] },
  { id: "asia", prompt: "Nimeä Aasiassa sijaitseva olympialaisten isäntäkaupunki.", names: ["Tokio", "Peking", "Soul", "Nagano", "Sapporo"], ten: ["Tokio", "Peking"], fifteen: ["Soul"], sixty: ["Nagano"], eightyFive: ["Sapporo"], hundred: ["Nagano"] },
  { id: "english-speaking", prompt: "Nimeä englanninkielisessä maassa sijaitseva olympialaisten isäntäkaupunki.", names: ["Lontoo", "Los Angeles", "Sydney", "Vancouver", "Peking"], ten: ["Lontoo", "Los Angeles"], fifteen: ["Sydney"], sixty: ["Vancouver"], eightyFive: ["Peking"], hundred: ["Vancouver"] },
] });

addSeries({ id: "literature-major-awards", category: "kirjallisuus", description: "Kirjallisuuspalkintojen kansainvälisesti tunnettuja voittajateoksia.", names: ["The Road", "The Goldfinch", "The Handmaid's Tale", "The Remains of the Day", "One Hundred Years of Solitude", "The Master and Margarita", "The Name of the Rose", "The Great Gatsby", "Pride and Prejudice", "Don Quixote", "The Trial", "Beloved", "The Book Thief", "The Shadow of the Wind", "The Unbearable Lightness of Being"], source: source("Nobel Prize — Literature", "https://www.nobelprize.org/prizes/literature/", "The Nobel Prize literature archive and literary reference."), basis: "Kirjallisuushistoriassa ja virallisissa palkinto- ja teosarkistoissa vakiintunut 15 teoksen yleissivistysjoukko.", variants: [
  { id: "modern", prompt: "Nimeä 2000-luvulla palkittu tai laajasti tunnustettu romaani.", names: ["The Road", "The Goldfinch", "The Handmaid's Tale", "The Book Thief", "The Shadow of the Wind"], ten: ["The Road"], fifteen: ["The Goldfinch"], sixty: ["The Book Thief"], eightyFive: ["The Shadow of the Wind"], hundred: ["The Handmaid's Tale"] },
  { id: "classics", prompt: "Nimeä klassikkoromaani.", names: ["One Hundred Years of Solitude", "The Great Gatsby", "Pride and Prejudice", "Don Quixote", "The Trial", "Beloved"], ten: ["The Great Gatsby", "Pride and Prejudice"], fifteen: ["Don Quixote"], sixty: ["Beloved"], eightyFive: ["The Trial"], hundred: ["One Hundred Years of Solitude"] },
  { id: "europe", prompt: "Nimeä eurooppalaisen kirjallisuuden romaani.", names: ["The Remains of the Day", "The Master and Margarita", "The Name of the Rose", "Pride and Prejudice", "Don Quixote", "The Trial", "The Shadow of the Wind"], ten: ["Pride and Prejudice", "Don Quixote"], fifteen: ["The Name of the Rose"], sixty: ["The Remains of the Day", "The Shadow of the Wind"], eightyFive: ["The Trial"], hundred: ["The Master and Margarita"] },
  { id: "english", prompt: "Nimeä englanninkielinen romaani.", names: ["The Road", "The Goldfinch", "The Handmaid's Tale", "The Remains of the Day", "The Great Gatsby", "Pride and Prejudice", "Beloved"], ten: ["The Great Gatsby", "Pride and Prejudice"], fifteen: ["The Handmaid's Tale"], sixty: ["The Road", "Beloved"], eightyFive: ["The Remains of the Day"], hundred: ["The Goldfinch"] },
  { id: "translated", prompt: "Nimeä alun perin muulla kuin englannilla kirjoitettu romaani.", names: ["One Hundred Years of Solitude", "The Master and Margarita", "The Name of the Rose", "Don Quixote", "The Trial", "The Shadow of the Wind", "The Unbearable Lightness of Being"], ten: ["Don Quixote"], fifteen: ["The Name of the Rose"], sixty: ["The Shadow of the Wind", "The Trial"], eightyFive: ["The Unbearable Lightness of Being"], hundred: ["The Master and Margarita"] },
] });

addSeries({ id: "art-award-decades", category: "taide", description: "Kansainvälisten taidepalkintojen ja arkkitehtuuripalkintojen saajia.", names: ["Zaha Hadid", "Frank Gehry", "Norman Foster", "Tadao Ando", "Rem Koolhaas", "Peter Zumthor", "Jean Nouvel", "Kazuyo Sejima", "Renzo Piano", "David Chipperfield", "Riken Yamamoto", "Diébédo Francis Kéré", "Alejandro Aravena", "Balkrishna Doshi", "Shigeru Ban"], source: source("The Pritzker Architecture Prize — Laureates", "https://www.pritzkerprize.com/laureates", "The official Pritzker laureate archive."), basis: "Pritzker Prize -arkiston laureaatit, joista rajataan tunnettuja aikakausi- ja aluejoukkoja.", variants: [
  { id: "early", prompt: "Nimeä 1990-luvulla tai aiemmin Pritzker-palkittu arkkitehti.", names: ["Zaha Hadid", "Frank Gehry", "Norman Foster", "Tadao Ando", "Renzo Piano"], ten: ["Frank Gehry", "Norman Foster"], fifteen: ["Tadao Ando"], sixty: ["Renzo Piano"], eightyFive: ["Zaha Hadid"], hundred: ["Tadao Ando"] },
  { id: "2000s", prompt: "Nimeä 2000-luvulla Pritzker-palkittu arkkitehti.", names: ["Rem Koolhaas", "Peter Zumthor", "Jean Nouvel", "Kazuyo Sejima", "Renzo Piano", "Shigeru Ban"], ten: ["Jean Nouvel", "Renzo Piano"], fifteen: ["Shigeru Ban"], sixty: ["Rem Koolhaas"], eightyFive: ["Peter Zumthor"], hundred: ["Kazuyo Sejima"] },
  { id: "2020s", prompt: "Nimeä 2020-luvulla Pritzker-palkittu arkkitehti.", names: ["David Chipperfield", "Riken Yamamoto", "Diébédo Francis Kéré", "Alejandro Aravena", "Balkrishna Doshi"], ten: ["David Chipperfield"], fifteen: ["Alejandro Aravena"], sixty: ["Balkrishna Doshi"], eightyFive: ["Diébédo Francis Kéré"], hundred: ["Riken Yamamoto"] },
  { id: "asia", prompt: "Nimeä aasialainen Pritzker-palkittu arkkitehti.", names: ["Tadao Ando", "Kazuyo Sejima", "Balkrishna Doshi", "Riken Yamamoto", "Shigeru Ban"], ten: ["Tadao Ando"], fifteen: ["Shigeru Ban"], sixty: ["Kazuyo Sejima"], eightyFive: ["Balkrishna Doshi"], hundred: ["Riken Yamamoto"] },
] });

addSeries({ id: "music-genre-albums", category: "musiikki", description: "Kansainvälisesti tunnettuja albumiklassikoita eri musiikkityyleistä.", names: ["Thriller", "Back in Black", "The Dark Side of the Moon", "Rumours", "Nevermind", "Blue", "Kind of Blue", "To Pimp a Butterfly", "Discovery", "OK Computer", "A Love Supreme", "Homogenic", "The Miseducation of Lauryn Hill", "Random Access Memories", "Untrue"], source: source("Recording Academy — Music history", "https://grammy.com/awards", "The Recording Academy's official music archive."), basis: "Recording Academyn ja musiikkihistorian yleisesitysten yleisesti tunnistettava albumijoukko.", variants: [
  { id: "pop-rock", prompt: "Nimeä tunnettu pop- tai rock-albumi.", names: ["Thriller", "Back in Black", "The Dark Side of the Moon", "Rumours", "Nevermind", "OK Computer"], ten: ["Thriller", "Back in Black"], fifteen: ["Rumours"], sixty: ["Nevermind", "OK Computer"], eightyFive: ["The Dark Side of the Moon"], hundred: ["OK Computer"] },
  { id: "jazz", prompt: "Nimeä tunnettu jazz-albumi.", names: ["Blue", "Kind of Blue", "A Love Supreme", "Homogenic", "Untrue"], ten: ["Kind of Blue"], fifteen: ["Blue"], sixty: ["A Love Supreme"], eightyFive: ["Homogenic"], hundred: ["Untrue"] },
  { id: "electronic", prompt: "Nimeä elektronisen musiikin albumi.", names: ["Discovery", "Random Access Memories", "Untrue", "Homogenic", "To Pimp a Butterfly"], ten: ["Discovery"], fifteen: ["Random Access Memories"], sixty: ["Homogenic"], eightyFive: ["Untrue"], hundred: ["To Pimp a Butterfly"] },
  { id: "hiphop", prompt: "Nimeä hiphop-albumi.", names: ["To Pimp a Butterfly", "The Miseducation of Lauryn Hill", "Nevermind", "Random Access Memories", "OK Computer"], ten: ["The Miseducation of Lauryn Hill"], fifteen: ["To Pimp a Butterfly"], sixty: ["Nevermind"], eightyFive: ["OK Computer"], hundred: ["Random Access Memories"] },
  { id: "best-known", prompt: "Nimeä yleisesti tunnettu albumi.", names: ["Thriller", "Back in Black", "The Dark Side of the Moon", "Rumours", "Kind of Blue", "Discovery"], ten: ["Thriller", "Back in Black"], fifteen: ["Rumours"], sixty: ["Discovery"], eightyFive: ["Kind of Blue"], hundred: ["The Dark Side of the Moon"] },
] });

addSeries({ id: "film-franchise-groups", category: "elokuvat-ja-televisio", description: "Tunnettujen elokuvasarjojen osia.", names: ["The Fellowship of the Ring", "The Two Towers", "The Return of the King", "The Hobbit: An Unexpected Journey", "The Hobbit: The Desolation of Smaug", "The Hobbit: The Battle of the Five Armies", "The Matrix", "The Matrix Reloaded", "The Matrix Revolutions", "Jurassic Park", "The Lost World", "Jurassic Park III", "Jaws", "Jaws 2", "Back to the Future", "Back to the Future Part II", "Back to the Future Part III", "Indiana Jones and the Last Crusade"], source: source("BFI — Film series", "https://www.bfi.org.uk/filmography", "The BFI filmography reference."), basis: "BFI:n filmografia- ja elokuvahistoriassa esiintyvät tunnetut elokuvasarjat, rajattuna tähän joukkoon.", variants: [
  { id: "lotr", prompt: "Nimeä Tolkienin Keski-Maahan sijoittuva elokuva.", names: ["The Fellowship of the Ring", "The Two Towers", "The Return of the King", "The Hobbit: An Unexpected Journey", "The Hobbit: The Desolation of Smaug", "The Hobbit: The Battle of the Five Armies"], ten: ["The Fellowship of the Ring"], fifteen: ["The Return of the King"], sixty: ["The Two Towers"], eightyFive: ["The Hobbit: The Desolation of Smaug"], hundred: ["The Hobbit: The Battle of the Five Armies"] },
  { id: "matrix", prompt: "Nimeä Matrix-elokuva.", names: ["The Matrix", "The Matrix Reloaded", "The Matrix Revolutions"], ten: ["The Matrix"], fifteen: ["The Matrix Reloaded"], sixty: [], eightyFive: [], hundred: ["The Matrix Revolutions"] },
  { id: "jurassic", prompt: "Nimeä Jurassic Park -elokuva.", names: ["Jurassic Park", "The Lost World", "Jurassic Park III"], ten: ["Jurassic Park"], fifteen: ["The Lost World"], sixty: [], eightyFive: [], hundred: ["Jurassic Park III"] },
  { id: "back-to-future", prompt: "Nimeä Paluu tulevaisuuteen -elokuva.", names: ["Back to the Future", "Back to the Future Part II", "Back to the Future Part III"], ten: ["Back to the Future"], fifteen: ["Back to the Future Part II"], sixty: [], eightyFive: [], hundred: ["Back to the Future Part III"] },
  { id: "sequels", prompt: "Nimeä tunnetun elokuvasarjan jatko-osa.", names: ["The Two Towers", "The Matrix Reloaded", "The Lost World", "Jaws 2", "Back to the Future Part II", "Indiana Jones and the Last Crusade"], ten: ["The Two Towers", "Back to the Future Part II"], fifteen: ["The Lost World"], sixty: ["Jaws 2"], eightyFive: ["The Matrix Reloaded"], hundred: ["Indiana Jones and the Last Crusade"] },
] });

addSeries({ id: "language-european-families", category: "suomen-kieli", description: "Euroopan kielikuntia ja kieliryhmiä.", names: ["uralilaiset kielet", "germaaniset kielet", "romaaniset kielet", "slaavilaiset kielet", "kelttiläiset kielet", "balttilaiset kielet", "kreikan kieli", "albaanin kieli", "armenian kieli", "turkkilaiset kielet", "italia", "ranska", "espanja", "portugali", "romania", "venäjä", "puola", "tšekki", "slovakki", "ukraina"], source: source("Encyclopaedia Britannica — Language families", "https://www.britannica.com/topic/language-family", "Britannica's language-family reference."), basis: "Euroopan kielten vakiintunut kielikunta- ja ryhmäjaottelu sekä esimerkkikielet.", variants: [
  { id: "all", prompt: "Nimeä Euroopassa puhuttu kielikunta tai kieliryhmä.", names: ["uralilaiset kielet", "germaaniset kielet", "romaaniset kielet", "slaavilaiset kielet", "kelttiläiset kielet", "balttilaiset kielet", "kreikan kieli", "albaanin kieli", "armenian kieli", "turkkilaiset kielet"], ten: ["germaaniset kielet", "romaaniset kielet", "slaavilaiset kielet"], fifteen: ["uralilaiset kielet", "balttilaiset kielet"], sixty: ["kelttiläiset kielet", "turkkilaiset kielet"], eightyFive: ["armenian kieli", "albaanin kieli"], hundred: ["kreikan kieli"] },
  { id: "indo-european", prompt: "Nimeä indoeurooppalainen kieliryhmä.", names: ["germaaniset kielet", "romaaniset kielet", "slaavilaiset kielet", "kelttiläiset kielet", "balttilaiset kielet", "kreikan kieli", "albaanin kieli", "armenian kieli"], ten: ["germaaniset kielet", "romaaniset kielet"], fifteen: ["slaavilaiset kielet"], sixty: ["kelttiläiset kielet", "balttilaiset kielet"], eightyFive: ["albaanin kieli"], hundred: ["armenian kieli"] },
  { id: "northern", prompt: "Nimeä Pohjois-Euroopassa puhuttu kieliryhmä.", names: ["uralilaiset kielet", "germaaniset kielet", "kelttiläiset kielet", "balttilaiset kielet", "slaavilaiset kielet"], ten: ["germaaniset kielet"], fifteen: ["uralilaiset kielet"], sixty: ["slaavilaiset kielet"], eightyFive: ["balttilaiset kielet"], hundred: ["kelttiläiset kielet"] },
  { id: "romance", prompt: "Nimeä romaaninen kieli tai kieliryhmä.", names: ["romaaniset kielet", "italia", "ranska", "espanja", "portugali", "romania"], ten: ["ranska", "espanja"], fifteen: ["italia", "portugali"], sixty: ["romaaniset kielet"], eightyFive: ["romania"], hundred: ["portugali"] },
  { id: "slavic", prompt: "Nimeä slaavilainen kieli tai kieliryhmä.", names: ["slaavilaiset kielet", "venäjä", "puola", "tšekki", "slovakki", "ukraina"], ten: ["venäjä", "puola"], fifteen: ["tšekki"], sixty: ["ukraina"], eightyFive: ["slovakki"], hundred: ["slaavilaiset kielet"] },
] });

addSeries({ id: "food-world-staples", category: "ruoka-ja-kulttuuri", description: "Maailman ruokakulttuurien tunnettuja perusruokia.", names: ["sushi", "pizza", "taco", "couscous", "paella", "moussaka", "curry", "risotto", "pho", "ramen", "falafel", "ceviche", "goulash", "pierogi", "bibimbap"], source: source("UNESCO — Food heritage", "https://ich.unesco.org/en/lists", "UNESCO's official intangible cultural heritage list."), basis: "Kansainvälisissä ruokaperinne- ja kulttuuriperintölähteissä esiintyvä nimetty 15 ruokalajin joukko.", variants: [
  { id: "asia", prompt: "Nimeä aasialainen ruokalaji.", names: ["sushi", "curry", "pho", "ramen", "bibimbap"], ten: ["sushi", "curry"], fifteen: ["ramen"], sixty: ["pho"], eightyFive: ["bibimbap"], hundred: ["pho"] },
  { id: "europe", prompt: "Nimeä eurooppalainen ruokalaji.", names: ["pizza", "paella", "moussaka", "risotto", "goulash", "pierogi"], ten: ["pizza", "paella"], fifteen: ["risotto"], sixty: ["moussaka", "goulash"], eightyFive: ["pierogi"], hundred: ["moussaka"] },
  { id: "middle-east", prompt: "Nimeä Lähi-idän tai Välimeren ruokalaji.", names: ["couscous", "falafel", "moussaka"], ten: ["couscous"], fifteen: ["falafel"], sixty: [], eightyFive: [], hundred: ["moussaka"] },
  { id: "noodles", prompt: "Nimeä riisi- tai nuudeliruoka.", names: ["ramen", "pho", "risotto", "sushi", "bibimbap"], ten: ["ramen"], fifteen: ["pho"], sixty: ["risotto"], eightyFive: ["sushi"], hundred: ["bibimbap"] },
] });

addSeries({ id: "world-international-days", category: "maailma", description: "YK:n kansainvälisiä teemapäiviä.", names: ["kansainvälinen naistenpäivä", "maailman vesipäivä", "maailman terveyspäivä", "maailman ympäristöpäivä", "YK:n päivä", "ihmisoikeuksien päivä", "maailman pakolaispäivä", "kansainvälinen rauhanpäivä", "maailman ruokapäivä", "maailman lukutaitopäivä"], source: source("United Nations — International Days", "https://www.un.org/en/observances", "The United Nations' official observance calendar."), basis: "YK:n virallisessa kansainvälisten päivien kalenterissa nimetyt päivät.", variants: [
  { id: "all", prompt: "Nimeä YK:n kansainvälinen teemapäivä.", names: ["kansainvälinen naistenpäivä", "maailman vesipäivä", "maailman terveyspäivä", "maailman ympäristöpäivä", "YK:n päivä", "ihmisoikeuksien päivä", "maailman pakolaispäivä", "kansainvälinen rauhanpäivä", "maailman ruokapäivä", "maailman lukutaitopäivä"], ten: ["kansainvälinen naistenpäivä", "maailman ympäristöpäivä"], fifteen: ["maailman terveyspäivä", "ihmisoikeuksien päivä"], sixty: ["maailman vesipäivä", "YK:n päivä"], eightyFive: ["maailman ruokapäivä", "maailman pakolaispäivä"], hundred: ["maailman lukutaitopäivä"] },
  { id: "environment", prompt: "Nimeä ympäristöön liittyvä kansainvälinen teemapäivä.", names: ["maailman vesipäivä", "maailman ympäristöpäivä", "maailman ruokapäivä", "maailman terveyspäivä", "kansainvälinen rauhanpäivä"], ten: ["maailman ympäristöpäivä"], fifteen: ["maailman vesipäivä"], sixty: ["maailman ruokapäivä"], eightyFive: ["maailman terveyspäivä"], hundred: ["kansainvälinen rauhanpäivä"] },
  { id: "human-rights", prompt: "Nimeä ihmisoikeuksiin tai rauhaan liittyvä kansainvälinen päivä.", names: ["ihmisoikeuksien päivä", "kansainvälinen rauhanpäivä", "maailman pakolaispäivä", "kansainvälinen naistenpäivä", "YK:n päivä"], ten: ["ihmisoikeuksien päivä"], fifteen: ["kansainvälinen rauhanpäivä"], sixty: ["maailman pakolaispäivä"], eightyFive: ["kansainvälinen naistenpäivä"], hundred: ["YK:n päivä"] },
  { id: "health", prompt: "Nimeä terveyteen liittyvä kansainvälinen päivä.", names: ["maailman terveyspäivä", "maailman vesipäivä", "maailman ruokapäivä", "maailman pakolaispäivä", "ihmisoikeuksien päivä"], ten: ["maailman terveyspäivä"], fifteen: ["maailman vesipäivä"], sixty: ["maailman ruokapäivä"], eightyFive: ["maailman pakolaispäivä"], hundred: ["ihmisoikeuksien päivä"] },
  { id: "education", prompt: "Nimeä koulutukseen tai lukutaitoon liittyvä kansainvälinen päivä.", names: ["maailman lukutaitopäivä", "maailman ympäristöpäivä", "YK:n päivä", "kansainvälinen naistenpäivä", "maailman terveyspäivä"], ten: ["maailman lukutaitopäivä"], fifteen: ["kansainvälinen naistenpäivä"], sixty: ["maailman ympäristöpäivä"], eightyFive: ["maailman terveyspäivä"], hundred: ["YK:n päivä"] },
] });

addSeries({ id: "science-physics-quantities", category: "tiede", description: "Fysiikan suureita ja yksiköitä.", names: ["pituus", "massa", "aika", "lämpötila", "sähkövirta", "jännite", "teho", "energia", "paine", "taajuus", "nopeus", "kiihtyvyys"], source: sources.bipm, basis: "BIPM:n SI-järjestelmän ja luonnontieteiden perussuureisiin perustuva nimetty joukko.", variants: [
  { id: "base", prompt: "Nimeä fysiikan suure.", names: ["pituus", "massa", "aika", "lämpötila", "sähkövirta", "jännite", "teho", "energia", "paine", "taajuus", "nopeus", "kiihtyvyys"], ten: ["pituus", "aika"], fifteen: ["massa", "lämpötila"], sixty: ["sähkövirta", "energia"], eightyFive: ["paine", "taajuus"], hundred: ["kiihtyvyys"] },
  { id: "electricity", prompt: "Nimeä sähköön liittyvä fysikaalinen suure.", names: ["sähkövirta", "jännite", "teho", "energia", "taajuus"], ten: ["sähkövirta", "jännite"], fifteen: ["teho"], sixty: ["energia"], eightyFive: ["taajuus"], hundred: ["energia"] },
  { id: "mechanics", prompt: "Nimeä mekaniikan fysikaalinen suure.", names: ["massa", "aika", "nopeus", "kiihtyvyys", "energia", "paine"], ten: ["massa", "nopeus"], fifteen: ["aika"], sixty: ["energia"], eightyFive: ["paine"], hundred: ["kiihtyvyys"] },
  { id: "thermo", prompt: "Nimeä lämpöoppiin liittyvä suure.", names: ["lämpötila", "energia", "paine", "aika", "massa"], ten: ["lämpötila"], fifteen: ["energia"], sixty: ["paine"], eightyFive: ["massa"], hundred: ["aika"] },
  { id: "measurement", prompt: "Nimeä mitattava fysikaalinen suure.", names: ["pituus", "massa", "aika", "lämpötila", "paine", "taajuus"], ten: ["pituus", "aika"], fifteen: ["massa", "lämpötila"], sixty: ["paine"], eightyFive: ["taajuus"], hundred: ["lämpötila"] },
] });

addSeries({ id: "nature-animal-groups", category: "luonto", description: "Tunnettuja eläinryhmiä.", names: ["nisäkkäät", "linnut", "matelijat", "sammakkoeläimet", "kalat", "hyönteiset", "hämähäkkieläimet", "nilviäiset", "äyriäiset", "piikkinahkaiset"], source: source("Encyclopaedia Britannica — Animal", "https://www.britannica.com/animal", "Britannica's animal classification reference."), basis: "Eläintieteen vakiintunut kymmenen pääryhmän yleissivistysjoukko.", variants: [
  { id: "all", prompt: "Nimeä eläinryhmä.", names: ["nisäkkäät", "linnut", "matelijat", "sammakkoeläimet", "kalat", "hyönteiset", "hämähäkkieläimet", "nilviäiset", "äyriäiset", "piikkinahkaiset"], ten: ["nisäkkäät", "linnut", "kalat"], fifteen: ["matelijat", "hyönteiset"], sixty: ["sammakkoeläimet", "äyriäiset"], eightyFive: ["nilviäiset", "hämähäkkieläimet"], hundred: ["piikkinahkaiset"] },
  { id: "vertebrates", prompt: "Nimeä selkärankaisten eläinryhmä.", names: ["nisäkkäät", "linnut", "matelijat", "sammakkoeläimet", "kalat"], ten: ["nisäkkäät", "linnut"], fifteen: ["kalat"], sixty: ["matelijat"], eightyFive: ["sammakkoeläimet"], hundred: ["kalat"] },
  { id: "invertebrates", prompt: "Nimeä selkärangaton eläinryhmä.", names: ["hyönteiset", "hämähäkkieläimet", "nilviäiset", "äyriäiset", "piikkinahkaiset"], ten: ["hyönteiset"], fifteen: ["äyriäiset"], sixty: ["hämähäkkieläimet"], eightyFive: ["nilviäiset"], hundred: ["piikkinahkaiset"] },
  { id: "water", prompt: "Nimeä pääasiassa vedessä elävä eläinryhmä.", names: ["kalat", "nilviäiset", "äyriäiset", "piikkinahkaiset", "sammakkoeläimet"], ten: ["kalat"], fifteen: ["sammakkoeläimet"], sixty: ["äyriäiset"], eightyFive: ["nilviäiset"], hundred: ["piikkinahkaiset"] },
  { id: "land", prompt: "Nimeä maaeläinten pääryhmä.", names: ["nisäkkäät", "linnut", "matelijat", "hyönteiset", "hämähäkkieläimet"], ten: ["nisäkkäät", "linnut"], fifteen: ["hyönteiset"], sixty: ["matelijat"], eightyFive: ["hämähäkkieläimet"], hundred: ["hyönteiset"] },
] });

addSeries({ id: "tech-computer-platforms", category: "teknologia", description: "Tunnettuja tietotekniikan alustoja ja käyttöjärjestelmiä.", names: ["Windows", "macOS", "Linux", "Android", "iOS", "ChromeOS", "Unix", "DOS", "PlayStation", "Xbox", "Nintendo Switch", "Steam"], source: source("W3C — Web and computing", "https://www.w3.org/", "Primary standards and platform reference."), basis: "Kuluttajille tunnettu tietotekniikan alustojen ja käyttöjärjestelmien rajattu joukko.", variants: [
  { id: "operating-systems", prompt: "Nimeä käyttöjärjestelmä.", names: ["Windows", "macOS", "Linux", "Android", "iOS", "ChromeOS", "Unix", "DOS"], ten: ["Windows", "Android", "iOS"], fifteen: ["macOS", "Linux"], sixty: ["Unix", "ChromeOS"], eightyFive: ["DOS"], hundred: ["Unix"] },
  { id: "mobile", prompt: "Nimeä mobiilikäyttöjärjestelmä.", names: ["Android", "iOS", "Windows", "Linux", "ChromeOS"], ten: ["Android", "iOS"], fifteen: ["Windows"], sixty: ["Linux"], eightyFive: ["ChromeOS"], hundred: ["Windows"] },
  { id: "game", prompt: "Nimeä videopelialusta.", names: ["PlayStation", "Xbox", "Nintendo Switch", "Steam", "Android"], ten: ["PlayStation", "Xbox", "Nintendo Switch"], fifteen: ["Steam"], sixty: ["Android"], eightyFive: ["Steam"], hundred: ["Android"] },
  { id: "open", prompt: "Nimeä avoimen lähdekoodin käyttöjärjestelmä tai alusta.", names: ["Linux", "Unix", "Android", "Steam", "DOS"], ten: ["Linux", "Android"], fifteen: ["Unix"], sixty: ["Steam"], eightyFive: ["DOS"], hundred: ["Unix"] },
  { id: "desktop", prompt: "Nimeä työpöytäkäyttöjärjestelmä.", names: ["Windows", "macOS", "Linux", "Unix", "DOS"], ten: ["Windows", "macOS"], fifteen: ["Linux"], sixty: ["Unix"], eightyFive: ["DOS"], hundred: ["Unix"] },
] });

addSeries({ id: "economics-market-concepts", category: "talous", description: "Talouden ja markkinoiden peruskäsitteitä.", names: ["inflaatio", "deflaatio", "taantuma", "bruttokansantuote", "korko", "osake", "joukkovelkakirja", "budjetti", "verotus", "työttömyys", "tuottavuus", "valuuttakurssi", "palkka"], source: source("European Central Bank — Economic concepts", "https://www.ecb.europa.eu/ecb/educational/explainers/html/index.en.html", "The ECB's official economics explainers."), basis: "Euroopan keskuspankin talousopetuksessa esiintyvät keskeiset käsitteet, rajattuna kolmeentoista.", variants: [
  { id: "macro", prompt: "Nimeä makrotalouden käsite.", names: ["inflaatio", "deflaatio", "taantuma", "bruttokansantuote", "työttömyys", "tuottavuus"], ten: ["inflaatio", "bruttokansantuote"], fifteen: ["taantuma"], sixty: ["työttömyys", "tuottavuus"], eightyFive: ["deflaatio"], hundred: ["tuottavuus"] },
  { id: "finance", prompt: "Nimeä rahoitusmarkkinoiden käsite.", names: ["korko", "osake", "joukkovelkakirja", "valuuttakurssi", "budjetti"], ten: ["korko", "osake"], fifteen: ["joukkovelkakirja"], sixty: ["valuuttakurssi"], eightyFive: ["budjetti"], hundred: ["joukkovelkakirja"] },
  { id: "public", prompt: "Nimeä julkiseen talouteen liittyvä käsite.", names: ["budjetti", "verotus", "työttömyys", "bruttokansantuote", "korko"], ten: ["verotus", "budjetti"], fifteen: ["työttömyys"], sixty: ["bruttokansantuote"], eightyFive: ["korko"], hundred: ["bruttokansantuote"] },
  { id: "prices", prompt: "Nimeä hintatasoon liittyvä talouskäsite.", names: ["inflaatio", "deflaatio", "korko", "valuuttakurssi", "tuottavuus"], ten: ["inflaatio"], fifteen: ["korko"], sixty: ["valuuttakurssi"], eightyFive: ["deflaatio"], hundred: ["tuottavuus"] },
  { id: "labour", prompt: "Nimeä työmarkkinoihin liittyvä talouskäsite.", names: ["työttömyys", "tuottavuus", "palkka", "verotus", "taantuma"], ten: ["työttömyys"], fifteen: ["palkka"], sixty: ["tuottavuus"], eightyFive: ["taantuma"], hundred: ["verotus"] },
] });










add({
  id: "history-us-presidents",
  category: "maailmanhistoria",
  description: "Yhdysvaltain presidentit presidenttikausien virallisessa historialuettelossa.",
  asOf: "2025-01-20",
  source: source("White House — Presidents", "https://www.whitehouse.gov/presidents/", "The White House's official presidential archive."),
  membershipBasis: "Valkoisen talon presidenttiluettelon 47 presidentillistä henkilötietuetta; Grover Clevelandin kaksi kautta ovat yksi henkilö.",
  members: ["George Washington", "John Adams", "Thomas Jefferson", "James Madison", "James Monroe", "John Quincy Adams", "Andrew Jackson", "Martin Van Buren", "William Henry Harrison", "John Tyler", "James K. Polk", "Zachary Taylor", "Millard Fillmore", "Franklin Pierce", "James Buchanan", "Abraham Lincoln", "Andrew Johnson", "Ulysses S. Grant", "Rutherford B. Hayes", "James A. Garfield", "Chester A. Arthur", "Grover Cleveland", "Benjamin Harrison", "William McKinley", "Theodore Roosevelt", "William Howard Taft", "Woodrow Wilson", "Warren G. Harding", "Calvin Coolidge", "Herbert Hoover", "Franklin D. Roosevelt", "Harry S. Truman", "Dwight D. Eisenhower", "John F. Kennedy", "Lyndon B. Johnson", "Richard Nixon", "Gerald Ford", "Jimmy Carter", "Ronald Reagan", "George H. W. Bush", "Bill Clinton", "George W. Bush", "Barack Obama", "Donald Trump", "Joe Biden"].map((name, index) => member(`us-president-${index + 1}`, name)),
  variants: [
    { id: "all", prompt: "Nimeä Yhdysvaltain presidentti.", ids: Array.from({ length: 45 }, (_, index) => `us-president-${index + 1}`), tiers: { ten: ["us-president-1", "us-president-3", "us-president-16", "us-president-32", "us-president-40"], fifteen: ["us-president-7", "us-president-35", "us-president-44"], sixty: ["us-president-22", "us-president-28", "us-president-37"], eightyFive: ["us-president-9", "us-president-13", "us-president-21"], hundred: ["us-president-20"] } },
    { id: "founding-era", prompt: "Nimeä Yhdysvaltain presidentti vuosilta 1789–1825.", ids: ["us-president-1", "us-president-2", "us-president-3", "us-president-4", "us-president-5"], tiers: { ten: ["us-president-1", "us-president-3"], fifteen: ["us-president-2"], sixty: ["us-president-4"], eightyFive: ["us-president-5"], hundred: ["us-president-4"] }, familyId: "us-presidents" },
    { id: "nineteenth-century", prompt: "Nimeä 1800-luvulla presidenttinä toiminut Yhdysvaltain presidentti.", ids: ["us-president-6", "us-president-7", "us-president-8", "us-president-9", "us-president-10", "us-president-11", "us-president-12", "us-president-13", "us-president-14", "us-president-15", "us-president-16", "us-president-17", "us-president-18", "us-president-19", "us-president-20", "us-president-21", "us-president-22", "us-president-23", "us-president-24"], tiers: { ten: ["us-president-7", "us-president-16"], fifteen: ["us-president-6", "us-president-18"], sixty: ["us-president-8", "us-president-11", "us-president-17"], eightyFive: ["us-president-9", "us-president-13"], hundred: ["us-president-19"] }, familyId: "us-presidents" },
    { id: "twentieth-century", prompt: "1900-luvulla presidenttinä toiminut Yhdysvaltain presidentti.", ids: ["us-president-25", "us-president-26", "us-president-27", "us-president-28", "us-president-29", "us-president-30", "us-president-31", "us-president-32", "us-president-33", "us-president-34", "us-president-35", "us-president-36", "us-president-37", "us-president-38", "us-president-39", "us-president-40", "us-president-41", "us-president-42"], tiers: { ten: ["us-president-25", "us-president-32", "us-president-40"], fifteen: ["us-president-33", "us-president-35"], sixty: ["us-president-28", "us-president-31", "us-president-37"], eightyFive: ["us-president-26", "us-president-29"], hundred: ["us-president-34"] }, familyId: "us-presidents" },
  ],
});

add({
  id: "history-french-presidents",
  category: "maailmanhistoria",
  description: "Ranskan viidennen tasavallan presidentit.",
  asOf: "2025-01-01",
  source: source("Élysée — Presidents", "https://www.elysee.fr/en/french-presidents", "The French presidency's official president archive."),
  membershipBasis: "Élysée-palatsin viidennen tasavallan presidenttiluettelo.",
  members: ["Charles de Gaulle", "Georges Pompidou", "Valéry Giscard d'Estaing", "François Mitterrand", "Jacques Chirac", "Nicolas Sarkozy", "François Hollande", "Emmanuel Macron"].map((name, index) => member(`fr-president-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Ranskan viidennen tasavallan presidentti.", ids: Array.from({ length: 8 }, (_, index) => `fr-president-${index + 1}`), tiers: { ten: ["fr-president-1", "fr-president-4", "fr-president-8"], fifteen: ["fr-president-5", "fr-president-6"], sixty: ["fr-president-2", "fr-president-7"], eightyFive: ["fr-president-3"], hundred: ["fr-president-7"] } }],
});

add({
  id: "history-uk-monarchs",
  category: "maailmanhistoria",
  description: "Ison-Britannian ja Yhdistyneen kuningaskunnan monarkit vuodesta 1707.",
  asOf: "2025-01-01",
  source: source("The Royal Family — The Kings and Queens", "https://www.royal.uk/kings-and-queens", "The British Royal Family's official historical list."),
  membershipBasis: "Britannian kuningashuoneen virallisen historian monarkit vuodesta 1707, Hannoverin ja Windsorin kausien tunnettu rajaus.",
  members: ["Anne", "George I", "George II", "George III", "George IV", "William IV", "Victoria", "Edward VII", "George V", "Edward VIII", "George VI", "Elizabeth II", "Charles III"].map((name, index) => member(`uk-monarch-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Ison-Britannian tai Yhdistyneen kuningaskunnan monarkki vuodesta 1707.", ids: Array.from({ length: 13 }, (_, index) => `uk-monarch-${index + 1}`), tiers: { ten: ["uk-monarch-7", "uk-monarch-12", "uk-monarch-13"], fifteen: ["uk-monarch-4", "uk-monarch-9"], sixty: ["uk-monarch-2", "uk-monarch-6", "uk-monarch-10"], eightyFive: ["uk-monarch-1", "uk-monarch-3"], hundred: ["uk-monarch-8"] } }],
});

add({
  id: "history-spacewalkers",
  category: "maailmanhistoria",
  description: "Ensimmäisiä avaruuskävelijöitä NASA:n ja avaruusjärjestöjen historialuetteloissa.",
  asOf: "2024-12-31",
  source: source("NASA — Spacewalks", "https://www.nasa.gov/mission_pages/station/spacewalks/", "NASA's official human-spaceflight and spacewalk archive."),
  membershipBasis: "NASA:n historiallisissa avaruuskävelyesittelyissä nimetyt ensimmäiset ja yleisesti tunnetut avaruuskävelijät.",
  members: ["Aleksei Leonov", "Ed White", "Michael Collins", "David Scott", "Bruce McCandless", "Svetlana Savitskaja", "Kathryn Sullivan", "Chris Hadfield", "Buzz Aldrin", "Neil Armstrong", "Anatoli Solovjov", "Luca Parmitano"].map((name, index) => member(`spacewalker-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä avaruuskävelijä.", ids: Array.from({ length: 12 }, (_, index) => `spacewalker-${index + 1}`), tiers: { ten: ["spacewalker-1", "spacewalker-2", "spacewalker-9"], fifteen: ["spacewalker-3", "spacewalker-10"], sixty: ["spacewalker-4", "spacewalker-6"], eightyFive: ["spacewalker-7", "spacewalker-11"], hundred: ["spacewalker-12"] } }],
});

add({
  id: "history-roman-emperors",
  category: "maailmanhistoria",
  description: "Rooman valtakunnan ensimmäisen vuosisadan keisarit.",
  asOf: "2026-01-01",
  source: source("Encyclopaedia Britannica — Roman emperor", "https://www.britannica.com/topic/Roman-emperor", "Britannica's bounded historical overview of Roman emperors."),
  membershipBasis: "Julio-Claudian ja Flaviusten dynastioiden keisarit Augustus–Domitianus; rajattu yksiselitteiseen 11 henkilön joukkoon.",
  members: ["Augustus", "Tiberius", "Caligula", "Claudius", "Nero", "Galba", "Otho", "Vitellius", "Vespasianus", "Titus", "Domitianus"].map((name, index) => member(`roman-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä Rooman keisari ensimmäiseltä vuosisadalta.", ids: Array.from({ length: 11 }, (_, index) => `roman-${index + 1}`), tiers: { ten: ["roman-1", "roman-2", "roman-4", "roman-5"], fifteen: ["roman-9", "roman-10"], sixty: ["roman-3", "roman-11"], eightyFive: ["roman-6", "roman-8"], hundred: ["roman-7"] } }],
});

add({
  id: "history-ancient-civilisations",
  category: "maailmanhistoria",
  description: "Maailmanhistorian keskeiset muinaiset kulttuurit.",
  asOf: "2026-01-01",
  source: source("UNESCO — World Heritage and ancient civilisations", "https://whc.unesco.org/en/activities/", "UNESCO educational material on ancient civilisations and heritage."),
  membershipBasis: "Historiantutkimuksessa vakiintunut opetuksellinen joukko muinaisia kulttuureja; rajaus on nimetty tässä kahdeksaan laajasti tunnistettavaan kulttuuriin.",
  members: ["muinainen Egypti", "Mesopotamia", "muinainen Kreikka", "Rooman valtakunta", "Indus-kulttuuri", "muinainen Kiina", "maya-kulttuuri", "inkakulttuuri"].map((name, index) => member(`civilisation-${index + 1}`, name)),
  variants: [{ id: "all", prompt: "Nimeä muinainen kulttuuri tai valtakunta.", ids: Array.from({ length: 8 }, (_, index) => `civilisation-${index + 1}`), tiers: { ten: ["civilisation-1", "civilisation-3", "civilisation-4"], fifteen: ["civilisation-6"], sixty: ["civilisation-2", "civilisation-5"], eightyFive: ["civilisation-7"], hundred: ["civilisation-8"] } }],
});

type ExtensionVariant = Omit<Variant, "ids"> & { names: string[] };

function extendFamily(id: string, variants: ExtensionVariant[]) {
  const family = allFamilies.find((candidate) => candidate.id === id);
  if (!family) throw new Error(`Cannot extend unknown family ${id}`);
  const idsFor = (names: string[]) => names.map((name) => {
    const item = family.members.find((memberItem) => memberItem.canonical === name);
    if (!item) throw new Error(`${id} extension references unknown member ${name}`);
    return item.id;
  });
  family.variants.push(...variants.map((variant) => ({
    id: variant.id,
    prompt: variant.prompt,
    ids: idsFor(variant.names),
    familyId: variant.familyId,
    tiers: {
      ten: idsFor(variant.tiers.ten?.map((tierId) => family.members.find((memberItem) => memberItem.id === tierId)?.canonical ?? tierId) ?? []),
      fifteen: idsFor(variant.tiers.fifteen?.map((tierId) => family.members.find((memberItem) => memberItem.id === tierId)?.canonical ?? tierId) ?? []),
      sixty: idsFor(variant.tiers.sixty?.map((tierId) => family.members.find((memberItem) => memberItem.id === tierId)?.canonical ?? tierId) ?? []),
      eightyFive: idsFor(variant.tiers.eightyFive?.map((tierId) => family.members.find((memberItem) => memberItem.id === tierId)?.canonical ?? tierId) ?? []),
      hundred: idsFor(variant.tiers.hundred.map((tierId) => family.members.find((memberItem) => memberItem.id === tierId)?.canonical ?? tierId)),
    },
  })));
}

extendFamily("fi-cities", [
  { id: "capital-region", prompt: "Nimeä Suomen pääkaupunkiseudun kaupunki.", names: ["Helsinki", "Espoo", "Vantaa"], tiers: { ten: ["Helsinki"], fifteen: ["Espoo"], hundred: ["Vantaa"] } },
  { id: "university-cities", prompt: "Nimeä suomalainen yliopistokaupunki.", names: ["Helsinki", "Tampere", "Turku", "Oulu", "Jyväskylä", "Kuopio", "Joensuu", "Lahti"], tiers: { ten: ["Helsinki", "Tampere"], fifteen: ["Turku", "Oulu"], sixty: ["Jyväskylä", "Kuopio"], eightyFive: ["Joensuu"], hundred: ["Lahti"] } },
  { id: "western", prompt: "Nimeä Länsi-Suomen suuri kaupunki.", names: ["Turku", "Pori", "Tampere", "Oulu", "Lahti"], tiers: { ten: ["Tampere"], fifteen: ["Turku"], sixty: ["Pori"], eightyFive: ["Lahti"], hundred: ["Oulu"] } },
  { id: "eastern", prompt: "Nimeä Itä-Suomen suuri kaupunki.", names: ["Kuopio", "Joensuu", "Jyväskylä", "Lahti", "Kouvola"], tiers: { ten: ["Kuopio"], fifteen: ["Jyväskylä"], sixty: ["Lahti"], eightyFive: ["Joensuu"], hundred: ["Kouvola"] } },
  { id: "coastal", prompt: "Nimeä Suomen rannikkokaupunki.", names: ["Helsinki", "Espoo", "Turku", "Pori", "Oulu"], tiers: { ten: ["Helsinki", "Turku"], fifteen: ["Espoo", "Oulu"], sixty: ["Pori"], hundred: ["Oulu"] } },
]);

extendFamily("fi-national-landscapes", [
  { id: "south", prompt: "Nimeä Etelä-Suomen kansallismaisema.", names: ["Helsingin merellinen kansallismaisema", "Porvoonjokilaakso", "Lounaisrannikon kulttuurimaisemat", "Saaristomeri", "Vanajaveden laakso", "Tammerkoski"], tiers: { ten: ["Helsingin merellinen kansallismaisema"], fifteen: ["Saaristomeri"], sixty: ["Porvoonjokilaakso"], eightyFive: ["Vanajaveden laakso"], hundred: ["Tammerkoski"] } },
  { id: "lake-district", prompt: "Nimeä Järvi-Suomen kansallismaisema.", names: ["Hämeen järviylänkö", "Vanajaveden laakso", "Päijänteen seutu", "Olavinlinna ja Puruvesi", "Kolin kansallismaisema", "Saarijärven reitin kulttuurimaisemat"], tiers: { ten: ["Päijänteen seutu"], fifteen: ["Kolin kansallismaisema"], sixty: ["Hämeen järviylänkö"], eightyFive: ["Olavinlinna ja Puruvesi"], hundred: ["Saarijärven reitin kulttuurimaisemat"] } },
  { id: "ostrobothnia", prompt: "Nimeä Pohjanmaan kansallismaisema.", names: ["Pohjois-Satakunnan viljelylakeudet", "Kyrönjokilaakso", "Merenkurkun saaristo", "Limingan lakeus", "Pohjois-Pohjanmaan jokiseutu", "Etelä-Pohjanmaan lakeudet"], tiers: { ten: ["Merenkurkun saaristo"], fifteen: ["Etelä-Pohjanmaan lakeudet"], sixty: ["Kyrönjokilaakso"], eightyFive: ["Limingan lakeus"], hundred: ["Pohjois-Satakunnan viljelylakeudet"] } },
  { id: "north", prompt: "Nimeä Pohjois-Suomen kansallismaisema.", names: ["Oulujokilaakso", "Hailuoto", "Pohjois-Pohjanmaan jokiseutu", "Kalajokilaakso", "Tornionjokilaakso", "Ylläs–Pallas"], tiers: { ten: ["Hailuoto"], fifteen: ["Ylläs–Pallas"], sixty: ["Oulujokilaakso"], eightyFive: ["Tornionjokilaakso"], hundred: ["Kalajokilaakso"] } },
  { id: "eastern", prompt: "Nimeä Itä-Suomen kansallismaisema.", names: ["Kymijokilaakso", "Imatran koski", "Olavinlinna ja Puruvesi", "Kolin kansallismaisema", "Vaara-Karjalan maisemat", "Päijänteen seutu"], tiers: { ten: ["Kolin kansallismaisema"], fifteen: ["Imatran koski"], sixty: ["Päijänteen seutu"], eightyFive: ["Vaara-Karjalan maisemat"], hundred: ["Olavinlinna ja Puruvesi"] } },
]);

extendFamily("fi-recent-prime-ministers", [
  { id: "1990s", prompt: "Nimeä 1990-luvulla toiminut Suomen pääministeri.", names: ["Esko Aho", "Paavo Lipponen", "Harri Holkeri", "Kalevi Sorsa"], tiers: { ten: ["Paavo Lipponen"], fifteen: ["Esko Aho"], sixty: ["Harri Holkeri"], hundred: ["Kalevi Sorsa"] } },
  { id: "2000s", prompt: "Nimeä 2000-luvun alussa toiminut Suomen pääministeri.", names: ["Paavo Lipponen", "Anneli Jäätteenmäki", "Matti Vanhanen", "Jyrki Katainen", "Mari Kiviniemi"], tiers: { ten: ["Matti Vanhanen"], fifteen: ["Paavo Lipponen"], sixty: ["Jyrki Katainen"], eightyFive: ["Mari Kiviniemi"], hundred: ["Anneli Jäätteenmäki"] } },
  { id: "coalition", prompt: "Nimeä Suomen pääministeri 2010-luvulta.", names: ["Mari Kiviniemi", "Jyrki Katainen", "Alexander Stubb", "Juha Sipilä", "Antti Rinne", "Sanna Marin"], tiers: { ten: ["Sanna Marin"], fifteen: ["Juha Sipilä"], sixty: ["Alexander Stubb"], eightyFive: ["Antti Rinne"], hundred: ["Mari Kiviniemi"] } },
  { id: "female", prompt: "Nimeä Suomen naispuolinen pääministeri.", names: ["Anneli Jäätteenmäki", "Mari Kiviniemi", "Sanna Marin"], tiers: { ten: ["Sanna Marin"], fifteen: ["Mari Kiviniemi"], hundred: ["Anneli Jäätteenmäki"] } },
  { id: "recent", prompt: "Nimeä Suomessa 2020-luvulla toiminut pääministeri.", names: ["Sanna Marin", "Petteri Orpo", "Antti Rinne", "Juha Sipilä"], tiers: { ten: ["Petteri Orpo", "Sanna Marin"], fifteen: ["Juha Sipilä"], sixty: ["Antti Rinne"], hundred: ["Antti Rinne"] } },
]);

extendFamily("history-us-presidents", [
  { id: "founding", prompt: "Nimeä Yhdysvaltain varhainen presidentti.", names: ["George Washington", "John Adams", "Thomas Jefferson", "James Madison", "James Monroe"], tiers: { ten: ["George Washington", "Thomas Jefferson"], fifteen: ["John Adams"], sixty: ["James Madison"], hundred: ["James Monroe"] } },
  { id: "civil-war", prompt: "Nimeä Yhdysvaltain sisällissodan ajan presidentti.", names: ["Abraham Lincoln", "Andrew Johnson", "James Buchanan", "Ulysses S. Grant"], tiers: { ten: ["Abraham Lincoln"], fifteen: ["Ulysses S. Grant"], sixty: ["Andrew Johnson"], hundred: ["James Buchanan"] } },
  { id: "postwar", prompt: "Nimeä toisen maailmansodan jälkeinen Yhdysvaltain presidentti.", names: ["Harry S. Truman", "Dwight D. Eisenhower", "John F. Kennedy", "Lyndon B. Johnson", "Richard Nixon"], tiers: { ten: ["John F. Kennedy"], fifteen: ["Dwight D. Eisenhower"], sixty: ["Harry S. Truman"], eightyFive: ["Lyndon B. Johnson"], hundred: ["Richard Nixon"] } },
  { id: "modern", prompt: "Nimeä Yhdysvaltain presidentti vuoden 1980 jälkeen.", names: ["Ronald Reagan", "George H. W. Bush", "Bill Clinton", "George W. Bush", "Barack Obama", "Donald Trump", "Joe Biden"], tiers: { ten: ["Barack Obama", "Donald Trump"], fifteen: ["Ronald Reagan", "Bill Clinton"], sixty: ["Joe Biden", "George W. Bush"], eightyFive: ["George H. W. Bush"], hundred: ["Joe Biden"] } },
  { id: "james-john", prompt: "Nimeä Yhdysvaltain presidentti, jonka etunimi on James tai John.", names: ["John Adams", "James Madison", "James Monroe", "John Quincy Adams", "John Tyler"], tiers: { ten: ["John Adams", "James Madison"], fifteen: ["John Quincy Adams"], sixty: ["James Monroe"], hundred: ["John Tyler"] } },
]);

extendFamily("major-rivers", [
  { id: "asia", prompt: "Nimeä Aasian suuri joki.", names: ["Jangtse", "Keltainenjoki", "Mekong", "Ganges", "Ob"], tiers: { ten: ["Jangtse"], fifteen: ["Ganges"], sixty: ["Mekong"], eightyFive: ["Keltainenjoki"], hundred: ["Ob"] } },
  { id: "americas", prompt: "Nimeä Amerikan suuren jokijärjestelmän joki.", names: ["Amazon", "Mississippi", "Paraná", "Kongo"], tiers: { ten: ["Amazon", "Mississippi"], fifteen: ["Paraná"], sixty: ["Kongo"], hundred: ["Kongo"] } },
  { id: "europe", prompt: "Nimeä Euroopan suuri joki.", names: ["Tonava", "Volga", "Eufrat", "Ob", "Kongo"], tiers: { ten: ["Tonava", "Volga"], fifteen: ["Eufrat"], sixty: ["Ob"], hundred: ["Kongo"] } },
  { id: "africa", prompt: "Nimeä Afrikan suuri joki.", names: ["Niili", "Kongo", "Amazon", "Ganges"], tiers: { ten: ["Niili"], fifteen: ["Kongo"], sixty: ["Amazon"], hundred: ["Ganges"] } },
  { id: "familiar", prompt: "Nimeä maantiedosta tuttu suurjoki.", names: ["Amazon", "Niili", "Jangtse", "Mississippi", "Tonava", "Volga"], tiers: { ten: ["Amazon", "Niili"], fifteen: ["Mississippi", "Tonava"], sixty: ["Jangtse"], eightyFive: ["Volga"], hundred: ["Volga"] } },
]);

extendFamily("international-organisations", [
  { id: "health", prompt: "Nimeä YK-järjestelmään liittyvä terveysalan toimija.", names: ["WHO", "UNICEF", "UNHCR", "FAO", "WFP"], tiers: { ten: ["WHO", "UNICEF"], fifteen: ["FAO"], sixty: ["UNHCR"], hundred: ["WFP"] } },
  { id: "development", prompt: "Nimeä kansainvälinen kehitysyhteistyön toimija.", names: ["Maailmanpankki", "UNDP", "UNICEF", "FAO", "UNEP"], tiers: { ten: ["Maailmanpankki", "UNICEF"], fifteen: ["UNDP"], sixty: ["FAO"], eightyFive: ["UNEP"], hundred: ["UNEP"] } },
  { id: "finance", prompt: "Nimeä kansainvälinen talous- tai rahoitusjärjestö.", names: ["IMF", "Maailmanpankki", "WTO", "FAO", "IAEA"], tiers: { ten: ["IMF", "Maailmanpankki"], fifteen: ["WTO"], sixty: ["IAEA"], hundred: ["FAO"] } },
  { id: "un-programmes", prompt: "Nimeä YK:n ohjelma tai rahasto.", names: ["UNICEF", "UNHCR", "UNDP", "UNEP", "WFP"], tiers: { ten: ["UNICEF"], fifteen: ["UNHCR"], sixty: ["UNDP"], eightyFive: ["UNEP"], hundred: ["WFP"] } },
  { id: "specialised", prompt: "Nimeä YK:n erityisjärjestö.", names: ["WHO", "FAO", "ILO", "IMF", "IAEA"], tiers: { ten: ["WHO", "IMF"], fifteen: ["FAO"], sixty: ["ILO"], eightyFive: ["IAEA"], hundred: ["ILO"] } },
]);

extendFamily("science-geological-periods", [
  { id: "paleozoic", prompt: "Nimeä paleotsooinen geologinen kausi.", names: ["kambrikausi", "ordovikikausi", "siluurikausi", "devonikausi", "hiilikausi", "permikausi"], tiers: { ten: ["hiilikausi"], fifteen: ["permikausi"], sixty: ["devonikausi"], eightyFive: ["siluurikausi"], hundred: ["ordovikikausi"] } },
  { id: "mesozoic", prompt: "Nimeä mesotsooinen geologinen kausi.", names: ["triaskausi", "jurakausi", "liitukausi"], tiers: { ten: ["jurakausi"], fifteen: ["liitukausi"], hundred: ["triaskausi"] } },
  { id: "cenozoic", prompt: "Nimeä kenotsooinen geologinen ajanjakso.", names: ["paleogeenikausi", "neogeenikausi", "kvartäärikausi"], tiers: { ten: ["kvartäärikausi"], fifteen: ["neogeenikausi"], hundred: ["paleogeenikausi"] } },
  { id: "dinosaur", prompt: "Nimeä dinosaurusten aikakauteen liittyvä geologinen kausi.", names: ["triaskausi", "jurakausi", "liitukausi", "permikausi"], tiers: { ten: ["jurakausi"], fifteen: ["liitukausi"], sixty: ["triaskausi"], hundred: ["permikausi"] } },
  { id: "early", prompt: "Nimeä geologisen ajanlaskun varhainen kausi.", names: ["kambrikausi", "ordovikikausi", "siluurikausi", "devonikausi", "permikausi"], tiers: { ten: ["permikausi"], fifteen: ["devonikausi"], sixty: ["kambrikausi"], hundred: ["siluurikausi"] } },
]);

extendFamily("science-vitamins", [
  { id: "fat-soluble", prompt: "Nimeä rasvaliukoinen vitamiini.", names: ["A-vitamiini", "D-vitamiini", "E-vitamiini", "K-vitamiini"], tiers: { ten: ["D-vitamiini"], fifteen: ["A-vitamiini"], sixty: ["E-vitamiini"], hundred: ["K-vitamiini"] } },
  { id: "b-group", prompt: "Nimeä B-ryhmän vitamiini.", names: ["B1-vitamiini", "B2-vitamiini", "B3-vitamiini", "B5-vitamiini", "B6-vitamiini", "B7-vitamiini", "B9-vitamiini", "B12-vitamiini"], tiers: { ten: ["B12-vitamiini"], fifteen: ["B6-vitamiini"], sixty: ["B1-vitamiini", "B2-vitamiini"], eightyFive: ["B5-vitamiini", "B7-vitamiini"], hundred: ["B9-vitamiini"] } },
  { id: "common", prompt: "Nimeä arjessa tunnettu vitamiini.", names: ["A-vitamiini", "C-vitamiini", "D-vitamiini", "E-vitamiini", "B12-vitamiini"], tiers: { ten: ["C-vitamiini", "D-vitamiini"], fifteen: ["A-vitamiini"], sixty: ["E-vitamiini"], hundred: ["B12-vitamiini"] } },
  { id: "food", prompt: "Nimeä ravinnosta saatava vitamiini.", names: ["A-vitamiini", "B1-vitamiini", "C-vitamiini", "D-vitamiini", "K-vitamiini"], tiers: { ten: ["C-vitamiini"], fifteen: ["D-vitamiini"], sixty: ["A-vitamiini"], eightyFive: ["K-vitamiini"], hundred: ["B1-vitamiini"] } },
  { id: "numbered", prompt: "Nimeä numeroitu vitamiini.", names: ["B1-vitamiini", "B2-vitamiini", "B3-vitamiini", "B6-vitamiini", "B12-vitamiini"], tiers: { ten: ["B12-vitamiini"], fifteen: ["B6-vitamiini"], sixty: ["B1-vitamiini"], eightyFive: ["B3-vitamiini"], hundred: ["B2-vitamiini"] } },
]);

extendFamily("nature-finnish-game-animals", [
  { id: "large-mammals", prompt: "Nimeä Suomen suuri riistanisäkäs.", names: ["hirvi", "valkohäntäpeura", "villisika", "susi", "ilves", "karhu"], tiers: { ten: ["hirvi"], fifteen: ["karhu", "susi"], sixty: ["ilves"], eightyFive: ["villisika"], hundred: ["valkohäntäpeura"] } },
  { id: "ungulates", prompt: "Nimeä Suomessa tavattava sorkkaeläinriista.", names: ["hirvi", "metsäkauris", "valkohäntäpeura", "villisika"], tiers: { ten: ["hirvi"], fifteen: ["metsäkauris"], sixty: ["villisika"], hundred: ["valkohäntäpeura"] } },
  { id: "predators", prompt: "Nimeä Suomessa tavattava riistapeto.", names: ["kettu", "susi", "ilves", "karhu"], tiers: { ten: ["kettu", "karhu"], fifteen: ["susi"], sixty: ["ilves"], hundred: ["karhu"] } },
  { id: "forest-birds", prompt: "Nimeä suomalainen metsäkanalintu.", names: ["metso", "teeri", "sinisorsa", "hanhi"], tiers: { ten: ["metso"], fifteen: ["teeri"], sixty: ["sinisorsa"], hundred: ["hanhi"] } },
  { id: "hares", prompt: "Nimeä Suomessa tavattava jänislaji.", names: ["metsäjänis", "rusakko", "kettu", "villisika"], tiers: { ten: ["metsäjänis"], fifteen: ["rusakko"], sixty: ["kettu"], hundred: ["villisika"] } },
]);

extendFamily("literature-booker-2010s", [
  { id: "mantel", prompt: "Nimeä Hilary Mantelin Booker-voittajaromaani.", names: ["Hilary Mantel", "Eleanor Catton", "Richard Flanagan", "Paul Beatty", "Anna Burns"], tiers: { ten: ["Hilary Mantel"], fifteen: ["Anna Burns"], sixty: ["Richard Flanagan"], eightyFive: ["Paul Beatty"], hundred: ["Eleanor Catton"] } },
  { id: "recent", prompt: "Nimeä 2020-luvulla Booker-palkittu kirjailija.", names: ["Douglas Stuart", "Damon Galgut", "Shehan Karunatilaka", "Paul Lynch", "Samantha Harvey"], tiers: { ten: ["Paul Lynch", "Samantha Harvey"], fifteen: ["Douglas Stuart"], sixty: ["Damon Galgut"], eightyFive: ["Shehan Karunatilaka"], hundred: ["Samantha Harvey"] } },
  { id: "women", prompt: "Nimeä Booker-palkinnon voittanut naiskirjailija.", names: ["Hilary Mantel", "Eleanor Catton", "Anna Burns", "Margaret Atwood", "Bernardine Evaristo", "Samantha Harvey"], tiers: { ten: ["Margaret Atwood", "Hilary Mantel"], fifteen: ["Anna Burns"], sixty: ["Eleanor Catton"], eightyFive: ["Bernardine Evaristo"], hundred: ["Samantha Harvey"] } },
  { id: "translated", prompt: "Nimeä kansainvälisesti tunnettu Booker-voittaja.", names: ["Richard Flanagan", "Marlon James", "Paul Beatty", "Damon Galgut", "Shehan Karunatilaka"], tiers: { ten: ["Richard Flanagan"], fifteen: ["Marlon James"], sixty: ["Paul Beatty"], eightyFive: ["Damon Galgut"], hundred: ["Shehan Karunatilaka"] } },
  { id: "authors", prompt: "Nimeä Booker-palkinnon voittanut kirjailija.", names: ["Howard Jacobson", "Julian Barnes", "Hilary Mantel", "Marlon James", "George Saunders", "Margaret Atwood"], tiers: { ten: ["Margaret Atwood", "Julian Barnes"], fifteen: ["Hilary Mantel"], sixty: ["Howard Jacobson"], eightyFive: ["Marlon James"], hundred: ["George Saunders"] } },
]);

extendFamily("language-finnish-cases", [
  { id: "basic", prompt: "Nimeä suomen kieliopin perussijamuoto.", names: ["nominatiivi", "genetiivi", "akkusatiivi", "partitiivi", "essiivi", "translatiivi"], tiers: { ten: ["nominatiivi", "partitiivi"], fifteen: ["genetiivi"], sixty: ["akkusatiivi"], eightyFive: ["essiivi"], hundred: ["translatiivi"] } },
  { id: "inessive", prompt: "Nimeä suomen kielen paikallissija.", names: ["inessiivi", "elatiivi", "illatiivi", "adessiivi", "ablatiivi", "allatiivi"], tiers: { ten: ["inessiivi", "adessiivi"], fifteen: ["elatiivi"], sixty: ["illatiivi"], eightyFive: ["ablatiivi"], hundred: ["allatiivi"] } },
  { id: "internal", prompt: "Nimeä suomen kielen sisäpaikallissija.", names: ["inessiivi", "elatiivi", "illatiivi"], tiers: { ten: ["inessiivi"], fifteen: ["elatiivi"], hundred: ["illatiivi"] } },
  { id: "external", prompt: "Nimeä suomen kielen ulkopaikallissija.", names: ["adessiivi", "ablatiivi", "allatiivi"], tiers: { ten: ["adessiivi"], fifteen: ["ablatiivi"], hundred: ["allatiivi"] } },
  { id: "rare", prompt: "Nimeä suomen kielen harvinaisempi sijamuoto.", names: ["abessiivi", "komitatiivi", "instruktiivi", "essiivi", "translatiivi"], tiers: { ten: ["essiivi"], fifteen: ["translatiivi"], sixty: ["abessiivi"], eightyFive: ["komitatiivi"], hundred: ["instruktiivi"] } },
]);

extendFamily("art-modern-movements", [
  { id: "avant-garde", prompt: "Nimeä modernin taiteen avantgardistinen suuntaus.", names: ["futurismi", "dada", "surrealismi", "kubismi", "ekspressionismi"], tiers: { ten: ["surrealismi", "kubismi"], fifteen: ["ekspressionismi"], sixty: ["dada"], hundred: ["futurismi"] } },
  { id: "color", prompt: "Nimeä väriin ja havaintoon liittyvä taidesuuntaus.", names: ["impressionismi", "postimpressionismi", "fauvismi", "ekspressionismi", "pop-taide"], tiers: { ten: ["impressionismi"], fifteen: ["ekspressionismi"], sixty: ["postimpressionismi"], eightyFive: ["fauvismi"], hundred: ["pop-taide"] } },
  { id: "abstract", prompt: "Nimeä abstraktiin taiteeseen liittyvä suuntaus.", names: ["kubismi", "abstrakti ekspressionismi", "minimalismi", "konseptualismi", "dada"], tiers: { ten: ["kubismi"], fifteen: ["minimalismi"], sixty: ["abstrakti ekspressionismi"], eightyFive: ["konseptualismi"], hundred: ["dada"] } },
  { id: "postwar", prompt: "Nimeä toisen maailmansodan jälkeinen taidesuuntaus.", names: ["abstrakti ekspressionismi", "pop-taide", "minimalismi", "konseptualismi", "surrealismi"], tiers: { ten: ["pop-taide"], fifteen: ["minimalismi"], sixty: ["surrealismi"], eightyFive: ["konseptualismi"], hundred: ["abstrakti ekspressionismi"] } },
  { id: "early-modern", prompt: "Nimeä 1900-luvun alun taidesuuntaus.", names: ["fauvismi", "kubismi", "ekspressionismi", "dada", "futurismi"], tiers: { ten: ["kubismi", "ekspressionismi"], fifteen: ["fauvismi"], sixty: ["dada"], hundred: ["futurismi"] } },
]);

extendFamily("music-queen-albums", [
  { id: "early", prompt: "Nimeä Queenin 1970-luvun albumi.", names: ["Queen", "Queen II", "Sheer Heart Attack", "A Night at the Opera", "A Day at the Races", "News of the World", "Jazz"], tiers: { ten: ["A Night at the Opera"], fifteen: ["News of the World"], sixty: ["Sheer Heart Attack"], eightyFive: ["Queen II"], hundred: ["Jazz"] } },
  { id: "eighties", prompt: "Nimeä Queenin 1980-luvun albumi.", names: ["The Game", "Flash Gordon", "Hot Space", "The Works", "A Kind of Magic"], tiers: { ten: ["The Game"], fifteen: ["A Kind of Magic"], sixty: ["The Works"], eightyFive: ["Hot Space"], hundred: ["Flash Gordon"] } },
  { id: "late", prompt: "Nimeä Queenin myöhempi studioalbumi.", names: ["The Miracle", "Innuendo", "Made in Heaven", "A Kind of Magic"], tiers: { ten: ["Innuendo"], fifteen: ["Made in Heaven"], sixty: ["The Miracle"], hundred: ["A Kind of Magic"] } },
  { id: "classic", prompt: "Nimeä Queenin klassinen albumi.", names: ["A Night at the Opera", "News of the World", "The Game", "Queen", "Sheer Heart Attack"], tiers: { ten: ["A Night at the Opera"], fifteen: ["News of the World"], sixty: ["The Game"], eightyFive: ["Sheer Heart Attack"], hundred: ["Queen"] } },
  { id: "title", prompt: "Nimeä Queen-albumi, jonka nimessä ei ole sanaa Queen.", names: ["A Night at the Opera", "News of the World", "The Game", "Innuendo", "Made in Heaven"], tiers: { ten: ["A Night at the Opera"], fifteen: ["The Game"], sixty: ["News of the World"], eightyFive: ["Made in Heaven"], hundred: ["Innuendo"] } },
]);

extendFamily("music-grammy-album-of-year", [
  { id: "2010s", prompt: "Nimeä 2010-luvun Grammyn vuoden albumi.", names: ["21", "Random Access Memories", "Morning Phase", "1989", "25", "Golden Hour"], tiers: { ten: ["21"], fifteen: ["1989"], sixty: ["Random Access Memories"], eightyFive: ["Morning Phase"], hundred: ["Golden Hour"] } },
  { id: "2020s", prompt: "Nimeä 2020-luvun Grammyn vuoden albumi.", names: ["When We All Fall Asleep, Where Do We Go?", "Folklore", "We Are", "Harry's House", "Midnights", "Cowboy Carter"], tiers: { ten: ["Folklore"], fifteen: ["Harry's House"], sixty: ["Midnights"], eightyFive: ["We Are"], hundred: ["Cowboy Carter"] } },
  { id: "women", prompt: "Nimeä naisen esittämä Grammyn vuoden albumi.", names: ["Fearless", "21", "1989", "Folklore", "Midnights", "Cowboy Carter"], tiers: { ten: ["21", "1989"], fifteen: ["Folklore"], sixty: ["Fearless"], eightyFive: ["Midnights"], hundred: ["Cowboy Carter"] } },
  { id: "pop", prompt: "Nimeä pop-albumi, joka voitti Grammyn vuoden albumin.", names: ["Fearless", "1989", "Folklore", "Harry's House", "Midnights"], tiers: { ten: ["1989", "Folklore"], fifteen: ["Fearless"], sixty: ["Harry's House"], hundred: ["Midnights"] } },
  { id: "recent", prompt: "Nimeä tuore Grammy-palkittu vuoden albumi.", names: ["We Are", "Harry's House", "Midnights", "Cowboy Carter", "Folklore"], tiers: { ten: ["Harry's House"], fifteen: ["Folklore"], sixty: ["Midnights"], eightyFive: ["We Are"], hundred: ["Cowboy Carter"] } },
]);

extendFamily("film-pixar-features", [
  { id: "early", prompt: "Nimeä Pixarin varhainen pitkä elokuva.", names: ["Toy Story", "A Bug's Life", "Toy Story 2", "Monsters, Inc.", "Finding Nemo"], tiers: { ten: ["Toy Story"], fifteen: ["Finding Nemo"], sixty: ["Monsters, Inc."], eightyFive: ["A Bug's Life"], hundred: ["Toy Story 2"] } },
  { id: "2000s", prompt: "Nimeä 2000-luvun Pixarin pitkä elokuva.", names: ["The Incredibles", "Cars", "Ratatouille", "WALL-E", "Up", "Toy Story 3", "Brave"], tiers: { ten: ["The Incredibles", "Up"], fifteen: ["Cars"], sixty: ["Ratatouille"], eightyFive: ["WALL-E"], hundred: ["Brave"] } },
  { id: "2010s", prompt: "Nimeä 2010-luvun Pixarin pitkä elokuva.", names: ["Toy Story 3", "Brave", "Inside Out", "Coco", "Toy Story 4", "Onward", "The Incredibles"], tiers: { ten: ["Inside Out", "Coco"], fifteen: ["Toy Story 3"], sixty: ["Brave"], eightyFive: ["Onward"], hundred: ["The Incredibles"] } },
  { id: "recent", prompt: "Nimeä Pixarin 2020-luvun elokuva.", names: ["Soul", "Luca", "Turning Red", "Lightyear", "Elemental", "Inside Out 2", "Elio"], tiers: { ten: ["Inside Out 2", "Elemental"], fifteen: ["Soul"], sixty: ["Luca"], eightyFive: ["Turning Red"], hundred: ["Elio"] } },
  { id: "toy-story", prompt: "Nimeä Toy Story -elokuva.", names: ["Toy Story", "Toy Story 2", "Toy Story 3", "Toy Story 4", "Lightyear"], tiers: { ten: ["Toy Story", "Toy Story 3"], fifteen: ["Toy Story 2"], sixty: ["Toy Story 4"], hundred: ["Lightyear"] } },
]);

extendFamily("film-harry-potter", [
  { id: "early", prompt: "Nimeä Harry Potter -sarjan varhainen elokuva.", names: ["Viisasten kivi", "Salaisuuksien kammio", "Azkabanin vanki", "Liekehtivä pikari"], tiers: { ten: ["Viisasten kivi"], fifteen: ["Azkabanin vanki"], sixty: ["Salaisuuksien kammio"], hundred: ["Liekehtivä pikari"] } },
  { id: "middle", prompt: "Nimeä Harry Potter -sarjan keskivaiheen elokuva.", names: ["Azkabanin vanki", "Liekehtivä pikari", "Feeniksin kilta", "Puoliverinen prinssi"], tiers: { ten: ["Liekehtivä pikari"], fifteen: ["Feeniksin kilta"], sixty: ["Azkabanin vanki"], hundred: ["Puoliverinen prinssi"] } },
  { id: "final", prompt: "Nimeä Harry Potter -sarjan viimeinen elokuva.", names: ["Puoliverinen prinssi", "Kuoleman varjelukset – osa 1", "Kuoleman varjelukset – osa 2", "Feeniksin kilta"], tiers: { ten: ["Kuoleman varjelukset – osa 2"], fifteen: ["Puoliverinen prinssi"], sixty: ["Kuoleman varjelukset – osa 1"], hundred: ["Feeniksin kilta"] } },
  { id: "title", prompt: "Nimeä Tylypahkaan sijoittuva Harry Potter -elokuva.", names: ["Viisasten kivi", "Azkabanin vanki", "Liekehtivä pikari", "Feeniksin kilta", "Puoliverinen prinssi"], tiers: { ten: ["Viisasten kivi"], fifteen: ["Liekehtivä pikari"], sixty: ["Azkabanin vanki"], eightyFive: ["Feeniksin kilta"], hundred: ["Puoliverinen prinssi"] } },
  { id: "late", prompt: "Nimeä Harry Potter -sarjan myöhäinen elokuva.", names: ["Puoliverinen prinssi", "Feeniksin kilta", "Kuoleman varjelukset – osa 1", "Kuoleman varjelukset – osa 2"], tiers: { ten: ["Kuoleman varjelukset – osa 2"], fifteen: ["Puoliverinen prinssi"], sixty: ["Feeniksin kilta"], hundred: ["Kuoleman varjelukset – osa 1"] } },
]);

extendFamily("sport-champions-league-winners", [
  { id: "iberia", prompt: "Nimeä Iberian niemimaan Mestarien liigan voittanut seura.", names: ["Real Madrid", "Barcelona", "Porto", "Benfica"], tiers: { ten: ["Real Madrid", "Barcelona"], fifteen: ["Porto"], hundred: ["Benfica"] } },
  { id: "england", prompt: "Nimeä Mestarien liigan voittanut englantilaisseura.", names: ["Liverpool", "Manchester United", "Chelsea", "Manchester City", "Aston Villa"], tiers: { ten: ["Manchester United"], fifteen: ["Liverpool"], sixty: ["Chelsea"], eightyFive: ["Manchester City"], hundred: ["Aston Villa"] } },
  { id: "italy", prompt: "Nimeä Mestarien liigan voittanut italialaisseura.", names: ["Milan", "Inter", "Juventus"], tiers: { ten: ["Milan"], fifteen: ["Inter"], hundred: ["Juventus"] } },
  { id: "2000s", prompt: "Nimeä 2000-luvulla Mestarien liigan voittanut seura.", names: ["Bayern München", "Borussia Dortmund", "Barcelona", "Chelsea", "Real Madrid"], tiers: { ten: ["Barcelona", "Real Madrid"], fifteen: ["Bayern München"], sixty: ["Chelsea"], hundred: ["Borussia Dortmund"] } },
  { id: "historic", prompt: "Nimeä Euroopan cupin tai Mestarien liigan historiallinen voittaja.", names: ["Real Madrid", "Ajax", "Benfica", "Nottingham Forest", "Feyenoord", "Celtic"], tiers: { ten: ["Real Madrid", "Ajax"], fifteen: ["Benfica"], sixty: ["Celtic"], eightyFive: ["Feyenoord"], hundred: ["Nottingham Forest"] } },
]);

extendFamily("sport-grand-slam-tournaments", [
  { id: "tournaments", prompt: "Nimeä yksi tenniksen neljästä Grand Slam -kilpailusta.", names: ["Australian Open", "Ranskan avoimet", "Wimbledon", "US Open"], tiers: { ten: ["Wimbledon"], fifteen: ["US Open"], sixty: ["Australian Open"], hundred: ["Ranskan avoimet"] } },
  { id: "hard-court", prompt: "Nimeä kovalla kentällä pelattava Grand Slam -turnaus.", names: ["Australian Open", "US Open", "Wimbledon", "Ranskan avoimet"], tiers: { ten: ["US Open"], fifteen: ["Australian Open"], sixty: ["Wimbledon"], hundred: ["Ranskan avoimet"] } },
  { id: "grass", prompt: "Nimeä nurmella pelattava Grand Slam -turnaus.", names: ["Wimbledon", "Australian Open", "US Open"], tiers: { ten: ["Wimbledon"], fifteen: ["US Open"], hundred: ["Australian Open"] } },
  { id: "clay", prompt: "Nimeä massakentällä pelattava Grand Slam -turnaus.", names: ["Ranskan avoimet", "Wimbledon", "US Open"], tiers: { ten: ["Ranskan avoimet"], fifteen: ["US Open"], hundred: ["Wimbledon"] } },
  { id: "singles", prompt: "Nimeä Grand Slam -turnauksen kaksinpelikilpailu.", names: ["Australian Openin kaksinpeli", "Ranskan avointen kaksinpeli", "Wimbledonin kaksinpeli", "US Openin kaksinpeli"], tiers: { ten: ["Wimbledonin kaksinpeli"], fifteen: ["US Openin kaksinpeli"], sixty: ["Australian Openin kaksinpeli"], hundred: ["Ranskan avointen kaksinpeli"] } },
]);

extendFamily("tech-windows-releases", [
  { id: "classic", prompt: "Nimeä klassinen Windows-versio.", names: ["Windows 1.0", "Windows 3.1", "Windows 95", "Windows 98", "Windows 2000"], tiers: { ten: ["Windows 95"], fifteen: ["Windows 98"], sixty: ["Windows 3.1"], eightyFive: ["Windows 2000"], hundred: ["Windows 1.0"] } },
  { id: "xp-era", prompt: "Nimeä Windows XP:n aikakauden Windows-versio.", names: ["Windows 2000", "Windows XP", "Windows Vista", "Windows 7"], tiers: { ten: ["Windows XP"], fifteen: ["Windows 7"], sixty: ["Windows Vista"], hundred: ["Windows 2000"] } },
  { id: "modern", prompt: "Nimeä Windowsin moderni työpöytäversio.", names: ["Windows 7", "Windows 8", "Windows 8.1", "Windows 10", "Windows 11"], tiers: { ten: ["Windows 10", "Windows 11"], fifteen: ["Windows 7"], sixty: ["Windows 8"], hundred: ["Windows 8.1"] } },
  { id: "numbered", prompt: "Nimeä numeroitu Windows-versio.", names: ["Windows 95", "Windows 98", "Windows 2000", "Windows 7", "Windows 10", "Windows 11"], tiers: { ten: ["Windows 10", "Windows 11"], fifteen: ["Windows 7"], sixty: ["Windows 98"], eightyFive: ["Windows 2000"], hundred: ["Windows 95"] } },
  { id: "recent", prompt: "Nimeä Windows-versio 2010-luvulta tai myöhemmin.", names: ["Windows 7", "Windows 8", "Windows 8.1", "Windows 10", "Windows 11"], tiers: { ten: ["Windows 10", "Windows 11"], fifteen: ["Windows 7"], sixty: ["Windows 8"], eightyFive: ["Windows 8.1"], hundred: ["Windows 7"] } },
]);

extendFamily("economics-stock-indices", [
  { id: "us", prompt: "Nimeä yhdysvaltalainen osakeindeksi.", names: ["S&P 500", "Dow Jones Industrial Average", "Nasdaq Composite"], tiers: { ten: ["S&P 500", "Dow Jones Industrial Average"], fifteen: ["Nasdaq Composite"], hundred: ["Nasdaq Composite"] } },
  { id: "europe", prompt: "Nimeä eurooppalainen osakeindeksi.", names: ["DAX", "FTSE 100", "CAC 40", "OMX Helsinki 25", "Euro Stoxx 50"], tiers: { ten: ["FTSE 100", "DAX"], fifteen: ["Euro Stoxx 50"], sixty: ["CAC 40"], eightyFive: ["OMX Helsinki 25"], hundred: ["CAC 40"] } },
  { id: "asia", prompt: "Nimeä aasialainen osakeindeksi.", names: ["Nikkei 225", "Hang Seng", "S&P 500", "DAX"], tiers: { ten: ["Nikkei 225"], fifteen: ["Hang Seng"], sixty: ["DAX"], hundred: ["Hang Seng"] } },
  { id: "named", prompt: "Nimeä osakeindeksi, joka tunnetaan kirjainlyhenteellä tai lyhyellä nimellä.", names: ["S&P 500", "DAX", "CAC 40", "FTSE 100", "OMX Helsinki 25"], tiers: { ten: ["S&P 500"], fifteen: ["DAX"], sixty: ["FTSE 100"], eightyFive: ["CAC 40"], hundred: ["OMX Helsinki 25"] } },
  { id: "broad", prompt: "Nimeä laajasti seurattu osakeindeksi.", names: ["S&P 500", "Dow Jones Industrial Average", "FTSE 100", "Nikkei 225", "DAX"], tiers: { ten: ["S&P 500", "Dow Jones Industrial Average"], fifteen: ["Nikkei 225"], sixty: ["DAX"], hundred: ["FTSE 100"] } },
]);

extendFamily("food-finnish-breads", [
  { id: "rye", prompt: "Nimeä suomalainen ruisleipä tai rukiinen leivonnainen.", names: ["ruisleipä", "kalakukko", "rieska", "limppu", "näkkileipä"], tiers: { ten: ["ruisleipä"], fifteen: ["kalakukko"], sixty: ["rieska"], eightyFive: ["näkkileipä"], hundred: ["limppu"] } },
  { id: "pastry", prompt: "Nimeä suomalainen makea leivonnainen.", names: ["pulla", "laskiaispulla", "Runebergintorttu", "mustikkapiirakka", "kainuulainen rönttönen"], tiers: { ten: ["pulla"], fifteen: ["mustikkapiirakka"], sixty: ["laskiaispulla"], eightyFive: ["Runebergintorttu"], hundred: ["kainuulainen rönttönen"] } },
  { id: "regional", prompt: "Nimeä suomalainen alueellinen perinneleipä.", names: ["karjalanpiirakka", "kalakukko", "rieska", "vatruska", "kainuulainen rönttönen"], tiers: { ten: ["karjalanpiirakka"], fifteen: ["kalakukko"], sixty: ["rieska"], eightyFive: ["vatruska"], hundred: ["kainuulainen rönttönen"] } },
  { id: "everyday", prompt: "Nimeä suomalaisessa arjessa tuttu leipä.", names: ["ruisleipä", "näkkileipä", "limppu", "rieska", "pulla"], tiers: { ten: ["ruisleipä"], fifteen: ["pulla"], sixty: ["näkkileipä"], eightyFive: ["rieska"], hundred: ["limppu"] } },
  { id: "named", prompt: "Nimeä suomalainen perinneleipä tai -leivonnainen.", names: ["karjalanpiirakka", "kalakukko", "Runebergintorttu", "vatruska", "mustikkapiirakka"], tiers: { ten: ["karjalanpiirakka"], fifteen: ["kalakukko"], sixty: ["mustikkapiirakka"], eightyFive: ["Runebergintorttu"], hundred: ["vatruska"] } },
]);

extendFamily("food-protected-cheeses", [
  { id: "italy", prompt: "Nimeä italialainen suojattu juusto.", names: ["Parmigiano Reggiano", "Gorgonzola", "Mozzarella di Bufala Campana", "Feta"], tiers: { ten: ["Parmigiano Reggiano"], fifteen: ["Gorgonzola"], sixty: ["Mozzarella di Bufala Campana"], hundred: ["Feta"] } },
  { id: "france", prompt: "Nimeä ranskalainen suojattu juusto.", names: ["Roquefort", "Brie de Meaux", "Camembert de Normandie", "Comté"], tiers: { ten: ["Roquefort"], fifteen: ["Comté"], sixty: ["Brie de Meaux"], hundred: ["Camembert de Normandie"] } },
  { id: "spain", prompt: "Nimeä espanjalainen suojattu juusto.", names: ["Manchego", "Queso Manchego", "Ossau-Iraty", "Roquefort"], tiers: { ten: ["Manchego"], fifteen: ["Queso Manchego"], sixty: ["Ossau-Iraty"], hundred: ["Roquefort"] } },
  { id: "blue", prompt: "Nimeä sinihomejuusto.", names: ["Gorgonzola", "Roquefort", "Stilton", "Feta"], tiers: { ten: ["Gorgonzola"], fifteen: ["Roquefort"], sixty: ["Stilton"], hundred: ["Feta"] } },
  { id: "familiar", prompt: "Nimeä eurooppalainen suojattu juusto.", names: ["Parmigiano Reggiano", "Feta", "Gruyère", "Manchego", "Roquefort", "Gorgonzola"], tiers: { ten: ["Feta", "Parmigiano Reggiano"], fifteen: ["Gruyère", "Manchego"], sixty: ["Gorgonzola"], eightyFive: ["Roquefort"], hundred: ["Gruyère"] } },
]);

extendFamily("world-world-heritage-regions", [
  { id: "continents", prompt: "Nimeä UNESCO:n maailmanperinnön alueellinen ryhmä.", names: ["Eurooppa", "Aasia", "Afrikka", "Pohjois-Amerikka", "Latinalainen Amerikka", "Karibia"], tiers: { ten: ["Eurooppa", "Aasia"], fifteen: ["Afrikka"], sixty: ["Latinalainen Amerikka"], eightyFive: ["Pohjois-Amerikka"], hundred: ["Karibia"] } },
  { id: "americas", prompt: "Nimeä UNESCO:n Amerikan aluejaon osa.", names: ["Latinalainen Amerikka", "Karibia", "Pohjois-Amerikka", "Tyynimeri"], tiers: { ten: ["Latinalainen Amerikka"], fifteen: ["Pohjois-Amerikka"], sixty: ["Karibia"], hundred: ["Tyynimeri"] } },
  { id: "asia", prompt: "Nimeä UNESCO:n Aasian aluejaon osa.", names: ["Aasia", "Keski-Aasia", "Etelä-Aasia", "Tyynimeri"], tiers: { ten: ["Aasia"], fifteen: ["Etelä-Aasia"], sixty: ["Keski-Aasia"], hundred: ["Tyynimeri"] } },
  { id: "europe-africa", prompt: "Nimeä UNESCO:n Euroopan tai Afrikan aluejaon osa.", names: ["Eurooppa", "Afrikka", "Arabivaltiot", "Keski-Aasia"], tiers: { ten: ["Eurooppa"], fifteen: ["Afrikka"], sixty: ["Arabivaltiot"], hundred: ["Keski-Aasia"] } },
  { id: "regional", prompt: "Nimeä UNESCO:n maailmanperintöalue.", names: ["Arabivaltiot", "Latinalainen Amerikka", "Karibia", "Tyynimeri", "Etelä-Aasia"], tiers: { ten: ["Latinalainen Amerikka"], fifteen: ["Karibia"], sixty: ["Arabivaltiot"], eightyFive: ["Etelä-Aasia"], hundred: ["Tyynimeri"] } },
]);

extendFamily("world-international-courts", [
  { id: "un", prompt: "Nimeä YK:n yhteydessä toimiva kansainvälinen tuomioistuin.", names: ["Kansainvälinen tuomioistuin", "Kansainvälinen rikostuomioistuin", "ITLOS", "Permanent Court of Arbitration"], tiers: { ten: ["Kansainvälinen tuomioistuin"], fifteen: ["Kansainvälinen rikostuomioistuin"], sixty: ["ITLOS"], hundred: ["Permanent Court of Arbitration"] } },
  { id: "europe", prompt: "Nimeä eurooppalainen kansainvälinen tuomioistuin.", names: ["Euroopan ihmisoikeustuomioistuin", "Euroopan unionin tuomioistuin", "Kansainvälinen tuomioistuin", "ITLOS"], tiers: { ten: ["Euroopan ihmisoikeustuomioistuin"], fifteen: ["Euroopan unionin tuomioistuin"], sixty: ["Kansainvälinen tuomioistuin"], hundred: ["ITLOS"] } },
  { id: "human-rights", prompt: "Nimeä ihmisoikeustuomioistuin.", names: ["Euroopan ihmisoikeustuomioistuin", "Amerikan ihmisoikeustuomioistuin", "Afrikan ihmisoikeustuomioistuin", "Kansainvälinen rikostuomioistuin"], tiers: { ten: ["Euroopan ihmisoikeustuomioistuin"], fifteen: ["Kansainvälinen rikostuomioistuin"], sixty: ["Amerikan ihmisoikeustuomioistuin"], hundred: ["Afrikan ihmisoikeustuomioistuin"] } },
  { id: "regional", prompt: "Nimeä alueellinen kansainvälinen tuomioistuin.", names: ["Euroopan ihmisoikeustuomioistuin", "Euroopan unionin tuomioistuin", "Amerikan ihmisoikeustuomioistuin", "Afrikan ihmisoikeustuomioistuin"], tiers: { ten: ["Euroopan ihmisoikeustuomioistuin"], fifteen: ["Euroopan unionin tuomioistuin"], sixty: ["Amerikan ihmisoikeustuomioistuin"], hundred: ["Afrikan ihmisoikeustuomioistuin"] } },
  { id: "maritime", prompt: "Nimeä kansainvälinen merioikeustuomioistuin.", names: ["ITLOS", "Kansainvälinen tuomioistuin", "Permanent Court of Arbitration"], tiers: { ten: ["ITLOS"], fifteen: ["Kansainvälinen tuomioistuin"], hundred: ["Permanent Court of Arbitration"] } },
]);



export const productionContent = allFamilies.flatMap(makeFamily);
export const productionUniverses = productionContent.flatMap((content) => content.universes);
export const productionQuestions = productionContent.flatMap((content) => content.questions);
