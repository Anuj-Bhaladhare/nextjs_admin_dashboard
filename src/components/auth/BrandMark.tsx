"use client";

import React from "react";
import AuthIcons from "@/components/auth/AuthIcons";

const { ShieldIcon } = AuthIcons();

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

export default BrandMark;
