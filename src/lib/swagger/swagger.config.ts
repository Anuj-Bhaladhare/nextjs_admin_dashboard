
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.1.0",

    info: {
      title: "SecureGateControl API",
      version: "1.0.0",
      description: `
        API documentation for SecureGateControl.

        This API manages authentication, organizations, users,
        role-based access control, employees, visitors,
        gate control, monitoring and application settings.
      `,
    },

    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "Login, logout, sessions and account security",
      },
      { name: "Users", description: "User profile and user management" },
      { name: "Organizations", description: "Organization management" },
      { name: "RBAC", description: "Roles, permissions and delegations" },
      { name: "Members", description: "Member management" },
      { name: "Health", description: "API health checks" },
      { name: "Dashboard", description: "Dashboard and statistics" },
      { name: "Invitations", description: "Invitation management" },
      { name: "Reports", description: "Reports and exports" },
      { name: "Settings", description: "Application configuration" },
      {
        name: "Gate Control",
        description: "Gate control and device APIs",
      },
    ],

    components: {
      securitySchemes: {
        CookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "access_token",
          description: "Authentication cookie used by the application.",
        },
      },

      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: {},
          },
        },

        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                details: {},
              },
            },
          },
        },
      },
    },
  },

  // Scan Next.js API route files for Swagger annotations
  apis: ["./src/app/api/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
