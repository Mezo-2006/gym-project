/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  if (user?.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const prismaClient = prisma as any;
  const profile = await prismaClient.clientProfile.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Client profile missing" }, { status: 404 });
  }

  const today = new Date();
  const start = new Date(new Date(today).toDateString());
  start.setDate(start.getDate() - 6);

  const meals = await prismaClient.mealLog.findMany({
    where: { clientId: profile.id, date: { gte: start } },
    select: { consumedCaloriesTotal: true, complianceStatus: true, date: true },
  });

  const waterLogs = await prismaClient.waterLog.findMany({
    where: { clientId: profile.id, date: { gte: start } },
    select: { amountMl: true, date: true },
  });

  const mealCount = meals.length;
  const totalCalories = meals.reduce(
    (sum: number, meal: { consumedCaloriesTotal?: number | null }) => sum + (meal.consumedCaloriesTotal ?? 0),
    0
  );
  const averageCalories = mealCount ? Math.round(totalCalories / mealCount) : 0;
  const complianceEntries = meals
    .map((meal: { complianceStatus?: string }) => meal.complianceStatus)
    .filter((status: string | undefined) => status && status !== "UNKNOWN");
  const metCount = complianceEntries.filter((status: string) => status === "MET").length;
  const complianceRate = complianceEntries.length
    ? Math.round((metCount / complianceEntries.length) * 100)
    : 0;

  const waterCount = waterLogs.length;
  const waterTotal = waterLogs.reduce(
    (sum: number, log: { amountMl: number }) => sum + log.amountMl,
    0
  );

  return NextResponse.json({
    mealCount,
    averageCalories,
    complianceRate,
    waterCount,
    waterTotal,
  });
}
