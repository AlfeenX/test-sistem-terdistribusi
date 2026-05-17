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

export async function updateFacility(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const { name, facilityTypeId, hourlyRate } = req.body as {
      name?: string;
      facilityTypeId?: string;
      hourlyRate?: number;
    };
    const updated = await facilityService.updateFacility(id, { name, facilityTypeId, hourlyRate });
    res.json(updated);
  } catch (e) {
    log.error("updateFacility failed", e);
    res.status(500).json({ error: "Failed to update facility" });
  }
}

export async function deleteFacility(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    await facilityService.deleteFacility(id);
    res.status(204).end();
  } catch (e) {
    log.error("deleteFacility failed", e);
    res.status(500).json({ error: "Failed to delete facility" });
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
  res.json({facilities, message: "This is field-service-1"});
}

export async function listFacilityTypes(_req: Request, res: Response): Promise<void> {
  const types = await facilityService.getFacilityTypes();
  res.json(types);
}

export async function createFacilityType(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.body as { name: string };
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const type = await facilityService.createFacilityType({ name });
    res.status(201).json(type);
  } catch (e) {
    log.error("createFacilityType failed", e);
    res.status(500).json({ error: "Failed to create facility type" });
  }
}

export async function updateFacilityType(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const { name } = req.body as { name: string };
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const type = await facilityService.updateFacilityType(id, { name });
    res.json(type);
  } catch (e) {
    log.error("updateFacilityType failed", e);
    res.status(500).json({ error: "Failed to update facility type" });
  }
}

export async function deleteFacilityType(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    await facilityService.deleteFacilityType(id);
    res.status(204).end();
  } catch (e) {
    log.error("deleteFacilityType failed", e);
    res.status(500).json({ error: "Failed to delete facility type. It might be referenced by facilities." });
  }
}

