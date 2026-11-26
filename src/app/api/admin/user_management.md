# **SecureGateControl — User Management API Architecture**

Module Design · REST API · Next.js App Router · TypeScript · PostgreSQL · Raw SQL

We will now isolate the **User Management module** from the other SecureGateControl modules and design it as a complete API system.

This module will be accessible **only to&#x20;**`SUPER_ADMIN`**&#x20;and&#x20;**`ADMIN`. It will manage user accounts, create users, update user information, manage account status, activate users, resend activation emails, retrieve users, and review account-related information.

This is strictly the **User Management module**. Organization management, role management, visitor management, employee management, and gate operations will remain separate modules, even though User Management integrates with them.

## **1. User Management module scope**

## **User Management**

**Purpose**

Centralized management of SecureGateControl user accounts by authorized administrators.

Allowed roles

SUPER_ADMIN

ADMIN

Excluded roles

SUPERVISOR

GUARD

GUARD_ADMIN

RECEPTIONIST

### **Module responsibilities**

- Create new user accounts.
- View users.
- Search and filter users.
- Retrieve detailed user information.
- Update user details.
- Activate user accounts.
- Suspend user accounts.
- Disable user accounts.
- Lock and unlock accounts.
- Resend email verification.
- Resend password setup/activation email.
- Reset user password through a secure flow.
- Manage user profile data.
- View user organization associations.
- View user login/activity summary.
- Manage account-related security information.
- Delete or deactivate users according to account lifecycle policy.

### **Out of scope for this module**

| Feature                              | Owning module           |
| ------------------------------------ | ----------------------- |
| Assign/remove roles                  | RBAC                    |
| Create organization                  | Organization Management |
| Add/remove organization membership   | Membership Management   |
| Send/accept organization invitations | Invitation Management   |
| Create employee records              | Employee Management     |
| Register visitors                    | Visitor Management      |
| Gate open/close                      | Gate Control            |

User Management may display related role, organization, or membership data, but must not independently modify those records unless a dedicated integration workflow explicitly permits it.

## **2. Permission architecture**

Having the role `ADMIN` or `SUPER_ADMIN` alone should not automatically bypass every API permission check. The API should check both the user's authorized scope and their specific permission.

### **Role access matrix**

| Capability            | SUPER_ADMIN                   | ADMIN                                     |
| --------------------- | ----------------------------- | ----------------------------------------- |
| List users            | All authorized system scope   | Own organization                          |
| View user details     | Yes                           | Own organization users                    |
| Create user           | Yes                           | Own organization                          |
| Update user           | Yes                           | Own organization users                    |
| Activate user         | Yes                           | Own organization users                    |
| Suspend user          | Yes                           | Own organization users                    |
| Disable user          | Yes                           | Own organization users                    |
| Unlock account        | Yes                           | Own organization users                    |
| Resend verification   | Yes                           | Own organization users                    |
| Send password setup   | Yes                           | Own organization users                    |
| View account activity | Yes                           | Own organization users                    |
| View account security | Yes                           | Own organization users, restricted fields |
| Delete user           | Controlled system operation   | No global deletion                        |
| Manage another ADMIN  | Yes, subject to system policy | No                                        |
| Manage SUPER_ADMIN    | System-level restricted       | No                                        |

Recommended rule: ADMIN cannot create, modify, suspend, disable, or elevate another ADMIN or SUPER_ADMIN. SUPER_ADMIN has system-level authority, but sensitive account changes should still be audited and protected.

## **3. API route design strategy**

I recommend separating the API routes based on the administrator's scope.

### **Organization-scoped user APIs**

For an ADMIN managing their own organization:

```
/api/v1/organizations/{organizationId}/users
```

### **Global user APIs**

For SUPER_ADMIN managing system-wide users:

```
/api/v1/admin/users
```

This gives us two distinct scopes without duplicating business logic.

Both route groups will use the **same User Management service and repository**. The only difference is the authorization policy and data scope.

ADMIN

Organization-scoped access → only users associated with their organization.

SUPER_ADMIN

Global access → users across all organizations, with optional organization filters.

# **4. Complete endpoint inventory**

## **A. User list and retrieval**

These endpoints are responsible for retrieving and searching users.

| Method | Endpoint                                         | Use                        |
| ------ | ------------------------------------------------ | -------------------------- |
| GET    | `/organizations/{organizationId}/users`          | List organization users    |
| GET    | `/admin/users`                                   | List all users system-wide |
| GET    | `/organizations/{organizationId}/users/{userId}` | Get user details           |
| GET    | `/admin/users/{userId}`                          | Get global user details    |
| GET    | `/organizations/{organizationId}/users/search`   | Advanced user search       |
| GET    | `/admin/users/search`                            | Global advanced search     |

The search endpoints may ultimately be merged into the list endpoints using query parameters. I recommend merging them to avoid unnecessary route duplication.

### **Recommended list endpoint**

```
GET /api/v1/organizations/{organizationId}/users
```

### **Query parameters**

| Parameter       | Type     | Purpose                              |
| --------------- | -------- | ------------------------------------ |
| `page`          | number   | Page number                          |
| `limit`         | number   | Records per page                     |
| `search`        | string   | Search name, email, username, mobile |
| `status`        | string   | Filter by account status             |
| `emailVerified` | boolean  | Filter by email verification         |
| `createdFrom`   | date     | Filter creation start date           |
| `createdTo`     | date     | Filter creation end date             |
| `sortBy`        | string   | Sort field                           |
| `sortOrder`     | ASC/DESC | Sort direction                       |

Example:

```
GET /api/v1/organizations/ORG_UUID/users?page=1&limit=20&search=amit&status=ACTIVE&sortBy=createdAt&sortOrder=DESC
```

### **Example response**

```
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user-uuid",
      "firstName": "Amit",
      "lastName": "Sharma",
      "email": "amit@example.com",
      "username": "amit",
      "mobile": "9999999999",
      "status": "ACTIVE",
      "emailVerified": true,
      "createdAt": "2026-11-25T04:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 125,
      "totalPages": 7
    }
  }
}
```

### **Global user list for SUPER_ADMIN**

```
GET /api/v1/admin/users
```

Example:

```
GET /api/v1/admin/users?page=1&limit=20&search=amit&status=ACTIVE&organizationId=ORG_UUID
```

SUPER_ADMIN may search across organizations, but organization-specific information should only be included when relevant to the requested view.

## **B. Create user APIs**

| Method | Endpoint                                | Use                                       |
| ------ | --------------------------------------- | ----------------------------------------- |
| POST   | `/organizations/{organizationId}/users` | Create user in an organization            |
| POST   | `/admin/users`                          | Create global user / system-level account |

### **1. Create organization user**

```
POST /api/v1/organizations/{organizationId}/users
```

Access: `ADMIN`, `SUPER_ADMIN`

Request:

```
{
  "firstName": "Amit",
  "lastName": "Sharma",
  "email": "amit@example.com",
  "username": "amit",
  "mobile": "9999999999"
}
```

### **Responsibilities**

- Validate request body.
- Normalize email.
- Check duplicate email.
- Verify the actor's authority to create accounts in the organization.
- Create the account with status `INVITED`.
- Create the organization membership, initially pending.
- Generate secure verification/password setup token.
- Store token hash.
- Queue email.
- Record audit event.
- Return the created user.

