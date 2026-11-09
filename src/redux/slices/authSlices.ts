"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface AuthType {
    userId: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
}

const initialState: AuthType = {
    userId: "",
    organizationId: "",
    firstName: "",
    lastName: "",
    role: "",
    status: ""
} 

export const authSlices = createSlice({
    initialState: initialState,
    name: "auth",
    reducers: {
        setAuthDetails: (state, action: PayloadAction<AuthType>) => {
            userId: action.payload.userId;
            organizationId: action.payload.organizationId;
            firstName: action.payload.firstName;
            lastName: action.payload.lastName;
            role: action.payload.role;
            status: action.payload.status;
        },
    }
});
