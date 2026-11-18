import {
  ArrowLeft,
  Building2,
  Check,
  CircleHelp,
  Clock3,
  Info,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const fieldClassName =
  "mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500";

const statusOptions = [
  {
    value: "ACTIVE",
    label: "Active",
    description: "Organization is ready to use.",
    dot: "bg-green-500",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    description: "Keep it unavailable for now.",
    dot: "bg-gray-400",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
    description: "Temporarily restrict access.",
    dot: "bg-amber-500",
  },
] as const;

export default function CreateOrganizationPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 text-gray-800 dark:text-white/90">
      <header className="space-y-4">
        <Link
          href="/organization-management"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to organizations
        </Link>
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400">
            <Building2 className="size-4" aria-hidden="true" />
            Organization management
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Create organization
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Add an organization workspace and choose its initial access status.
            You can update these details later.
          </p>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
          <section
            aria-labelledby="organization-details-heading"
            className="p-5 sm:p-7"
          >
            <div className="mb-6 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="organization-details-heading"
                  className="font-semibold"
                >
                  Organization details
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter the identifying information for this organization.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="organization-name"
                  className="text-sm font-medium"
                >
                  Organization name <span className="text-red-500">*</span>
                </label>
                <input
                  id="organization-name"
                  name="name"
                  type="text"
                  required
                  maxLength={200}
                  autoComplete="organization"
                  placeholder="e.g. Northstar Security"
                  className={fieldClassName}
                />
                <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>Use the official name your team recognizes.</span>
                  <span className="shrink-0">Up to 200 characters</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <label
                    htmlFor="organization-code"
                    className="text-sm font-medium"
                  >
                    Organization code <span className="text-red-500">*</span>
                  </label>
                  <span
                    title="Organization codes must be unique."
                    className="inline-flex text-gray-400"
                  >
                    <CircleHelp className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
                <input
                  id="organization-code"
                  name="code"
                  type="text"
                  required
                  maxLength={80}
                  autoCapitalize="characters"
                  placeholder="e.g. NORTHSTAR"
                  className={`${fieldClassName} font-mono uppercase`}
                  aria-describedby="organization-code-help"
                />
                <p
                  id="organization-code-help"
                  className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
                >
                  Use a unique short code. It can contain up to 80 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="organization-description"
                  className="text-sm font-medium"
                >
                  Description{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="organization-description"
                  name="description"
                  rows={4}
                  placeholder="Briefly describe this organization and how it will be used."
                  className="mt-2 w-full resize-y rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Add context to help administrators identify this workspace.
                </p>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="initial-status-heading"
            className="border-t border-gray-100 p-5 sm:p-7 dark:border-gray-800"
          >
            <div className="mb-5 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="initial-status-heading" className="font-semibold">
                  Initial status
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose whether this organization is available immediately.
                </p>
              </div>
            </div>

            <fieldset>
              <legend className="sr-only">Organization status</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`group relative flex min-h-28 cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50/60 has-[:checked]:ring-1 has-[:checked]:ring-brand-200 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-brand-500/20 dark:border-gray-700 dark:bg-transparent dark:hover:border-gray-600 dark:has-[:checked]:border-brand-500/40 dark:has-[:checked]:bg-brand-500/5 dark:has-[:checked]:ring-brand-500/20`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      defaultChecked={option.value === "ACTIVE"}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold">
                        <span
                          className={`size-2 rounded-full ${option.dot}`}
                          aria-hidden="true"
                        />
                        {option.label}
                      </span>
                      <Check
                        className="size-4 text-brand-600 opacity-0 transition group-has-[:checked]:opacity-100 dark:text-brand-400"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {option.description}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              <Info className="mt-0.5 size-3.5 shrink-0 text-brand-500" aria-hidden="true" />
              New organizations default to Active. You can deactivate or
              suspend them later.
            </p>
          </section>

          <footer className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-gray-800 dark:bg-white/2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Link
                href="/organization-management"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Cancel
              </Link>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-700"
              >
                <Building2 className="size-4" aria-hidden="true" />
                Create organization
              </button>
            </div>
          </footer>
        </form>

        <aside className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
            <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-sky-500 px-5 py-5 text-white">
              <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                <Sparkles className="size-3.5" aria-hidden="true" />
                WORKSPACE PREVIEW
              </div>
              <div className="mt-5 flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/15 backdrop-blur">
                <Building2 className="size-6" aria-hidden="true" />
              </div>
              <p className="mt-4 text-lg font-semibold">Your organization</p>
              <p className="mt-1 text-sm text-white/75">
                Details will appear here after setup.
              </p>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                  <KeyRound className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Unique code
                  </p>
                  <p className="mt-1 text-sm">
                    Used to identify the organization.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Status control
                  </p>
                  <p className="mt-1 text-sm">
                    Start active or choose a restricted status.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                  <Clock3 className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Automatic timestamps
                  </p>
                  <p className="mt-1 text-sm">
                    Created and updated dates are managed automatically.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-100 bg-brand-50/70 p-5 dark:border-brand-500/20 dark:bg-brand-500/5">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-theme-xs dark:bg-white/5 dark:text-brand-400">
                <Info className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Before you create</h2>
                <p className="mt-1.5 text-xs leading-5 text-gray-600 dark:text-gray-300">
                  Organization codes must be unique. Check with your team
                  before choosing a code that may already be in use.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
