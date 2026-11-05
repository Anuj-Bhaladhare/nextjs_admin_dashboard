For your application, I recommend a relational RBAC database architecture using PostgreSQL.

The database should support:

- SUPER ADMIN and ADMIN management.
- Dynamic roles such as GUARD, SUPERVISOR and DATA ENTRY OPERATOR.
- User creation and role assignment.
- Module-wise and action-wise permissions.
- Permission delegation with administrative restrictions.
- Organization-wise data isolation, if required.
- Authentication sessions, invitations and password recovery.
- Audit logs and security tracking.

I will give you the table names, their responsibilities, primary keys, foreign keys and relationships.

# 1. Complete database table list

I recommend organizing the database into six logical groups.

RBAC database inventory

Recommended

# 3

Organization

Tenant and organization management

# 8

RBAC

Roles, permissions and delegation

# 2

User management

User identity and assignments

# 5

Authentication

Sessions and account security

# 2

Audit

Security and activity history

# 20

Total tables

Core recommended architecture

## A. Organization management tables

These tables make your architecture ready for one or multiple organizations.

| # | Table name              | Purpose                                 |
| - | ----------------------- | --------------------------------------- |
| 1 | `organizations`         | Stores organization/company information |
| 2 | `organization_settings` | Stores organization-specific settings   |
| 3 | `user_organizations`    | Maps users to organizations             |

Even if you start with one organization, you can create one organization record and use the same architecture.

## B. RBAC management tables

These are the most important tables for your role-based authorization system.

| #  | Table name               | Purpose                                                 |
| -- | ------------------------ | ------------------------------------------------------- |
| 4  | `modules`                | Application modules such as Dashboard, Users, Reports   |
| 5  | `permissions`            | Individual actions such as users.create                 |
| 6  | `roles`                  | SUPER ADMIN, ADMIN, GUARD, SUPERVISOR, etc.             |
| 7  | `role_permissions`       | Maps permissions to roles                               |
| 8  | `user_roles`             | Maps roles to users                                     |
| 9  | `role_delegations`       | Defines which roles can create or assign other roles    |
| 10 | `role_permission_grants` | Defines which permissions an administrator can delegate |
| 11 | `role_inheritance`       | Optional role inheritance relationships                 |

## C. User management tables

| #  | Table name         | Purpose                                                                   |
| -- | ------------------ | ------------------------------------------------------------------------- |
| 12 | `users`            | Stores user identity, email, password hash and status                     |
| 13 | `user_data_scopes` | Restricts users to assigned branches, departments, locations or resources |

## D. Authentication tables

| #  | Table name                  | Purpose                                                 |
| -- | --------------------------- | ------------------------------------------------------- |
| 14 | `sessions`                  | Manages active login sessions                           |
| 15 | `invitations`               | Manages new user invitations and account activation     |
| 16 | `password_reset_tokens`     | Manages forgotten-password requests                     |
| 17 | `email_verification_tokens` | Manages email verification                              |
| 18 | `mfa_methods`               | Stores multi-factor authentication method configuration |

## E. Audit and security tables

| #  | Table name        | Purpose                                                        |
| -- | ----------------- | -------------------------------------------------------------- |
| 19 | `audit_logs`      | Tracks user and administrator activities                       |
| 20 | `security_events` | Tracks login failures, suspicious activity and security events |

# 2. Detailed table structure and relationships

Now let's understand what each important table stores.

## 2.1 Organization tables

`organizations`

| Column     | Type      | Description              |
| ---------- | --------- | ------------------------ |
| id         | UUID      | Primary key              |
| name       | VARCHAR   | Organization name        |
| code       | VARCHAR   | Unique organization code |
| status     | VARCHAR   | ACTIVE / INACTIVE        |
| created_at | TIMESTAMP | Creation date            |
| updated_at | TIMESTAMP | Last update              |

`organization_settings`

| Column          | Type    | Description           |
| --------------- | ------- | --------------------- |
| id              | UUID    | Primary key           |
| organization_id | UUID    | FK → organizations.id |
| setting_key     | VARCHAR | Setting name          |
| setting_value   | JSONB   | Setting value         |

Unique constraint: `(organization_id, setting_key)`.

`user_organizations`

| Column            | Type      | Description           |
| ----------------- | --------- | --------------------- |
| id                | UUID      | Primary key           |
| user_id           | UUID      | FK → users.id         |
| organization_id   | UUID      | FK → organizations.id |
| membership_status | VARCHAR   | ACTIVE / INACTIVE     |
| joined_at         | TIMESTAMP | Membership date       |

Unique constraint: `(user_id, organization_id)`.

