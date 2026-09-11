// Exact normalized matching only: no edit distance, stemming, substring matching or accent removal.
export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("fi-FI")
    .replace(/[’‘ʼ]/gu, "'")
    .replace(/−/gu, "-")
    .replace(/(?<=\p{L})[‐‑‒–—-](?=\p{L})/gu, " ")
    .replace(/[‐‑‒–—]/gu, " ")
    .replace(/(?<=\d),(?=\d)/gu, ".")
    .replace(/(?<!\d)\.|\.(?!\d)|[,!?;:"“”„()\[\]{}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}
