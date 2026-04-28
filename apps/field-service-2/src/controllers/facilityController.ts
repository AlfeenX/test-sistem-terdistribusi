import type { Request, Response } from "express";
import * as facilityService from "../services/facilityService.js";
import { getLogger } from "@gajayana/shared";
import { getChannel } from "../subscribers/index.js";
import { publishFieldCreated } from "../publishers/fieldPublisher.js";

const log = getLogger("field-service");

export async function createFacility(req: Request, res: Response): Promise<void> {
  try {
    const { name, facilityTypeId, hourlyRate } = req.body as {
      name: string;
      facilityTypeId: string;
      hourlyRate: number;
    };
    if (!name || !facilityTypeId || hourlyRate == null) {
      res.status(400).json({ error: "name, facilityTypeId, hourlyRate required" });
      return;
    }
    const facility = await facilityService.createFacility({ name, facilityTypeId, hourlyRate });
    const channel = getChannel();
    if (channel) {
      await publishFieldCreated(channel, {
        facilityId: facility.id,
        name: facility.name,
        facilityTypeId: facility.facilityTypeId,
        hourlyRate: Number(facility.hourlyRate),
      });
    }
    res.status(201).json(facility);
  } catch (e) {
    log.error("createFacility failed", e);
    res.status(500).json({ error: "Failed to create facility" });
  }
}

export async function getFacility(req: Request, res: Response): Promise<void> {
  const facility = await facilityService.findFacilityById(req.params["id"]! as string);
  if (!facility) {
    res.status(404).json({ error: "Facility not found" });
    return;
  }
  res.json(facility);
}

export async function listFacilities(req: Request, res: Response): Promise<void> {
  const limit = Math.min(100, parseInt(req.query["limit"] as string) || 50);
  const offset = parseInt(req.query["offset"] as string) || 0;
  const facilities = await facilityService.listFacilities(limit, offset);
  if (!facilities) {
    res.status(204).json({ error: "Facilities empty" });
    return;
  }
  res.json({facilities, message: "This is field-service-2"});
}

export async function listFacilityTypes(_req: Request, res: Response): Promise<void> {
  const types = await facilityService.getFacilityTypes();
  res.json(types);
}
