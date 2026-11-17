import { getPostgresPool } from "@/lib/db/client";
import { jsonResponse } from "@/app/api/jsonResponse";
import { OrganizationData } from "./types";

const pool = getPostgresPool();

const OrganizationDetailsRepository = () => {

    const getOrganizationDetails = async ({id}: {id: string}) => {
        try {

            const response = await pool.query(
                `
                    SELECT * FROM 
                        core.organizations 
                    WHERE 
                        id=$1;
                `,[id]
            );

            if ( response?.rows?.length === 0 || response?.rowCount === 0 ) {
                return jsonResponse(
                    {
                        status: false,
                        message: `Organization of ${id} is Not Found...!`
                    },
                    404
                );
            } 

            return response?.rows;

        } catch (error) {
            throw error;
        }
    }

    const updateOrganizationDetails = async (
        { id, name = null, code = null, description = null, status = null }: OrganizationData 
    ) => {
        try {

            const response = await pool.query(
                `
                    UPDATE core.organizations
                    SET name = $1, code = $2, description = $3, status = $4
                    WHERE id=$5
                    RETURNING id;
                `,[name, code, description, status, id]
            );

            if ( response?.rows?.length === 0 || response?.rowCount === 0 ) {
                return jsonResponse(
                    {
                        status: false,
                        message: `Organization of ${id} is Not Found...!`
                    },
                    404
                );
            } 

            return response?.rows;

        } catch (error) {
            throw error;
        }
    }

    return [{ getOrganizationDetails, updateOrganizationDetails }];

}

export default OrganizationDetailsRepository;
