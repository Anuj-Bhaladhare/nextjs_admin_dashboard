Yes. I have the architecture context from our previous discussions, and the complete folder structure you've shared here gives us a clear starting point.

For your Next.js Admin Dashboard (App Router) + TypeScript + PostgreSQL + Drizzle + RBAC, I recommend implementing Redux Toolkit (RTK) + React-Redux + RTK Query.

One important point: don't use the old Redux pattern with manually written action types, action creators and reducers. Use Redux Toolkit's `configureStore`, `createSlice` and RTK Query.

We'll integrate Redux into your existing `features/` architecture rather than creating a completely separate application structure.

## 1. Recommended Redux architecture

Recommended for your project

- Redux Toolkit: Global client-side state management.
- React-Redux: Connect React components to Redux.
- RTK Query: API fetching, caching, loading states and invalidation.
- Feature slices: Manage feature-specific client state.
- Typed hooks: Provide type-safe `useDispatch` and `useSelector`.

Install:

```
npm install @reduxjs/toolkit react-redux
```

You already have React 19.3.0, which is suitable for this architecture.

## 2. Where Redux should live in your existing project

I recommend this structure:

```
src/
│
├── app/
│   ├── layout.tsx
│   └── ...
│
├── store/
│   ├── index.ts
│   ├── provider.tsx
│   ├── hooks.ts
│   │
│   ├── api/
│   │   └── base-api.ts
│   │
│   └── middleware/
│       └── ...
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── store/
│   │       └── auth.slice.ts
│   │
│   ├── users/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── store/
│   │       └── users.slice.ts
│   │
│   ├── members/
│   │   └── ...
│   │
│   ├── roles-permissions/
│   │   └── ...
│   │
│   └── settings/
│       └── ...
│
└── ...
```

Why this structure?

Your global Redux configuration stays in `src/store/`, while individual feature states stay inside their respective feature directories.

For example:

- `auth.slice.ts` manages client-side authentication information.
- `users.slice.ts` manages user-related UI state.
- `base-api.ts` provides a shared API configuration for RTK Query.
- `index.ts` combines all reducers and middleware.

## 3. Configure the Redux store

### File 1: `src/store/api/base-api.ts`

This is the shared API configuration. All feature APIs can extend it instead of creating separate API configurations.

```

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",

    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),

  tagTypes: [
    "Auth",
    "User",
    "Member",
    "Role",
    "Permission",
    "Dashboard",
    "Report",
    "Settings",
  ],

  endpoints: () => ({}),
});

```

Why `credentials: "include"`?

Your authentication architecture uses server-managed cookies. This allows browser API requests to include the relevant cookies. The server must still validate the session on every protected request.

### File 2: `src/features/auth/store/auth.slice.ts`

This slice stores client-side authentication-related UI state.

It does not store passwords, JWTs or session tokens.

```

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  activeOrganizationId: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  activeOrganizationId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.activeOrganizationId = null;
    },

    setActiveOrganization: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.activeOrganizationId = action.payload;
    },
  },
});

export const {
  setAuthUser,
  clearAuth,
  setActiveOrganization,
} = authSlice.actions;

export default authSlice.reducer;

```

The user information here is a client-side snapshot for rendering. It is not proof of authentication or authorization. Your server must independently verify the session and organization permissions.

### File 3: `src/store/index.ts`

This combines the feature reducers and RTK Query middleware.

```

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/store/auth.slice";
import { baseApi } from "./api/base-api";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),

    devTools: process.env.NODE_ENV !== "production",
  });
};

// Store types
export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];

```

Important: We use `makeStore()` rather than exporting one global store instance. This is the safer pattern for Next.js because server-side rendering can handle multiple requests. Each provider gets its own store instance.

### File 4: `src/store/hooks.ts`

These are your reusable, type-safe Redux hooks.

```

import {
  useDispatch,
  useSelector,
  useStore,
} from "react-redux";

import type {
  AppDispatch,
  AppStore,
  RootState,
} from "./index";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export const useAppSelector = useSelector.withTypes<RootState>();

export const useAppStore = useStore.withTypes<AppStore>();

```

Now you can use `useAppDispatch()` and `useAppSelector()` throughout your application without repeatedly specifying TypeScript types.

### File 5: `src/store/provider.tsx`

This is the client-side Redux Provider.

```

"use client";

import { useRef, type ReactNode } from "react";
import { Provider } from "react-redux";

import { makeStore, type AppStore } from "./index";

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({
  children,
}: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      {children}
    </Provider>
  );
}

```

