import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EventCard from "@/components/EventCard/EventCard";
import type { Event } from "@/constants/event";
import { Shadows } from "@/constants/theme";
import { compareEventsByExpiry, isEventExpired } from "@/lib/event-date";
import { getGuestStatus, userIsHost } from "@/lib/event-hosts";
import { getUserById, mockCurrentUserId } from "@/mocks/mock-data";
import { useEvents } from "@/state/events";

export default function Index() {
  const insets = useSafeAreaInsets();
  const events = useEvents();
  const now = new Date();
  const isPast = (date: string, time: string | null) =>
    isEventExpired(date, time, now);
  const isRequested = (event: Event) =>
    getGuestStatus(event, mockCurrentUserId) === "requested";
  const attended = (event: Event) =>
    userIsHost(event, mockCurrentUserId) ||
    getGuestStatus(event, mockCurrentUserId) === "confirmed";
  // filter returns copies, so the store's array is never sorted in place.
  const upcoming = events.filter((event) => !isPast(event.date, event.time));
  const feed = upcoming
    .filter((event) => !isRequested(event))
    .sort(compareEventsByExpiry);
  const requested = upcoming.filter(isRequested).sort(compareEventsByExpiry);
  // Most recent first. Past events the user didn't attend are not shown.
  const past = events
    .filter((event) => isPast(event.date, event.time) && attended(event))
    .sort((left, right) => compareEventsByExpiry(right, left));

  const renderCard = (event: Event) => (
    <EventCard
      key={event.id}
      event={event}
      host={getUserById(event.hostId)}
      isDeclined={getGuestStatus(event, mockCurrentUserId) === "declined"}
      onPress={() =>
        router.push({ pathname: "/event/[id]", params: { id: event.id } })
      }
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
          <View className="flex-row items-center justify-between gap-4">
            <Text className="font-display-700 text-3xl text-ink">
              My Events
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="New event"
              className="min-h-11 min-w-11 items-center justify-center rounded-card border-card border-ink bg-accent px-3"
              style={{ boxShadow: Shadows.hard }}
              onPress={() => router.push("/event-form")}
            >
              <Text className="font-sans-700 text-sm uppercase text-accentFg">
                New event
              </Text>
            </Pressable>
          </View>
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
