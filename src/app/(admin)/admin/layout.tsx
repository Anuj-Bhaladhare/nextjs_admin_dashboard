

import { requireRole } from "@/lib/auth/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  return <>{children}</>;
}

