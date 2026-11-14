

export const API_ENDPOINTS = {

    // Authentication
    AUTH: {
        LOGIN: { 
            url: "/api/auth/login", 
            method: "POST" 
        },
        REGISTER: { 
            url: "/api/auth/register", 
            method: "POST" 
        },
        LOGOUT: { 
            url: "/api/auth/logout", 
            method: "POST" 
        },    
    },

    // User's Profile and Account
    MY_ACCOUNT_APIs: {

        PROFILE: {
            CREATE: {
                url: "/api/users/me/profile", 
                method: "POST" 
            },
            GET: {
                url: "/api/users/me/profile", 
                method: "GET" 
            },
            UPDATE: {
                url: "/api/users/me/profile", 
                method: "PATCH" 
            }
        }

    }
}



// # Module E – My Account APIs:
//     Base path:
//         - /api/users/me
//     API: 
//         GET	        /	                    Get current user
//         PATCH	    /	                    Update basic account information
//         POST	    /profile-Done	            Create first time Profile
//         GET	        /profile-Done	            Get personal profile
//         PATCH	    /profile-Done	            Update personal profile
//         PUT	        /avatar	                Upload or replace avatar
//         DELETE	    /avatar	                Remove avatar
//         PATCH	    /password	            Change own password
//         GET	        /organizations	        List user's organizations
//         GET	        /sessions	            List active sessions
//         DELETE	    /sessions/:sessionId	Revoke a particular session
//         DELETE	    /sessions	            Revoke all other sessions
//         GET	        /security	            Get account security information
