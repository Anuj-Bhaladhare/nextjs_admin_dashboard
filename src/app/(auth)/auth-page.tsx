"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";

type AuthMode = "login" | "register";
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

function validateForm(mode: AuthMode, formData: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (
    mode === "register" &&
    (password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^A-Za-z0-9\s]/.test(password))
  ) {
    errors.password =
      "Use at least 8 characters with uppercase and lowercase letters, a number, and a symbol.";
  }

  if (mode === "register") {
    const fullName = String(formData.get("fullName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (fullName.length < 2) {
      errors.fullName = "Enter your full name.";
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      errors.phone = "Enter a valid phone number.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (formData.get("terms") !== "on") {
      errors.terms = "You must agree to the Terms and Conditions.";
    }
  }

  return errors;
}

async function submitAuthentication(
  mode: AuthMode,
  formData: FormData,
): Promise<{ message: string }> {
  const action = mode === "register" ? "create an account" : "sign in";
  if (!String(formData.get("email") ?? "").trim()) {
    throw new Error("Enter your email address to continue.");
  }

  throw new Error(
    `We cannot ${action} yet because authentication is not configured. Your information has not been sent.`,
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 3 19 6v5.5c0 4.4-2.8 7.8-7 9.5-4.2-1.7-7-5.1-7-9.5V6l7-3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <rect
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        width="15"
        x="2.5"
        y="4"
      />
      <path
        d="m3.5 5.5 6.5 5 6.5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <circle
        cx="10"
        cy="6.25"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.5 17c.5-3.1 2.9-4.75 6.5-4.75s6 1.65 6.5 4.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path
        d="M6.1 2.75h2.1l1 3.4-1.5 1.4a12 12 0 0 0 4.75 4.75l1.4-1.5 3.4 1v2.1a2 2 0 0 1-2.2 2.05A13.25 13.25 0 0 1 4.05 5a2 2 0 0 1 2.05-2.25Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path
        d="M2.5 10s2.7-4.5 7.5-4.5 7.5 4.5 7.5 4.5-2.7 4.5-7.5 4.5S2.5 10 2.5 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      {visible ? (
        <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
      ) : (
        <path
          d="m4 16 12-12"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}

function TextField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  icon,
  error,
  inputMode,
  visible,
  onToggleVisibility,
}: {
  id: FormFieldName;
  name: FormFieldName;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete: string;
  icon: ReactNode;
  error?: string;
  inputMode?: "email" | "tel" | "text";
  visible?: boolean;
  onToggleVisibility?: () => void;
}) {
  const inputType = type === "password" && visible ? "text" : type;

  return (
    <div className="space-y-1.5">
      <label
        className="block text-sm font-medium text-slate-700"
        htmlFor={id}
      >
        {label}
      </label>
      <div
        className={`group flex h-12 items-center gap-3 rounded-xl border bg-white px-3.5 transition duration-200 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-600/10 ${
          error ? "border-rose-400" : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className="h-5 w-5 shrink-0 text-slate-400">{icon}</span>
        <input
          autoComplete={autoComplete}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          id={id}
          inputMode={inputMode}
          name={name}
          placeholder={placeholder}
          type={inputType}
        />
        {onToggleVisibility && (
          <button
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={visible}
            className="rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            onClick={onToggleVisibility}
            type="button"
          >
            <span className="block h-5 w-5">
              <EyeIcon visible={Boolean(visible)} />
            </span>
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs leading-5 text-rose-700" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-200 ring-1 ring-inset ring-teal-200/20">
        <ShieldIcon className="size-6" />
      </div>
      <div>
        <p className="text-sm font-semibold tracking-wide text-white">
          Smart Gate
        </p>
        {!compact && (
          <p className="text-xs tracking-wide text-slate-300">
            Monitoring
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formErrors = validateForm(mode, formData);
    setErrors(formErrors);
    setNotice(null);

    const fieldOrder: FormFieldName[] = isRegister
      ? ["fullName", "email", "phone", "password", "confirmPassword", "terms"]
      : ["email", "password"];
    const firstInvalidField = fieldOrder.find((field) => formErrors[field]);
    if (firstInvalidField) {
      document.getElementById(firstInvalidField)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitAuthentication(mode, formData);
      setNotice({ type: "success", message: result.message });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not process your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              {isRegister ? (
                <>
                  A safer way to
                  <br />
                  manage every gate.
                </>
              ) : (
                <>
                  Your gates.
                  <br />
                  Always in view.
                </>
              )}
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
                {isRegister ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isRegister
                  ? "Set up your profile to get started."
                  : "Sign in to continue to your secure workspace."}
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
              {isRegister && (
                <TextField
                  autoComplete="name"
                  error={errors.fullName}
                  icon={<UserIcon />}
                  id="fullName"
                  label="Full name"
                  name="fullName"
                  placeholder="Your full name"
                />
              )}

              <TextField
                autoComplete="email"
                error={errors.email}
                icon={<MailIcon />}
                id="email"
                inputMode="email"
                label="Email address"
                name="email"
                placeholder="you@company.com"
                type="email"
              />

              {isRegister && (
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
              )}

              <TextField
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
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

              {isRegister && (
                <>
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
                    Use at least 8 characters, including uppercase and
                    lowercase letters, a number, and a symbol.
                  </p>
                </>
              )}

              {isRegister ? (
                <div className="pt-1">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-slate-600">
                    <input
                      aria-describedby={errors.terms ? "terms-error" : undefined}
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
              ) : (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                    <input
                      className="size-4 rounded border-slate-300 accent-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                      name="rememberMe"
                      type="checkbox"
                    />
                    Remember me
                  </label>
                  <a
                    href="#forgot-password"
                    className="rounded text-sm font-medium text-teal-800 underline-offset-4 transition hover:text-teal-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                    onClick={() =>
                      setNotice({
                        type: "info",
                        message:
                          "Password recovery is not available yet. Please contact your system administrator.",
                      })
                    }
                  >
                    Forgot password?
                  </a>
                </div>
              )}

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
                {isSubmitting
                  ? isRegister
                    ? "Creating account..."
                    : "Signing in..."
                  : isRegister
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              {isRegister ? "Already have an account?" : "New to Smart Gate?"}{" "}
              <Link
                className="font-semibold text-teal-800 underline-offset-4 transition hover:text-teal-950 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                href={isRegister ? "/login" : "/register"}
              >
                {isRegister ? "Sign in" : "Create an account"}
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
}
