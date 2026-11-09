import { getPostgresPool } from "@/lib/db/client";
import { jsonResponse } from "@/app/api/jsonResponse";

const pool = getPostgresPool();

const ProfileRepository = () => {
    
    // Get User Details by Using email
    const getUserByUserId = async ( user_id: string ) => {
     
        try {

            const result = await pool.query(
                `
                    SELECT * FROM core.users WHERE id = $1;
                `, [user_id]
            );

            if ( result.rowCount === 0 || result.rows[0].length === 0 ) {
                return jsonResponse (
                    { status: false, error: "User Not Available" },
                    404
                )
            }

            const profile_data = {
                id: result?.rows[0]?.id,
                first_name: result?.rows[0]?.first_name,
                last_name: result?.rows[0]?.last_name,
                username: result?.rows[0]?.username,
                email: result?.rows[0]?.email,
                mobile: result?.rows[0]?.mobile,
                status: result?.rows[0]?.status,
                email_verified_at: result?.rows[0]?.email_verified_at,
                mobile_verified_at: result?.rows[0]?.mobile_verified_at,
                failed_login_attempts: result?.rows[0]?.failed_login_attempts,
                locked_until: result?.rows[0]?.locked_until,
                last_login_at: result?.rows[0]?.last_login_at,
                created_by: result?.rows[0]?.created_by,
                updated_by: result?.rows[0]?.updated_by,
                created_at: result?.rows[0]?.created_at,
                updated_at: result?.rows[0]?.updated_at
            }

            return profile_data;

        } catch (error) {
            console.error("Internal Server Error", error);
            throw error;
        }
    } 

    return [{ getUserByUserId }] as const;

}

export default ProfileRepository;