This keeps one store instance for the lifetime of the mounted provider rather than creating a new store on every render.

### File 6: Update `src/app/layout.tsx`

Your root layout can remain a Server Component. Only the provider needs to be a Client Component.

```

import type { Metadata } from "next";

import "./globals.css";
import StoreProvider from "@/store/provider";

export const metadata: Metadata = {
  title: "SecureGateControl",
  description: "SecureGateControl Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}

```

Now Redux is available throughout your application:

- `(public)`
- `(auth)`
- `(dashboard)`
- `(admin)`

You don't need to add a separate Provider in every layout.

## 4. How RTK Query fits into your feature architecture

For production, I recommend keeping API data in RTK Query's cache instead of manually copying every API response into Redux slices.

For example:

```
src/features/auth/
├── components/
├── hooks/
├── services/
│   └── auth.api.ts
├── schemas/
├── types/
└── store/
    └── auth.slice.ts
```

### Example: `src/features/auth/services/auth.api.ts`

This extends your shared `baseApi`.

```
import { baseApi } from "@/store/api/base-api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthMeResponse {
  user: AuthUser;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    getMe: builder.query<AuthMeResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;
```

These response types are examples. Match them to the actual JSON returned by your existing API routes.

Production refinement: Let RTK Query own server data such as the logged-in user, dashboard statistics and member lists. Don't maintain duplicate copies of the same data in ordinary Redux slices.

Use ordinary slices for client-only state, such as sidebar visibility, temporary UI selections and active organization selection. The server must still verify the selected organization and permissions.

## 5. Example: Using Redux in a component

```
"use client";

import { useGetMeQuery } from "@/features/auth/services/auth.api";

export default function UserProfile() {
  const { data, isLoading, isError } = useGetMeQuery();

  if (isLoading) return <p>Loading user...</p>;

  if (isError || !data) return <p>Unable to load user.</p>;

  return (
    <div>
      <h2>{data.user.name}</h2>
      <p>{data.user.email}</p>
    </div>
  );
}
```

Example using a regular Redux slice:

```
"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveOrganization } from "@/features/auth/store/auth.slice";

export default function OrganizationSelector() {
  const dispatch = useAppDispatch();

  const activeOrganizationId = useAppSelector(
    (state) => state.auth.activeOrganizationId
  );

  return (
    <button
      onClick={() => dispatch(setActiveOrganization("org-123"))}
    >
      Current organization: {activeOrganizationId || "None"}
    </button>
  );
}
```

For the organization example, `"org-123"` is illustrative; your real selector should use an organization returned by your server.

## 6. What should go into Redux?

For your application, I recommend this division:

| Application data                    | Recommended approach                   |
| ----------------------------------- | -------------------------------------- |
| Logged-in user profile              | RTK Query                              |
| Login/logout API state              | RTK Query                              |
| User list                           | RTK Query                              |
| Members list                        | RTK Query                              |
| Roles and permissions data          | RTK Query                              |
| Dashboard statistics                | RTK Query                              |
| Reports                             | RTK Query                              |
| Active organization selection       | Redux slice                            |
| Sidebar open/close                  | Redux slice                            |
| Theme selection                     | Redux slice or existing theme solution |
| Temporary UI filters                | Redux slice or component state         |
| Passwords and authentication tokens | Never store in Redux                   |

Also, Redux must never be your authorization mechanism. Your Next.js API routes must validate sessions and RBAC permissions independently.

## 7. Final recommended architecture

Your application state architecture

Next.js App Router

Pages, layouts and components

Redux Provider

One client-side store per provider

Redux Slices

Client UI state

RTK Query

API data and caching

Next.js API Routes

Authentication, validation and authorization

Server Services → Repositories → Drizzle → PostgreSQL

## 8. Implementation order I recommend

1. Install Redux Toolkit and React-Redux.
2. Create the global store, provider and typed hooks.
3. Connect the provider to `app/layout.tsx`.
4. Configure the shared RTK Query `baseApi`.
5. Integrate authentication APIs.
6. Integrate dashboard and user APIs.
7. Add feature-specific slices where client-side state is actually needed.
8. Add testing and Redux DevTools configuration.

My recommendation: Don't migrate your entire application to Redux in one go. Establish the global foundation first, then integrate one feature at a time.

The best next step is to complete your Redux foundation and Authentication integration (login, logout, `/me`, session restoration and active organization) before moving on to Users, Members and RBAC.
