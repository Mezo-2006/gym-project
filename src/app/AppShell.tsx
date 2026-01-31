"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-white">
      <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold tracking-[0.2em] text-white">
              FITFLOW <span className="text-cyan-300">PRO</span>
            </Link>
            <nav className="hidden items-center gap-5 text-xs text-slate-300 md:flex">
              <Link href="/#features" className="transition hover:text-white">
                Features
              </Link>
              <Link href="/#insights" className="transition hover:text-white">
                Insights
              </Link>
              <Link href="/#security" className="transition hover:text-white">
                Security
              </Link>
            </nav>
          </div>
          <LanguageToggle />
        </div>
      </div>
      {children}
    </div>
  );
}
