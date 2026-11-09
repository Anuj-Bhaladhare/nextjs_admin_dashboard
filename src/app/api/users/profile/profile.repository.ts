import { getPostgresPool } from "@/lib/db/client";
import LoginResponse from "./profile.response";

const [{ jsonResponse }]= LoginResponse();  
const pool = getPostgresPool();

const ProfileRepository = () => {
    
    // Get User Details by Using email
    const getUserById = async ( user_id: string ) => {
     
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

            return result.rows[0];

        } catch (error) {
            console.error("Internal Server Error", error);
            throw error;
        }
    } 

    return [{ getUserById }] as const;

}

export default ProfileRepository;
