"use client";

import React, { type ReactNode } from "react";
import AuthIcons from "@/components/auth/AuthIcons";

const { EyeIcon } = AuthIcons();

type FormFieldName =
  | "fullName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "terms";

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

export default TextField;
