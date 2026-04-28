import type { Request, Response } from "express";
import * as bookingService from "../services/bookingService.js";
import * as fieldServiceClient from "../services/fieldServiceClient.js";
import { getLogger } from "@gajayana/shared";
import { getChannel } from "../subscribers/index.js";
import {
  publishBookingCreated,
  publishBookingConfirmed,
  publishBookingCancelled,
} from "../publishers/bookingPublisher.js";

const log = getLogger("booking-service");

export async function createBooking(req: Request, res: Response): Promise<void> {
  try {
    const { userId, facilityId, slotId, bookingDate, startTime, endTime, totalAmount } = req.body as {
      userId: string;
      facilityId: string;
      slotId: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      totalAmount: number;
    };
    if (!userId || !facilityId || !slotId || !bookingDate || !startTime || !endTime || totalAmount == null) {
      res.status(400).json({ error: "userId, facilityId, slotId, bookingDate, startTime, endTime, totalAmount required" });
      return;
    }
    const booking = await bookingService.createBooking({
      userId,
      facilityId,
      slotId,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      totalAmount,
    });
    try {
      await fieldServiceClient.reserveSlot(slotId, booking.id);
    } catch (e) {
      log.error("Reserve slot failed, cancelling booking", e);
      await bookingService.cancelBooking(booking.id);
      res.status(409).json({ error: "Slot could not be reserved" });
      return;
    }
    const channel = getChannel();
    if (channel) {
      await publishBookingCreated(channel, {
        bookingId: booking.id,
        userId: booking.userId,
        facilityId: booking.facilityId,
        slotId: booking.slotId,
        bookingDate: booking.bookingDate.toISOString().slice(0, 10),
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalAmount: Number(booking.totalAmount),
      });
    }
    res.status(201).json(booking);
  } catch (e) {
    log.error("createBooking failed", e);
    res.status(500).json({ error: "Failed to create booking" });
  }
}

export async function getBooking(req: Request, res: Response): Promise<void> {
  const booking = await bookingService.findBookingById(req.params["id"]! as string);
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(booking);
}

export async function confirmBooking(req: Request, res: Response): Promise<void> {
  try {
    const booking = await bookingService.confirmBooking(req.params["id"]! as string);
    const channel = getChannel();
    if (channel) {
      await publishBookingConfirmed(channel, {
        bookingId: booking.id,
        userId: booking.userId,
        facilityId: booking.facilityId,
        totalAmount: Number(booking.totalAmount),
        confirmedAt: booking.updatedAt.toISOString(),
      });
    }
    res.json(booking);
  } catch (e) {
    log.error("confirmBooking failed", e);
    res.status(400).json({ error: (e as Error).message });
  }
}

export async function cancelBooking(req: Request, res: Response): Promise<void> {
  try {
    const booking = await bookingService.findBookingById(req.params["id"]! as string);
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    await fieldServiceClient.releaseSlot(booking.slotId);
    const updated = await bookingService.cancelBooking(booking.id);
    const channel = getChannel();
    if (channel) {
      await publishBookingCancelled(channel, {
        bookingId: updated.id,
        userId: updated.userId,
        cancelledAt: updated.updatedAt.toISOString(),
      });
    }
    res.json(updated);
  } catch (e) {
    log.error("cancelBooking failed", e);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
}

export async function listMyBookings(req: Request, res: Response): Promise<void> {
  const userId = req.params["userId"]!;
  const limit = Math.min(100, parseInt(req.query["limit"] as string) || 50);
  const offset = parseInt(req.query["offset"] as string) || 0;
  const bookings = await bookingService.listBookingsByUser(userId as string, limit, offset);
  res.json(bookings);
}
