/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const generateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  dayTitle: z.string().optional(),
  caloriesTarget: z.number().int().positive(),
  proteinTarget: z.number().int().positive(),
  carbsTarget: z.number().int().positive(),
  fatsTarget: z.number().int().positive(),
});

type FoodTemplate = {
  name: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

const templates: Record<string, { protein: FoodTemplate; carb: FoodTemplate; fat: FoodTemplate }> = {
  Breakfast: {
    protein: { name: "Eggs", unit: "g", calories: 143, protein: 13, carbs: 1, fats: 10 },
    carb: { name: "Oats", unit: "g", calories: 389, protein: 17, carbs: 66, fats: 7 },
    fat: { name: "Olive oil", unit: "g", calories: 884, protein: 0, carbs: 0, fats: 100 },
  },
  Lunch: {
    protein: { name: "Chicken breast", unit: "g", calories: 165, protein: 31, carbs: 0, fats: 4 },
    carb: { name: "Rice", unit: "g", calories: 130, protein: 3, carbs: 28, fats: 0 },
    fat: { name: "Olive oil", unit: "g", calories: 884, protein: 0, carbs: 0, fats: 100 },
  },
  Dinner: {
    protein: { name: "Salmon", unit: "g", calories: 208, protein: 20, carbs: 0, fats: 13 },
    carb: { name: "Potatoes", unit: "g", calories: 77, protein: 2, carbs: 17, fats: 0 },
    fat: { name: "Olive oil", unit: "g", calories: 884, protein: 0, carbs: 0, fats: 100 },
  },
  Snack: {
    protein: { name: "Greek yogurt", unit: "g", calories: 59, protein: 10, carbs: 4, fats: 0 },
    carb: { name: "Banana", unit: "g", calories: 89, protein: 1, carbs: 23, fats: 0 },
    fat: { name: "Almonds", unit: "g", calories: 579, protein: 21, carbs: 22, fats: 50 },
  },
};

const mealRatios = {
  Breakfast: 0.25,
  Lunch: 0.3,
  Dinner: 0.3,
  Snack: 0.15,
};

function scalePortion(targetGrams: number, template: FoodTemplate, macro: "protein" | "carbs" | "fats") {
  const per100 = template[macro] || 1;
  const grams = (targetGrams / per100) * 100;
  const rounded = Math.max(0, Math.round(grams * 10) / 10);
  const scale = rounded / 100;
  return {
    quantity: rounded,
    calories: Math.round(template.calories * scale),
    protein: Math.round(template.protein * scale),
    carbs: Math.round(template.carbs * scale),
    fats: Math.round(template.fats * scale),
  };
}

export async function POST(request: Request) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const payload = await request.json();
  const parsed = generateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const dayTitle = data.dayTitle ?? "Day 1";

  const prismaClient = prisma as any;
  const plan = await prismaClient.mealPlan.create({
    data: {
      coachId: user!.id,
      name: data.name,
      description: data.description,
      status: "ACTIVE",
      days: {
        create: [
          {
            dayIndex: 0,
            title: dayTitle,
            meals: {
              create: ["Breakfast", "Lunch", "Dinner", "Snack"].map((mealName, index) => {
                const ratio = mealRatios[mealName as keyof typeof mealRatios];
                const targetProtein = data.proteinTarget * ratio;
                const targetCarbs = data.carbsTarget * ratio;
                const targetFats = data.fatsTarget * ratio;

                const mealTemplates = templates[mealName];
                const protein = scalePortion(targetProtein, mealTemplates.protein, "protein");
                const carb = scalePortion(targetCarbs, mealTemplates.carb, "carbs");
                const fat = scalePortion(targetFats, mealTemplates.fat, "fats");

                return {
                  name: mealName,
                  timeLabel: ["08:00", "13:30", "19:00", "21:30"][index],
                  sortOrder: index + 1,
                  foods: {
                    create: [
                      {
                        name: mealTemplates.protein.name,
                        quantity: protein.quantity,
                        unit: mealTemplates.protein.unit,
                        calories: protein.calories,
                        protein: protein.protein,
                        carbs: protein.carbs,
                        fats: protein.fats,
                      },
                      {
                        name: mealTemplates.carb.name,
                        quantity: carb.quantity,
                        unit: mealTemplates.carb.unit,
                        calories: carb.calories,
                        protein: carb.protein,
                        carbs: carb.carbs,
                        fats: carb.fats,
                      },
                      {
                        name: mealTemplates.fat.name,
                        quantity: fat.quantity,
                        unit: mealTemplates.fat.unit,
                        calories: fat.calories,
                        protein: fat.protein,
                        carbs: fat.carbs,
                        fats: fat.fats,
                      },
                    ],
                  },
                };
              }),
            },
          },
        ],
      },
    },
    include: { days: true },
  });

  return NextResponse.json({ plan });
}
