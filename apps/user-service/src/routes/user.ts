import { Router } from "express";
import * as userController from "../controllers/userController.js";

export const userRoutes: Router = Router();
userRoutes.post("/", userController.createUser);
userRoutes.get("/", userController.listUsers);
userRoutes.get("/:id", userController.getUserById);
userRoutes.patch("/:id", userController.updateUser);
