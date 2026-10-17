/**
 * URL that opens the platform's own maps app searching `location`: a `geo:` URL on Android
 * (default maps app), Apple Maps everywhere else. `null` for a blank location.
 */
export function buildNativeMapsUrl(
  location: string,
  os: string,
): string | null {
  const query = location.trim();
  if (!query) {
    return null;
  }
  const encoded = encodeURIComponent(query);
  return os === "android"
    ? `geo:0,0?q=${encoded}`
    : `https://maps.apple.com/?q=${encoded}`;
}
