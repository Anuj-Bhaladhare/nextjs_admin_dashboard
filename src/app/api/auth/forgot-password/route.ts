
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { getPostgresPool } from "@/lib/db/client";

// export const runtime = "nodejs";

interface ForgotPasswordBody {
    email: string;
    password: string;
    confirmPassword: string;
}

function jsonResponse(body: object, status = 200): NextResponse {
    return NextResponse.json(body, {
        status,
        headers: {  
            "Cache-Control": "no-store",
        },
    });
}

export const POST = async (request: Request): Promise<NextResponse> => {
    try {
        // Parse request body
        let body: ForgotPasswordBody;

        try {
            body = await request.json();
        } catch {
            return jsonResponse(
                { error: "Request body must be valid JSON." },
                400,
            );
        }

        const { email, password, confirmPassword } = body;

        // Validate required fields
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof confirmPassword !== "string"
        ) {
            return jsonResponse(
                {
                    error: "Email, password and confirm password are required.",
                },
                400,
            );
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Validate email
        const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !normalizedEmail ||
            normalizedEmail.length > 255 ||
            !EMAIL_PATTERN.test(normalizedEmail)
        ) {
            return jsonResponse(
                { error: "Please provide a valid email address." },
                400,
            );
        }

        // Validate password
        if (password.length < 8) {
            return jsonResponse(
                { error: "Password must be at least 8 characters long." },
                400,
            );
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            return jsonResponse(
                { error: "Password and confirm password do not match." },
                400,
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Connect to PostgreSQL
        const pool = getPostgresPool();

        // Update user password using email
        const result = await pool.query(
            `
                UPDATE core.users
                SET password_hash = $1,
                    updated_at = NOW()
                WHERE LOWER(email) = $2
                RETURNING id
            `,
            [hashedPassword, normalizedEmail],
        );

        // Check user existence
        if (result.rowCount === 0) {
            return jsonResponse(
                { error: "No account found with this email address." },
                404,
            );
        }

        return jsonResponse({
            success: true,
            message: "Password reset successfully.",
        });
    } catch (error) {
        console.error("[Forgot Password] Error:", error);

        return jsonResponse(
            {
                error: "Unable to reset password. Please try again.",
            },
            500,
        );
    }
}
