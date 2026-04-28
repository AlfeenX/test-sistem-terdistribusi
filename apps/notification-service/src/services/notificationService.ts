import { prisma } from "../lib/prisma.js";
import { createHash } from "crypto";

function hashPayload(payload: object): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function shouldSend(eventType: string, payload: object, _userId?: string): Promise<boolean> {
  const payloadHash = hashPayload(payload);
  const existing = await prisma.notificationLog.findUnique({
    where: {
      eventType_payloadHash: { eventType, payloadHash },
    },
  });
  return !existing;
}

export async function logSent(eventType: string, payload: object, channel: string, userId?: string): Promise<void> {
  const payloadHash = hashPayload(payload);
  await prisma.notificationLog.create({
    data: {
      eventType,
      payloadHash,
      channel,
      userId: userId ?? null,
    },
  });
}
