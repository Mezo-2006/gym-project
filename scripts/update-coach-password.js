/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
  const hash = await bcrypt.hash("01147239597", 12);
  await prisma.user.update({
    where: { email: "coach@fitflow.io" },
    data: { passwordHash: hash },
  });
  await prisma.$disconnect();
  console.log("coach password updated");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