Recommended flow: account creation and email setup are separate steps.

The user should not receive a usable login session until the account setup and verification requirements are satisfied.

### **2. Create global user**

```
POST /api/v1/admin/users
```

Access: `SUPER_ADMIN`

Use when a system-level administrator needs to create a global user account without being restricted to the standard organization creation path.

Example request:

```
{
  "firstName": "Amit",
  "lastName": "Sharma",
  "email": "amit@example.com",
  "username": "amit",
  "mobile": "9999999999"
}
```

The account remains a global identity. Organization memberships and roles should be assigned through their respective modules.

## **C. Update user APIs**

| Method | Endpoint                                         | Use                     |
| ------ | ------------------------------------------------ | ----------------------- |
| PATCH  | `/organizations/{organizationId}/users/{userId}` | Update user information |
| PATCH  | `/admin/users/{userId}`                          | Global user update      |

### **Organization-scoped update**

```
PATCH /api/v1/organizations/{organizationId}/users/{userId}
```

Access: `ADMIN`, `SUPER_ADMIN`

Request:

```
{
  "firstName": "Amit Kumar",
  "lastName": "Sharma",
  "mobile": "8888888888",
  "username": "amitk"
}
```

Only the fields provided should be updated.

### **Update responsibilities**

- Validate user exists.
- Verify user belongs to the requested organization.
- Validate editable fields.
- Check username uniqueness.
- Validate email change separately if email is allowed to change.
- Update `updated_at` and `updated_by`.
- Record changed fields in audit metadata.

### **Email change policy**

Email is a sensitive account identifier.

If an email is changed:

1. Store the new email as pending.
2. Do not immediately replace the verified email identity.
3. Send verification to the new email.
4. Confirm the token.
5. Apply the new email and mark it verified.
6. Record the change in audit history.

Recommended future schema: a pending email column or separate email-change request table.

## **D. Account status management APIs**

The status-management APIs must be separate from general user updates.

| Method | Endpoint                                                  | Use                        |
| ------ | --------------------------------------------------------- | -------------------------- |
| PATCH  | `/organizations/{organizationId}/users/{userId}/status`   | Change user account status |
| PATCH  | `/admin/users/{userId}/status`                            | Global status change       |
| POST   | `/organizations/{organizationId}/users/{userId}/suspend`  | Suspend account            |
| POST   | `/organizations/{organizationId}/users/{userId}/activate` | Activate account           |
| POST   | `/organizations/{organizationId}/users/{userId}/disable`  | Disable account            |
| POST   | `/admin/users/{userId}/unlock`                            | Unlock locked account      |

Recommendation: use a single status PATCH endpoint instead of creating activate, suspend, disable, and unlock routes separately. The dedicated action routes are optional aliases, not required core APIs.

### **User status definitions**

| Status      | Meaning                                         |
| ----------- | ----------------------------------------------- |
| `INVITED`   | Account created but setup/activation incomplete |
| `ACTIVE`    | User can authenticate                           |
| `SUSPENDED` | Temporarily blocked by administrative action    |
| `DISABLED`  | Account disabled by administrative policy       |
| `LOCKED`    | Temporarily locked by security controls         |

### **Status update endpoint**

```
PATCH /api/v1/organizations/{organizationId}/users/{userId}/status
```

Request:

```
{
  "status": "SUSPENDED",
  "reason": "Security review required"
}
```

Response:

```
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": "user-uuid",
    "status": "SUSPENDED",
    "updatedAt": "2026-11-25T05:00:00Z"
  }
}
```

### **Status change effects**

| Action   | Expected effects                                                     |
| -------- | -------------------------------------------------------------------- |
| Activate | Enable authentication if activation requirements are met             |
| Suspend  | Block new authenticated access; revoke or invalidate active sessions |
| Disable  | Permanently or administratively block account until re-enabled       |
| Lock     | Security lockout; prevent login according to lock policy             |
| Unlock   | Remove security lock if no other block remains                       |

An organization ADMIN's suspension of a global account should be prohibited by default. If an ADMIN needs to remove someone from their organization, use the Membership Management API rather than suspending the person's global account.

## **E. Account activation and email verification**

These endpoints are necessary because your selected direct user creation workflow is **Option A: Email verification + password setup**.

These APIs are part of the User Management onboarding lifecycle, although the token-validation actions may be implemented by the Authentication module.

| Method | Endpoint                                                             | Use                                      |
| ------ | -------------------------------------------------------------------- | ---------------------------------------- |
| POST   | `/organizations/{organizationId}/users/{userId}/send-setup-email`    | Send initial account setup email         |
| POST   | `/organizations/{organizationId}/users/{userId}/resend-verification` | Resend email verification                |
| GET    | `/admin/users/{userId}/activation-status`                            | Check account setup status               |
| POST   | `/auth/verify-email`                                                 | Verify email using token                 |
| POST   | `/auth/setup-password`                                               | Set initial password                     |
| POST   | `/auth/resend-verification`                                          | User requests another verification email |

### **1. Send setup email**

```
POST /api/v1/organizations/{organizationId}/users/{userId}/send-setup-email
```

Request:

```
{
  "deliveryMethod": "EMAIL"
}
```

Response:

```
{
  "success": true,
  "message": "Account setup email queued successfully",
  "data": {
    "userId": "user-uuid",
    "deliveryStatus": "QUEUED"
  }
}
```

The API should not expose the setup token in its response.

### **2. Resend verification**

```
POST /api/v1/organizations/{organizationId}/users/{userId}/resend-verification
```

Use when an administrator needs to resend the verification email.

Requirements:

- Account must be in an eligible state.
- Enforce rate limits.
- Invalidate old verification tokens according to policy.
- Generate a fresh secure token.
- Store only token hash.
- Queue email.
- Audit the resend operation.

### **3. Verify email**

```
POST /api/v1/auth/verify-email
```

Request:

```
{
  "token": "secure-verification-token"
}
```

This endpoint:

1. Hashes and validates the token.
2. Checks token expiry and revocation.
3. Verifies the token is associated with the correct user.
4. Marks the email verified.
5. Consumes the token.
6. Records an audit/security event.

### **4. Set initial password**

```
POST /api/v1/auth/setup-password
```

Request:

```
{
  "token": "password-setup-token",
  "password": "StrongPasswordHere!",
  "confirmPassword": "StrongPasswordHere!"
}
```

Requirements:

- Validate token.
- Validate password policy.
- Confirm email-verification requirement.
- Hash the password.
- Update account status when eligible.
- Activate pending membership only when invitation/organization requirements have been met.
- Consume setup token.
- Create a session only if the onboarding policy permits it.
- Audit completion.

## **F. Password management APIs**

These are the administrator-facing user management operations.

| Method | Endpoint                                                         | Use                            |
| ------ | ---------------------------------------------------------------- | ------------------------------ |
| POST   | `/organizations/{organizationId}/users/{userId}/password-reset`  | Trigger password reset email   |
| POST   | `/admin/users/{userId}/password-reset`                           | Global password reset action   |
| GET    | `/organizations/{organizationId}/users/{userId}/password-status` | Get password setup/reset state |

### **Trigger password reset**

```
POST /api/v1/organizations/{organizationId}/users/{userId}/password-reset
```

Request:

```
{
  "reason": "User requested assistance with account recovery"
}
```

Response:

