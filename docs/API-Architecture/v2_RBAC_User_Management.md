# **SecureGateControl – Complete Production-Ready API Architecture**

Architecture baseline · Version 1.0 · Requirements consolidated · Implementation-ready design proposal

I’ll proceed without asking more questions. I’ll treat the decisions already made as fixed, use sensible defaults for the unanswered requirements, and clearly identify recommendations that still need validation.

This design covers all ten selected modules:

1. Organization Management
2. User Management
3. Organization Membership
4. Invitation Management
5. RBAC – Roles and Permissions
6. Audit and Security
7. Authentication
8. Employee Management
9. Visitor Management
10. Gate Control

The design uses your supplied PostgreSQL RBAC architecture and the User Management document as its foundation. The supplied user-management document defines six core API areas—users, memberships, invitations, roles and permissions, my account, and audit—and recommends organization isolation, transactional changes, secure tokens, rate limiting, and background email delivery.&#x20;

RBAC_User_Management.md



## **1. Confirmed decisions and design defaults**

### **Confirmed decisions**

| Area                       | Decision                              |
| -------------------------- | ------------------------------------- |
| Backend framework          | Next.js App Router Route Handlers     |
| Language                   | TypeScript                            |
| Database                   | PostgreSQL                            |
| Database access            | Raw SQL using `pg`                    |
| Authentication             | Hybrid JWT + refresh token            |
| Token storage              | HTTP-only cookies                     |
| User onboarding            | Direct creation and invitation        |
| Direct creation activation | Email verification and password setup |
| API consumers              | Internal Next.js frontend             |
| Architecture               | Modular monolith                      |
| API style                  | REST                                  |
| Validation                 | Zod                                   |
| Email                      | Nodemailer                            |

### **Defaults I am adopting where a decision was not supplied**

These are architecture recommendations, not previously confirmed requirements.

| Area                      | Proposed default                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| API version               | `/api/v1`                                                                                                      |
| Access token lifetime     | 10 minutes                                                                                                     |
| Refresh token lifetime    | 30 days                                                                                                        |
| Refresh token             | Random opaque token, stored as a hash                                                                          |
| Refresh behavior          | Rotation on every refresh                                                                                      |
| Invitation expiry         | 7 days                                                                                                         |
| Password reset expiry     | 15 minutes                                                                                                     |
| Email verification expiry | 24 hours                                                                                                       |
| Pagination                | Page-based, maximum 100 records                                                                                |
| Existing email            | Reuse the global account; require the existing user to authenticate and accept the new organization membership |
| Custom roles              | SUPER_ADMIN manages system roles; organization-specific custom roles are a controlled extension                |
| Bulk onboarding           | Supported as a later phase, after individual onboarding is stable                                              |
| Gate commands             | Asynchronous command/acknowledgement workflow                                                                  |
| Employee identity         | Separate employee record from login account                                                                    |

**Important distinction:** A `core.users` account represents a person’s SecureGateControl login identity. An employee record represents that person’s employment or organizational identity. Not every employee must have a login account.

## **2. High-level architecture**

**Next.js Frontend**

Admin dashboard · Guard dashboard · Employee management · Gate control UI

HTTPS · HTTP-only cookies

**Next.js API Layer –&#x20;**`/api/v1`

Route Handlers · Authentication · Validation · Authorization · Error handling

**Application / Business Layer**

Auth

Organizations

Users

Memberships

Invitations

RBAC

Audit

Employees

Visitors

Gate Control

**PostgreSQL**

Source of truth · Transactions · Audit

**Redis / Queue**

Rate limits · Jobs · Realtime events

**Nodemailer**

Verification · Invitations · Password reset

**MQTT Gateway**

Raspberry Pi · ESP32 · Gate commands

The API layer must not directly contain business logic or large SQL queries. Each module should have its own service and repository layer.

### **Gate communication boundary**

For your Raspberry Pi deployment, the recommended communication path is:

**Next.js Gate API**

**Gate Command Service / MQTT Client**

**Raspberry Pi MQTT Broker**

**ESP32 Gate Controller**

Stepper driver · Gate state · Fault / emergency status

The browser must never connect directly to the MQTT broker with unrestricted device credentials. The backend should authorize the request, publish the command, track its status, and process the ESP32 acknowledgement.

## **3. API conventions**

### **Base URL**

```
/api/v1
```

Examples:

```
/api/v1/auth/login
/api/v1/users/me
/api/v1/organizations
/api/v1/organizations/{organizationId}/users
/api/v1/organizations/{organizationId}/employees
/api/v1/organizations/{organizationId}/visitors
/api/v1/organizations/{organizationId}/gates
```

### **HTTP methods**

| Method | Purpose                                      |
| ------ | -------------------------------------------- |
| GET    | Retrieve data                                |
| POST   | Create resource or execute an action         |
| PUT    | Replace a resource or complete configuration |
| PATCH  | Partially update a resource                  |
| DELETE | Delete or revoke a resource                  |

