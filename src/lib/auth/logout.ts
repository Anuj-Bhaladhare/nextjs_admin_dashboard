"use server";

import { cookies } from "next/headers";
import relayservice from "@/axios/hook";
import { redirect } from "next/navigation";

export const logout = async () => {
    const cookieStore = await cookies();

    try {
        await relayservice({
            url: "/api/auth/logout",
            method: "POST",
            headers: {
                Cookie: cookieStore.toString(),
            },
        });
    } finally {
        cookieStore.delete("access_token");
    }

    redirect("/login");
};
