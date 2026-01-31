/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";

export async function GET() {
  const { user, response } = await requireCoach();
  if (response) return response;

  const prismaClient = prisma as any;
  const clients = await prismaClient.clientProfile.findMany({
    where: { coachId: user!.id },
    include: { user: { select: { email: true } } },
  });

  const today = new Date();
  const start = new Date(new Date(today).toDateString());
  start.setDate(start.getDate() - 6);

  const clientIds = clients.map((client: { id: string }) => client.id);
  const meals = await prismaClient.mealLog.findMany({
    where: { clientId: { in: clientIds }, date: { gte: start } },
    select: { clientId: true, consumedCaloriesTotal: true, complianceStatus: true },
  });

  const mealsByClient = new Map<string, { calories: number; compliance: string[] }>();
  meals.forEach((meal: { clientId: string; consumedCaloriesTotal?: number | null; complianceStatus?: string }) => {
    const existing = mealsByClient.get(meal.clientId) ?? { calories: 0, compliance: [] };
    existing.calories += meal.consumedCaloriesTotal ?? 0;
    if (meal.complianceStatus && meal.complianceStatus !== "UNKNOWN") {
      existing.compliance.push(meal.complianceStatus);
    }
    mealsByClient.set(meal.clientId, existing);
  });

  const summaries = clients.map((client: { id: string; name: string; user?: { email?: string } }) => {
    const data = mealsByClient.get(client.id) ?? { calories: 0, compliance: [] };
    const mealCount = meals.filter((meal: { clientId: string }) => meal.clientId === client.id).length;
    const averageCalories = mealCount ? Math.round(data.calories / mealCount) : 0;
    const metCount = data.compliance.filter((status: string) => status === "MET").length;
    const complianceRate = data.compliance.length
      ? Math.round((metCount / data.compliance.length) * 100)
      : 0;

    return {
      id: client.id,
      name: client.name,
      email: client.user?.email ?? "",
      mealCount,
      averageCalories,
      complianceRate,
    };
  });

  return NextResponse.json({ clients: summaries });
}