```
{
  "success": true,
  "message": "Password reset email queued successfully",
  "data": {
    "userId": "user-uuid",
    "deliveryStatus": "QUEUED"
  }
}
```

The administrator does **not** set or receive the user's password.

The password reset link must be single-use, time-limited, securely stored, and invalidated after successful password reset.

Security rule

ADMIN and SUPER_ADMIN should never be able to retrieve an existing password or view a password hash. Administrator actions may initiate a reset, but the password belongs exclusively to the user.

## **G. User profile APIs**

Although the `My Account` API is primarily the responsibility of the account-owning user, administrators require a limited profile management view.

| Method | Endpoint                                                 | Use                             |
| ------ | -------------------------------------------------------- | ------------------------------- |
| GET    | `/organizations/{organizationId}/users/{userId}/profile` | Retrieve user profile           |
| PATCH  | `/organizations/{organizationId}/users/{userId}/profile` | Update permitted profile fields |
| PUT    | `/organizations/{organizationId}/users/{userId}/avatar`  | Upload or replace avatar        |
| DELETE | `/organizations/{organizationId}/users/{userId}/avatar`  | Remove avatar                   |

### **Profile update example**

```
PATCH /api/v1/organizations/{organizationId}/users/{userId}/profile
```

```
{
  "displayName": "Amit Sharma",
  "bio": "Security Operations Staff",
  "timezone": "Asia/Kolkata",
  "locale": "en"
}
```

The API should update `core.user_profiles`, not duplicate profile data in `core.users`.

Profile permissions should be limited to necessary fields. Sensitive profile fields such as date of birth, addresses, and alternate contacts should have explicit access rules.

## **H. User sessions and security information**

These APIs allow ADMIN and SUPER_ADMIN to view limited account security information.

| Method | Endpoint                                                              | Use                       |
| ------ | --------------------------------------------------------------------- | ------------------------- |
| GET    | `/organizations/{organizationId}/users/{userId}/sessions`             | List user sessions        |
| GET    | `/admin/users/{userId}/sessions`                                      | Global session list       |
| DELETE | `/organizations/{organizationId}/users/{userId}/sessions/{sessionId}` | Revoke a specific session |
| DELETE | `/admin/users/{userId}/sessions`                                      | Revoke all sessions       |
| GET    | `/organizations/{organizationId}/users/{userId}/security`             | Account security overview |

### **Security overview response**

```
{
  "success": true,
  "message": "User security information retrieved",
  "data": {
    "userId": "user-uuid",
    "status": "ACTIVE",
    "emailVerified": true,
    "failedLoginAttempts": 0,
    "lockedUntil": null,
    "lastLoginAt": "2026-11-24T18:20:00Z",
    "activeSessions": 2
  }
}
```

### **Session list response example**

```
{
  "success": true,
  "message": "Sessions retrieved successfully",
  "data": [
    {
      "sessionId": "session-uuid",
      "createdAt": "2026-11-24T10:00:00Z",
      "lastActivityAt": "2026-11-25T05:00:00Z",
      "expiresAt": "2026-12-24T10:00:00Z",
      "deviceName": "Desktop Browser",
      "ipAddress": "masked-ip",
      "status": "ACTIVE"
    }
  ]
}
```

Do not expose refresh tokens, token hashes, MFA secrets, or internal authentication credentials.

## **I. User activity APIs**

These APIs provide a user-specific activity view for authorized administrators.

| Method | Endpoint                                                    | Use                        |
| ------ | ----------------------------------------------------------- | -------------------------- |
| GET    | `/organizations/{organizationId}/users/{userId}/activity`   | User activity summary      |
| GET    | `/organizations/{organizationId}/users/{userId}/audit-logs` | User-specific audit events |
| GET    | `/admin/users/{userId}/activity`                            | Global activity summary    |
| GET    | `/admin/users/{userId}/audit-logs`                          | Global user audit events   |

### **Activity information**

- Account created.
- Account activated.
- Email verified.
- Last login.
- Failed login attempts.
- Password reset requested/completed.
- Session created/revoked.
- Account suspended/activated.
- Profile updated.
- Invitation accepted.

Example:

```
GET /api/v1/organizations/{organizationId}/users/{userId}/activity?page=1&limit=20
```

These APIs should read from the Audit module's event data. User Management should not create a second audit history table for the same events.

## **J. Delete/deactivation APIs**

| Method | Endpoint                                         | Use                                                               |
| ------ | ------------------------------------------------ | ----------------------------------------------------------------- |
| DELETE | `/organizations/{organizationId}/users/{userId}` | Remove user from organization scope, if this operation is allowed |
| DELETE | `/admin/users/{userId}`                          | Global account deletion, highly restricted                        |

### **Recommended policy**

For ADMIN:

- No permanent deletion of global users.
- Use membership removal in the Membership module.
- Use account suspension only where organization policy allows.
- Do not affect other organizations belonging to the same user.

For SUPER_ADMIN:

- Global deletion may be allowed under a strict deletion workflow.
- Prefer soft deletion or anonymization.
- Revoke active sessions and tokens.
- Remove or anonymize personal data according to retention policy.
- Preserve required audit records.

I recommend avoiding a permanent delete endpoint during the initial MVP. Implement account status and membership removal first.

## **K. Bulk user management**

Bulk operations should be implemented after individual user creation and status updates are stable.

| Method | Endpoint                                                      | Use                        |
| ------ | ------------------------------------------------------------- | -------------------------- |
| POST   | `/organizations/{organizationId}/users/bulk`                  | Bulk create users          |
| POST   | `/organizations/{organizationId}/users/bulk-status`           | Bulk status updates        |
| POST   | `/organizations/{organizationId}/users/import/validate`       | Validate uploaded CSV data |
| POST   | `/organizations/{organizationId}/users/import`                | Start import               |
| GET    | `/organizations/{organizationId}/users/import/{jobId}`        | Import progress            |
| GET    | `/organizations/{organizationId}/users/import/{jobId}/errors` | Retrieve row errors        |

### **Bulk creation example**

```
POST /api/v1/organizations/{organizationId}/users/bulk
```

```
{
  "users": [
    {
      "firstName": "Amit",
      "lastName": "Sharma",
      "email": "amit@example.com",
      "mobile": "9999999999"
    },
    {
      "firstName": "Rahul",
      "lastName": "Patil",
      "email": "rahul@example.com",
      "mobile": "8888888888"
    }
  ]
}
```

Response:

```
{
  "success": true,
  "message": "Bulk user creation job accepted",
  "data": {
    "jobId": "job-uuid",
    "status": "QUEUED",
    "totalRecords": 2
  }
}
```

Bulk creation should be a background job rather than one long synchronous API request.

## **L. User export APIs**

| Method | Endpoint                                                           | Use                     |
| ------ | ------------------------------------------------------------------ | ----------------------- |
| POST   | `/organizations/{organizationId}/users/export`                     | Start export            |
| GET    | `/organizations/{organizationId}/users/export/{exportId}`          | Export job status       |
| GET    | `/organizations/{organizationId}/users/export/{exportId}/download` | Download generated file |

Export formats can include CSV and XLSX.

Export permissions should be separate from ordinary user read permissions because exported data is easier to misuse and may contain personal information.

# **5. Complete endpoint map – consolidated reference**

Below is the final recommended route map for the User Management module, grouped by feature. Routes marked as global are restricted to `SUPER_ADMIN`; organization-scoped routes are accessible to authorized `ADMIN` and `SUPER_ADMIN`.

