import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { getAllUsersList } from "./users.repository";


// List all system users
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - User Management - Super Admin
 *     summary: List all system users
 *     description: Lists system-wide user accounts. Reserved for ADMIN and SUPER_ADMIN users.
 *     operationId: listGlobalUsers
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of users to return.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for matching users.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter users by account status.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: User field to sort by.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction.
 *     responses:
 *       '200':
 *         description: System users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *       '401':
 *         description: Authentication is required.
 *       '403':
 *         description: The authenticated user does not have permission to manage global users.
 *       '500':
 *         description: An unexpected server error occurred.
 */
export const GET = async (
    request: NextRequest
): Promise<NextResponse> => {
    try {

        // 1. Authentication check
        const user = await getCurrentUser();
        if (!user) {
            return jsonResponse({ status: false, message: "Unauthorized." }, 401);
        }

        // 2. Authorization check
        if (!["ADMIN", "SUPER ADMIN"].includes(user.role)) {
            return jsonResponse(
                {
                    status: false,
                    message: "Forbidden. You do not have permission to manage global users."
                }, 
                403
            )
        }

        // 3. Read query parameters
        const searchParams = request.nextUrl.searchParams;

        const page = Math.max(
            1,
            Number(searchParams.get("page")) || 1
        );

        const limit = Math.min(
            100,
            Math.max(
                1,
                Number(searchParams.get("limit")) || 10
            )
        );

        const search = searchParams.get("search") || undefined;
        const status = searchParams.get("status") || undefined;

        const sortBy = searchParams.get("sortBy") || "created_at";

        const sortOrder =
            searchParams.get("sortOrder") === "asc"
                ? "asc"
                : "desc";

        // 4. Fetch users
        const result = await getAllUsersList({
            page,
            limit,
            search,
            status,
            sortBy,
            sortOrder
        });

        // 5. Return response
        return jsonResponse(
            {
                status: true,
                message: result.message,
                data: result.users
            },
            200
        );

    } catch (error) {
        console.error("Get all users failed:", error);

        return jsonResponse(
            {
                status: false,
                message: "Internal Server Error"
            },
            500
        );
    }
};



// 	Create a global user
/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     tags:
 *       - User Management - Super Admin
 *     summary: Create a global user
 *     description: Creates a user account with system-wide scope. Reserved for ADMIN and SUPER_ADMIN users.
 *     operationId: createGlobalUser
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             description: User account fields to create.
 *     responses:
 *       '201':
 *         description: Global user created successfully.
 *       '400':
 *         description: The request body is invalid.
 *       '401':
 *         description: Authentication is required.
 *       '403':
 *         description: The authenticated user does not have permission to manage global users.
 *       '500':
 *         description: An unexpected server error occurred.
 */
export const POST = async( 
    request: NextRequest 
): Promise<NextResponse> => {
    try {
        
        // 1. Authentication check
        const user = await getCurrentUser();
        if (!user) {
            return jsonResponse({ status: false, message: "Unauthorized." }, 401);
        }

        // 2. Authorization check
        if (!["ADMIN", "SUPER ADMIN"].includes(user.role)) {
            return jsonResponse(
                {
                    status: false,
                    message: "Forbidden. You do not have permission to manage global users."
                }, 
                403
            )
        }

        // 3. Read request body
        const requestBody = await request.json();

        // 4. Validate request body
        if (!requestBody || typeof requestBody !== "object") {
            return jsonResponse(
                { status: false, message: "Invalid request body." },
                400
            );
        }

        // 5. Create user logic here (not implemented in this snippet)
        // For example, you might call a function like createUser(requestBody)

        // 6. Return success response
        return jsonResponse(
            {
                status: true,
                message: "Global user created successfully."
            },
            201
        );

    } catch (error) {
        console.error("Login failed:", error);
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
            },
            500
        );
    }
} 



// Importand Note 
// create user wala API banana hai ok ->  POST: /api/admin/users
 

INSERT INTO core.users
    (first_name, last_name, username, email, mobile, password_hash)
VALUES
    ('name', 'surname', 'name_surname', 'namesurname@gmail.com', '9999999999', '12345678952sd54fs3d5f1s6d3s5d1fs356');


INSERT INTO core.organizations
    (name, code, description)
VALUES
    ('Indian Force Security Services', 'IFSS-GROUP-00001', 'IFSS delivers integrated security and facility management solutions that merge security personnel, technology');
    

INSERT INTO core.user_organizations
    (user_id, organization_id)
VALUES
    ('db5c8931-d63f-4cad-9987-620ae86ba3ad', '29478c66-9833-47f8-be4b-75642c5991d8');


UPDATE rbac.roles
SET organization_id = '29478c66-9833-47f8-be4b-75642c5991d8'
WHERE id = 'b10a232c-90ec-44f2-8c8d-88c0c52c6ed5';


INSERT INTO rbac.user_roles
    (user_id, role_id, organization_id , assigned_by)
VALUES
    ('db5c8931-d63f-4cad-9987-620ae86ba3ad', 'b10a232c-90ec-44f2-8c8d-88c0c52c6ed5', '29478c66-9833-47f8-be4b-75642c5991d8', 'db5c8931-d63f-4cad-9987-620ae86ba3ad');
    
