"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Info,
  MapPin,
  Network,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type FormTab = "organization" | "department" | "branch";

const tabs: { id: FormTab; label: string; icon: LucideIcon }[] = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "department", label: "Department", icon: Network },
  { id: "branch", label: "Branch", icon: MapPin },
];

const inputClassName =
  "mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500";

const textareaClassName =
  "mt-2 w-full resize-y rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500";

function TextField({
  id,
  name,
  label,
  placeholder,
  required = false,
  maxLength,
  help,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  maxLength?: number;
  help?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`${inputClassName} ${id.endsWith("-code") ? "font-mono uppercase" : ""}`}
      />
      {help && (
        <p className="mt-1.5 text-xs leading-5 text-gray-500 dark:text-gray-400">
          {help}
        </p>
      )}
    </div>
  );
}

function DescriptionField({ id }: { id: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        Description{" "}
        <span className="font-normal text-gray-400">(optional)</span>
      </label>
      <textarea
        id={id}
        name="description"
        rows={4}
        placeholder="Add a short description to help identify this record."
        className={textareaClassName}
      />
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        Provide context for administrators and team members.
      </p>
    </div>
  );
}

function StatusField({ id }: { id: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        Status
      </label>
      <div className="relative">
        <select
          id={id}
          name="status"
          defaultValue="ACTIVE"
          className={`${inputClassName} appearance-none pr-10`}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        New records start active by default.
      </p>
    </div>
  );
}

function ParentOrganizationField({ id }: { id: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        Parent organization <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Building2
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <select
          id={id}
          name="organization_id"
          defaultValue="northstar"
          required
          className={`${inputClassName} appearance-none pr-10 pl-10`}
        >
          <option value="northstar">Northstar Security</option>
          <option value="harbor">Harbor Point Offices</option>
          <option value="redwood">Redwood Logistics</option>
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        Select which organization this record belongs to.
      </p>
    </div>
  );
}

