I reviewed your uploaded Complete RBAC Database Architecture – PostgreSQL SQL file.

Below is the documentation of all four schemas and their tables, following your requested format:

Schema → Table → Short Explanation → Purpose → Uses → Relationship with Other Tables

Your current SQL architecture contains 4 schemas and 21 tables. It also contains one validation function and one trigger, which I will explain separately at the end.

# 1. `core` schema — Core Application Management

4 tables

What is the purpose of this schema?

The `core` schema manages the application's fundamental business entities, such as organizations, users, and organization memberships.

Think of it as the foundation of your application. Other schemas depend on these tables.

| Sr. No. | Table name                   | Short explanation                                   | Purpose                                                           | Uses                                                                                                                      | Relation with other tables                                                                                                                                                 |
| ------- | ---------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | `core.organizations`         | Stores company or organization information.         | Maintain customer organizations using your application.           | Register companies, activate/deactivate organizations, manage organization identity.                                      | Parent of `organization_settings`, `user_organizations`, organization-specific `roles`, and referenced by `user_roles`, `audit_logs`.                                      |
| 2       | `core.organization_settings` | Stores configurable settings for each organization. | Allow each organization to maintain its own application settings. | Company preferences, configurations, feature settings, organization-specific options.                                     | Many-to-One with `organizations` through `organization_id`. One organization can have multiple settings.                                                                   |
| 3       | `core.users`                 | Stores all application user accounts.               | Maintain user identity and authentication-related information.    | Create users, login, account status, email/mobile verification, password management, track who created or updated a user. | Self-referencing relationship through `created_by` and `updated_by`. Many-to-Many with organizations through `user_organizations`. Related to RBAC, auth and audit tables. |
| 4       | `core.user_organizations`    | Connects users with organizations.                  | Establish organization membership.                                | Assign users to companies, manage membership status, support users belonging to multiple organizations.                   | Junction table between `users` and `organizations`. Many-to-Many relationship.                                                                                             |

Source: Your uploaded SQL, organization and user management sections.&#x20;

Pasted text(5).txt



### Core schema relationship diagram

organizations

`id (PK)`

organization_settings

`organization_id (FK)`

users

`id (PK)`

Many-to-Many

user_organizations

`user_id (FK)`

`organization_id (FK)`

The junction table connects users and organizations.

Important: If AXYZ Pvt. Ltd. is only the software provider and multiple companies use your product, those customer companies are records in `core.organizations`. AXYZ itself does not automatically need to be one of those records.

# 2. `rbac` schema — Role-Based Access Control

10 tables

What is the purpose of this schema?

The `rbac` schema controls what users can access and what actions they can perform.

For example:

- SUPER_ADMIN can manage the entire platform.
- ADMIN can manage users in their organization.
- SUPERVISOR can access assigned operational modules.
- GUARD can access only permitted features.

This schema is responsible for roles, permissions, role assignments, delegation and data access scopes.

