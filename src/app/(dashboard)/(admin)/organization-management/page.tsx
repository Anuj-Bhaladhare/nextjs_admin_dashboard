"use client";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Building2, CalendarDays, Check, ChevronDown, Clock3, Ellipsis, Mail, Pencil, Plus, Search, Settings2, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import useOrganizationManagement from "./hook";
// Redux State Management
import { useAppSelector } from "@/redux/hooks";
import {
    selectTotalOrganizations,
    selectActiveOrganizations,
    selectSuspendedOrganizations,
    selectInactiveOrganizations
} from "@/redux/slices/organization/organizationSelectors";


type OrganizationStatus = "Active" | "Inactive" | "Suspended";
type MemberStatus = "ACTIVE" | "INVITED" | "DISABLED" | "LOCKED";

const organizations = [
  {
    name: "Northstar Security",
    code: "NORTHSTAR",
    description: "Corporate security and access operations.",
    initials: "NS",
    avatarClass:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    status: "Active",
    members: 284,
    updated: "Today, 9:42 AM",
  },
  {
    name: "Harbor Point Offices",
    code: "HARBOR-PT",
    description: "Workplace access for Harbor Point locations.",
    initials: "HP",
    avatarClass:
      "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    status: "Active",
    members: 96,
    updated: "Yesterday",
  },
  {
    name: "Redwood Logistics",
    code: "REDWOOD",
    description: "Facility access and visitor management.",
    initials: "RL",
    avatarClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    status: "Suspended",
    members: 38,
    updated: "Nov 14, 2026",
  },
  {
    name: "Aster Labs",
    code: "ASTER-LABS",
    description: "Research campus access administration.",
    initials: "AL",
    avatarClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    status: "Inactive",
    members: 10,
    updated: "Nov 10, 2026",
  },
] as const;

const membershipStatistics = [
  { label: "Total members", value: "284" },
  { label: "Active members", value: "248" },
  { label: "Inactive members", value: "18" },
  { label: "Suspended members", value: "18" },
] as const;

const userStatistics = [
  { label: "Active users", value: "232" },
  { label: "Invited users", value: "30" },
  { label: "Disabled users", value: "14" },
  { label: "Locked users", value: "8" },
] as const;

const settings = [
  {
    key: "access_policy",
    value: "MFA required · 30-minute session",
    description: "Sign-in and session preferences",
  },
  {
    key: "visitor_access",
    value: "Enabled · Host approval required",
    description: "Visitor access preferences",
  },
  {
    key: "security_notifications",
    value: "Enabled · Email alerts",
    description: "Organization notification preferences",
  },
] as const;

const members = [
  {
    firstName: "Maya",
    lastName: "Chen",
    username: "maya.chen",
    email: "maya.chen@northstar.example",
    mobile: "+1 (415) 555-0132",
    status: "ACTIVE",
    emailVerified: true,
    lastLogin: "Today, 9:18 AM",
  },
  {
    firstName: "Ethan",
    lastName: "Brooks",
    username: "ethan.brooks",
    email: "ethan.brooks@northstar.example",
    mobile: "+1 (415) 555-0184",
    status: "INVITED",
    emailVerified: false,
    lastLogin: "Not signed in",
  },
  {
    firstName: "Olivia",
    lastName: "Patel",
    username: "olivia.patel",
    email: "olivia.patel@northstar.example",
    mobile: "+1 (415) 555-0198",
    status: "LOCKED",
    emailVerified: true,
    lastLogin: "Nov 16, 2026",
  },
] as const;

