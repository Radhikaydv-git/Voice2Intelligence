import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  AudioLines,
  CheckCircle2,
  Clock,
  PhoneCall,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import { StatCard } from
  "@/components/StatCard";

import { ResolutionBadge } from
  "@/components/ResolutionBadge";

import { Button } from
  "@/components/ui/button";

import {
  buildDailyActivity,
  getAudioFileName,
  getCallDate,
  getCallPurpose,
  getCalls,
  normalizeResolution,
  type CallRecord,
} from "@/lib/api";


export const Route =
  createFileRoute("/")({

    head: () => ({
      meta: [
        {
          title:
            "Call Analytics Dashboard — TeleXpert Indore",
        },

        {
          name: "description",
          content:
            "Monitor call volume, resolution rates and recent customer conversations in one AI-powered dashboard.",
        },

        {
          property: "og:title",
          content:
            "Call Analytics Dashboard — TeleXpert Indore",
        },

        {
          property: "og:description",
          content:
            "Monitor, analyze and understand customer conversations.",
        },
      ],
    }),

    component: Dashboard,
  });


const donutColors = [
  "var(--success)",
  "var(--destructive)",
  "var(--warning)",
];


function Dashboard() {

  const [
    calls,
    setCalls,
  ] = useState<CallRecord[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  // ==========================================================
  // LOAD REAL CALLS
  // ==========================================================

  const loadCalls =
    async () => {

      setLoading(true);

      setError(null);


      try {

        const data =
          await getCalls();

        setCalls(data);

      } catch (e) {

        setError(
          e instanceof Error
            ? e.message
            : "Unable to load calls.",
        );

      } finally {

        setLoading(false);
      }
    };


  useEffect(() => {

    void loadCalls();

  }, []);


  // ==========================================================
  // REAL DATABASE STATISTICS
  // ==========================================================

  const analyzedCalls =
    calls.length;


  const resolvedCalls =
    calls.filter(
      (call) =>
        normalizeResolution(
          call.analysis
            ?.resolution_status,
        ) === "Resolved",
    ).length;


  const followUp =
    calls.filter(
      (call) =>
        normalizeResolution(
          call.analysis
            ?.resolution_status,
        ) ===
        "Follow-up Required",
    ).length;


  const unresolved =
    Math.max(
      0,
      calls.length -
        resolvedCalls -
        followUp,
    );


  // ==========================================================
  // ACTIVITY
  // ==========================================================

  const activitySeries =
    useMemo(
      () =>
        buildDailyActivity(
          calls,
          7,
        ),
      [calls],
    );


  // ==========================================================
  // RESOLUTION
  // ==========================================================

  const resolutionSeries =
    useMemo(
      () => [
        {
          name: "Resolved",
          value: resolvedCalls,
        },

        {
          name: "Unresolved",
          value: unresolved,
        },

        {
          name:
            "Follow-up Required",
          value: followUp,
        },
      ],
      [
        resolvedCalls,
        unresolved,
        followUp,
      ],
    );


  return (

    <div className="page-enter mx-auto flex w-full max-w-7xl flex-col gap-6">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="flex flex-wrap items-end justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Call Analytics Dashboard
          </h1>


          <p className="mt-1.5 text-sm text-muted-foreground">
            Live dashboard powered by calls saved in PostgreSQL.
          </p>

        </div>


        <div className="flex gap-2">

          <Button
            variant="outline"
            onClick={() =>
              void loadCalls()
            }
            disabled={loading}
          >

            <RefreshCw
              className={
                loading
                  ? "size-4 animate-spin"
                  : "size-4"
              }
            />

            Refresh

          </Button>


          <Button asChild>

            <Link to="/analyze">

              <AudioLines className="size-4" />

              Analyze a call

            </Link>

          </Button>

        </div>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error ? (

        <ErrorPanel
          message={error}
          onRetry={() =>
            void loadCalls()
          }
        />

      ) : null}


      {/* ====================================================
          STAT CARDS
      ==================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total Calls"
          value={calls.length}
          icon={PhoneCall}
          tone="primary"
        />


        <StatCard
          label="Analyzed Calls"
          value={analyzedCalls}
          icon={AudioLines}
          tone="cyan"
        />


        <StatCard
          label="Resolved Calls"
          value={resolvedCalls}
          icon={CheckCircle2}
          tone="success"
        />


        <StatCard
          label="Follow-up Required"
          value={followUp}
          icon={Clock}
          tone="warning"
        />

      </section>


      {/* ====================================================
          CHARTS
      ==================================================== */}

      <section className="grid gap-6 lg:grid-cols-3">

        {/* CALL ACTIVITY */}

        <div className="panel p-5 lg:col-span-2">

          <h2 className="text-base font-semibold">
            Call Activity
          </h2>


          <p className="text-xs text-muted-foreground">
            Calls received and analyzed over the last 7 days
          </p>


          <div className="mt-5 h-[280px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={
                  activitySeries
                }
                margin={{
                  left: -20,
                  right: 8,
                  top: 8,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />


                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />


                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                  allowDecimals={false}
                />


                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border:
                      "1px solid var(--border)",
                    background:
                      "var(--card)",
                    fontSize: 12,
                  }}
                />


                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                  }}
                />


                <Line
                  type="monotone"
                  dataKey="calls"
                  name="Calls"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                />


                <Line
                  type="monotone"
                  dataKey="analyzed"
                  name="Analyzed"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* RESOLUTION */}

        <div className="panel p-5">

          <h2 className="text-base font-semibold">
            Call Resolution
          </h2>


          <p className="text-xs text-muted-foreground">
            Distribution across real saved outcomes
          </p>


          <div className="mt-5 h-[280px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={
                    resolutionSeries
                  }
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={3}
                  stroke="var(--card)"
                >

                  {resolutionSeries.map(
                    (
                      entry,
                      i,
                    ) => (

                      <Cell
                        key={
                          entry.name
                        }
                        fill={
                          donutColors[
                            i %
                              donutColors.length
                          ]
                        }
                      />

                    ),
                  )}

                </Pie>


                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border:
                      "1px solid var(--border)",
                    background:
                      "var(--card)",
                    fontSize: 12,
                  }}
                />


                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                  }}
                />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

      </section>


      {/* ====================================================
          RECENT CALLS
      ==================================================== */}

      <section className="panel overflow-hidden">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">

          <div>

            <h2 className="text-base font-semibold">
              Recent Calls
            </h2>


            <p className="text-xs text-muted-foreground">
              Latest calls saved after AssemblyAI + Gemini analysis
            </p>

          </div>


          <Button
            variant="outline"
            size="sm"
            asChild
          >

            <Link to="/calls">
              View all
            </Link>

          </Button>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>

              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">

                <th className="px-5 py-3 font-semibold">
                  Call ID
                </th>


                <th className="px-5 py-3 font-semibold">
                  Audio File
                </th>


                <th className="px-5 py-3 font-semibold">
                  Call Purpose
                </th>


                <th className="px-5 py-3 font-semibold">
                  Resolution
                </th>


                <th className="px-5 py-3 font-semibold">
                  Date
                </th>


                <th className="px-5 py-3 text-right font-semibold">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {loading &&
              calls.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    Loading calls…
                  </td>

                </tr>

              ) : calls.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    No analyzed calls have been saved yet.
                  </td>

                </tr>

              ) : (

                calls
                  .slice(0, 6)
                  .map(
                    (call) => {

                      const resolution =
                        normalizeResolution(
                          call.analysis
                            ?.resolution_status,
                        );


                      return (

                        <tr
                          key={
                            call.id
                          }
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >

                          <td className="px-5 py-3.5 font-semibold">
                            #{call.id}
                          </td>


                          <td className="max-w-[220px] truncate px-5 py-3.5 text-muted-foreground">
                            {getAudioFileName(
                              call,
                            )}
                          </td>


                          <td className="px-5 py-3.5">
                            {getCallPurpose(
                              call,
                            )}
                          </td>


                          <td className="px-5 py-3.5">

                            <ResolutionBadge
                              value={
                                resolution
                              }
                            />

                          </td>


                          <td className="px-5 py-3.5 text-muted-foreground">

                            {getCallDate(
                              call.created_at,
                            )}

                          </td>


                          <td className="px-5 py-3.5 text-right">

                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >

                              <a
                                href={`/analyze?callId=${call.id}`}
                              >
                                View
                              </a>

                            </Button>

                          </td>

                        </tr>

                      );
                    },
                  )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ====================================================
          BAR CHART
      ==================================================== */}

      <BarPreview
        activitySeries={
          activitySeries
        }
      />

    </div>
  );
}


