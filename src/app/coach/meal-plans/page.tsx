"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/lib/language";

const standardMeals = [
  { name: "Breakfast", timeLabel: "08:00", sortOrder: 1 },
  { name: "Lunch", timeLabel: "13:30", sortOrder: 2 },
  { name: "Dinner", timeLabel: "19:00", sortOrder: 3 },
  { name: "Snack", timeLabel: "21:30", sortOrder: 4 },
];

async function fetchMealPlans() {
  const res = await fetch("/api/meal-plans", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load meal plans");
  return res.json();
}

async function fetchMealPlan(id: string) {
  const res = await fetch(`/api/meal-plans/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load meal plan");
  return res.json();
}

async function createMealPlan(payload: Record<string, unknown>) {
  const res = await fetch("/api/meal-plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to create meal plan");
  }
  return res.json();
}

async function updateMealPlan(id: string, payload: Record<string, unknown>) {
  const res = await fetch(`/api/meal-plans/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to update meal plan");
  }
  return res.json();
}

async function createDay(payload: Record<string, unknown>) {
  const res = await fetch("/api/meal-plan-days", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to create day");
  }
  return res.json();
}

async function createMeal(payload: Record<string, unknown>) {
  const res = await fetch("/api/meal-plan-meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to create meal");
  }
  return res.json();
}

async function createFood(payload: Record<string, unknown>) {
  const res = await fetch("/api/meal-plan-foods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to create food");
  }
  return res.json();
}

async function assignPlan(payload: Record<string, unknown>) {
  const res = await fetch("/api/meal-plan-assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to assign meal plan");
  }
  return res.json();
}

async function generatePlan(payload: Record<string, unknown>) {
  const res = await fetch("/api/meal-plans/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to generate meal plan");
  }
  return res.json();
}

