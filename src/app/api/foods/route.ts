/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

function pickNutrient(nutrients: Array<{ nutrientId?: number; value?: number }> | undefined, id: number) {
  const match = nutrients?.find((nutrient) => nutrient.nutrientId === id);
  return match?.value ?? null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const source = (searchParams.get("source") ?? "local").toLowerCase();

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  if (source === "usda") {
    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "USDA API key not configured" },
        { status: 400 }
      );
    }

    const url = new URL(USDA_SEARCH_URL);
    url.searchParams.set("query", q);
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("api_key", apiKey);

    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json({ error: "USDA search failed" }, { status: 502 });
    }

    const data = await res.json();
    const foods = Array.isArray(data?.foods) ? data.foods : [];
    const items = foods.map((food: any) => {
      const nutrients = Array.isArray(food.foodNutrients) ? food.foodNutrients : [];
      const calories = pickNutrient(nutrients, 1008);
      const protein = pickNutrient(nutrients, 1003);
      const carbs = pickNutrient(nutrients, 1005);
      const fats = pickNutrient(nutrients, 1004);
      return {
        name: food.description ?? "Unknown food",
        brand: food.brandOwner ?? null,
        source: "USDA",
        servingSize: food.servingSize ?? 100,
        servingUnit: food.servingSizeUnit ?? "g",
        calories,
        protein,
        carbs,
        fats,
      };
    });

    return NextResponse.json({ items });
  }

  const items = await prisma.food.findMany({
    where: {
      source: "LOCAL",
      name: { contains: q },
    },
    orderBy: { name: "asc" },
    take: 25,
  });

  return NextResponse.json({ items });
}
