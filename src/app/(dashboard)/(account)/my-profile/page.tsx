"use client";

import React, { useState, useEffect } from "react";


import { BadgeCheck, Building2, Clock3, DoorOpen, Fingerprint, Mail, MapPin, MonitorCheck, Phone, ShieldCheck, UserRound } from "lucide-react";

const profileDetails = [
    { label: "Full name", value: "Alex Morgan", icon: UserRound },
    { label: "Work email", value: "alex.morgan@securegate.example", icon: Mail },
    { label: "Phone number", value: "+91 98765 43210", icon: Phone },
    { label: "Department", value: "Security Operations", icon: Building2 },
    { label: "Location", value: "Mumbai, India", icon: MapPin },
    { label: "Employee ID", value: "SG-1042", icon: BadgeCheck }
] as const;

const locations = [
    { name: "Main Campus", detail: "Building A · 4 access points" },
    { name: "North Annex", detail: "Building B · 2 access points" },
] as const;

const recentActivity = [
    {
        title: "Signed in to the dashboard",
        detail: "Mumbai, India · Chrome on Windows",
        time: "Today, 9:42 AM",
        icon: MonitorCheck,
    },
    {
        title: "Two-step verification enabled",
        detail: "Your account security was updated",
        time: "Yesterday, 4:18 PM",
        icon: Fingerprint,
    },
    {
        title: "Access role assigned",
        detail: "Workspace administrator",
        time: "Oct 24, 2025",
        icon: ShieldCheck,
    },
] as const;

export default function MyProfilePage() {

    


    return (
        <main className="space-y-6 text-gray-800 dark:text-white/90">

            {/* Header Section */}
            <header>
                <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    Account
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                    My profile
                </h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Your personal information and workspace account overview.
                </p>
            </header>

            <section
                aria-label="Profile overview"
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3"
            >
                <div className="relative h-32 overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-sky-500 sm:h-40">
                <div
                    aria-hidden="true"
                    className="absolute -top-20 right-8 size-56 rounded-full border border-white/15 sm:right-24"
                />
                <div
                    aria-hidden="true"
                    className="absolute -top-12 right-20 size-40 rounded-full border border-white/15 sm:right-36"
                />
                <div
                    aria-hidden="true"
                    className="absolute -bottom-24 left-1/3 size-48 rounded-full bg-white/10 blur-2xl"
                />
                </div>

                <div className="px-5 pb-6 sm:px-7 sm:pb-7">
                    <div className="flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="-mt-11 flex size-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-brand-50 text-2xl font-semibold text-brand-700 shadow-theme-sm dark:border-gray-900 dark:bg-brand-500/15 dark:text-brand-300 sm:mt-0 sm:size-28">
                                AM
                            </div>
                            <div className="pb-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                        Alex Morgan
                                    </h2>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                        <span
                                            aria-hidden="true"
                                            className="size-1.5 rounded-full bg-green-500"
                                        />
                                            Active
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Workspace Administrator
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300 sm:self-end">
                            <BadgeCheck
                                className="size-4 text-brand-600 dark:text-brand-400"
                                aria-hidden="true"
                            />
                            <span>Member since Jan 2024</span>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-5 border-t border-gray-100 pt-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 dark:border-gray-800">
                        {
                            profileDetails.map((detail) => {
                                const Icon = detail.icon;

                                return (
                                    <div key={detail.label} className="flex min-w-0 items-start gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                                            <Icon className="size-4" aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                {detail.label}
                                            </p>
                                            <p className="mt-1 break-words text-sm font-medium">
                                                {detail.value}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
                
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section
                    aria-labelledby="security-heading"
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-white/3"
                >
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                            <ShieldCheck className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 id="security-heading" className="font-semibold">
                                Account security
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Your account protection at a glance.
                            </p>
                        </div>
                        <span className="ml-auto rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                            Protected
                        </span>
                    </div>

                    <div className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">
                        <div className="flex items-center justify-between gap-4 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <Fingerprint
                                    className="size-4 shrink-0 text-gray-400"
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className="text-sm font-medium">Two-step verification</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        An extra layer of account protection
                                    </p>
                                </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                Enabled
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <Clock3
                                    className="size-4 shrink-0 text-gray-400"
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className="text-sm font-medium">Last password update</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Keep your password up to date
                                    </p>
                                </div>
                            </div>
                            <span className="shrink-0 text-sm text-gray-600 dark:text-gray-300">
                                42 days ago
                            </span>
                        </div>
                    </div>
                </section>

                <section
                    aria-labelledby="locations-heading"
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-white/3"
                >
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                            <DoorOpen className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 id="locations-heading" className="font-semibold">
                                Assigned locations
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Sites included in your access scope.
                            </p>
                        </div>
                    </div>

                    <ul className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">
                        {locations.map((location) => (
                        <li
                            key={location.name}
                            className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                                <Building2 className="size-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{location.name}</p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {location.detail}
                                </p>
                            </div>
                        </li>
                        ))}
                    </ul>
                </section>
            </div>

            <section
                aria-labelledby="activity-heading"
                className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3"
            >
                <div className="border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
                    <h2 id="activity-heading" className="font-semibold">
                        Recent account activity
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        A quick look at recent changes to your account.
                    </p>
                </div>
                <ul className="divide-y divide-gray-100 px-5 sm:px-6 dark:divide-gray-800">
                    {recentActivity.map((activity) => {
                        const Icon = activity.icon;

                        return (
                            <li
                                key={activity.title}
                                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                                        <Icon className="size-4" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">{activity.title}</p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {activity.detail}
                                        </p>
                                    </div>
                                </div>
                                <span className="pl-12 text-xs text-gray-500 dark:text-gray-400 sm:shrink-0 sm:pl-0">
                                    {activity.time}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </section>

        </main>
    );
}
