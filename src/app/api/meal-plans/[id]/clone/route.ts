/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const cloneSchema = z.object({
  name: z.string().min(2),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const { id } = await params;
  const payload = await request.json();
  const parsed = cloneSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prismaClient = prisma as any;
  const plan = await prismaClient.mealPlan.findFirst({
    where: { id, coachId: user!.id },
    include: {
      days: {
        orderBy: { dayIndex: "asc" },
        include: { meals: { orderBy: { sortOrder: "asc" }, include: { foods: true } } },
      },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  }

  const cloned = await prismaClient.mealPlan.create({
    data: {
      coachId: user!.id,
      name: parsed.data.name,
      description: plan.description,
      status: plan.status,
      days: {
        create: plan.days.map((day: any) => ({
          dayIndex: day.dayIndex,
          title: day.title,
          meals: {
            create: day.meals.map((meal: any) => ({
              name: meal.name,
              timeLabel: meal.timeLabel ?? undefined,
              sortOrder: meal.sortOrder,
              foods: {
                create: meal.foods.map((food: any) => ({
                  name: food.name,
                  quantity: food.quantity,
                  unit: food.unit,
                  calories: food.calories,
                  protein: food.protein,
                  carbs: food.carbs,
                  fats: food.fats,
                })),
              },
            })),
          },
        })),
      },
    },
  });

  return NextResponse.json({ plan: cloned });
}
