"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/lib/language";

export default function LoginPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = useMemo(
    () =>
      language === "ar"
        ? {
            eyebrow: "FitFlow Pro",
            title: "تسجيل الدخول",
            subtitle: "ادخل لمساحة المدرب أو العميل.",
            email: "البريد الإلكتروني",
            password: "كلمة المرور",
            signIn: "دخول",
            signingIn: "جارٍ تسجيل الدخول...",
            loginFailed: "فشل تسجيل الدخول",
          }
        : {
            eyebrow: "FitFlow Pro",
            title: "Sign in",
            subtitle: "Access your coach or client workspace.",
            email: "Email",
            password: "Password",
            signIn: "Sign in",
            signingIn: "Signing in...",
            loginFailed: "Login failed",
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await parseJsonSafe(res);
      setError(data?.error ?? t.loginFailed);
      setLoading(false);
      return;
    }

    const data = await parseJsonSafe(res);
    const role = data?.user?.role;
    setLoading(false);
    router.push(role === "COACH" ? "/coach/dashboard" : "/client/dashboard");
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-24">
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          subtitle={t.subtitle}
        />

        <form className="surface space-y-4 p-8" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">{t.email}</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">{t.password}</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? t.signingIn : t.signIn}
          </Button>
        </form>
      </div>
    </div>
  );
}
