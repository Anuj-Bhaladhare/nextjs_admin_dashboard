import {
  Activity,
  ArrowUpRight,
  Clock3,
  DoorOpen,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import { Link } from "@/i18n/navigation";

const metrics = [
  {
    label: "Visitors today",
    value: "128",
    detail: "Compared with yesterday",
    change: "+12.8%",
    trend: "positive",
    icon: UsersRound,
    iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    label: "Access events",
    value: "1,284",
    detail: "Successful entries today",
    change: "+8.2%",
    trend: "positive",
    icon: Activity,
    iconClass:
      "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  },
  {
    label: "Gates online",
    value: "8 / 9",
    detail: "One gate needs attention",
    change: "1 offline",
    trend: "warning",
    icon: DoorOpen,
    iconClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    label: "Open alerts",
    value: "3",
    detail: "Requires administrator review",
    change: "Needs review",
    trend: "critical",
    icon: ShieldAlert,
    iconClass: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
] as const;

const recentActivity = [
  {
    title: "Employee entry",
    location: "Main entrance",
    time: "2 min ago",
    result: "Granted",
  },
  {
    title: "Visitor check-in",
    location: "Reception gate",
    time: "8 min ago",
    result: "Granted",
  },
  {
    title: "Access attempt",
    location: "Loading bay",
    time: "14 min ago",
    result: "Denied",
  },
  {
    title: "Employee exit",
    location: "North entrance",
    time: "21 min ago",
    result: "Granted",
  },
] as const;

const gateStatuses = [
  { name: "Main entrance", location: "Building A", status: "Online" },
  { name: "Reception gate", location: "Building A", status: "Online" },
  { name: "North entrance", location: "Building B", status: "Online" },
  { name: "Loading bay", location: "Service area", status: "Offline" },
] as const;

export default function DashboardPage() {
  return (
    <main className="space-y-6 text-gray-800 dark:text-white/90">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-brand-600 uppercase dark:bg-brand-500/10 dark:text-brand-400">
              Sample data
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A quick overview of access activity and gate status.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock3 className="size-4" aria-hidden="true" />
          <span>Today</span>
        </div>
      </header>

      <section
        aria-label="Operational metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">
                    {metric.value}
                  </p>
                </div>
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${metric.iconClass}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.detail}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                    metric.trend === "positive"
                      ? "text-green-600 dark:text-green-400"
                      : metric.trend === "critical"
                        ? "text-red-600 dark:text-red-400"
                        : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {metric.trend === "positive" && (
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  )}
                  {metric.change}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
            <div>
              <h2 className="font-semibold">Recent access activity</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Latest events across your monitored entrances.
              </p>
            </div>
            <Link
              href="/access-logs"
              className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              View logs
            </Link>
          </div>
          <ul className="divide-y divide-gray-100 px-5 sm:px-6 dark:divide-gray-800">
            {recentActivity.map((item) => (
              <li
                key={`${item.title}-${item.location}`}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.location}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                    {item.time}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.result === "Granted"
                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    }`}
                  >
                    {item.result}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
            <h2 className="font-semibold">Gate status</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Current connectivity of monitored gates.
            </p>
          </div>
          <ul className="divide-y divide-gray-100 px-5 sm:px-6 dark:divide-gray-800">
            {gateStatuses.map((gate) => (
              <li
                key={gate.name}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      gate.status === "Online" ? "bg-green-500" : "bg-red-500"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{gate.name}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {gate.location}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${
                    gate.status === "Online"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {gate.status}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
