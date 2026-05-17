import { Router } from "express";
import * as facilityController from "../controllers/facilityController.js";

export const facilityRoutes: Router = Router();
facilityRoutes.post("/", facilityController.createFacility);
facilityRoutes.get("/types", facilityController.listFacilityTypes);
facilityRoutes.post("/types", facilityController.createFacilityType);
facilityRoutes.put("/types/:id", facilityController.updateFacilityType);
facilityRoutes.delete("/types/:id", facilityController.deleteFacilityType);
facilityRoutes.get("/", facilityController.listFacilities);
facilityRoutes.get("/:id", facilityController.getFacility);
facilityRoutes.patch("/:id", facilityController.updateFacility);
facilityRoutes.delete("/:id", facilityController.deleteFacility);

