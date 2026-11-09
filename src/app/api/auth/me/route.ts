import { jsonResponse } from "@/app/api/jsonResponse";
import MeRepository from "./me.repository"
import { getCurrentUser } from "@/lib/auth/session";

const [{ getUserByUserId }] = MeRepository();

export async function GET() {

    const user = await getCurrentUser();
    if (!user) {
        return jsonResponse(
            { 
                status: false, 
                message: "Unauthorized." 
            },
            401
        );
    }

    const userProfile = await getUserByUserId(user?.id);

    return userProfile ? 
        jsonResponse(
            { 
                status: true, 
                message: "User Profile get Successfylly",
                user: {
                    ...userProfile,
                    role: user.role,
                    organization_id: user.organization_id,
                    session_id: user.sessionId,
                    role_id: user.roleId
                }
            },
            200
        ) :
        jsonResponse(
            { 
                status: false, 
                message: "Unauthorized." 
            },
            401
        );
}
