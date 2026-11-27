import { GetAllUsersParams, UsersList } from "./users.types";
import { getPostgresPool } from "@/lib/db/client";

const pool = getPostgresPool();

export const getAllUsersList = async ({
    page,
    limit,
    search,
    status,
    sortBy = "created_at",
    sortOrder = "desc"
}: GetAllUsersParams) => {
    const offset = (page - 1) * limit;

    // Allowed sorting columns
    const allowedSortFields: Record<string, string> = {
        first_name: "u.first_name",
        last_name: "u.last_name",
        username: "u.username",
        email: "u.email",
        created_at: "u.created_at"
    };

    const sortColumn =
        allowedSortFields[sortBy] || "u.created_at";

    const sortDirection =
        sortOrder === "asc" ? "ASC" : "DESC";

    // Dynamic WHERE conditions
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (search?.trim()) {
        values.push(`%${search.trim()}%`);

        conditions.push(`
            (
                u.first_name ILIKE $${values.length}
                OR u.last_name ILIKE $${values.length}
                OR u.username ILIKE $${values.length}
                OR u.email ILIKE $${values.length}
            )
        `);
    }

    if (status) {
        values.push(status);
        conditions.push(`u.status = $${values.length}`);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // Pagination parameters
    const limitIndex = values.length + 1;
    const offsetIndex = values.length + 2;

    values.push(limit, offset);

    const query = `
        SELECT
            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.username,
            u.email,
            u.mobile,
            u.status AS user_status,
            o.id AS organization_id,
            o.name AS organization_name,
            o.code AS organization_code,
            u.created_at

        FROM core.users u

        LEFT JOIN core.user_organizations uo
            ON u.id = uo.user_id

        LEFT JOIN core.organizations o
            ON uo.organization_id = o.id

        ${whereClause}

        ORDER BY ${sortColumn} ${sortDirection}

        LIMIT $${limitIndex}
        OFFSET $${offsetIndex};
    `;

    const response = await pool.query<UsersList>(
        query,
        values
    );

    return {
        status: true,
        users: response.rows,
        message: "Users retrieved successfully"
    };
};


export const createUser = async () => {
    try {
        
    } catch (error) {
        throw new Error("Error creating user: " + (error as Error).message);
    }
}

