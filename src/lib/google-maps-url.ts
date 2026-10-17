/** Builds a Google Maps search URL for an address. Opens the Maps app on iOS/Android if installed. */
export function buildGoogleMapsSearchUrl(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) {
    return null;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}
