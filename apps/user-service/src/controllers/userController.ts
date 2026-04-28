import type { Request, Response } from "express";
import * as userService from "../services/userService.js";
import { getLogger } from "@gajayana/shared";
import { getChannel } from "../subscribers/index.js";
import { publishUserCreated, publishUserUpdated } from "../publishers/userPublisher.js";

const log = getLogger("user-service");

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, phone, fullName, roleId } = req.body as {
      email: string;
      phone?: string;
      fullName: string;
      roleId: string;
    };
    if (!email || !fullName || !roleId) {
      res.status(400).json({ error: "email, fullName, roleId required" });
      return;
    }
    const user = await userService.createUser({ email, phone, fullName, roleId });
    const channel = getChannel();
    if (channel) {
      await publishUserCreated(channel, {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        roleId: user.roleId,
        createdAt: user.createdAt.toISOString(),
      });
    }
    res.status(201).json(user);
  } catch (e) {
    log.error("createUser failed", e);
    res.status(500).json({ error: "Failed to create user" });
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const user = await userService.findUserById(req.params["id"]! as string);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await userService.updateUser(req.params["id"]! as string, req.body);
    const channel = getChannel();
    if (channel) {
      await publishUserUpdated(channel, {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone ?? undefined,
        roleId: user.roleId,
        updatedAt: user.updatedAt.toISOString(),
      });
    }
    res.json(user);
  } catch (e) {
    log.error("updateUser failed", e);
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const limit = Math.min(100, parseInt(req.query["limit"] as string) || 50);
  const offset = parseInt(req.query["offset"] as string) || 0;
  const users = await userService.listUsers(limit, offset);
  res.json(users);
}

export async function listRoles(_req: Request, res: Response): Promise<void> {
  const roles = await userService.getRoles();
  res.json(roles);
}
