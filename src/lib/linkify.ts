export type LinkifyToken =
  | { type: "text"; value: string }
  | { type: "url"; value: string; href: string };

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;

/** Splits text into plain and URL tokens. URLs starting with `www.` are normalized to `https://`. */
export function tokenizeLinks(input: string): LinkifyToken[] {
  const tokens: LinkifyToken[] = [];
  let cursor = 0;

  for (const match of input.matchAll(URL_PATTERN)) {
    const matchStart = match.index ?? 0;
    let raw = match[0];

    const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    if (trailing) {
      raw = raw.slice(0, raw.length - trailing.length);
    }
    if (!raw) {
      continue;
    }

    if (matchStart > cursor) {
      tokens.push({ type: "text", value: input.slice(cursor, matchStart) });
    }

    const href = raw.startsWith("www.") ? `https://${raw}` : raw;
    tokens.push({ type: "url", value: raw, href });
    cursor = matchStart + raw.length;
  }

  if (cursor < input.length) {
    tokens.push({ type: "text", value: input.slice(cursor) });
  }

  return tokens;
}
