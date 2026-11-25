# **User Management — Complete API List**

**Module:** User Management\
**Base URL:** `/api/v1`\
**Access:** `ADMIN` and `SUPER_ADMIN` only\
**Architecture:** REST API · Next.js 16 App Router · TypeScript · PostgreSQL

The following is the complete endpoint inventory for the **User Management module**, grouped by functionality. It covers account management, profiles, lifecycle, security, sessions, activity, and advanced operations.

## **1. User CRUD APIs**

| # | Method | Endpoint                                         | Purpose                                                   |
| - | ------ | ------------------------------------------------ | --------------------------------------------------------- |
| 1 | GET    | `/organizations/{organizationId}/users`          | List users with pagination, search, filtering and sorting |
| 2 | POST   | `/organizations/{organizationId}/users`          | Create a new user account                                 |
| 3 | GET    | `/organizations/{organizationId}/users/{userId}` | Get complete user details                                 |
| 4 | PATCH  | `/organizations/{organizationId}/users/{userId}` | Update user basic information                             |
| 5 | DELETE | `/organizations/{organizationId}/users/{userId}` | Delete/deactivate a user (policy-controlled)              |

## **2. User Status & Lifecycle APIs**

| #  | Method | Endpoint                                                  | Purpose                                      |
| -- | ------ | --------------------------------------------------------- | -------------------------------------------- |
| 6  | PATCH  | `/organizations/{organizationId}/users/{userId}/status`   | Change account status                        |
| 7  | POST   | `/organizations/{organizationId}/users/{userId}/activate` | Activate account when permitted              |
| 8  | POST   | `/organizations/{organizationId}/users/{userId}/suspend`  | Temporarily suspend account                  |
| 9  | POST   | `/organizations/{organizationId}/users/{userId}/disable`  | Permanently/administratively disable account |
| 10 | POST   | `/organizations/{organizationId}/users/{userId}/unlock`   | Unlock a locked account                      |

## **3. Account Setup & Email APIs**

| #  | Method | Endpoint                                                             | Purpose                          |
| -- | ------ | -------------------------------------------------------------------- | -------------------------------- |
| 11 | POST   | `/organizations/{organizationId}/users/{userId}/send-setup-email`    | Send initial account setup email |
| 12 | POST   | `/organizations/{organizationId}/users/{userId}/resend-verification` | Resend verification email        |
| 13 | GET    | `/organizations/{organizationId}/users/{userId}/activation-status`   | Check account activation status  |

## **4. Password Management APIs**

| #  | Method | Endpoint                                                         | Purpose                           |
| -- | ------ | ---------------------------------------------------------------- | --------------------------------- |
| 14 | POST   | `/organizations/{organizationId}/users/{userId}/password-reset`  | Admin initiates password reset    |
| 15 | GET    | `/organizations/{organizationId}/users/{userId}/password-status` | Check password setup/reset status |

Password safety: Admins can initiate a reset but cannot view or directly set a user's password.

## **5. User Profile APIs**

| #  | Method | Endpoint                                                 | Purpose                          |
| -- | ------ | -------------------------------------------------------- | -------------------------------- |
| 16 | GET    | `/organizations/{organizationId}/users/{userId}/profile` | Retrieve user profile            |
| 17 | PATCH  | `/organizations/{organizationId}/users/{userId}/profile` | Update profile information       |
| 18 | PUT    | `/organizations/{organizationId}/users/{userId}/avatar`  | Upload or replace profile avatar |
| 19 | DELETE | `/organizations/{organizationId}/users/{userId}/avatar`  | Remove profile avatar            |

## **6. User Security APIs**

| #  | Method | Endpoint                                                              | Purpose                                                 |
| -- | ------ | --------------------------------------------------------------------- | ------------------------------------------------------- |
| 20 | GET    | `/organizations/{organizationId}/users/{userId}/security`             | Security overview, login status and security indicators |
| 21 | GET    | `/organizations/{organizationId}/users/{userId}/sessions`             | List active and historical sessions                     |
| 22 | DELETE | `/organizations/{organizationId}/users/{userId}/sessions/{sessionId}` | Revoke a specific session                               |
| 23 | DELETE | `/organizations/{organizationId}/users/{userId}/sessions`             | Revoke all user sessions                                |

## **7. User Activity & Audit APIs**

