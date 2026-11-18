import { getPostgresPool } from "@/lib/db/client";
import { OrganizationData } from "./types";

const pool = getPostgresPool();

const OrganizationDetailsRepository = () => {
    const getOrganizationDetails = async ({ id }: { id: string }) => {
        try {
            const response = await pool.query(
                `
                    SELECT *
                    FROM core.organizations
                    WHERE id = $1;
                `,
                [id]
            );

            if (response?.rows?.length === 0 || response?.rowCount === 0) {
                return null;
            }

            return response.rows[0];
        } catch (error) {
            throw error;
        }
    };

    const updateOrganizationDetails = async ({
        id,
        name = null,
        code = null,
        description = null,
        status = null,
    }: OrganizationData) => {
        try {
            const response = await pool.query(
                `
                    UPDATE core.organizations
                    SET name = COALESCE($1, name),
                        code = COALESCE($2, code),
                        description = COALESCE($3, description),
                        status = COALESCE($4, status),
                        updated_at = NOW()
                    WHERE id = $5
                    RETURNING *;
                `,
                [name, code, description, status, id]
            );

            if (response?.rows?.length === 0 || response?.rowCount === 0) {
                return null;
            }

            return response.rows[0];
        } catch (error) {
            throw error;
        }
    };

    return [{ getOrganizationDetails, updateOrganizationDetails }];
};

export default OrganizationDetailsRepository;
