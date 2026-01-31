"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useLanguage } from "@/lib/language";

type ClientSummary = {
  id: string;
  name: string;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  user?: { email: string };
};

async function fetchClients() {
  const res = await fetch("/api/clients", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load clients");
  return res.json();
}

async function createClient(payload: Record<string, unknown>) {
  const res = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to create client");
  }
  return res.json();
}

async function fetchPlanLogs(clientId: string, date: string) {
  const res = await fetch(`/api/meal-plan-logs?clientId=${clientId}&date=${date}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load meal plan logs");
  return res.json();
}

async function updateClientPassword(clientId: string, password: string) {
  const res = await fetch(`/api/clients/${clientId}/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to update password");
  }
  return res.json();
}

async function fetchClientLogs(clientId: string) {
  const [mealsRes, photosRes] = await Promise.all([
    fetch(`/api/meal-logs?clientId=${clientId}`, { cache: "no-store" }),
    fetch(`/api/photo-logs?clientId=${clientId}`, { cache: "no-store" }),
  ]);

  if (!mealsRes.ok || !photosRes.ok) {
    throw new Error("Failed to load logs");
  }

  const meals = await mealsRes.json();
  const photos = await photosRes.json();
  return { meals: meals.meals ?? [], photoLogs: photos.photoLogs ?? [] };
}

