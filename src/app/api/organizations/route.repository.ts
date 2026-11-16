import { getPostgresPool } from "@/lib/db/client";
import { jsonResponse } from "@/app/api/jsonResponse";

const pool = getPostgresPool();

const OrganizationRepository = () => {

    const getOrganization = async () => {
        try {

            const response = await pool.query(
                `SELECT * FROM core.organizations;`,
            );

            if ( response?.rows?.length === 0 || response?.rowCount === 0 ) {
                jsonResponse(
                    {
                        status: false,
                        message: "Organization List is Not Found...!"
                    },
                    404
                );
            } 

            return response?.rows;

        } catch (error) {
            throw error;
        }
    }

    return [{ getOrganization }];

}

export default OrganizationRepository;