This is the consolidated API contract proposal. Optional advanced endpoints such as bulk import, export, and profile avatar operations can be deferred to later releases.

## **5.1 Core user APIs**

| Method | Endpoint                                       | Role scope                      |
| ------ | ---------------------------------------------- | ------------------------------- |
| GET    | `/organizations/{orgId}/users`                 | Admin + Super Admin             |
| POST   | `/organizations/{orgId}/users`                 | Admin + Super Admin             |
| GET    | `/organizations/{orgId}/users/{userId}`        | Admin + Super Admin             |
| PATCH  | `/organizations/{orgId}/users/{userId}`        | Admin + Super Admin             |
| PATCH  | `/organizations/{orgId}/users/{userId}/status` | Admin + Super Admin             |
| DELETE | `/organizations/{orgId}/users/{userId}`        | Super Admin / policy controlled |

## **5.2 Global user APIs**

| Method | Endpoint                       | Role scope                      |
| ------ | ------------------------------ | ------------------------------- |
| GET    | `/admin/users`                 | Super Admin                     |
| POST   | `/admin/users`                 | Super Admin                     |
| GET    | `/admin/users/{userId}`        | Super Admin                     |
| PATCH  | `/admin/users/{userId}`        | Super Admin                     |
| PATCH  | `/admin/users/{userId}/status` | Super Admin                     |
| DELETE | `/admin/users/{userId}`        | Super Admin / policy controlled |

## **5.3 Account activation APIs**

| Method | Endpoint                                                    | Role scope              |
| ------ | ----------------------------------------------------------- | ----------------------- |
| POST   | `/organizations/{orgId}/users/{userId}/send-setup-email`    | Admin + Super Admin     |
| POST   | `/organizations/{orgId}/users/{userId}/resend-verification` | Admin + Super Admin     |
| GET    | `/admin/users/{userId}/activation-status`                   | Super Admin             |
| POST   | `/auth/verify-email`                                        | Public, token protected |
| POST   | `/auth/setup-password`                                      | Public, token protected |
| POST   | `/auth/resend-verification`                                 | Public, rate-limited    |

## **5.4 Password APIs**

| Method | Endpoint                                                | Role scope          |
| ------ | ------------------------------------------------------- | ------------------- |
| POST   | `/organizations/{orgId}/users/{userId}/password-reset`  | Admin + Super Admin |
| POST   | `/admin/users/{userId}/password-reset`                  | Super Admin         |
| GET    | `/organizations/{orgId}/users/{userId}/password-status` | Admin + Super Admin |

## **5.5 Profile APIs**

| Method | Endpoint                                        | Role scope          |
| ------ | ----------------------------------------------- | ------------------- |
| GET    | `/organizations/{orgId}/users/{userId}/profile` | Admin + Super Admin |
| PATCH  | `/organizations/{orgId}/users/{userId}/profile` | Admin + Super Admin |
| PUT    | `/organizations/{orgId}/users/{userId}/avatar`  | Admin + Super Admin |
| DELETE | `/organizations/{orgId}/users/{userId}/avatar`  | Admin + Super Admin |

## **5.6 Session and security APIs**

| Method | Endpoint                                                     | Role scope          |
| ------ | ------------------------------------------------------------ | ------------------- |
| GET    | `/organizations/{orgId}/users/{userId}/sessions`             | Admin + Super Admin |
| DELETE | `/organizations/{orgId}/users/{userId}/sessions/{sessionId}` | Admin + Super Admin |
| DELETE | `/organizations/{orgId}/users/{userId}/sessions`             | Admin + Super Admin |
| GET    | `/organizations/{orgId}/users/{userId}/security`             | Admin + Super Admin |

## **5.7 Activity APIs**

| Method | Endpoint                                           | Role scope          |
| ------ | -------------------------------------------------- | ------------------- |
| GET    | `/organizations/{orgId}/users/{userId}/activity`   | Admin + Super Admin |
| GET    | `/organizations/{orgId}/users/{userId}/audit-logs` | Admin + Super Admin |

## **5.8 Bulk operations**

| Method | Endpoint                                             | Role scope          |
| ------ | ---------------------------------------------------- | ------------------- |
| POST   | `/organizations/{orgId}/users/bulk`                  | Admin + Super Admin |
| POST   | `/organizations/{orgId}/users/bulk-status`           | Admin + Super Admin |
| POST   | `/organizations/{orgId}/users/import/validate`       | Admin + Super Admin |
| POST   | `/organizations/{orgId}/users/import`                | Admin + Super Admin |
| GET    | `/organizations/{orgId}/users/import/{jobId}`        | Admin + Super Admin |
| GET    | `/organizations/{orgId}/users/import/{jobId}/errors` | Admin + Super Admin |

## **5.9 Export operations**

| Method | Endpoint                                                  | Role scope          |
| ------ | --------------------------------------------------------- | ------------------- |
| POST   | `/organizations/{orgId}/users/export`                     | Admin + Super Admin |
| GET    | `/organizations/{orgId}/users/export/{exportId}`          | Admin + Super Admin |
| GET    | `/organizations/{orgId}/users/export/{exportId}/download` | Admin + Super Admin |

# **6. User Management internal architecture**

Every User Management endpoint should follow this structure:

```
HTTP Request
     │
     ▼
route.ts
     │
     ▼
Authentication
     │
     ▼
Role & Permission Authorization
     │
     ▼
Organization Scope Validation
     │
     ▼
Zod Request Validation
     │
     ▼
Controller
     │
     ▼
User Service
     │
     ├──── User Repository
     ├──── Membership Integration
     ├──── RBAC Integration (read-only when required)
     ├──── Email Service
     └──── Audit Service
                 │
                 ▼
            PostgreSQL
```

## **Responsibilities**

| Component               | Responsibility                               |
| ----------------------- | -------------------------------------------- |
| Route handler           | HTTP method, request parsing, response       |
| Auth middleware/service | Resolve authenticated user and session       |
| Authorization service   | Verify role, permission and scope            |
| Controller              | Map validated request to service call        |
| Service                 | Implement user management business rules     |
| Repository              | Execute raw SQL                              |
| Validation              | Validate request and query schemas           |
| Audit integration       | Record user management events                |
| Email integration       | Queue verification and password setup emails |

# **7. Recommended User Management folder structure**

Rather than keeping user-related business logic inside `app/api`, use the following structure.

