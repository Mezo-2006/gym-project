import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { resolveClientId } from "@/lib/access";
import { z } from "zod";

const updateSchema = z.object({
  date: z.string().datetime(),
  mealPlanMealId: z.string(),
  status: z.enum(["PLANNED", "EATEN", "SKIPPED"]),
  items: z
    .array(
      z.object({
        mealPlanFoodId: z.string().optional(),
        name: z.string().min(1),
        consumedQuantity: z.number().positive().optional(),
        unit: z.string().optional(),
        calories: z.number().int().nonnegative().optional(),
        protein: z.number().int().nonnegative().optional(),
        carbs: z.number().int().nonnegative().optional(),
        fats: z.number().int().nonnegative().optional(),
      })
    )
    .default([]),
});

function calculateCompliance(planned: number | null, consumed: number | null) {
  if (!planned || planned === 0 || consumed === null) return "UNKNOWN";
  const ratio = consumed / planned;
  if (ratio < 0.9) return "UNDER";
  if (ratio <= 1.1) return "MET";
  return "OVER";
}

export async function GET(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const url = new URL(request.url);
  const requestedClientId = url.searchParams.get("clientId");
  const dateParam = url.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  const { clientId, response: clientResponse } = await resolveClientId(user!, requestedClientId);
  if (clientResponse) return clientResponse;

  const assignment = await prisma.mealPlanAssignment.findFirst({
    where: {
      clientId: clientId!,
      startDate: { lte: date },
      OR: [{ endDate: null }, { endDate: { gte: date } }],
    },
    orderBy: { startDate: "desc" },
    include: {
      mealPlan: {
        include: {
          days: {
            orderBy: { dayIndex: "asc" },
            include: { meals: { orderBy: { sortOrder: "asc" }, include: { foods: true } } },
          },
        },
      },
    },
  });

  if (!assignment) {
    return NextResponse.json({ assignment: null, day: null, logs: [] });
  }

  const days = assignment.mealPlan.days;
  const dayCount = days.length || 1;
  const diffDays = Math.floor((date.getTime() - assignment.startDate.getTime()) / 86400000);
  const dayIndex = ((diffDays % dayCount) + dayCount) % dayCount;
  const day = days[dayIndex] ?? days[0];

  const logs = await prisma.mealLog.findMany({
    where: {
      clientId: clientId!,
      date: new Date(date.toDateString()),
      mealPlanMealId: { in: day.meals.map((meal) => meal.id) },
    },
    include: { items: true },
  });

  return NextResponse.json({ assignment, day, logs });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  if (user!.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await prisma.clientProfile.findFirst({
    where: { userId: user!.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Client profile missing" }, { status: 404 });
  }

  const mealPlanMeal = await prisma.mealPlanMeal.findUnique({
    where: { id: parsed.data.mealPlanMealId },
    include: { foods: true, day: { include: { mealPlan: true } } },
  });
  if (!mealPlanMeal) {
    return NextResponse.json({ error: "Meal plan meal not found" }, { status: 404 });
  }

  const assignment = await prisma.mealPlanAssignment.findFirst({
    where: {
      clientId: profile.id,
      mealPlanId: mealPlanMeal.day.mealPlanId,
      startDate: { lte: new Date(parsed.data.date) },
      OR: [{ endDate: null }, { endDate: { gte: new Date(parsed.data.date) } }],
    },
    orderBy: { startDate: "desc" },
  });

  if (!assignment) {
    return NextResponse.json({ error: "No active plan assignment" }, { status: 400 });
  }

  const plannedFoods = mealPlanMeal.foods;
  const plannedTotalCalories = plannedFoods.reduce((sum, food) => sum + food.calories, 0);

  const itemsData = parsed.data.items.map((item) => {
    const planFood = item.mealPlanFoodId
      ? plannedFoods.find((food) => food.id === item.mealPlanFoodId)
      : null;

    const consumedQuantity = item.consumedQuantity ?? planFood?.quantity ?? null;
    const scale = planFood && consumedQuantity ? consumedQuantity / planFood.quantity : null;

    return {
      mealPlanFoodId: planFood?.id ?? null,
      name: item.name,
      plannedQuantity: planFood?.quantity ?? null,
      plannedUnit: planFood?.unit ?? item.unit ?? null,
      plannedCalories: planFood?.calories ?? null,
      plannedProtein: planFood?.protein ?? null,
      plannedCarbs: planFood?.carbs ?? null,
      plannedFats: planFood?.fats ?? null,
      consumedQuantity,
      consumedCalories:
        item.calories ?? (planFood && scale ? Math.round(planFood.calories * scale) : null),
      consumedProtein:
        item.protein ?? (planFood && scale ? Math.round(planFood.protein * scale) : null),
      consumedCarbs:
        item.carbs ?? (planFood && scale ? Math.round(planFood.carbs * scale) : null),
      consumedFats:
        item.fats ?? (planFood && scale ? Math.round(planFood.fats * scale) : null),
      isExtra: !planFood,
    };
  });

  const consumedTotalCalories = itemsData.reduce((sum, item) => sum + (item.consumedCalories ?? 0), 0);
  const complianceStatus = calculateCompliance(plannedTotalCalories, consumedTotalCalories);

  const log = await prisma.mealLog.upsert({
    where: {
      clientId_date_mealPlanMealId: {
        clientId: profile.id,
        date: new Date(new Date(parsed.data.date).toDateString()),
        mealPlanMealId: mealPlanMeal.id,
      },
    },
    update: {
      status: parsed.data.status,
      plannedCaloriesTotal: plannedTotalCalories,
      consumedCaloriesTotal: consumedTotalCalories,
      complianceStatus,
    },
    create: {
      clientId: profile.id,
      mealPlanAssignmentId: assignment.id,
      mealPlanDayId: mealPlanMeal.mealPlanDayId,
      mealPlanMealId: mealPlanMeal.id,
      date: new Date(new Date(parsed.data.date).toDateString()),
      name: mealPlanMeal.name,
      status: parsed.data.status,
      plannedCaloriesTotal: plannedTotalCalories,
      consumedCaloriesTotal: consumedTotalCalories,
      complianceStatus,
    },
  });

  await prisma.mealLogItem.deleteMany({ where: { mealLogId: log.id } });
  if (itemsData.length) {
    await prisma.mealLogItem.createMany({
      data: itemsData.map((item) => ({ ...item, mealLogId: log.id })),
    });
  }

  return NextResponse.json({ logId: log.id, complianceStatus });
}
