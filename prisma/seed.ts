import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  const coach = await prisma.user.upsert({
    where: { email: "coach@fitflow.io" },
    update: {
      passwordHash,
      role: UserRole.COACH,
    },
    create: {
      email: "coach@fitflow.io",
      passwordHash,
      role: UserRole.COACH,
      clientProfile: undefined,
    },
  });

  await prisma.user.upsert({
    where: { email: "client@fitflow.io" },
    update: {
      passwordHash,
      role: UserRole.CLIENT,
    },
    create: {
      email: "client@fitflow.io",
      passwordHash,
      role: UserRole.CLIENT,
      clientProfile: {
        create: {
          coachId: coach.id,
          name: "Client One",
          goals: "Performance + Lean Mass",
          caloriesTarget: 2400,
          proteinTarget: 180,
          carbsTarget: 260,
          fatsTarget: 70,
          waterTargetMl: 3000,
        },
      },
    },
  });

  await prisma.food.createMany({
    data: [
      { name: "Chicken breast, cooked", brand: null, servingSize: 100, servingUnit: "g", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
      { name: "Salmon, cooked", brand: null, servingSize: 100, servingUnit: "g", calories: 206, protein: 22, carbs: 0, fats: 12 },
      { name: "Ground turkey 93%", brand: null, servingSize: 100, servingUnit: "g", calories: 176, protein: 23, carbs: 0, fats: 9 },
      { name: "Egg, whole", brand: null, servingSize: 1, servingUnit: "large", calories: 72, protein: 6.3, carbs: 0.4, fats: 4.8 },
      { name: "Egg whites", brand: null, servingSize: 100, servingUnit: "g", calories: 52, protein: 11, carbs: 0.7, fats: 0.2 },
      { name: "Greek yogurt, nonfat", brand: null, servingSize: 170, servingUnit: "g", calories: 100, protein: 17, carbs: 6, fats: 0 },
      { name: "Cottage cheese, low-fat", brand: null, servingSize: 100, servingUnit: "g", calories: 82, protein: 11, carbs: 3.4, fats: 2.3 },
      { name: "Whey protein isolate", brand: null, servingSize: 30, servingUnit: "g", calories: 110, protein: 25, carbs: 1, fats: 0 },
      { name: "Tofu, firm", brand: null, servingSize: 100, servingUnit: "g", calories: 144, protein: 15, carbs: 3, fats: 9 },
      { name: "Lentils, cooked", brand: null, servingSize: 100, servingUnit: "g", calories: 116, protein: 9, carbs: 20, fats: 0.4 },
      { name: "Chickpeas, cooked", brand: null, servingSize: 100, servingUnit: "g", calories: 164, protein: 9, carbs: 27, fats: 2.6 },
      { name: "Black beans, cooked", brand: null, servingSize: 100, servingUnit: "g", calories: 132, protein: 9, carbs: 24, fats: 0.5 },
      { name: "Brown rice, cooked", brand: null, servingSize: 100, servingUnit: "g", calories: 111, protein: 2.6, carbs: 23, fats: 0.9 },
      { name: "White rice, cooked", brand: null, servingSize: 100, servingUnit: "g", calories: 130, protein: 2.4, carbs: 28, fats: 0.3 },
      { name: "Quinoa, cooked", brand: null, servingSize: 100, servingUnit: "g", calories: 120, protein: 4.4, carbs: 21, fats: 1.9 },
      { name: "Oats, dry", brand: null, servingSize: 40, servingUnit: "g", calories: 150, protein: 5, carbs: 27, fats: 3 },
      { name: "Sweet potato, baked", brand: null, servingSize: 130, servingUnit: "g", calories: 112, protein: 2, carbs: 26, fats: 0.1 },
      { name: "Potato, baked", brand: null, servingSize: 150, servingUnit: "g", calories: 161, protein: 4.3, carbs: 36.6, fats: 0.2 },
      { name: "Banana", brand: null, servingSize: 1, servingUnit: "medium", calories: 105, protein: 1.3, carbs: 27, fats: 0.3 },
      { name: "Apple", brand: null, servingSize: 1, servingUnit: "medium", calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
      { name: "Blueberries", brand: null, servingSize: 100, servingUnit: "g", calories: 57, protein: 0.7, carbs: 14, fats: 0.3 },
      { name: "Avocado", brand: null, servingSize: 100, servingUnit: "g", calories: 160, protein: 2, carbs: 9, fats: 15 },
      { name: "Almonds", brand: null, servingSize: 28, servingUnit: "g", calories: 164, protein: 6, carbs: 6, fats: 14 },
      { name: "Peanut butter", brand: null, servingSize: 32, servingUnit: "g", calories: 188, protein: 7, carbs: 6, fats: 16 },
      { name: "Olive oil", brand: null, servingSize: 14, servingUnit: "g", calories: 119, protein: 0, carbs: 0, fats: 13.5 },
      { name: "Broccoli", brand: null, servingSize: 100, servingUnit: "g", calories: 34, protein: 2.8, carbs: 7, fats: 0.4 },
      { name: "Spinach", brand: null, servingSize: 100, servingUnit: "g", calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
      { name: "Mixed vegetables", brand: null, servingSize: 100, servingUnit: "g", calories: 80, protein: 3, carbs: 16, fats: 0.8 },
      { name: "Tuna, canned in water", brand: null, servingSize: 100, servingUnit: "g", calories: 116, protein: 26, carbs: 0, fats: 1 },
      { name: "Shrimp, cooked", brand: null, servingSize: 100, servingUnit: "g", calories: 99, protein: 24, carbs: 0.2, fats: 0.3 },
      { name: "Turkey breast, deli", brand: null, servingSize: 56, servingUnit: "g", calories: 60, protein: 12, carbs: 2, fats: 1 },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
