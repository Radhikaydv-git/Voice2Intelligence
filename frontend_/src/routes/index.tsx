import { createFileRoute, Link } from "@tanstack/react-router";
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
import { AudioLines, CheckCircle2, Clock, PhoneCall } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ResolutionBadge } from "@/components/ResolutionBadge";
import { Button } from "@/components/ui/button";
import { activitySeries, demoCalls, kpis, resolutionSeries } from "@/lib/demo-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Call Analytics Dashboard — TeleXpert Indore" },
      {
        name: "description",
        content:
          "Monitor call volume, resolution rates and recent customer conversations in one AI-powered dashboard.",
      },
      { property: "og:title", content: "Call Analytics Dashboard — TeleXpert Indore" },
      {
        property: "og:description",
        content: "Monitor, analyze and understand customer conversations.",
      },
    ],
  }),
  component: Dashboard,
});

const donutColors = ["var(--success)", "var(--destructive)", "var(--warning)"];

function Dashboard() {
  return (
    <div className="page-enter mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Call Analytics Dashboard</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Monitor, analyze and understand customer conversations.
          </p>
        </div>
        <Button asChild>
          <Link to="/analyze">
            <AudioLines className="size-4" />
            Analyze a call
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Calls" value={kpis.totalCalls} icon={PhoneCall} tone="primary" />
        <StatCard label="Analyzed Calls" value={kpis.analyzedCalls} icon={AudioLines} tone="cyan" />
        <StatCard
          label="Resolved Calls"
          value={kpis.resolvedCalls}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard label="Follow-up Required" value={kpis.followUp} icon={Clock} tone="warning" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Call Activity</h2>
          <p className="text-xs text-muted-foreground">Calls received and analyzed this week</p>
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activitySeries} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
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
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
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

        <div className="panel p-5">
          <h2 className="text-base font-semibold">Call Resolution</h2>
          <p className="text-xs text-muted-foreground">Distribution across outcomes</p>
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolutionSeries}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={3}
                  stroke="var(--card)"
                >
                  {resolutionSeries.map((entry, i) => (
                    <Cell key={entry.name} fill={donutColors[i % donutColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Recent Calls</h2>
            <p className="text-xs text-muted-foreground">
              Sample records shown until a calls endpoint is available
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/calls">View all</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Call ID</th>
                <th className="px-5 py-3 font-semibold">Audio File</th>
                <th className="px-5 py-3 font-semibold">Call Purpose</th>
                <th className="px-5 py-3 font-semibold">Resolution</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {demoCalls.slice(0, 6).map((call) => (
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
                      <Link to="/calls">View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <BarPreview />
    </div>
  );
}

function BarPreview() {
  return (
    <section className="panel p-5">
      <h2 className="text-base font-semibold">Analyzed vs. Received</h2>
      <p className="text-xs text-muted-foreground">Daily analysis coverage</p>
      <div className="mt-5 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activitySeries} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
            />
            <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="calls" name="Calls" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="analyzed" name="Analyzed" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
