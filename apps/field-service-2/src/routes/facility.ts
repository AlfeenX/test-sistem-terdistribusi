import { Router } from "express";
import * as facilityController from "../controllers/facilityController.js";

export const facilityRoutes: Router = Router();
facilityRoutes.post("/", facilityController.createFacility);
facilityRoutes.get("/types", facilityController.listFacilityTypes);
facilityRoutes.get("/", facilityController.listFacilities);
facilityRoutes.get("/:id", facilityController.getFacility);