This allows a user to belong to one or multiple organizations.

## 2.2 User table

`users`

| Column            | Type      | Description                             |
| ----------------- | --------- | --------------------------------------- |
| id                | UUID      | Primary key                             |
| first_name        | VARCHAR   | First name                              |
| last_name         | VARCHAR   | Last name                               |
| email             | VARCHAR   | Unique email                            |
| mobile            | VARCHAR   | Mobile number                           |
| username          | VARCHAR   | Unique username                         |
| password_hash     | TEXT      | Hashed password                         |
| status            | VARCHAR   | INVITED / ACTIVE / SUSPENDED / DISABLED |
| email_verified_at | TIMESTAMP | Email verification                      |
| last_login_at     | TIMESTAMP | Last login                              |
| created_by        | UUID      | FK → users.id                           |
| created_at        | TIMESTAMP | Creation date                           |
| updated_at        | TIMESTAMP | Update date                             |

`created_by` is a self-referencing foreign key.

Example:

| User   | Role                | Created by  |
| ------ | ------------------- | ----------- |
| Rahul  | ADMIN               | SUPER ADMIN |
| Amit   | GUARD               | Rahul       |
| Priya  | SUPERVISOR          | Rahul       |
| Ramesh | DATA ENTRY OPERATOR | Rahul       |

This gives you a user creation history.

## 2.3 Roles table

`roles`

| Column          | Type      | Description                                      |
| --------------- | --------- | ------------------------------------------------ |
| id              | UUID      | Primary key                                      |
| organization_id | UUID      | FK → organizations.id; nullable for global roles |
| name            | VARCHAR   | Role name                                        |
| code            | VARCHAR   | Unique role code within scope                    |
| description     | TEXT      | Role description                                 |
| role_type       | VARCHAR   | SYSTEM / CUSTOM                                  |
| is_system       | BOOLEAN   | Protected system role                            |
| is_active       | BOOLEAN   | Active status                                    |
| created_by      | UUID      | FK → users.id                                    |
| created_at      | TIMESTAMP | Creation date                                    |
| updated_at      | TIMESTAMP | Update date                                      |

Example role records:

| Role                | Code                | Type   |
| ------------------- | ------------------- | ------ |
| SUPER ADMIN         | SUPER_ADMIN         | SYSTEM |
| ADMIN               | ADMIN               | SYSTEM |
| GUARD               | GUARD               | CUSTOM |
| SUPERVISOR          | SUPERVISOR          | CUSTOM |
| DATA ENTRY OPERATOR | DATA_ENTRY_OPERATOR | CUSTOM |

Important: Don't use a fixed `ENUM` for role names. Store them in the `roles` table so ADMIN can create additional operational roles.

Also, enforce uniqueness on the appropriate organization/global scope and role code.

## 2.4 Modules table

`modules`

| Column      | Type    | Description               |
| ----------- | ------- | ------------------------- |
| id          | UUID    | Primary key               |
| name        | VARCHAR | Module name               |
| code        | VARCHAR | Unique module code        |
| description | TEXT    | Description               |
| parent_id   | UUID    | FK → modules.id; nullable |
| is_active   | BOOLEAN | Module status             |
| sort_order  | INTEGER | Display order             |

Example:

| Module                | Code        |
| --------------------- | ----------- |
| Dashboard             | DASHBOARD   |
| User Management       | USERS       |
| Role Management       | ROLES       |
| Permission Management | PERMISSIONS |
| Member Management     | MEMBERS     |
| Reports               | REPORTS     |
| Settings              | SETTINGS    |
| Audit Logs            | AUDIT_LOGS  |

`parent_id` allows you to create nested modules and submodules.

## 2.5 Permissions table

`permissions`

| Column      | Type    | Description            |
| ----------- | ------- | ---------------------- |
| id          | UUID    | Primary key            |
| module_id   | UUID    | FK → modules.id        |
| name        | VARCHAR | Permission name        |
| code        | VARCHAR | Unique permission code |
| description | TEXT    | Permission description |
| is_active   | BOOLEAN | Permission status      |

Example permissions:

| Module      | Permission code      |
| ----------- | -------------------- |
| Dashboard   | `dashboard.view`     |
| Users       | `users.view`         |
| Users       | `users.create`       |
| Users       | `users.update`       |
| Users       | `users.delete`       |
| Roles       | `roles.view`         |
| Roles       | `roles.create`       |
| Roles       | `roles.update`       |
| Permissions | `permissions.assign` |
| Reports     | `reports.view`       |
| Reports     | `reports.export`     |

One module can have multiple permissions.

## 2.6 Role-permission mapping

