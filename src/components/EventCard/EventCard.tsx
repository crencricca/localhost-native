import { Text, View } from "react-native";
import type { Event } from "@/constants/event";
import { Shadows } from "@/constants/theme";
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
    <View
      accessible
      accessibilityLabel={label}
      className="gap-1 rounded-card border-card border-ink bg-surfaceRaised p-5"
      // Nativewind maps shadow-* to iOS-only shadow props; boxShadow renders on both platforms.
      style={{ boxShadow: Shadows.hard }}
    >
      <Text className="font-display-700 text-2xl uppercase text-ink">
        {event.title}
      </Text>
      <Text className="font-sans-600 text-sm text-ink">{dateTime}</Text>
      <Text className="font-sans-500 text-xs uppercase text-muted">
        {event.hostId}
      </Text>
      <Text className="font-sans text-sm text-ink">{event.location}</Text>
      {isPast && (
        <Text className="self-start font-sans-600 text-xs uppercase text-muted opacity-70">
          Past
        </Text>
      )}
    </View>
  );
}
