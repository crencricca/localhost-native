import type { Event } from "@/constants/event";
import type { Guest } from "@/constants/guest";
import {
  getGuestConfirmedCount,
  getHostTicketsLeft,
  getSpotsLeft,
  isAtCapacity,
} from "@/lib/event-capacity";
import { getGuestStatus, userIsHost } from "@/lib/event-hosts";

// Who may see which guests. A backend should mirror these rules.

function viewerIsAttendee(event: Event, viewerId: string): boolean {
  return (
    userIsHost(event, viewerId) ||
    getGuestStatus(event, viewerId) === "confirmed"
  );
}

/** Confirmed guests, or `null` when the viewer isn't an attendee and may not see names. */
export function getGoingGuests(event: Event, viewerId: string): Guest[] | null {
  if (!viewerIsAttendee(event, viewerId)) {
    return null;
  }
  return event.guests.filter((guest) => guest.status === "confirmed");
}

/** Requested guests, or `null` when the viewer isn't the host. */
export function getInterestedGuests(
  event: Event,
  viewerId: string,
): Guest[] | null {
  if (!userIsHost(event, viewerId)) {
    return null;
  }
  return event.guests.filter((guest) => guest.status === "requested");
}

/** "Going (n/capacity)", or "Going (n)" when unlimited. The host isn't counted. */
export function formatGoingHeading(
  event: Pick<Event, "capacity" | "guests">,
): string {
  const count = getGuestConfirmedCount(event);
  return event.capacity === null
    ? `Going (${count})`
    : `Going (${count}/${event.capacity})`;
}

/** "3 spots left", "1 spot left", "Full", or `null` when unlimited. */
export function formatSpotsLeft(
  event: Pick<Event, "capacity" | "guests">,
): string | null {
  const spotsLeft = getSpotsLeft(event);
  if (spotsLeft === null) {
    return null;
  }
  if (isAtCapacity(event)) {
    return "Full";
  }
  return `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`;
}

/** A count only; no guest is labelled until there's a confirmation order. */
export function formatHostTicketsLeft(
  event: Pick<Event, "tickets" | "guests">,
): string | null {
  const ticketsLeft = getHostTicketsLeft(event);
  if (event.tickets === null || ticketsLeft === null) {
    return null;
  }
  if (ticketsLeft === 0) {
    return "Host tickets used up. New guests bring their own.";
  }
  return `${ticketsLeft} of ${event.tickets} host ${event.tickets === 1 ? "ticket" : "tickets"} left`;
}
