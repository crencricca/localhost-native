# Backlog

`/factory next` runs the first unchecked item. Order follows the port plan's suggested port order.

- [ ] Add a theme constants file in `src/constants/theme.ts` from the web app's `globals.css` tokens (canvas, accent, borders, shadows), load Chakra Petch, Space Grotesk and Caveat with expo-font, and delete the unused `example/` folder
- [ ] Port the web app's `types/event.ts` and pure `lib/` helpers, replacing the scaffold's `event.ts` and `guest.ts` model
- [ ] Build `EventCard` and show a feed of mock events on the home route
- [ ] Add an event detail route at `src/app/event/[id].tsx` with details and Maps / calendar links via `Linking`
- [ ] Add a create/edit event modal route with native date and time pickers
