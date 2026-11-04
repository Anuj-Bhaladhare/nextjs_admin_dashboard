import bcrypt from "bcryptjs" 
import { NextResponse } from "next/server";
import { getPostgresPool } from "@/lib/db/client";
 
interface LoginBody {
    email: string;
    password: string;
}   


const jsonResponse = (body: object, status = 200): NextResponse  => {
    return NextResponse.json(body, {
        status,
        headers: {  
            "Cache-Control": "no-store",
        },
    });
}


export const POST = async (request: Request): Promise<NextResponse> => {
    try {

        let body: LoginBody;

        try {
            body = await request.json();
        } catch (error) {
            return jsonResponse(
                { 
                    status: false,
                    error: "Request body must be valid JSON." 
                },
                400,
            );
        }

        const { email, password } = body;

        if (typeof email !== "string" || typeof password !== "string" ) {
            return jsonResponse(
                { 
                    status: false,
                    error: "Email, password and confirm password are required."
                },
                400
            )
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Validate email
        const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if ( !normalizedEmail || normalizedEmail.length > 255 || !EMAIL_PATTERN.test(normalizedEmail)) {
            return jsonResponse (
                { status: false, error: "Please provide a valid email address." },
                400
            )
        }
        

        // Validate Password
        if (password.length < 8) {
            return jsonResponse(
                { error: "Password must be at least 8 characters long." },
                400
            )
        }

        // check user available in Database
        const pool = getPostgresPool();
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

        // compair password
        const compairPassword = await bcrypt.compare(password, result.rows[0].password_hash);
        if (!compairPassword) {
            return jsonResponse (
                { status: false, error: "Please Provide Correct Password" },
                400
            )
        }

        // return user details
        return jsonResponse(
            {
                status: true,
                message: "User Login Success..!",
                data: {
                    id: result.rows[0].id,
                    first_name: result.rows[0].first_name,
                    last_name: result.rows[0].last_name,
                    username: result.rows[0].username,
                    email: result.rows[0].email,
                    mobile: result.rows[0].mobile,
                    status: result.rows[0].status,
                    email_verified_at: result.rows[0].email_verified_at,
                    mobile_verified_at: result.rows[0].mobile_verified_at,
                }
            },
            200
        )


    } catch (error) {
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
                error: error
            },
            500
        );
    }
}

