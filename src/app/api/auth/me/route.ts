import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { status: false, message: "Unauthorized." },
            {
                status: 401,
                headers: { "Cache-Control": "no-store" },
            },
        );
    }

    return NextResponse.json(
        { status: true, user },
        { headers: { "Cache-Control": "no-store" } },
    );
}