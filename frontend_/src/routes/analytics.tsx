import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FileAudio,
  Loader2,
  Phone,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import {
  buildMonthlyVolume,
  formatCallDate,
  getCallPurpose,
  getCalls,
  normalizeResolution,
  type CallRecord,
} from "@/lib/api";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      {
        title: "Analytics — TeleXpert Indore AI Call Analyzer",
      },
      {
        name: "description",
        content:
          "Real-time analytics and insights generated from analyzed customer calls.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCalls();
      setCalls(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load analytics data.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const totalCalls = calls.length;

    const resolved = calls.filter(
      (call) => normalizeResolution(call.analysis_json?.resolution_status) === "Resolved",
    ).length;

    const unresolved = calls.filter(
      (call) =>
        normalizeResolution(call.analysis_json?.resolution_status) === "Unresolved",
    ).length;

    const followUp = calls.filter(
      (call) =>
        normalizeResolution(call.analysis_json?.resolution_status) ===
        "Follow-up needed",
    ).length;

    const resolvedRate =
      totalCalls > 0 ? Math.round((resolved / totalCalls) * 100) : 0;

    const unresolvedRate =
      totalCalls > 0 ? Math.round((unresolved / totalCalls) * 100) : 0;

    const followUpRate =
      totalCalls > 0 ? Math.round((followUp / totalCalls) * 100) : 0;

    const purposeCounts = new Map<string, number>();

    calls.forEach((call) => {
      const purpose = getCallPurpose(call) || "Other";

      purposeCounts.set(
        purpose,
        (purposeCounts.get(purpose) ?? 0) + 1,
      );
    });

    const purposes = Array.from(purposeCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const monthlyVolume = buildMonthlyVolume(calls);

    const latestCalls = [...calls]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      )
      .slice(0, 5);

    return {
      totalCalls,
      resolved,
      unresolved,
      followUp,
      resolvedRate,
      unresolvedRate,
      followUpRate,
      purposes,
      monthlyVolume,
      latestCalls,
    };
  }, [calls]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Loading real call analytics from your database...
          </p>
        </div>

        <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-card">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze performance using your saved call records.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <XCircle className="mb-4 size-10 text-destructive" />

            <h2 className="text-lg font-semibold">
              Unable to load analytics
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error}
            </p>

            <Button
              className="mt-5"
              onClick={() => void loadAnalytics()}
            >
              <RefreshCw className="mr-2 size-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-6 text-primary" />

            <h1 className="text-2xl font-bold tracking-tight">
              Analytics
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Performance insights calculated from your analyzed calls.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadAnalytics()}
          disabled={loading}
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {/* Empty state */}
      {calls.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[350px] flex-col items-center justify-center text-center">
            <FileAudio className="mb-4 size-12 text-muted-foreground" />

            <h2 className="text-xl font-semibold">
              No analyzed calls yet
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Upload and analyze your first customer call to start
              generating real analytics.
            </p>

            <Button
              className="mt-5"
              onClick={() => {
                window.location.href = "/analyze";
              }}
            >
              Analyze a Call
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Calls"
              value={analytics.totalCalls}
              hint="Analyzed calls"
              icon={Phone}
              tone="primary"
            />

            <StatCard
              label="Resolved"
              value={`${analytics.resolvedRate}%`}
              hint={`${analytics.resolved} resolved calls`}
              icon={CheckCircle2}
              tone="success"
            />

            <StatCard
              label="Follow-up Needed"
              value={`${analytics.followUpRate}%`}
              hint={`${analytics.followUp} calls need follow-up`}
              icon={Clock3}
              tone="warning"
            />

            <StatCard
              label="Unresolved"
              value={`${analytics.unresolvedRate}%`}
              hint={`${analytics.unresolved} unresolved calls`}
              icon={XCircle}
              tone="cyan"
            />
          </div>

          {/* Resolution overview */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resolution Overview</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {/* Resolved */}
                  <ResolutionRow
                    label="Resolved"
                    value={analytics.resolved}
                    percentage={analytics.resolvedRate}
                  />

                  {/* Follow-up */}
                  <ResolutionRow
                    label="Follow-up needed"
                    value={analytics.followUp}
                    percentage={analytics.followUpRate}
                  />

                  {/* Unresolved */}
                  <ResolutionRow
                    label="Unresolved"
                    value={analytics.unresolved}
                    percentage={analytics.unresolvedRate}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Call purpose */}
            <Card>
              <CardHeader>
                <CardTitle>Call Purpose</CardTitle>
              </CardHeader>

              <CardContent>
                {analytics.purposes.length === 0 ? (
                  <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
                    No call purpose data available.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.purposes.slice(0, 6).map((purpose) => (
                      <div key={purpose.name} className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="truncate text-sm font-medium">
                            {purpose.name}
                          </span>

                          <span className="shrink-0 text-sm text-muted-foreground">
                            {purpose.count}{" "}
                            {purpose.count === 1 ? "call" : "calls"}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${purpose.percentage}%`,
                            }}
                          />
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {purpose.percentage}% of all calls
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly volume */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Call Volume</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Number of calls analyzed each month.
                  </p>
                </div>

                <TrendingUp className="size-5 text-primary" />
              </div>
            </CardHeader>

            <CardContent>
              {analytics.monthlyVolume.length === 0 ? (
                <div className="flex min-h-[250px] items-center justify-center text-sm text-muted-foreground">
                  No monthly call data available.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex h-[280px] items-end gap-3 overflow-x-auto border-b pb-2">
                    {analytics.monthlyVolume.map((item) => {
                      const maxVolume = Math.max(
                        ...analytics.monthlyVolume.map(
                          (month) => month.calls,
                        ),
                        1,
                      );

                      const height =
                        item.calls === 0
                          ? 4
                          : Math.max(
                              8,
                              (item.calls / maxVolume) * 230,
                            );

                      return (
                        <div
                          key={item.month}
                          className="flex min-w-[55px] flex-1 flex-col items-center justify-end gap-2"
                        >
                          <span className="text-xs font-semibold">
                            {item.calls}
                          </span>

                          <div
                            className="w-full max-w-[48px] rounded-t-md bg-primary transition-all"
                            style={{
                              height: `${height}px`,
                            }}
                            title={`${item.month}: ${item.calls} calls`}
                          />

                          <span className="text-xs text-muted-foreground">
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent analyzed calls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Analyzed Calls</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Latest records stored in PostgreSQL.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    window.location.href = "/calls";
                  }}
                >
                  View all
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {analytics.latestCalls.map((call) => {
                  const resolution = normalizeResolution(
                    call.analysis_json?.resolution_status,
                  );

                  return (
                    <button
                      key={call.id}
                      type="button"
                      className="flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50"
                      onClick={() => {
                        window.location.href = `/analyze?callId=${call.id}`;
                      }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <FileAudio className="size-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {getCallPurpose(call) || "Customer Call"}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatCallDate(call.created_at)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          resolution === "Resolved"
                            ? "bg-success-soft text-success"
                            : resolution === "Unresolved"
                              ? "bg-destructive-soft text-destructive"
                              : "bg-warning-soft text-warning"
                        }`}
                      >
                        {resolution}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 size-5 shrink-0 text-primary" />

                <div>
                  <h3 className="font-semibold">
                    Analytics Summary
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Your dashboard currently contains{" "}
                    <span className="font-semibold text-foreground">
                      {analytics.totalCalls}
                    </span>{" "}
                    analyzed{" "}
                    {analytics.totalCalls === 1 ? "call" : "calls"}.
                    {" "}
                    <span className="font-semibold text-foreground">
                      {analytics.resolvedRate}%
                    </span>{" "}
                    of calls are resolved, while{" "}
                    <span className="font-semibold text-foreground">
                      {analytics.followUpRate}%
                    </span>{" "}
                    require follow-up.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function ResolutionRow({
  label,
  value,
  percentage,
}: {
  label: string;
  value: number;
  percentage: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>

        <span className="text-sm text-muted-foreground">
          {value} · {percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}