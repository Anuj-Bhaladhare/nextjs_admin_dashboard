import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

const selectOrganizations = (state: RootState) =>
    state.organization.organization;

// Total Organizations
export const selectTotalOrganizations = createSelector(
    [selectOrganizations],
    (organizations) => organizations.length
);

// Active Organizations
export const selectActiveOrganizations = createSelector(
    [selectOrganizations],
    (organizations) =>
        organizations.filter((org) => org.status === "ACTIVE").length
);

// Suspended Organizations
export const selectSuspendedOrganizations = createSelector(
    [selectOrganizations],
    (organizations) =>
        organizations.filter((org) => org.status === "SUSPENDED").length
);

// Inactive Organizations
export const selectInactiveOrganizations = createSelector(
    [selectOrganizations],
    (organizations) =>
        organizations.filter((org) => org.status === "INACTIVE").length
);
