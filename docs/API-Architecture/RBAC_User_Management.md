Yes. I recommend upgrading the previous API design before implementation.

Your previous API list is a good starting point, but for **SecureGateControl, I would design a more advanced, production-ready User Management and Invitation System.**

We need to consider more than basic CRUD:

- Multiple organizations and shared user accounts.
- SUPER_ADMIN and ADMIN responsibilities.
- Organization-specific role assignment.
- Employee onboarding through invitations.
- Existing users joining additional organizations.
- Account suspension versus organization membership suspension.
- Invitation expiration, resending and revocation.
- Secure authentication and authorization.
- Audit logs and administrative activity.
- Pagination, searching, filtering and bulk operations.

I would not add endpoints just to increase their number. Every endpoint should have a clear responsibility.

# **1. Final proposed API architecture**

I recommend dividing the functionality into six independent API modules.

**User Management**

Core

Account creation, user listing, details, updates and status.

**Organization Membership**

Core

Organization-specific user membership and access.

**Invitation Management**

Core

Employee onboarding, invitation lifecycle and acceptance.

**Role & Permission Management**

Core

Role assignment, delegation and permission checks.

**My Account**

Self-service

Personal profile, password, avatar and sessions.

**Audit & Activity**

Advanced

Track administrative changes and security events.

# **2. Module A – User Management APIs**

Base path:

`/api/organizations/:organizationId/users`

These APIs are primarily for SUPER_ADMIN and ADMIN, with permissions determining what other staff can do.

| Method | Endpoint              | Responsibility                              |
| ------ | --------------------- | ------------------------------------------- |
| POST   | `/`                   | Create/invite a new organization user       |
| GET    | `/`                   | List organization users                     |
| GET    | `/:userId`            | Get complete user details                   |
| PATCH  | `/:userId`            | Update basic user information               |
| PATCH  | `/:userId/status`     | Change global account status, if authorized |
| GET    | `/:userId/activity`   | Get user activity summary                   |
| GET    | `/:userId/audit-logs` | View administrative audit history           |
| POST   | `/bulk`               | Bulk create/invite users                    |
| POST   | `/export`             | Export organization user data               |
| GET    | `/export/:exportId`   | Retrieve export job status/result           |

### **Advanced listing functionality**

Your `GET /` should support:

| Query parameter    | Purpose                           |
| ------------------ | --------------------------------- |
| `page`             | Current page                      |
| `limit`            | Records per page                  |
| `search`           | Search name, email or mobile      |
| `status`           | Filter by account status          |
| `membershipStatus` | Filter by membership status       |
| `roleId`           | Filter by assigned role           |
| `sortBy`           | Sort by name, email, created date |
| `sortOrder`        | ASC / DESC                        |
| `dateFrom`         | Filter creation date              |
| `dateTo`           | Filter creation date              |

Example:

```
GET /api/organizations/org-uuid/users
    ?page=1
    &limit=20
    &search=amit
    &membershipStatus=ACTIVE
    &sortBy=created_at
    &sortOrder=DESC
```

**Important:** Organization ADMIN must only see users within their authorized organization scope, regardless of the query parameters supplied.

# **3. Module B – Organization Membership APIs**

Base path:

`/api/organizations/:organizationId/users/:userId/membership`

This module is important because your database allows one user to belong to multiple organizations.

| Method | Endpoint   | Responsibility                             |
| ------ | ---------- | ------------------------------------------ |
| GET    | `/`        | Get membership details                     |
| PATCH  | `/`        | Update membership information              |
| PATCH  | `/status`  | Activate, suspend or deactivate membership |
| DELETE | `/`        | Remove user from organization              |
| GET    | `/history` | View membership history                    |

For example:

Rahul belongs to Organization A and Organization B.

If Organization A removes Rahul, his global account should not be deleted, and his membership in Organization B should remain untouched.

This is why membership management must be separate from global user management.

# **4. Module C – Advanced Invitation Management APIs**

Base paths:

