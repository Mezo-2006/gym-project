import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-white text-slate-900 shadow-lg shadow-cyan-500/10 hover:-translate-y-0.5 hover:bg-slate-200"
      : "border border-white/20 text-white/90 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/5";
  const sizes =
    size === "lg"
      ? "px-6 py-3 text-base"
      : size === "sm"
      ? "px-4 py-2 text-xs"
      : "px-5 py-2.5 text-sm";

  return <button className={`${base} ${sizes} ${styles} ${className}`} {...props} />;
}
