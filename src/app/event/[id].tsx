import { createEventInCalendarAsync } from "expo-calendar/legacy";
import * as Linking from "expo-linking";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { chipClassName } from "@/components/EventCard/EventCard";
import type { Event } from "@/constants/event";
import type { Guest } from "@/constants/guest";
import { Shadows } from "@/constants/theme";
import { buildDeviceCalendarEvent } from "@/lib/device-calendar-event";
import { formatEventDateTime, isEventExpired } from "@/lib/event-date";
import {
  formatGoingHeading,
  formatHostTicketsLeft,
  formatSpotsLeft,
  getGoingGuests,
  getInterestedGuests,
} from "@/lib/event-guests";
import {
  eventIsVisibleToUser,
  formatHostLabel,
  getGuestStatus,
  userIsHost,
} from "@/lib/event-hosts";
import { buildGoogleCalendarRenderUrl } from "@/lib/google-calendar-url";
import { tokenizeLinks } from "@/lib/linkify";
import { buildNativeMapsUrl } from "@/lib/native-maps-url";
import { buildShortDisplayName } from "@/lib/user-name";
import { getUserById, mockCurrentUserId } from "@/mocks/mock-data";
import { useEvent } from "@/state/events";

function openUrl(url: string, failureMessage: string) {
  Linking.openURL(url).catch(() => Alert.alert(failureMessage));
}

// iOS rejects with this code when another calendar sheet is already open.
function isDialogInProgressError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "ERR_EVENT_DIALOG_IN_PROGRESS"
  );
}

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const event = useEvent(id);

  return (
    <>
      {/* Back button only; the title is in the body. headerBackTitle gives the
          chevron a "Back" label instead of the previous route's name. */}
      <Stack.Screen
        options={{
          title: "",
          headerBackTitle: "Back",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {!event ? (
          <Message text="Event not found" />
        ) : !eventIsVisibleToUser(event, mockCurrentUserId) ? (
          <Message text="You don't have access to this event" />
        ) : (
          <EventDetails event={event} />
        )}
      </ScrollView>
    </>
  );
}

function Message({ text }: { text: string }) {
  return (
    <View
      className="rounded-card border-card border-ink bg-surfaceRaised p-5"
      style={{ boxShadow: Shadows.hard }}
    >
      <Text className="font-display-700 text-2xl uppercase text-ink">
        {text}
      </Text>
    </View>
  );
}

// Only rendered after the visibility check passes.
function EventDetails({ event }: { event: Event }) {
  const isPast = isEventExpired(event.date, event.time, new Date());
  const isDeclined = getGuestStatus(event, mockCurrentUserId) === "declined";
  const canEdit = !isPast && userIsHost(event, mockCurrentUserId);
  const dateTime = formatEventDateTime(event.date, event.time);
  const hostLabel = formatHostLabel(getUserById(event.hostId));
  const mapsUrl = buildNativeMapsUrl(event.location, Platform.OS);
  const calendarInput = {
    title: event.title,
    date: event.date,
    time: event.time,
    description: event.description,
    location: event.location,
  };
  const calendarUrl = isPast
    ? null
    : buildGoogleCalendarRenderUrl(calendarInput);
  const calendarEvent = isPast ? null : buildDeviceCalendarEvent(calendarInput);
  const calendarSheetOpen = useRef(false);

  // Native opens the system New Event sheet; web, or a failed sheet, uses the Google link.
  function addToCalendar(url: string) {
    if (
      (Platform.OS !== "ios" && Platform.OS !== "android") ||
      !calendarEvent
    ) {
      openUrl(url, "Couldn't open Google Calendar");
      return;
    }
    if (calendarSheetOpen.current) {
      return;
    }
    calendarSheetOpen.current = true;
    createEventInCalendarAsync(calendarEvent)
      .catch((error: unknown) => {
        if (!isDialogInProgressError(error)) {
          openUrl(url, "Couldn't open Google Calendar");
        }
      })
      .finally(() => {
        calendarSheetOpen.current = false;
      });
  }

  return (
    <View className="gap-4">
      <View
        className="gap-2 rounded-card border-card border-ink bg-surfaceRaised p-5"
        // Nativewind maps shadow-* to iOS-only shadow props; boxShadow renders on both platforms.
        style={{ boxShadow: Shadows.hard }}
      >
        <Text
          accessibilityRole="header"
          className="font-display-700 text-3xl uppercase text-ink"
        >
          {event.title}
        </Text>
        <Text className="font-sans-600 text-base text-ink">{dateTime}</Text>
        {hostLabel && (
          <Text className="font-sans-500 text-sm uppercase text-ink">
            {hostLabel}
          </Text>
        )}
        {mapsUrl ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open ${event.location} in Maps`}
            className="min-h-11 justify-center self-start"
            onPress={() => openUrl(mapsUrl, "Couldn't open Maps")}
          >
            <Text className="font-sans-600 text-base text-accent underline">
              {event.location}
            </Text>
          </Pressable>
        ) : (
          <Text className="font-sans text-base text-ink">{event.location}</Text>
        )}
        {event.description !== null && (
          <Text className="font-sans text-base text-ink">
            {tokenizeLinks(event.description).map((token, index) =>
              token.type === "url" ? (
                <Text
                  key={index}
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${token.value}`}
                  className="text-accent underline"
                  onPress={() => openUrl(token.href, "Couldn't open link")}
                >
                  {token.value}
                </Text>
              ) : (
                token.value
              ),
            )}
          </Text>
        )}
        {(isPast || isDeclined) && (
          <View className="flex-row flex-wrap gap-2">
            {isPast && <Text className={chipClassName}>Past</Text>}
            {isDeclined && <Text className={chipClassName}>Declined</Text>}
          </View>
        )}
        {calendarUrl && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add to calendar"
            className="mt-2 min-h-11 items-center justify-center rounded-card border-card border-ink bg-accent px-4 py-2"
            style={{ boxShadow: Shadows.hard }}
            onPress={() => addToCalendar(calendarUrl)}
          >
            <Text className="font-sans-700 text-base uppercase text-accentFg">
              Add to calendar
            </Text>
          </Pressable>
        )}
        {canEdit && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit"
            className="mt-2 min-h-11 items-center justify-center rounded-card border-card border-ink bg-surface px-4 py-2"
            style={{ boxShadow: Shadows.hard }}
            onPress={() =>
              router.push({ pathname: "/event-form", params: { id: event.id } })
            }
          >
            <Text className="font-sans-700 text-base uppercase text-ink">
              Edit
            </Text>
          </Pressable>
        )}
      </View>
      <GuestSection event={event} isPast={isPast} />
    </View>
  );
}