`role_permissions`

This is the many-to-many relationship between roles and permissions.

| Column        | Type      | Description         |
| ------------- | --------- | ------------------- |
| id            | UUID      | Primary key         |
| role_id       | UUID      | FK → roles.id       |
| permission_id | UUID      | FK → permissions.id |
| granted_by    | UUID      | FK → users.id       |
| created_at    | TIMESTAMP | Creation date       |

Unique constraint: `(role_id, permission_id)`.

Example:

| Role       | Permission       |
| ---------- | ---------------- |
| ADMIN      | `users.view`     |
| ADMIN      | `users.create`   |
| ADMIN      | `users.update`   |
| SUPERVISOR | `members.view`   |
| SUPERVISOR | `members.update` |
| GUARD      | `dashboard.view` |

## 2.7 User-role mapping

`user_roles`

This table connects users to their assigned roles.

| Column          | Type      | Description           |
| --------------- | --------- | --------------------- |
| id              | UUID      | Primary key           |
| user_id         | UUID      | FK → users.id         |
| role_id         | UUID      | FK → roles.id         |
| organization_id | UUID      | FK → organizations.id |
| assigned_by     | UUID      | FK → users.id         |
| assigned_at     | TIMESTAMP | Assignment date       |
| expires_at      | TIMESTAMP | Optional expiry       |

Unique constraint: `(user_id, role_id, organization_id)`.

This is important because you may later allow one user to have multiple roles.

For example:

Amit can be both GUARD and DATA ENTRY OPERATOR in the same organization, if permitted.

## 2.8 Role delegation table

`role_delegations`

This table controls which administrator can create and assign which roles.

| Column            | Type    | Description                     |
| ----------------- | ------- | ------------------------------- |
| id                | UUID    | Primary key                     |
| organization_id   | UUID    | FK → organizations.id           |
| delegator_role_id | UUID    | FK → roles.id                   |
| target_role_id    | UUID    | FK → roles.id                   |
| can_create_users  | BOOLEAN | Can create users with this role |
| can_assign_role   | BOOLEAN | Can assign this role            |
| can_manage_users  | BOOLEAN | Can manage users with this role |
| created_by        | UUID    | FK → users.id                   |

Example:

| Delegator role | Target role         | Create users | Assign role |
| -------------- | ------------------- | ------------ | ----------- |
| SUPER_ADMIN    | ADMIN               | Yes          | Yes         |
| SUPER_ADMIN    | GUARD               | Yes          | Yes         |
| SUPER_ADMIN    | SUPERVISOR          | Yes          | Yes         |
| ADMIN          | GUARD               | Yes          | Yes         |
| ADMIN          | SUPERVISOR          | Yes          | Yes         |
| ADMIN          | DATA ENTRY OPERATOR | Yes          | Yes         |
| ADMIN          | ADMIN               | No           | No          |
| ADMIN          | SUPER ADMIN         | No           | No          |

This makes role creation and assignment rules configurable.

## 2.9 Role permission grants

`role_permission_grants`

This table defines the maximum permissions a role is allowed to delegate to roles it creates or manages.

| Column            | Type | Description         |
| ----------------- | ---- | ------------------- |
| id                | UUID | Primary key         |
| delegator_role_id | UUID | FK → roles.id       |
| permission_id     | UUID | FK → permissions.id |
| created_by        | UUID | FK → users.id       |

Example:

An ADMIN may have these permissions available to delegate:

- `dashboard.view`
- `members.view`
- `members.create`
- `members.update`
- `reports.view`

ADMIN cannot give a GUARD `users.create` if that permission is outside the ADMIN's delegation authority.

This is an important protection against privilege escalation.

## 2.10 Role inheritance

`role_inheritance` — optional.

| Column         | Type      | Description   |
| -------------- | --------- | ------------- |
| id             | UUID      | Primary key   |
| parent_role_id | UUID      | FK → roles.id |
| child_role_id  | UUID      | FK → roles.id |
| created_at     | TIMESTAMP | Creation date |

Use this only if you want a role to inherit permissions from another role.

For example, a SUPERVISOR might inherit all permissions of a basic STAFF role.

I recommend leaving role inheritance disabled initially. It adds complexity, especially when calculating effective permissions.

# 3. Authentication and security tables

These tables support the actual login lifecycle.

| Table                       | Important columns                                                   |
| --------------------------- | ------------------------------------------------------------------- |
| `sessions`                  | id, user_id, token_hash, expires_at, revoked_at, created_at         |
| `invitations`               | id, user_id, email, token_hash, expires_at, accepted_at, created_by |
| `password_reset_tokens`     | id, user_id, token_hash, expires_at, used_at                        |
| `email_verification_tokens` | id, user_id, token_hash, expires_at, verified_at                    |
| `mfa_methods`               | id, user_id, method_type, secret_encrypted, is_enabled              |

