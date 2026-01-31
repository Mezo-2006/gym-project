"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/lib/language";

export default function ClientOnboardingPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    goals: "",
    caloriesTarget: "",
    proteinTarget: "",
    carbsTarget: "",
    fatsTarget: "",
    waterTargetMl: "",
  });

  const t = useMemo(
    () =>
      language === "ar"
        ? {
            eyebrow: "الإعداد",
            title: "ابدأ إعداد حسابك",
            subtitle: "أكمل بياناتك لتخصيص خطتك الغذائية.",
            step: (value: number) => `الخطوة ${value} من 2`,
            profileTitle: "معلوماتك الأساسية",
            goalsTitle: "أهدافك الغذائية",
            name: "الاسم الكامل",
            goals: "أهدافك",
            calories: "السعرات",
            protein: "البروتين",
            carbs: "الكربوهيدرات",
            fats: "الدهون",
            water: "الماء (مل)",
            next: "التالي",
            back: "رجوع",
            finish: "إنهاء الإعداد",
            saving: "جارٍ الحفظ...",
            saved: "تم الحفظ.",
            saveError: "تعذر الحفظ.",
          }
        : {
            eyebrow: "Onboarding",
            title: "Let’s set up your profile",
            subtitle: "Complete your details to personalize your plan.",
            step: (value: number) => `Step ${value} of 2`,
            profileTitle: "Basic information",
            goalsTitle: "Nutrition targets",
            name: "Full name",
            goals: "Goals",
            calories: "Calories",
            protein: "Protein",
            carbs: "Carbs",
            fats: "Fats",
            water: "Water (ml)",
            next: "Next",
            back: "Back",
            finish: "Finish setup",
            saving: "Saving...",
            saved: "Saved.",
            saveError: "Unable to save.",
          },
    [language]
  );

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.profile) return;
        setForm({
          name: data.profile.name ?? "",
          goals: data.profile.goals ?? "",
          caloriesTarget: data.profile.caloriesTarget?.toString() ?? "",
          proteinTarget: data.profile.proteinTarget?.toString() ?? "",
          carbsTarget: data.profile.carbsTarget?.toString() ?? "",
          fatsTarget: data.profile.fatsTarget?.toString() ?? "",
          waterTargetMl: data.profile.waterTargetMl?.toString() ?? "",
        });
      })
      .catch(() => null);
  }, []);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setStatus(null);
    const payload = {
      name: form.name,
      goals: form.goals,
      caloriesTarget: Number(form.caloriesTarget),
      proteinTarget: Number(form.proteinTarget),
      carbsTarget: Number(form.carbsTarget),
      fatsTarget: Number(form.fatsTarget),
      waterTargetMl: Number(form.waterTargetMl),
    };

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setStatus(t.saveError);
      setLoading(false);
      return;
    }

    setStatus(t.saved);
    window.localStorage.setItem("fitflow-onboarding-complete", "true");
    setLoading(false);
    router.push("/client/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <SectionHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      <Card title={t.step(step)}>
        {step === 1 && (
          <div className="grid gap-4">
            <p className="text-sm text-slate-300">{t.profileTitle}</p>
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              placeholder={t.name}
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              placeholder={t.goals}
              value={form.goals}
              onChange={(event) => updateField("goals", event.target.value)}
            />
            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep(2)}>
                {t.next}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <p className="text-sm text-slate-300">{t.goalsTitle}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.calories}
                type="number"
                value={form.caloriesTarget}
                onChange={(event) => updateField("caloriesTarget", event.target.value)}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.protein}
                type="number"
                value={form.proteinTarget}
                onChange={(event) => updateField("proteinTarget", event.target.value)}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.carbs}
                type="number"
                value={form.carbsTarget}
                onChange={(event) => updateField("carbsTarget", event.target.value)}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.fats}
                type="number"
                value={form.fatsTarget}
                onChange={(event) => updateField("fatsTarget", event.target.value)}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.water}
                type="number"
                value={form.waterTargetMl}
                onChange={(event) => updateField("waterTargetMl", event.target.value)}
                required
              />
            </div>
            {status && <p className="text-sm text-slate-400">{status}</p>}
            <div className="flex flex-wrap justify-between gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                {t.back}
              </Button>
              <Button type="button" onClick={handleSave} disabled={loading}>
                {loading ? t.saving : t.finish}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
