import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toNumber(value: unknown) {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

type Target = {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
};

function scoreFood(food: { calories: number; protein: number; carbs: number; fats: number }, target: Target) {
  const parts: number[] = [];

  if (target.calories != null) {
    parts.push(Math.abs(food.calories - target.calories) / Math.max(1, target.calories));
  }
  if (target.protein != null) {
    parts.push(Math.abs(food.protein - target.protein) / Math.max(1, target.protein));
  }
  if (target.carbs != null) {
    parts.push(Math.abs(food.carbs - target.carbs) / Math.max(1, target.carbs));
  }
  if (target.fats != null) {
    parts.push(Math.abs(food.fats - target.fats) / Math.max(1, target.fats));
  }

  if (!parts.length) return 999;
  return parts.reduce((sum, val) => sum + val, 0) / parts.length;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const target: Target = {
    calories: toNumber(body?.calories),
    protein: toNumber(body?.protein),
    carbs: toNumber(body?.carbs),
    fats: toNumber(body?.fats),
  };

  const toleranceCalories = Math.max(25, toNumber(body?.toleranceCalories) ?? 120);
  const limit = Math.min(25, Math.max(1, toNumber(body?.limit) ?? 8));

  const minCalories = target.calories != null ? Math.max(0, target.calories - toleranceCalories) : 0;
  const maxCalories = target.calories != null ? target.calories + toleranceCalories : 5000;

  const candidates = await prisma.food.findMany({
    where: {
      source: "LOCAL",
      calories: { gte: Math.floor(minCalories), lte: Math.ceil(maxCalories) },
    },
    take: 200,
  });

  const ranked = candidates
    .map((food) => ({
      ...food,
      score: scoreFood(food, target),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);

  return NextResponse.json({ items: ranked });
}