```
src/
│
├── app/
│   └── api/
│       └── v1/
│           ├── organizations/
│           │   └── [organizationId]/
│           │       └── users/
│            │           ├── route.ts
│            │           ├── [userId]/
│            │           │   ├── route.ts
│            │           │   ├── status/route.ts
│            │           │   ├── profile/route.ts
│            │           │   ├── sessions/route.ts
│            │           │   ├── activity/route.ts
│            │           │   ├── audit-logs/route.ts
│            │           │   ├── security/route.ts
│            │           │   ├── password-reset/route.ts
│            │           │   ├── send-setup-email/route.ts
│            │           │   └── resend-verification/route.ts
│            │           └── users/
│            │                └── bulk/route.ts
│            │
│            └── admin/
│                └── users/
│                    ├── route.ts
│                    └── [userId]/
│                        ├── route.ts
│                        ├── status/route.ts
│                        ├── sessions/route.ts
│                        ├── password-reset/route.ts
│                        ├── activation-status/route.ts
│                        └── activity/route.ts
│
├── modules/
│   └── users/
│       ├── controllers/
│       │   └── user.controller.ts
│       │
│       ├── services/
│       │   ├── user.service.ts
│       │   ├── user-status.service.ts
│       │   ├── user-activation.service.ts
│       │   ├── user-security.service.ts
│       │   ├── user-profile.service.ts
│       │   └── user-activity.service.ts
│       │
│       ├── repositories/
│       │   ├── user.repository.ts
│       │   ├── user-profile.repository.ts
│       │   └── user-read.repository.ts
│       │
│       ├── validations/
│       │   ├── create-user.schema.ts
│       │   ├── update-user.schema.ts
│       │   ├── update-status.schema.ts
│       │   ├── user-query.schema.ts
│       │   ├── profile.schema.ts
│       │   └── user-id.schema.ts
│       │
│       ├── types/
│       │   ├── user.types.ts
│       │   ├── user.dto.ts
│       │   └── user.enums.ts
│       │
│       ├── mappers/
│       │   └── user.mapper.ts
│       │
│       └── constants/
│           └── user.constants.ts
│
├── lib/
│   ├── auth/
│   ├── security/
│   ├── database/
│   ├── email/
│   ├── audit/
│   └── api/
│
└── types/
```

### **What is each user service responsible for?**

| Service                      | Responsibility                                                       |
| ---------------------------- | -------------------------------------------------------------------- |
| `user.service.ts`            | Create, retrieve, list, update and manage the overall user lifecycle |
| `user-status.service.ts`     | Status transitions and account blocking rules                        |
| `user-activation.service.ts` | Verification and password setup lifecycle                            |
| `user-security.service.ts`   | Session revocation, lockout, security details                        |
| \`user-profile.service.ts    | Profile data updates                                                 |
| `user-activity.service.ts`   | Activity and audit queries                                           |

The service boundaries can be combined initially if the implementation is small, but these are logical responsibilities.

# **8. Endpoint authorization policy**

Authorization should be performed before business logic executes.

### **Permission names for this module**

| Permission code         | Purpose                              |
| ----------------------- | ------------------------------------ |
| `users.read`            | List and retrieve users              |
| `users.create`          | Create new users                     |
| `users.update`          | Update user details                  |
| `users.status.update`   | Update account status                |
| `users.activate`        | Activate eligible accounts           |
| `users.suspend`         | Suspend accounts                     |
| `users.disable`         | Disable accounts                     |
| `users.unlock`          | Unlock security-locked accounts      |
| `users.email.resend`    | Resend verification/setup email      |
| `users.password.reset`  | Initiate password reset              |
| `users.profile.read`    | Read profile information             |
| `users.profile.update`  | Update permitted profile information |
| `users.sessions.read`   | Read session information             |
| `users.sessions.revoke` | Revoke user sessions                 |
| `users.activity.read`   | Read user activity                   |
| `users.audit.read`      | Read user audit records              |
| `users.export`          | Export user information              |
| `users.delete`          | Delete/anonymize eligible users      |

\<text color="secondary" size="sm">These permissions are proposed additions to your existing RBAC permissions catalogue.\</text>

### **Recommended route authorization pattern**

```
await requirePermission({
  permission: "users.read",
  organizationId,
});

await requireOrganizationAccess({
  organizationId,
});

return userService.getUsers({
  organizationId,
  query,
});
```

For global administration:

```
await requireSystemRole("SUPER_ADMIN");

