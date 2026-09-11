import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "cyan" | "success" | "warning";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  cyan: "bg-cyan-soft text-cyan",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("flex size-10 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}
