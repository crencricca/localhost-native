# Factory context

Read this before writing a spec, building or approving. It holds what the code doesn't show: the rules that apply now and why, open questions, and known gaps. The orchestrator keeps it current: it rewrites rules in place when they change rather than appending, and deletes ones that no longer apply. Tags like `(002)` name the job folder in `factory/jobs/` with the full reasoning.

## Goal

Port the event-planner web app (`~/Developer/event-planner`) to this Expo app. The web app is a reference for behavior and helpers, **not** the target schema: the scaffold models in `src/constants/` (`Event`, `Guest`, `User`) were designed deliberately by the user and stay as they are. Port only what fits them, and list what was dropped and why. Changing a model needs the user's OK (002). `backlog.md` holds the port order.

## Domain rules

**Hosts and guests**
- One host per event (`Event.hostId`). Every host check goes through `userIsHost`, so a later move to co-hosts touches one file. Co-hosts are dropped completely; don't turn them into guests (002).
- The host is not a `GuestStatus` and never appears in `guests`. The statuses (`invited`, `requested`, `confirmed`, `declined`) describe a guest's reply; the host goes through none of them. "Attendee" means host or `confirmed`, and is derived when needed, not stored (006).
- Read a user's status only with `getGuestStatus`. It returns `null` for both the host and non-guests, so use `userIsHost` to tell them apart.

**Capacity and tickets**
- `capacity` counts guest spots and excludes the host. `null` means unlimited. It is the only limit on guests (002).
- `tickets` is how many extra tickets the host already has, for example for a concert. Confirmed guests use them first; after that, more guests can still come but bring their own ticket. It is **not** a cap. `null` means no host tickets. Users hit this case often in testing, so keep it (002).

**Visibility and the home feed**
- `open` and `request` events are visible to everyone. `invite_only` events are visible to the host and to `invited`, `confirmed` and `declined` guests (002).
- Upcoming events the user `declined` stay in the main feed with a "Declined" chip, so they can change their mind (002, 005).
- Upcoming events the user `requested` (any `access`) go in a separate Requested section below the main feed, not the main feed (005).
- Home-screen cards show no "Past" chip: past events only appear under the Past Events heading, which already says it. The event detail screen keeps its chip, since a deep link can open it with no heading for context (009).
- Past Events is a history of events the user attended: hosted or `confirmed`, most recent first. Every other past event (`requested`, `invited`, `declined`) is hidden, because the "change your mind" reason no longer applies once an event is over (006).

**Event detail** (`/event/[id]`)
- Every home-screen card opens it. The route itself checks `eventIsVisibleToUser` and shows nothing about an event the user can't see, since a deep link can reach any id (007).
- Maps opens the platform's own app: Apple Maps on iOS, the default `geo:` app on Android. Google Maps on iOS would open a browser tab when its app isn't installed (007).
- "Add to calendar" is hidden for past events. On iOS and Android it opens the system New Event sheet for the device's default calendar app (`createEventInCalendarAsync` from `expo-calendar/legacy`), with no permission prompt and no confirmation afterwards; there is no visible Google option on native. Google Calendar's template URL is used on web and as the fallback when the native sheet fails. Events with no time are added as all-day. Never call a calendar permission or read API: the app only uses the system sheet. The plugin is in `app.json` with a write-only usage string for App Store review, and Android's calendar permissions are blocked (007, 011).
- Guest section: "Going (n/capacity)" never counts the host, and the host is not a row in it ("Hosted by" names them). Only attendees (host or `confirmed`) see who is going; everyone else who can see the event sees the count, spots left and host tickets but no names, so real names on public events don't reach strangers. "Interested" means `requested` guests and only the host sees it. `invited` and `declined` guests are shown to no one yet. Past events keep Going as a record and hide spots left and tickets. These rules live in `src/lib/event-guests.ts` (010).

**Creating and editing events**
- Only the host edits an event, and only while it's upcoming. New and edited events can't be dated before today (008).
- Switching an event to `invite_only` removes its `requested` guest entries, after the host confirms. Declining them would break two rules: a status is the guest's own reply, and declined guests can see `invite_only` events (008).
- A host can't lower `capacity` below the confirmed guest count; the form blocks the save rather than raising it silently like the web app (008).
- The form always saves a time (default 18:00). Events with a `null` time still exist and must keep rendering (008).
- Events live in an in-memory store seeded from `mockEvents`, with no persistence. Routes read events from the store, not from `mockEvents` directly. This is the seam for Firebase later (008).

