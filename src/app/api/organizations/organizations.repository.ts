import { getPostgresPool } from "@/lib/db/client";
import { OrganizationBody } from "./organizations.types";

const pool = getPostgresPool();

const OrganizationRepository = () => {
    const getOrganization = async (userId: string) => {
        try {
            const response = await pool.query(
                `
                    SELECT o.*
                    FROM core.organizations o
                    INNER JOIN core.user_organizations uo
                        ON uo.organization_id = o.id
                    WHERE uo.user_id = $1
                      AND uo.membership_status = 'ACTIVE'
                    ORDER BY o.created_at DESC;
                `,
                [userId]
            );

            return response?.rows ?? [];
        } catch (error) {
            throw error;
        }
    };

    const createOrganization = async (
        { name, code, description, status }: OrganizationBody,
        userId: string
    ) => {
        try {
            const response = await pool.query(
                `
                    INSERT INTO core.organizations
                        (name, code, description, status)
                    VALUES
                        ($1, $2, $3, $4)
                    RETURNING *;
                `,
                [name, code, description, status]
            );

            if (response?.rows?.length === 0 || response?.rowCount === 0) {
                return null;
            }

            const organization = response.rows[0];

            await pool.query(
                `
                    INSERT INTO core.user_organizations
                        (user_id, organization_id, membership_status)
                    VALUES
                        ($1, $2, 'ACTIVE')
                    ON CONFLICT (user_id, organization_id)
                    DO UPDATE SET
                        membership_status = 'ACTIVE',
                        joined_at = NOW(),
                        created_at = core.user_organizations.created_at;
                `,
                [userId, organization.id]
            );

            return organization;
        } catch (error) {
            throw error;
        }
    };

    return [{ getOrganization, createOrganization }];
};

export default OrganizationRepository;