function FormPanel({
  tab,
  hidden,
}: {
  tab: FormTab;
  hidden: boolean;
}) {
  const isOrganization = tab === "organization";
  const isDepartment = tab === "department";
  const title = isOrganization
    ? "Organization details"
    : isDepartment
      ? "Department details"
      : "Branch details";
  const description = isOrganization
    ? "Create a workspace with its own code and access status."
    : isDepartment
      ? "Add a department within an existing organization."
      : "Add a branch location and link it to an organization.";
  const Icon = isOrganization ? Building2 : isDepartment ? Network : MapPin;

  return (
    <div
      role="tabpanel"
      id={`${tab}-panel`}
      aria-labelledby={`${tab}-tab`}
      hidden={hidden}
      className={`${hidden ? "hidden" : "grid"} gap-6 xl:grid-cols-[minmax(0,1fr)_290px]`}
    >
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
        <div className="border-b border-gray-100 px-5 py-5 sm:px-7 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          {!isOrganization && (
            <ParentOrganizationField id={`${tab}-organization`} />
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id={`${tab}-name`}
              name="name"
              label={`${isOrganization ? "Organization" : isDepartment ? "Department" : "Branch"} name`}
              placeholder={
                isOrganization
                  ? "e.g. Northstar Security"
                  : isDepartment
                    ? "e.g. Facilities & Operations"
                    : "e.g. Downtown Campus"
              }
              required
              maxLength={isOrganization ? 200 : undefined}
              help={
                isOrganization
                  ? "Use the official name your team recognizes. Up to 200 characters."
                  : undefined
              }
            />
            <TextField
              id={`${tab}-code`}
              name="code"
              label={`${isOrganization ? "Organization" : isDepartment ? "Department" : "Branch"} code`}
              placeholder={
                isOrganization
                  ? "e.g. NORTHSTAR"
                  : isDepartment
                    ? "e.g. FACILITIES"
                    : "e.g. DOWNTOWN"
              }
              required
              maxLength={isOrganization ? 80 : undefined}
              help={
                isOrganization
                  ? "Must be unique. Up to 80 characters."
                  : "Use a short, recognizable code."
              }
            />
          </div>

          {tab === "branch" && (
            <div>
              <label htmlFor="branch-department" className="text-sm font-medium">
                Department{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <Network
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <select
                  id="branch-department"
                  name="department_id"
                  defaultValue=""
                  className={`${inputClassName} appearance-none pr-10 pl-10`}
                >
                  <option value="">Select a department</option>
                  <option value="facilities">Facilities &amp; Operations</option>
                  <option value="security">Security</option>
                  <option value="people">People &amp; Culture</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Optionally associate this branch with a department.
              </p>
            </div>
          )}

          <DescriptionField id={`${tab}-description`} />

          <div className="grid gap-5 sm:grid-cols-2">
            <StatusField id={`${tab}-status`} />
            {isOrganization && (
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium">
                    Unique code
                  </p>
                  <span
                    title="Organization codes are unique across organizations."
                    className="inline-flex text-gray-400"
                  >
                    <CircleHelp className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-2 flex min-h-11 items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/70 px-3.5 text-xs leading-5 text-gray-500 dark:border-gray-700 dark:bg-white/3 dark:text-gray-400">
                  <Info
                    className="size-4 shrink-0 text-brand-500"
                    aria-hidden="true"
                  />
                  Codes must be unique and are used to identify the organization.
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-gray-800 dark:bg-white/2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Save as draft
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-700"
            >
              <Check className="size-4" aria-hidden="true" />
              Create {isOrganization ? "organization" : isDepartment ? "department" : "branch"}
            </button>
          </div>
        </footer>
      </section>

      <aside className="space-y-4">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-sky-500 p-5 text-white">
            <div className="flex items-center gap-2 text-xs font-medium text-white/75">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {isOrganization ? "WORKSPACE SETUP" : "STRUCTURE PREVIEW"}
            </div>
            <div className="mt-5 flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/15">
              <Icon className="size-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">
              {isOrganization
                ? "Create a workspace"
                : isDepartment
                  ? "Organize your teams"
                  : "Add a new location"}
            </h2>
            <p className="mt-1 text-sm leading-5 text-white/75">
              {isOrganization
                ? "Set up an organization to manage access, members, and security settings."
                : isDepartment
                  ? "Group your teams under an organization for easier administration."
                  : "Keep branch locations connected to their organization."}
            </p>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                <Check className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Clear identification</p>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Use a recognizable name and a concise unique code.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Status control</p>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Choose the initial state for this record.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                <Clock3 className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Automatic timestamps</p>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Created and updated dates are managed automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4 dark:border-brand-500/20 dark:bg-brand-500/5">
          <div className="flex items-start gap-3">
            <Info
              className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-400"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-sm font-semibold">Need help?</h2>
              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
                You can edit names, descriptions, and status after creating a
                record.
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                View organization guide
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

export default function OrganizationFormsPage() {
  const [activeTab, setActiveTab] = useState<FormTab>("organization");

  return (
    <main className="mx-auto max-w-7xl space-y-6 text-gray-800 dark:text-white/90">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400">
            <Building2 className="size-4" aria-hidden="true" />
            Organization management
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Organization forms
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Set up an organization and its structure with consistent details
            and status controls.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
          <span className="size-1.5 rounded-full bg-gray-400" aria-hidden="true" />
          UI preview · No data is submitted
        </span>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
        <div
          role="tablist"
          aria-label="Organization form types"
          className="grid grid-cols-3 gap-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`${tab.id}-tab`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`${tab.id}-panel`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition sm:min-h-12 ${
                  isSelected
                    ? "bg-brand-50 text-brand-700 shadow-theme-xs dark:bg-brand-500/10 dark:text-brand-300"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tabs.map((tab) => (
        <FormPanel
          key={tab.id}
          tab={tab.id}
          hidden={activeTab !== tab.id}
        />
      ))}
    </main>
  );
}
