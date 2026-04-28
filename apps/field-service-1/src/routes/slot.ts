import { Router } from "express";
import * as slotController from "../controllers/slotController.js";

export const slotRoutes: Router = Router();
slotRoutes.post("/", slotController.createSlot);
slotRoutes.get("/facility/:facilityId/available", slotController.getAvailableSlots);
slotRoutes.post("/:id/reserve", slotController.reserveSlot);
slotRoutes.post("/:id/release", slotController.releaseSlot);
slotRoutes.get("/:id", slotController.getSlot);
