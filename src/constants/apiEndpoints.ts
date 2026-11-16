

export const API_ENDPOINTS = {

    // Authentication
    AUTH: {
        LOGIN:      { url: "/api/auth/login",       method: "POST" },
        REGISTER:   { url: "/api/auth/register",    method: "POST" },
        LOGOUT:     { url: "/api/auth/logout",      method: "POST" },
        ME:         { url: "/api/auth/me",          method: "GET" } 
    },

    // User's Profile and Account
    MY_ACCOUNT_APIs: {
        PROFILE: {
            CREATE: { url: "/api/users/me/profile",  method: "POST" },
            GET:    { url: "/api/users/me/profile",  method: "GET" },
            UPDATE: { url: "/api/users/me/profile",  method: "PATCH" }
        },
        
    },

    // ORGANIZATION: {
    //     CREATE_ORGANIZATION:        { url: "/api/organization",    method: "POST" },
    //     LIST_ORGANIZATIONS:         { url: "/api/organization",    method: "GET" },
    //     GET_ORGANIZATION_DETAILS:   { url: "/api/organization",    method: "GET" },
    //     UPDATE_ORGANIZATION:        { url: "/api/organization",    method: "PATCH" },
    //     ORGANIZATION_STATUS:        { url: "/api/organization",    method: "PATCH" },
    //     GET_SETTINGS:               { url: "/api/organization",    method: "GET" },
    //     UPDATE_SETTINGS:            { url: "/api/organization",    method: "PUT" },
    //     LIST_ORGANIZATION_MEMBERS:  { url: "/api/organization",    method: "GET" },
    //     ORGANIZATION_SUMMARY:       { url: "/api/organization",    method: "GET" }
    // }
}

