import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.role.upsert({
    where: { name: "member" },
    create: { name: "member" },
    update: {},
  });
  await prisma.role.upsert({
    where: { name: "admin" },
    create: { name: "admin" },
    update: {},
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