Use `POST` for operations such as `open`, `close`, `resend`, `accept`, and `revoke` where they represent actions rather than simple data updates.

### **Standard success response**

```
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "firstName": "Amit",
    "lastName": "Sharma",
    "email": "amit@example.com"
  },
  "meta": null
}
```

### **Standard error response**

```
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  }
}
```

### **HTTP status codes**

| Status | Usage                                                |
| ------ | ---------------------------------------------------- |
| 200    | Successful retrieval/update/action                   |
| 201    | Resource created                                     |
| 202    | Asynchronous operation accepted                      |
| 204    | Successful deletion/revocation with no response body |
| 400    | Invalid request                                      |
| 401    | Unauthenticated                                      |
| 403    | Unauthorized by permissions                          |
| 404    | Resource not found in accessible scope               |
| 409    | Conflict or duplicate                                |
| 422    | Valid JSON but invalid business data                 |
| 429    | Rate limit exceeded                                  |
| 500    | Unexpected server error                              |
| 503    | Dependency unavailable                               |

### **Pagination**

Example:

```
GET /api/v1/organizations/{organizationId}/users
?page=1&limit=20&search=amit&sortBy=createdAt&sortOrder=DESC
```

Response metadata:

```
{
  "page": 1,
  "limit": 20,
  "total": 125,
  "totalPages": 7
}
```

Use allowlisted sort fields. Never concatenate raw user-provided sort columns into SQL.

## **4. Complete API module design**

The following is the proposed endpoint inventory. The routes are designed as a coherent API surface; they do not imply that every endpoint must be implemented in the first release.

### **Module A – Authentication**

Base path: `/api/v1/auth`

| Method | Endpoint               | Responsibility                                    |
| ------ | ---------------------- | ------------------------------------------------- |
| POST   | `/login`               | Authenticate using email and password             |
| POST   | `/refresh`             | Rotate refresh token and issue a new access token |
| POST   | `/logout`              | Revoke current session                            |
| POST   | `/logout-all`          | Revoke all sessions                               |
| POST   | `/forgot-password`     | Request password reset                            |
| POST   | `/reset-password`      | Set a new password using a reset token            |
| POST   | `/verify-email`        | Verify email address                              |
| POST   | `/resend-verification` | Send a new verification link                      |
| POST   | `/setup-password`      | Complete initial password setup                   |
| GET    | `/session`             | Retrieve current authenticated session            |

**Authentication flow**

1. User submits credentials.
2. Backend validates account status and password.
3. Backend creates a session.
4. Backend issues a short-lived JWT access token.
5. Backend generates a random refresh token and stores its hash.
6. Both tokens are set as HTTP-only cookies.
7. Refresh rotates the refresh token and updates the session.
8. Logout revokes the session and clears the cookies.

Recommended cookie defaults:

| Cookie        | HttpOnly | Secure            | SameSite      | Path           |
| ------------- | -------- | ----------------- | ------------- | -------------- |
| Access token  | Yes      | Yes in production | Lax           | `/`            |
| Refresh token | Yes      | Yes in production | Strict or Lax | `/api/v1/auth` |

Use HTTPS in production, CSRF protection for cookie-authenticated state-changing requests, strict origin checks, and appropriate cookie-domain configuration. `SameSite` alone should not be treated as complete CSRF protection.

**JWT claims should remain minimal:**

```
{
  "sub": "user-uuid",
  "sid": "session-uuid",
  "iss": "securegatecontrol",
  "aud": "securegatecontrol-api",
  "iat": 1790000000,
  "exp": 1790000600
}
```

Do not rely on long-lived role or permission claims inside the JWT. Resolve current permissions server-side so that role changes and account suspensions take effect promptly.

### **Module B – Organization Management**

Base path: `/api/v1/organizations`

| Method | Endpoint                       | Responsibility                          |
| ------ | ------------------------------ | --------------------------------------- |
| POST   | `/`                            | Create organization                     |
| GET    | `/`                            | List organizations accessible to caller |
| GET    | `/{organizationId}`            | Get organization details                |
| PATCH  | `/{organizationId}`            | Update organization                     |
| PATCH  | `/{organizationId}/status`     | Activate, deactivate or suspend         |
| GET    | `/{organizationId}/settings`   | Get settings                            |
| PUT    | `/{organizationId}/settings`   | Update settings                         |
| GET    | `/{organizationId}/members`    | List organization members               |
| GET    | `/{organizationId}/statistics` | Organization summary                    |

**Authorization boundary**

- `SUPER_ADMIN`: manage organizations across the system.
- `ADMIN`: access only their authorized organization.
- Other roles: only the organization data permitted by their assigned permissions.

