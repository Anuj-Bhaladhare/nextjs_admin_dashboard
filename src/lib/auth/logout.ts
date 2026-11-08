"use server";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "./cookie";
import { redirect } from "next/navigation";

export const logout = async () => {
    try {

        const cookieStore = await cookies();

        cookieStore.delete(ACCESS_TOKEN_COOKIE);

        redirect("/login");

    } catch (error) {
        throw error;
    }
}
