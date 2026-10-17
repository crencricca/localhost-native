import { Pressable, Text, View } from "react-native";
import type { Event } from "@/constants/event";
import { Shadows } from "@/constants/theme";
import type { User } from "@/constants/user";
import { formatEventDateTime } from "@/lib/event-date";
import { formatHostLabel } from "@/lib/event-hosts";

export const chipClassName =
  "self-start rounded-card bg-chip px-2 py-0.5 font-sans-600 text-xs uppercase text-chipInk";

type EventCardProps = {
  event: Event;
  host: User | undefined;
  isPast: boolean;
  isDeclined: boolean;
  onPress: () => void;
};

export default function EventCard({
  event,
  host,
  isPast,
  isDeclined,
  onPress,
}: EventCardProps) {
  // Falls back to the date alone when time is null.
  const dateTime = formatEventDateTime(event.date, event.time);
  // Null when the host is unknown, which hides the host line.
  const hostLabel = formatHostLabel(host);
  const label = [
    event.title,
    dateTime,
    hostLabel,
    event.location,
    isPast ? "Past" : null,
    isDeclined ? "Declined" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="gap-1 rounded-card border-card border-ink bg-surfaceRaised p-5"
      // Nativewind maps shadow-* to iOS-only shadow props; boxShadow renders on both platforms.
      style={{ boxShadow: Shadows.hard }}
    >
      <Text className="font-display-700 text-2xl uppercase text-ink">
        {event.title}
      </Text>
      <Text className="font-sans-600 text-sm text-ink">{dateTime}</Text>
      {hostLabel && (
        <Text className="font-sans-500 text-xs uppercase text-ink">
          {hostLabel}
        </Text>
      )}
      <Text className="font-sans text-sm text-ink">{event.location}</Text>
      {(isPast || isDeclined) && (
        <View className="flex-row flex-wrap gap-2">
          {isPast && <Text className={chipClassName}>Past</Text>}
          {isDeclined && <Text className={chipClassName}>Declined</Text>}
        </View>
      )}
    </Pressable>
  );
}
