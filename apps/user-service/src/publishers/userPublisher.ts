import type { Channel } from "amqplib";
import { publishEvent } from "@gajayana/shared";
import {
  ROUTING_KEYS,
  type UserCreatedPayload,
  type UserUpdatedPayload,
  type MembershipChangedPayload,
} from "@gajayana/shared";

export function publishUserCreated(channel: Channel, payload: UserCreatedPayload): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.USER_CREATED, payload);
}

export function publishUserUpdated(channel: Channel, payload: UserUpdatedPayload): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.USER_UPDATED, payload);
}

export function publishMembershipChanged(
  channel: Channel,
  payload: MembershipChangedPayload
): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.MEMBERSHIP_CHANGED, payload);
}
