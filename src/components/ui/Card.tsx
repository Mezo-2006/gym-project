import { ReactNode } from "react";

type CardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function Card({ title, description, children }: CardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 text-sm text-slate-300/90">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