// ============================================================
// BAR PREVIEW
// ============================================================

function BarPreview({
  activitySeries,
}: {
  activitySeries: {
    day: string;
    calls: number;
    analyzed: number;
  }[];
}) {

  return (

    <section className="panel p-5">

      <h2 className="text-base font-semibold">
        Analyzed vs. Received
      </h2>


      <p className="text-xs text-muted-foreground">
        Daily analysis coverage from PostgreSQL data
      </p>


      <div className="mt-5 h-[220px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <BarChart
            data={
              activitySeries
            }
            margin={{
              left: -20,
              right: 8,
              top: 8,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />


            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
            />


            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
              allowDecimals={false}
            />


            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border:
                  "1px solid var(--border)",
                background:
                  "var(--card)",
                fontSize: 12,
              }}
            />


            <Bar
              dataKey="calls"
              name="Calls"
              fill="var(--chart-1)"
              radius={[
                6,
                6,
                0,
                0,
              ]}
            />


            <Bar
              dataKey="analyzed"
              name="Analyzed"
              fill="var(--chart-2)"
              radius={[
                6,
                6,
                0,
                0,
              ]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </section>
  );
}


// ============================================================
// ERROR PANEL
// ============================================================

function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {

  return (

    <div className="flex items-start gap-3 rounded-xl border border-border bg-destructive-soft p-4">

      <TriangleAlert className="mt-0.5 size-5 text-destructive" />


      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-destructive">
          Could not load live call data
        </p>


        <p className="mt-1 break-words text-sm text-muted-foreground">
          {message}
        </p>

      </div>


      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
      >
        Retry
      </Button>

    </div>
  );
}