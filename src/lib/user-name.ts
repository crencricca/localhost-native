import type { User } from "@/constants/user";

/** Full name, e.g. "Aidan Cuite", or just the first name when there is no last name. */
export function buildDisplayName(
  user: Pick<User, "firstname" | "lastname">,
): string {
  return [user.firstname, user.lastname].filter(Boolean).join(" ");
}

/** First name and last initial, e.g. "Aidan C.", or just the first name when there is no last name. */
export function buildShortDisplayName(
  user: Pick<User, "firstname" | "lastname">,
): string {
  const initial = user.lastname?.trim()[0];
  return initial ? `${user.firstname} ${initial}.` : user.firstname;
}
