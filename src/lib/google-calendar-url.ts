import type { Event } from "@/constants/event";
import {
  EVENT_TIME_KEY_REGEX,
  toDateInputValue,
  toEventDateTime,
} from "@/lib/event-date";

/** Default length for timed events when only a start time is stored. */
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

const ISO_DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidClockTimeKey(time: string): boolean {
  if (!EVENT_TIME_KEY_REGEX.test(time)) {
    return false;
  }
  const [hours, minutes] = time.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function toGoogleUtcInstantCompact(instant: Date): string {
  const y = instant.getUTCFullYear();
  const mo = String(instant.getUTCMonth() + 1).padStart(2, "0");
  const day = String(instant.getUTCDate()).padStart(2, "0");
  const h = String(instant.getUTCHours()).padStart(2, "0");
  const mi = String(instant.getUTCMinutes()).padStart(2, "0");
  const s = String(instant.getUTCSeconds()).padStart(2, "0");
  return `${y}${mo}${day}T${h}${mi}${s}Z`;
}

/** Shifts a calendar date key by whole days using local noon to reduce DST edge cases. */
function shiftDateKeyByDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const base = new Date(year, month - 1, day, 12, 0, 0, 0);
  base.setDate(base.getDate() + days);
  return toDateInputValue(base);
}

function toGoogleAllDayCompact(dateKey: string): string {
  return dateKey.replace(/-/g, "");
}

export type GoogleCalendarUrlInput = Pick<
  Event,
  "title" | "date" | "time" | "description" | "location"
>;

/** Merges optional event copy with an absolute event page URL for Google Calendar “details”. */
export function buildGoogleCalendarDescriptionDetails(input: {
  eventDescription?: string | null;
  eventPageUrl?: string;
}): string | undefined {
  const desc = input.eventDescription?.trim() ?? "";
  const url = input.eventPageUrl?.trim() ?? "";
  if (!desc && !url) {
    return undefined;
  }
  if (!url) {
    return desc;
  }
  if (!desc) {
    return `Event page:\n${url}`;
  }
  return `${desc}\n\nEvent page:\n${url}`;
}

/**
 * Builds a Google Calendar “create event” URL (action=TEMPLATE). Opens in the user’s browser;
 * the active Google session there chooses the calendar account.
 */
export function buildGoogleCalendarRenderUrl(
  input: GoogleCalendarUrlInput,
): string | null {
  const title = input.title.trim();
  if (!title) {
    return null;
  }
  if (!ISO_DATE_KEY_REGEX.test(input.date)) {
    return null;
  }

  const hasTime = Boolean(input.time && isValidClockTimeKey(input.time));
  let datesParam: string;
  if (hasTime) {
    const start = toEventDateTime(input.date, input.time);
    const end = new Date(start.getTime() + DEFAULT_DURATION_MS);
    datesParam = `${toGoogleUtcInstantCompact(start)}/${toGoogleUtcInstantCompact(end)}`;
  } else {
    const startCompact = toGoogleAllDayCompact(input.date);
    const endExclusiveCompact = toGoogleAllDayCompact(
      shiftDateKeyByDays(input.date, 1),
    );
    datesParam = `${startCompact}/${endExclusiveCompact}`;
  }

  const params = new URLSearchParams();
  params.set("action", "TEMPLATE");
  params.set("text", title);
  params.set("dates", datesParam);
  const details = input.description?.trim();
  if (details) {
    params.set("details", details);
  }
  const location = input.location?.trim();
  if (location) {
    params.set("location", location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
