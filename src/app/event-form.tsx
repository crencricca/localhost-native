import {
  DateTimePicker as ComposeDateTimePicker,
  Host as ComposeHost,
} from "@expo/ui/jetpack-compose";
import { semantics } from "@expo/ui/jetpack-compose/modifiers";
import { DatePicker, Host } from "@expo/ui/swift-ui";
import { accessibilityLabel, tint } from "@expo/ui/swift-ui/modifiers";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Event, EventAccess } from "@/constants/event";
import { Colors, Shadows } from "@/constants/theme";
import {
  isEventExpired,
  toDateInputValue,
  toEventDateTime,
  toTimeInputValue,
} from "@/lib/event-date";
import {
  buildEventFromForm,
  createEventId,
  eventFormInitialValues,
  hasEventFormErrors,
  pendingRequestsRemovedByAccessChange,
  validateEventForm,
  type EventFormValues,
} from "@/lib/event-form";
import { userIsHost } from "@/lib/event-hosts";
import { mockCurrentUserId } from "@/mocks/mock-data";
import { useEvent, useEventActions } from "@/state/events";

const accessOptions: { value: EventAccess; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "request", label: "Request to join" },
  { value: "invite_only", label: "Invite only" },
];

export default function EventForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useEvent(id);
  const isEdit = id !== undefined;
  // A deep link can reach any id, so the route checks host and date itself.
  const canEdit =
    existing !== undefined &&
    userIsHost(existing, mockCurrentUserId) &&
    !isEventExpired(existing.date, existing.time, new Date());

  return isEdit && !canEdit ? (
    <>
      <Stack.Screen
        options={{ title: "Edit event", headerLeft: () => <CancelButton /> }}
      />
      <View className="flex-1 bg-canvas p-4">
        <View
          className="rounded-card border-card border-ink bg-surfaceRaised p-5"
          style={{ boxShadow: Shadows.hard }}
        >
          <Text className="font-display-700 text-2xl uppercase text-ink">
            You can&apos;t edit this event
          </Text>
        </View>
      </View>
    </>
  ) : (
    <Form existing={existing} />
  );
}

function CancelButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Cancel"
      className="min-h-11 min-w-11 justify-center"
      onPress={() => router.back()}
    >
      <Text className="font-sans-600 text-base text-ink">Cancel</Text>
    </Pressable>
  );
}

