import { Channel } from "amqplib";
import { publishEvent } from "@gajayana/shared";
import { ROUTING_KEYS, type BookingConfirmedPayload, type BookingCreatedPayload, type BookingCancelledPayload } from "@gajayana/shared";

export function publishBookingConfirmed(channel: Channel, payload: BookingConfirmedPayload): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.BOOKING_CONFIRMED, payload);
}

export function publishBookingCancelled(channel: Channel, payload: BookingCancelledPayload): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.BOOKING_CANCELLED, payload);
}

export function publishBookingCreated(channel: Channel, payload: BookingCreatedPayload): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.BOOKING_CREATED, payload);
}