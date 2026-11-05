import { getPostgresPool } from "@/lib/db/client";
import LoginResponse from "./login.response";

const [{ jsonResponse }]= LoginResponse();  
const pool = getPostgresPool();

const LoginRepository = () => {
    
    // Get User Details by Using email
    const getUserByEmail = async ( email: string ) => {
     
        try {

            const result = await pool.query(
                `
                    SELECT * FROM core.users WHERE email = $1;
                `, [email]
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

    const getUserRoleByUserID = async ( user_id: string ) => {
      
        try {

            const result = await pool.query(
                `
                    SELECT * FROM rbac.user_roles WHERE user_id = $1;
                `, [user_id]
            );

            if ( result.rowCount === 0 || result.rows[0].length === 0 ) {
                return jsonResponse (
                    { status: false, error: "User Role Junction Not Available" },
                    404
                )
            }

            return result.rows[0];

        } catch (error) {
            console.error("Internal Server Error", error);
            throw error;
        }
    }

    const getUserRoleByUserRoleID = async ( roles_id: string ) => {
  
        try {

            const result = await pool.query(
                `
                    SELECT * FROM rbac.roles WHERE id = $1;

                `, [roles_id]
            );

            if ( result.rowCount === 0 || result.rows[0].length === 0 ) {
                return jsonResponse (
                    { status: false, error: "User Role Not Available" },
                    404
                )
            }

            return result.rows[0];

        } catch (error) {
            console.error("Internal Server Error", error);
            throw error;
        }
    }

    const getOrganizationByOrganizationID = async ( organization_id: string ) => {
  
        try {

            const result = await pool.query(
                `
                    SELECT * FROM core.organizations WHERE id = $1;
                `, [organization_id]
            );

            if ( result.rowCount === 0 || result.rows[0].length === 0 ) {
                return jsonResponse (
                    { status: false, error: "User Organizations Not Available" },
                    404
                )
            }

            return result.rows[0];

        } catch (error) {
            console.error("Internal Server Error", error);
            throw error;
        }
    }

    return [{ getUserByEmail, getUserRoleByUserID, getUserRoleByUserRoleID, getOrganizationByOrganizationID }] as const;

}

export default LoginRepository;
