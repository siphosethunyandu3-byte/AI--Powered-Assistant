import type { LucideIcon } from "lucide-react";

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground backdrop-blur">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {eyebrow.toUpperCase()}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
    </div>
  );
}
