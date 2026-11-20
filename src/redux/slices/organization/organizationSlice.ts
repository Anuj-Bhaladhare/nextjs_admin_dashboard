import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Organization, OrganizationState } from "./organizationTypes";

const initialState: OrganizationState = {
    organization: [],
    loading: false,
    error: null
}


const organizationSlice = createSlice({
    name: "organization",
    initialState,
    reducers: {

        setOrganizations: (state, action: PayloadAction<Organization[]>) => {
            state.organization = action.payload;
        },

        addOrganization: (state, action: PayloadAction<Organization>) => {
            state.organization.push(action.payload);
        },

        clearOrganizations: (state) => {
            state.organization = [];
        }

    }
});

export const { setOrganizations, clearOrganizations } = organizationSlice.actions;
export default organizationSlice.reducer;
