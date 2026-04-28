import { connectRabbitMQ, subscribe, ROUTING_KEYS } from "@gajayana/shared";
import { config } from "../config/index.js";
import { getLogger } from "@gajayana/shared";
import type { PaymentCompletedPayload } from "@gajayana/shared";
import * as bookingService from "../services/bookingService.js";
import { publishBookingConfirmed } from "../publishers/bookingPublisher.js";

const log = getLogger("booking-service");
const QUEUE = "booking.payment_completed";

export async function startSubscribers(): Promise<void> {
  const { channel } = await connectRabbitMQ(config.rabbitmqUrl);
  (global as { rabbitChannel?: typeof channel }).rabbitChannel = channel;
  await subscribe(
    channel,
    QUEUE,
    [ROUTING_KEYS.PAYMENT_COMPLETED],
    async (routingKey: string, payload: unknown) => {
      log.info("Received event", { routingKey, payload });
      if (routingKey === ROUTING_KEYS.PAYMENT_COMPLETED) {
        const p = payload as PaymentCompletedPayload;
        try {
          const booking = await bookingService.confirmBooking(p.bookingId);
          await publishBookingConfirmed(channel, {
            bookingId: booking.id,
            userId: booking.userId,
            facilityId: booking.facilityId,
            totalAmount: Number(booking.totalAmount),
            confirmedAt: booking.updatedAt.toISOString(),
          });
          log.info("Booking confirmed via payment", { bookingId: p.bookingId });
        } catch (err) {
          log.error("Failed to confirm booking from payment", err, {
            bookingId: p.bookingId,
          });
          throw err;
        }
      }
    },
  );
  log.info("Booking-service subscribers started");
}

export function getChannel(): import("amqplib").Channel | undefined {
  return (global as { rabbitChannel?: import("amqplib").Channel })
    .rabbitChannel;
}
