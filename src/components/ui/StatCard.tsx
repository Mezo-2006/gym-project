import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {helper && <p className="mt-1 text-xs text-slate-300/80">{helper}</p>}
    </div>
  );
}
