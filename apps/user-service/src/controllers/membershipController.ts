import type { Request, Response } from "express";
import * as membershipService from "../services/membershipService.js";
import { getLogger } from "@gajayana/shared";
import { getChannel } from "../subscribers/index.js";
import { publishMembershipChanged } from "../publishers/userPublisher.js";

const log = getLogger("user-service");

export async function createMembership(req: Request, res: Response): Promise<void> {
  try {
    const { userId, planId, startedAt, expiresAt } = req.body as {
      userId: string;
      planId: string;
      startedAt: string;
      expiresAt: string;
    };
    if (!userId || !planId || !startedAt || !expiresAt) {
      res.status(400).json({ error: "userId, planId, startedAt, expiresAt required" });
      return;
    }
    const membership = await membershipService.createMembership({
      userId,
      planId,
      startedAt: new Date(startedAt),
      expiresAt: new Date(expiresAt),
    });
    const channel = getChannel();
    if (channel) {
      await publishMembershipChanged(channel, {
        userId: membership.userId,
        membershipId: membership.id,
        planId: membership.planId,
        status: membership.status,
        expiresAt: membership.expiresAt.toISOString(),
      });
    }
    res.status(201).json(membership);
  } catch (e) {
    log.error("createMembership failed", e);
    res.status(500).json({ error: "Failed to create membership" });
  }
}

export async function getActiveMembership(req: Request, res: Response): Promise<void> {
  const membership = await membershipService.findActiveMembershipByUser(req.params["userId"] as string);
  if (!membership) {
    res.status(404).json({ error: "No active membership" });
    return;
  }
  res.json(membership);
}

export async function listPlans(_req: Request, res: Response): Promise<void> {
  const plans = await membershipService.getMembershipPlans();
  res.json(plans);
}
