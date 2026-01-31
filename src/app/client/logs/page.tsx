"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useLanguage } from "@/lib/language";

type MealPlanFood = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type MealPlanMeal = {
  id: string;
  name: string;
  timeLabel?: string | null;
  foods: MealPlanFood[];
};

type MealPlanDay = {
  id: string;
  title: string;
  meals: MealPlanMeal[];
};

type MealLogItem = {
  id?: string;
  mealPlanFoodId?: string | null;
  name: string;
  plannedQuantity?: number | null;
  plannedUnit?: string | null;
  replacementUnit?: string | null;
  plannedCalories?: number | null;
  plannedProtein?: number | null;
  plannedCarbs?: number | null;
  plannedFats?: number | null;
  consumedQuantity?: number | null;
  consumedCalories?: number | null;
  consumedProtein?: number | null;
  consumedCarbs?: number | null;
  consumedFats?: number | null;
  isExtra?: boolean;
};

type MealLog = {
  id: string;
  mealPlanMealId?: string | null;
  status: "PLANNED" | "EATEN" | "SKIPPED";
  plannedCaloriesTotal?: number | null;
  consumedCaloriesTotal?: number | null;
  items: MealLogItem[];
};

type MealEntry = {
  status: "PLANNED" | "EATEN" | "SKIPPED";
  items: MealLogItem[];
  extraItems: MealLogItem[];
};
type AlternativeFood = {
  name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  servingSize?: number | null;
  servingUnit?: string | null;
};

