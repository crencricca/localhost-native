import type { Event, EventAccess } from "@/constants/event";
import type { Guest } from "@/constants/guest";
import { getGuestConfirmedCount } from "@/lib/event-capacity";
import { eventTimeOrPickerDefault, toDateInputValue } from "@/lib/event-date";

/** Raw form state. Number fields stay strings so blank and invalid input can be told apart. */
export type EventFormValues = {
  title: string;
  location: string;
  description: string;
  access: EventAccess;
  date: string;
  time: string;
  capacity: string;
  tickets: string;
};

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

export function eventFormInitialValues(
  existing: Event | undefined,
  now: Date,
): EventFormValues {
  return {
    title: existing?.title ?? "",
    location: existing?.location ?? "",
    description: existing?.description ?? "",
    access: existing?.access ?? "open",
    date: existing?.date ?? toDateInputValue(now),
    time: eventTimeOrPickerDefault(existing?.time ?? null),
    capacity: existing?.capacity?.toString() ?? "",
    tickets: existing?.tickets?.toString() ?? "",
  };
}

/** Blank is `null`; anything that isn't a whole number is `NaN`. */
function parseWholeNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }
  return /^\d+$/.test(trimmed) ? Number(trimmed) : NaN;
}

export function validateEventForm(
  values: EventFormValues,
  existing?: Event,
  now: Date = new Date(),
): EventFormErrors {
  const errors: EventFormErrors = {};
  if (values.title.trim() === "") {
    errors.title = "Add a title";
  }
  if (values.location.trim() === "") {
    errors.location = "Add a location";
  }
  if (values.date < toDateInputValue(now)) {
    errors.date = "Pick today or a later date";
  }

  const capacity = parseWholeNumber(values.capacity);
  // Capacity counts guest spots only; the host isn't in the confirmed count.
  const confirmed = existing ? getGuestConfirmedCount(existing) : 0;
  if (capacity !== null && (Number.isNaN(capacity) || capacity < 1)) {
    errors.capacity = "Enter a whole number of at least 1, or leave it blank";
  } else if (capacity !== null && capacity < confirmed) {
    errors.capacity = `${confirmed} guests are confirmed, so capacity must be at least ${confirmed}`;
  }

  // Tickets are not a cap, so they aren't checked against capacity.
  const tickets = parseWholeNumber(values.tickets);
  if (tickets !== null && (Number.isNaN(tickets) || tickets < 1)) {
    errors.tickets = "Enter a whole number of at least 1, or leave it blank";
  }
  return errors;
}

export function hasEventFormErrors(errors: EventFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** The `requested` guests a switch to `invite_only` removes. Empty for every other change. */
export function pendingRequestsRemovedByAccessChange(
  existing: Event,
  nextAccess: EventAccess,
): Guest[] {
  if (existing.access === "invite_only" || nextAccess !== "invite_only") {
    return [];
  }
  return existing.guests.filter((guest) => guest.status === "requested");
}

export function createEventId(): string {
  return `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create mode takes a fresh `id` and the current user as `hostId`. Edit mode keeps the
 * existing `id`, `hostId`, `status` and `guests`, minus any requests removed by a switch
 * to `invite_only`. Call only with values that passed `validateEventForm`.
 */
export function buildEventFromForm(
  values: EventFormValues,
  options: { existing: Event } | { id: string; hostId: string },
): Event {
  const description = values.description.trim();
  const fields = {
    title: values.title.trim(),
    location: values.location.trim(),
    description: description === "" ? null : description,
    access: values.access,
    date: values.date,
    time: values.time,
    capacity: parseWholeNumber(values.capacity),
    tickets: parseWholeNumber(values.tickets),
  };

  if ("existing" in options) {
    const { existing } = options;
    const removed = pendingRequestsRemovedByAccessChange(
      existing,
      values.access,
    );
    return {
      ...fields,
      id: existing.id,
      hostId: existing.hostId,
      status: existing.status,
      guests: existing.guests.filter((guest) => !removed.includes(guest)),
    };
  }
  return {
    ...fields,
    id: options.id,
    hostId: options.hostId,
    status: "active",
    guests: [],
  };
}
