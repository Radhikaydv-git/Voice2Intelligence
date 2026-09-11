import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PhoneOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResolutionBadge } from "@/components/ResolutionBadge";
import { demoCalls } from "@/lib/demo-data";

export const Route = createFileRoute("/calls")({
  head: () => ({
    meta: [
      { title: "Call History — TeleXpert Indore" },
      {
        name: "description",
        content: "Browse, search and filter analyzed customer calls by status and date.",
      },
      { property: "og:title", content: "Call History — TeleXpert Indore" },
      { property: "og:description", content: "Browse and filter analyzed customer calls." },
    ],
  }),
  component: CallsPage,
});

function CallsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");

  const rows = useMemo(
    () =>
      demoCalls.filter((call) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          call.id.toLowerCase().includes(q) ||
          call.audioFile.toLowerCase().includes(q) ||
          call.purpose.toLowerCase().includes(q);
        const matchesStatus = status === "all" || call.resolution === status;
        const matchesDate = !date || call.date === date;
        return matchesQuery && matchesStatus && matchesDate;
      }),
    [query, status, date],
  );

  return (
    <div className="page-enter mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Calls</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Call history shown with sample records — the backend does not expose a calls list endpoint.
        </p>
      </div>

      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, file or purpose"
            aria-label="Search calls"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[190px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Unresolved">Unresolved</SelectItem>
            <SelectItem value="Follow-up Required">Follow-up Required</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Filter by date"
          className="w-[170px]"
        />
        {(query || status !== "all" || date) && (
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setDate("");
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Call ID</th>
                <th className="px-5 py-3 font-semibold">Audio File</th>
                <th className="px-5 py-3 font-semibold">Call Purpose</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 text-right font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((call) => (
                <tr key={call.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3.5 font-semibold">{call.id}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{call.audioFile}</td>
                  <td className="px-5 py-3.5">{call.purpose}</td>
                  <td className="px-5 py-3.5">
                    <ResolutionBadge value={call.resolution} />
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{call.date}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/analyze">View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <PhoneOff className="size-5" />
            </span>
            <p className="font-semibold">No calls match your filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try a different search term, status or date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
