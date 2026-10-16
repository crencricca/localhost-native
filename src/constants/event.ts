import type { Guest } from "@/constants/guest";

export type EventAccess = "invite_only" | "open" | "request";
export type EventStatus = "active" | "cancelled" | "past";

export type Event = {
  id: string;
  hostId: string;
  title: string;
  location: string;
  access: EventAccess;
  date: string;
  guests: Guest[];
  status: EventStatus;
  time: string | null;
  description: string | null;
  capacity: number | null;
  tickets: number | null;
};
