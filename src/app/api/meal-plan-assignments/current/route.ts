import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { resolveClientId } from "@/lib/access";

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
    return NextResponse.json({ assignment: null });
  }

  return NextResponse.json({ assignment });
}
