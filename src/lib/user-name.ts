import type { User } from "@/constants/user";

/** Full name, e.g. "Aidan Cuite", or just the first name when there is no last name. */
export function buildDisplayName(
  user: Pick<User, "firstName" | "lastName">,
): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

/** First name and last initial, e.g. "Aidan C.", or just the first name when there is no last name. */
export function buildShortDisplayName(
  user: Pick<User, "firstName" | "lastName">,
): string {
  const initial = user.lastName?.trim()[0];
  return initial ? `${user.firstName} ${initial}.` : user.firstName;
}