Organization IDs in URLs are identifiers, not proof of authorization.

### **Module C – User Management**

Base path: `/api/v1/organizations/{organizationId}/users`

| Method | Endpoint               | Responsibility                                                  |
| ------ | ---------------------- | --------------------------------------------------------------- |
| POST   | `/`                    | Directly create user and send verification/password setup email |
| GET    | `/`                    | List organization users                                         |
| GET    | `/{userId}`            | Get user details                                                |
| PATCH  | `/{userId}`            | Update user information                                         |
| PATCH  | `/{userId}/status`     | Change global account status, if authorized                     |
| GET    | `/{userId}/activity`   | User activity summary                                           |
| GET    | `/{userId}/audit-logs` | User audit history                                              |
| POST   | `/bulk`                | Bulk user creation, later phase                                 |
| POST   | `/export`              | Start user export                                               |
| GET    | `/export/{exportId}`   | Retrieve export status/result                                   |

Suggested list filters:

```
?page=1
&limit=20
&search=amit
&status=ACTIVE
&membershipStatus=ACTIVE
&roleId=uuid
&sortBy=createdAt
&sortOrder=DESC
&dateFrom=2026-01-01
&dateTo=2026-12-31
```

The list endpoint must only return users with a membership in the requested organization, unless the caller has an explicit global administrative permission.

**Direct creation flow**

```
ADMIN creates user
       ↓
Validate permissions and email
       ↓
Check global email uniqueness
       ↓
Create user with INVITED status
       ↓
Create organization membership
       ↓
Create verification/password-setup token
       ↓
Queue email
       ↓
User verifies email and sets password
       ↓
Activate account
```

If the email already exists, do not create another global user. Under the proposed default, use the invitation/consent flow to add the existing account to another organization.

### **Module D – Organization Membership**

Base path: `/api/v1/organizations/{organizationId}/users/{userId}/membership`

| Method | Endpoint   | Responsibility                             |
| ------ | ---------- | ------------------------------------------ |
| GET    | `/`        | Get membership details                     |
| PATCH  | `/`        | Update membership information              |
| PATCH  | `/status`  | Activate, suspend or deactivate membership |
| DELETE | `/`        | Remove membership                          |
| GET    | `/history` | View membership history                    |

**Important rule:** Removing a user from Organization A must not delete their global account or their membership in Organization B.

Account status and membership status are independent.

For example:

- Global account: `ACTIVE`
- Organization A membership: `SUSPENDED`
- Organization B membership: `ACTIVE`

The user should retain access to Organization B, subject to current account and session rules.

### **Module E – Invitation Management**

Administrative base path:

`/api/v1/organizations/{organizationId}/invitations`

Public acceptance base path:

`/api/v1/invitations`

| Method | Endpoint                                                            | Responsibility                |
| ------ | ------------------------------------------------------------------- | ----------------------------- |
| POST   | `/organizations/{organizationId}/invitations`                       | Create and send invitation    |
| GET    | `/organizations/{organizationId}/invitations`                       | List invitations              |
| GET    | `/organizations/{organizationId}/invitations/{invitationId}`        | Get invitation                |
| POST   | `/organizations/{organizationId}/invitations/{invitationId}/resend` | Resend invitation             |
| POST   | `/organizations/{organizationId}/invitations/{invitationId}/revoke` | Revoke invitation             |
| POST   | `/validate`                                                         | Validate invitation token     |
| POST   | `/accept`                                                           | Accept invitation             |
| POST   | `/organizations/{organizationId}/invitations/bulk`                  | Bulk invitations, later phase |

Invitation lifecycle:

PENDING

ACCEPTED

EXPIRED

REVOKED

Recommended rules:

- Generate a cryptographically secure random token.
- Store only its hash.
- Set a configurable expiry.
- Rotate the token on resend and invalidate the previous one.
- Prevent duplicate pending invitations for the same organization and email.
- Track delivery attempts and failures.
- Store the organization and proposed role assignments.
- Assign active roles only after the membership becomes active.

**Database dependency:** Your supplied `auth.invitations` table has a required `user_id` and does not contain `organization_id`. That is not enough to cleanly represent an invitation to an organization before a user account exists. The database should be extended before implementing this workflow.

### **Module F – RBAC: Roles and Permissions**

System base path: `/api/v1/rbac`

Organization-scoped assignments:

`/api/v1/organizations/{organizationId}/users/{userId}/roles`

