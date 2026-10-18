# LocalHost

An event planner for iOS and Android: create events, track the ones you're hosting or attending, and view event details. React Native port of the [LocalHost web app](https://github.com/crencricca/localhost).

<p>
  <img src="docs/screenshots/my-events.png" width="250" alt="My events" />
  <img src="docs/screenshots/event-detail.png" width="250" alt="Event detail" />
  <img src="docs/screenshots/new-event.png" width="250" alt="New event" />
</p>

## Run locally

Requires Node, plus Xcode (iOS) or Android Studio (Android).

```bash
npm install
npm run ios      # or: npm run android
```

This builds a development build and starts the dev server. After the first build, `npm start` is enough.

Lint and typecheck: `npm run lint && npm run typecheck`
