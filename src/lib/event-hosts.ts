import type { Event } from "@/constants/event";
import type { GuestStatus } from "@/constants/guest";

/** The user's guest status on the event, or `null` if they aren't a guest (the host never is). */
export function getGuestStatus(
  event: Event,
  userId: string,
): GuestStatus | null {
  return event.guests.find((guest) => guest.userId === userId)?.status ?? null;
}

/** The only place that checks `hostId`, so a move to multiple hosts touches just this file. */
export function userIsHost(event: Event, userId: string): boolean {
  return event.hostId === userId;
}

/** Pending direct invite: invited but not yet confirmed or declined. */
export function userIsInvitedToEvent(event: Event, userId: string): boolean {
  return getGuestStatus(event, userId) === "invited";
}

/**
 * Callers must enforce privacy. Invite-only events are only shown to the host and to
 * invited, confirmed or declined guests (declined guests can change their mind).
 */
export function eventIsVisibleToUser(event: Event, userId: string): boolean {
  if (event.access !== "invite_only") {
    return true;
  }
  if (userIsHost(event, userId)) {
    return true;
  }
  const status = getGuestStatus(event, userId);
  return (
    status === "invited" || status === "confirmed" || status === "declined"
  );
}
