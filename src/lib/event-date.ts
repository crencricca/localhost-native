import type { Event } from "@/constants/event";

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toTimeInputValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function toDateTimeLocalInputValue(date: Date) {
  return `${toDateInputValue(date)}T${toTimeInputValue(date)}`;
}

export function toDateKeyFromDateTimeInput(value: string) {
  return value.split("T")[0] ?? "";
}

export function toTimeKeyFromDateTimeInput(value: string) {
  return value.split("T")[1] ?? "";
}

/** Event time keys: `HH:mm`, 24-hour, zero-padded (e.g. `09:30`, `18:00`). */
export const EVENT_TIME_KEY_REGEX = /^\d{2}:\d{2}$/;

/** True when value includes `T` and a valid `HH:mm` time (not date-only). */
export function dateTimeInputHasTime(value: string) {
  return (
    value.includes("T") &&
    EVENT_TIME_KEY_REGEX.test(toTimeKeyFromDateTimeInput(value))
  );
}

/** For time pickers when an event has no stored time (avoids inventing 23:59 / 11:59 PM). */
export function eventTimeOrPickerDefault(
  time: string | null,
  defaultKey = "18:00",
) {
  return EVENT_TIME_KEY_REGEX.test(time ?? "") ? (time as string) : defaultKey;
}

/** Interprets date + optional HH:mm. Missing or invalid time uses start of day (sorting / expiry math only). */
export function toEventDateTime(date: string, time: string | null) {
  const [year, month, day] = date.split("-").map(Number);
  const timeKey = time && EVENT_TIME_KEY_REGEX.test(time) ? time : "00:00";
  const [hours, minutes] = timeKey.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function shiftDateByDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function isEventExpired(
  eventDate: string,
  _eventTime: string | null,
  referenceDate: Date,
) {
  const todayKey = toDateInputValue(referenceDate);
  return eventDate < todayKey;
}

export function compareEventsByExpiry(
  left: Pick<Event, "date" | "time">,
  right: Pick<Event, "date" | "time">,
) {
  const byDate = left.date.localeCompare(right.date);
  if (byDate !== 0) {
    return byDate;
  }
  return (
    toEventDateTime(left.date, left.time).getTime() -
    toEventDateTime(right.date, right.time).getTime()
  );
}

export function formatEventDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(localDate);
}

export function formatEventDateLong(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(localDate);
}

export function formatEventDateTime(dateKey: string, time: string | null) {
  if (!time || !EVENT_TIME_KEY_REGEX.test(time)) {
    return formatEventDate(dateKey);
  }
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(toEventDateTime(dateKey, time));
}

/** Empty string when there is no time to show (callers should omit the segment in UI). */
export function formatEventTime(time: string | null) {
  if (!time || !EVENT_TIME_KEY_REGEX.test(time)) {
    return "";
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(toEventDateTime("2000-01-01", time));
}

export function getComingWeekendRange(base: Date) {
  const day = base.getDay();
  const daysUntilSaturday = day === 0 ? 6 : (6 - day + 7) % 7;
  const saturday = shiftDateByDays(base, daysUntilSaturday);
  const sunday = shiftDateByDays(saturday, 1);

  return {
    start: toDateInputValue(saturday),
    end: toDateInputValue(sunday),
  };
}
