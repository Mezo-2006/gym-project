"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
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
  waterTargetMl: number;
  user?: { email: string };
};

async function fetchClients() {
  const res = await fetch("/api/clients", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load clients");
  return res.json();
}

async function fetchMe() {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

async function fetchClientSummaries() {
  const res = await fetch("/api/clients/summary", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load client summaries");
  return res.json();
}

async function fetchAlerts() {
  const res = await fetch("/api/clients/alerts", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load alerts");
  return res.json();
}

export default function CoachDashboard() {
  const { language } = useLanguage();
  const { data, isLoading, error } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });
  const summaryQuery = useQuery({
    queryKey: ["clientSummaries"],
    queryFn: fetchClientSummaries,
  });
  const alertsQuery = useQuery({
    queryKey: ["clientAlerts"],
    queryFn: fetchAlerts,
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "" });
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const totalClients = data?.clients?.length ?? 0;
  const complianceAverage = summaryQuery.data?.clients?.length
    ? Math.round(
        summaryQuery.data.clients.reduce(
          (sum: number, client: { complianceRate: number }) => sum + client.complianceRate,
          0
        ) / summaryQuery.data.clients.length
      )
    : 0;
  const alertCount = alertsQuery.data?.missed?.length ?? 0;

  const t = useMemo(
    () =>
      language === "ar"
        ? {
            eyebrow: "لوحة المدرب",
            title: "التزام العملاء",
            mealPlans: "خطط الوجبات",
            addClient: "إضافة عميل",
            coachId: "معرّف المدرب",
            coachIdDesc: "شارك هذا المعرف مع العملاء للتسجيل الذاتي.",
            loading: "جارٍ التحميل...",
            unavailable: "غير متاح",
            loadingClients: "جارٍ تحميل العملاء...",
            clientsError: "تعذر تحميل العملاء.",
            noClients: "لا يوجد عملاء بعد.",
            dailyCalories: "السعرات اليومية",
            protein: "بروتين",
            carbs: "كربوهيدرات",
            fats: "دهون",
            water: "ماء",
            snapshotTitle: "نظرة سريعة على العملاء",
            snapshotDesc: "التسجيل الأسبوعي والالتزام بشكل سريع.",
            loadingSummary: "جارٍ تحميل الملخص...",
            daysLogged: "أيام مسجلة",
            compliance: "الالتزام",
            streak: "سلسلة",
            alertsTitle: "تنبيهات اليوم",
            alertsDesc: "عملاء لم يسجلوا وجبات اليوم.",
            noAlerts: "لا توجد تنبيهات اليوم.",
            totalClients: "إجمالي العملاء",
            avgCompliance: "متوسط الالتزام",
            alertsCount: "التنبيهات",
            changePassword: "تغيير كلمة المرور",
            currentPassword: "كلمة المرور الحالية",
            newPassword: "كلمة المرور الجديدة",
            updatePassword: "تحديث كلمة المرور",
            passwordUpdated: "تم تحديث كلمة المرور.",
          }
        : {
            eyebrow: "Coach dashboard",
            title: "Client compliance",
            mealPlans: "Meal plans",
            addClient: "Add client",
            coachId: "Coach ID",
            coachIdDesc: "Share this with clients for self-registration.",
            loading: "Loading...",
            unavailable: "Unavailable",
            loadingClients: "Loading clients...",
            clientsError: "Unable to load clients.",
            noClients: "No clients yet.",
            dailyCalories: "Daily calories",
            protein: "Protein",
            carbs: "Carbs",
            fats: "Fats",
            water: "Water",
            snapshotTitle: "Client snapshot",
            snapshotDesc: "Weekly logging and compliance at a glance.",
            loadingSummary: "Loading summary...",
            daysLogged: "Days logged",
            compliance: "Compliance",
            streak: "Streak",
            alertsTitle: "Today’s alerts",
            alertsDesc: "Clients missing today’s meal logs.",
            noAlerts: "No alerts for today.",
            totalClients: "Total clients",
            avgCompliance: "Avg compliance",
            alertsCount: "Alerts",
            changePassword: "Change password",
            currentPassword: "Current password",
            newPassword: "New password",
            updatePassword: "Update password",
            passwordUpdated: "Password updated.",
          },
    [language]
  );

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

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <SectionHeader eyebrow={t.eyebrow} title={t.title} />
          <div className="flex flex-wrap gap-3">
            <Link href="/coach/meal-plans">
              <Button variant="outline">{t.mealPlans}</Button>
            </Link>
            <Link href="/coach/clients">
              <Button>{t.addClient}</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label={t.totalClients} value={totalClients} />
          <StatCard label={t.avgCompliance} value={`${complianceAverage}%`} />
          <StatCard label={t.alertsCount} value={alertCount} />
        </section>

        <section className="grid gap-4">
          <Card
            title={t.coachId}
            description={t.coachIdDesc}
          >
            <div className="text-sm text-slate-200">
              {meQuery.isLoading && t.loading}
              {meQuery.error && t.unavailable}
              {meQuery.data?.user?.id}
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
          {isLoading && <p className="text-sm text-slate-400">{t.loadingClients}</p>}
          {error && <p className="text-sm text-red-400">{t.clientsError}</p>}
          {data?.clients?.length === 0 && <p className="text-sm text-slate-400">{t.noClients}</p>}
          {data?.clients?.map((client: ClientSummary) => (
            <Card
              key={client.id}
              title={client.name}
              description={client.user?.email}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-slate-400">{t.dailyCalories}</div>
                <div className="text-lg font-semibold">{client.caloriesTarget}</div>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-slate-400 md:grid-cols-4">
                <span>{t.protein}: {client.proteinTarget}g</span>
                <span>{t.carbs}: {client.carbsTarget}g</span>
                <span>{t.fats}: {client.fatsTarget}g</span>
                <span>{t.water}: {client.waterTargetMl}ml</span>
              </div>
            </Card>
          ))}
        </section>

        <Card title={t.snapshotTitle} description={t.snapshotDesc}>
          <div className="grid gap-3 text-sm text-slate-200">
            {summaryQuery.isLoading && <p className="text-slate-400">{t.loadingSummary}</p>}
            {!summaryQuery.isLoading &&
              summaryQuery.data?.clients?.map((client: {
                id: string;
                name: string;
                email: string;
                daysLogged: number;
                complianceRate: number;
                streak: number;
              }) => (
                <div key={client.id} className="rounded-xl border border-white/10 p-3">
                  <p className="text-sm text-white">{client.name}</p>
                  <p className="text-xs text-slate-400">{client.email}</p>
                  <div className="mt-2 grid gap-2 text-xs text-slate-400 md:grid-cols-3">
                    <span>{t.daysLogged ?? "Days logged"}: {client.daysLogged}</span>
                    <span>{t.compliance ?? "Compliance"}: {client.complianceRate}%</span>
                    <span>{t.streak ?? "Streak"}: {client.streak}</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <Card title={t.alertsTitle} description={t.alertsDesc}>
          <div className="grid gap-3 text-sm text-slate-200">
            {alertsQuery.isLoading && <p className="text-slate-400">{t.loadingSummary}</p>}
            {!alertsQuery.isLoading && alertsQuery.data?.missed?.length === 0 && (
              <p className="text-slate-400">{t.noAlerts}</p>
            )}
            {alertsQuery.data?.missed?.map((client: { id: string; name: string; email: string }) => (
              <div key={client.id} className="rounded-xl border border-white/10 p-3">
                <p className="text-sm text-white">{client.name}</p>
                <p className="text-xs text-slate-400">{client.email}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