- Administrative: `/api/organizations/:organizationId/invitations`
- Public acceptance: `/api/invitations`

This is the upgraded invitation architecture.

| Method | Endpoint                                                       | Responsibility                            |
| ------ | -------------------------------------------------------------- | ----------------------------------------- |
| POST   | `/api/organizations/:organizationId/invitations`               | Create and send invitation                |
| GET    | `/api/organizations/:organizationId/invitations`               | List organization invitations             |
| GET    | `/api/organizations/:organizationId/invitations/:invitationId` | Get invitation details                    |
| POST   | `/:invitationId/resend`                                        | Resend invitation                         |
| POST   | `/:invitationId/revoke`                                        | Revoke invitation                         |
| POST   | `/api/invitations/validate`                                    | Validate invitation token                 |
| POST   | `/api/invitations/accept`                                      | Accept invitation and complete onboarding |
| POST   | `/api/organizations/:organizationId/invitations/bulk`          | Send multiple invitations                 |

The resend and revoke endpoints above are relative to the administrative base path.

### **Advanced invitation features**

I recommend supporting these invitation states:

**PENDING**

Awaiting acceptance

**ACCEPTED**

Completed

**EXPIRED**

Expired

**REVOKED**

Cancelled

Additional requirements:

- Configurable invitation expiration.
- Resend limits and rate limiting.
- New token on every resend.
- Old invitation token invalidation.
- Duplicate pending invitation prevention.
- Invitation history.
- Email delivery status and failure tracking.
- Organization-specific role assignment.
- Secure token hashing.
- Audit logging.

### **One important improvement to your database**

Your existing `auth.invitations` table has `user_id`, `email`, `token_hash`, `expires_at`, `accepted_at` and `revoked_at`.

However, I recommend adding:

| Additional field/table | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `organization_id`      | Identifies the organization being joined        |
| `invitation_roles`     | Stores the roles offered in the invitation      |
| `status`               | Explicit invitation lifecycle state, if desired |
| `last_sent_at`         | Tracks last email delivery attempt              |
| `resend_count`         | Tracks resend attempts                          |

I particularly recommend `organization_id` and a separate invitation-role relationship. These are important when an existing user is invited into another organization.

**Important onboarding behavior:**

- New user: Create an invited account and pending membership; activate the account and membership after acceptance.
- Existing user: Do not create another account. Authenticate the existing user, then activate the new organization membership after acceptance.
- Assign organization roles only when the membership is active, respecting your existing role-assignment trigger.

# **5. Module D – Role & Permission Management APIs**

Base path:

`/api/organizations/:organizationId/users/:userId/roles`

| Method | Endpoint     | Responsibility                         |
| ------ | ------------ | -------------------------------------- |
| GET    | `/`          | Get assigned roles                     |
| POST   | `/`          | Assign a role                          |
| PUT    | `/`          | Replace user role assignments          |
| DELETE | `/:roleId`   | Remove a role                          |
| GET    | `/available` | List roles assignable by current admin |
| GET    | `/history`   | View role assignment history           |

Additional system-level APIs:

Base path: `/api/rbac`

| Method | Endpoint                     | Responsibility             |
| ------ | ---------------------------- | -------------------------- |
| GET    | `/roles`                     | List available roles       |
| GET    | `/roles/:roleId`             | Get role details           |
| GET    | `/permissions`               | List permissions           |
| GET    | `/roles/:roleId/permissions` | Get role permissions       |
| PUT    | `/roles/:roleId/permissions` | Update role permissions    |
| GET    | `/delegations`               | View role delegation rules |

These endpoints must enforce your existing `role_delegations` and `role_permission_grants` rules.

For example, an ADMIN cannot assign another ADMIN role simply because the frontend displays it. The backend must verify the delegation policy.

# **6. Module E – My Account APIs**

Base path:

`/api/users/me`

These APIs are for the currently authenticated user.

