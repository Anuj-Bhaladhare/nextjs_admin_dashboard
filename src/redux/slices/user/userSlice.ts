
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrentUser } from "./userTypes";

const initialState: CurrentUser = {
    id: "",
    email: "",
    username: "",
    mobile: "",
    first_name: "",
    last_name: "",
    role: "",
    organization_id: "",
    session_id: "",
    role_id: "",
    status: "",
    email_verified_at: "",
    mobile_verified_at: "",
    created_at: "",
    updated_at: "",
    created_by: "",
    updated_by: "",
    last_login_at: "",
    locked_until: "",
    failed_login_attempts: 0
}

const userSlice = createSlice({
    name: "user",
    initialState,
    
    reducers: {
        setUserDetails: (state, action: PayloadAction<CurrentUser> ) => {
            Object.assign(state, action.payload)
        },

        clearUserDetails: ( state ) => {
            Object.assign(state, initialState)
        }
    }
})

export const { setUserDetails, clearUserDetails } = userSlice.actions;
export default userSlice.reducer;
