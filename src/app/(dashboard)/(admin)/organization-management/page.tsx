"use client";

import { useMemo, useState, useEffect } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { ArrowDownUp, Building2, ChevronDown, Clock3, Ellipsis, Plus, Search, Settings2, UsersRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import useOrganizationManagement from "./hook";
import { useAppSelector } from "@/redux/hooks";


type OrganizationStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

interface OrganizationRow {
  id: string;
  name: string;
  code: string;
  description: string;
  status: OrganizationStatus;
  members: number;
  updatedAt: string;
}

const statusStyles: Record<OrganizationStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  INACTIVE: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
  SUSPENDED:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

const columns: GridColDef<OrganizationRow>[] = [
  {
    field: "name",
    headerName: "Organization",
    minWidth: 250,
    flex: 1.25,
    sortable: true,
    renderCell: ({ row }) => (
      <div className="flex h-full min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-semibold text-brand-700 dark:bg-brand-500/12 dark:text-brand-300">
          {row.name
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
            {row.name}
          </p>
          <p className="mt-0.5 truncate font-mono text-[11px] leading-4 text-gray-500 dark:text-gray-400">
            {row.code}
          </p>
        </div>
      </div>
    ),
  },
  {
    field: "description",
    headerName: "Description",
    minWidth: 220,
    flex: 1,
    sortable: false,
    renderCell: ({ value }) => (
      <span className="truncate text-sm text-gray-500 dark:text-gray-400">
        {value}
      </span>
    ),
  },
  {
    field: "members",
    headerName: "Members",
    width: 120,
    align: "left",
    headerAlign: "left",
    renderCell: ({ value }) => (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        <UsersRound
          className="size-4 text-gray-400"
          aria-hidden="true"
        />
        {value}
      </span>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 140,
    renderCell: ({ row }) => {
      const { status } = row;

      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[status]}`}
        >
          <span
            className={`size-1.5 rounded-full ${
              status === "ACTIVE"
                ? "bg-green-500"
                : status === "SUSPENDED"
                  ? "bg-amber-500"
                  : "bg-gray-400"
            }`}
            aria-hidden="true"
          />
          {status.toLowerCase()}
        </span>
      );
    },
  },
  {
    field: "updatedAt",
    headerName: "Last updated",
    minWidth: 155,
    flex: 0.7,
    renderCell: ({ value }) => (
      <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Clock3 className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
        {value}
      </span>
    ),
  },
  {
    field: "actions",
    headerName: "",
    width: 64,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    align: "center",
    headerAlign: "center",
    renderCell: ({ row }) => (
      <button
        type="button"
        aria-label={`More actions for ${row.name}`}
        className="inline-flex size-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
      >
        <Ellipsis className="size-5" aria-hidden="true" />
      </button>
    ),
  },
];

const dataGridSx = {
  border: 0,
  color: "inherit",
  fontFamily: "inherit",
  "& .MuiDataGrid-columnHeaders": {
    minHeight: "48px !important",
    maxHeight: "48px !important",
    backgroundColor: "var(--color-gray-50)",
    borderBottom: "1px solid var(--color-gray-100)",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#667085",
  },
  "& .MuiDataGrid-columnSeparator": {
    color: "var(--color-gray-200)",
  },
  "& .MuiDataGrid-row": {
    minHeight: "76px !important",
    maxHeight: "76px !important",
    borderBottom: "1px solid var(--color-gray-100)",
  },
  "& .MuiDataGrid-cell": {
    display: "flex",
    alignItems: "center",
    border: 0,
    outline: "none",
    whiteSpace: "normal",
  },
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
    {
      outline: "none",
    },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "var(--color-gray-50)",
  },
  "& .MuiDataGrid-footerContainer": {
    minHeight: "56px",
    borderTop: "1px solid var(--color-gray-100)",
  },
  "& .MuiTablePagination-root, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
    {
      fontSize: "12px",
      color: "#667085",
    },
  "& .MuiDataGrid-virtualScroller": {
    minHeight: "200px",
  },
  ".dark & .MuiDataGrid-columnHeaders": {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  ".dark & .MuiDataGrid-columnHeaderTitle, .dark & .MuiTablePagination-root, .dark & .MuiTablePagination-selectLabel, .dark & .MuiTablePagination-displayedRows":
    {
      color: "rgba(255,255,255,0.6)",
    },
  ".dark & .MuiDataGrid-row": {
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  ".dark & .MuiDataGrid-row:hover": {
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  ".dark & .MuiDataGrid-footerContainer": {
    borderTopColor: "rgba(255,255,255,0.08)",
  },
};

export default function OrganizationDatatablePage() {

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [{ getOrganizations }] = useOrganizationManagement();
  const organizationRows = useAppSelector( (state) => state.organization.organization );

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return organizationRows
      .filter((organization) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          organization.name.toLowerCase().includes(normalizedSearch) ||
          organization.code.toLowerCase().includes(normalizedSearch) ||
          organization.description.toLowerCase().includes(normalizedSearch);
        const matchesStatus =
          status === "ALL" || organization.status === status;

        return matchesSearch && matchesStatus;
      })
      .map((organization) => ({
        ...organization,
        updatedAt: organization.updated_at,
      }));
  }, [organizationRows, search, status]);

  useEffect( () => {
    getOrganizations()
  }, [getOrganizations]);

  console.log("=========================", organizationRows);

  const totalMembers = organizationRows.reduce(
    (total, organization) => total + organization.members,
    0,
  );

  const activeCount = organizationRows.filter(
    (organization) => organization.status === "ACTIVE",
  ).length;

  const suspendedCount = organizationRows.filter(
    (organization) => organization.status === "SUSPENDED",
  ).length;



  return (
    <main className="space-y-6 text-gray-800 dark:text-white/90">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400">
            <Building2 className="size-4" aria-hidden="true" />
            Organization management
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/organization-management/organization-settings"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Settings2 className="size-4" aria-hidden="true" />
            Settings
          </Link>
          <Link
            href="/organization-management/create-organization"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create organization
          </Link>
        </div>
      </header>

      <section
        aria-label="Organization statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
            label: "Total organizations",
            value: organizationRows.length.toString(),
            detail: "Across your workspace",
            icon: Building2,
            iconClass:
              "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
          },
          {
            label: "Active organizations",
            value: activeCount.toString(),
            detail: "Available for access",
            icon: Building2,
            iconClass:
              "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
          },
          {
            label: "Suspended organizations",
            value: suspendedCount.toString(),
            detail: "Temporarily restricted",
            icon: Clock3,
            iconClass:
              "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
          },
          {
            label: "Total members",
            value: totalMembers.toLocaleString(),
            detail: "Across all organizations",
            icon: UsersRound,
            iconClass:
              "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">
                    {metric.value}
                  </p>
                </div>
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${metric.iconClass}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {metric.detail}
              </p>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Organization directory</h2>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                {filteredRows.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Search, sort, and filter organization records.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block sm:w-72">
              <span className="sr-only">Search organizations</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, code, description"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-10 text-sm outline-none placeholder:text-gray-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </label>
            <label className="relative block sm:w-44">
              <span className="sr-only">Filter by organization status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3.5 pr-9 text-sm text-gray-600 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
            </label>
            {(search || status !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("ALL");
                }}
                className="h-10 rounded-lg px-3 text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <Box sx={{ width: "100%" }}>
          <DataGrid
            aria-label="Organizations table"
            rows={filteredRows}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                  page: 0,
                },
              },
            }}
            sx={dataGridSx}
            localeText={{
              noRowsLabel: "No organizations match your filters.",
            }}
          />
        </Box>

        <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-3.5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800 dark:text-gray-400">
          <span>
            Showing {filteredRows.length} of {organizationRows.length} sample
            organizations
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ArrowDownUp className="size-3.5" aria-hidden="true" />
            Sort columns by selecting a column heading
          </span>
        </div>
      </section>
    </main>
  );
}
