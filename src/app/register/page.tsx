"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/lib/language";

export default function RegisterPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [role, setRole] = useState<"COACH" | "CLIENT">("COACH");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    coachId: "",
    caloriesTarget: "",
    proteinTarget: "",
    carbsTarget: "",
    fatsTarget: "",
    waterTargetMl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = useMemo(
    () =>
      language === "ar"
        ? {
            eyebrow: "FitFlow Pro",
            title: "إنشاء حساب",
            subtitle: "أنشئ مساحة المدرب أو العميل.",
            coach: "مدرب",
            client: "عميل",
            fullName: "الاسم الكامل",
            email: "البريد الإلكتروني",
            password: "كلمة المرور",
            coachId: "معرّف المدرب",
            calories: "السعرات",
            protein: "البروتين",
            carbs: "الكربوهيدرات",
            fats: "الدهون",
            water: "الماء (مل)",
            create: "إنشاء حساب",
            creating: "جارٍ الإنشاء...",
            registrationFailed: "فشل التسجيل",
          }
        : {
            eyebrow: "FitFlow Pro",
            title: "Create account",
            subtitle: "Set up your coach or client workspace.",
            coach: "Coach",
            client: "Client",
            fullName: "Full name",
            email: "Email",
            password: "Password",
            coachId: "Coach ID",
            calories: "Calories",
            protein: "Protein",
            carbs: "Carbs",
            fats: "Fats",
            water: "Water (ml)",
            create: "Create account",
            creating: "Creating...",
            registrationFailed: "Registration failed",
          },
    [language]
  );

  async function parseJsonSafe(res: Response) {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = {
      email: form.email,
      password: form.password,
      role,
      name: form.name,
    };

    if (role === "CLIENT") {
      payload.coachId = form.coachId;
      payload.caloriesTarget = Number(form.caloriesTarget);
      payload.proteinTarget = Number(form.proteinTarget);
      payload.carbsTarget = Number(form.carbsTarget);
      payload.fatsTarget = Number(form.fatsTarget);
      payload.waterTargetMl = Number(form.waterTargetMl);
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await parseJsonSafe(res);
      setError(data?.error ?? t.registrationFailed);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push(role === "COACH" ? "/coach/dashboard" : "/client/dashboard");
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-24">
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          subtitle={t.subtitle}
        />

        <div className="flex gap-2">
          {(["COACH", "CLIENT"] as const).map((value) => (
            <button
              key={value}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                role === value
                  ? "bg-white text-slate-900 shadow-lg shadow-cyan-500/10"
                  : "border border-white/20 text-white/90 hover:border-white/40"
              }`}
              type="button"
              onClick={() => setRole(value)}
            >
              {value === "COACH" ? t.coach : t.client}
            </button>
          ))}
        </div>

        <form className="surface grid gap-4 p-8" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">{t.fullName}</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">{t.email}</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">{t.password}</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {role === "CLIENT" && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">{t.coachId}</label>
                <input
                  className="input"
                  value={form.coachId}
                  onChange={(e) => updateField("coachId", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">{t.calories}</label>
                  <input
                    className="input"
                    type="number"
                    value={form.caloriesTarget}
                    onChange={(e) => updateField("caloriesTarget", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">{t.protein}</label>
                  <input
                    className="input"
                    type="number"
                    value={form.proteinTarget}
                    onChange={(e) => updateField("proteinTarget", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">{t.carbs}</label>
                  <input
                    className="input"
                    type="number"
                    value={form.carbsTarget}
                    onChange={(e) => updateField("carbsTarget", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">{t.fats}</label>
                  <input
                    className="input"
                    type="number"
                    value={form.fatsTarget}
                    onChange={(e) => updateField("fatsTarget", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">{t.water}</label>
                  <input
                    className="input"
                    type="number"
                    value={form.waterTargetMl}
                    onChange={(e) => updateField("waterTargetMl", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? t.creating : t.create}
          </Button>
        </form>
      </div>
    </div>
  );
}
