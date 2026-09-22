import type { BetaContent } from './beta-content';

export const betaLiterature: BetaContent[] = [{
  id: 'beta-original-moomin-books', prompt: 'Nimeä Tove Janssonin alkuperäinen Muumi-kirja.', category: 'kirjallisuus', familyId: 'original-moomin-books', difficulty: 'standard', asOf: '2026-09-22',
  dailyEligibilityReason: 'Nine-book familiar-Finnish-franchise exception: Taikurin hattu and Muumipeikko ja pyrstötähti offer immediate entry, while the first 1945 book is a genuine deep recall.',
  source: { status: 'verified', authority: 'first-party', title: 'Official Moomin Shop — original Moomin novels and Finnish collected edition', url: 'https://shop.moomin.com/collections/novels', supportingUrls: ['https://shop.moomin.com/products/muumi-romaanit-pokkariboksi', 'https://shop.moomin.com/collections/books/novels'], definition: 'The nine original Tove Jansson Moomin books, including the 1945 first story The Moomins and the Great Flood and the eight later titles in the official Finnish Muumi-romaanit box. The short-story collection Näkymätön lapsi is one original book; later picture books, comics, adaptations, revised editions and translations are not separate members.', expectedCount: 9, checkedOn: '2026-09-22' },
  review: { accessibility: 'Taikurin hattu, Muumipeikko ja pyrstötähti, Näkymätön lapsi and Taikatalvi are familiar Finnish titles.', rarity: 'Muumit ja suuri tuhotulva is the obscure 1945 first book, and recalling its exact title is an exceptional answer. Popular school and TV-linked titles stay low; Muumipappa ja meri is less salient but not arbitrarily maximal.', completeness: 'The official shop explicitly identifies nine original books; its Finnish eight-book box lists all later titles, and the original-novels page separately shows The Moomins and the Great Flood. Matched the Finnish published titles and collapsed translations/editions.', aliases: 'The old English title Comet in Moominland and the Finnish edition name Komeetta tulee map to Muumipeikko ja pyrstötähti; no separate duplicated answer. Näkymätön lapsi is accepted as a short form for the collection.' },
  answers: [
    { canonical: 'Muumit ja suuri tuhotulva', points: 100, aliases: ['The Moomins and the Great Flood'] },
    { canonical: 'Muumipeikko ja pyrstötähti', points: 10, aliases: ['Komeetta tulee', 'Comet in Moominland'] },
    { canonical: 'Taikurin hattu', points: 10, aliases: ['Finn Family Moomintroll'] },
    { canonical: 'Muumipapan urotyöt', points: 60, aliases: ['Muumipapan muistelmat', 'The Exploits of Moominpappa'] },
    { canonical: 'Vaarallinen juhannus', points: 30, aliases: ['Moominsummer Madness'] },
    { canonical: 'Taikatalvi', points: 15, aliases: ['Moominland Midwinter'] },
    { canonical: 'Näkymätön lapsi ja muita kertomuksia', points: 15, aliases: ['Näkymätön lapsi', 'Tales from Moominvalley'] },
    { canonical: 'Muumipappa ja meri', points: 60, aliases: ['Moominpappa at Sea'] },
    { canonical: 'Muumilaakson marraskuu', points: 30, aliases: ['Moominvalley in November'] },
  ],
}];