| Sr. No. | Table name                    | Short explanation                                              | Purpose                                                              | Uses                                                                    | Relation with other tables                                                                                                                                 |
| ------- | ----------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | `rbac.modules`                | Stores application modules and their hierarchy.                | Organize application functionality.                                  | Dashboard, Users, Roles, Reports, Settings, etc.                        | Self-referencing through `parent_id`. One module can have multiple permissions and route mappings.                                                         |
| 2       | `rbac.permissions`            | Stores individual application permissions.                     | Define what actions users can perform.                               | `USER_VIEW`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`.               | Many-to-One with `modules`. Many-to-Many with `roles` through `role_permissions`.                                                                          |
| 3       | `rbac.roles`                  | Stores system and organization-specific roles.                 | Define user access levels.                                           | SUPER_ADMIN, ADMIN, SUPERVISOR, GUARD, DATA_ENTRY_OPERATOR.             | Many-to-One with `organizations` for organization-specific roles. Many-to-Many with users through `user_roles` and permissions through `role_permissions`. |
| 4       | `rbac.role_permissions`       | Connects roles and permissions.                                | Assign permissions to roles.                                         | Give ADMIN user-management permissions and GUARD limited permissions.   | Junction table between `roles` and `permissions`. Many-to-Many relationship.                                                                               |
| 5       | `rbac.user_roles`             | Connects users with their assigned roles.                      | Assign roles to users.                                               | Assign ADMIN to Rahul, GUARD to Amit, and multiple roles where allowed. | Connects `users`, `roles` and optionally `organizations`.                                                                                                  |
| 6       | `rbac.role_delegations`       | Defines which role can manage or assign another role.          | Control role assignment authority.                                   | Allow ADMIN to create GUARD or SUPERVISOR users, but not another ADMIN. | References `organizations`, `roles` (delegator and target), and `users` (creator).                                                                         |
| 7       | `rbac.role_permission_grants` | Defines which permissions a role can delegate to another role. | Restrict permission delegation.                                      | Control which permissions an ADMIN can grant to an operational role.    | References `roles` (delegator and target), `permissions`, and `users`.                                                                                     |
| 8       | `rbac.role_inheritance`       | Defines inheritance between roles.                             | Allow one role to inherit another role's permissions.                | A senior role may inherit permissions from a base role.                 | Self-referencing Many-to-Many relationship between `roles`.                                                                                                |
| 9       | `rbac.route_permissions`      | Maps application routes to required permissions.               | Connect backend/API routes and frontend page paths with permissions. | Protect `/admin/users`, `GET /api/users`, `POST /api/users`, etc.       | Many-to-One with `modules` and `permissions`.                                                                                                              |
| 10      | `rbac.user_data_scopes`       | Defines which business data a user can access.                 | Restrict data visibility within an organization.                     | Restrict a supervisor to particular branches, departments or locations. | References `users` and `user_organizations` through a composite foreign key.                                                                               |

Source: Your uploaded SQL, RBAC module management through user data scopes.&#x20;

Pasted text(5).txt



### Understanding the most important RBAC relationships

These relationships are the foundation of your authorization architecture.

Relationship 1: Modules → Permissions

One module can have multiple permissions.

Example:

```
Users Module
    |
    |-- USER_VIEW
    |-- USER_CREATE
    |-- USER_UPDATE
    |-- USER_DELETE
```

Relationship: One-to-Many.

Relationship 2: Roles ↔ Permissions

One role can have multiple permissions, and one permission can belong to multiple roles.

```
ADMIN
    |-- USER_VIEW
    |-- USER_CREATE
    |-- USER_UPDATE
    |-- USER_DELETE

SUPERVISOR
    |-- USER_VIEW
    |-- REPORT_VIEW
```

Relationship: Many-to-Many through `role_permissions`.

Relationship 3: Users ↔ Roles

One user can have multiple roles, and one role can be assigned to multiple users.

```
Rahul
    |-- ADMIN

Amit
    |-- GUARD

Priya
    |-- SUPERVISOR
    |-- REPORT_VIEWER
```

Relationship: Many-to-Many through `user_roles`.

Relationship 4: Role Delegation

```
SUPER_ADMIN
    |
    |-- Can create ADMIN
    |-- Can create SUPERVISOR
    |-- Can create GUARD

ADMIN
    |
    |-- Can create SUPERVISOR
    |-- Can create GUARD
    |
    X-- Cannot create SUPER_ADMIN
    X-- Cannot create ADMIN
```

This is the responsibility of `role_delegations`, together with application-level authorization checks.

Relationship 5: User Data Scopes

Imagine an organization has three branches:

```
ABC Pvt. Ltd.
    |
    |-- Nagpur Branch
    |-- Pune Branch
    |-- Mumbai Branch
