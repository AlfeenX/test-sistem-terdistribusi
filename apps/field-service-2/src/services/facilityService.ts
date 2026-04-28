import { prisma } from "../lib/prisma.js";
import type { Facility, FacilityType, Slot } from "../generated/client.js";
import type { Prisma } from "../generated/client.js";

export async function createFacility(data: {
  name: string;
  facilityTypeId: string;
  hourlyRate: number;
}): Promise<Facility> {
  return prisma.facility.create({
    data: {
      name: data.name,
      facilityTypeId: data.facilityTypeId,
      hourlyRate: data.hourlyRate,
    },
  });
}

export async function findFacilityById(id: string): Promise<(Facility & { facilityType: FacilityType }) | null> {
  return prisma.facility.findUnique({
    where: { id },
    include: { facilityType: true },
  });
}

export async function listFacilities(limit = 50, offset = 0): Promise<(Facility & { facilityType: FacilityType })[]> {
  return prisma.facility.findMany({
    take: limit,
    skip: offset,
    include: { facilityType: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFacilityTypes(): Promise<FacilityType[]> {
  return prisma.facilityType.findMany({ orderBy: { name: "asc" } });
}

export async function createSlot(data: {
  facilityId: string;
  slotDate: Date;
  startTime: string;
  endTime: string;
}): Promise<Slot> {
  return prisma.slot.create({
    data: {
      ...data,
      status: "available",
    },
  });
}

export async function findSlotById(id: string): Promise<(Slot & { facility: Facility }) | null> {
  return prisma.slot.findUnique({
    where: { id },
    include: { facility: true },
  });
}

export async function findAvailableSlots(
  facilityId: string,
  slotDate: Date,
  limit = 100
): Promise<(Slot & { facility: Facility })[]> {
  const startOfDay = new Date(slotDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(slotDate);
  endOfDay.setUTCHours(23, 59, 59, 999);
  return prisma.slot.findMany({
    where: {
      facilityId,
      slotDate: { gte: startOfDay, lte: endOfDay },
      status: "available",
    },
    take: limit,
    include: { facility: true },
    orderBy: [{ slotDate: "asc" }, { startTime: "asc" }],
  });
}

export async function updateSlotStatus(id: string, status: string): Promise<Slot> {
  return prisma.slot.update({
    where: { id },
    data: { status },
  });
}

export async function updateSlot(id: string, data: Prisma.SlotUpdateInput): Promise<Slot> {
  return prisma.slot.update({
    where: { id },
    data,
  });
}
