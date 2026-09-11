import { createFileRoute } from "@tanstack/react-router";
import { Server, ShieldCheck, Sparkles } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TeleXpert Indore AI Call Analyzer" },
      {
        name: "description",
        content: "Application details and backend connection status for the AI Call Analyzer.",
      },
      { property: "og:title", content: "Settings — TeleXpert Indore" },
      { property: "og:description", content: "Application and backend connection details." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { connected, checking } = useBackendStatus();

  return (
    <div className="page-enter mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Read-only overview of this workspace. No credentials are shown here.
        </p>
      </div>

      <section className="panel divide-y divide-border">
        <Row icon={Sparkles} label="Application" value="TeleXpert Indore" hint="AI Call Analyzer" />
        <Row icon={Server} label="Backend" value={API_URL} hint="FastAPI service" mono />
        <div className="flex items-center gap-4 p-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Connection</p>
            <p className="text-xs text-muted-foreground">Checked automatically every 30 seconds</p>
          </div>
          {checking ? (
            <Skeleton className="h-6 w-24 rounded-full" />
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                connected ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive",
              )}
            >
              <span
                className={cn("size-2 rounded-full", connected ? "bg-success" : "bg-destructive")}
              />
              {connected ? "Connected" : "Disconnected"}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  hint,
  mono,
}: {
  icon: typeof Server;
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-5">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <span className={cn("text-sm text-muted-foreground", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  );
}
