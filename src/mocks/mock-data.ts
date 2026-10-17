import type { Event } from "@/constants/event";
import type { User } from "@/constants/user";
import { shiftDateByDays, toDateInputValue } from "@/lib/event-date";

const today = new Date();

export const mockUsers: User[] = [
  { id: "u1", firstName: "Catie", lastName: "Rencricca" },
  { id: "u2", firstName: "Felicia", lastName: "Nara" },
  { id: "u3", firstName: "Aidan", lastName: "Cuite" },
  { id: "u4", firstName: "Marguerite", lastName: "Wang" },
  { id: "u6", firstName: "Zach", lastName: "Baugh" },
  { id: "u7", firstName: "Marissa", lastName: "Catalano" },
];

export function getUserById(userId: string): User | undefined {
  return mockUsers.find((user) => user.id === userId);
}

// Catie R., stands in for the signed-in user until auth exists.
export const mockCurrentUserId = "u1";

export const mockEvents: Event[] = [
  {
    id: "e1",
    hostId: "u3",
    title: "Two extra tickets for Friday concert",
    description:
      "Aidan already bought two, then I accidentally bought two more. We need two more people from our circles and can meet before doors.",
    date: toDateInputValue(shiftDateByDays(today, 1)),
    time: "19:30",
    location: "Brooklyn Mirage, 140 Stewart Ave, Brooklyn",
    access: "open",
    status: "active",
    guests: [
      { userId: "u1", status: "requested" },
      { userId: "u2", status: "requested" },
      { userId: "u7", status: "requested" },
      { userId: "u4", status: "confirmed" },
    ],
    capacity: 4,
    tickets: 2,
  },
  {
    id: "e2",
    hostId: "u1",
    title: "Coffee and planning session",
    description:
      "Low-pressure meetup to lock in spring plans so we stop double-booking each other.",
    date: toDateInputValue(shiftDateByDays(today, 3)),
    time: "18:15",
    location: "Williamsburg",
    access: "open",
    status: "active",
    guests: [
      { userId: "u7", status: "requested" },
      { userId: "u6", status: "confirmed" },
    ],
    capacity: 3,
    tickets: null,
  },
  {
    id: "e3",
    hostId: "u6",
    title: "Sunday picnic + cards",
    description:
      "Bring snacks and a blanket. Exact lawn location goes into chat once first person arrives.",
    // Always yesterday, so it reads as past via isEventExpired.
    date: toDateInputValue(shiftDateByDays(today, -1)),
    time: "12:00",
    location: "Prospect Park",
    access: "open",
    status: "active",
    guests: [
      { userId: "u1", status: "declined" },
      { userId: "u2", status: "requested" },
      { userId: "u3", status: "requested" },
      { userId: "u4", status: "confirmed" },
    ],
    capacity: 3,
    tickets: null,
  },
  {
    id: "e4",
    hostId: "u4",
    title: "Dinner reservation already confirmed",
    description:
      "Direct schedule with seats already assigned. Posting publicly so everyone knows this plan is locked.",
    date: toDateInputValue(shiftDateByDays(today, 2)),
    time: "19:40",
    location: "Lilia, 567 Union Ave, Brooklyn",
    access: "invite_only",
    status: "active",
    guests: [
      { userId: "u1", status: "invited" },
      { userId: "u3", status: "invited" },
    ],
    capacity: 2,
    tickets: null,
  },
  {
    id: "e5",
    hostId: "u1",
    title: "Spontaneous ramen if anyone is nearby",
    description:
      "No rigid start time, just a same-night dinner option for anyone in the area.",
    date: toDateInputValue(shiftDateByDays(today, 6)),
    time: "20:00",
    location: "East Village",
    access: "open",
    status: "active",
    guests: [
      { userId: "u2", status: "requested" },
      { userId: "u6", status: "requested" },
    ],
    capacity: null,
    tickets: null,
  },
];
