# Backlog

`/factory next` runs the first unchecked item. Order follows the port plan's suggested port order, except that the theme comes after the event feed, so it can be judged against real cards.

- [x] Port the web app's pure `lib/` helpers (including `event-date.ts`) and `lib/mock-data.ts`, adapted to the scaffold's `Event` / `Guest` model in `src/constants/`, which stays as is. The web app lives at `~/Developer/event-planner`. Mocks go in `src/mocks/` (002-port-event-types)
- [x] Build `EventCard` and show a feed of mock events on the home route (001-event-feed)
- [ ] Add a theme constants file in `src/constants/theme.ts` from the web app's `globals.css` tokens (canvas, accent, borders, shadows), load Chakra Petch, Space Grotesk and Caveat with expo-font, and delete the unused `example/` folder
- [ ] Show readable host names on `EventCard` instead of the raw `hostId`
- [ ] Add a "Requested" section listing events the user has requested a spot on (any `access`), filtered out of the main feed with `getGuestStatus`, and show a "declined" indicator on events the user declined
- [ ] Add an event detail route at `src/app/event/[id].tsx` with details and Maps / calendar links via `Linking`
- [ ] Add a create/edit event modal route with native date and time pickers
