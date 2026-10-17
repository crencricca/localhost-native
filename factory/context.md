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
- Past Events is a history of events the user attended: hosted or `confirmed`, most recent first. Every other past event (`requested`, `invited`, `declined`) is hidden, because the "change your mind" reason no longer applies once an event is over (006).

**Event detail** (`/event/[id]`)
- Every home-screen card opens it. The route itself checks `eventIsVisibleToUser` and shows nothing about an event the user can't see, since a deep link can reach any id (007).
- Maps opens the platform's own app: Apple Maps on iOS, the default `geo:` app on Android. Google Maps on iOS would open a browser tab when its app isn't installed (007).
- "Add to calendar" opens a Google Calendar template URL and is hidden for past events. Writing to the device calendar would need `expo-calendar` and a permission prompt, so it's deferred (007).

**Dates**
- Past is derived from the date with `isEventExpired`. Never set `Event.status` to `"past"` (002).
- Dates are `YYYY-MM-DD` and times `HH:mm`, in local time. `isEventExpired` compares dates only, so an event earlier today counts as upcoming until midnight (002, 006).

**Users and data**
- No auth yet. `mockCurrentUserId = "u1"` (the user, Catie R.) stands in for the signed-in user. Only route files read it; components get derived props, so auth replaces one import (005).
- Show names with `buildShortDisplayName` or `formatHostLabel`. Never show `email` or `phone` on cards (004).
- Firebase may come back later. App types use ISO strings; convert at the data layer, not in the types (002).
- Mocks live in `src/mocks/`, apart from prod code. Change them when a rule needs an on-screen case, and keep capacity and ticket values consistent with the rules above (002, 006).

## Open questions

- Which confirmed guests get the host's tickets. This needs a confirmation order, such as a `confirmedAt` field, which the model doesn't have yet (002).
- What happens to pending `requested` guests when a host switches an event to `invite_only`: decline them, or block the change. Decide in the create/edit job.
- Which guests a viewer may see on the event detail screen, and whether "Going (n/capacity)" counts the host. Decide in the guest-list job (007).
- Whether to drop the "Past" chip inside Past Events, where the heading already says it (backlog).

## Known gaps

- Android has never been tested: shadows, safe-area insets, the Maestro flows, and the light-blue adaptive icon background (`#E6F4FE`) against the dark splash.
- No check at the largest accessibility text size.
- The home feed doesn't apply `eventIsVisibleToUser` yet; only the detail route does. An `invite_only` event the user isn't on would show in the feed (005, 007).
- The detail route shows different messages for "Event not found" and "no access", so a user can tell that an event id exists. Merge them once real data arrives (007).
- "Add to calendar" sends an event's title, time, description and location to Google, and Maps sends the location to Apple. Check that this is acceptable for `invite_only` events once data is real (007).
- Visibility and feed filtering only happens on the client, and the full `guests` array reaches the client. Once there's a backend, the server must filter, and host lookups should return only the id and names.

## Conventions not visible in the code

- On-device checks run on the Release build the builder installs (`npx expo run:ios --configuration Release`), not a dev build. Write specs that way.
- `/mnt/project-files/port-plan/` doesn't exist. Read the web app directly at `~/Developer/event-planner`.
- No claude.ai links in PRs or commits.
- Maestro on iOS: `back` only works on Android, so tap the "Back" header button on iOS (its accessibility label comes from `headerBackTitle: "Back"`). `openLink` shows an "Open in LocalHost?" prompt on iOS; tap "Open" as an optional step (007).
- Description links come from `tokenizeLinks`, which matches only http(s) and `www.`. Keep it that way, so a description can never open another URL scheme (007).
- Mock locations should be specific enough for Maps to resolve them: "Williamsburg" alone opens Williamsburg, Virginia (007).
- The theme is dark-only. When building UI, use the tokens in `src/constants/tokens.js` through Tailwind classes, not hex values.
