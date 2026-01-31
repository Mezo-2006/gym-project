/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "mizoa20014@gmail.com";
  const password = "Mezo123lolo";
  const passwordHash = await bcrypt.hash(password, 12);

  const coach = await prisma.user.findFirst({
    where: { role: UserRole.COACH },
    select: { id: true },
  });

  if (!coach) {
    throw new Error("No coach user found. Create a coach first.");
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: UserRole.CLIENT },
    create: {
      email,
      passwordHash,
      role: UserRole.CLIENT,
      clientProfile: {
        create: {
          coachId: coach.id,
          name: "Mizo A",
          goals: "General wellness",
          caloriesTarget: 2200,
          proteinTarget: 150,
          carbsTarget: 250,
          fatsTarget: 70,
          waterTargetMl: 2800,
        },
      },
    },
    select: { id: true, email: true },
  });

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    throw new Error("Client profile not found.");
  }

  const demoPlanName = "Demo Meal Plan";
  const demoPlan =
    (await prisma.mealPlan.findFirst({
      where: { coachId: coach.id, name: demoPlanName },
      include: { days: { include: { meals: { include: { foods: true } } } } },
    })) ??
    (await prisma.mealPlan.create({
      data: {
        coachId: coach.id,
        name: demoPlanName,
        description: "Demo plan for checklist testing",
        status: "ACTIVE",
        days: {
          create: [
            {
              dayIndex: 0,
              title: "Day 1",
              meals: {
                create: [
                  {
                    name: "Breakfast",
                    timeLabel: "08:00",
                    sortOrder: 1,
                    foods: {
                      create: [
                        {
                          name: "Oats",
                          quantity: 80,
                          unit: "g",
                          calories: 300,
                          protein: 10,
                          carbs: 54,
                          fats: 6,
                        },
                        {
                          name: "Eggs",
                          quantity: 3,
                          unit: "pcs",
                          calories: 210,
                          protein: 18,
                          carbs: 2,
                          fats: 15,
                        },
                      ],
                    },
                  },
                  {
                    name: "Lunch",
                    timeLabel: "13:30",
                    sortOrder: 2,
                    foods: {
                      create: [
                        {
                          name: "Chicken breast",
                          quantity: 180,
                          unit: "g",
                          calories: 300,
                          protein: 45,
                          carbs: 0,
                          fats: 6,
                        },
                        {
                          name: "Rice",
                          quantity: 200,
                          unit: "g",
                          calories: 260,
                          protein: 5,
                          carbs: 55,
                          fats: 2,
                        },
                      ],
                    },
                  },
                  {
                    name: "Dinner",
                    timeLabel: "19:00",
                    sortOrder: 3,
                    foods: {
                      create: [
                        {
                          name: "Salmon",
                          quantity: 160,
                          unit: "g",
                          calories: 320,
                          protein: 34,
                          carbs: 0,
                          fats: 18,
                        },
                        {
                          name: "Potatoes",
                          quantity: 220,
                          unit: "g",
                          calories: 190,
                          protein: 5,
                          carbs: 40,
                          fats: 1,
                        },
                      ],
                    },
                  },
                  {
                    name: "Snack",
                    timeLabel: "21:30",
                    sortOrder: 4,
                    foods: {
                      create: [
                        {
                          name: "Greek yogurt",
                          quantity: 200,
                          unit: "g",
                          calories: 120,
                          protein: 20,
                          carbs: 8,
                          fats: 0,
                        },
                        {
                          name: "Banana",
                          quantity: 120,
                          unit: "g",
                          calories: 105,
                          protein: 1,
                          carbs: 27,
                          fats: 0,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      include: { days: { include: { meals: { include: { foods: true } } } } },
    }));

  const assignment = await prisma.mealPlanAssignment.findFirst({
    where: { clientId: profile.id, mealPlanId: demoPlan.id, endDate: null },
  });

  if (!assignment) {
    await prisma.mealPlanAssignment.create({
      data: {
        clientId: profile.id,
        mealPlanId: demoPlan.id,
        startDate: new Date(),
        endDate: null,
      },
    });
  }

  const planDay = demoPlan.days[0];
  const planMeal = planDay?.meals?.[0];
  if (planMeal) {
    const dateOnly = new Date(new Date().toDateString());
    const plannedTotalCalories = planMeal.foods.reduce((sum, food) => sum + food.calories, 0);
    const itemsData = planMeal.foods.map((food, index) => ({
      mealPlanFoodId: food.id,
      name: index === 0 ? "Beef" : food.name,
      plannedQuantity: food.quantity,
      plannedUnit: food.unit,
      plannedCalories: food.calories,
      plannedProtein: food.protein,
      plannedCarbs: food.carbs,
      plannedFats: food.fats,
      consumedQuantity: food.quantity,
      consumedCalories: food.calories,
      consumedProtein: food.protein,
      consumedCarbs: food.carbs,
      consumedFats: food.fats,
      isExtra: false,
    }));

    const log = await prisma.mealLog.upsert({
      where: {
        clientId_date_mealPlanMealId: {
          clientId: profile.id,
          date: dateOnly,
          mealPlanMealId: planMeal.id,
        },
      },
      update: {
        name: planMeal.name,
        status: "EATEN",
        plannedCaloriesTotal: plannedTotalCalories,
        consumedCaloriesTotal: plannedTotalCalories,
        complianceStatus: "MET",
      },
      create: {
        clientId: profile.id,
        mealPlanAssignmentId: assignment?.id ?? undefined,
        mealPlanDayId: planDay.id,
        mealPlanMealId: planMeal.id,
        date: dateOnly,
        name: planMeal.name,
        status: "EATEN",
        plannedCaloriesTotal: plannedTotalCalories,
        consumedCaloriesTotal: plannedTotalCalories,
        complianceStatus: "MET",
      },
    });

    await prisma.mealLogItem.deleteMany({ where: { mealLogId: log.id } });
    await prisma.mealLogItem.createMany({
      data: itemsData.map((item) => ({ ...item, mealLogId: log.id })),
    });
  }

  const now = new Date();
  const meals = Array.from({ length: 5 }).map((_, index) => ({
    date: new Date(now.getTime() - index * 86400000),
    name: ["Oats", "Chicken Bowl", "Salmon Salad", "Pasta", "Greek Yogurt"][index % 5],
    calories: [420, 650, 540, 700, 230][index % 5],
    protein: [20, 45, 38, 25, 18][index % 5],
    carbs: [60, 55, 20, 85, 25][index % 5],
    fats: [10, 18, 24, 12, 6][index % 5],
    unit: ["bowl", "plate", "plate", "plate", "cup"][index % 5],
  }));

  const waterLogs = Array.from({ length: 5 }).map((_, index) => ({
    clientId: profile.id,
    date: new Date(now.getTime() - index * 86400000),
    amountMl: [2200, 2600, 2000, 2800, 2400][index % 5],
  }));

  for (const meal of meals) {
    const log = await prisma.mealLog.create({
      data: {
        clientId: profile.id,
        date: new Date(meal.date.toDateString()),
        name: meal.name,
        status: "EATEN",
        plannedCaloriesTotal: null,
        consumedCaloriesTotal: meal.calories,
        complianceStatus: "UNKNOWN",
      },
    });

    await prisma.mealLogItem.create({
      data: {
        mealLogId: log.id,
        name: meal.name,
        plannedQuantity: null,
        plannedUnit: meal.unit,
        plannedCalories: null,
        plannedProtein: null,
        plannedCarbs: null,
        plannedFats: null,
        consumedQuantity: 1,
        consumedCalories: meal.calories,
        consumedProtein: meal.protein,
        consumedCarbs: meal.carbs,
        consumedFats: meal.fats,
        isExtra: true,
      },
    });
  }
  await prisma.waterLog.createMany({ data: waterLogs });

  console.log("Client created/updated with dummy meals and water logs:", user.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
