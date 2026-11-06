

import { Suspense } from "react";
import { requireRole } from "@/lib/auth/permissions";

async function AdminAuthorization({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading authorization...</div>}>
      <AdminAuthorization>{children}</AdminAuthorization>
    </Suspense>
  );
}