| Method | Endpoint                                                         | Responsibility                         |
| ------ | ---------------------------------------------------------------- | -------------------------------------- |
| GET    | `/rbac/roles`                                                    | List roles available to caller         |
| POST   | `/rbac/roles`                                                    | Create permitted custom role           |
| GET    | `/rbac/roles/{roleId}`                                           | Get role details                       |
| PATCH  | `/rbac/roles/{roleId}`                                           | Update custom role                     |
| DELETE | `/rbac/roles/{roleId}`                                           | Deactivate/delete eligible custom role |
| GET    | `/rbac/permissions`                                              | List permissions                       |
| GET    | `/rbac/roles/{roleId}/permissions`                               | Get role permissions                   |
| PUT    | `/rbac/roles/{roleId}/permissions`                               | Replace role permissions               |
| GET    | `/rbac/delegations`                                              | View delegation policies               |
| GET    | `/organizations/{organizationId}/users/{userId}/roles`           | Get assigned roles                     |
| POST   | `/organizations/{organizationId}/users/{userId}/roles`           | Assign role                            |
| PUT    | `/organizations/{organizationId}/users/{userId}/roles`           | Replace assignments                    |
| DELETE | `/organizations/{organizationId}/users/{userId}/roles/{roleId}`  | Remove role                            |
| GET    | `/organizations/{organizationId}/users/{userId}/roles/available` | List assignable roles                  |
| GET    | `/organizations/{organizationId}/users/{userId}/roles/history`   | Role assignment history                |

**Authorization rules**

1. A user can assign only roles that their current role is allowed to delegate.
2. An ADMIN cannot assign `SUPER_ADMIN`.
3. An ADMIN cannot assign another ADMIN unless a specific delegation rule permits it.
4. Organization roles must belong to the same organization as the assignment.
5. Organization role assignment requires active membership.
6. Global roles must be assigned globally.
7. Permission changes must be audited.
8. A role must not gain permissions beyond the delegator's permitted grant boundary.

Your database already includes role delegation, role permission grants, role inheritance, route permissions, and user data scopes. These should be enforced by a centralized authorization service—not duplicated as different checks in individual route handlers.

**Permission naming convention**

```
organizations.create
organizations.read
organizations.update
organizations.suspend

users.create
users.read
users.update
users.suspend

memberships.read
memberships.activate
memberships.suspend
memberships.remove

invitations.create
invitations.read
invitations.resend
invitations.revoke
invitations.accept

roles.create
roles.read
roles.update
roles.assign
roles.remove

employees.create
employees.read
employees.update
employees.delete

visitors.create
visitors.read
visitors.approve
visitors.check_in
visitors.check_out

gates.read
gates.open
gates.close
gates.emergency_stop
gates.view_history

audit.read
audit.export
```

These are proposed permission codes; the final catalogue should be seeded in `rbac.permissions`.

### **Module G – My Account**

Base path: `/api/v1/users/me`

| Method | Endpoint                | Responsibility                   |
| ------ | ----------------------- | -------------------------------- |
| GET    | `/`                     | Current user                     |
| PATCH  | `/`                     | Update basic account information |
| GET    | `/profile`              | Get profile                      |
| PATCH  | `/profile`              | Update profile                   |
| PUT    | `/avatar`               | Upload/replace avatar            |
| DELETE | `/avatar`               | Remove avatar                    |
| PATCH  | `/password`             | Change own password              |
| GET    | `/organizations`        | List user's organizations        |
| GET    | `/sessions`             | List active sessions             |
| DELETE | `/sessions/{sessionId}` | Revoke selected session          |
| DELETE | `/sessions`             | Revoke other sessions            |
| GET    | `/security`             | Security overview                |

Profile fields should follow `core.user_profiles`. Avoid exposing sensitive fields such as password hashes, refresh-token hashes, MFA secrets, or internal security metadata.

### **Module H – Audit and Security**

Administrative base path:

`/api/v1/organizations/{organizationId}/audit-logs`

| Method | Endpoint                     | Responsibility                 |
| ------ | ---------------------------- | ------------------------------ |
| GET    | `/`                          | List audit logs                |
| GET    | `/{logId}`                   | Get audit details              |
| POST   | `/export`                    | Start audit export             |
| GET    | `/security-events`           | List permitted security events |
| GET    | `/security-events/{eventId}` | Get security event details     |

Recommended filters:

```
?actorId=uuid
&targetUserId=uuid
&action=USER_CREATED
&entityType=USER
&dateFrom=2026-01-01
&dateTo=2026-12-31
&page=1
&limit=20
```

Record at least:

- Login success/failure and account lockouts.
- Password reset and email verification.
- Session creation, refresh, and revocation.
- Organization creation and status changes.
- User creation and updates.
- Invitation create/resend/revoke/accept.
- Membership activation, suspension, and removal.
- Role assignment/removal and permission changes.
- Employee and visitor changes.
- Gate open/close commands, acknowledgements, and faults.

Audit logs should be append-only for normal application workflows. Never put plaintext passwords, raw tokens, or other credentials in audit payloads.

### **Module I – Employee Management**

Base path: `/api/v1/organizations/{organizationId}/employees`

This module is distinct from user management.

