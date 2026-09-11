/** Conservative, deterministic answer normalisation shared by server tests and the matcher. */
export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("fi-FI")
    .replace(/[’‘ʼ]/gu, "'")
    .replace(/[‐‑‒–—]/gu, "-")
    .replace(/(?<=\p{L})-(?=\p{L})/gu, " ")
    .replace(/(?<=\d),(?=\d)/gu, ".")
    .replace(/[.,!?;:"“”„()\[\]{}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

/** Return only single adjacent transpositions; never use general edit distance. */
export function transpositionVariants(value: string): string[] {
  const variants: string[] = [];
  for (let index = 0; index < value.length - 1; index++) {
    const chars = [...value];
    [chars[index], chars[index + 1]] = [chars[index + 1], chars[index]];
    variants.push(chars.join(""));
  }
  return variants;
}
