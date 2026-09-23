import { betaMusic } from './beta-music';
import { betaReconciled } from './beta-reconciled';
import { betaSport } from './beta-sport';
import { betaGames } from './beta-games';
import { betaScience } from './beta-science';
import { betaDigital } from './beta-digital';
import { betaFilm } from './beta-film';
import { betaGeography } from './beta-geography';
import { betaSociety } from './beta-society';
import { betaLiterature } from './beta-literature';
import { betaBatchOne } from './beta-batch-one';
/** Individually authored source snapshots. No positional scores or inferred review flags. */
export type BetaContent = {
  id: string;
  prompt: string;
  category: string;
  familyId: string;
  difficulty: 'standard' | 'hard';
  dailyEligibilityReason?: string;
  asOf: string;
  source: { status: 'verified'; authority: 'first-party' | 'institutional'; title: string; url: string; definition: string; expectedCount: number; checkedOn: string; supportingUrls?: string[] };
  review: { accessibility: string; rarity: string; completeness: string; aliases: string };
  answers: { canonical: string; aliases: string[]; intentAliases?: string[]; points: number }[];
};
const answers = (rows: [string, number, string[]?][]) => rows.map(([canonical, points, aliases = []]) => ({ canonical, points, aliases }));
export const betaContent: BetaContent[] = [
  ...betaMusic,
  ...betaReconciled,
  ...betaSport,
  ...betaGames,
  ...betaScience,
  ...betaDigital,
  ...betaFilm,
  ...betaGeography,
  ...betaSociety,
  ...betaLiterature,
  ...betaBatchOne,
  {
    id: 'beta-f1-world-champions', prompt: 'Nimeä Formula 1 -maailmanmestari (1950–2025).', category: 'urheilu', familyId: 'f1-champions', difficulty: 'standard', asOf: '2025-12-31',
    source: { status: 'verified', authority: 'first-party', title: 'Formula 1 — Hall of Fame: the World Champions', url: 'https://www.formula1.com/en/drivers/hall-of-fame', definition: 'All distinct drivers in the official world-champion Hall of Fame through the 2025 championship; no constructors or runners-up.', expectedCount: 35, checkedOn: '2026-09-14' },
    review: { accessibility: 'Schumacher, Hamilton, Räikkönen and Häkkinen give several immediate entries for Finnish adults.', rarity: 'Finnish champions and famous recent champions are low. Hulme, Hawthorn and Phil Hill are exceptional recall within this familiar sporting universe. Scores are editorial estimates, not measured frequencies.', completeness: 'Read the full official Hall of Fame, Farina through Norris, and reconciled all 35 names. Distinct people, irrespective of number of championships.', aliases: 'Unique surnames accepted. Hill and Rosberg deliberately not mapped because each has multiple champions. Finnish diacritics restored; Farina has Giuseppe and Nino forms.' },
    answers: answers([
      ['Nino Farina',85,['Farina','Giuseppe Farina']],['Juan Manuel Fangio',30,['Fangio']],['Alberto Ascari',85,['Ascari']],['Mike Hawthorn',100,['Hawthorn']],['Jack Brabham',60,['Brabham']],['Phil Hill',100],['Graham Hill',85],['Jim Clark',60,['Clark']],['John Surtees',100,['Surtees']],['Denny Hulme',100,['Hulme']],['Jackie Stewart',60,['Stewart']],['Jochen Rindt',100,['Rindt']],['Emerson Fittipaldi',60,['Fittipaldi']],['Niki Lauda',30,['Lauda']],['James Hunt',30,['Hunt']],['Mario Andretti',60,['Andretti']],['Jody Scheckter',100,['Scheckter']],['Alan Jones',100,['Jones']],['Nelson Piquet',60,['Piquet']],['Keke Rosberg',15],['Alain Prost',30,['Prost']],['Ayrton Senna',15,['Senna']],['Nigel Mansell',60,['Mansell']],['Michael Schumacher',10,['Schumacher','Schumi']],['Damon Hill',60],['Jacques Villeneuve',60,['Villeneuve']],['Mika Häkkinen',10,['Häkkinen','Hakkinen','Mika Hakkinen']],['Fernando Alonso',15,['Alonso']],['Kimi Räikkönen',10,['Räikkönen','Raikkonen','Kimi Raikkonen','Kimi']],['Lewis Hamilton',10,['Hamilton']],['Jenson Button',60,['Button']],['Sebastian Vettel',15,['Vettel']],['Nico Rosberg',30],['Max Verstappen',10,['Verstappen']],['Lando Norris',15,['Norris']],
    ]),
  },
  {
    id: 'beta-nightwish-studio-albums', prompt: 'Nimeä Nightwishin studioalbumi (1997–2024).', category: 'musiikki', familyId: 'nightwish-discography', difficulty: 'standard', asOf: '2024-12-31',
    source: { status: 'verified', authority: 'first-party', title: 'Nightwish — Studio albums', url: 'https://www.nightwish.com/music', definition: 'All ten releases under Studio albums through Yesterwynde. Excludes live albums, compilations, film scores and videos listed under separate headings.', expectedCount: 10, checkedOn: '2026-09-14' },
    review: { accessibility: 'Once and Wishmaster provide familiar Finnish music entries, including title-song recall.', rarity: 'Once/Wishmaster low; later Human Nature and debut Angels Fall First demand deeper album recall. Yesterwynde receives 60 rather than an automatic maximum for newest release.', completeness: 'All ten entries in the explicit official Studio albums section read and reconciled, 1997–2024.', aliases: 'Accept punctuation-free Human Nature and familiar EFMB abbreviation; no song-to-album guessing.' },
    answers: answers([['Angels Fall First',100],['Oceanborn',30],['Wishmaster',10],['Century Child',30],['Once',10],['Dark Passion Play',15],['Imaginaerum',30],['Endless Forms Most Beautiful',85,['EFMB']],['Human. :||: Nature.',100,['Human Nature','Human Nature album']],['Yesterwynde',60]]),
  },
  {
    id: 'beta-iron-maiden-studio-albums', prompt: 'Nimeä Iron Maidenin studioalbumi (1980–2021).', category: 'musiikki', familyId: 'iron-maiden-discography', difficulty: 'standard', asOf: '2021-12-31',
    source: { status: 'verified', authority: 'first-party', title: 'Iron Maiden — Studio Albums', url: 'https://www.ironmaiden.com/discography/studio-albums/', definition: 'The official seventeen studio albums, debut through Senjutsu. Live and compilation releases excluded.', expectedCount: 17, checkedOn: '2026-09-14' },
    review: { accessibility: 'Fear of the Dark and The Number of the Beast supply widely recognisable entry titles for the initial Finnish audience.', rarity: 'Classic title albums low; Virtual XI and No Prayer for the Dying form a credible less-recalled tail. No chronological or importance-based template.', completeness: 'Read all seventeen dated entries in the official Studio Albums listing; checked No Prayer for the Dying separately against the same complete page rather than omitting the 1990 record.', aliases: 'Self-titled Iron Maiden accepted; Number of the Beast without article and Virtual 11 accepted. Live After Death remains invalid because it is live.' },
    answers: answers([['Iron Maiden',30],['Killers',30],['The Number of the Beast',10,['Number of the Beast']],['Piece of Mind',30],['Powerslave',15],['Somewhere in Time',30],['Seventh Son of a Seventh Son',30,['Seventh Son']],['No Prayer for the Dying',100],['Fear of the Dark',10],['The X Factor',85,['X Factor']],['Virtual XI',100,['Virtual 11']],['Brave New World',30],['Dance of Death',60],['A Matter of Life and Death',85],['The Final Frontier',85],['The Book of Souls',60],['Senjutsu',60]]),
  },
  {
    id: 'beta-fi-national-landscapes', prompt: 'Nimeä Suomen kansallismaisema.', category: 'suomi', familyId: 'finnish-national-landscapes', difficulty: 'hard', asOf: '2026-08-04',
    source: { status: 'verified', authority: 'institutional', title: 'Suomen ympäristökeskus — Kansallismaisemat', url: 'https://www.ymparisto.fi/fi/ymparistoaiheet/luonto-vesistot-ja-meri/maisemat/kansallismaisemat', definition: 'All 27 landscapes in the Ministry of the Environment selection established in 1992, as enumerated by Syke. This is the named national-landscape list, not all nationally valuable landscape areas.', expectedCount: 27, checkedOn: '2026-09-14' },
    review: { accessibility: 'Koli, Punkaharju and Imatrankoski provide plausible entry. The official designation is less immediately accessible than national parks, so hard rather than standard.', rarity: 'Iconic Koli and Punkaharju low; Rautavesi, Sund and Snappertuna–Fagervik give substantial less-salient recall. Familiar town names do not automatically earn maximum scores.', completeness: 'Read and reconciled every numbered entry 1–27 on the Syke page updated 4 August 2026. Preserve combined landscapes as one canonical member.', aliases: 'Distinctive identifying place names accepted where unique within the list. Broad Ahvenanmaa and Pohjanmaa are not aliases. Koli refers to this landscape, not an arbitrary national-park guess.' },
    answers: answers([
      ['Merellinen Helsinki',30,['Helsinki']],['Porvoonjokilaakso ja Vanha Porvoo',15,['Vanha Porvoo','Porvoonjokilaakso','Porvoo']],['Tapiola',60],['Snappertuna–Fagervik',100,['Snappertuna','Fagervik']],['Pohjan ruukit',85],['Aurajokilaakson kulttuurimaisema',30,['Aurajokilaakso']],['Saaristomeri',15],['Sundin kulttuurimaisema',100,['Sund']],['Köyliönjärvi',85],['Vanajaveden laakso',60,['Vanajavesi']],['Rautaveden kulttuurimaisema',100,['Rautavesi']],['Tammerkoski',15],['Hämeenkyrön kulttuurimaisemat',85,['Hämeenkyrö']],['Imatrankoski',15],['Olavinlinna ja Pihlajavesi',30,['Olavinlinna','Pihlajavesi']],['Punkaharju',10],['Heinäveden reitti',85],['Väisälänmäki',100],['Koli',10],['Pohjois-Karjalan vaarakylät',85],['Kyrönjokivarsi ja eteläpohjalaiset viljelylakeudet',60,['Kyrönjokivarsi','eteläpohjalaiset viljelylakeudet']],['Merenkurkun saaristo',30,['Merenkurkku']],['Hailuoto',30],['Oulankajoen luonnon- ja kulttuurimaisemat',60,['Oulankajoki']],['Aavasaksa ja Tornionjokilaakso',60,['Aavasaksa','Tornionjokilaakso']],['Pallastunturi',30],['Utsjokilaakso',60],
    ]),
  },
  {
    id: 'beta-pokemon-types', prompt: 'Nimeä Pokémon-tyyppi (18 perustyyppiä).', category: 'videopelit', familyId: 'pokemon-types', difficulty: 'standard', asOf: '2021-12-31',
    source: { status: 'verified', authority: 'first-party', title: 'The Pokémon Company — Pokémon Battling: Fighting Effectively', url: 'https://diamondpearl.pokemon.com/en-gb/trainersguide/fundamentals/battling/', definition: 'The eighteen ordinary Pokémon types enumerated in the official Brilliant Diamond/Shining Pearl guide. Special Terastal-only types and trading-card energy classifications are excluded.', expectedCount: 18, checkedOn: '2026-09-14' },
    review: { accessibility: 'Fire, Water and Electric provide immediate entries through widely known starter Pokémon and Pikachu, without requiring competitive play knowledge.', rarity: 'Fire/Water/Electric low; Fairy is a plausible exceptional spontaneous answer for adults whose strongest memory is the older games and cartoon. Steel and Ground provide less-obvious alternatives. This is an editorial audience judgment needing beta calibration.', completeness: 'Read the full eighteen-name enumeration. The guide mistakenly says 17 while listing 18; Fairy is separately confirmed in the following paragraph. The official 2014 Link Battle type chart also enumerates these same eighteen names; its effectiveness multipliers are not used.', aliases: 'English canonical types with unambiguous Finnish synonyms; generic Pokémon species names never map to a type. Type and tyyppi suffixes are explicit aliases.' },
    answers: answers([
      ['Normal',60,['normaali','normal type','normaalityyppi']],['Fire',10,['tuli','fire type','tulityyppi']],['Water',10,['vesi','water type','vesityyppi']],['Grass',15,['ruoho','kasvi','grass type','ruohotyyppi']],['Electric',10,['sähkö','electric type','sähkötyyppi']],['Ice',60,['jää','ice type','jäätyyppi']],['Fighting',60,['taistelu','taistelu-tyyppi','fighting type']],['Poison',60,['myrkky','poison type','myrkkytyyppi']],['Ground',85,['maa','ground type','maatyyppi']],['Flying',30,['lento','lentävä','flying type','lentotyyppi']],['Psychic',30,['psyykkinen','psychic type']],['Bug',60,['ötökkä','hyönteinen','bug type']],['Rock',60,['kivi','rock type','kivityyppi']],['Ghost',30,['aave','kummitus','ghost type']],['Dragon',15,['lohikäärme','dragon type']],['Dark',60,['pimeys','pimeä','dark type']],['Steel',85,['teräs','steel type','terästyyppi']],['Fairy',100,['keiju','fairy type','keijutyyppi']],
    ]),
  },
];
