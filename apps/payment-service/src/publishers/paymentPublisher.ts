import type { Channel } from "amqplib";
import { publishEvent } from "@gajayana/shared";
import {
  ROUTING_KEYS,
  type PaymentCompletedPayload,
  type PaymentFailedPayload,
} from "@gajayana/shared";

export function publishPaymentCompleted(channel: Channel, payload: PaymentCompletedPayload): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.PAYMENT_COMPLETED, payload);
}

export function publishPaymentFailed(channel: Channel, payload: PaymentFailedPayload): Promise<void> {
  return publishEvent(channel, ROUTING_KEYS.PAYMENT_FAILED, payload);
}