type GuestRow = { key: string; label: string; isViewer: boolean };

// "(You)" first, then alphabetical by short name. Unknown users keep a row so the list matches the count.
function toGuestRows(guests: Guest[]): GuestRow[] {
  return guests
    .map((guest) => {
      const user = getUserById(guest.userId);
      const name = user ? buildShortDisplayName(user) : "Unknown guest";
      const isViewer = guest.userId === mockCurrentUserId;
      return {
        key: guest.userId,
        label: isViewer ? `${name} (You)` : name,
        isViewer,
      };
    })
    .sort(
      (a, b) =>
        Number(b.isViewer) - Number(a.isViewer) ||
        a.label.localeCompare(b.label),
    );
}

function GuestSection({ event, isPast }: { event: Event; isPast: boolean }) {
  const goingGuests = getGoingGuests(event, mockCurrentUserId);
  const interestedGuests = getInterestedGuests(event, mockCurrentUserId);
  const spotsLeft = isPast ? null : formatSpotsLeft(event);
  const ticketsLeft = isPast ? null : formatHostTicketsLeft(event);

  return (
    <View
      className="gap-2 rounded-card border-card border-ink bg-surfaceRaised p-5"
      style={{ boxShadow: Shadows.hard }}
    >
      <Text
        accessibilityRole="header"
        className="font-display-700 text-2xl uppercase text-ink"
      >
        {formatGoingHeading(event)}
      </Text>
      {spotsLeft && (
        <Text className="font-sans-600 text-base text-ink">{spotsLeft}</Text>
      )}
      {ticketsLeft && (
        <Text className="font-sans-600 text-base text-ink">{ticketsLeft}</Text>
      )}
      {goingGuests === null ? (
        <Text className="font-sans text-base text-ink">
          Only guests who are going can see who&apos;s coming.
        </Text>
      ) : (
        <GuestRows guests={goingGuests} emptyText="No one is going yet." />
      )}
      {interestedGuests !== null && (
        <>
          <Text
            accessibilityRole="header"
            className="mt-4 font-display-700 text-2xl uppercase text-ink"
          >
            Interested
          </Text>
          <GuestRows guests={interestedGuests} emptyText="No requests yet." />
        </>
      )}
    </View>
  );
}

function GuestRows({
  guests,
  emptyText,
}: {
  guests: Guest[];
  emptyText: string;
}) {
  if (guests.length === 0) {
    return <Text className="font-sans text-base text-ink">{emptyText}</Text>;
  }
  return toGuestRows(guests).map((row) => (
    <Text key={row.key} className="font-sans-500 text-base text-ink">
      {row.label}
    </Text>
  ));
}
