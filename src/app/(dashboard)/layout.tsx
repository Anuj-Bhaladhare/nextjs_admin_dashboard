import type { Metadata } from "next";
import type { ReactNode } from "react";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";


export const metadata: Metadata = {
  title: "Sign in | Smart Gate Monitoring",
  description: "Sign in to your Smart Gate Monitoring workspace.",
};

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {

  const session = await getCurrentUser();

  if ( !session ) {
    redirect("/login");
  }

  return (
    <> 
      { children } 
    </>
  );
}

export default DashboardLayout;
