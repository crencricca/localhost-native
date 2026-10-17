export type GuestStatus = "invited" | "requested" | "confirmed" | "declined";

export type Guest = {
  userId: string;
  status: GuestStatus;
  updatedAt?: string; // ISO 8601
};
