import { NextResponse } from "next/server";

const ProfileResponse = () => {

    const jsonResponse = (body: object, status = 200): NextResponse  => {
        return NextResponse.json(body, {
            status,
            headers: {  
                "Cache-Control": "no-store",
            },
        });
    }

    return [{ jsonResponse }] as const;

}

export default ProfileResponse;
