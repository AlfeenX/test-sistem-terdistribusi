import { config } from "../config/index.js";
import { getLogger } from "@gajayana/shared";

const log = getLogger("booking-service");
const baseUrl = config.fieldServiceUrl;

export async function reserveSlot(slotId: string, bookingId: string): Promise<{ id: string; status: string }> {
  const res = await fetch(`${baseUrl}/slots/${slotId}/reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId }),
  });
  if (!res.ok) {
    const text = await res.text();
    log.error("reserveSlot failed", undefined, { slotId, status: res.status, body: text });
    throw new Error(`Failed to reserve slot: ${res.status} ${text}`);
  }
  return (await res.json()) as { id: string; status: string };
}

export async function releaseSlot(slotId: string): Promise<void> {
  const res = await fetch(`${baseUrl}/slots/${slotId}/release`, { method: "POST" });
  if (!res.ok) {
    const text = await res.text();
    log.warn("releaseSlot failed", { slotId, status: res.status, body: text });
  }
}
