import type { Event as CalendarEvent } from "expo-calendar/legacy";
import type { Event } from "@/constants/event";
import { toEventDateTime } from "@/lib/event-date";
import {
  buildGoogleCalendarRenderUrl,
  DEFAULT_DURATION_MS,
  isValidClockTimeKey,
} from "@/lib/google-calendar-url";

export type DeviceCalendarEventInput = Pick<
  Event,
  "title" | "date" | "time" | "description" | "location"
>;

export type DeviceCalendarEventData = Omit<Partial<CalendarEvent>, "id">;

/**
 * Builds the `eventData` for `createEventInCalendarAsync`. Returns `null` exactly when the
 * Google Calendar link can't be built, so both paths accept the same events.
 */
export function buildDeviceCalendarEvent(
  input: DeviceCalendarEventInput,
): DeviceCalendarEventData | null {
  if (buildGoogleCalendarRenderUrl(input) === null) {
    return null;
  }

  const data: DeviceCalendarEventData = { title: input.title.trim() };
  if (input.time && isValidClockTimeKey(input.time)) {
    const start = toEventDateTime(input.date, input.time);
    data.startDate = start;
    data.endDate = new Date(start.getTime() + DEFAULT_DURATION_MS);
  } else {
    // Local midnight to the next local midnight.
    const [year, month, day] = input.date.split("-").map(Number);
    data.allDay = true;
    data.startDate = new Date(year, month - 1, day);
    data.endDate = new Date(year, month - 1, day + 1);
  }

  const location = input.location.trim();
  if (location) {
    data.location = location;
  }
  const notes = input.description?.trim();
  if (notes) {
    data.notes = notes;
  }
  return data;
}
