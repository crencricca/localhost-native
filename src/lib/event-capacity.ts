import type { Event } from "@/constants/event";

/** Guest spots, not counting the host. `null` means unlimited. */
export function getGuestCapacity(
  event: Pick<Event, "capacity">,
): number | null {
  return event.capacity;
}

export function getGuestConfirmedCount(event: Pick<Event, "guests">): number {
  return event.guests.filter((guest) => guest.status === "confirmed").length;
}

export function getSpotsLeft(
  event: Pick<Event, "capacity" | "guests">,
): number | null {
  if (event.capacity === null) {
    return null;
  }
  return Math.max(event.capacity - getGuestConfirmedCount(event), 0);
}

export function isAtCapacity(
  event: Pick<Event, "capacity" | "guests">,
): boolean {
  if (event.capacity === null) {
    return false;
  }
  return getGuestConfirmedCount(event) >= event.capacity;
}

/** Host tickets not yet used by confirmed guests. Later guests bring their own. `null` means none. */
export function getHostTicketsLeft(
  event: Pick<Event, "tickets" | "guests">,
): number | null {
  if (event.tickets === null) {
    return null;
  }
  return Math.max(event.tickets - getGuestConfirmedCount(event), 0);
}