```

A supervisor assigned to Nagpur should not automatically access Pune or Mumbai data.

`user_data_scopes` stores these access restrictions.

These examples illustrate intended application behavior; the SQL tables alone do not implement every authorization rule.

# 3. `auth` schema — Authentication and Account Security

5 tables

What is the purpose of this schema?

The `auth` schema manages login sessions and security-related account workflows.

It is different from RBAC:

- Authentication: Who are you?
- Authorization: What are you allowed to do?

| Sr. No. | Table name                       | Short explanation                            | Purpose                                    | Uses                                                                    | Relation with other tables                                                                      |
| ------- | -------------------------------- | -------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1       | `auth.sessions`                  | Stores active and historical login sessions. | Manage authenticated user sessions.        | Track devices, IP addresses, expiration, logout and session revocation. | Many-to-One with `core.users`. One user can have multiple sessions.                             |
| 2       | `auth.invitations`               | Stores user invitation information.          | Allow administrators to invite new users.  | Send invitation links, accept invitations, revoke expired invitations.  | Many-to-One with `core.users` and optionally references the inviting user through `created_by`. |
| 3       | `auth.password_reset_tokens`     | Stores password reset token records.         | Support secure password recovery.          | Generate reset links, validate expiry, prevent token reuse.             | Many-to-One with `core.users`.                                                                  |
| 4       | `auth.email_verification_tokens` | Stores email verification token records.     | Verify user email addresses.               | Send verification links and track successful verification.              | Many-to-One with `core.users`.                                                                  |
| 5       | `auth.mfa_methods`               | Stores multi-factor authentication methods.  | Add another authentication security layer. | TOTP authenticator, email OTP, SMS OTP and WebAuthn.                    | Many-to-One with `core.users`. One user can have multiple MFA methods.                          |

Source: Your uploaded SQL, authentication sections.&#x20;

Pasted text(5).txt



### Example authentication workflow

Imagine Rahul logs into your application.

1. User account verification

   Find Rahul in `core.users` and validate his credentials.
2. Create login session

   Insert a session record into `auth.sessions`. Store only a hash of the session token.
3. Verify MFA if enabled

   Check `auth.mfa_methods` if additional verification is required.
4. Load assigned roles

   Read Rahul's assignments from `rbac.user_roles`.
5. Load permissions

   Read permissions through `rbac.role_permissions`.
6. Allow application access

   Check permissions before granting access to pages, APIs and actions.

# 4. `audit` schema — Audit Logs and Security Monitoring

2 tables

What is the purpose of this schema?

This schema records important activities and security-related events happening inside your application.

For example:

- Who created a user?
- Who deleted a user?
- Who changed a role?
- Who changed permissions?
- Who attempted an unsuccessful login?
- When did a user access the application?

| Sr. No. | Table name              | Short explanation                                     | Purpose                                    | Uses                                                                                             | Relation with other tables                                                                                         |
| ------- | ----------------------- | ----------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 1       | `audit.audit_logs`      | Stores records of application activities and changes. | Maintain an audit trail.                   | Record user creation, role updates, permission changes, organization changes and old/new values. | Many-to-One with `core.users` through `actor_id`; Many-to-One with `core.organizations` through `organization_id`. |
| 2       | `audit.security_events` | Stores security-related events.                       | Monitor and investigate security activity. | Failed login attempts, suspicious activity, account lockouts, security alerts and MFA events.    | Many-to-One with `core.users` through optional `user_id`.                                                          |

Source: Your uploaded SQL, audit and security events sections.&#x20;

Pasted text(5).txt



### Example: Audit log

Suppose Rahul is an ADMIN and updates Amit's role from GUARD to SUPERVISOR.

Your audit log might contain:

| Column      | Example value              |
| ----------- | -------------------------- |
| actor_id    | Rahul's user ID            |
| action      | ROLE_UPDATED               |
| entity_type | USER_ROLE                  |
| entity_id   | Amit's user-role record ID |
| old_values  | GUARD                      |
| new_values  | SUPERVISOR                 |
| created_at  | Timestamp of change        |

This provides a history of important operations.

# 5. Complete schema summary

Here is the overall table inventory from your SQL file.

| Schema  | Table count | Main responsibility                   |
| ------- | ----------- | ------------------------------------- |
| `core`  | 4           | Organizations and users               |
| `rbac`  | 10          | Roles, permissions and access control |
| `auth`  | 5           | Login, sessions and account security  |
| `audit` | 2           | Activity history and security events  |
| Total   | 21          | Complete database foundation          |

## 6. Complete relationship overview

The following diagram shows how the major database areas connect.

## Application database architecture

CORE SCHEMA\
`organizations`

`users`

`user_organizations`

`organization_settings`

RBAC SCHEMA\
`modules`

`permissions`

`roles`

`user_roles`

`role_permissions`

`role_delegations`

`role_permission_grants`

`role_inheritance`

`route_permissions`

`user_data_scopes`

AUTH SCHEMA\
`sessions`

`invitations`

`password_reset_tokens`

`email_verification_tokens`

`mfa_methods`

AUDIT SCHEMA\
`audit_logs`

`security_events`

Conceptual grouping: the actual foreign keys and cross-schema relationships are defined in your SQL.

# 7. Important additional database objects

Your uploaded SQL contains more than just tables.

It also defines one database function and one trigger.

| Sr. No. | Object                         | Schema | Purpose                                                                                                                            |
| ------- | ------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1       | `validate_user_role_scope()`   | `rbac` | Checks whether a role's organization matches the organization in which it is assigned. Also checks active organization membership. |
| 2       | `trg_validate_user_role_scope` | `rbac` | Automatically executes the validation function before inserting or updating a user-role assignment.                                |

This prevents certain invalid role assignments at database level.&#x20;

Pasted text(5).txt



# 8. My architecture review: Things to consider before implementation

Your SQL provides a good foundation, but I want to point out some important design decisions rather than treating every table as mandatory.

| Area                          | My recommendation                                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core.users` and user profile | Your current SQL stores first name and last name directly in `users`. If you want separate editable profile information, add `core.user_profiles` with a unique `user_id` foreign key. |
| `core.organizations`          | Keep it if you plan to support multiple customer companies. For a strictly single-company internal application, it may be unnecessary.                                                 |
| `rbac.role_inheritance`       | Optional. Avoid implementing it until you actually need permission inheritance.                                                                                                        |
| `rbac.route_permissions`      | Useful for database-managed route mappings, but complex authorization policies may be better handled in backend code.                                                                  |
| `rbac.role_permission_grants` | Requires backend validation to ensure the delegator really has authority to grant the permission.                                                                                      |
| `rbac.user_roles`             | Supports multiple roles per user. If you want exactly one role per user per organization, enforce that separately.                                                                     |
| `audit.audit_logs`            | Important for administrative and security-sensitive operations. Restrict modifications and deletions.                                                                                  |

One important security detail: The SQL's role validation trigger checks role scope and active membership when assigning a role. However, it does not by itself enforce all delegation rules, permission checks, tenant data isolation or API authorization. Those must also be implemented in your backend.

Another important detail: The uploaded SQL does not contain a `core.user_profiles` table yet. It currently keeps basic name information in `core.users`. We can add the profile table as a separate one-to-one relationship without changing the overall schema architecture.

## Final recommendation

I would keep the four-schema organization:

1. `core` — Who uses the application?
2. `rbac` — What can they access and do?
3. `auth` — How do they authenticate?
4. `audit` — What activities have happened?

This separation makes the database easier to understand, maintain and extend.

The next step I recommend is to turn this table inventory into a complete ER diagram with all 21 tables, primary keys, foreign keys, cardinalities (1:1, 1:N, M:N), and cross-schema relationships, before writing the final production database migration scripts.