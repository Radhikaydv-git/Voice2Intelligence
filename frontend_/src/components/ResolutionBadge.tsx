import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  Resolved: "bg-success-soft text-success",
  Unresolved: "bg-destructive-soft text-destructive",
  "Follow-up Required": "bg-warning-soft text-warning",
  Analyzed: "bg-primary-soft text-primary",
  Queued: "bg-muted text-muted-foreground",
};

export function ResolutionBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        map[value] ?? "bg-muted text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}
