import type { Request, Response } from "express";
import * as facilityService from "../services/facilityService.js";
import { getLogger } from "@gajayana/shared";
import { getChannel } from "../subscribers/index.js";
import { publishSlotBooked, publishSlotReleased } from "../publishers/fieldPublisher.js";

const log = getLogger("field-service");

export async function createSlot(req: Request, res: Response): Promise<void> {
  try {
    const { facilityId, slotDate, startTime, endTime } = req.body as {
      facilityId: string;
      slotDate: string;
      startTime: string;
      endTime: string;
    };
    if (!facilityId || !slotDate || !startTime || !endTime) {
      res.status(400).json({ error: "facilityId, slotDate, startTime, endTime required" });
      return;
    }
    const slot = await facilityService.createSlot({
      facilityId,
      slotDate: new Date(slotDate),
      startTime,
      endTime,
    });
    res.status(201).json(slot);
  } catch (e) {
    log.error("createSlot failed", e);
    res.status(500).json({ error: "Failed to create slot" });
  }
}

export async function getSlot(req: Request, res: Response): Promise<void> {
  const slot = await facilityService.findSlotById(req.params["id"]! as string);
  if (!slot) {
    res.status(404).json({ error: "Slot not found" });
    return;
  }
  res.json(slot);
}

export async function getAvailableSlots(req: Request, res: Response): Promise<void> {
  const facilityId = req.params["facilityId"]!;
  const dateStr = req.query["date"] as string;
  if (!dateStr) {
    res.status(400).json({ error: "query date required (YYYY-MM-DD)" });
    return;
  }
  const slots = await facilityService.findAvailableSlots(
    facilityId as string,
    new Date(dateStr)
  );
  res.json(slots);
}

export async function reserveSlot(req: Request, res: Response): Promise<void> {
  try {
    const slot = await facilityService.findSlotById(req.params["id"]! as string);
    if (!slot) {
      res.status(404).json({ error: "Slot not found" });
      return;
    }
    if (slot.status !== "available") {
      res.status(409).json({ error: "Slot not available" });
      return;
    }
    const updated = await facilityService.updateSlotStatus(slot.id, "reserved");
    const channel = getChannel();
    if (channel) {
      await publishSlotBooked(channel, {
        slotId: updated.id,
        facilityId: updated.facilityId,
        slotDate: updated.slotDate.toISOString().slice(0, 10),
        startTime: updated.startTime,
        endTime: updated.endTime,
        bookingId: (req.body as { bookingId?: string }).bookingId,
      });
    }
    res.json(updated);
  } catch (e) {
    log.error("reserveSlot failed", e);
    res.status(500).json({ error: "Failed to reserve slot" });
  }
}

export async function releaseSlot(req: Request, res: Response): Promise<void> {
  try {
    const slot = await facilityService.findSlotById(req.params["id"]! as string);
    if (!slot) {
      res.status(404).json({ error: "Slot not found" });
      return;
    }
    const updated = await facilityService.updateSlotStatus(slot.id, "available");
    const channel = getChannel();
    if (channel) {
      await publishSlotReleased(channel, {
        slotId: updated.id,
        facilityId: updated.facilityId,
        slotDate: updated.slotDate.toISOString().slice(0, 10),
      });
    }
    res.json(updated);
  } catch (e) {
    log.error("releaseSlot failed", e);
    res.status(500).json({ error: "Failed to release slot" });
  }
}