| #  | Method | Endpoint                                                    | Purpose                                  |
| -- | ------ | ----------------------------------------------------------- | ---------------------------------------- |
| 24 | GET    | `/organizations/{organizationId}/users/{userId}/activity`   | User activity summary                    |
| 25 | GET    | `/organizations/{organizationId}/users/{userId}/audit-logs` | Get audit records associated with a user |

## **8. Bulk User Management APIs**

Phase 2 / Advanced

| #  | Method | Endpoint                                                      | Purpose                               |
| -- | ------ | ------------------------------------------------------------- | ------------------------------------- |
| 26 | POST   | `/organizations/{organizationId}/users/bulk`                  | Create multiple users                 |
| 27 | POST   | `/organizations/{organizationId}/users/bulk-status`           | Change status for multiple users      |
| 28 | POST   | `/organizations/{organizationId}/users/import/validate`       | Validate CSV/Excel user import data   |
| 29 | POST   | `/organizations/{organizationId}/users/import`                | Initiate bulk import                  |
| 30 | GET    | `/organizations/{organizationId}/users/import/{jobId}`        | Check import job status               |
| 31 | GET    | `/organizations/{organizationId}/users/import/{jobId}/errors` | Get import validation/failure details |

## **9. User Export APIs**

Phase 2 / Advanced

| #  | Method | Endpoint                                                           | Purpose                        |
| -- | ------ | ------------------------------------------------------------------ | ------------------------------ |
| 32 | POST   | `/organizations/{organizationId}/users/export`                     | Generate user export           |
| 33 | GET    | `/organizations/{organizationId}/users/export/{exportId}`          | Check export job status        |
| 34 | GET    | `/organizations/{organizationId}/users/export/{exportId}/download` | Download generated export file |

## **10. SUPER_ADMIN — Global User Management APIs**

These endpoints are reserved for `SUPER_ADMIN`, who has system-wide user access.

| #  | Method | Endpoint                                  | Purpose                             |
| -- | ------ | ----------------------------------------- | ----------------------------------- |
| 35 | GET    | `/admin/users`                            | List all system users               |
| 36 | POST   | `/admin/users`                            | Create a global user                |
| 37 | GET    | `/admin/users/{userId}`                   | Get any user globally               |
| 38 | PATCH  | `/admin/users/{userId}`                   | Update any user's basic information |
| 39 | PATCH  | `/admin/users/{userId}/status`            | Change global account status        |
| 40 | DELETE | `/admin/users/{userId}`                   | Delete/soft-delete a global user    |
| 41 | GET    | `/admin/users/{userId}/activation-status` | Check global activation status      |
| 42 | POST   | `/admin/users/{userId}/password-reset`    | Initiate global password reset      |
| 43 | GET    | `/admin/users/{userId}/sessions`          | View sessions globally              |
| 44 | DELETE | `/admin/users/{userId}/sessions`          | Revoke all global sessions          |
| 45 | GET    | `/admin/users/{userId}/activity`          | View global activity                |
| 46 | GET    | `/admin/users/{userId}/audit-logs`        | View global audit history           |

## **11. Recommended API count**

# **46 Endpoints**

Complete proposed User Management API inventory

Core CRUD & lifecycle

**10**

Setup & password

**5**

Profile

**4**

Security & sessions

**4**

Activity & audit

**2**

Bulk & import

**6**

Export

**3**

SUPER_ADMIN global

**12**

## **12. Module boundary**

| Module                    | Responsibility                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **User Management**       | User accounts, basic details, status, profile, account security overview               |
| **Authentication**        | Login, JWT, refresh tokens, verification, password setup/reset, session authentication |
| **Membership Management** | Organization-user relationships and membership status                                  |
| **RBAC**                  | Roles, permissions and role assignments                                                |
| **Invitation Management** | Organization invitations and acceptance workflow                                       |
| **Audit Management**      | Audit record creation, storage and retrieval                                           |
| **Employee Management**   | Employee-specific information independent of login accounts                            |

This separation prevents User Management from becoming a monolithic module.

**Recommended implementation order:** Core CRUD → Status lifecycle → Account setup/email → Profile → Security & sessions → Activity/audit → Bulk operations → Export.

This is the complete API list for planning. The next step should be to finalize which endpoints belong in the **User Management MVP**, then document each endpoint's request parameters, body, validation, permission checks, database operations, and response schema before coding.