| Method | Endpoint                     | Responsibility                    |
| ------ | ---------------------------- | --------------------------------- |
| POST   | `/`                          | Create employee record            |
| GET    | `/`                          | List employees                    |
| GET    | `/{employeeId}`              | Employee details                  |
| PATCH  | `/{employeeId}`              | Update employee                   |
| PATCH  | `/{employeeId}/status`       | Change employment status          |
| DELETE | `/{employeeId}`              | Deactivate/remove employee record |
| PUT    | `/{employeeId}/user-account` | Link employee to login account    |
| DELETE | `/{employeeId}/user-account` | Unlink login account              |
| PUT    | `/{employeeId}/rfid`         | Assign or replace RFID credential |
| DELETE | `/{employeeId}/rfid`         | Revoke RFID credential            |
| GET    | `/{employeeId}/history`      | Employee history                  |

Proposed employee fields:

```
{
  "employeeCode": "EMP-0001",
  "firstName": "Amit",
  "lastName": "Sharma",
  "email": "amit@example.com",
  "mobile": "9999999999",
  "departmentId": "uuid",
  "designation": "Security Guard",
  "employmentStatus": "ACTIVE",
  "userId": null
}
```

Recommendations:

- Employee codes should be unique within an organization.
- Employee data should not automatically create a login account.
- An employee may be linked to a `core.users` account later.
- RFID credential assignment and revocation should be audited.
- Do not store raw RFID credentials in API logs.

The employee database schema is not present in the supplied RBAC SQL, so this module requires its own schema design.

### **Module J – Visitor Management**

Base path: `/api/v1/organizations/{organizationId}/visitors`

| Method | Endpoint                 | Responsibility             |
| ------ | ------------------------ | -------------------------- |
| POST   | `/`                      | Register walk-in visitor   |
| GET    | `/`                      | List/search visitors       |
| GET    | `/{visitorId}`           | Visitor details            |
| PATCH  | `/{visitorId}`           | Update visitor information |
| POST   | `/{visitorId}/approve`   | Approve visitor            |
| POST   | `/{visitorId}/reject`    | Reject visitor             |
| POST   | `/{visitorId}/check-in`  | Record entry               |
| POST   | `/{visitorId}/check-out` | Record exit                |
| GET    | `/{visitorId}/history`   | Visitor history            |
| GET    | `/active`                | Visitors currently inside  |
| POST   | `/pre-register`          | Register expected visitor  |
| GET    | `/today`                 | Today's visitor records    |

Example walk-in registration:

```
{
  "fullName": "Rahul Patil",
  "mobile": "9999999999",
  "purpose": "Meeting",
  "hostEmployeeId": "employee-uuid",
  "visitorType": "GUEST"
}
```

Suggested visitor lifecycle:

```
REGISTERED
    ↓
PENDING_APPROVAL
    ↓
APPROVED / REJECTED
    ↓
CHECKED_IN
    ↓
CHECKED_OUT
```

Do not allow duplicate check-ins or check-outs. A visitor must not be marked as checked out before a successful check-in.

The visitor schema is also outside the supplied RBAC SQL and must be designed separately.

### **Module K – Gate Control**

Base path: `/api/v1/organizations/{organizationId}/gates`

| Method | Endpoint                         | Responsibility                    |
| ------ | -------------------------------- | --------------------------------- |
| POST   | `/`                              | Register gate                     |
| GET    | `/`                              | List gates                        |
| GET    | `/{gateId}`                      | Gate details                      |
| PATCH  | `/{gateId}`                      | Update gate metadata              |
| PATCH  | `/{gateId}/status`               | Update administrative status      |
| GET    | `/{gateId}/status`               | Get live/last known gate status   |
| POST   | `/{gateId}/open`                 | Request gate opening              |
| POST   | `/{gateId}/close`                | Request gate closing              |
| POST   | `/{gateId}/stop`                 | Request emergency/controlled stop |
| GET    | `/{gateId}/commands`             | List commands                     |
| GET    | `/{gateId}/commands/{commandId}` | Get command status                |
| GET    | `/{gateId}/events`               | Gate event history                |
| POST   | `/{gateId}/heartbeat`            | Receive device heartbeat          |
| POST   | `/{gateId}/telemetry`            | Receive device telemetry          |
| POST   | `/{gateId}/acknowledgements`     | Receive command acknowledgement   |

Example open request:

```
POST /api/v1/organizations/{organizationId}/gates/{gateId}/open
```

```
{
  "requestId": "client-generated-uuid",
  "reason": "Authorized visitor entry"
}
```

Response:

```
{
  "success": true,
  "message": "Gate command accepted",
  "data": {
    "commandId": "command-uuid",
    "gateId": "gate-001",
    "command": "OPEN",
    "status": "QUEUED"
  }
}
```

A `202 Accepted` response means the command was accepted for processing, **not** that the gate physically opened.

