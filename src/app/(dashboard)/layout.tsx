import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign in | Smart Gate Monitoring",
  description: "Sign in to your Smart Gate Monitoring workspace.",
};

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div> { children } </div>
  );
}

export default DashboardLayout;