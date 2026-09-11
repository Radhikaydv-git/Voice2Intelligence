import { Link } from "@tanstack/react-router";
import {
  AudioLines,
  BarChart3,
  LayoutDashboard,
  PhoneCall,
  Settings,
  Sparkles,
} from "lucide-react";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, exact: true },
  { label: "Calls", to: "/calls", icon: PhoneCall, exact: false },
  { label: "Analyze Call", to: "/analyze", icon: AudioLines, exact: false },
  { label: "Analytics", to: "/analytics", icon: BarChart3, exact: false },
] as const;

const itemClass =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

export function AppSidebar() {
  const { connected, checking } = useBackendStatus();

  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">TeleXpert Indore</p>
          <p className="text-xs text-muted-foreground">AI Call Analyzer</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact }}
            className={itemClass}
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          >
            <item.icon className="size-[18px]" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/settings"
          className={itemClass}
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
        >
          <Settings className="size-[18px]" />
          Settings
        </Link>

        <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/70 px-3 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">Backend status</span>
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold",
              checking ? "text-muted-foreground" : connected ? "text-success" : "text-destructive",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                checking
                  ? "bg-muted-foreground"
                  : connected
                    ? "animate-pulse bg-success"
                    : "bg-destructive",
              )}
            />
            {checking ? "Checking" : connected ? "Connected" : "Offline"}
          </span>
        </div>
      </div>
    </aside>
  );
}
