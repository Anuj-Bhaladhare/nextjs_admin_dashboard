import { NextResponse } from "next/server";
import ProfileRepository from "./profile.repository";
import { ProfileBody } from "./profile.types";
import { getCurrentUser } from "@/lib/auth/session";
import { jsonResponse } from "@/app/api/jsonResponse";
const [{ getUserByUserId }] = ProfileRepository();
 

export const GET = async (request: Request): Promise<NextResponse> => {


    try {
     
        const session = await getCurrentUser();

        if ( !session && !session) {
            return jsonResponse(
                {
                    status: false,
                    message: "User Not Login, Please Login First..!"
                },
                404
            )
        }

        const profile = await getUserByUserId(session?.id);

        return jsonResponse(
            {
                status: true,
                data: profile,
                message: "User Profile Get Successfylly"
            },
            200
        )
        
    } catch (error) {
        throw error;
    }
}
