import { connectRabbitMQ } from "@gajayana/shared";
import { config } from "../config/index.js";
import { getLogger } from "@gajayana/shared";

const log = getLogger("field-service");

export async function startSubscribers(): Promise<void> {
  try {
    const { channel } = await connectRabbitMQ(config.rabbitmqUrl);
    (global as { rabbitChannel?: typeof channel }).rabbitChannel = channel;
    log.info("RabbitMQ connected for field-service");
  } catch (err) {
    log.error("RabbitMQ connection failed", err);
    throw err;
  }
}

export function getChannel(): import("amqplib").Channel | undefined {
  return (global as { rabbitChannel?: import("amqplib").Channel }).rabbitChannel;
}
