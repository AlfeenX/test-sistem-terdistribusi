import { prisma } from "../src/lib/prisma";

async function main() {
  const count = await prisma.paymentMethod.count();
  if (count === 0) {
    await prisma.paymentMethod.createMany({
      data: [{ name: "bank_transfer" }, { name: "e_wallet" }],
    });
  }
  console.log("Payment service seed done");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
