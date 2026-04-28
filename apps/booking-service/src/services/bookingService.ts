import { prisma, type Booking } from "../lib/prisma.js";

export async function createBooking(data: {
  userId: string;
  facilityId: string;
  slotId: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  totalAmount: number;
}): Promise<Booking> {
  return prisma.booking.create({
    data: {
      ...data,
      status: "pending",
    },
  });
}

export async function findBookingById(id: string): Promise<Booking | null> {
  return prisma.booking.findUnique({
    where: { id },
  });
}

export async function confirmBooking(id: string): Promise<Booking> {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "pending") throw new Error("Booking cannot be confirmed");
  const [updated] = await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: { status: "confirmed" },
    }),
    prisma.bookingStatusHistory.create({
      data: {
        bookingId: id,
        fromStatus: "pending",
        toStatus: "confirmed",
      },
    }),
  ]);
  return updated;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking not found");
  const [updated] = await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    }),
    prisma.bookingStatusHistory.create({
      data: {
        bookingId: id,
        fromStatus: booking.status,
        toStatus: "cancelled",
      },
    }),
  ]);
  return updated;
}

export async function listBookingsByUser(userId: string, limit = 50, offset = 0): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: { userId },
    take: limit,
    skip: offset,
    orderBy: [{ bookingDate: "desc" }, { startTime: "desc" }],
  });
}

export async function listBookingsByStatus(status: string, limit = 50, offset = 0): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: { status },
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });
}