Suggested command lifecycle:

```
QUEUED
  ↓
PUBLISHED
  ↓
ACKNOWLEDGED
  ↓
COMPLETED
```

Other possible terminal states:

- `FAILED`
- `TIMEOUT`
- `CANCELLED`
- `REJECTED`

Device status should be separate from command status:

```
{
  "gateId": "gate-001",
  "state": "FAULT",
  "emergencyStop": true,
  "lastSeenAt": "2026-11-16T10:00:00Z"
}
```

A physical gate must never be reported as `OPEN` merely because an API request succeeded. The actual device state must come from a trustworthy acknowledgement or telemetry event.

**Safety requirement:** The API must enforce permission checks, command deduplication, command expiry, device/gate association, and fault-state rules. A remote stop command should not be presented as a certified physical emergency-stop mechanism; hardware safety must remain independent of application availability.

## **5. Database architecture and required changes**

Your supplied SQL currently establishes four PostgreSQL schemas:

- `core`
- `rbac`
- `auth`
- `audit`

It already defines the foundational entities for organizations, organization settings, users, profiles, memberships, roles, permissions, role assignments, delegations, permission grants, role inheritance, route permissions, data scopes, sessions, invitations, password resets, email verification, MFA, audit logs, and security events.

That is a good foundation for the identity and access-control layer. However, the business modules selected for this project need additional database structures.

### **Recommended database schemas**

| Schema          | Responsibility                                         |
| --------------- | ------------------------------------------------------ |
| `core`          | Organizations, users, profiles, memberships            |
| `rbac`          | Modules, permissions, roles, assignments, scopes       |
| `auth`          | Sessions, invitations, verification, reset tokens, MFA |
| `audit`         | Audit logs and security events                         |
| `employee`      | Employee records, departments, credentials             |
| `visitor`       | Visitor records, approvals, visits, check-in/out       |
| `gate`          | Gates, devices, commands, telemetry, events            |
| `communication` | Email outbox and notification records                  |

The additional schemas are proposed extensions, not existing tables in the supplied SQL.

### **Critical database changes**

| Existing database structure      | Required improvement                                              |
| -------------------------------- | ----------------------------------------------------------------- |
| `core.users`                     | Keep global account status independent of organization membership |
| `core.user_organizations`        | Add `PENDING` membership status for invitation onboarding         |
| `auth.invitations`               | Add `organization_id`                                             |
| `auth.invitations`               | Support invitations before the user account exists                |
| Invitation roles                 | Add `auth.invitation_roles`                                       |
| `auth.sessions`                  | Add refresh-token rotation and token-family/reuse tracking        |
| `auth.email_verification_tokens` | Support token revocation and resend lifecycle                     |
| `audit.audit_logs`               | Add correlation/request identifiers and structured metadata       |
| `audit.security_events`          | Add sufficient context for security investigations                |
| New communication schema         | Add durable email outbox and delivery attempts                    |
| New employee schema              | Add employee records independent of login accounts                |
| New visitor schema               | Add visitor lifecycle and visit history                           |
| New gate schema                  | Add devices, commands, acknowledgements, events and telemetry     |

### **Important issue: invitation and membership workflow**

Your current `core.user_organizations` constraint allows:

```
ACTIVE
INACTIVE
SUSPENDED
```

It does not allow `PENDING`.

Your existing `rbac.validate_user_role_scope()` trigger requires active organization membership before an organization-scoped role can be assigned.

Therefore, the correct workflow should be:

1. Create the invitation.
2. Create or identify the user account.
3. Create a pending membership.
4. Wait for invitation acceptance.
5. Activate the membership.
6. Assign the organization-scoped role.
7. Record the operation in audit logs.

The trigger and transaction sequence must be designed together. Do not assign an active organization role before membership activation.

### **Recommended constraints and indexes**

In addition to your existing SQL, I recommend:

- Case-insensitive unique email constraint.
- Unique employee code per organization.
- Unique RFID credential within its applicable security scope.
- Unique active invitation per organization and normalized email.
- Unique command request ID per gate for idempotency.
- Indexes on organization IDs, status, created timestamps, and foreign keys used by list queries.
- Partial indexes for active sessions and pending invitations.
- Appropriate retention/partitioning strategy for high-volume gate telemetry and audit data.

For multi-organization data, include the organization scope in queries and enforce the scope again in the service layer. Where possible, use composite foreign keys to prevent cross-organization references.

## **6. Authorization architecture**

This is one of the most important parts of SecureGateControl.

Do not write authorization rules independently in every API route.

Create a centralized permission service.

### **Authorization flow**

API request

Verify access token and session

Identify user and active organization

Load current roles and permissions

Validate delegation and data scope

Allowed

Execute service

Denied

Return 403

### **Example permission check**

```
await authorizationService.requirePermission({
  userId: session.userId,
  organizationId,
  permission: "gates.open",
});
```

