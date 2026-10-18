import { createContext, useContext, useState, type ReactNode } from "react";
import type { Event } from "@/constants/event";
import { mockEvents } from "@/mocks/mock-data";

type EventStore = {
  events: Event[];
  createEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
};

const EventsContext = createContext<EventStore | null>(null);

/** In-memory only: changes reset when the app restarts. Never mutates `mockEvents`. */
export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(() => [...mockEvents]);

  const createEvent = (event: Event) =>
    setEvents((current) => [...current, event]);
  const updateEvent = (event: Event) =>
    setEvents((current) =>
      current.map((existing) => (existing.id === event.id ? event : existing)),
    );

  return (
    <EventsContext value={{ events, createEvent, updateEvent }}>
      {children}
    </EventsContext>
  );
}

function useEventStore(): EventStore {
  const store = useContext(EventsContext);
  if (!store) {
    throw new Error("useEventStore must be used inside EventsProvider");
  }
  return store;
}

export function useEvents(): Event[] {
  return useEventStore().events;
}

export function useEvent(id: string | undefined): Event | undefined {
  return useEventStore().events.find((event) => event.id === id);
}

export function useEventActions(): Pick<
  EventStore,
  "createEvent" | "updateEvent"
> {
  const { createEvent, updateEvent } = useEventStore();
  return { createEvent, updateEvent };
}