| Method | Endpoint               | Responsibility                   |
| ------ | ---------------------- | -------------------------------- |
| GET    | `/`                    | Get current user                 |
| PATCH  | `/`                    | Update basic account information |
| GET    | `/profile`             | Get personal profile             |
| PATCH  | `/profile`             | Update personal profile          |
| PUT    | `/avatar`              | Upload or replace avatar         |
| DELETE | `/avatar`              | Remove avatar                    |
| PATCH  | `/password`            | Change own password              |
| GET    | `/organizations`       | List user's organizations        |
| GET    | `/sessions`            | List active sessions             |
| DELETE | `/sessions/:sessionId` | Revoke a particular session      |
| DELETE | `/sessions`            | Revoke all other sessions        |
| GET    | `/security`            | Get account security information |

Authentication-related APIs:

Base path: `/api/auth`

| Method | Endpoint           | Responsibility         |
| ------ | ------------------ | ---------------------- |
| POST   | `/forgot-password` | Request password reset |
| POST   | `/reset-password`  | Reset password         |
| POST   | `/verify-email`    | Verify email           |
| POST   | `/logout`          | Logout current session |
| POST   | `/logout-all`      | Logout all sessions    |

# **7. Module F – Audit & Activity APIs**

Base path:

`/api/organizations/:organizationId/audit-logs`

| Method | Endpoint  | Responsibility               |
| ------ | --------- | ---------------------------- |
| GET    | `/`       | List organization audit logs |
| GET    | `/:logId` | Get audit log details        |
| POST   | `/export` | Export audit history         |

Possible filters:

- `actorId`
- `targetUserId`
- `action`
- `entityType`
- `dateFrom`
- `dateTo`
- `page`
- `limit`

For example, the system should record:

- ADMIN created a user.
- ADMIN sent an invitation.
- ADMIN revoked an invitation.
- ADMIN changed a user's role.
- ADMIN suspended a membership.
- SUPER_ADMIN changed an organization administrator.

These actions should be recorded in your existing `audit.audit_logs` table, and security-related events in `audit.security_events`.

Audit records should be append-only from the application's normal administrative workflows.

# **8. Complete recommended folder structure**

Here is the proposed advanced Next.js App Router structure.

```
src/app/api/
│
├── users/
│   └── me/
│       ├── route.ts
│       ├── password/route.ts
│       ├── profile/route.ts
│       ├── avatar/route.ts
│       ├── organizations/route.ts
│       ├── sessions/
│       │   ├── route.ts
│       │   └── [sessionId]/route.ts
│       └── security/route.ts
│
├── organizations/
│   └── [organizationId]/
│       ├── users/
│       │   ├── route.ts
│       │   ├── bulk/route.ts
│       │   ├── export/route.ts
│       │   ├── export/[exportId]/route.ts
│       │   └── [userId]/
│       │       ├── route.ts
│       │       ├── status/route.ts
│       │       ├── activity/route.ts
│       │       ├── audit-logs/route.ts
│       │       ├── membership/
│       │       │   ├── route.ts
│       │       │   ├── status/route.ts
│       │       │   └── history/route.ts
│       │       └── roles/
│       │           ├── route.ts
│       │           ├── available/route.ts
│       │           └── history/route.ts
│       │
│       ├── invitations/
│       │   ├── route.ts
│       │   ├── bulk/route.ts
│       │   └── [invitationId]/
│       │       ├── route.ts
│       │       ├── resend/route.ts
│       │       └── revoke/route.ts
│       │
│       └── audit-logs/
│           ├── route.ts
│           ├── export/route.ts
│           └── [logId]/route.ts
│
├── invitations/
│   ├── validate/route.ts
│   └── accept/route.ts
│
├── rbac/
│   ├── roles/
│   │   ├── route.ts
│   │   └── [roleId]/
│   │       ├── route.ts
│   │       └── permissions/route.ts
│   ├── permissions/route.ts
│   └── delegations/route.ts
│
└── auth/
    ├── forgot-password/route.ts
    ├── reset-password/route.ts
    ├── verify-email/route.ts
    ├── logout/route.ts
    └── logout-all/route.ts
```

