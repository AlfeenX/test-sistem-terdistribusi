import { prisma } from "../lib/prisma.js";
import type { Facility, FacilityType, Slot } from "../generated/client.js";
import type { Prisma } from "../generated/client.js";

export async function createFacility(data: {
  name: string;
  facilityTypeId: string;
  hourlyRate: number;
}): Promise<Facility> {
  const facility = await prisma.facility.create({
    data: {
      name: data.name,
      facilityTypeId: data.facilityTypeId,
      hourlyRate: data.hourlyRate,
    },
  });

  // Automatically generate available slots for today and the next 7 days (8 days total)
  const today = new Date();
  const slotsData = [];

  for (let i = 0; i <= 7; i++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + i);
    slotDate.setUTCHours(0, 0, 0, 0);

    // Slots from 08:00 to 20:00
    for (let hour = 8; hour < 20; hour++) {
      const startTime = `${String(hour).padStart(2, "0")}:00`;
      const endTime = `${String(hour + 1).padStart(2, "0")}:00`;

      slotsData.push({
        facilityId: facility.id,
        slotDate,
        startTime,
        endTime,
        status: "available",
      });
    }
  }

  await prisma.slot.createMany({
    data: slotsData,
    skipDuplicates: true,
  });

  return facility;
}

export async function updateFacility(
  id: string,
  data: { name?: string; facilityTypeId?: string; hourlyRate?: number }
): Promise<Facility> {
  return prisma.facility.update({
    where: { id },
    data: {
      name: data.name,
      facilityTypeId: data.facilityTypeId,
      hourlyRate: data.hourlyRate,
    },
  });
}

export async function deleteFacility(id: string): Promise<Facility> {
  return prisma.facility.delete({
    where: { id },
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

export async function createFacilityType(data: { name: string }): Promise<FacilityType> {
  return prisma.facilityType.create({
    data: {
      name: data.name,
    },
  });
}

export async function updateFacilityType(id: string, data: { name: string }): Promise<FacilityType> {
  return prisma.facilityType.update({
    where: { id },
    data: {
      name: data.name,
    },
  });
}

export async function deleteFacilityType(id: string): Promise<FacilityType> {
  return prisma.facilityType.delete({
    where: { id },
  });
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
  slotDate?: Date,
  limit = 100
): Promise<(Slot & { facility: Facility })[]> {
  const whereClause: any = {
    facilityId,
    status: "available",
  };

  if (slotDate) {
    const startOfDay = new Date(slotDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(slotDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    whereClause.slotDate = { gte: startOfDay, lte: endOfDay };
  } else {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    whereClause.slotDate = { gte: today };
  }

  return prisma.slot.findMany({
    where: whereClause,
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
