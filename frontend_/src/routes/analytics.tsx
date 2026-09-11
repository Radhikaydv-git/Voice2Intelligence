import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { activitySeries, monthlyVolume, resolutionSeries, statusSeries } from "@/lib/demo-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TeleXpert Indore AI Call Analyzer" },
      {
        name: "description",
        content:
          "Call volume trends, resolution distribution, processing status and analysis activity for your call center.",
      },
      { property: "og:title", content: "Analytics — TeleXpert Indore" },
      {
        property: "og:description",
        content: "Call volume, resolution and analysis activity insights.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: 12,
} as const;

const donutColors = ["var(--success)", "var(--destructive)", "var(--warning)"];

function AnalyticsPage() {
  return (
    <div className="page-enter mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Analytics</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Visual trends built from sample data — no backend statistics endpoints are used.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-base font-semibold">Call Volume</h2>
          <p className="text-xs text-muted-foreground">Last six months</p>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyVolume} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="volume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="calls"
                  name="Calls"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#volume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-base font-semibold">Resolution Distribution</h2>
          <p className="text-xs text-muted-foreground">Share of call outcomes</p>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolutionSeries}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="var(--card)"
                >
                  {resolutionSeries.map((entry, i) => (
                    <Cell key={entry.name} fill={donutColors[i % donutColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-base font-semibold">Call Status</h2>
          <p className="text-xs text-muted-foreground">Processing pipeline state</p>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusSeries} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Calls" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-base font-semibold">Analysis Activity</h2>
          <p className="text-xs text-muted-foreground">Calls analyzed per day this week</p>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitySeries} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="analyzed" name="Analyzed" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="calls" name="Received" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
