import { NextResponse } from "next/server";

export const jsonResponse = (body: object, status = 200): NextResponse  => {
    return NextResponse.json(body, {
        status,
        headers: {  
            "Cache-Control": "no-store",
        },
    });
}