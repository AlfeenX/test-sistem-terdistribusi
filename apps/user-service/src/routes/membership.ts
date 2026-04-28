import { Router } from "express";
import * as membershipController from "../controllers/membershipController.js";

export const membershipRoutes: Router= Router();
membershipRoutes.get("/plans", membershipController.listPlans);
membershipRoutes.post("/", membershipController.createMembership);
membershipRoutes.get("/user/:userId/active", membershipController.getActiveMembership);
