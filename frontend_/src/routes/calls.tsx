import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  FileAudio,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ResolutionBadge } from "@/components/ResolutionBadge";

import {
  formatCallDate,
  getAudioFileName,
  getCallPurpose,
  getCalls,
  normalizeResolution,
  type CallRecord,
  type Resolution,
} from "@/lib/api";

export const Route = createFileRoute("/calls")({
  head: () => ({
    meta: [
      {
        title: "Call History — TeleXpert AI Call Analyzer",
      },
      {
        name: "description",
        content:
          "View historical customer calls, transcripts and AI-generated insights.",
      },
    ],
  }),
  component: CallsPage,
});

type FilterValue =
  | "All"
  | "Resolved"
  | "Unresolved"
  | "Follow-up Required";

function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [resolutionFilter, setResolutionFilter] =
    useState<FilterValue>("All");

  const [dateFilter, setDateFilter] =
    useState("");

  async function loadCalls(
    showRefreshing = false,
  ) {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const data = await getCalls();

      setCalls(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load call history.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadCalls();
  }, []);

  const filteredCalls = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return calls.filter((call) => {
      const purpose =
        getCallPurpose(call).toLowerCase();

      const audio =
        getAudioFileName(call).toLowerCase();

      const id =
        String(call.id).toLowerCase();

      const resolution =
        normalizeResolution(
          call.analysis?.resolution_status,
        );

      const matchesSearch =
        !query ||
        id.includes(query) ||
        purpose.includes(query) ||
        audio.includes(query);

      const matchesResolution =
        resolutionFilter === "All" ||
        resolution === resolutionFilter;

      const callDate =
        call.created_at
          ? new Date(
              call.created_at,
            )
          : null;

      const matchesDate =
        !dateFilter ||
        (callDate !== null &&
          !Number.isNaN(
            callDate.getTime(),
          ) &&
          getLocalDateString(
            callDate,
          ) === dateFilter);

      return (
        matchesSearch &&
        matchesResolution &&
        matchesDate
      );
    });
  }, [
    calls,
    search,
    resolutionFilter,
    dateFilter,
  ]);

  const counts = useMemo(() => {
    let resolved = 0;
    let unresolved = 0;
    let followUp = 0;

    for (const call of calls) {
      const resolution =
        normalizeResolution(
          call.analysis?.resolution_status,
        );

      if (resolution === "Resolved") {
        resolved++;
      } else if (
        resolution === "Follow-up Required"
      ) {
        followUp++;
      } else {
        unresolved++;
      }
    }

    return {
      total: calls.length,
      resolved,
      unresolved,
      followUp,
    };
  }, [calls]);

  function clearFilters() {
    setSearch("");
    setResolutionFilter("All");
    setDateFilter("");
  }

  const hasFilters =
    search.trim().length > 0 ||
    resolutionFilter !== "All" ||
    dateFilter.length > 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />

            <h1 className="text-2xl font-bold tracking-tight">
              Call History
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Browse calls analyzed by AssemblyAI and Gemini and
            saved in PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              void loadCalls(true)
            }
            disabled={
              loading || refreshing
            }
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}

            Refresh
          </Button>

          <Button asChild>
            <a href="/analyze">
              <FileAudio className="mr-2 h-4 w-4" />
              Analyze New Call
            </a>
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

              <div>
                <p className="font-semibold">
                  Could not load call history
                </p>

                <p className="text-sm text-muted-foreground">
                  {error}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                void loadCalls()
              }
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Calls"
            value={counts.total}
          />

          <SummaryCard
            label="Resolved"
            value={counts.resolved}
          />

          <SummaryCard
            label="Follow-up Required"
            value={counts.followUp}
          />

          <SummaryCard
            label="Unresolved"
            value={counts.unresolved}
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px_auto]">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search by ID, filename or call purpose..."
                className="pl-9"
              />
            </div>

            {/* Resolution */}
            <select
              value={resolutionFilter}
              onChange={(event) =>
                setResolutionFilter(
                  event.target
                    .value as FilterValue,
                )
              }
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="All">
                All resolutions
              </option>

              <option value="Resolved">
                Resolved
              </option>

              <option value="Unresolved">
                Unresolved
              </option>

              <option value="Follow-up Required">
                Follow-up Required
              </option>
            </select>

            {/* Date */}
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(
                    event.target.value,
                  )
                }
                className="pl-9"
              />
            </div>

            {/* Clear */}
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasFilters}
            >
              Clear
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing{" "}
              <strong className="font-semibold text-foreground">
                {filteredCalls.length}
              </strong>{" "}
              of{" "}
              <strong className="font-semibold text-foreground">
                {calls.length}
              </strong>{" "}
              calls
            </span>

            {hasFilters && (
              <span>
                Filters active
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading ? (
        <CallsLoading />
      ) : calls.length === 0 ? (
        <EmptyCalls />
      ) : filteredCalls.length === 0 ? (
        <NoResults
          onClear={clearFilters}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              All Calls
            </CardTitle>
          </CardHeader>

          <CardContent>
            <CallsTable
              calls={filteredCalls}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* -------------------------------------------------------
 * Calls table
 * ----------------------------------------------------- */

function CallsTable({
  calls,
}: {
  calls: CallRecord[];
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="grid grid-cols-[80px_1.4fr_1.5fr_180px_160px_80px] gap-4 border-b px-3 pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>ID</span>

          <span>Audio File</span>

          <span>Call Purpose</span>

          <span>Date</span>

          <span>Resolution</span>

          <span className="text-right">
            Action
          </span>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {calls.map((call) => (
            <CallRow
              key={call.id}
              call={call}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
 * Individual row
 * ----------------------------------------------------- */

function CallRow({
  call,
}: {
  call: CallRecord;
}) {
  const resolution =
    normalizeResolution(
      call.analysis?.resolution_status,
    );

  return (
    <div className="grid grid-cols-[80px_1.4fr_1.5fr_180px_160px_80px] items-center gap-4 px-3 py-4 transition-colors hover:bg-muted/40">
      {/* ID */}
      <span className="font-mono text-sm font-semibold">
        #{call.id}
      </span>

      {/* Audio */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <FileAudio className="h-4 w-4 text-primary" />
        </div>

        <div className="min-w-0">
          <p
            className="truncate text-sm font-medium"
            title={getAudioFileName(
              call,
            )}
          >
            {getAudioFileName(call)}
          </p>

          <p className="text-xs text-muted-foreground">
            Original recording
          </p>
        </div>
      </div>

      {/* Purpose */}
      <div className="min-w-0">
        <p
          className="truncate text-sm"
          title={getCallPurpose(call)}
        >
          {getCallPurpose(call)}
        </p>
      </div>

      {/* Date */}
      <div className="text-sm text-muted-foreground">
        {formatCallDate(
          call.created_at,
        )}
      </div>

      {/* Resolution */}
      <div>
        <ResolutionBadge
          value={resolution}
        />
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <a
            href={`/analyze?callId=${call.id}`}
            title={`View call #${call.id}`}
          >
            View
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
 * Summary card
 * ----------------------------------------------------- */

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm font-medium text-muted-foreground">
          {label}
        </p>

        <p className="mt-2 text-2xl font-bold">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------
 * Empty database state
 * ----------------------------------------------------- */

function EmptyCalls() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <FileAudio className="h-8 w-8 text-primary" />
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          No calls found
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          There are currently no analyzed calls stored in
          PostgreSQL. Upload an MP3 or WAV recording to create
          your first call analysis.
        </p>

        <Button
          className="mt-6"
          asChild
        >
          <a href="/analyze">
            Analyze a Call
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------
 * No filter results
 * ----------------------------------------------------- */

function NoResults({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="h-8 w-8 text-muted-foreground" />

        <h2 className="mt-4 text-lg font-semibold">
          No matching calls
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Try changing your search or filters.
        </p>

        <Button
          className="mt-5"
          variant="outline"
          onClick={onClear}
        >
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------
 * Loading state
 * ----------------------------------------------------- */

function CallsLoading() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4"
            >
              <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />

                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>

              <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------
 * Helpers
 * ----------------------------------------------------- */

function getLocalDateString(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default CallsPage;