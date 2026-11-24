import { Suspense } from "react";

import ResetPasswordForm from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f3f6f7] px-4 py-10">
          <p className="text-sm text-slate-600">Loading reset link...</p>
        </main>
      }
    >
      <ResetPasswordPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPasswordPageContent({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;
  const resetToken = Array.isArray(token) ? token[0] ?? "" : token ?? "";

  return <ResetPasswordForm token={resetToken} />;
}
