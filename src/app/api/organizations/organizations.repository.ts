import { getPostgresPool } from "@/lib/db/client";
import { jsonResponse } from "@/app/api/jsonResponse";
import { OrganizationBody } from "./organizations.types";

const pool = getPostgresPool();

const OrganizationRepository = () => {

    const getOrganization = async () => {
        try {

            const response = await pool.query(
                `SELECT * FROM core.organizations;`,
            );

            if ( response?.rows?.length === 0 || response?.rowCount === 0 ) {
                return jsonResponse(
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

    const createOrganization = async ({name, code, description, status}: OrganizationBody )  => {
        try {

            const response = await pool.query(
                `
                    INSERT INTO core.organizations
                        (name, code, description, status)
                    VALUES
                        ($1, $2, $3, $4)
                    RETURNING 
                        id;
                `, [name, code, description, status]
            );

            if ( response?.rows?.length === 0 || response?.rowCount === 0 ) {
                return jsonResponse(
                    {
                        status: false,
                        message: "Organization Not Create...!"
                    },
                    404
                );
            }

            return response?.rows;

        } catch (error) {
            throw error;
        }
    }


    return [{ getOrganization, createOrganization }];

}

export default OrganizationRepository;
