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







// "use server";

// import relayservice from "@/axios/hook"
// import { redirect } from "next/navigation";

// interface LogoutBody {
//     status: boolean;
//     message: string;
// }

// export const logout = async () => {
//     try {

//         const response = await relayservice<LogoutBody>({
//             url: "/api/auth/logout",
//             method: "POST"
//         })

//         if ( !response?.data?.status ) {
//             throw new Error(response?.data?.message || "Logout failed.");
//         } 

//     } catch (error) {
//         throw error;
//     }

//     redirect("/login");

// }
