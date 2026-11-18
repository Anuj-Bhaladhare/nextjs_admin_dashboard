import {
  ArrowLeft,
  Braces,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Database,
  Ellipsis,
  FileJson2,
  Info,
  Plus,
  Search,
  Settings2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const settings = [
  {
    key: "access_policy",
    description: "Authentication and session rules",
    updated: "Today, 9:42 AM",
    value: `{
  "require_mfa": true,
  "session_timeout_minutes": 30,
  "allowed_auth_methods": ["password", "sso"]
}`,
    selected: true,
  },
  {
    key: "visitor_access",
    description: "Visitor registration and approvals",
    updated: "Nov 17, 2026",
    value: `{
  "enabled": true,
  "host_approval_required": true,
  "max_visit_days": 7
}`,
    selected: false,
  },
  {
    key: "security_notifications",
    description: "Security event notification preferences",
    updated: "Nov 12, 2026",
    value: `{
  "email_enabled": true,
  "events": ["failed_sign_in", "account_locked"],
  "recipients": ["security@northstar.example"]
}`,
    selected: false,
  },
  {
    key: "badge_defaults",
    description: "Default badge configuration",
    updated: "Nov 08, 2026",
    value: `{
  "badge_expiry_days": 365,
  "require_photo": false
}`,
    selected: false,
  },
] as const;

const organizationId = "a18f3d9c-7c42-4f10-9b26-2e6a51c0d731";

export default function OrganizationSettingsPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 text-gray-800 dark:text-white/90">
      <header className="space-y-4">
        <Link
          href="/organization-management"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Organization management
        </Link>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400">
                <Settings2 className="size-4" aria-hidden="true" />
                Organization settings
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-white/10 dark:text-gray-400">
                UI preview · Sample data
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Organization settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              Configure key/value preferences for an organization. Setting
              values are stored as JSON.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="organization-select" className="sr-only">
              Select organization
            </label>
            <div className="relative min-w-64">
              <Building2
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <select
                id="organization-select"
                defaultValue="NORTHSTAR"
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pr-10 pl-10 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                <option value="NORTHSTAR">Northstar Security</option>
                <option value="HARBOR-PT">Harbor Point Offices</option>
                <option value="REDWOOD">Redwood Logistics</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-700"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add setting
            </button>
          </div>
        </div>
      </header>

      <section
        aria-label="Selected organization"
        className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-gray-800 dark:bg-white/3"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
            NS
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-sm font-semibold">
                Northstar Security
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
                Active
              </span>
            </div>
            <p className="mt-1 truncate font-mono text-xs text-gray-500 dark:text-gray-400">
              NORTHSTAR
            </p>
          </div>
        </div>
        <div className="min-w-0 border-t border-gray-100 pt-3 sm:max-w-sm sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5 dark:border-gray-800">
          <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Organization ID
          </p>
          <p className="mt-1 truncate font-mono text-xs text-gray-600 dark:text-gray-300">
            {organizationId}
          </p>
        </div>
      </section>

      <section
        aria-label="Settings overview"
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          {
            label: "Total settings",
            value: "4",
            detail: "For this organization",
            icon: Settings2,
            iconClass:
              "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
          },
          {
            label: "Value format",
            value: "JSONB",
            detail: "Structured JSON values",
            icon: Braces,
            iconClass:
              "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
          },
          {
            label: "Last updated",
            value: "Today",
            detail: "9:42 AM · access_policy",
            icon: Clock3,
            iconClass:
              "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs sm:p-5 dark:border-gray-800 dark:bg-white/3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.detail}
                  </p>
                </div>
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)]">
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Settings keys</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Unique within this organization
                </p>
              </div>
              <button
                type="button"
                aria-label="More settings options"
                className="inline-flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <Ellipsis className="size-5" aria-hidden="true" />
              </button>
            </div>
            <label className="relative mt-4 block">
              <span className="sr-only">Search settings</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search setting keys"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-10 text-sm outline-none placeholder:text-gray-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </label>
          </div>

          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {settings.map((setting) => (
              <li key={setting.key}>
                <button
                  type="button"
                  aria-current={setting.selected ? "true" : undefined}
                  className={`w-full px-5 py-4 text-left transition ${
                    setting.selected
                      ? "bg-brand-50/70 dark:bg-brand-500/8"
                      : "hover:bg-gray-50 dark:hover:bg-white/3"
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <Code2
                          className={`size-4 shrink-0 ${
                            setting.selected
                              ? "text-brand-600 dark:text-brand-400"
                              : "text-gray-400"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="truncate font-mono text-sm font-medium">
                          {setting.key}
                        </span>
                      </span>
                      <span className="mt-1.5 block pl-6 text-xs text-gray-500 dark:text-gray-400">
                        {setting.description}
                      </span>
                    </span>
                    {setting.selected && (
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-400"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span className="mt-3 flex items-center justify-between pl-6 text-[11px] text-gray-400 dark:text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <FileJson2 className="size-3.5" aria-hidden="true" />
                      JSON value
                    </span>
                    <span>{setting.updated}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Showing 4 sample settings
          </div>
        </article>

        <div className="space-y-6">
          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                  <FileJson2 className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-mono text-sm font-semibold">
                      access_policy
                    </h2>
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                      JSONB
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Edit the value for Northstar Security.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="More actions for access_policy"
                className="inline-flex size-9 items-center justify-center self-end rounded-lg text-gray-500 hover:bg-gray-100 sm:self-auto dark:text-gray-400 dark:hover:bg-white/10"
              >
                <Ellipsis className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="setting-key"
                    className="text-sm font-medium"
                  >
                    Setting key <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">12 / 150</span>
                </div>
                <input
                  id="setting-key"
                  name="setting_key"
                  type="text"
                  defaultValue="access_policy"
                  required
                  maxLength={150}
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 font-mono text-sm text-gray-800 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Must be unique for this organization.
                </p>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="setting-value"
                    className="text-sm font-medium"
                  >
                    Setting value <span className="text-red-500">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Braces className="size-3.5" aria-hidden="true" />
                    JSON format
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#101828] focus-within:border-brand-500 focus-within:ring-3 focus-within:ring-brand-500/10 dark:border-gray-700">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-300">
                      <span className="size-2 rounded-full bg-violet-400" aria-hidden="true" />
                      value.json
                    </span>
                    <span className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                      JSON
                    </span>
                  </div>
                  <textarea
                    id="setting-value"
                    name="setting_value"
                    required
                    spellCheck={false}
                    defaultValue={settings[0].value}
                    rows={9}
                    aria-describedby="setting-value-help"
                    className="w-full resize-y border-0 bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-sky-100 outline-none placeholder:text-gray-500 focus:ring-0"
                  />
                </div>
                <p
                  id="setting-value-help"
                  className="mt-2 flex items-start gap-2 text-xs leading-5 text-gray-500 dark:text-gray-400"
                >
                  <Info
                    className="mt-0.5 size-3.5 shrink-0 text-brand-500"
                    aria-hidden="true"
                  />
                  Enter a valid JSON value. Use an object, array, string,
                  number, boolean, or null.
                </p>
              </div>

              <div className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:grid-cols-2 dark:border-gray-800 dark:bg-white/3">
                <div>
                  <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Created
                  </p>
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <Clock3 className="size-3.5 text-gray-400" aria-hidden="true" />
                    Nov 02, 2026 · 10:16 AM
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Last updated
                  </p>
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <Clock3 className="size-3.5 text-gray-400" aria-hidden="true" />
                    Today · 9:42 AM
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800 dark:bg-white/2">
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                Delete setting
              </button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Discard
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-600 px-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-700"
                >
                  <Check className="size-4" aria-hidden="true" />
                  Save changes
                </button>
              </div>
            </div>
          </article>

          <aside className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 dark:border-brand-500/20 dark:bg-brand-500/5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-theme-xs dark:bg-white/5 dark:text-brand-400">
              <Database className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">About organization settings</h2>
              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
                Each setting belongs to one organization. Keys are limited to
                150 characters and must be unique within that organization.
                Values are stored as JSONB. Creation and update timestamps are
                managed automatically.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