Security recommendations:

- Store password hashes, never plaintext passwords.
- Store hashes of session and one-time invitation/reset tokens, not raw tokens.
- Use secure, HttpOnly, SameSite cookies for sessions.
- Revoke sessions when a user is suspended or disabled.
- Encrypt MFA secrets at rest.
- Rate-limit login and recovery endpoints.
- Use short-lived, single-use invitation and recovery tokens.

# 4. User data scope

`user_data_scopes`

This table is particularly useful if an ADMIN manages users in a specific department or branch.

| Column          | Type    | Description                    |
| --------------- | ------- | ------------------------------ |
| id              | UUID    | Primary key                    |
| user_id         | UUID    | FK → users.id                  |
| organization_id | UUID    | FK → organizations.id          |
| scope_type      | VARCHAR | BRANCH / DEPARTMENT / LOCATION |
| scope_id        | UUID    | ID of the assigned resource    |
| assigned_by     | UUID    | FK → users.id                  |

For example:

- ADMIN A manages Branch 1.
- ADMIN B manages Branch 2.
- A supervisor can see only their assigned department.

The backend must enforce these restrictions in database queries, not just hide records in the UI.

# 5. Audit and security tables

`audit_logs`

| Column          | Type      | Description                      |
| --------------- | --------- | -------------------------------- |
| id              | UUID      | Primary key                      |
| organization_id | UUID      | FK → organizations.id            |
| actor_id        | UUID      | FK → users.id                    |
| action          | VARCHAR   | USER_CREATED, ROLE_UPDATED, etc. |
| entity_type     | VARCHAR   | USER / ROLE / PERMISSION         |
| entity_id       | UUID      | Target record                    |
| old_values      | JSONB     | Previous values                  |
| new_values      | JSONB     | New values                       |
| ip_address      | INET      | Request IP                       |
| user_agent      | TEXT      | Browser/device                   |
| created_at      | TIMESTAMP | Event date                       |

`security_events`

| Column     | Type      | Description                        |
| ---------- | --------- | ---------------------------------- |
| id         | UUID      | Primary key                        |
| user_id    | UUID      | FK → users.id; nullable            |
| event_type | VARCHAR   | LOGIN_FAILED, ACCOUNT_LOCKED, etc. |
| ip_address | INET      | Request IP                         |
| metadata   | JSONB     | Additional details                 |
| created_at | TIMESTAMP | Event date                         |

Keep audit logs append-only for normal application users and administrators.

# 6. Complete database relationship diagram

This is the central relationship structure. It shows how users, organizations, roles and permissions connect.