function Form({ existing }: { existing: Event | undefined }) {
  const insets = useSafeAreaInsets();
  const { createEvent, updateEvent } = useEventActions();
  const [values, setValues] = useState(() =>
    eventFormInitialValues(existing, new Date()),
  );
  const [touched, setTouched] = useState<
    Partial<Record<keyof EventFormValues, boolean>>
  >({});
  const now = new Date();
  const errors = validateEventForm(values, existing, now);
  const isValid = !hasEventFormErrors(errors);

  const setField = <K extends keyof EventFormValues>(
    key: K,
    value: EventFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setTouched((current) => ({ ...current, [key]: true }));
  };

  const save = () => {
    if (!isValid) {
      return;
    }
    if (!existing) {
      createEvent(
        buildEventFromForm(values, {
          id: createEventId(),
          hostId: mockCurrentUserId,
        }),
      );
      router.back();
      return;
    }
    const commit = () => {
      updateEvent(buildEventFromForm(values, { existing }));
      router.back();
    };
    const removed = pendingRequestsRemovedByAccessChange(
      existing,
      values.access,
    );
    if (removed.length === 0) {
      commit();
      return;
    }
    Alert.alert(
      `Remove ${removed.length} pending ${removed.length === 1 ? "request" : "requests"}?`,
      "Invite-only events are hidden from people who weren't invited.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove requests", style: "destructive", onPress: commit },
      ],
    );
  };

  // Pickers work on Dates; the form stores YYYY-MM-DD and HH:mm.
  const selectedDate = toEventDateTime(values.date, null);
  const selectedDateTime = toEventDateTime(values.date, values.time);
  const earliestDate = toEventDateTime(toDateInputValue(now), null);

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? "Edit event" : "New event",
          headerLeft: () => <CancelButton />,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save"
              accessibilityState={{ disabled: !isValid }}
              disabled={!isValid}
              className="min-h-11 min-w-11 items-end justify-center"
              onPress={save}
            >
              <Text
                className={`font-sans-700 text-base ${isValid ? "text-accent" : "text-muted"}`}
              >
                Save
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-5 p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Field
          label="Title"
          testID="event-form-title"
          value={values.title}
          onChangeText={(text) => setField("title", text)}
          error={touched.title ? errors.title : undefined}
        />
        <Field
          label="Location"
          testID="event-form-location"
          value={values.location}
          onChangeText={(text) => setField("location", text)}
          error={touched.location ? errors.location : undefined}
        />
        <Field
          label="Description"
          testID="event-form-description"
          value={values.description}
          onChangeText={(text) => setField("description", text)}
          multiline
        />

        <View className="gap-2">
          <Text className="font-sans-600 text-sm uppercase text-ink">
            Access
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {accessOptions.map((option) => {
              const selected = values.access === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected }}
                  className={`min-h-11 min-w-11 items-center justify-center rounded-card border-card px-3 ${selected ? "border-ink bg-accent" : "border-line bg-surface"}`}
                  onPress={() => setField("access", option.value)}
                >
                  <Text
                    className={`font-sans-600 text-sm ${selected ? "text-accentFg" : "text-ink"}`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-2">
          {Platform.OS === "ios" ? (
            <>
              <Host matchContents={{ vertical: true }} colorScheme="dark">
                <DatePicker
                  title="Date"
                  selection={selectedDate}
                  displayedComponents={["date"]}
                  range={{ start: earliestDate }}
                  onDateChange={(date) =>
                    setField("date", toDateInputValue(date))
                  }
                  modifiers={[tint(Colors.accent), accessibilityLabel("Date")]}
                />
              </Host>
              <Host matchContents={{ vertical: true }} colorScheme="dark">
                <DatePicker
                  title="Time"
                  selection={selectedDateTime}
                  displayedComponents={["hourAndMinute"]}
                  onDateChange={(date) =>
                    setField("time", toTimeInputValue(date))
                  }
                  modifiers={[tint(Colors.accent), accessibilityLabel("Time")]}
                />
              </Host>
            </>
          ) : (
            <>
              <Text className="font-sans-600 text-sm uppercase text-ink">
                Date
              </Text>
              <ComposeHost
                matchContents={{ vertical: true }}
                style={{ width: "100%" }}
                colorScheme="dark"
              >
                <ComposeDateTimePicker
                  displayedComponents="date"
                  initialDate={selectedDate.toISOString()}
                  selectableDates={{ start: earliestDate }}
                  color={Colors.accent}
                  onDateSelected={(date) =>
                    setField("date", toDateInputValue(date))
                  }
                  modifiers={[semantics({ contentDescription: "Date" })]}
                />
              </ComposeHost>
              <Text className="font-sans-600 text-sm uppercase text-ink">
                Time
              </Text>
              <ComposeHost
                matchContents={{ vertical: true }}
                style={{ width: "100%" }}
                colorScheme="dark"
              >
                <ComposeDateTimePicker
                  displayedComponents="hourAndMinute"
                  initialDate={selectedDateTime.toISOString()}
                  color={Colors.accent}
                  onDateSelected={(date) =>
                    setField("time", toTimeInputValue(date))
                  }
                  modifiers={[semantics({ contentDescription: "Time" })]}
                />
              </ComposeHost>
            </>
          )}
          {errors.date && (
            <Text className="font-sans text-sm text-accent3">
              {errors.date}
            </Text>
          )}
        </View>

        <Field
          label="Capacity"
          hint="Guest spots, not counting you. Leave blank for unlimited."
          testID="event-form-capacity"
          value={values.capacity}
          onChangeText={(text) => setField("capacity", text)}
          keyboardType="number-pad"
          error={errors.capacity}
        />
        <Field
          label="Tickets"
          hint="Extra tickets you already have. Leave blank for none."
          testID="event-form-tickets"
          value={values.tickets}
          onChangeText={(text) => setField("tickets", text)}
          keyboardType="number-pad"
          error={errors.tickets}
        />
      </ScrollView>
    </>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  testID: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
};

function Field({
  label,
  hint,
  testID,
  value,
  onChangeText,
  error,
  multiline,
  keyboardType,
}: FieldProps) {
  return (
    <View className="gap-2">
      <Text className="font-sans-600 text-sm uppercase text-ink">{label}</Text>
      {hint && <Text className="font-sans text-sm text-muted">{hint}</Text>}
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor={Colors.muted}
        selectionColor={Colors.accent}
        className={`min-h-11 rounded-card border-card bg-surface px-3 py-2 font-sans text-base text-ink ${error ? "border-accent3" : "border-line"} ${multiline ? "min-h-24" : ""}`}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {error && <Text className="font-sans text-sm text-accent3">{error}</Text>}
    </View>
  );
}
