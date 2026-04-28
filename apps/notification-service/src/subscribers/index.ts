import { connectRabbitMQ, subscribe, ROUTING_KEYS } from "@gajayana/shared";
import { config } from "../config/index.js";
import { getLogger } from "@gajayana/shared";
import * as notificationService from "../services/notificationService.js";
import type {
  UserCreatedPayload,
  BookingCreatedPayload,
  BookingConfirmedPayload,
  PaymentCompletedPayload,
} from "@gajayana/shared";

const log = getLogger("notification-service");
const QUEUE = "notification.events";

async function handleUserCreated(payload: UserCreatedPayload): Promise<void> {
  const ok = await notificationService.shouldSend(
    "user.created",
    payload,
    payload.userId,
  );
  if (!ok) return;
  log.info("Would send welcome email", {
    userId: payload.userId,
    email: payload.email,
  });
  await notificationService.logSent(
    "user.created",
    payload,
    "email",
    payload.userId,
  );
}

async function handleBookingCreated(
  payload: BookingCreatedPayload,
): Promise<void> {
  const ok = await notificationService.shouldSend(
    "booking.created",
    payload,
    payload.userId,
  );
  if (!ok) return;
  log.info("Would send booking confirmation email", {
    bookingId: payload.bookingId,
    userId: payload.userId,
  });
  await notificationService.logSent(
    "booking.created",
    payload,
    "email",
    payload.userId,
  );
}

async function handleBookingConfirmed(
  payload: BookingConfirmedPayload,
): Promise<void> {
  const ok = await notificationService.shouldSend(
    "booking.confirmed",
    payload,
    payload.userId,
  );
  if (!ok) return;
  log.info("Would send booking confirmed email", {
    bookingId: payload.bookingId,
  });
  await notificationService.logSent(
    "booking.confirmed",
    payload,
    "email",
    payload.userId,
  );
}

async function handlePaymentCompleted(
  payload: PaymentCompletedPayload,
): Promise<void> {
  const ok = await notificationService.shouldSend(
    "payment.completed",
    payload,
    payload.userId,
  );
  if (!ok) return;
  log.info("Would send payment receipt email", {
    paymentId: payload.paymentId,
    bookingId: payload.bookingId,
  });
  await notificationService.logSent(
    "payment.completed",
    payload,
    "email",
    payload.userId,
  );
}

export async function startSubscribers(): Promise<void> {
  const { channel } = await connectRabbitMQ(config.rabbitmqUrl);
  await subscribe(
    channel,
    QUEUE,
    [
      ROUTING_KEYS.USER_CREATED,
      ROUTING_KEYS.BOOKING_CREATED,
      ROUTING_KEYS.BOOKING_CONFIRMED,
      ROUTING_KEYS.PAYMENT_COMPLETED,
    ],
    async (routingKey: string, payload: unknown) => {
      log.info("Received event", { routingKey });
      try {
        if (routingKey === ROUTING_KEYS.USER_CREATED)
          await handleUserCreated(payload as UserCreatedPayload);
        else if (routingKey === ROUTING_KEYS.BOOKING_CREATED)
          await handleBookingCreated(payload as BookingCreatedPayload);
        else if (routingKey === ROUTING_KEYS.BOOKING_CONFIRMED)
          await handleBookingConfirmed(payload as BookingConfirmedPayload);
        else if (routingKey === ROUTING_KEYS.PAYMENT_COMPLETED)
          await handlePaymentCompleted(payload as PaymentCompletedPayload);
      } catch (err) {
        log.error("Notification handler failed", err, { routingKey });
        throw err;
      }
    },
  );
  log.info("Notification-service subscribers started");
}