This service should validate:

1. User account is active.
2. Session is valid and not revoked.
3. Organization is active.
4. User has active membership.
5. User has the required permission.
6. Role assignment is active and not expired.
7. Delegation constraints are satisfied.
8. User's data scope includes the requested resource.

A global `SUPER_ADMIN` may have system-wide access, but that does not mean every organization-scoped query should ignore organization boundaries. Explicitly define which global permissions bypass those boundaries.

## **7. Recommended Next.js folder architecture**

I recommend a modular monolith with feature-based modules.

Do not put all business logic inside `src/app/api`.

```
src/
│
├── app/
│   └── api/
│       └── v1/
│           ├── auth/
│           │   ├── login/route.ts
│           │   ├── refresh/route.ts
│           │   ├── logout/route.ts
│           │   ├── logout-all/route.ts
│           │   ├── forgot-password/route.ts
│           │   ├── reset-password/route.ts
│           │   ├── verify-email/route.ts
│           │   └── setup-password/route.ts
│           │
│           ├── users/
│           │   └── me/
│           │       ├── route.ts
│           │       ├── profile/route.ts
│           │       ├── password/route.ts
│           │       ├── avatar/route.ts
│           │       ├── organizations/route.ts
│           │       └── sessions/route.ts
│           │
│           ├── organizations/
│           │   ├── route.ts
│           │   └── [organizationId]/
│           │       ├── route.ts
│           │       ├── settings/route.ts
│           │       ├── users/
│           │       ├── invitations/
│           │       ├── audit-logs/
│           │       ├── employees/
│           │       ├── visitors/
│           │       └── gates/
│           │
│           ├── invitations/
│           │   ├── validate/route.ts
│           │   └── accept/route.ts
│           │
│           ├── rbac/
│           │   ├── roles/
│           │   ├── permissions/
│           │   └── delegations/
│           │
│           └── internal/
│               └── devices/
│                   ├── heartbeat/route.ts
│                   ├── telemetry/route.ts
│                   └── acknowledgements/route.ts
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.validation.ts
│   │   └── auth.types.ts
│   │
│   ├── organizations/
│   ├── users/
│   ├── memberships/
│   ├── invitations/
│   ├── rbac/
│   ├── audit/
│   ├── employees/
│   ├── visitors/
│   └── gates/
│
├── lib/
│   ├── database/
│   │   ├── db.ts
│   │   ├── pool.ts
│   │   ├── transactions.ts
│   │   └── migrations/
│   │
│   ├── auth/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── session.ts
│   │   ├── cookies.ts
│   │   └── token.ts
│   │
│   ├── security/
│   │   ├── authorization.ts
│   │   ├── permissions.ts
│   │   ├── organization-scope.ts
│   │   ├── rate-limit.ts
│   │   └── csrf.ts
│   │
│   ├── api/
│   │   ├── api-response.ts
│   │   ├── api-error.ts
│   │   ├── api-handler.ts
│   │   └── pagination.ts
│   │
│   ├── email/
│   │   ├── email.client.ts
│   │   ├── email.service.ts
│   │   ├── email.config.ts
│   │   └── templates/
│   │
│   ├── mqtt/
│   │   ├── mqtt.client.ts
│   │   ├── mqtt.publisher.ts
│   │   └── mqtt.subscriber.ts
│   │
│   └── logger/
│       └── logger.ts
│
└── types/
    ├── api.types.ts
    ├── auth.types.ts
    └── database.types.ts
```

### **Responsibilities of each layer**

| Layer         | Responsibility                     |
| ------------- | ---------------------------------- |
| `route.ts`    | HTTP request and response          |
| Controller    | Parse input and invoke service     |
| Validation    | Zod schemas                        |
| Service       | Business rules and workflows       |
| Repository    | SQL queries and data access        |
| Database      | Pool and transactions              |
| Authorization | Permission and organization checks |
| Types         | Shared TypeScript definitions      |

Example:

```
POST /api/v1/organizations/{id}/users
                 |
                 v
             route.ts
                 |
                 v
          user.controller.ts
                 |
                 v
           user.service.ts
                 |
         +-------+-------+
         |               |
         v               v
  authorization     user.repository
                         |
                         v
                    PostgreSQL
```

## **8. Database and transaction strategy**

Since you selected raw SQL rather than Drizzle, use the PostgreSQL `pg` package with a shared connection pool.

### **Database rules**

- Use parameterized SQL queries.
- Never concatenate request values into SQL.
- Use explicit transactions for multi-table workflows.
- Use `RETURNING` where appropriate.
- Use `BEGIN`, `COMMIT`, and `ROLLBACK` correctly.
- Always release acquired clients.
- Keep SQL inside repositories.
- Never open a new pool for each request.

### **Transaction example**

