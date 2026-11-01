import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign in | Smart Gate Monitoring",
  description: "Sign in to your Smart Gate Monitoring workspace.",
};

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div> { children } </div>
  );
}

export default AdminLayout;