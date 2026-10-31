"use client";

import React, { useState } from "react";
import Link from "next/link";

import AuthIcons from "@/components/auth/AuthIcons";
import BrandMark from "@/components/auth/BrandMark";
import TextField from "@/components/auth/TextField";

const { ShieldIcon, MailIcon, UserIcon, PhoneIcon, EyeIcon } = AuthIcons();

type FormFieldName =
  | "fullName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "terms";

type FieldErrors = Partial<Record<FormFieldName, string>>;

type Notice = { type: "error" | "info" | "success"; message: string };

function isFormFieldName(name: string): name is FormFieldName {
  return [
    "fullName",
    "email",
    "phone",
    "password",
    "confirmPassword",
    "terms",
  ].some((fieldName) => fieldName === name);
}

const Register = () => {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clearError = (name: FormFieldName) => {
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  };

  const handleSubmit = () => {
    console.log("handleSubmit from Login Page");
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f3f6f7] px-4 py-6 sm:px-6 sm:py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_-32px_rgba(15,35,48,0.28)] ring-1 ring-slate-900/5 lg:min-h-[700px] lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="relative isolate overflow-hidden bg-[#102a35] px-6 py-7 text-white sm:px-10 sm:py-9 lg:px-12 lg:py-11">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-36 -top-32 -z-10 size-[430px] rounded-full border border-teal-100/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-12 -z-10 size-[300px] rounded-full border border-teal-100/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-36 -left-36 -z-10 size-[420px] rounded-full bg-teal-400/10 blur-3xl"
          />

          <BrandMark compact />
          <div className="mt-8 max-w-sm sm:mt-12 lg:mt-20">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              Secure access, made clear
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                A safer way to
                <br />
                manage every gate.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">
              One secure place to oversee access and stay connected to the
              places that matter.
            </p>
          </div>

          <div className="mt-8 flex min-h-36 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:mt-12 lg:mt-16">
            <div className="flex w-full max-w-xs items-center justify-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-300/10 text-teal-200 ring-1 ring-inset ring-teal-200/15">
                <ShieldIcon className="size-7" />
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-teal-200/50 to-transparent" />
              <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <div className="grid grid-cols-2 gap-1">
                  <span className="size-2 rounded-sm bg-teal-200/90" />
                  <span className="size-2 rounded-sm bg-teal-200/45" />
                  <span className="size-2 rounded-sm bg-teal-200/45" />
                  <span className="size-2 rounded-sm bg-teal-200/90" />
                </div>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-teal-200/50 to-transparent" />
              <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-300 opacity-30 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-3 rounded-full bg-teal-300" />
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-300">
            <ShieldIcon className="size-4 text-teal-300" />
            <span>Designed for trusted access management</span>
          </div>
          <p className="mt-8 hidden text-xs text-slate-400 lg:block">
            Secure access starts with the right people.
          </p>
        </aside>

        <section className="flex items-center justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-12">
          <div className="w-full max-w-md">
            <div className="mb-7 lg:mb-8">
              <div className="mb-5 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="size-1.5 rounded-full bg-teal-600" />
                SMART GATE MONITORING
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">
                Create your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Set up your profile to get started.
              </p>
            </div>

            {notice && (
              <div
                aria-live="polite"
                className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-5 ${
                  notice.type === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : notice.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-sky-200 bg-sky-50 text-sky-800"
                }`}
                id={notice.type === "info" ? "forgot-password" : undefined}
                role={notice.type === "error" ? "alert" : "status"}
              >
                {notice.message}
              </div>
            )}

            <form
              className="space-y-4"
              noValidate
              onChange={(event) => {
                const target = event.target;
                if (
                  target instanceof HTMLInputElement &&
                  isFormFieldName(target.name)
                ) {
                  clearError(target.name);
                }
              }}
              onSubmit={handleSubmit}
            >
              
                <TextField
                  autoComplete="name"
                  error={errors.fullName}
                  icon={<UserIcon />}
                  id="fullName"
                  label="Full name"
                  name="fullName"
                  placeholder="Your full name"
                />
              
                <TextField
                  autoComplete="tel"
                  error={errors.phone}
                  icon={<PhoneIcon />}
                  id="phone"
                  inputMode="tel"
                  label="Phone number"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                />
             
              <TextField
                autoComplete={"new-password"}
                error={errors.password}
                icon={<ShieldIcon className="size-5" />}
                id="password"
                label="Password"
                name="password"
                onToggleVisibility={() =>
                  setShowPassword((current) => !current)
                }
                placeholder="Enter your password"
                type="password"
                visible={showPassword}
              />

           
                  <TextField
                    autoComplete="new-password"
                    error={errors.confirmPassword}
                    icon={<ShieldIcon className="size-5" />}
                    id="confirmPassword"
                    label="Confirm password"
                    name="confirmPassword"
                    onToggleVisibility={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    placeholder="Re-enter your password"
                    type="password"
                    visible={showConfirmPassword}
                  />
                  <p className="-mt-2 text-xs leading-5 text-slate-500">
                    Use at least 8 characters, including uppercase and lowercase
                    letters, a number, and a symbol.
                  </p>
               
                <div className="pt-1">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-slate-600">
                    <input
                      aria-describedby={
                        errors.terms ? "terms-error" : undefined
                      }
                      aria-invalid={Boolean(errors.terms)}
                      className="mt-0.5 size-4 shrink-0 rounded border-slate-300 accent-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                      id="terms"
                      name="terms"
                      onChange={() => clearError("terms")}
                      type="checkbox"
                    />
                    <span>
                      I agree to the{" "}
                      <span className="font-medium text-slate-800">
                        Terms and Conditions
                      </span>
                      .
                    </span>
                  </label>
                  {errors.terms && (
                    <p
                      className="mt-1.5 text-xs leading-5 text-rose-700"
                      id="terms-error"
                    >
                      {errors.terms}
                    </p>
                  )}
                </div>
              
              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#123b47] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_-8px_rgba(18,59,71,0.7)] transition duration-200 hover:bg-[#0d303a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting && (
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                  />
                )}

                {isSubmitting ? "Creating account..." : "Create account" }

              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?"{" "}
              <Link
                className="font-semibold text-teal-800 underline-offset-4 transition hover:text-teal-950 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                href={"/login"}
              >
                Sign in
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
              <ShieldIcon className="size-4" />
              <span>Your account details are handled securely.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;
