"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useLanguage } from "@/lib/language";

async function fetchMeals() {
  const res = await fetch("/api/meal-logs", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load meals");
  return res.json();
}

async function fetchWater() {
  const res = await fetch("/api/water-logs", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load water");
  return res.json();
}

async function fetchWeekly() {
  const res = await fetch("/api/meal-logs/weekly", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load weekly summary");
  return res.json();
}

export default function ClientDashboard() {
  const { language } = useLanguage();
  const mealsQuery = useQuery({ queryKey: ["meals"], queryFn: fetchMeals });
  const waterQuery = useQuery({ queryKey: ["water"], queryFn: fetchWater });
  const weeklyQuery = useQuery({ queryKey: ["weekly"], queryFn: fetchWeekly });
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const t = useMemo(
    () =>
      language === "ar"
        ? {
            eyebrow: "لوحة العميل",
            title: "أهداف اليوم",
            mealLogs: "سجل الوجبات",
            waterIntake: "شرب الماء",
            loadingMeals: "جارٍ تحميل سجل الوجبات...",
            mealError: "تعذر تحميل سجل الوجبات.",
            noMeals: "لا توجد وجبات مسجلة بعد.",
            mealsCount: (count: number) => `تم تسجيل ${count} وجبات هذا الأسبوع.`,
            loadingWater: "جارٍ تحميل سجلات الماء...",
            waterError: "تعذر تحميل سجلات الماء.",
            noWater: "لا توجد سجلات ماء بعد.",
            waterCount: (count: number) => `تم تسجيل ${count} سجلات ماء.`,
            progressTitle: "متابعة التقدم",
            progressDesc: "سجّل الوجبات والماء والوزن والصور والتمارين لإبقاء المدرب على اطلاع.",
            goLogs: "اذهب إلى السجلات اليومية",
            onboardingTitle: "أكمل الإعداد",
            onboardingDesc: "أكمل ملفك الشخصي لتخصيص خطتك.",
            onboardingCta: "ابدأ الإعداد",
            weeklyTitle: "ملخص الأسبوع",
            weeklyDesc: "نظرة سريعة على آخر 7 أيام.",
            mealsLogged: "وجبات مسجلة",
            avgCalories: "متوسط السعرات",
            weeklyCompliance: "الالتزام",
            waterLogged: "سجلات الماء",
          }
        : {
            eyebrow: "Client dashboard",
            title: "Today’s goals",
            mealLogs: "Meal logs",
            waterIntake: "Water intake",
            loadingMeals: "Loading meal logs...",
            mealError: "Unable to load meal logs.",
            noMeals: "No meals logged yet.",
            mealsCount: (count: number) => `${count} meals logged this week.`,
            loadingWater: "Loading water logs...",
            waterError: "Unable to load water logs.",
            noWater: "No water logs yet.",
            waterCount: (count: number) => `${count} water logs recorded.`,
            progressTitle: "Progress check-ins",
            progressDesc: "Log your meals, water, weight, photos, and workouts to keep your coach in sync.",
            goLogs: "Go to daily logs",
            onboardingTitle: "Finish setup",
            onboardingDesc: "Complete your profile to personalize your plan.",
            onboardingCta: "Start onboarding",
            weeklyTitle: "Weekly recap",
            weeklyDesc: "Your last 7 days at a glance.",
            mealsLogged: "Meals logged",
            avgCalories: "Avg calories",
            weeklyCompliance: "Compliance",
            waterLogged: "Water logs",
          },
    [language]
  );

  useEffect(() => {
    const stored = window.localStorage.getItem("fitflow-onboarding-complete");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNeedsOnboarding(stored !== "true");
  }, []);

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label={t.mealsLogged}
            value={weeklyQuery.data?.mealCount ?? 0}
            helper={t.weeklyDesc}
          />
          <StatCard
            label={t.avgCalories}
            value={`${weeklyQuery.data?.averageCalories ?? 0} kcal`}
            helper={t.weeklyDesc}
          />
          <StatCard
            label={t.weeklyCompliance}
            value={`${weeklyQuery.data?.complianceRate ?? 0}%`}
            helper={t.weeklyDesc}
          />
        </section>

        {needsOnboarding && (
          <Card title={t.onboardingTitle} description={t.onboardingDesc}>
            <Link href="/client/onboarding">
              <Button className="mt-4" variant="outline">
                {t.onboardingCta}
              </Button>
            </Link>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <Card title={t.mealLogs}>
            <p className="text-sm text-slate-300">
              {mealsQuery.isLoading && t.loadingMeals}
              {mealsQuery.error && t.mealError}
              {mealsQuery.data?.meals?.length === 0 && t.noMeals}
              {mealsQuery.data?.meals?.length > 0 &&
                t.mealsCount(mealsQuery.data.meals.length)}
            </p>
          </Card>
          <Card title={t.waterIntake}>
            <p className="text-sm text-slate-300">
              {waterQuery.isLoading && t.loadingWater}
              {waterQuery.error && t.waterError}
              {waterQuery.data?.waterLogs?.length === 0 && t.noWater}
              {waterQuery.data?.waterLogs?.length > 0 &&
                t.waterCount(waterQuery.data.waterLogs.length)}
            </p>
          </Card>
        </section>


        <Card
          title={t.progressTitle}
          description={t.progressDesc}
        >
          <Link href="/client/logs">
            <Button className="mt-4" variant="outline">
              {t.goLogs}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