async function updateLogNote(payload: {
  type: "meal" | "photo";
  id: string;
  coachNote: string;
}) {
  const endpoint = payload.type === "meal" ? "meal-logs" : "photo-logs";
  const res = await fetch(`/api/${endpoint}/${payload.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coachNote: payload.coachNote }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to save note");
  }
  return res.json();
}

async function fetchWeeklySummaries() {
  const res = await fetch("/api/clients/weekly", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load weekly summaries");
  return res.json();
}

export default function CoachClientsPage() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["clients"], queryFn: fetchClients });
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    goals: "",
    caloriesTarget: "",
    proteinTarget: "",
    carbsTarget: "",
    fatsTarget: "",
    waterTargetMl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [passwordDraft, setPasswordDraft] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));

  const t = useMemo(
    () =>
      language === "ar"
        ? {
            eyebrow: "مساحة المدرب",
            title: "العملاء",
            subtitle: "أنشئ وأدر حسابات العملاء مع أهداف الماكروز.",
            addClient: "إضافة عميل",
            fullName: "الاسم الكامل",
            email: "البريد الإلكتروني",
            tempPassword: "كلمة مرور مؤقتة",
            goals: "الأهداف (اختياري)",
            calories: "السعرات",
            protein: "البروتين",
            carbs: "الكربوهيدرات",
            fats: "الدهون",
            water: "الماء (مل)",
            saving: "جارٍ الحفظ...",
            createClient: "إنشاء عميل",
            credentials: "بيانات العميل",
            credentialsDesc: "شارك بيانات الدخول مباشرة مع العميل.",
            setTempPassword: "تعيين كلمة مرور مؤقتة",
            enterNewPassword: "أدخل كلمة مرور جديدة",
            updatePassword: "تحديث كلمة المرور",
            selectClient: "اختر عميل",
            notes: "ملاحظات المدرب",
            notesDesc: "اختر عميلاً واترك ملاحظات على وجباته وصوره.",
            loadingLogs: "جارٍ تحميل السجلات...",
            logsError: "تعذر تحميل السجلات.",
            meal: "وجبة",
            photo: "صورة",
            leaveNote: "اكتب ملاحظة...",
            saveNote: "حفظ الملاحظة",
            planCompliance: "الالتزام بخطة الوجبات",
            planComplianceDesc: "المخطط مقابل المأكول لهذا العميل.",
            loadingPlanLogs: "جارٍ تحميل سجلات الخطة...",
            planLogsError: "تعذر تحميل سجلات الخطة.",
            noPlanAssigned: "لا توجد خطة وجبات مفعلة.",
            planned: "المخطط",
            eaten: "تم تناوله",
            selectClientLabel: "اختر عميل",
            dateLabel: "التاريخ",
            passwordUpdated: "تم تحديث كلمة المرور.",
            weeklyTitle: "ملخص أسبوعي",
            weeklyDesc: "ملخص أداء آخر 7 أيام.",
            weeklyMeals: "وجبات",
            weeklyAvgCalories: "متوسط السعرات",
            weeklyCompliance: "الالتزام",
            totalClients: "إجمالي العملاء",
            avgWeeklyCompliance: "متوسط الالتزام الأسبوعي",
          }
        : {
            eyebrow: "Coach workspace",
            title: "Clients",
            subtitle: "Create and manage client accounts with macro targets.",
            addClient: "Add client",
            fullName: "Full name",
            email: "Email",
            tempPassword: "Temporary password",
            goals: "Goals (optional)",
            calories: "Calories",
            protein: "Protein",
            carbs: "Carbs",
            fats: "Fats",
            water: "Water ml",
            saving: "Saving...",
            createClient: "Create client",
            credentials: "Client credentials",
            credentialsDesc: "Share login details directly with the client.",
            setTempPassword: "Set temporary password",
            enterNewPassword: "Enter new password",
            updatePassword: "Update password",
            selectClient: "Select a client",
            notes: "Coach notes",
            notesDesc: "Select a client and leave feedback on their meal and photo logs.",
            loadingLogs: "Loading logs...",
            logsError: "Unable to load logs.",
            meal: "Meal",
            photo: "Photo",
            leaveNote: "Leave a note...",
            saveNote: "Save note",
            planCompliance: "Meal plan compliance",
            planComplianceDesc: "Daily planned vs eaten for this client.",
            loadingPlanLogs: "Loading plan logs...",
            planLogsError: "Unable to load plan logs.",
            noPlanAssigned: "No active meal plan assigned.",
            planned: "Planned",
            eaten: "Eaten",
            selectClientLabel: "Assign to client",
            dateLabel: "Date",
            passwordUpdated: "Password updated.",
            weeklyTitle: "Weekly recap",
            weeklyDesc: "Last 7 days performance summary.",
            weeklyMeals: "Meals",
            weeklyAvgCalories: "Avg calories",
            weeklyCompliance: "Compliance",
            totalClients: "Total clients",
            avgWeeklyCompliance: "Avg weekly compliance",
          },
    [language]
  );

  useEffect(() => {
    if (!selectedClientId && data?.clients?.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedClientId(data.clients[0].id);
    }
  }, [data, selectedClientId]);

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setForm({
        email: "",
        password: "",
        name: "",
        goals: "",
        caloriesTarget: "",
        proteinTarget: "",
        carbsTarget: "",
        fatsTarget: "",
        waterTargetMl: "",
      });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const logsQuery = useQuery({
    queryKey: ["clientLogs", selectedClientId],
    queryFn: () => fetchClientLogs(selectedClientId),
    enabled: Boolean(selectedClientId),
  });

  const weeklyQuery = useQuery({
    queryKey: ["weeklySummaries"],
    queryFn: fetchWeeklySummaries,
  });

  const totalClients = data?.clients?.length ?? 0;
  const weeklyComplianceAvg = weeklyQuery.data?.clients?.length
    ? Math.round(
        weeklyQuery.data.clients.reduce(
          (sum: number, client: { complianceRate: number }) => sum + client.complianceRate,
          0
        ) / weeklyQuery.data.clients.length
      )
    : 0;

  const planLogsQuery = useQuery({
    queryKey: ["planLogs", selectedClientId, logDate],
    queryFn: () => fetchPlanLogs(selectedClientId, logDate),
    enabled: Boolean(selectedClientId),
  });

  const noteMutation = useMutation({
    mutationFn: updateLogNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientLogs", selectedClientId] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ clientId, password }: { clientId: string; password: string }) =>
      updateClientPassword(clientId, password),
    onSuccess: () => {
      setPasswordStatus(t.passwordUpdated);
      setPasswordDraft("");
    },
    onError: (err: Error) => setPasswordStatus(err.message),
  });

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDraft(key: string, value: string) {
    setNoteDrafts((prev) => ({ ...prev, [key]: value }));
  }

  const selectedClient = data?.clients?.find((client: ClientSummary) => client.id === selectedClientId);

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          subtitle={t.subtitle}
        />

        <section className="grid gap-4 md:grid-cols-2">
          <StatCard label={t.totalClients} value={totalClients} />
          <StatCard label={t.avgWeeklyCompliance} value={`${weeklyComplianceAvg}%`} />
        </section>

        <Card title={t.addClient}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate({
                email: form.email,
                password: form.password,
                name: form.name,
                goals: form.goals || undefined,
                caloriesTarget: Number(form.caloriesTarget),
                proteinTarget: Number(form.proteinTarget),
                carbsTarget: Number(form.carbsTarget),
                fatsTarget: Number(form.fatsTarget),
                waterTargetMl: Number(form.waterTargetMl),
              });
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.fullName}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                placeholder={t.email}
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </div>
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              placeholder={t.tempPassword}
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
            />
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              placeholder={t.goals}
              value={form.goals}
              onChange={(e) => updateField("goals", e.target.value)}
            />
            <div className="grid gap-4 md:grid-cols-5">
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder={t.calories}
                type="number"
                value={form.caloriesTarget}
                onChange={(e) => updateField("caloriesTarget", e.target.value)}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder={t.protein}
                type="number"
                value={form.proteinTarget}
                onChange={(e) => updateField("proteinTarget", e.target.value)}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder={t.carbs}
                type="number"
                value={form.carbsTarget}
                onChange={(e) => updateField("carbsTarget", e.target.value)}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder={t.fats}
                type="number"
                value={form.fatsTarget}
                onChange={(e) => updateField("fatsTarget", e.target.value)}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder={t.water}
                type="number"
                value={form.waterTargetMl}
                onChange={(e) => updateField("waterTargetMl", e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t.saving : t.createClient}
            </Button>
          </form>
        </Card>

        <section className="grid gap-4">
          {data?.clients?.map((client: ClientSummary) => (
            <Card key={client.id} title={client.name} description={client.user?.email}>
              <div className="text-xs text-slate-400">
                {client.caloriesTarget} kcal • P{client.proteinTarget} / C{client.carbsTarget} / F{client.fatsTarget}
              </div>
            </Card>
          ))}
        </section>

        <Card title={t.credentials} description={t.credentialsDesc}>
          <div className="grid gap-3 text-sm text-slate-200">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">{t.email}</p>
              <p>{selectedClient?.user?.email ?? t.selectClient}</p>
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">{t.setTempPassword}</label>
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                type="password"
                value={passwordDraft}
                onChange={(event) => setPasswordDraft(event.target.value)}
                placeholder={t.enterNewPassword}
                minLength={8}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!selectedClientId || passwordMutation.isPending}
                onClick={() => {
                  if (!selectedClientId || !passwordDraft) return;
                  setPasswordStatus(null);
                  passwordMutation.mutate({ clientId: selectedClientId, password: passwordDraft });
                }}
              >
                {t.updatePassword}
              </Button>
              {passwordStatus && <p className="text-xs text-slate-400">{passwordStatus}</p>}
            </div>
          </div>
        </Card>

        <Card title={t.notes} description={t.notesDesc}>
          <div className="grid gap-4">
            <select
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
            >
              {data?.clients?.map((client: ClientSummary) => (
                <option key={client.id} value={client.id} className="text-slate-900">
                  {client.name}
                </option>
              ))}
            </select>

            {logsQuery.isLoading && <p className="text-sm text-slate-400">{t.loadingLogs}</p>}
            {logsQuery.error && <p className="text-sm text-red-400">{t.logsError}</p>}

            {!logsQuery.isLoading && logsQuery.data && (
              <div className="grid gap-4 md:grid-cols-2">
                {logsQuery.data.meals.slice(0, 6).map((meal: {
                  id: string;
                  date: string;
                  name: string;
                  consumedCaloriesTotal?: number | null;
                  coachNote?: string | null;
                }) => {
                  const key = `meal:${meal.id}`;
                  return (
                    <div key={meal.id} className="rounded-xl border border-white/10 p-4">
                      <p className="text-xs text-slate-400">
                        {t.meal} • {new Date(meal.date).toLocaleString()}
                      </p>
                      <p className="text-sm text-white">
                        {meal.name} ({meal.consumedCaloriesTotal ?? 0} kcal)
                      </p>
                      <textarea
                        className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        rows={3}
                        placeholder={t.leaveNote}
                        value={noteDrafts[key] ?? meal.coachNote ?? ""}
                        onChange={(event) => updateDraft(key, event.target.value)}
                      />
                      <Button
                        className="mt-3"
                        type="button"
                        variant="outline"
                        disabled={noteMutation.isPending}
                        onClick={() =>
                          noteMutation.mutate({
                            type: "meal",
                            id: meal.id,
                            coachNote: noteDrafts[key] ?? meal.coachNote ?? "",
                          })
                        }
                      >
                        {t.saveNote}
                      </Button>
                    </div>
                  );
                })}

                {logsQuery.data.photoLogs.slice(0, 6).map((log: {
                  id: string;
                  date: string;
                  imageUrl: string;
                  coachNote?: string | null;
                }) => {
                  const key = `photo:${log.id}`;
                  return (
                    <div key={log.id} className="rounded-xl border border-white/10 p-4">
                      <p className="text-xs text-slate-400">
                        {t.photo} • {new Date(log.date).toLocaleString()}
                      </p>
                      <p className="text-sm text-white break-all">{log.imageUrl}</p>
                      <textarea
                        className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        rows={3}
                        placeholder={t.leaveNote}
                        value={noteDrafts[key] ?? log.coachNote ?? ""}
                        onChange={(event) => updateDraft(key, event.target.value)}
                      />
                      <Button
                        className="mt-3"
                        type="button"
                        variant="outline"
                        disabled={noteMutation.isPending}
                        onClick={() =>
                          noteMutation.mutate({
                            type: "photo",
                            id: log.id,
                            coachNote: noteDrafts[key] ?? log.coachNote ?? "",
                          })
                        }
                      >
                        {t.saveNote}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card title={t.planCompliance} description={t.planComplianceDesc}>
          <div className="grid gap-4">
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              type="date"
              value={logDate}
              onChange={(event) => setLogDate(event.target.value)}
              aria-label={t.dateLabel}
            />

            {planLogsQuery.isLoading && <p className="text-sm text-slate-400">{t.loadingPlanLogs}</p>}
            {planLogsQuery.error && <p className="text-sm text-red-400">{t.planLogsError}</p>}
            {!planLogsQuery.isLoading && planLogsQuery.data?.assignment === null && (
              <p className="text-sm text-slate-400">{t.noPlanAssigned}</p>
            )}

            {planLogsQuery.data?.day && (
              <div className="grid gap-3 text-sm text-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {planLogsQuery.data.day.title}
                </p>
                {planLogsQuery.data.day.meals.map((meal: {
                  id: string;
                  name: string;
                }) => {
                  const log = planLogsQuery.data.logs.find((entry: { mealPlanMealId?: string }) => entry.mealPlanMealId === meal.id);
                  return (
                    <div key={meal.id} className="rounded-xl border border-white/10 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white">{meal.name}</p>
                        <span className="text-xs text-slate-400">
                          {log?.complianceStatus ?? "UNKNOWN"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {t.planned}: {log?.plannedCaloriesTotal ?? 0} kcal • {t.eaten}: {log?.consumedCaloriesTotal ?? 0} kcal
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card title={t.weeklyTitle} description={t.weeklyDesc}>
          <div className="grid gap-3 text-sm text-slate-200">
            {weeklyQuery.isLoading && <p className="text-slate-400">{t.loadingLogs}</p>}
            {weeklyQuery.data?.clients?.map((client: {
              id: string;
              name: string;
              email: string;
              mealCount: number;
              averageCalories: number;
              complianceRate: number;
            }) => (
              <div key={client.id} className="rounded-xl border border-white/10 p-3">
                <p className="text-sm text-white">{client.name}</p>
                <p className="text-xs text-slate-400">{client.email}</p>
                <div className="mt-2 grid gap-2 text-xs text-slate-400 md:grid-cols-3">
                  <span>{t.weeklyMeals}: {client.mealCount}</span>
                  <span>{t.weeklyAvgCalories}: {client.averageCalories} kcal</span>
                  <span>{t.weeklyCompliance}: {client.complianceRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
