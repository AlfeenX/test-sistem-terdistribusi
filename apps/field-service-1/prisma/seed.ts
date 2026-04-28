import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.facilityType.createMany({
    data: [
      { name: "badminton" },
      { name: "futsal" }
    ],
    skipDuplicates: true,
  });

  console.log("Field service seed done");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });