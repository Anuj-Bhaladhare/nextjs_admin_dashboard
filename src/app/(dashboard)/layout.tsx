import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/layout/app-layout/header";
import AppSidebar from "@/layout/app-layout/sidebar";


export const metadata: Metadata = {
  title: "Sign in | Smart Gate Monitoring",
  description: "Sign in to your Smart Gate Monitoring workspace.",
};

interface DashboardLayoutProps {
  children: ReactNode
}

async function DashboardAuth({
  children,
}: DashboardLayoutProps) {
  const session = await getCurrentUser();
  const messages = await getMessages();

  if ( !session ) {
    redirect("/login");
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <AppHeader />

          <div className="p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6">
            { children }
          </div>

        </SidebarInset>
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <DashboardAuth>{children}</DashboardAuth>
    </Suspense>
  );
}

export default DashboardLayout;
