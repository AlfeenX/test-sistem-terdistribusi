import { prisma } from "../lib/prisma.js";
import type { UserMembership, MembershipPlan } from "../generated/client.js";

export async function createMembership(data: {
  userId: string;
  planId: string;
  startedAt: Date;
  expiresAt: Date;
}): Promise<UserMembership> {
  return prisma.userMembership.create({
    data: {
      ...data,
      status: "active",
    },
  });
}

export async function findActiveMembershipByUser(userId: string): Promise<(UserMembership & { plan: MembershipPlan }) | null> {
  return prisma.userMembership.findFirst({
    where: { userId, status: "active", expiresAt: { gte: new Date() } },
    include: { plan: true },
    orderBy: { expiresAt: "desc" },
  });
}

export async function updateMembershipStatus(
  id: string,
  status: string
): Promise<UserMembership> {
  return prisma.userMembership.update({
    where: { id },
    data: { status },
  });
}

export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  return prisma.membershipPlan.findMany({ orderBy: { name: "asc" } });
}
