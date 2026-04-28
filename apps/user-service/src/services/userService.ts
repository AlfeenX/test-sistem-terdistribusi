import { prisma } from "../lib/prisma.js";
import { User, Role, Prisma } from "../generated/client.js";

export async function createUser(data: {
  email: string;
  phone?: string;
  fullName: string;
  roleId: string;
}): Promise<User> {
  return prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone ?? null,
      fullName: data.fullName,
      roleId: data.roleId,
    },
  });
}

export async function findUserById(id: string): Promise<(User & { role: Role }) | null> {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
}

export async function findUserByEmail(email: string): Promise<(User & { role: Role }) | null> {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
}

export async function updateUser(
  id: string,
  data: Prisma.UserUpdateInput
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function listUsers(limit = 50, offset = 0): Promise<(User & { role: Role })[]> {
  return prisma.user.findMany({
    take: limit,
    skip: offset,
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRoles(): Promise<Role[]> {
  return prisma.role.findMany({ orderBy: { name: "asc" } });
}
