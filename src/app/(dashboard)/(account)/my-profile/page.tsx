"use client";

// import React, { useState, useEffect } from "react";
// import useMyProfileHook from "./hook";

import {
    CalendarDays,
    Clock3,
    FileText,
    Globe,
    Languages,
    Link2,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    SlidersHorizontal,
    UserRound,
    type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type ProfileSectionProps = {
    title: string;
    description: string;
    icon: LucideIcon;
    children: ReactNode;
};

type ProfileFieldProps = {
    label: string;
    value: string;
    icon: LucideIcon;
};

function ProfileSection({ title, description, icon: Icon, children }: ProfileSectionProps) {
    const headingId = `${title.toLowerCase().replaceAll(" ", "-")}-heading`;

    return (
        <section
            aria-labelledby={headingId}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-white/3"
        >
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                    <h2 id={headingId} className="font-semibold text-gray-800 dark:text-white/90">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                </div>
            </div>
            <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

function ProfileField({ label, value, icon: Icon }: ProfileFieldProps) {
    const isUnset = value === "Not provided";

    return (
        <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {label}
                </p>
                <p className={`mt-1 break-words text-sm ${isUnset ? "text-gray-400 dark:text-gray-500" : "font-medium text-gray-800 dark:text-white/90"}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

export default function MyProfilePage() {

    // const [{ getMyProfileDetails }] = useMyProfileHook();

    // useEffect( () => {

    //     getMyProfileDetails();

    // }, []);



    return (
        <main className="space-y-6 text-gray-800 dark:text-white/90">
            <header>
                <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    Account
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                    My profile
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    Review the personal details, contact information, and preferences saved to your profile.
                </p>
            </header>

            <section
                aria-label="Profile overview"
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3"
            >
                <div className="relative h-32 overflow-hidden bg-gradient-to-r from-brand-800 via-brand-600 to-sky-500 sm:h-40">
                    <div aria-hidden="true" className="absolute -top-20 right-8 size-56 rounded-full border border-white/15 sm:right-24" />
                    <div aria-hidden="true" className="absolute -top-12 right-20 size-40 rounded-full border border-white/15 sm:right-36" />
                    <div aria-hidden="true" className="absolute -bottom-24 left-1/3 size-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-4 left-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:left-7">
                        <span className="size-1.5 rounded-full bg-white/80" aria-hidden="true" />
                        Profile overview
                    </div>
                </div>

                <div className="px-5 pb-6 sm:px-7 sm:pb-7">
                    <div className="flex flex-col gap-4 sm:-mt-11 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div
                                aria-label="Profile photo not set"
                                className="-mt-10 flex size-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-brand-50 text-brand-600 shadow-theme-sm dark:border-gray-900 dark:bg-brand-500/15 dark:text-brand-300 sm:mt-0 sm:size-24"
                            >
                                <UserRound className="size-9" aria-hidden="true" />
                            </div>
                            <div className="pb-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                        Add your display name
                                    </h2>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                        <ShieldCheck className="size-3.5" aria-hidden="true" />
                                        Private profile
                                    </span>
                                </div>
                                <p className="mt-1 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                                    Add a short bio to tell others a little about you.
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 sm:pb-2">
                            Profile visibility is off by default
                        </p>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
                <ProfileSection
                    title="Profile"
                    description="Your name, introduction, and profile images."
                    icon={UserRound}
                >
                    <ProfileField label="Display name" value="Not provided" icon={UserRound} />
                    <ProfileField label="Bio" value="Not provided" icon={FileText} />
                    <ProfileField label="Avatar image" value="Not provided" icon={UserRound} />
                    <ProfileField label="Cover image" value="Not provided" icon={FileText} />
                </ProfileSection>

                <ProfileSection
                    title="Personal details"
                    description="Additional information about you."
                    icon={CalendarDays}
                >
                    <ProfileField label="Date of birth" value="Not provided" icon={CalendarDays} />
                    <ProfileField label="Gender" value="Not provided" icon={UserRound} />
                </ProfileSection>

                <ProfileSection
                    title="Contact and address"
                    description="Alternative ways to reach you and your location."
                    icon={MapPin}
                >
                    <ProfileField label="Alternate email" value="Not provided" icon={Mail} />
                    <ProfileField label="Alternate mobile" value="Not provided" icon={Phone} />
                    <ProfileField label="Address line 1" value="Not provided" icon={MapPin} />
                    <ProfileField label="Address line 2" value="Not provided" icon={MapPin} />
                    <ProfileField label="City" value="Not provided" icon={MapPin} />
                    <ProfileField label="State" value="Not provided" icon={MapPin} />
                    <ProfileField label="Country" value="Not provided" icon={Globe} />
                    <ProfileField label="Postal code" value="Not provided" icon={MapPin} />
                </ProfileSection>

                <div className="space-y-6">
                    <ProfileSection
                        title="Online presence"
                        description="Links to your website and social profiles."
                        icon={Link2}
                    >
                        <ProfileField label="Website" value="Not provided" icon={Globe} />
                        <ProfileField label="LinkedIn" value="Not provided" icon={Link2} />
                        <ProfileField label="Twitter / X" value="Not provided" icon={Link2} />
                    </ProfileSection>

                    <ProfileSection
                        title="Preferences and privacy"
                        description="Your regional settings and profile visibility."
                        icon={SlidersHorizontal}
                    >
                        <ProfileField label="Timezone" value="UTC" icon={Clock3} />
                        <ProfileField label="Locale" value="en" icon={Languages} />
                        <ProfileField label="Preferences" value="No custom preferences" icon={SlidersHorizontal} />
                        <ProfileField label="Visibility" value="Private" icon={ShieldCheck} />
                    </ProfileSection>
                </div>
            </div>

            <section
                aria-labelledby="record-heading"
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-white/3"
            >
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                        <Clock3 className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                        <h2 id="record-heading" className="font-semibold text-gray-800 dark:text-white/90">
                            Profile record
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Account reference and profile timestamps.
                        </p>
                    </div>
                </div>
                <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-3">
                    <ProfileField label="User ID" value="Linked to your account" icon={UserRound} />
                    <ProfileField label="Created" value="Not available" icon={CalendarDays} />
                    <ProfileField label="Last updated" value="Not available" icon={Clock3} />
                </div>
            </section>
        </main>
    );
}