[Role-Based Access Control (RBAC): The Complete Guide | QuantumByte Success Story](https://images.openai.com/static-rsc-4/tcPy1MVaky93b1_ha4s3g89ok4_Y9HTDl6zykeTGlokTj1fy3vxnv0wWGfzNlj62KDtUcc3Ky0FE6vbM32vr0a3KmOi7GcQPDFxqkAPN3URkHbF1aerrOVpiE-RvxlriO1R7xL4cjI6o--froKvF6l-ixbzJHuN-IYA5mBB3O0E?purpose=inline)

[quantumbyte.ai](https://quantumbyte.ai/articles/role-based-access-control?utm_source=chatgpt.com)

Here is the actual logical ER diagram in Mermaid format, which you can copy into a Mermaid-compatible editor:

\#chatgpt-mermaid-\_r_1bm\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_1bm\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1bm\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1bm\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_1bm\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1bm\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_1bm\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_1bm\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_1bm\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_1bm\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_1bm\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_1bm\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1bm\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1bm\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_1bm\_ p{margin:0;}#chatgpt-mermaid-\_r_1bm\_ .entityBox{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_1bm\_ .relationshipLabelBox{fill:rgb(243, 243, 243);opacity:0.7;background-color:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_1bm\_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-\_r_1bm\_ .labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_1bm\_ .edgeLabel{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1bm\_ .edgeLabel .label rect{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1bm\_ .edgeLabel .label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1bm\_ .edgeLabel .label{fill:rgb(83, 154, 248);font-size:14px;}#chatgpt-mermaid-\_r_1bm\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1bm\_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-\_r_1bm\_ .node rect,#chatgpt-mermaid-\_r_1bm\_ .node circle,#chatgpt-mermaid-\_r_1bm\_ .node ellipse,#chatgpt-mermaid-\_r_1bm\_ .node polygon{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_1bm\_ .relationshipLine{stroke:rgb(143, 143, 143);stroke-width:1px;fill:none;}#chatgpt-mermaid-\_r_1bm\_ .marker{fill:none!important;stroke:rgb(143, 143, 143)!important;stroke-width:1;}#chatgpt-mermaid-\_r_1bm\_ [data-look=neo].labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_1bm\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_1bm\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_1bm\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_1bm\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_1bm\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1bm\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_1bm\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1bm\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}ORGANIZATIONSUSER_ORGANIZATIONSUSERSROLESORGANIZATION_SETTINGSUSER_ROLESMODULESPERMISSIONSROLE_PERMISSIONSROLE_DELEGATIONSROLE_PERMISSION_GRANTSROLE_INHERITANCESESSIONSINVITATIONSPASSWORD_RESET_TOKENSEMAIL_VERIFICATION_TOKENSMFA_METHODSUSER_DATA_SCOPESAUDIT_LOGSSECURITY_EVENTShasbelongs_toownsconfiguresassignedcontainsdefinesreceivesassigneddelegatortargetgrantsallowedparentchildownsreceivesresetsverifiessecuresassignedperformstriggerscreates

# 7. How all these tables work together

Consider this example:

SUPER ADMIN

Creates ADMIN Rahul

Database operations

- `users` → Rahul's account
- `user_organizations` → Rahul's organization
- `user_roles` → ADMIN assignment
- `role_permissions` → ADMIN's permissions
- `audit_logs` → Account creation event

ADMIN Rahul

Creates GUARD Amit

Database operations

- `users` → Amit's account
- `user_roles` → GUARD assignment
- `role_delegations` → Verifies Rahul can assign GUARD
- `role_permissions` → GUARD's permissions
- `invitations` → Amit's activation invitation
- `audit_logs` → Account creation event

GUARD Amit

Logs in and accesses permitted modules

The most important point is that creating a user, assigning a role and assigning permissions are separate operations with separate authorization checks.

# 8. Important database constraints

For a production-ready implementation, don't rely only on application code.

Add these database-level rules:

| Rule                                   | Database enforcement                             |
| -------------------------------------- | ------------------------------------------------ |
| Email uniqueness                       | Unique index on normalized email                 |
| Username uniqueness                    | Unique index on normalized username              |
| No duplicate role assignment           | Unique constraint on user, role and organization |
| No duplicate permission assignment     | Unique constraint on role and permission         |
| No duplicate module permission code    | Unique index on permission code                  |
| No duplicate role code in organization | Composite unique constraint                      |
| No duplicate delegation                | Unique constraint on delegator and target role   |
| Valid foreign keys                     | Foreign key constraints                          |
| Valid account status                   | Check constraint                                 |
| Valid delegation relationships         | Application validation and transaction           |

For multi-tenant isolation, also use composite foreign keys or equivalent database constraints to ensure that users cannot accidentally be assigned roles from another organization.

# 9. My final recommended table structure for your application

I would organize the PostgreSQL schema like this:

```
database
│
├── organization
│   ├── organizations
│   ├── organization_settings
│   └── user_organizations
│
├── user_management
│   ├── users
│   └── user_data_scopes
│
├── rbac
│   ├── modules
│   ├── permissions
│   ├── roles
│   ├── role_permissions
│   ├── user_roles
│   ├── role_delegations
│   ├── role_permission_grants
│   └── role_inheritance
│
├── authentication
│   ├── sessions
│   ├── invitations
│   ├── password_reset_tokens
│   ├── email_verification_tokens
│   └── mfa_methods
│
└── security
    ├── audit_logs
    └── security_events
```

My recommendation: Use PostgreSQL schemas to organize these tables, rather than putting every table in one schema. You can also use `auth`, `rbac`, `core`, and `audit` if you prefer to align with your existing project's architecture.

A few design decisions to retain:

1. SUPER ADMIN and ADMIN are protected system roles.
2. Operational roles are dynamic database records.
3. Permissions are assigned to roles, not directly hardcoded into frontend components.
4. User-role assignments are maintained separately from users.
5. Delegation rules control which roles an ADMIN can create and assign.
6. Permission delegation prevents ADMIN from granting privileges beyond their authority.
7. Organization and data scope checks restrict access to the correct records.

This is a solid foundation for your existing Next.js authentication, users, roles and permissions modules.&#x20;

Next step: We should finalize the ER diagram and exact PostgreSQL DDL (CREATE TABLE statements), including UUID keys, indexes, foreign keys, unique constraints and check constraints, before implementing the APIs.