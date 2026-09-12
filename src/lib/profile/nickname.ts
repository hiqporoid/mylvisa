const reserved = new Set(["admin", "administrator", "mylvisa", "ylläpito", "yllapito", "moderator", "moderaattori", "support", "tuki", "null", "undefined"]);
export function validateNickname(input: string) {
  const nickname = input.normalize("NFC").trim();
  // Deliberately limited alphabet: Finnish/Latin letters, digits, spaces, _ and -.
  // This also excludes URLs, markup, invisible joiners and bidi controls.
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]+$/u.test(nickname) || [...nickname].length < 3 || [...nickname].length > 20)
    throw new Error("Nimimerkissä tulee olla 3–20 kirjainta, numeroa, välilyöntiä, alaviivaa tai yhdysmerkkiä.");
  const normalized = nickname.toLowerCase();
  if (reserved.has(normalized)) throw new Error("Tämä nimimerkki on varattu.");
  return { nickname, normalized };
}
