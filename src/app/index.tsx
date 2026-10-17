import { FlatList, Text } from "react-native";
import EventCard from "@/components/EventCard/EventCard";
import { compareEventsByExpiry, isEventExpired } from "@/lib/event-date";
import { mockEvents } from "@/mocks/mock-data";

export default function Index() {
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
    <FlatList
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-4 p-4"
      data={[...upcoming, ...past]}
      keyExtractor={(event) => event.id}
      ListHeaderComponent={
        <Text className="font-display-700 text-3xl text-ink">My Events</Text>
      }
      renderItem={({ item }) => (
        <EventCard event={item} isPast={isPast(item.date, item.time)} />
      )}
    />
  );
}
