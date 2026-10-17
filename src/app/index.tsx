import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EventCard from "@/components/EventCard/EventCard";
import type { Event } from "@/constants/event";
import { compareEventsByExpiry, isEventExpired } from "@/lib/event-date";
import { getGuestStatus, userIsHost } from "@/lib/event-hosts";
import { getUserById, mockCurrentUserId, mockEvents } from "@/mocks/mock-data";

export default function Index() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const isPast = (date: string, time: string | null) =>
    isEventExpired(date, time, now);
  const isRequested = (event: Event) =>
    getGuestStatus(event, mockCurrentUserId) === "requested";
  const attended = (event: Event) =>
    userIsHost(event, mockCurrentUserId) ||
    getGuestStatus(event, mockCurrentUserId) === "confirmed";
  // filter returns copies, so mockEvents is never sorted in place.
  const upcoming = mockEvents.filter(
    (event) => !isPast(event.date, event.time),
  );
  const feed = upcoming
    .filter((event) => !isRequested(event))
    .sort(compareEventsByExpiry);
  const requested = upcoming.filter(isRequested).sort(compareEventsByExpiry);
  // Most recent first. Past events the user didn't attend are not shown.
  const past = mockEvents
    .filter((event) => isPast(event.date, event.time) && attended(event))
    .sort((left, right) => compareEventsByExpiry(right, left));

  const renderCard = (event: Event) => (
    <EventCard
      key={event.id}
      event={event}
      host={getUserById(event.hostId)}
      isPast={isPast(event.date, event.time)}
      isDeclined={getGuestStatus(event, mockCurrentUserId) === "declined"}
    />
  );

  return (
    // No header on this screen. The top inset sits outside the list so the
    // canvas covers the status bar and scrolled content never shows behind it.
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-4 p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        data={feed}
        keyExtractor={(event) => event.id}
        ListHeaderComponent={
          <Text className="font-display-700 text-3xl text-ink">My Events</Text>
        }
        renderItem={({ item }) => renderCard(item)}
        ListFooterComponent={
          requested.length > 0 || past.length > 0 ? (
            <View className="gap-4">
              {requested.length > 0 ? (
                <>
                  <Text
                    accessibilityRole="header"
                    className="font-display-700 text-2xl text-ink"
                  >
                    Requested
                  </Text>
                  {requested.map(renderCard)}
                </>
              ) : null}
              {past.length > 0 ? (
                <>
                  <Text
                    accessibilityRole="header"
                    className="font-display-700 text-2xl text-ink"
                  >
                    Past Events
                  </Text>
                  {past.map(renderCard)}
                </>
              ) : null}
            </View>
          ) : null
        }
      />
    </View>
  );
}
