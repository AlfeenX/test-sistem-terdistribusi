import type { Channel } from "amqplib";
import { publishEvent } from "@gajayana/shared";
import {
  ROUTING_KEYS,
  type FieldCreatedPayload,
  type SlotBookedPayload,
  type SlotReleasedPayload,
} from "@gajayana/shared";

export function publishFieldCreated(channel: Channel, payload: FieldCreatedPayload): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.FIELD_CREATED, payload);
}

export function publishSlotBooked(channel: Channel, payload: SlotBookedPayload): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.SLOT_BOOKED, payload);
}

export function publishSlotReleased(channel: Channel, payload: SlotReleasedPayload): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.SLOT_RELEASED, payload);
}