const organizationStatusStyles: Record<OrganizationStatus, string> = {
  Active: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  Inactive: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
  Suspended:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

const memberStatusStyles: Record<MemberStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  INVITED: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  DISABLED: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
  LOCKED: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

function OrganizationStatusBadge({
  status,
}: {
  status: OrganizationStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${organizationStatusStyles[status]}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          status === "Active"
            ? "bg-green-500"
            : status === "Suspended"
              ? "bg-amber-500"
              : "bg-gray-400"
        }`}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}

function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${memberStatusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function StatGroup({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: readonly { label: string; value: string }[];
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {description}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 dark:border-gray-800 dark:bg-white/3"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="mt-1.5 text-xl font-semibold tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function OrganizationManagementPage() {

  const [{ getOrganizations }] = useOrganizationManagement();

  // Enable Next Routing
  const router = useRouter();
  // Get Organization State
  const organization = useAppSelector( (state) => { return state.organization.organization });



  useEffect(() => {
    getOrganizations().catch((e) => {
      console.log(e);
    });

  }, [getOrganizations]);

  console.log("organization", organization);


  return (
    <main className="space-y-6 text-gray-800 dark:text-white/90">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Organization management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Manage organization profiles, status, settings, and member access
            from one place.
          </p>
        </div>
        <button
          type="button"
          onClick={ () => router.push('/organization-management/create-organization') }
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-700 sm:self-auto"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create organization
        </button>
      </header>

      <section
        aria-label="Organization totals"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
            label: "Organizations",
            value: organization.length ?? 0,
            detail: "Accessible to you",
            icon: Building2,
            iconClass:
              "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
          },
          {
            label: "Active",
            value: organization.filter( (item) => item.status === "ACTIVE").length ?? 0,
            detail: "Available for access",
            icon: ShieldCheck,
            iconClass:
              "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
          },
          {
            label: "Suspended",
            value: organization.filter( (item) => item.status === "SUSPENDED").length ?? 0,
            detail: "Temporarily restricted",
            icon: Clock3,
            iconClass:
              "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
          },
          {
            label: "Total members",
            value: "428",
            detail: "Across all organizations",
            icon: UsersRound,
            iconClass:
              "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
          },
        ].map((metric) => {
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
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {metric.detail}
              </p>
            </article>
          );
        })}
      </section>

      <section
        aria-labelledby="organizations-heading"
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3"
      >
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
          <div>
            <h2 id="organizations-heading" className="font-semibold">
              Organizations
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Browse organizations available to your account.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block sm:w-64">
              <span className="sr-only">Search organizations</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search name or code"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-10 text-sm outline-none placeholder:text-gray-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </label>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-between gap-6 rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              All statuses
              <ChevronDown className="size-4 text-gray-400" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-gray-50/80 text-xs font-medium tracking-wide text-gray-500 uppercase dark:bg-white/3 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-5 py-3.5 sm:px-6">
                  Organization
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Members
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Last updated
                </th>
                <th scope="col" className="px-5 py-3.5 text-right sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {organizations.map((organization) => (
                <tr
                  key={organization.code}
                  className="transition hover:bg-gray-50/70 dark:hover:bg-white/2"
                >
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${organization.avatarClass}`}
                      >
                        {organization.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {organization.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {organization.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium">
                      {organization.members}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <OrganizationStatusBadge status={organization.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {organization.updated}
                  </td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    <button
                      type="button"
                      aria-label={`More actions for ${organization.name}`}
                      className="inline-flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                    >
                      <Ellipsis className="size-5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800 dark:text-gray-400">
          <span>Showing 4 of 4 organizations</span>
          <button onClick={ () => router.push("/organization-management/organization-datatable") }>Organization</button>
          <span>Sample records · No live data loaded</span>
        </div>
      </section>

      <section
        aria-label="Selected organization details"
        className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="space-y-6">
          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
            <div className="border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                    NS
                  </span>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-brand-600 uppercase dark:text-brand-400">
                      Selected organization
                    </p>
                    <h2 className="mt-1 font-semibold">Northstar Security</h2>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  Edit
                </button>
              </div>
            </div>
            <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Organization code
                </p>
                <p className="mt-1.5 text-sm font-medium">NORTHSTAR</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Status
                </p>
                <div className="mt-1.5">
                  <OrganizationStatusBadge status="Active" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Description
                </p>
                <p className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Corporate security and access operations.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Created
                </p>
                <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CalendarDays
                    className="size-4 text-gray-400"
                    aria-hidden="true"
                  />
                  Aug 12, 2025
                </p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Last updated
                </p>
                <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock3 className="size-4 text-gray-400" aria-hidden="true" />
                  Today, 9:42 AM
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
                Deactivate
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 px-3 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10"
              >
                Suspend organization
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Settings2 className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">
                    Organization settings
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Saved as setting key/value pairs
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Edit settings
              </button>
            </div>
            <div className="divide-y divide-gray-100 px-5 sm:px-6 dark:divide-gray-800">
              {settings.map((setting) => (
                <div
                  key={setting.key}
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-mono text-xs font-medium text-gray-700 dark:text-gray-200">
                      {setting.key}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {setting.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 sm:text-right dark:text-gray-300">
                    <Check
                      className="size-3.5 shrink-0 text-green-600 dark:text-green-400"
                      aria-hidden="true"
                    />
                    {setting.value}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-white/3">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">Organization statistics</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Membership and account status breakdown.
                </p>
              </div>
              <UsersRound
                className="size-5 shrink-0 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-5">
              <StatGroup
                title="Membership status"
                description="Organization membership"
                data={membershipStatistics}
              />
              <StatGroup
                title="User account status"
                description="User account"
                data={userStatistics}
              />
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800">
              <div>
                <h2 className="font-semibold">Organization members</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  User contact, verification, and account details.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5 sm:self-auto"
              >
                <UsersRound className="size-3.5" aria-hidden="true" />
                View all members
              </button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {members.map((member) => (
                <div
                  key={member.email}
                  className="flex flex-col gap-3 px-5 py-4 sm:px-6 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                      <UserRound
                        className="size-4"
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        @{member.username} · {member.mobile}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-gray-500 dark:text-gray-400">
                        <Mail
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-[52px] md:pl-0">
                    <div className="flex items-center gap-2">
                      <MemberStatusBadge status={member.status} />
                      {member.emailVerified && (
                        <span className="text-[11px] text-green-700 dark:text-green-400">
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Clock3 className="size-3.5" aria-hidden="true" />
                      {member.lastLogin}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500 sm:px-6 dark:border-gray-800 dark:text-gray-400">
              Showing 3 sample members · 284 total
            </div>
          </article>
        </div>
      </section>
    </main>
  );

}