async function fetchAlternatives(payload: Record<string, unknown>) {
  const res = await fetch("/api/foods/alternatives", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to load alternatives");
  return res.json();
}

async function searchFoods(query: string, source: "local" | "usda") {
  const res = await fetch(`/api/foods?q=${encodeURIComponent(query)}&source=${source}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to search foods");
  return res.json();
}

export default function ClientLogsPage() {
  const { language } = useLanguage();
  const [status, setStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState<Array<{ id: string; date: string; note: string; type: string }>>(
    []
  );
  const [notesStatus, setNotesStatus] = useState<string | null>(null);
  const [mealPlanDay, setMealPlanDay] = useState<MealPlanDay | null>(null);
  const [mealLogs, setMealLogs] = useState<Record<string, MealEntry>>({});
  const [summary, setSummary] = useState<{ daysLogged: number; complianceRate: number; streak: number } | null>(null);
  const [planStatus, setPlanStatus] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [alternativesByFood, setAlternativesByFood] = useState<Record<string, AlternativeFood[]>>({});
  const [openAlternativeFoodId, setOpenAlternativeFoodId] = useState<string | null>(null);
  const [loadingAlternativeFoodId, setLoadingAlternativeFoodId] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "" });
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const t = useMemo(
    () =>
      language === "ar"
        ? {
            eyebrow: "مساحة العميل",
            title: "خطة الوجبات اليومية",
            subtitle: "اتبع خطة المدرب، عدّل الكميات وسجّل وجبات إضافية.",
            todayTitle: "اليوم",
            todayDesc: "راجع وجباتك وحدد ما تم تناوله.",
            noPlan: "لا توجد خطة وجبات بعد.",
            planned: "المخطط",
            eaten: "تم تناوله",
            skipped: "تم التجاوز",
            saveMeal: "حفظ الوجبة",
            saveAll: "حفظ كل الوجبات",
            addExtraFood: "إضافة طعام إضافي",
            addExtraMeal: "إضافة وجبة إضافية",
            addExtraMealDesc: "سجّل وجبات غير موجودة بالخطة.",
            coachNotes: "ملاحظات المدرب الأخيرة",
            refreshNotes: "تحديث الملاحظات",
            mealChecklist: "قائمة الوجبات",
            replacement: "بديل",
            done: "تم",
            breakfast: "فطور",
            lunch: "غداء",
            dinner: "عشاء",
            snack: "سناك",
            plannedLabel: "المخطط",
            eatenLabel: "تم تناوله",
            dateLabel: "التاريخ",
            plannedKcal: "سعرات مخططة",
            eatenKcal: "سعرات مأكولة",
            noNotes: "لا توجد ملاحظات بعد.",
            waterLog: "سجل الماء",
            logWater: "تسجيل الماء",
            waterPlaceholder: "كمية الماء (مل)",
            weightLog: "سجل الوزن",
            logWeight: "تسجيل الوزن",
            weightPlaceholder: "الوزن (كجم)",
            bodyFatPlaceholder: "نسبة الدهون % (اختياري)",
            workoutLog: "سجل التمرين",
            logWorkout: "تسجيل التمرين",
            workoutTitlePlaceholder: "عنوان التمرين",
            workoutDetailsPlaceholder: "تفاصيل التمرين",
            photoLog: "سجل الصور",
            logPhoto: "تسجيل صورة",
            imageUrlPlaceholder: "رابط الصورة",
            notesPlaceholder: "ملاحظات",
            extraFoodTitle: "إضافة طعام إضافي",
            foodNamePlaceholder: "اسم الطعام",
            quantityPlaceholder: "الكمية",
            unitPlaceholder: "الوحدة",
            caloriesPlaceholder: "السعرات",
            proteinPlaceholder: "البروتين",
            carbsPlaceholder: "الكربوهيدرات",
            fatsPlaceholder: "الدهون",
            addExtraMealTitle: "إضافة وجبة إضافية",
            mealNamePlaceholder: "اسم الوجبة",
            macroMatch: "مطابقة ماكروز",
            swapFood: "بدّل الطعام",
            alternatives: "بدائل مقترحة",
            loadingAlternatives: "جارٍ التحميل...",
            noAlternatives: "لا توجد بدائل",
            changePassword: "تغيير كلمة المرور",
            currentPassword: "كلمة المرور الحالية",
            newPassword: "كلمة المرور الجديدة",
            updatePassword: "تحديث كلمة المرور",
            passwordUpdated: "تم تحديث كلمة المرور.",
            complete: "مكتمل",
            momentum: "الزخم الأسبوعي",
            streak: "سلسلة الأيام",
            daysLogged: "أيام مسجلة",
            compliance: "الالتزام",
            mealsCompleted: "الوجبات المكتملة",
            checkOnly: "قم بإلغاء تحديد الطعام غير المتناول فقط.",
          }
        : {
            eyebrow: "Client workspace",
            title: "Daily meal plan",
            subtitle: "Follow your coach plan, adjust quantities, and log extra meals.",
            todayTitle: "Today",
            todayDesc: "Review your assigned meals and mark them as eaten.",
            noPlan: "No meal plan assigned yet.",
            planned: "Planned",
            eaten: "Eaten",
            skipped: "Skipped",
            saveMeal: "Save meal",
            saveAll: "Save all meals",
            addExtraFood: "Add extra food",
            addExtraMeal: "Add extra meal",
            addExtraMealDesc: "Log meals not included in your plan.",
            coachNotes: "Recent coach notes",
            refreshNotes: "Refresh notes",
            mealChecklist: "Meal checklist",
            replacement: "Replacement",
            done: "Done",
            breakfast: "Breakfast",
            lunch: "Lunch",
            dinner: "Dinner",
            snack: "Snack",
            plannedLabel: "Planned",
            eatenLabel: "Eaten",
            dateLabel: "Date",
            plannedKcal: "Planned kcal",
            eatenKcal: "Eaten kcal",
            noNotes: "No notes yet.",
            waterLog: "Water log",
            logWater: "Log water",
            waterPlaceholder: "Water ml",
            weightLog: "Weight log",
            logWeight: "Log weight",
            weightPlaceholder: "Weight (kg)",
            bodyFatPlaceholder: "Body fat % (optional)",
            workoutLog: "Workout log",
            logWorkout: "Log workout",
            workoutTitlePlaceholder: "Workout title",
            workoutDetailsPlaceholder: "Workout details",
            photoLog: "Photo log",
            logPhoto: "Log photo",
            imageUrlPlaceholder: "Image URL",
            notesPlaceholder: "Notes",
            extraFoodTitle: "Add extra food",
            foodNamePlaceholder: "Food name",
            quantityPlaceholder: "Qty",
            unitPlaceholder: "Unit",
            caloriesPlaceholder: "Calories",
            proteinPlaceholder: "Protein",
            carbsPlaceholder: "Carbs",
            fatsPlaceholder: "Fats",
            addExtraMealTitle: "Add extra meal",
            mealNamePlaceholder: "Meal name",
            macroMatch: "Macro match",
            swapFood: "Swap food",
            alternatives: "Suggested alternatives",
            loadingAlternatives: "Loading...",
            noAlternatives: "No alternatives found",
            changePassword: "Change password",
            currentPassword: "Current password",
            newPassword: "New password",
            updatePassword: "Update password",
            passwordUpdated: "Password updated.",
            complete: "complete",
            momentum: "Weekly momentum",
            streak: "Streak",
            daysLogged: "Days logged",
            compliance: "Compliance",
            mealsCompleted: "Meals completed",
            checkOnly: "Only untick foods you did not eat.",
          },
    [language]
  );

  function localizeMealName(name: string) {
    const key = name.trim().toLowerCase();
    if (key === "breakfast") return t.breakfast;
    if (key === "lunch") return t.lunch;
    if (key === "dinner") return t.dinner;
    if (key === "snack") return t.snack;
    return name;
  }

  async function submitLog(endpoint: string, payload: Record<string, unknown>) {
    setStatus(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setStatus(data.error ?? "Save failed");
      return;
    }
    setStatus("Saved.");
  }

  async function loadCoachNotes() {
    setNotesStatus(null);
    const [mealsRes, photosRes] = await Promise.all([
      fetch("/api/meal-logs", { cache: "no-store" }),
      fetch("/api/photo-logs", { cache: "no-store" }),
    ]);

    if (!mealsRes.ok || !photosRes.ok) {
      setNotesStatus("Unable to load coach notes.");
      return;
    }

    const mealsData = await mealsRes.json();
    const photosData = await photosRes.json();

    const mealNotes = (mealsData.meals ?? [])
      .filter((meal: { coachNote?: string | null }) => meal.coachNote)
      .map((meal: { id: string; date: string; coachNote: string }) => ({
        id: meal.id,
        date: meal.date,
        note: meal.coachNote,
        type: "Meal",
      }));

    const photoNotes = (photosData.photoLogs ?? [])
      .filter((log: { coachNote?: string | null }) => log.coachNote)
      .map((log: { id: string; date: string; coachNote: string }) => ({
        id: log.id,
        date: log.date,
        note: log.coachNote,
        type: "Photo",
      }));

    const merged = [...mealNotes, ...photoNotes].sort((a, b) =>
      a.date < b.date ? 1 : -1
    );
    setNotes(merged.slice(0, 6));
  }

  async function loadMealPlanLogs() {
    setPlanStatus(null);
    const res = await fetch(`/api/meal-plan-logs?date=${new Date(date).toISOString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      setPlanStatus("Unable to load meal plan.");
      return;
    }

    const data = await res.json();
    if (!data.day) {
      setMealPlanDay(null);
      setMealLogs({});
      return;
    }

    const logsByMeal = new Map<string, MealLog>();
    (data.logs ?? []).forEach((log: MealLog) => {
      if (log.mealPlanMealId) logsByMeal.set(log.mealPlanMealId, log);
    });

    const entries: Record<string, MealEntry> = {};
    data.day.meals.forEach((meal: MealPlanMeal) => {
      const log = logsByMeal.get(meal.id);
      const plannedItems = meal.foods.map((food) => {
        const existing = log?.items?.find((item) => item.mealPlanFoodId === food.id);
        return {
          mealPlanFoodId: food.id,
          name: existing?.name ?? food.name,
          plannedQuantity: food.quantity,
          plannedUnit: food.unit,
          plannedCalories: food.calories,
          plannedProtein: food.protein,
          plannedCarbs: food.carbs,
          plannedFats: food.fats,
          consumedQuantity: existing?.consumedQuantity ?? food.quantity,
          consumedCalories: existing?.consumedCalories ?? null,
          consumedProtein: existing?.consumedProtein ?? null,
          consumedCarbs: existing?.consumedCarbs ?? null,
          consumedFats: existing?.consumedFats ?? null,
          replacementUnit: existing?.plannedUnit ?? null,
        };
      });
      const extraItems = (log?.items ?? []).filter((item) => item.isExtra);
      entries[meal.id] = {
        status: log?.status ?? "PLANNED",
        items: plannedItems,
        extraItems,
      };
    });

    setMealPlanDay(data.day);
    setMealLogs(entries);
  }

  async function loadSummary() {
    const res = await fetch("/api/meal-logs/summary", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setSummary(data);
  }

  async function handleLoadAlternatives(food: MealPlanFood) {
    setOpenAlternativeFoodId((prev) => (prev === food.id ? null : food.id));
    if (alternativesByFood[food.id]) return;
    setLoadingAlternativeFoodId(food.id);
    try {
      const data = await fetchAlternatives({
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        limit: 6,
      });
      let items: AlternativeFood[] = data?.items ?? [];
      if (!items.length) {
        const local = await searchFoods(food.name, "local").catch(() => ({ items: [] }));
        items = local?.items ?? [];
      }
      if (!items.length) {
        const usda = await searchFoods(food.name, "usda").catch(() => ({ items: [] }));
        items = usda?.items ?? [];
      }
      setAlternativesByFood((prev) => ({
        ...prev,
        [food.id]: items,
      }));
    } catch {
      setAlternativesByFood((prev) => ({
        ...prev,
        [food.id]: [],
      }));
    } finally {
      setLoadingAlternativeFoodId(null);
    }
  }

  function applyAlternative(mealId: string, foodId: string, alternative: AlternativeFood) {
    setMealLogs((prev) => ({
      ...prev,
      [mealId]: {
        ...prev[mealId],
        items: prev[mealId].items.map((item) =>
          item.mealPlanFoodId === foodId
            ? {
                ...item,
                name: alternative.name,
                consumedQuantity: alternative.servingSize ?? item.consumedQuantity ?? item.plannedQuantity ?? null,
                replacementUnit: alternative.servingUnit ?? item.replacementUnit ?? item.plannedUnit ?? null,
                consumedCalories: alternative.calories ?? item.consumedCalories ?? null,
                consumedProtein: alternative.protein ?? item.consumedProtein ?? null,
                consumedCarbs: alternative.carbs ?? item.consumedCarbs ?? null,
                consumedFats: alternative.fats ?? item.consumedFats ?? null,
              }
            : item
        ),
      },
    }));
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordStatus(null);
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setPasswordStatus(data?.error ?? "Unable to update password");
      } else {
        setPasswordStatus(t.passwordUpdated);
        setPasswordForm({ current: "", next: "" });
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  async function saveMealLog(meal: MealPlanMeal) {
    const entry = mealLogs[meal.id];
    if (!entry) return;

    const items = [
      ...entry.items.map((item) => ({
        mealPlanFoodId: item.mealPlanFoodId ?? undefined,
        name: item.name,
        consumedQuantity: item.consumedQuantity ?? item.plannedQuantity ?? undefined,
        unit: item.replacementUnit ?? item.plannedUnit ?? undefined,
        calories: item.consumedCalories ?? undefined,
        protein: item.consumedProtein ?? undefined,
        carbs: item.consumedCarbs ?? undefined,
        fats: item.consumedFats ?? undefined,
      })),
    ];

    const allSkipped = entry.items.every((item) => (item.consumedQuantity ?? 0) <= 0);
    const status = allSkipped ? "SKIPPED" : "EATEN";

    const res = await fetch("/api/meal-plan-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date(date).toISOString(),
        mealPlanMealId: meal.id,
        status,
        items,
      }),
    });

    if (!res.ok) {
      setStatus("Unable to save meal.");
      return;
    }
    setStatus("Meal updated.");
    loadMealPlanLogs();
    loadSummary();
  }

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    loadCoachNotes();
    loadMealPlanLogs();
    loadSummary();
  }, [date]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const dayTotals = useMemo(() => {
    if (!mealPlanDay) return { planned: 0, consumed: 0 };
    let planned = 0;
    let consumed = 0;
    mealPlanDay.meals.forEach((meal) => {
      const entry = mealLogs[meal.id];
      meal.foods.forEach((food) => {
        planned += food.calories;
        const entryItem = entry?.items.find((item) => item.mealPlanFoodId === food.id);
        if (entryItem?.consumedCalories != null) {
          consumed += entryItem.consumedCalories;
        } else {
          const consumedQty = entryItem?.consumedQuantity ?? food.quantity;
          consumed += Math.round(food.calories * (consumedQty / food.quantity));
        }
      });
      entry?.extraItems.forEach((item) => {
        consumed += item.consumedCalories ?? 0;
      });
    });
    return { planned, consumed };
  }, [mealPlanDay, mealLogs]);

  const mealsCompleted = useMemo(() => {
    if (!mealPlanDay) return 0;
    return mealPlanDay.meals.filter((meal) => mealLogs[meal.id]?.status === "EATEN").length;
  }, [mealPlanDay, mealLogs]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <SectionHeader
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
      />

      {status && <p className="text-sm text-slate-300">{status}</p>}

        <Card title={t.todayTitle} description={t.todayDesc}>
        <div className="grid gap-4">
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-label={t.dateLabel}
            />
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                if (!mealPlanDay) return;
                for (const meal of mealPlanDay.meals) {
                  await saveMealLog(meal);
                }
              }}
              disabled={!mealPlanDay}
            >
              {t.saveAll}
            </Button>
          </div>
            {planStatus && <p className="text-sm text-slate-400">{planStatus}</p>}
            {!planStatus && !mealPlanDay && (
              <p className="text-sm text-slate-400">{t.noPlan}</p>
            )}
            {mealPlanDay && (
              <div className="grid gap-4">
                {summary && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <StatCard label={t.streak} value={summary.streak} helper={t.momentum} />
                    <StatCard label={t.daysLogged} value={summary.daysLogged} />
                    <StatCard label={t.compliance} value={`${summary.complianceRate}%`} />
                  </div>
                )}
                <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{t.mealChecklist}</p>
                    <p className="text-base font-semibold text-white">{mealPlanDay.title}</p>
                  </div>
                  <div className="flex flex-col gap-1 md:items-end">
                    <span>
                      {t.plannedLabel} {dayTotals.planned} kcal • {t.eatenLabel} {dayTotals.consumed} kcal
                    </span>
                    <span className="text-xs text-slate-500">
                      {Math.min(100, Math.round((dayTotals.consumed / Math.max(dayTotals.planned, 1)) * 100))}%
                      {" "}{t.complete}
                    </span>
                    <span className="text-xs text-slate-500">
                      {t.mealsCompleted}: {mealsCompleted}/{mealPlanDay.meals.length}
                    </span>
                  </div>
                </div>
                {mealPlanDay.meals.map((meal) => {
                  const entry = mealLogs[meal.id];
                  return (
                    <div key={meal.id} className="rounded-xl border border-white/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-white">{localizeMealName(meal.name)}</p>
                          {meal.timeLabel && (
                            <p className="text-xs text-slate-400">{meal.timeLabel}</p>
                          )}
                          <p className="mt-2 text-xs text-slate-500">{t.checkOnly}</p>
                        </div>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                          {t.mealsCompleted}: {entry?.items.filter((item) => (item.consumedQuantity ?? 0) > 0).length ?? 0}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {meal.foods.map((food) => {
                          const item = entry?.items.find((row) => row.mealPlanFoodId === food.id);
                          return (
                            <div
                              key={food.id}
                              className="grid gap-2 rounded-lg border border-white/10 p-3 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-slate-200">
                                  {item?.name ?? food.name}
                                  {item?.name && item.name !== food.name && (
                                    <span className="ml-2 text-[10px] text-slate-500">
                                      Planned: {food.name}
                                    </span>
                                  )}
                                </span>
                                <span className="text-slate-400">
                                  {food.calories} kcal • P{food.protein} C{food.carbs} F{food.fats}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <label className="flex items-center gap-2 text-[11px] text-slate-400">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-white/10 bg-white/5"
                                    checked={(item?.consumedQuantity ?? food.quantity) > 0}
                                    onChange={(event) =>
                                      setMealLogs((prev) => ({
                                        ...prev,
                                        [meal.id]: {
                                          ...prev[meal.id],
                                          items: prev[meal.id].items.map((row) =>
                                            row.mealPlanFoodId === food.id
                                              ? {
                                                  ...row,
                                                  consumedQuantity: event.target.checked
                                                    ? row.consumedQuantity && row.consumedQuantity > 0
                                                      ? row.consumedQuantity
                                                      : row.plannedQuantity ?? food.quantity
                                                    : 0,
                                                }
                                              : row
                                          ),
                                        },
                                      }))
                                    }
                                  />
                                  {t.done}
                                </label>
                                <span className="text-slate-500">
                                  {food.quantity} {food.unit}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleLoadAlternatives(food)}
                                  disabled={loadingAlternativeFoodId === food.id}
                                >
                                  {loadingAlternativeFoodId === food.id ? t.loadingAlternatives : t.swapFood}
                                </Button>
                                {openAlternativeFoodId === food.id && (
                                  <span className="text-[11px] text-slate-400">{t.alternatives}</span>
                                )}
                              </div>
                              {openAlternativeFoodId === food.id && (
                                <div className="grid gap-2 md:grid-cols-2">
                                  {(alternativesByFood[food.id] ?? []).map((alternative) => (
                                    <button
                                      key={`${food.id}-${alternative.name}`}
                                      type="button"
                                      className="rounded-lg border border-white/10 px-3 py-2 text-left text-[11px] text-slate-300 transition hover:border-cyan-400/40 hover:bg-white/5"
                                      onClick={() => applyAlternative(meal.id, food.id, alternative)}
                                    >
                                      <span className="text-xs text-white">{alternative.name}</span>
                                      <span className="mt-1 block text-[11px] text-slate-400">
                                        {alternative.calories ?? 0} kcal • P{alternative.protein ?? 0} C{alternative.carbs ?? 0} F{alternative.fats ?? 0}
                                      </span>
                                    </button>
                                  ))}
                                  {loadingAlternativeFoodId !== food.id &&
                                    (alternativesByFood[food.id]?.length ?? 0) === 0 && (
                                      <p className="text-[11px] text-slate-400">{t.noAlternatives}</p>
                                    )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <Button type="button" variant="outline" onClick={() => saveMealLog(meal)}>
                          {t.saveMeal}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </Card>

      <Card title={t.changePassword}>
        <form className="grid gap-3" onSubmit={handleChangePassword}>
          <input
            className="input"
            type="password"
            placeholder={t.currentPassword}
            value={passwordForm.current}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, current: event.target.value }))}
            required
          />
          <input
            className="input"
            type="password"
            placeholder={t.newPassword}
            value={passwordForm.next}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, next: event.target.value }))}
            required
          />
          {passwordStatus && <p className="text-xs text-slate-400">{passwordStatus}</p>}
          <Button type="submit" disabled={passwordSaving}>
            {t.updatePassword}
          </Button>
        </form>
      </Card>

      <Card title={t.coachNotes} description="Feedback on meals and progress photos.">
          <div className="grid gap-3 text-sm text-slate-200">
            {notesStatus && <p className="text-slate-400">{notesStatus}</p>}
            {!notesStatus && notes.length === 0 && <p className="text-slate-400">{t.noNotes}</p>}
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-slate-800 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">{note.type}</p>
                <p className="text-slate-100">{note.note}</p>
                <p className="text-xs text-slate-500">{new Date(note.date).toLocaleString()}</p>
              </div>
            ))}
            <Button variant="outline" type="button" onClick={loadCoachNotes}>
              {t.refreshNotes}
            </Button>
          </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
          <Card title={t.waterLog}>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                submitLog("/api/water-logs", {
                  date: new Date(date).toISOString(),
                  amountMl: Number(form.get("amountMl")),
                });
                event.currentTarget.reset();
              }}
            >
              <input className="input" name="amountMl" placeholder={t.waterPlaceholder} type="number" required />
              <Button type="submit">{t.logWater}</Button>
            </form>
          </Card>

          <Card title={t.weightLog}>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                submitLog("/api/weight-logs", {
                  date: new Date(date).toISOString(),
                  weightKg: Number(form.get("weightKg")),
                  bodyFatPct: form.get("bodyFatPct") ? Number(form.get("bodyFatPct")) : undefined,
                });
                event.currentTarget.reset();
              }}
            >
              <input className="input" name="weightKg" placeholder={t.weightPlaceholder} type="number" required />
              <input className="input" name="bodyFatPct" placeholder={t.bodyFatPlaceholder} type="number" />
              <Button type="submit">{t.logWeight}</Button>
            </form>
          </Card>

          <Card title={t.workoutLog}>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                submitLog("/api/workout-logs", {
                  date: new Date(date).toISOString(),
                  title: form.get("title"),
                  details: { notes: form.get("details") },
                });
                event.currentTarget.reset();
              }}
            >
              <input className="input" name="title" placeholder={t.workoutTitlePlaceholder} required />
              <textarea className="input" name="details" placeholder={t.workoutDetailsPlaceholder} rows={3} />
              <Button type="submit">{t.logWorkout}</Button>
            </form>
          </Card>

          <Card title={t.photoLog}>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                submitLog("/api/photo-logs", {
                  date: new Date(date).toISOString(),
                  imageUrl: form.get("imageUrl"),
                  notes: form.get("notes"),
                });
                event.currentTarget.reset();
              }}
            >
              <input className="input" name="imageUrl" placeholder={t.imageUrlPlaceholder} required />
              <textarea className="input" name="notes" placeholder={t.notesPlaceholder} rows={3} />
              <Button type="submit">{t.logPhoto}</Button>
            </form>
          </Card>
      </div>
    </div>
  );
}
