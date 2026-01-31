/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, passwordHash: true },
  });
  const results = users.map((user) => ({
    email: user.email,
    role: user.role,
    match: bcrypt.compareSync("ChangeMe123!", user.passwordHash),
  }));
  console.log(results);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
