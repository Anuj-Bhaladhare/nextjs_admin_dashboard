"use client";

import { SidebarHeader } from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";
import Image from "next/image";

interface AppSidebarHeaderProps {
  showContent: boolean;
}

export default function AppSidebarHeader({
  showContent,
}: AppSidebarHeaderProps) {
  return (
    <SidebarHeader className="px-5 py-8">
      <Link
        href="/"
        className={cn(
          "flex items-center",
          !showContent ? "justify-center" : "justify-start",
        )}
      >
        {showContent ? (
          <>
            <Image
              className="dark:hidden"
              src="/logo/logo.png"
              alt="Logo"
              width={150}
              height={40}
              priority
              style={{ width: "auto", height: "auto" }}
            />
            <Image
              className="hidden dark:block"
              src="/logo/logo.png"
              alt="Logo"
              width={150}
              height={40}
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </>
        ) : (
          <Image
            src="/logo/logo-icon.png"
            alt="Logo"
            width={40}
            height={40}
            priority
            style={{ width: "auto", height: "auto" }}
          />
        )}
      </Link>
    </SidebarHeader>
  );
}
