type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
        {title}
      </h1>
      {subtitle && <p className="mt-3 text-sm text-slate-300/90 md:text-base">{subtitle}</p>}
    </div>
  );
}
