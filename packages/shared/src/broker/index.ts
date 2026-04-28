import amqp, { Channel, ChannelModel } from "amqplib";
import { EXCHANGE_NAME } from "../events/index.js";

const EXCHANGE_TYPE = "topic";

export async function connectRabbitMQ(
  url: string,
  retries = 5,
  delayMs = 1000,
): Promise<{ connection: ChannelModel; channel: Channel }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await amqp.connect(url);
      const channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
        durable: true,
      });
      return { connection, channel };
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = delayMs * 2 ** (attempt - 1);
      console.log(
        `RabbitMQ connection attempt ${attempt}/${retries} failed, retrying in ${wait}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
  throw new Error("RabbitMQ connection failed after all retries");
}

export async function publishEvent(
  channel: Channel,
  routingKey: string,
  payload: object,
): Promise<void> {
  const content = Buffer.from(JSON.stringify(payload));
  channel.publish(EXCHANGE_NAME, routingKey, content, {
    persistent: true,
    contentType: "application/json",
  });
}

export async function subscribe(
  channel: Channel,
  queueName: string,
  routingKeys: string[],
  handler: (routingKey: string, payload: unknown) => Promise<void>,
): Promise<void> {
  await channel.assertQueue(queueName, { durable: true });
  for (const key of routingKeys) {
    await channel.bindQueue(queueName, EXCHANGE_NAME, key);
  }
  channel.consume(
    queueName,
    async (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString()) as unknown;
        await handler(msg.fields.routingKey, payload);
        channel.ack(msg);
      } catch (err) {
        channel.nack(msg, false, true);
      }
    },
    { noAck: false },
  );
}