```
import { pool } from "@/lib/database/pool";

export async function executeTransaction<T>(
  callback: (client: import("pg").PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await callback(client);

    await client.query("COMMIT");

    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

Use this for operations such as:

- User creation + membership + initial role + audit event.
- Invitation acceptance + membership activation + role assignment.
- Role permission changes + audit.
- Visitor check-in/check-out.
- Gate command record creation and associated audit event.

For external operations such as sending email or publishing MQTT messages, use a transactional outbox pattern. Commit the database transaction first, then process the queued event. Do not hold a PostgreSQL transaction open while waiting for an email provider or device acknowledgement.

## **9. Production security requirements**

| Area              | Required protection                                               |
| ----------------- | ----------------------------------------------------------------- |
| Authentication    | Short-lived access JWT and rotating refresh token                 |
| Passwords         | Argon2id or appropriately configured bcrypt                       |
| Tokens            | Cryptographically secure generation; hash stored tokens           |
| Sessions          | Revocation, expiry, refresh rotation and reuse detection          |
| Cookies           | HTTP-only, secure in production, correct SameSite/path            |
| CSRF              | Origin checks and appropriate CSRF protection                     |
| Authorization     | Centralized RBAC enforcement                                      |
| Multi-tenancy     | Organization isolation in every relevant query                    |
| Validation        | Zod request validation                                            |
| SQL               | Parameterized queries                                             |
| Rate limiting     | Login, refresh, password reset, invitations and sensitive actions |
| Email             | Outbox, retries and delivery tracking                             |
| Audit             | Append-only application behavior                                  |
| Gate control      | Device authentication, command authorization and idempotency      |
| File uploads      | Type/size checks and safe storage                                 |
| API documentation | OpenAPI                                                           |
| Logging           | Redaction of passwords, tokens and sensitive data                 |

### **Important refresh-token protection**

The refresh-token workflow should support:

- One session per login/device.
- Refresh-token rotation.
- Revocation of the previous refresh token.
- Detection of reuse of a rotated token.
- Revocation of the affected session/token family on detected reuse.
- Password change and account suspension session policies.
- Cleanup of expired sessions and tokens.

A `token_hash` column in `auth.sessions` is a useful starting point, but the database should be extended if you need reliable token-family and rotation history.

## **10. API implementation roadmap**

Do not implement all modules at once. The following sequence reduces dependencies and avoids repeatedly changing the architecture.

1. **Phase 1 – API foundation**
   - PostgreSQL pool and transaction manager
   - API response/error handling
   - Zod validation
   - Logging
   - API versioning
   - OpenAPI foundation
2. **Phase 2 – Authentication**
   - Login
   - JWT access token
   - Refresh token rotation
   - Sessions
   - Logout and logout-all
   - Password reset
   - Email verification
3. **Phase 3 – Organization and user management**
   - Organizations
   - Global users
   - User profiles
   - Organization memberships
   - Direct user creation
   - Account activation
4. **Phase 4 – Invitations**
   - Create invitation
   - Validate invitation
   - Accept invitation
   - Resend/revoke
   - Email outbox and retry
5. **Phase 5 – RBAC**
   - Permission catalogue
   - Roles
   - Role assignments
   - Delegation
   - Data scopes
   - Authorization enforcement
6. **Phase 6 – Audit and security**
   - Audit logging
   - Security events
   - Session management
   - Activity views
7. **Phase 7 – Employee and visitor management**
   - Employee CRUD and RFID association
   - Visitor registration
   - Approval
   - Check-in/check-out
   - History
8. **Phase 8 – Gate Control**
   - Gate and device registration
   - MQTT integration
   - Open/close commands
   - Acknowledgements
   - Telemetry and fault handling
   - Command history
9. **Phase 9 – Advanced operations**
   - Bulk invitations
   - Exports
   - Analytics
   - Background job monitoring
   - Retention and cleanup jobs

## **11. Final architecture decisions to carry into implementation**

## **SecureGateControl API baseline**

Architecture

**Modular monolith**

Framework

**Next.js App Router**

Language

**TypeScript**

Database

**PostgreSQL + raw SQL**

Authentication

**Hybrid JWT + refresh token**

Authorization

**Centralized RBAC**

Validation

**Zod**

Email

**Nodemailer + outbox**

Device integration

**MQTT through backend**

API format

**REST&#x20;**`/api/v1`

**My architectural recommendation:** Build and stabilize the identity, organization, membership, invitation, and RBAC foundation before implementing Employee, Visitor, and Gate Control APIs. Those business modules should consume the same authentication, authorization, organization-scope, audit, and transaction infrastructure rather than implementing their own security systems.

One important boundary remains: the supplied SQL is an RBAC and identity foundation, not a complete database design for employee, visitor, or gate operations. Those three modules need dedicated schema designs before their APIs can be considered implementation-ready.
