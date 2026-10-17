import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EventCard from "@/components/EventCard/EventCard";
import { compareEventsByExpiry, isEventExpired } from "@/lib/event-date";
import { mockEvents } from "@/mocks/mock-data";

export default function Index() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const isPast = (date: string, time: string | null) =>
    isEventExpired(date, time, now);
  const upcoming = mockEvents
    .filter((event) => !isPast(event.date, event.time))
    .sort(compareEventsByExpiry);
  const past = mockEvents
    .filter((event) => isPast(event.date, event.time))
    .sort(compareEventsByExpiry);

  return (
    // No header on this screen. The top inset sits outside the list so the
    // canvas covers the status bar and scrolled content never shows behind it.
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-4 p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        data={[...upcoming, ...past]}
        keyExtractor={(event) => event.id}
        ListHeaderComponent={
          <Text className="font-display-700 text-3xl text-ink">My Events</Text>
        }
        renderItem={({ item }) => (
          <EventCard event={item} isPast={isPast(item.date, item.time)} />
        )}
      />
    </View>
  );
}
