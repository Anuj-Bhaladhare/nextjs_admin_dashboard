
"use client";

import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingComp = ({
  message = "Loading...",
  fullScreen = false,
}: LoadingProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "min-h-screen" : "min-h-[200px]"
      }`}
    >
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />

      <p className="text-sm font-medium text-gray-500">
        {message}
      </p>
    </div>
  );
}

export default LoadingComp;
