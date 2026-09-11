import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/calls": "Calls",
  "/analyze": "Analyze Call",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titles[pathname.replace(/\/$/, "") || "/"] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card/85 px-4 backdrop-blur md:px-8">
      <Link to="/" className="text-base font-bold lg:hidden">
        TeleXpert
      </Link>
      <h2 className="hidden text-base font-semibold lg:block">{title}</h2>

      <div className="relative ml-auto w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search calls..."
          aria-label="Search calls"
          className="h-9 rounded-lg pl-9"
        />
      </div>

      <Button variant="ghost" size="icon" aria-label="Notifications" className="relative shrink-0">
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
      </Button>

      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary">
            TX
          </AvatarFallback>
        </Avatar>
        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-semibold">Ops Team</p>
          <p className="text-xs text-muted-foreground">Supervisor</p>
        </div>
      </div>
    </header>
  );
}
