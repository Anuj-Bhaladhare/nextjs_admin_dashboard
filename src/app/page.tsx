import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

const HomeGuard = async () => {
    const user = await getCurrentUser();

    if (user) {
        redirect("/dashboard");
    }

    redirect("/login");
}

export default function HomePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeGuard />
        </Suspense>
    );
}