async function fetchClients() {
  const res = await fetch("/api/clients", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load clients");
  return res.json();
}

type FoodItem = {
  id?: string;
  name: string;
  brand?: string | null;
  source?: string;
  servingSize?: number | null;
  servingUnit?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
  score?: number;
};

async function searchFoods(query: string, source: string) {
  const res = await fetch(`/api/foods?q=${encodeURIComponent(query)}&source=${source}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to search foods");
  return res.json();
}

async function fetchAlternatives(payload: Record<string, unknown>) {
  const res = await fetch("/api/foods/alternatives", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to fetch alternatives");
  return res.json();
}

export default function CoachMealPlansPage() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const { data: plansData } = useQuery({ queryKey: ["mealPlans"], queryFn: fetchMealPlans });
  const { data: clientsData } = useQuery({ queryKey: ["clients"], queryFn: fetchClients });
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [planForm, setPlanForm] = useState({ name: "", description: "" });
  const [dayForm, setDayForm] = useState({ dayIndex: "0", title: "Day 1" });
  const [mealForm, setMealForm] = useState({ dayId: "", name: "", timeLabel: "", sortOrder: "0" });
  const [generateForm, setGenerateForm] = useState({
    name: "4-Meal Plan",
    description: "Generated plan",
    dayTitle: "Day 1",
    caloriesTarget: "2400",
    proteinTarget: "180",
    carbsTarget: "250",
    fatsTarget: "70",
  });
  const [foodForm, setFoodForm] = useState({
    mealId: "",
    name: "",
    quantity: "",
    unit: "g",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [foodSearchSource, setFoodSearchSource] = useState<"local" | "usda">("local");
  const [foodSearchResults, setFoodSearchResults] = useState<FoodItem[]>([]);
  const [alternatives, setAlternatives] = useState<FoodItem[]>([]);
  const [foodSearchLoading, setFoodSearchLoading] = useState(false);
  const [alternativesLoading, setAlternativesLoading] = useState(false);
  const [foodSearchError, setFoodSearchError] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({ clientId: "", startDate: "", endDate: "" });
  const [bulkAssign, setBulkAssign] = useState({ startDate: "", endDate: "", clientIds: [] as string[] });
  const [cloneName, setCloneName] = useState("");

  useEffect(() => {
    if (!selectedPlanId && plansData?.plans?.length) {
      setSelectedPlanId(plansData.plans[0].id);
    }
  }, [plansData, selectedPlanId]);

  const planQuery = useQuery({
    queryKey: ["mealPlan", selectedPlanId],
    queryFn: () => fetchMealPlan(selectedPlanId),
    enabled: Boolean(selectedPlanId),
  });

  const planMutation = useMutation({
    mutationFn: createMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setPlanForm({ name: "", description: "" });
    },
  });

  const planUpdateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateMealPlan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan", selectedPlanId] });
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: generatePlan,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      if (data?.plan?.id) {
        setSelectedPlanId(data.plan.id);
      }
    },
  });

  const dayMutation = useMutation({
    mutationFn: createDay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan", selectedPlanId] });
      setDayForm({ dayIndex: "0", title: "Day 1" });
    },
  });

  const mealMutation = useMutation({
    mutationFn: createMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan", selectedPlanId] });
      setMealForm({ dayId: "", name: "", timeLabel: "", sortOrder: "0" });
    },
  });

  const foodMutation = useMutation({
    mutationFn: createFood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan", selectedPlanId] });
      setFoodForm({ mealId: "", name: "", quantity: "", unit: "g", calories: "", protein: "", carbs: "", fats: "" });
    },
  });

  const assignMutation = useMutation({
    mutationFn: assignPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan", selectedPlanId] });
      setAssignForm({ clientId: "", startDate: "", endDate: "" });
    },
  });

  const selectedPlan = planQuery.data?.plan;

  const t = useMemo(
    () =>
      language === "ar"
        ? {
            eyebrow: "مساحة المدرب",
            title: "خطط الوجبات",
            subtitle: "أنشئ خططًا متعددة الأيام ثم عيّنها للعملاء.",
            createPlan: "إنشاء خطة وجبات",
            planBuilder: "منشئ الخطة",
            planBuilderDesc: "اختر خطة لتعديل الأيام والوجبات والأطعمة.",
            planName: "اسم الخطة",
            description: "الوصف",
            create: "إنشاء",
            creating: "جارٍ الإنشاء...",
            selectPlan: "اختر خطة",
            dayIndex: "رقم اليوم",
            dayTitle: "عنوان اليوم",
            addDay: "إضافة يوم",
            selectDay: "اختر يوم",
            mealName: "اسم الوجبة",
            timeLabel: "وقت الوجبة",
            addMeal: "إضافة وجبة",
            addStandardMeals: "إضافة 4 وجبات أساسية",
            standardMealsHint: "فطور، غداء، عشاء، سناك",
            selectMeal: "اختر وجبة",
            food: "طعام",
            quantity: "الكمية",
            unit: "الوحدة",
            calories: "السعرات",
            protein: "البروتين",
            carbs: "الكربوهيدرات",
            fats: "الدهون",
            addFood: "إضافة طعام",
            assignPlan: "تعيين الخطة",
            selectClient: "اختر عميل",
            startDate: "تاريخ البداية",
            endDate: "تاريخ الانتهاء",
            assign: "تعيين",
            status: "الحالة",
            generateTitle: "مولد خطة الوجبات",
            generateDesc: "أنشئ خطة 4 وجبات تلقائيًا حسب الأهداف.",
            generateButton: "إنشاء خطة تلقائيًا",
            generating: "جارٍ التوليد...",
            dayTitleLabel: "عنوان اليوم",
            targetsTitle: "الأهداف اليومية",
            cloneTitle: "نسخ خطة",
            cloneDesc: "أنشئ نسخة من الخطة الحالية.",
            cloneButton: "نسخ الخطة",
            cloneName: "اسم النسخة",
            bulkAssignTitle: "تعيين جماعي",
            bulkAssignDesc: "تعيين الخطة لعدة عملاء مرة واحدة.",
            bulkAssignButton: "تعيين للخيار",
            selectClients: "اختر العملاء",
            foodLibrary: "مكتبة الأطعمة",
            searchFood: "ابحث عن طعام",
            search: "بحث",
            searching: "جارٍ البحث...",
            source: "المصدر",
            localSource: "محلي",
            usdaSource: "USDA",
            suggestAlternatives: "اقتراح بدائل بالمغذيات",
            useFood: "استخدم",
            noResults: "لا توجد نتائج",
          }
        : {
            eyebrow: "Coach workspace",
            title: "Meal plans",
            subtitle: "Build multi-day plans with meals and foods, then assign them to clients.",
            createPlan: "Create meal plan",
            planBuilder: "Plan builder",
            planBuilderDesc: "Select a plan to edit its days, meals, and foods.",
            planName: "Plan name",
            description: "Description",
            create: "Create plan",
            creating: "Creating...",
            selectPlan: "Select plan",
            dayIndex: "Day index",
            dayTitle: "Day title",
            addDay: "Add day",
            selectDay: "Select day",
            mealName: "Meal name",
            timeLabel: "Time label",
            addMeal: "Add meal",
            addStandardMeals: "Add 4 standard meals",
            standardMealsHint: "Breakfast, lunch, dinner, snack",
            selectMeal: "Select meal",
            food: "Food",
            quantity: "Quantity",
            unit: "Unit",
            calories: "Calories",
            protein: "Protein",
            carbs: "Carbs",
            fats: "Fats",
            addFood: "Add food",
            assignPlan: "Assign plan",
            selectClient: "Select client",
            startDate: "Start date",
            endDate: "End date",
            assign: "Assign",
            status: "Status",
            generateTitle: "Meal plan generator",
            generateDesc: "Auto-generate a 4-meal plan based on targets.",
            generateButton: "Generate plan",
            generating: "Generating...",
            dayTitleLabel: "Day title",
            targetsTitle: "Daily targets",
            cloneTitle: "Clone plan",
            cloneDesc: "Create a copy of the current plan.",
            cloneButton: "Clone plan",
            cloneName: "Clone name",
            bulkAssignTitle: "Bulk assign",
            bulkAssignDesc: "Assign this plan to multiple clients at once.",
            bulkAssignButton: "Assign selected",
            selectClients: "Select clients",
            foodLibrary: "Food library",
            searchFood: "Search foods",
            search: "Search",
            searching: "Searching...",
            source: "Source",
            localSource: "Local",
            usdaSource: "USDA",
            suggestAlternatives: "Suggest alternatives",
            useFood: "Use",
            noResults: "No results",
          },
    [language]
  );

  async function addStandardMeals(dayId: string) {
    for (const meal of standardMeals) {
      await mealMutation.mutateAsync({
        mealPlanDayId: dayId,
        name: meal.name,
        timeLabel: meal.timeLabel,
        sortOrder: meal.sortOrder,
      });
    }
  }

  function applyFoodItem(item: FoodItem) {
    setFoodForm((prev) => ({
      ...prev,
      name: item.name,
      quantity: String(item.servingSize ?? 100),
      unit: item.servingUnit ?? "g",
      calories: item.calories != null ? String(item.calories) : "",
      protein: item.protein != null ? String(item.protein) : "",
      carbs: item.carbs != null ? String(item.carbs) : "",
      fats: item.fats != null ? String(item.fats) : "",
    }));
  }

  async function handleFoodSearch() {
    if (!foodSearchQuery.trim()) return;
    setFoodSearchLoading(true);
    setFoodSearchError(null);
    try {
      const data = await searchFoods(foodSearchQuery.trim(), foodSearchSource);
      setFoodSearchResults(data?.items ?? []);
    } catch (error) {
      setFoodSearchError(error instanceof Error ? error.message : "Search failed");
      setFoodSearchResults([]);
    } finally {
      setFoodSearchLoading(false);
    }
  }

  async function handleAlternatives() {
    setAlternativesLoading(true);
    try {
      const payload = {
        calories: foodForm.calories ? Number(foodForm.calories) : undefined,
        protein: foodForm.protein ? Number(foodForm.protein) : undefined,
        carbs: foodForm.carbs ? Number(foodForm.carbs) : undefined,
        fats: foodForm.fats ? Number(foodForm.fats) : undefined,
        limit: 8,
      };
      const data = await fetchAlternatives(payload);
      setAlternatives(data?.items ?? []);
    } catch {
      setAlternatives([]);
    } finally {
      setAlternativesLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          subtitle={t.subtitle}
        />

        <Card title={t.createPlan}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              planMutation.mutate(planForm);
            }}
          >
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              placeholder={t.planName}
              value={planForm.name}
              onChange={(event) => setPlanForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <textarea
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              placeholder={t.description}
              rows={3}
              value={planForm.description}
              onChange={(event) => setPlanForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <Button type="submit" disabled={planMutation.isPending}>
              {planMutation.isPending ? t.creating : t.create}
            </Button>
          </form>
        </Card>

        <Card title={t.generateTitle} description={t.generateDesc}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              generateMutation.mutate({
                name: generateForm.name,
                description: generateForm.description,
                dayTitle: generateForm.dayTitle,
                caloriesTarget: Number(generateForm.caloriesTarget),
                proteinTarget: Number(generateForm.proteinTarget),
                carbsTarget: Number(generateForm.carbsTarget),
                fatsTarget: Number(generateForm.fatsTarget),
              });
            }}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.planName}
                value={generateForm.name}
                onChange={(event) => setGenerateForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.dayTitleLabel}
                value={generateForm.dayTitle}
                onChange={(event) => setGenerateForm((prev) => ({ ...prev, dayTitle: event.target.value }))}
                required
              />
            </div>
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              placeholder={t.description}
              value={generateForm.description}
              onChange={(event) => setGenerateForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <p className="text-xs uppercase tracking-wide text-slate-400">{t.targetsTitle}</p>
            <div className="grid gap-3 md:grid-cols-4">
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.calories}
                type="number"
                value={generateForm.caloriesTarget}
                onChange={(event) => setGenerateForm((prev) => ({ ...prev, caloriesTarget: event.target.value }))}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.protein}
                type="number"
                value={generateForm.proteinTarget}
                onChange={(event) => setGenerateForm((prev) => ({ ...prev, proteinTarget: event.target.value }))}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.carbs}
                type="number"
                value={generateForm.carbsTarget}
                onChange={(event) => setGenerateForm((prev) => ({ ...prev, carbsTarget: event.target.value }))}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.fats}
                type="number"
                value={generateForm.fatsTarget}
                onChange={(event) => setGenerateForm((prev) => ({ ...prev, fatsTarget: event.target.value }))}
                required
              />
            </div>
            <Button type="submit" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? t.generating : t.generateButton}
            </Button>
          </form>
        </Card>

        <Card title={t.planBuilder} description={t.planBuilderDesc}>
          <div className="grid gap-4">
            <select
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              value={selectedPlanId}
              onChange={(event) => setSelectedPlanId(event.target.value)}
            >
              {plansData?.plans?.map((plan: { id: string; name: string }) => (
                <option key={plan.id} value={plan.id} className="text-slate-900">
                  {plan.name}
                </option>
              ))}
            </select>

            {selectedPlan && (
              <div className="grid gap-3 text-sm text-slate-200">
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                    value={selectedPlan.name}
                    onChange={(event) =>
                      planUpdateMutation.mutate({ id: selectedPlan.id, payload: { name: event.target.value } })
                    }
                  />
                  <select
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                    value={selectedPlan.status}
                    onChange={(event) =>
                      planUpdateMutation.mutate({ id: selectedPlan.id, payload: { status: event.target.value } })
                    }
                  >
                    {(["DRAFT", "ACTIVE", "ARCHIVED"] as const).map((status) => (
                      <option key={status} value={status} className="text-slate-900">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <form
                  className="grid gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!selectedPlan) return;
                    dayMutation.mutate({
                      mealPlanId: selectedPlan.id,
                      dayIndex: Number(dayForm.dayIndex),
                      title: dayForm.title,
                    });
                  }}
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                      type="number"
                      placeholder={t.dayIndex}
                      value={dayForm.dayIndex}
                      onChange={(event) => setDayForm((prev) => ({ ...prev, dayIndex: event.target.value }))}
                      min={0}
                    />
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                      placeholder={t.dayTitle}
                      value={dayForm.title}
                      onChange={(event) => setDayForm((prev) => ({ ...prev, title: event.target.value }))}
                    />
                    <Button type="submit" disabled={dayMutation.isPending}>
                      {t.addDay}
                    </Button>
                  </div>
                </form>

                <Card title={t.cloneTitle} description={t.cloneDesc}>
                  <div className="grid gap-3">
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                      placeholder={t.cloneName}
                      value={cloneName}
                      onChange={(event) => setCloneName(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!selectedPlanId}
                      onClick={async () => {
                        const name = cloneName || `${selectedPlan.name} Copy`;
                        await fetch(`/api/meal-plans/${selectedPlanId}/clone`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name }),
                        });
                        setCloneName("");
                        queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
                      }}
                    >
                      {t.cloneButton}
                    </Button>
                  </div>
                </Card>

                <Card title={t.bulkAssignTitle} description={t.bulkAssignDesc}>
                  <form
                    className="grid gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!selectedPlanId || bulkAssign.clientIds.length === 0) return;
                      fetch("/api/meal-plan-assignments/bulk", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          mealPlanId: selectedPlanId,
                          clientIds: bulkAssign.clientIds,
                          startDate: new Date(bulkAssign.startDate).toISOString(),
                          endDate: bulkAssign.endDate ? new Date(bulkAssign.endDate).toISOString() : undefined,
                        }),
                      }).then(() => {
                        setBulkAssign({ startDate: "", endDate: "", clientIds: [] });
                        queryClient.invalidateQueries({ queryKey: ["mealPlan", selectedPlanId] });
                      });
                    }}
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        type="date"
                        value={bulkAssign.startDate}
                        onChange={(event) =>
                          setBulkAssign((prev) => ({ ...prev, startDate: event.target.value }))
                        }
                        required
                      />
                      <input
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        type="date"
                        value={bulkAssign.endDate}
                        onChange={(event) =>
                          setBulkAssign((prev) => ({ ...prev, endDate: event.target.value }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <p className="text-xs uppercase tracking-wide text-slate-400">{t.selectClients}</p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {clientsData?.clients?.map((client: { id: string; name: string }) => (
                          <label key={client.id} className="flex items-center gap-2 text-xs text-slate-300">
                            <input
                              type="checkbox"
                              checked={bulkAssign.clientIds.includes(client.id)}
                              onChange={(event) =>
                                setBulkAssign((prev) => ({
                                  ...prev,
                                  clientIds: event.target.checked
                                    ? [...prev.clientIds, client.id]
                                    : prev.clientIds.filter((id) => id !== client.id),
                                }))
                              }
                            />
                            {client.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" variant="outline" disabled={!bulkAssign.clientIds.length}>
                      {t.bulkAssignButton}
                    </Button>
                  </form>
                </Card>

                <form
                  className="grid gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    mealMutation.mutate({
                      mealPlanDayId: mealForm.dayId,
                      name: mealForm.name,
                      timeLabel: mealForm.timeLabel || undefined,
                      sortOrder: Number(mealForm.sortOrder),
                    });
                  }}
                >
                  <div className="grid gap-2 md:grid-cols-4">
                    <select
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      value={mealForm.dayId}
                      onChange={(event) => setMealForm((prev) => ({ ...prev, dayId: event.target.value }))}
                    >
                      <option value="" className="text-slate-900">
                        {t.selectDay}
                      </option>
                      {selectedPlan.days.map((day: { id: string; title: string }) => (
                        <option key={day.id} value={day.id} className="text-slate-900">
                          {day.title}
                        </option>
                      ))}
                    </select>
                    <select
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      value={mealForm.name}
                      onChange={(event) => setMealForm((prev) => ({ ...prev, name: event.target.value }))}
                      disabled={!mealForm.dayId}
                    >
                      <option value="" className="text-slate-900">
                        {t.mealName}
                      </option>
                      {standardMeals.map((meal) => {
                        const existing = selectedPlan.days
                          .find((day: { id: string }) => day.id === mealForm.dayId)
                          ?.meals?.some((existingMeal: { name: string }) =>
                            existingMeal.name.toLowerCase() === meal.name.toLowerCase()
                          );
                        return (
                          <option
                            key={meal.name}
                            value={meal.name}
                            className="text-slate-900"
                            disabled={Boolean(existing)}
                          >
                            {meal.name}
                          </option>
                        );
                      })}
                    </select>
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      placeholder={t.timeLabel}
                      value={mealForm.timeLabel}
                      onChange={(event) => setMealForm((prev) => ({ ...prev, timeLabel: event.target.value }))}
                    />
                    <Button type="submit" disabled={mealMutation.isPending || !mealForm.dayId || !mealForm.name}>
                      {t.addMeal}
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={mealMutation.isPending || !mealForm.dayId}
                      onClick={() => mealForm.dayId && addStandardMeals(mealForm.dayId)}
                    >
                      {t.addStandardMeals}
                    </Button>
                    <p className="text-xs text-slate-500">
                      {t.standardMealsHint}
                    </p>
                  </div>
                </form>

                <form
                  className="grid gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    foodMutation.mutate({
                      mealPlanMealId: foodForm.mealId,
                      name: foodForm.name,
                      quantity: Number(foodForm.quantity),
                      unit: foodForm.unit,
                      calories: Number(foodForm.calories),
                      protein: Number(foodForm.protein),
                      carbs: Number(foodForm.carbs),
                      fats: Number(foodForm.fats),
                    });
                  }}
                >
                  <div className="grid gap-2 md:grid-cols-6">
                    <select
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      value={foodForm.mealId}
                      onChange={(event) => setFoodForm((prev) => ({ ...prev, mealId: event.target.value }))}
                    >
                      <option value="" className="text-slate-900">
                        {t.selectMeal}
                      </option>
                      {selectedPlan.days.flatMap((day: { meals: { id: string; name: string }[] }) =>
                        day.meals.map((meal) => (
                          <option key={meal.id} value={meal.id} className="text-slate-900">
                            {meal.name}
                          </option>
                        ))
                      )}
                    </select>
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      placeholder={t.food}
                      value={foodForm.name}
                      onChange={(event) => setFoodForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      placeholder={t.quantity}
                      type="number"
                      value={foodForm.quantity}
                      onChange={(event) => setFoodForm((prev) => ({ ...prev, quantity: event.target.value }))}
                    />
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      placeholder={t.unit}
                      value={foodForm.unit}
                      onChange={(event) => setFoodForm((prev) => ({ ...prev, unit: event.target.value }))}
                    />
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      placeholder={t.calories}
                      type="number"
                      value={foodForm.calories}
                      onChange={(event) => setFoodForm((prev) => ({ ...prev, calories: event.target.value }))}
                    />
                    <Button type="submit" disabled={foodMutation.isPending || !foodForm.mealId}>
                      {t.addFood}
                    </Button>
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      placeholder={t.protein}
                      type="number"
                      value={foodForm.protein}
                      onChange={(event) => setFoodForm((prev) => ({ ...prev, protein: event.target.value }))}
                    />
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      placeholder={t.carbs}
                      type="number"
                      value={foodForm.carbs}
                      onChange={(event) => setFoodForm((prev) => ({ ...prev, carbs: event.target.value }))}
                    />
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      placeholder={t.fats}
                      type="number"
                      value={foodForm.fats}
                      onChange={(event) => setFoodForm((prev) => ({ ...prev, fats: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-wide text-slate-400">{t.foodLibrary}</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAlternatives}
                        disabled={alternativesLoading}
                      >
                        {alternativesLoading ? t.generating : t.suggestAlternatives}
                      </Button>
                    </div>
                    <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                      <input
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        placeholder={t.searchFood}
                        value={foodSearchQuery}
                        onChange={(event) => setFoodSearchQuery(event.target.value)}
                      />
                      <select
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        value={foodSearchSource}
                        onChange={(event) =>
                          setFoodSearchSource(event.target.value === "usda" ? "usda" : "local")
                        }
                      >
                        <option value="local" className="text-slate-900">
                          {t.localSource}
                        </option>
                        <option value="usda" className="text-slate-900">
                          {t.usdaSource}
                        </option>
                      </select>
                      <Button type="button" onClick={handleFoodSearch} disabled={foodSearchLoading}>
                        {foodSearchLoading ? t.searching : t.search}
                      </Button>
                    </div>
                    {foodSearchError && <p className="text-xs text-red-400">{foodSearchError}</p>}
                    <div className="grid gap-2 md:grid-cols-2">
                      {foodSearchResults.map((item) => (
                        <div key={`${item.name}-${item.brand ?? ""}`} className="rounded-lg border border-white/10 p-3">
                          <p className="text-xs text-white">{item.name}</p>
                          {item.brand && <p className="text-[11px] text-slate-400">{item.brand}</p>}
                          <p className="mt-2 text-[11px] text-slate-400">
                            {item.calories ?? 0} kcal • P {item.protein ?? 0} • C {item.carbs ?? 0} • F {item.fats ?? 0}
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => applyFoodItem(item)}
                          >
                            {t.useFood}
                          </Button>
                        </div>
                      ))}
                      {!foodSearchLoading && foodSearchQuery && foodSearchResults.length === 0 && (
                        <p className="text-xs text-slate-400">{t.noResults}</p>
                      )}
                    </div>
                    {alternatives.length > 0 && (
                      <div className="grid gap-2 md:grid-cols-2">
                        {alternatives.map((item) => (
                          <div key={`${item.name}-${item.brand ?? "alt"}`} className="rounded-lg border border-white/10 p-3">
                            <p className="text-xs text-white">{item.name}</p>
                            <p className="mt-2 text-[11px] text-slate-400">
                              {item.calories ?? 0} kcal • P {item.protein ?? 0} • C {item.carbs ?? 0} • F {item.fats ?? 0}
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => applyFoodItem(item)}
                            >
                              {t.useFood}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>

                <form
                  className="grid gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!selectedPlan) return;
                    assignMutation.mutate({
                      mealPlanId: selectedPlan.id,
                      clientId: assignForm.clientId,
                      startDate: new Date(assignForm.startDate).toISOString(),
                      endDate: assignForm.endDate ? new Date(assignForm.endDate).toISOString() : undefined,
                    });
                  }}
                >
                  <div className="grid gap-2 md:grid-cols-4">
                    <select
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      value={assignForm.clientId}
                      onChange={(event) => setAssignForm((prev) => ({ ...prev, clientId: event.target.value }))}
                    >
                      <option value="" className="text-slate-900">
                        {t.selectClient}
                      </option>
                      {clientsData?.clients?.map((client: { id: string; name: string }) => (
                        <option key={client.id} value={client.id} className="text-slate-900">
                          {client.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      type="date"
                      value={assignForm.startDate}
                      onChange={(event) => setAssignForm((prev) => ({ ...prev, startDate: event.target.value }))}
                      required
                    />
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      type="date"
                      value={assignForm.endDate}
                      onChange={(event) => setAssignForm((prev) => ({ ...prev, endDate: event.target.value }))}
                    />
                    <Button type="submit" disabled={assignMutation.isPending || !assignForm.clientId}>
                      {t.assign}
                    </Button>
                  </div>
                </form>

                <div className="grid gap-3">
                  {selectedPlan.days.map((day: { id: string; title: string; meals: { id: string; name: string; foods: { id: string; name: string; quantity: number; unit: string; calories: number }[] }[] }) => (
                    <div key={day.id} className="rounded-xl border border-white/10 p-4">
                      <p className="text-sm text-white">{day.title}</p>
                      <div className="mt-2 grid gap-3">
                        {day.meals.map((meal) => (
                          <div key={meal.id} className="rounded-lg border border-white/10 p-3">
                            <p className="text-xs text-slate-400">{meal.name}</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-400">
                              {meal.foods.map((food) => (
                                <li key={food.id}>
                                  {food.name} ({food.quantity} {food.unit}, {food.calories} kcal)
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
