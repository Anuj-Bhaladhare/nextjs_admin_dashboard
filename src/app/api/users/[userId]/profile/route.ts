// import { NextResponse } from "next/server";
// import ProfileRepository from "./profile.repository";
// import { ProfileBody } from "./profile.types";
// import ProfileResponse from "./profile.response";

// const [{ getUserById }] = ProfileRepository();
// const [{ jsonResponse }] = ProfileResponse();

// export const GET = async (request: Request): Promise<NextResponse> => {


// const session = await auth();

// const userId = session?.user?.id;

// // Fetch logged-in user's profile


//     try {
// console.log("AAAAAAAAAAAA")
//         let body: ProfileBody;
// console.log("BBBBBBBBBBBBB")

//         try {
//             body = await request.json();
//         } catch (e) {
//             console.log("eeeeeeeee", e);
//             throw e;
//         }
// console.log("CCCCCCCCCCCC")

//         const { userId } = body;
//         console.log("========>", userId);

//         return jsonResponse(
//             {
//                 userId: userId
//             },
//             200
//         )
        
//     } catch (error) {
//         throw error;
//     }
// }
