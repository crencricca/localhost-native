import { Text, View } from "react-native";
import type { Event } from "@/constants/event";
import { formatEventDateTime } from "@/lib/event-date";

type EventCardProps = {
  event: Event;
  isPast: boolean;
};

export default function EventCard({ event, isPast }: EventCardProps) {
  // Falls back to the date alone when time is null.
  const dateTime = formatEventDateTime(event.date, event.time);
  const label = [
    event.title,
    dateTime,
    event.hostId,
    event.location,
    isPast ? "Past" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <View accessible accessibilityLabel={label}>
      <Text>{event.title}</Text>
      <Text>{dateTime}</Text>
      <Text>{event.hostId}</Text>
      <Text>{event.location}</Text>
      {isPast && <Text>Past</Text>}
    </View>
  );
}
