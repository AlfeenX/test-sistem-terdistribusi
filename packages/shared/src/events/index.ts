export const EXCHANGE_NAME = "gajayana_events";

export const ROUTING_KEYS = {
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  MEMBERSHIP_CHANGED: "membership.changed",
  FIELD_CREATED: "field.created",
  SLOT_BOOKED: "slot.booked",
  SLOT_RELEASED: "slot.released",
  BOOKING_CREATED: "booking.created",
  BOOKING_CONFIRMED: "booking.confirmed",
  BOOKING_CANCELLED: "booking.cancelled",
  PAYMENT_COMPLETED: "payment.completed",
  PAYMENT_FAILED: "payment.failed",
} as const;

export type RoutingKey = (typeof ROUTING_KEYS)[keyof typeof ROUTING_KEYS];

export interface UserCreatedPayload {
  userId: string;
  email: string;
  fullName: string;
  roleId: string;
  createdAt: string;
}

export interface UserUpdatedPayload {
  userId: string;
  email?: string;
  fullName?: string;
  phone?: string;
  roleId?: string;
  updatedAt: string;
}

export interface MembershipChangedPayload {
  userId: string;
  membershipId: string;
  planId: string;
  status: string;
  expiresAt: string;
}

export interface FieldCreatedPayload {
  facilityId: string;
  name: string;
  facilityTypeId: string;
  hourlyRate: number;
}

export interface SlotBookedPayload {
  slotId: string;
  facilityId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  bookingId?: string;
}

export interface SlotReleasedPayload {
  slotId: string;
  facilityId: string;
  slotDate: string;
}

export interface BookingCreatedPayload {
  bookingId: string;
  userId: string;
  facilityId: string;
  slotId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
}

export interface BookingConfirmedPayload {
  bookingId: string;
  userId: string;
  facilityId: string;
  totalAmount: number;
  confirmedAt: string;
}

export interface BookingCancelledPayload {
  bookingId: string;
  userId: string;
  cancelledAt: string;
}

export interface PaymentCompletedPayload {
  paymentId: string;
  invoiceId: string;
  bookingId: string;
  userId: string;
  amount: number;
  paidAt: string;
}

export interface PaymentFailedPayload {
  invoiceId: string;
  bookingId: string;
  reason: string;
  failedAt: string;
}

export type EventPayload =
  | UserCreatedPayload
  | UserUpdatedPayload
  | MembershipChangedPayload
  | FieldCreatedPayload
  | SlotBookedPayload
  | SlotReleasedPayload
  | BookingCreatedPayload
  | BookingConfirmedPayload
  | BookingCancelledPayload
  | PaymentCompletedPayload
  | PaymentFailedPayload;
