import { connectRabbitMQ, subscribe, ROUTING_KEYS } from "@gajayana/shared";
import { config } from "../config/index.js";
import { getLogger } from "@gajayana/shared";
import type { BookingConfirmedPayload } from "@gajayana/shared";
import * as invoiceService from "../services/invoiceService.js";

const log = getLogger("payment-service");
const QUEUE = "payment.booking_confirmed";

export async function startSubscribers(): Promise<void> {
  const { channel } = await connectRabbitMQ(config.rabbitmqUrl);
  (global as { rabbitChannel?: typeof channel }).rabbitChannel = channel;
  await subscribe(channel, QUEUE, [ROUTING_KEYS.BOOKING_CONFIRMED], async (routingKey: string, payload: unknown) => {
    log.info("Received event", { routingKey, payload });
    if (routingKey === ROUTING_KEYS.BOOKING_CONFIRMED) {
      const p = payload as BookingConfirmedPayload;
      try {
        const existing = await invoiceService.findInvoiceByBookingId(p.bookingId);
        if (existing) {
          log.info("Invoice already exists for booking", { bookingId: p.bookingId });
          return;
        }
        const dueAt = new Date();
        dueAt.setDate(dueAt.getDate() + 7);
        await invoiceService.createInvoice({
          bookingId: p.bookingId,
          userId: p.userId,
          amount: p.totalAmount,
          dueAt,
        });
        log.info("Invoice created for booking", { bookingId: p.bookingId });
      } catch (err) {
        log.error("Failed to create invoice from booking", err, { bookingId: p.bookingId });
        throw err;
      }
    }
  });
  log.info("Payment-service subscribers started");
}

export function getChannel(): import("amqplib").Channel | undefined {
  return (global as { rabbitChannel?: import("amqplib").Channel }).rabbitChannel;
}
