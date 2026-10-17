import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EventCard from "@/components/EventCard/EventCard";
import type { Event } from "@/constants/event";
import { compareEventsByExpiry, isEventExpired } from "@/lib/event-date";
import { getGuestStatus } from "@/lib/event-hosts";
import { getUserById, mockCurrentUserId, mockEvents } from "@/mocks/mock-data";

export default function Index() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const isPast = (date: string, time: string | null) =>
    isEventExpired(date, time, now);
  // Upcoming soonest first, then past. filter returns copies, so mockEvents is never sorted in place.
  const order = (events: Event[]) => [
    ...events
      .filter((event) => !isPast(event.date, event.time))
      .sort(compareEventsByExpiry),
    ...events
      .filter((event) => isPast(event.date, event.time))
      .sort(compareEventsByExpiry),
  ];
  const isRequested = (event: Event) =>
    getGuestStatus(event, mockCurrentUserId) === "requested";
  const feed = order(mockEvents.filter((event) => !isRequested(event)));
  const requested = order(mockEvents.filter(isRequested));

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
          requested.length > 0 ? (
            <View className="gap-4">
              <Text
                accessibilityRole="header"
                className="font-display-700 text-2xl text-ink"
              >
                Requested
              </Text>
              {requested.map(renderCard)}
            </View>
          ) : null
        }
      />
    </View>
  );
}
