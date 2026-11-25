"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Notice = {
  type: "error" | "success";
  message: string;
};

type ResetPasswordFormProps = {
  token: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getMessage(value: unknown, key: "error" | "message"): string | null {
  const message = isRecord(value) ? value[key] : undefined;
  return typeof message === "string" ? message : null;
}

export default function ResetPasswordForm({
  token,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname,
      );
    }
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setNotice({
          type: "error",
          message:
            getMessage(payload, "error") ??
            "Unable to reset your password. Please try again.",
        });
        return;
      }

      setNotice({
        type: "success",
        message:
          getMessage(payload, "message") ?? "Password reset successfully.",
      });
      setPassword("");
      setConfirmPassword("");
    } catch {
      setNotice({
        type: "error",
        message: "Unable to connect. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f6f7] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          Smart Gate Monitoring
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Set a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose a password with at least 8 characters.
        </p>

        {notice && (
          <div
            aria-live="polite"
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
              notice.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
            role={notice.type === "error" ? "alert" : "status"}
          >
            {notice.message}
          </div>
        )}

        {notice?.type !== "success" &&
          (token ? (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="password"
                >
                  New password
                </label>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                  id="password"
                  minLength={8}
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="confirmPassword"
                >
                  Confirm new password
                </label>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                  id="confirmPassword"
                  minLength={8}
                  name="confirmPassword"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>
              <button
                className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </form>
          ) : (
            <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              This reset link is missing or invalid. Request a new one to
              continue.
            </p>
          ))}

        <p className="mt-6 text-center text-sm text-slate-600">
          {notice?.type === "success" ? (
            <Link
              className="font-medium text-teal-700 hover:text-teal-800"
              href="/login"
            >
              Return to sign in
            </Link>
          ) : (
            <Link
              className="font-medium text-teal-700 hover:text-teal-800"
              href="/forgot-password"
            >
              Request another reset link
            </Link>
          )}
        </p>
      </section>
    </main>
  );
}
