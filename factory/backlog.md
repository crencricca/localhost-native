# Backlog

`/factory next` runs the first unchecked item. Order follows the port plan's suggested port order, except that the theme comes after the event feed, so it can be judged against real cards.

- [x] Port the web app's pure `lib/` helpers (including `event-date.ts`) and `lib/mock-data.ts`, adapted to the scaffold's `Event` / `Guest` model in `src/constants/`, which stays as is. The web app lives at `~/Developer/event-planner`. Mocks go in `src/mocks/` (002-port-event-types)
- [x] Build `EventCard` and show a feed of mock events on the home route (001-event-feed)
- [x] Add a theme constants file in `src/constants/theme.ts` from the web app's `globals.css` tokens (canvas, accent, borders, shadows), load Chakra Petch, Space Grotesk and Caveat with expo-font, and delete the unused `example/` folder (003-theme)
- [x] Show readable host names on `EventCard` instead of the raw `hostId` (004-host-names)
- [x] Add a "Requested" section listing events the user has requested a spot on (any `access`), filtered out of the main feed with `getGuestStatus`, and show a "declined" indicator on events the user declined (005-requested-events)
- [x] Add a "Past Events" section that lists events whose date has passed (`isEventExpired`), and filter them out of the main feed (006-past-events)
- [x] Add an event detail route at `src/app/event/[id].tsx` with details and Maps / calendar links via `Linking` (007-event-detail)
- [x] Add a create/edit event modal route with native date and time pickers. Decide what happens to pending `requested` guests when a host changes an event's `access` to `invite_only` (for example decline them, or block the change until they're resolved) (008-event-form)
- [x] Decide whether `EventCard` should still show the "Past" chip inside the Past Events section, where the heading already says it (kept for now in 006-past-events) (009-past-chip)
- [x] Add a guest list and capacity section to the event detail screen (Interested / Going lists, "Going (n/capacity)", spots left, host tickets). Decide which guests a viewer may see and whether the count includes the host (deferred in 007-event-detail) (010-guest-list)
- [x] Optionally add events to the device calendar with `expo-calendar` instead of the Google Calendar link (deferred in 007-event-detail) (011-device-calendar)
- [ ] Touch targets and press feedback: give inline description links a 44 pt hit area (for example as separate pressable rows), add `min-w-11` to the detail screen's Maps control, and add pressed-state feedback to `EventCard` (accepted as-is in 007-event-detail)
- [ ] Invite guests to an event from the event form or guest list, so new `invite_only` events can have guests (deferred in 008-event-form)
- [ ] Default the event form's time to the next full hour instead of 18:00 (10:17 pm → 11:00 pm), as Apple Calendar does. After 11 pm the next hour is tomorrow, so roll the date forward to the next day (user decision)
