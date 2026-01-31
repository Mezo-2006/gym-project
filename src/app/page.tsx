"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useLanguage } from "@/lib/language";

export default function Home() {
  const { language } = useLanguage();
  const t = useMemo(
    () =>
      language === "ar"
        ? {
            eyebrow: "FitFlow Pro",
            title: "منصة أداء بين المدرب والعميل للتغذية والتمرين والتقدم.",
            subtitle:
              "نظّم إدارة العملاء، التسجيل اليومي، والمتابعة في مساحة آمنة قابلة للتوسع.",
            heroNote: "موثوق به من المدربين الذين يريدون متابعة دقيقة وتجربة عملاء سلسة.",
            signIn: "تسجيل الدخول",
            createAccount: "إنشاء حساب",
            trustA: "بيانات منظمة",
            trustB: "إشعارات ذكية",
            trustC: "واجهة عربية كاملة",
            statsTitle: "ملخص الأسبوع",
            statClients: "عملاء نشطون",
            statCheckins: "متابعات هذا الأسبوع",
            statCompliance: "متوسط الالتزام",
            insightsTitle: "تحليلات فورية",
            insightsCopy: "لوحات متابعة توضح الاتجاهات والتنبيهات المهمة لكل عميل.",
            insightsLive: "تحديثات حية خلال اليوم",
            featuresEyebrow: "الإمكانات",
            featuresTitle: "كل شيء في مكان واحد للمدرب والعميل.",
            featuresSubtitle: "نظام واحد لإدارة الحسابات، المتابعة، وخطط التغذية بسهولة.",
            coachDashboard: "لوحة تحكم المدرب",
            coachDesc: "تابع الالتزام والمتابعة والرسائل لكل عميل من لوحة واحدة.",
            clientLogging: "تسجيل العميل اليومي",
            clientDesc: "سجّل الوجبات والماء والوزن والتمارين والصور بسهولة.",
            insights: "ذكاء التقدم",
            insightsDesc: "اعرض الاتجاهات والالتزام بالمغذيات برؤى قابلة للتنفيذ.",
            workflowEyebrow: "خطوات العمل",
            workflowTitle: "بسّط رحلة العميل منذ اليوم الأول.",
            workflowSteps: [
              "أنشئ حساب المدرب وحدد أهداف كل عميل.",
              "دع العميل يسجل يوميًا من الهاتف خلال دقائق.",
              "استلم تقارير أسبوعية تلقائية مع تنبيهات مبكرة.",
            ],
            securityEyebrow: "الأمان",
            securityTitle: "بيانات آمنة ومساحات مخصصة لكل فريق.",
            securityCopy: "الوصول محمي، والبيانات منظمة حسب الدور لضمان الخصوصية.",
            ctaTitle: "جاهز للانطلاق؟",
            ctaSubtitle: "ابدأ مجانًا واستمتع بتجربة احترافية من اليوم الأول.",
            ctaPrimary: "ابدأ الآن",
            ctaSecondary: "تعرف على الخطط",
          }
        : {
            eyebrow: "FitFlow Pro",
            title: "Coach–Client performance platform for nutrition, training, and progress.",
            subtitle:
              "Centralize client management, daily logging, and check-ins in one secure workspace designed for scale.",
            heroNote: "Trusted by coaches who want precise accountability and a seamless client experience.",
            signIn: "Sign in",
            createAccount: "Create account",
            trustA: "Structured data",
            trustB: "Smart nudges",
            trustC: "Bilingual UI",
            statsTitle: "Weekly snapshot",
            statClients: "Active clients",
            statCheckins: "Check-ins this week",
            statCompliance: "Average compliance",
            insightsTitle: "Live insights",
            insightsCopy: "Dashboards surface trends and key alerts for every client automatically.",
            insightsLive: "Live updates throughout the day",
            featuresEyebrow: "Capabilities",
            featuresTitle: "Everything you need in one place.",
            featuresSubtitle: "One system for accounts, check-ins, and nutrition planning at scale.",
            coachDashboard: "Coach dashboard",
            coachDesc: "Monitor compliance, check-ins, and messaging across every client from a single view.",
            clientLogging: "Client daily logging",
            clientDesc: "Track meals, water, weight, workouts, and photos with fast, mobile-first inputs.",
            insights: "Progress intelligence",
            insightsDesc: "Surface trends, streaks, and macro adherence with actionable insights.",
            workflowEyebrow: "Workflow",
            workflowTitle: "Streamline the client journey from day one.",
            workflowSteps: [
              "Create coach accounts and set client targets.",
              "Clients log daily from mobile in minutes.",
              "Receive automated weekly reports with early warnings.",
            ],
            securityEyebrow: "Security",
            securityTitle: "Secure data and role-based spaces.",
            securityCopy: "Access is protected and data is separated by role to keep privacy intact.",
            ctaTitle: "Ready to go pro?",
            ctaSubtitle: "Start free and deliver a premium experience from day one.",
            ctaPrimary: "Get started",
            ctaSecondary: "View plans",
          },
    [language]
  );

  return (
    <div className="min-h-screen text-white">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20">
        <section className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <SectionHeader
              eyebrow={t.eyebrow}
              title={t.title}
              subtitle={t.subtitle}
            />
            <p className="text-sm text-slate-300/90 md:text-base">{t.heroNote}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login">
                <Button size="lg">{t.signIn}</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">{t.createAccount}</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-300/80">
              {[t.trustA, t.trustB, t.trustC].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{t.statsTitle}</p>
            <div className="mt-5 grid gap-4">
              <StatCard label={t.statClients} value="124" helper="+12%" />
              <StatCard label={t.statCheckins} value="86" helper="+18%" />
              <StatCard label={t.statCompliance} value="92%" helper="Top 10%" />
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.insightsTitle}</p>
              <p className="mt-2 text-sm text-slate-300/90">{t.insightsCopy}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {t.insightsLive}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-8">
          <SectionHeader
            eyebrow={t.featuresEyebrow}
            title={t.featuresTitle}
            subtitle={t.featuresSubtitle}
          />
          <div className="grid gap-6 md:grid-cols-3">
            <Card title={t.coachDashboard} description={t.coachDesc} />
            <Card title={t.clientLogging} description={t.clientDesc} />
            <Card title={t.insights} description={t.insightsDesc} />
          </div>
        </section>

        <section id="insights" className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            <SectionHeader
              eyebrow={t.workflowEyebrow}
              title={t.workflowTitle}
            />
            <ol className="space-y-3 text-sm text-slate-300/90">
              {t.workflowSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="surface p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{t.insightsTitle}</p>
            <p className="mt-4 text-sm text-slate-300/90">{t.insightsCopy}</p>
            <div className="mt-6 grid gap-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <span className="text-slate-300/90">Macro adherence</span>
                <span className="text-emerald-300">92%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <span className="text-slate-300/90">Workout completion</span>
                <span className="text-cyan-300">4.6 / 5</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <span className="text-slate-300/90">Check-in streak</span>
                <span className="text-amber-300">11 days</span>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="surface flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t.securityEyebrow}</p>
            <h2 className="text-2xl font-semibold text-white md:text-3xl">{t.securityTitle}</h2>
            <p className="text-sm text-slate-300/90 md:text-base">{t.securityCopy}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-300/80">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Role-based access</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Audit trails</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Encrypted storage</span>
          </div>
        </section>

        <section className="surface p-8 text-center">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">{t.ctaTitle}</h2>
          <p className="mt-3 text-sm text-slate-300/90 md:text-base">{t.ctaSubtitle}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg">{t.ctaPrimary}</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">{t.ctaSecondary}</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
