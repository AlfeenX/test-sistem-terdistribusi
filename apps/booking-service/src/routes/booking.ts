import { Router } from "express";
import * as bookingController from "../controllers/bookingController.js";

export const bookingRoutes: Router = Router();
bookingRoutes.post("/", bookingController.createBooking);
bookingRoutes.get("/:id", bookingController.getBooking);
bookingRoutes.post("/:id/confirm", bookingController.confirmBooking);
bookingRoutes.post("/:id/cancel", bookingController.cancelBooking);
bookingRoutes.get("/user/:userId", bookingController.listMyBookings);
