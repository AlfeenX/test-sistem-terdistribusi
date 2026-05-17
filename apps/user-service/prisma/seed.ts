import { prisma } from "../src/lib/prisma.js";
import crypto from "crypto";

async function main() {
  const memberRole = await prisma.role.upsert({
    where: { name: "member" },
    create: { name: "member" },
    update: {},
  });
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    create: { name: "admin" },
    update: {},
  });

  // Seed default users
  const adminPasswordHash = crypto.createHash("sha256").update("admin").digest("hex");
  await prisma.user.upsert({
    where: { email: "admin@gajayana.com" },
    update: {},
    create: {
      email: "admin@gajayana.com",
      fullName: "System Administrator",
      roleId: adminRole.id,
      password: adminPasswordHash,
    },
  });

  const memberPasswordHash = crypto.createHash("sha256").update("member").digest("hex");
  await prisma.user.upsert({
    where: { email: "member@gajayana.com" },
    update: {},
    create: {
      email: "member@gajayana.com",
      fullName: "Regular Member",
      roleId: memberRole.id,
      password: memberPasswordHash,
    },
  });

  const planCount = await prisma.membershipPlan.count();
  if (planCount === 0) {
    await prisma.membershipPlan.createMany({
      data: [
        { name: "Monthly", durationDays: 30, price: 150000 },
        { name: "Yearly", durationDays: 365, price: 1500000 },
      ],
    });
  }
  console.log("User service seed done");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