This is the target architecture, not a recommendation to implement every route immediately.

# **9. Additional production-level requirements**

The API list alone is not enough. I recommend these backend standards across all six modules.

| Requirement       | Implementation                                            |
| ----------------- | --------------------------------------------------------- |
| Authentication    | Existing JWT/cookie authentication                        |
| Authorization     | Centralized RBAC permission checks                        |
| Validation        | Zod                                                       |
| Database          | PostgreSQL transactions                                   |
| Pagination        | Standardized page/limit                                   |
| Error handling    | Centralized API error responses                           |
| Rate limiting     | Login, invitation, password reset                         |
| Audit logging     | Administrative operations                                 |
| Email delivery    | Nodemailer with background job processing                 |
| File uploads      | Avatar type and size validation                           |
| Security          | Token hashing, expiry, replay prevention                  |
| Concurrency       | Prevent duplicate invitations and conflicting assignments |
| API documentation | OpenAPI / Swagger                                         |

Some additional recommendations:

1. **Idempotency:** Prevent duplicate invitations when an admin accidentally submits the same request multiple times.
2. **Email queue:** If an email provider fails, the invitation should not be lost. Track delivery attempts and retry safely.
3. **Atomic transactions:** User, membership, invitation and role-related changes should be consistent.
4. **Organization isolation:** Never trust an organization ID simply because it was supplied in a URL.
5. **Sensitive operations:** Require appropriate authorization and potentially additional verification for changing privileged roles.

## **10. Important database changes before implementation**

After reviewing your existing RBAC SQL, I would make these changes before implementing the advanced APIs.

| Existing database         | Recommended improvement                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `core.users`              | Keep global account status separate from membership status       |
| `core.user_organizations` | Consider adding `PENDING` membership status                      |
| `auth.invitations`        | Add `organization_id`                                            |
| `auth.invitations`        | Add resend tracking and delivery information                     |
| Invitation roles          | Add `auth.invitation_roles`                                      |
| Audit logs                | Add invitation and membership lifecycle events                   |
| Email processing          | Add an email outbox/queue table if using database-backed retries |

There are two particularly important points:

- Your current membership constraint allows only `ACTIVE`, `INACTIVE`, and `SUSPENDED`. It does not support `PENDING`.
- Your existing `validate_user_role_scope()` trigger requires active organization membership before assigning a role.

Therefore, the invitation acceptance workflow and role assignment must be designed together. We should not assign an active organization role to a user whose invitation is still pending.

# **11. What should we actually implement first?**

Although I have proposed an advanced architecture, I don't recommend implementing all these APIs immediately.

**Recommended implementation roadmap**

1. **Phase 1 – My Account**

   Essential

   Profile, password, avatar and current-user APIs.
2. **Phase 2 – User Management**

   Essential

   Create, list, search, view and update users.
3. **Phase 3 – Organization Membership**

   Essential

   Membership management and organization-specific user status.
4. **Phase 4 – Invitation Management**

   Essential

   Create, send, validate, accept, resend and revoke invitations.
5. **Phase 5 – Role Management**

   Essential

   Assign roles, remove roles and enforce delegation.
6. **Phase 6 – Audit & Security**

   Advanced

   Activity logs, security events and session management.
7. **Phase 7 – Advanced Operations**

   Later

   Bulk invitations, exports, background jobs and analytics.

# **12. My final recommendation**

I would consider the six-module architecture above our target User Management API architecture for SecureGateControl.

However, I want to settle three decisions before we start coding.

**1. How should ADMIN create employees?**

Invitation only (recommended)

Both direct creation and invitation

**2. What happens when an invited email already belongs to an existing user?**

Reuse existing account and add new organization membership (recommended)

Reject invitation and ask ADMIN to use another email

**3. Should we implement bulk employee invitations?**

Yes, from the beginning

Later, after individual invitations work (recommended)

Confirm architecture decisions

Once these are decided, we'll have a clear API specification to follow. Then we can work on each endpoint in your existing Next.js project without repeatedly changing the architecture.