return userService.getAllUsers(query);
```

The `requireSystemRole()` and `requirePermission()` functions above are conceptual interfaces. Their exact implementation should follow your existing RBAC architecture.

### **ADMIN restrictions**

An ADMIN:

- Can only access users within their authorized organization.
- Cannot elevate users to ADMIN or SUPER_ADMIN.
- Cannot change the status of a global account in a way that impacts other organizations.
- Cannot modify another organization's membership.
- Cannot modify protected system accounts.
- Cannot grant permissions they are not authorized to delegate.
- Cannot perform unrestricted global user searches.
- Cannot access other organizations by manipulating URL IDs.

### **SUPER_ADMIN restrictions**

A SUPER_ADMIN:

- Can manage users system-wide.
- Can filter users by organization.
- Can perform controlled account recovery.
- Can revoke sessions across the system.
- Can access system-level user activity.
- Can perform restricted deletion/anonymization operations.

Even for SUPER_ADMIN, all sensitive operations should be audited.

# **9. User Management data architecture**

Your existing `core.users` table is the primary user identity table.

## **User data mapping**

| API field             | Database field                                  |
| --------------------- | ----------------------------------------------- |
| `id`                  | `core.users.id`                                 |
| `firstName`           | `core.users.first_name`                         |
| `lastName`            | `core.users.last_name`                          |
| `username`            | `core.users.username`                           |
| `email`               | `core.users.email`                              |
| `mobile`              | `core.users.mobile`                             |
| `passwordHash`        | `core.users.password_hash` — never returned     |
| `status`              | `core.users.status`                             |
| `emailVerifiedAt`     | `core.users.email_verified_at`                  |
| `mobileVerifiedAt`    | `core.users.mobile_verified_at`                 |
| `failedLoginAttempts` | `core.users.failed_login_attempts` — restricted |
| `lockedUntil`         | `core.users.locked_until` — restricted          |
| `lastLoginAt`         | `core.users.last_login_at`                      |
| `createdBy`           | `core.users.created_by`                         |
| `updatedBy`           | `core.users.updated_by`                         |
| `createdAt`           | `core.users.created_at`                         |
| `updatedAt`           | `core.users.updated_at`                         |

Profile data:

| API field         | Database field                        |
| ----------------- | ------------------------------------- |
| `displayName`     | `core.user_profiles.display_name`     |
| `bio`             | `core.user_profiles.bio`              |
| `avatarUrl`       | `core.user_profiles.avatar_url`       |
| `dateOfBirth`     | `core.user_profiles.date_of_birth`    |
| `gender`          | `core.user_profiles.gender`           |
| `alternateEmail`  | `core.user_profiles.alternate_email`  |
| `alternateMobile` | `core.user_profiles.alternate_mobile` |
| `addressLine1`    | `core.user_profiles.address_line_1`   |
| `addressLine2`    | `core.user_profiles.address_line_2`   |
| `city`            | `core.user_profiles.city`             |
| `state`           | `core.user_profiles.state`            |
| `country`         | `core.user_profiles.country`          |
| `postalCode`      | `core.user_profiles.postal_code`      |
| `timezone`        | `core.user_profiles.timezone`         |
| `locale`          | `core.user_profiles.locale`           |
| `preferences`     | `core.user_profiles.preferences`      |

## **User status lifecycle**

\<box border radius="lg" padding={3} gap={2}>\
&#x20; \<box background="surface-secondary" radius="md" padding={2} align="center">\
&#x20;   \*\*INVITED\*\*\
&#x20;   \<caption>Account created · Password not yet established\</caption>\
&#x20; \</box>\
&#x20; \<box align="center">\<icon name="arrow-down" color="secondary"/>\</box>\
&#x20; \<box background="rgba(22,163,74,0.10)" radius="md" padding={2} align="center">\
&#x20;   \*\*ACTIVE\*\*\
&#x20;   \<caption>Verified · Activated · Login allowed\</caption>\
&#x20; \</box>\
&#x20; \<grid columns={2} gap={2}>\
&#x20;   \<grid-item>\
&#x20;     \<box background="rgba(220,38,38,0.10)" radius="md" padding={2} align="center">\
&#x20;       \*\*SUSPENDED\*\*\
&#x20;       \<caption>Administratively blocked\</caption>\
&#x20;     \</box>\
&#x20;   \</grid-item>\
&#x20;   \<grid-item>\
&#x20;     \<box background="surface-secondary" radius="md" padding={2} align="center">\
&#x20;       \*\*DISABLED\*\*\
&#x20;       \<caption>Disabled account\</caption>\
&#x20;     \</box>\
&#x20;   \</grid-item>\
&#x20;   \<grid-item span={2}>\
&#x20;     \<box background="surface-secondary" radius="md" padding={2} align="center">\
&#x20;       \*\*LOCKED\*\*\
&#x20;       \<caption>Security lockout · Usually temporary\</caption>\
&#x20;     \</box>\
&#x20;   \</grid-item>\
&#x20; \</grid>\
\</box>\


Recommended state transition rules:

| From        | To          | Allowed                                     |
| ----------- | ----------- | ------------------------------------------- |
| `INVITED`   | `ACTIVE`    | After successful setup                      |
| `INVITED`   | `DISABLED`  | Administrative action                       |
| `ACTIVE`    | `SUSPENDED` | Admin/Super Admin                           |
| `ACTIVE`    | `DISABLED`  | Admin/Super Admin within scope              |
| `ACTIVE`    | `LOCKED`    | Security system                             |
| `LOCKED`    | `ACTIVE`    | Unlock after validation                     |
| `SUSPENDED` | `ACTIVE`    | Authorized administrator                    |
| `DISABLED`  | `ACTIVE`    | Authorized administrator, if policy permits |
| `SUSPENDED` | `DISABLED`  | Authorized administrator                    |

A user should not be allowed to jump to `ACTIVE` merely by submitting a status update. Activation should be validated through the activation service.

# **10. Core API workflow diagrams**

## **Workflow 1 – ADMIN creates a new user**

Email OutboxPostgreSQLUser ServiceAuthorizationUser Management APIADMINEmail OutboxPostgreSQLUser ServiceAuthorizationUser Management APIADMIN#chatgpt-mermaid-\_r_142\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_142\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_142\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_142\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_142\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_142\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_142\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_142\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_142\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_142\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_142\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_142\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_142\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_142\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_142\_ p{margin:0;}#chatgpt-mermaid-\_r_142\_ .actor{stroke:rgb(83, 154, 248);fill:rgb(222, 234, 251);stroke-width:1;}#chatgpt-mermaid-\_r_142\_ rect.actor.outer-path[data-look="neo"]{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_142\_ rect.note[data-look="neo"]{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_142\_ text.actor>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_142\_ .actor-line{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_142\_ .innerArc{stroke-width:1.5;stroke-dasharray:none;}#chatgpt-mermaid-\_r_142\_ .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_142\_ .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_142\_ [id$="-arrowhead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_142\_ .sequenceNumber{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_142\_ [id$="-sequencenumber"]{fill:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_142\_ [id$="-crosshead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_142\_ .messageText{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_142\_ .labelBox{stroke:rgba(0, 0, 0, 0.1);fill:rgb(252, 252, 252);filter:none;}#chatgpt-mermaid-\_r_142\_ .labelText,#chatgpt-mermaid-\_r_142\_ .labelText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_142\_ .loopText,#chatgpt-mermaid-\_r_142\_ .loopText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_142\_ .sectionTitle,#chatgpt-mermaid-\_r_142\_ .sectionTitle>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_142\_ .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:rgba(0, 0, 0, 0.1);fill:rgba(0, 0, 0, 0.1);}#chatgpt-mermaid-\_r_142\_ .note{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_142\_ .noteText,#chatgpt-mermaid-\_r_142\_ .noteText>tspan{fill:rgb(13, 13, 13);stroke:none;font-weight:normal;}#chatgpt-mermaid-\_r_142\_ .activation0{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_142\_ .activation1{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_142\_ .activation2{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_142\_ .actorPopupMenu{position:absolute;}#chatgpt-mermaid-\_r_142\_ .actorPopupMenuPanel{position:absolute;fill:rgb(222, 234, 251);box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#chatgpt-mermaid-\_r_142\_ .actor-man circle,#chatgpt-mermaid-\_r_142\_ line{fill:rgb(222, 234, 251);stroke-width:2px;}#chatgpt-mermaid-\_r_142\_ g rect.rect{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_142\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_142\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_142\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_142\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_142\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_142\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_142\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_142\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_142\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_142\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_142\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_142\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_142\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_142\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_142\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_142\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_142\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_142\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}POST /organizations/{orgId}/usersValidate ADMIN + users.createAuthorizedcreateUser()Check email uniquenessCreate user INVITEDCreate pending membershipCreate setup tokenCreate audit eventQueue setup emailUser created201 Created

## **Workflow 2 – User completes account activation**

Email ServicePostgreSQLAuth APIUserEmail ServicePostgreSQLAuth APIUser#chatgpt-mermaid-\_r_143\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_143\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_143\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_143\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_143\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_143\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_143\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_143\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_143\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_143\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_143\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_143\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_143\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_143\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_143\_ p{margin:0;}#chatgpt-mermaid-\_r_143\_ .actor{stroke:rgb(83, 154, 248);fill:rgb(222, 234, 251);stroke-width:1;}#chatgpt-mermaid-\_r_143\_ rect.actor.outer-path[data-look="neo"]{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_143\_ rect.note[data-look="neo"]{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_143\_ text.actor>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_143\_ .actor-line{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_143\_ .innerArc{stroke-width:1.5;stroke-dasharray:none;}#chatgpt-mermaid-\_r_143\_ .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_143\_ .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_143\_ [id$="-arrowhead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_143\_ .sequenceNumber{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_143\_ [id$="-sequencenumber"]{fill:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_143\_ [id$="-crosshead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_143\_ .messageText{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_143\_ .labelBox{stroke:rgba(0, 0, 0, 0.1);fill:rgb(252, 252, 252);filter:none;}#chatgpt-mermaid-\_r_143\_ .labelText,#chatgpt-mermaid-\_r_143\_ .labelText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_143\_ .loopText,#chatgpt-mermaid-\_r_143\_ .loopText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_143\_ .sectionTitle,#chatgpt-mermaid-\_r_143\_ .sectionTitle>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_143\_ .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:rgba(0, 0, 0, 0.1);fill:rgba(0, 0, 0, 0.1);}#chatgpt-mermaid-\_r_143\_ .note{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_143\_ .noteText,#chatgpt-mermaid-\_r_143\_ .noteText>tspan{fill:rgb(13, 13, 13);stroke:none;font-weight:normal;}#chatgpt-mermaid-\_r_143\_ .activation0{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_143\_ .activation1{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_143\_ .activation2{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_143\_ .actorPopupMenu{position:absolute;}#chatgpt-mermaid-\_r_143\_ .actorPopupMenuPanel{position:absolute;fill:rgb(222, 234, 251);box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#chatgpt-mermaid-\_r_143\_ .actor-man circle,#chatgpt-mermaid-\_r_143\_ line{fill:rgb(222, 234, 251);stroke-width:2px;}#chatgpt-mermaid-\_r_143\_ g rect.rect{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_143\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_143\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_143\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_143\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_143\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_143\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_143\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_143\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_143\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_143\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_143\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_143\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_143\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_143\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_143\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_143\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_143\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_143\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Open account setup emailVerify email tokenValidate tokenMark email verifiedSet initial passwordHash and store passwordUpdate account statusActivate eligible membershipSetup completed

## **Workflow 3 – ADMIN updates user**

Audit ServicePostgreSQLUser ServiceAuthorizationUser APIADMINAudit ServicePostgreSQLUser ServiceAuthorizationUser APIADMIN#chatgpt-mermaid-\_r_144\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_144\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_144\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_144\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_144\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_144\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_144\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_144\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_144\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_144\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_144\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_144\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_144\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_144\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_144\_ p{margin:0;}#chatgpt-mermaid-\_r_144\_ .actor{stroke:rgb(83, 154, 248);fill:rgb(222, 234, 251);stroke-width:1;}#chatgpt-mermaid-\_r_144\_ rect.actor.outer-path[data-look="neo"]{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_144\_ rect.note[data-look="neo"]{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_144\_ text.actor>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_144\_ .actor-line{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_144\_ .innerArc{stroke-width:1.5;stroke-dasharray:none;}#chatgpt-mermaid-\_r_144\_ .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_144\_ .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_144\_ [id$="-arrowhead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_144\_ .sequenceNumber{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_144\_ [id$="-sequencenumber"]{fill:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_144\_ [id$="-crosshead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_144\_ .messageText{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_144\_ .labelBox{stroke:rgba(0, 0, 0, 0.1);fill:rgb(252, 252, 252);filter:none;}#chatgpt-mermaid-\_r_144\_ .labelText,#chatgpt-mermaid-\_r_144\_ .labelText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_144\_ .loopText,#chatgpt-mermaid-\_r_144\_ .loopText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_144\_ .sectionTitle,#chatgpt-mermaid-\_r_144\_ .sectionTitle>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_144\_ .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:rgba(0, 0, 0, 0.1);fill:rgba(0, 0, 0, 0.1);}#chatgpt-mermaid-\_r_144\_ .note{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_144\_ .noteText,#chatgpt-mermaid-\_r_144\_ .noteText>tspan{fill:rgb(13, 13, 13);stroke:none;font-weight:normal;}#chatgpt-mermaid-\_r_144\_ .activation0{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_144\_ .activation1{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_144\_ .activation2{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_144\_ .actorPopupMenu{position:absolute;}#chatgpt-mermaid-\_r_144\_ .actorPopupMenuPanel{position:absolute;fill:rgb(222, 234, 251);box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#chatgpt-mermaid-\_r_144\_ .actor-man circle,#chatgpt-mermaid-\_r_144\_ line{fill:rgb(222, 234, 251);stroke-width:2px;}#chatgpt-mermaid-\_r_144\_ g rect.rect{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_144\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_144\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_144\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_144\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_144\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_144\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_144\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_144\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_144\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_144\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_144\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_144\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_144\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_144\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_144\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_144\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_144\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_144\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}PATCH /users/{userId}Validate permission + organizationAuthorizedupdateUser()Validate user scopeUpdate userRecord changeUpdated user200 OK

## **Workflow 4 – ADMIN suspends user**

PostgreSQLUser Status ServiceAuthorizationUser APIADMINPostgreSQLUser Status ServiceAuthorizationUser APIADMIN#chatgpt-mermaid-\_r_145\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_145\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_145\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_145\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_145\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_145\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_145\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_145\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_145\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_145\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_145\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_145\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_145\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_145\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_145\_ p{margin:0;}#chatgpt-mermaid-\_r_145\_ .actor{stroke:rgb(83, 154, 248);fill:rgb(222, 234, 251);stroke-width:1;}#chatgpt-mermaid-\_r_145\_ rect.actor.outer-path[data-look="neo"]{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_145\_ rect.note[data-look="neo"]{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_145\_ text.actor>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_145\_ .actor-line{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_145\_ .innerArc{stroke-width:1.5;stroke-dasharray:none;}#chatgpt-mermaid-\_r_145\_ .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_145\_ .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_145\_ [id$="-arrowhead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_145\_ .sequenceNumber{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_145\_ [id$="-sequencenumber"]{fill:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_145\_ [id$="-crosshead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_145\_ .messageText{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_145\_ .labelBox{stroke:rgba(0, 0, 0, 0.1);fill:rgb(252, 252, 252);filter:none;}#chatgpt-mermaid-\_r_145\_ .labelText,#chatgpt-mermaid-\_r_145\_ .labelText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_145\_ .loopText,#chatgpt-mermaid-\_r_145\_ .loopText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_145\_ .sectionTitle,#chatgpt-mermaid-\_r_145\_ .sectionTitle>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_145\_ .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:rgba(0, 0, 0, 0.1);fill:rgba(0, 0, 0, 0.1);}#chatgpt-mermaid-\_r_145\_ .note{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_145\_ .noteText,#chatgpt-mermaid-\_r_145\_ .noteText>tspan{fill:rgb(13, 13, 13);stroke:none;font-weight:normal;}#chatgpt-mermaid-\_r_145\_ .activation0{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_145\_ .activation1{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_145\_ .activation2{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_145\_ .actorPopupMenu{position:absolute;}#chatgpt-mermaid-\_r_145\_ .actorPopupMenuPanel{position:absolute;fill:rgb(222, 234, 251);box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#chatgpt-mermaid-\_r_145\_ .actor-man circle,#chatgpt-mermaid-\_r_145\_ line{fill:rgb(222, 234, 251);stroke-width:2px;}#chatgpt-mermaid-\_r_145\_ g rect.rect{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_145\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_145\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_145\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_145\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_145\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_145\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_145\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_145\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_145\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_145\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_145\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_145\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_145\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_145\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_145\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_145\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_145\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_145\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}PATCH user statusVerify users.status.updateAuthorizedsuspendUser()Validate actor and targetUpdate account/membership policyRevoke sessions if requiredWrite audit eventSuspension completed200 OK

# **11. Validation architecture**

Every endpoint must have its own validation schema or reuse an appropriate common schema.

Examples:

| Schema                     | Purpose                         |
| -------------------------- | ------------------------------- |
| `createUserSchema`         | New user creation               |
| `updateUserSchema`         | Partial user update             |
| `userStatusSchema`         | Valid status transition request |
| `userListQuerySchema`      | Pagination and filtering        |
| `userIdSchema`             | Validate user UUID              |
| `profileUpdateSchema`      | Profile update                  |
| `setupPasswordSchema`      | Initial password setup          |
| `resendVerificationSchema` | Email verification resend       |
| `passwordResetSchema`      | Password reset trigger          |
| `sessionRevokeSchema`      | Session revocation              |
| `bulkCreateUsersSchema`    | Bulk creation                   |

### **User creation validation example**

```
import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().email().max(255),
  username: z.string().trim().min(3).max(100).optional().nullable(),
  mobile: z.string().trim().max(20).optional().nullable(),
});
```

### **Update user validation**

```
export const updateUserSchema = z.object({
  firstName: z.string().trim().min(2).max(100).optional(),
  lastName: z.string().trim().max(100).optional().nullable(),
  username: z.string().trim().min(3).max(100).optional().nullable(),
  mobile: z.string().trim().max(20).optional().nullable(),
}).strict();
```

`strict()` is useful here to reject unexpected fields, including fields such as `status`, `passwordHash`, `roleId`, or `organizationId` if they are not permitted in the general update endpoint.

# **12. Standard response and error architecture**

All User Management endpoints should follow a consistent response structure.

### **Success**

```
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user-uuid",
    "firstName": "Amit",
    "lastName": "Sharma",
    "status": "ACTIVE"
  },
  "meta": null
}
```

### **Validation error**

```
{
  "success": false,
  "message": "Request validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

### **User not found**

```
{
  "success": false,
  "message": "User not found",
  "error": {
    "code": "USER_NOT_FOUND",
    "details": null
  }
}
```

### **Permission denied**

```
{
  "success": false,
  "message": "You do not have permission to manage this user",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  }
}
```

### **Duplicate email**

```
{
  "success": false,
  "message": "An account with this email already exists",
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "details": null
  }
}
```

### **Account state conflict**

```
{
  "success": false,
  "message": "The account cannot be activated in its current state",
  "error": {
    "code": "INVALID_USER_STATUS_TRANSITION",
    "details": {
      "currentStatus": "INVITED",
      "requestedStatus": "ACTIVE"
    }
  }
}
```

Recommended error codes:

| Code                             | HTTP |
| -------------------------------- | ---- |
| `VALIDATION_ERROR`               | 400  |
| `UNAUTHENTICATED`                | 401  |
| `FORBIDDEN`                      | 403  |
| `USER_NOT_FOUND`                 | 404  |
| `EMAIL_ALREADY_EXISTS`           | 409  |
| `USERNAME_ALREADY_EXISTS`        | 409  |
| `INVALID_USER_STATUS_TRANSITION` | 409  |
| `RATE_LIMIT_EXCEEDED`            | 429  |
| `INTERNAL_SERVER_ERROR`          | 500  |

# **13. Implementation order for the User Management module**

I recommend implementing the APIs in the following order. This order is based on dependencies, not simply the order they appear in the UI.

\<box border radius="lg" padding={3} gap={1}>\
&#x20; \<title size="lg">Phase 1 — Foundation\</title>\
&#x20; \<text color="success" weight="medium">Build first\</text>\
&#x20; \- API response/error handler\
&#x20; \- Authentication guard\
&#x20; \- Role and permission guard\
&#x20; \- Organization-scope validation\
&#x20; \- Database repositories\
&#x20; \- Zod validation\
&#x20; \- Audit integration\
\</box>\
\<box border radius="lg" padding={3} gap={1}>\
&#x20; \<title size="lg">Phase 2 — User CRUD\</title>\
&#x20; \- \`GET\` user list\
&#x20; \- \`GET\` user details\
&#x20; \- \`POST\` create user\
&#x20; \- \`PATCH\` update user\
&#x20; \- Pagination, filtering and sorting\
&#x20; \- Duplicate email/username handling\
\</box>\
\<box border radius="lg" padding={3} gap={1}>\
&#x20; \<title size="lg">Phase 3 — Account lifecycle\</title>\
&#x20; \- Account activation\
&#x20; \- Suspend/unsuspend\
&#x20; \- Disable/enable\
&#x20; \- Lock/unlock\
&#x20; \- Status validation\
&#x20; \- Session revocation\
\</box>\
\<box border radius="lg" padding={3} gap={1}>\
&#x20; \<title size="lg">Phase 4 — Account emails\</title>\
&#x20; \- Setup email\
&#x20; \- Verification email\
&#x20; \- Resend verification\
&#x20; \- Password reset request\
&#x20; \- Email outbox\
&#x20; \- Retry and delivery tracking\
\</box>\
\<box border radius="lg" padding={3} gap={1}>\
&#x20; \<title size="lg">Phase 5 — Profile & security\</title>\
&#x20; \- Profile CRUD\
&#x20; \- Sessions\
&#x20; \- Security overview\
&#x20; \- Activity timeline\
&#x20; \- User audit history\
\</box>\
\<box border radius="lg" padding={3} gap={1}>\
&#x20; \<title size="lg">Phase 6 — Advanced operations\</title>\
&#x20; \- Bulk creation\
&#x20; \- CSV import\
&#x20; \- CSV/XLSX export\
&#x20; \- Background processing\
&#x20; \- Deletion/anonymization policy\
\</box>\


# **14. Recommended MVP endpoint set**

Do not build every endpoint at the beginning. For the first production-ready iteration, implement these **12 core operations**:

| #  | Method | Endpoint                                                   | Priority |
| -- | ------ | ---------------------------------------------------------- | -------- |
| 1  | GET    | `/organizations/DIL5/users`                              | P0       |
| 2  | POST   | `/organizations/DIL6/users`                              | P0       |
| 3  | GET    | `/organizations/DIL7/users/DIL8`                       | P0       |
| 4  | PATCH  | `/organizations/DIL9/users/DIL10`                      | P0       |
| 5  | PATCH  | `/organizations/DIL11/users/DIL12/status`              | P0       |
| 6  | POST   | `/organizations/DIL13/users/DIL14/send-setup-email`    | P0       |
| 7  | POST   | `/organizations/DIL15/users/DIL16/resend-verification` | P0       |
| 8  | POST   | `/organizations/DIL17/users/DIL18/password-reset`      | P1       |
| 9  | GET    | `/organizations/DIL19/users/DIL20/security`            | P1       |
| 10 | GET    | `/organizations/DIL21/users/DIL22/sessions`            | P1       |
| 11 | GET    | `/organizations/DIL23/users/DIL24/activity`            | P1       |
| 12 | DELETE | `/organizations/DIL25/users/DIL26/sessions`            | P1       |

\<text color="secondary" size="sm">The email verification and initial password setup endpoints themselves are implemented by the Authentication module and are reused by User Management.\</text>

# **15. Final architecture summary**

\<box border radius="lg" padding={3} gap={2}>\
&#x20; \<title size="lg">User Management module\</title>\
&#x20; \<text weight="medium">Access controlled by ADMIN and SUPER_ADMIN\</text>\
&#x20; \<divider color="subtle"/>\
&#x20; \*\*Primary capabilities\*\*\


- User creation and retrieval
- User search, pagination and filtering
- User profile updates
- Account status management
- Activation and verification workflows
- Password reset initiation
- Security and session management
- User activity and audit visibility
- Bulk operations and exports (later phase)\
  \<divider color="subtle"/>\
  **Architecture**

* Next.js Route Handlers
* Controllers
* Services
* Repositories
* PostgreSQL raw SQL
* Zod validation
* Centralized RBAC
* HTTP-only cookie authentication
* Audit service
* Email outbox\
  \</box>

### **My recommendation for your project**

Keep User Management as a **separate, well-defined module** that manages the global identity `core.users` table, but use organization-scoped routes to manage users within an ADMIN's authorized organization.

This prevents the biggest architectural mistake in SecureGateControl: treating a user account, an employee, an organization membership, and a role assignment as the same entity.

The next implementation step should be to convert this architecture into a **User Management API specification document**, with each endpoint fully defined by request params, body schemas, authorization rules, SQL operations, response schemas, validation errors, and service flow—before starting the Route Handler code.