**Dates**
- Past is derived from the date with `isEventExpired`. Never set `Event.status` to `"past"` (002).
- Dates are `YYYY-MM-DD` and times `HH:mm`, in local time. `isEventExpired` compares dates only, so an event earlier today counts as upcoming until midnight (002, 006).

**Users and data**
- No auth yet. `mockCurrentUserId = "u1"` (the user, Catie R.) stands in for the signed-in user. Only route files read it; components get derived props, so auth replaces one import (005).
- Show names with `buildShortDisplayName` or `formatHostLabel`. Never show `email` or `phone` on cards (004).
- Firebase may come back later. App types use ISO strings; convert at the data layer, not in the types (002).
- Mocks live in `src/mocks/`, apart from prod code. Change them when a rule needs an on-screen case, and keep capacity and ticket values consistent with the rules above (002, 006).

## Open questions

- Which confirmed guests get the host's tickets. This needs a confirmation order, such as a `confirmedAt` field, which the model doesn't have yet. Until then the detail screen shows only a ticket count and labels no guest (002, 010).

## Known gaps

- Android has never been tested: shadows, safe-area insets, the Maestro flows, and the light-blue adaptive icon background (`#E6F4FE`) against the dark splash.
- No check at the largest accessibility text size.
- A new `invite_only` event has no guests and is visible only to its host until there's a way to invite people (008).
- Android date picker (`@expo/ui/jetpack-compose` `DateTimePicker`) may report the picked day as UTC midnight, which would save the previous day west of UTC. Check it in the first Android pass (008).
- The event store's `updateEvent` has no host check; only the guarded `event-form` route writes to it. With a backend, the server must enforce host-only edits and the remove-only-`requested` rule (008).
- Form text fields have no `maxLength`, and `createEventId` uses `Math.random`. Fine in memory; revisit with a backend (008).
- The form's Save button is disabled without saying why, and the home header row ("My Events" + "New event") may crowd at large text sizes (008).
- The home feed doesn't apply `eventIsVisibleToUser` yet; only the detail route does. An `invite_only` event the user isn't on would show in the feed (005, 007).
- The detail route shows different messages for "Event not found" and "no access", so a user can tell that an event id exists. Merge them once real data arrives (007).
- Maps sends an event's location to Apple, and the Google Calendar fallback (web, or a failed native sheet) sends the title, time, description and location to Google. Check that this is acceptable for `invite_only` events once data is real (007, 011).
- Visibility and feed filtering only happens on the client, and the full `guests` array reaches the client. The guest section hides names on screen only, so it gives no real privacy until the server filters. Once there's a backend, the server must apply the visibility and guest-section rules, and host lookups should return only the id and names (010).
- No mock event shows "Full", "1 spot left", unlimited capacity in the guest section, or used-up host tickets; those strings were checked only by reading `src/lib/event-guests.ts` (010).

## Conventions not visible in the code

- On-device checks run on the Release build the builder installs (`npx expo run:ios --configuration Release`), not a dev build. Write specs that way.
- `/mnt/project-files/port-plan/` doesn't exist. Read the web app directly at `~/Developer/event-planner`.
- No claude.ai links in PRs or commits.
- Maestro on iOS: `back` only works on Android, so tap the "Back" header button on iOS (its accessibility label comes from `headerBackTitle: "Back"`). `openLink` shows an "Open in LocalHost?" prompt on iOS; tap "Open" as an optional step (007).
- Description links come from `tokenizeLinks`, which matches only http(s) and `www.`. Keep it that way, so a description can never open another URL scheme (007).
- Maestro: the home screen keeps its scroll position after "Back", so after returning, assert on the card you left rather than "My Events" (010).
- Mock locations should be specific enough for Maps to resolve them: "Williamsburg" alone opens Williamsburg, Virginia (007).
- The theme is dark-only. When building UI, use the tokens in `src/constants/tokens.js` through Tailwind classes, not hex values.
