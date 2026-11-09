# Smart Gate Management System – Complete Database Architecture

I’ll approach this as a production-oriented PostgreSQL database design for your complete Smart Gate Management System, covering the existing RBAC module and all application modules.

The design will follow your confirmed requirements:

- One building can contain multiple organizations.
- Each organization has multiple employees.
- Employees can authenticate using RFID cards or fingerprints.
- Guards can register visitors who are not already registered.
- Every visitor registration is separate from the visitor's identity.
- Multiple gates and ESP32 controllers are supported.
- The system operates on a local Raspberry Pi server and PostgreSQL database, without depending on the internet.
- Your existing authentication and RBAC architecture must be preserved and extended, not replaced.

I will not provide SQL `CREATE TABLE` queries. I’ll provide table names, column-level schemas, primary and foreign keys, constraints, and the relationships between tables.

## 1. First, an important correction to the RBAC table count

Your RBAC list contains 21 tables, not 19:

| Schema  | Tables |
| ------- | ------ |
| `core`  | 4      |
| `rbac`  | 10     |
| `auth`  | 5      |
| `audit` | 2      |
| Total   | 21     |

You also mentioned one validation function and trigger. Those are database objects, not tables.

I will retain all 21 listed tables in the design. I’ll also identify where additional application tables are required, without silently merging them into your RBAC module.

## 2. Proposed database schema organization

I recommend organizing the database into these logical PostgreSQL schemas:

| Schema          | Responsibility                                                       |
| --------------- | -------------------------------------------------------------------- |
| `core`          | Building, organizations, users, employees and common identity        |
| `rbac`          | Roles, permissions, role assignments and data access                 |
| `auth`          | Login sessions, invitations, password reset and MFA                  |
| `employee`      | Employee profiles and employment-related records                     |
| `credential`    | RFID cards, fingerprints and credential lifecycle                    |
| `visitor`       | Visitor identities, visit requests, approvals and check-in/check-out |
| `gate`          | Building gates, gate configuration and access points                 |
| `device`        | ESP32 controllers, hardware components, connectivity and commands    |
| `access`        | Authentication attempts, access decisions and physical gate events   |
| `operations`    | Manual operations, incidents and operational activities              |
| `communication` | Notifications and delivery records                                   |
| `system`        | Application-wide settings and configuration                          |
| `audit`         | Security events and audit history                                    |
| `reporting`     | Optional stored report snapshots or export jobs                      |

This separation is logical, not a requirement to create a separate database for each module. All schemas can reside in one PostgreSQL database.

## 3. Core schema – Building, organization and user management

These tables establish the foundation for the entire application.

### A. `core` schema

#### 1. `core.buildings`

Stores the physical building or campus where the Smart Gate Management System is deployed.

| Column           | Data type    | Key / purpose     |
| ---------------- | ------------ | ----------------- |
| `building_id`    | UUID         | PK                |
| `building_code`  | VARCHAR(50)  | UNIQUE            |
| `building_name`  | VARCHAR(150) | Building name     |
| `address_line_1` | VARCHAR(255) | Address           |
| `address_line_2` | VARCHAR(255) | Optional          |
| `city`           | VARCHAR(100) | City              |
| `state`          | VARCHAR(100) | State             |
| `postal_code`    | VARCHAR(20)  | Postal code       |
| `country`        | VARCHAR(100) | Country           |
| `timezone`       | VARCHAR(60)  | Local timezone    |
| `status`         | VARCHAR(20)  | ACTIVE / INACTIVE |
| `created_at`     | TIMESTAMPTZ  | Created timestamp |
| `updated_at`     | TIMESTAMPTZ  | Updated timestamp |

#### 2. `core.organizations`

Stores organizations operating inside the building.

| Column              | Data type    | Key / purpose                      |
| ------------------- | ------------ | ---------------------------------- |
| `organization_id`   | UUID         | PK                                 |
| `organization_code` | VARCHAR(50)  | UNIQUE                             |
| `organization_name` | VARCHAR(200) | Organization name                  |
| `organization_type` | VARCHAR(50)  | Company, institution, office, etc. |
| `email`             | VARCHAR(255) | Optional                           |
| `phone`             | VARCHAR(30)  | Optional                           |
| `address`           | TEXT         | Optional                           |
| `status`            | VARCHAR(20)  | ACTIVE / INACTIVE / SUSPENDED      |
| `created_at`        | TIMESTAMPTZ  | Created timestamp                  |
| `updated_at`        | TIMESTAMPTZ  | Updated timestamp                  |

#### 3. `core.building_organizations`

Connects organizations to buildings. This junction table allows an organization to be associated with more than one building if your deployment expands later.

| Column                     | Data type   | Key / purpose                |
| -------------------------- | ----------- | ---------------------------- |
| `building_organization_id` | UUID        | PK                           |
| `building_id`              | UUID        | FK → `core.buildings`        |
| `organization_id`          | UUID        | FK → `core.organizations`    |
| `is_primary`               | BOOLEAN     | Primary building association |
| `status`                   | VARCHAR(20) | ACTIVE / INACTIVE            |
| `created_at`               | TIMESTAMPTZ | Created timestamp            |

Constraint: UNIQUE (`building_id`, `organization_id`).

#### 4. `core.organization_settings`

Stores organization-specific configuration.

| Column            | Data type    | Key / purpose             |
| ----------------- | ------------ | ------------------------- |
| `setting_id`      | UUID         | PK                        |
| `organization_id` | UUID         | FK → `core.organizations` |
| `setting_key`     | VARCHAR(100) | Setting identifier        |
| `setting_value`   | JSONB        | Configuration value       |
| `description`     | TEXT         | Purpose of setting        |
| `updated_by`      | UUID         | FK → `core.users`         |
| `created_at`      | TIMESTAMPTZ  | Created timestamp         |
| `updated_at`      | TIMESTAMPTZ  | Updated timestamp         |

Constraint: UNIQUE (`organization_id`, `setting_key`).

#### 5. `core.users`

Stores application login accounts. A user account is not the same thing as an employee record.

| Column                | Data type    | Key / purpose                                          |
| --------------------- | ------------ | ------------------------------------------------------ |
| `user_id`             | UUID         | PK                                                     |
| `username`            | VARCHAR(100) | UNIQUE                                                 |
| `email`               | VARCHAR(255) | Optional; enforce uniqueness according to login policy |
| `phone`               | VARCHAR(30)  | Optional                                               |
| `password_hash`       | TEXT         | Password hash                                          |
| `full_name`           | VARCHAR(200) | Account holder's name                                  |
| `profile_image`       | TEXT         | Optional file reference                                |
| `account_status`      | VARCHAR(20)  | ACTIVE / INACTIVE / SUSPENDED / LOCKED                 |
| `is_email_verified`   | BOOLEAN      | Email verification status                              |
| `is_phone_verified`   | BOOLEAN      | Phone verification status                              |
| `last_login_at`       | TIMESTAMPTZ  | Last successful login                                  |
| `password_changed_at` | TIMESTAMPTZ  | Last password change                                   |
| `created_at`          | TIMESTAMPTZ  | Created timestamp                                      |
| `updated_at`          | TIMESTAMPTZ  | Updated timestamp                                      |

#### 6. `core.user_organizations`

Maps user accounts to organizations. A user may belong to multiple organizations and have different roles in each.

| Column                 | Data type   | Key / purpose                 |
| ---------------------- | ----------- | ----------------------------- |
| `user_organization_id` | UUID        | PK                            |
| `user_id`              | UUID        | FK → `core.users`             |
| `organization_id`      | UUID        | FK → `core.organizations`     |
| `membership_status`    | VARCHAR(20) | ACTIVE / INACTIVE / SUSPENDED |
| `is_primary`           | BOOLEAN     | Primary organization          |
| `joined_at`            | TIMESTAMPTZ | Membership start              |
| `left_at`              | TIMESTAMPTZ | Optional membership end       |
| `created_at`           | TIMESTAMPTZ | Created timestamp             |

Constraint: UNIQUE (`user_id`, `organization_id`).

### Core relationships

```
core.buildings
      |
      | 1:M
      v
core.building_organizations
      |
      | M:1
      v
core.organizations
      |
      | 1:M
      +----------------------+
      |                      |
      v                      v
core.organization_settings  core.user_organizations
                             |
                             | M:1
                             v
                         core.users
```

A user can have several organization memberships. Employee identity and login identity will be linked separately, so an employee does not need an application login account merely to use an RFID card.

## 4. RBAC schema – Your existing 21 tables

I am retaining your original RBAC table names and responsibilities. The following columns are a proposed production-oriented schema; they are not claims that your existing database already has these exact columns.

### B. `rbac` schema

#### 7. `rbac.modules`

Defines application modules, such as Employee Management, Visitor Management, Gate Control and Reports.

| Column             | Data type    | Key / purpose                           |
| ------------------ | ------------ | --------------------------------------- |
| `module_id`        | UUID         | PK                                      |
| `parent_module_id` | UUID         | FK → `rbac.modules.module_id`, nullable |
| `module_code`      | VARCHAR(100) | UNIQUE                                  |
| `module_name`      | VARCHAR(150) | Display name                            |
| `description`      | TEXT         | Module purpose                          |
| `display_order`    | INTEGER      | Sidebar ordering                        |
| `is_active`        | BOOLEAN      | Active status                           |
| `created_at`       | TIMESTAMPTZ  | Created timestamp                       |

#### 8. `rbac.permissions`

Defines individual actions. Keep permissions granular: viewing visitor records is different from approving visits or opening a gate.

| Column            | Data type    | Key / purpose                                             |
| ----------------- | ------------ | --------------------------------------------------------- |
| `permission_id`   | UUID         | PK                                                        |
| `module_id`       | UUID         | FK → `rbac.modules`                                       |
| `permission_code` | VARCHAR(150) | UNIQUE                                                    |
| `permission_name` | VARCHAR(150) | Display name                                              |
| `action`          | VARCHAR(50)  | CREATE / READ / UPDATE / DELETE / APPROVE / REJECT / OPEN |
| `description`     | TEXT         | Permission details                                        |
| `is_sensitive`    | BOOLEAN      | Sensitive action indicator                                |
| `is_active`       | BOOLEAN      | Active status                                             |
| `created_at`      | TIMESTAMPTZ  | Created timestamp                                         |

#### 9. `rbac.roles`

Defines roles such as SUPER_ADMIN, ADMIN, SUPERVISOR, GUARD_ADMIN, GUARD and RECEPTIONIST.

| Column            | Data type    | Key / purpose                                        |
| ----------------- | ------------ | ---------------------------------------------------- |
| `role_id`         | UUID         | PK                                                   |
| `organization_id` | UUID         | FK → `core.organizations`, nullable for global roles |
| `role_code`       | VARCHAR(100) | Role code                                            |
| `role_name`       | VARCHAR(150) | Display name                                         |
| `description`     | TEXT         | Responsibilities                                     |
| `scope_type`      | VARCHAR(30)  | GLOBAL / BUILDING / ORGANIZATION / GATE              |
| `is_system_role`  | BOOLEAN      | Protected predefined role                            |
| `is_assignable`   | BOOLEAN      | Can this role be assigned?                           |
| `is_active`       | BOOLEAN      | Active status                                        |
| `created_by`      | UUID         | FK → `core.users`                                    |
| `created_at`      | TIMESTAMPTZ  | Created timestamp                                    |
| `updated_at`      | TIMESTAMPTZ  | Updated timestamp                                    |

Constraint: role codes must be unique within their intended scope. Global roles and organization-specific roles need an explicit uniqueness policy.

#### 10. `rbac.role_permissions`

Connects roles to permissions.

| Column               | Data type   | Key / purpose           |
| -------------------- | ----------- | ----------------------- |
| `role_permission_id` | UUID        | PK                      |
| `role_id`            | UUID        | FK → `rbac.roles`       |
| `permission_id`      | UUID        | FK → `rbac.permissions` |
| `granted_by`         | UUID        | FK → `core.users`       |
| `created_at`         | TIMESTAMPTZ | Created timestamp       |

Constraint: UNIQUE (`role_id`, `permission_id`).

#### 11. `rbac.user_roles`

Assigns roles to users. This is where the user's organizational and operational scope is defined.

| Column            | Data type   | Key / purpose                                             |
| ----------------- | ----------- | --------------------------------------------------------- |
| `user_role_id`    | UUID        | PK                                                        |
| `user_id`         | UUID        | FK → `core.users`                                         |
| `role_id`         | UUID        | FK → `rbac.roles`                                         |
| `organization_id` | UUID        | FK → `core.organizations`, nullable for global assignment |
| `building_id`     | UUID        | FK → `core.buildings`, nullable                           |
| `assigned_by`     | UUID        | FK → `core.users`                                         |
| `assigned_at`     | TIMESTAMPTZ | Assignment date                                           |
| `expires_at`      | TIMESTAMPTZ | Optional expiration                                       |
| `is_active`       | BOOLEAN     | Active assignment                                         |

A gate-scoped assignment may need a separate gate mapping or a carefully designed scope record. Do not use an unrestricted `NULL` to mean every possible scope.

#### 12. `rbac.role_delegations`

Defines which roles/users may delegate authority to other roles/users.

| Column              | Data type   | Key / purpose                           |
| ------------------- | ----------- | --------------------------------------- |
| `delegation_id`     | UUID        | PK                                      |
| `delegator_user_id` | UUID        | FK → `core.users`                       |
| `delegate_user_id`  | UUID        | FK → `core.users`                       |
| `role_id`           | UUID        | FK → `rbac.roles`                       |
| `organization_id`   | UUID        | FK → `core.organizations`, nullable     |
| `scope_type`        | VARCHAR(30) | Delegation scope                        |
| `scope_id`          | UUID        | ID of scoped resource, where applicable |
| `valid_from`        | TIMESTAMPTZ | Start                                   |
| `valid_until`       | TIMESTAMPTZ | End                                     |
| `status`            | VARCHAR(20) | ACTIVE / REVOKED / EXPIRED              |
| `created_at`        | TIMESTAMPTZ | Created timestamp                       |

#### 13. `rbac.role_permission_grants`

Stores explicit permission grants or restrictions beyond the base role-permission mapping.

| Column            | Data type   | Key / purpose                           |
| ----------------- | ----------- | --------------------------------------- |
| `grant_id`        | UUID        | PK                                      |
| `user_id`         | UUID        | FK → `core.users`                       |
| `permission_id`   | UUID        | FK → `rbac.permissions`                 |
| `organization_id` | UUID        | FK → `core.organizations`, nullable     |
| `scope_type`      | VARCHAR(30) | GLOBAL / BUILDING / ORGANIZATION / GATE |
| `scope_id`        | UUID        | Optional scope identifier               |
| `effect`          | VARCHAR(10) | ALLOW / DENY                            |
| `granted_by`      | UUID        | FK → `core.users`                       |
| `valid_from`      | TIMESTAMPTZ | Start                                   |
| `valid_until`     | TIMESTAMPTZ | End                                     |
| `is_active`       | BOOLEAN     | Active status                           |
| `created_at`      | TIMESTAMPTZ | Created timestamp                       |

Important: Define an explicit precedence policy for DENY versus ALLOW and role-derived permissions. Avoid ambiguous permission resolution.

#### 14. `rbac.role_inheritance`

Defines optional parent-child role relationships.

| Column                | Data type   | Key / purpose                       |
| --------------------- | ----------- | ----------------------------------- |
| `role_inheritance_id` | UUID        | PK                                  |
| `parent_role_id`      | UUID        | FK → `rbac.roles`                   |
| `child_role_id`       | UUID        | FK → `rbac.roles`                   |
| `organization_id`     | UUID        | FK → `core.organizations`, nullable |
| `created_by`          | UUID        | FK → `core.users`                   |
| `created_at`          | TIMESTAMPTZ | Created timestamp                   |

Constraint: UNIQUE (`parent_role_id`, `child_role_id`); prevent self-inheritance and cycles.

Your reporting hierarchy (ADMIN → SUPERVISOR / GUARD_ADMIN → GUARD) must not automatically become permission inheritance. Use this table only when you explicitly want inherited permissions.

#### 15. `rbac.route_permissions`

Maps frontend routes or API route patterns to permissions.

| Column                | Data type    | Key / purpose                     |
| --------------------- | ------------ | --------------------------------- |
| `route_permission_id` | UUID         | PK                                |
| `module_id`           | UUID         | FK → `rbac.modules`               |
| `permission_id`       | UUID         | FK → `rbac.permissions`           |
| `route_path`          | VARCHAR(255) | Route pattern                     |
| `http_method`         | VARCHAR(10)  | GET / POST / PUT / PATCH / DELETE |
| `route_type`          | VARCHAR(20)  | PAGE / API                        |
| `description`         | TEXT         | Route purpose                     |
| `is_active`           | BOOLEAN      | Active status                     |
| `created_at`          | TIMESTAMPTZ  | Created timestamp                 |

#### 16. `rbac.user_data_scopes`

Defines which data a user is allowed to access.

| Column               | Data type   | Key / purpose                               |
| -------------------- | ----------- | ------------------------------------------- |
| `user_data_scope_id` | UUID        | PK                                          |
| `user_id`            | UUID        | FK → `core.users`                           |
| `organization_id`    | UUID        | FK → `core.organizations`, nullable         |
| `scope_type`         | VARCHAR(30) | BUILDING / ORGANIZATION / GATE / DEPARTMENT |
| `scope_id`           | UUID        | Scoped resource ID                          |
| `access_level`       | VARCHAR(20) | READ / WRITE / FULL                         |
| `created_by`         | UUID        | FK → `core.users`                           |
| `is_active`          | BOOLEAN     | Active status                               |
| `created_at`         | TIMESTAMPTZ | Created timestamp                           |

Important design note: A generic `scope_id` cannot have an ordinary foreign key to several unrelated tables. If strict referential integrity is required, use typed scope columns or a dedicated scope-resource table instead.

### RBAC relationships

```
rbac.modules
    |
    +---- 1:M ---- rbac.permissions
    |
    +---- 1:M ---- rbac.modules (parent-child)


rbac.roles
    |
    +---- M:N ---- rbac.role_permissions ---- M:1 ---- rbac.permissions
    |
    +---- 1:M ---- rbac.user_roles ---- M:1 ---- core.users
    |
    +---- 1:M ---- rbac.role_delegations
    |
    +---- 1:M ---- rbac.role_inheritance
    |
    +---- 1:M ---- rbac.role_permission_grants


rbac.route_permissions
    |
    +---- M:1 ---- rbac.modules
    |
    +---- M:1 ---- rbac.permissions


rbac.user_data_scopes
    |
    +---- M:1 ---- core.users
```

The important distinction is:

- `user_roles` answers: Which roles does this user have?
- `role_permissions` answers: What actions does this role permit?
- `role_permission_grants` answers: Are there additional user-specific grants or restrictions?
- `user_data_scopes` answers: Which records/resources can the user access?
- `route_permissions` answers: Which permission protects this page or API endpoint?
- `role_delegations` answers: Who may delegate authority, and within what scope?

## 5. Authentication schema

### C. `auth` schema

#### 17. `auth.sessions`

Stores authenticated application sessions.

| Column               | Data type   | Key / purpose               |
| -------------------- | ----------- | --------------------------- |
| `session_id`         | UUID        | PK                          |
| `user_id`            | UUID        | FK → `core.users`           |
| `session_token_hash` | TEXT        | Hashed session token        |
| `ip_address`         | INET        | Client IP                   |
| `user_agent`         | TEXT        | Browser/device information  |
| `created_at`         | TIMESTAMPTZ | Login time                  |
| `last_activity_at`   | TIMESTAMPTZ | Last activity               |
| `expires_at`         | TIMESTAMPTZ | Expiration                  |
| `revoked_at`         | TIMESTAMPTZ | Revocation time             |
| `revoked_by`         | UUID        | FK → `core.users`, nullable |
| `status`             | VARCHAR(20) | ACTIVE / EXPIRED / REVOKED  |

#### 18. `auth.invitations`

Stores invitations to create or join application accounts.

| Column            | Data type    | Key / purpose                          |
| ----------------- | ------------ | -------------------------------------- |
| `invitation_id`   | UUID         | PK                                     |
| `organization_id` | UUID         | FK → `core.organizations`, nullable    |
| `email`           | VARCHAR(255) | Invitee email                          |
| `invited_by`      | UUID         | FK → `core.users`                      |
| `token_hash`      | TEXT         | Hashed invitation token                |
| `expires_at`      | TIMESTAMPTZ  | Expiration                             |
| `accepted_at`     | TIMESTAMPTZ  | Acceptance                             |
| `status`          | VARCHAR(20)  | PENDING / ACCEPTED / EXPIRED / REVOKED |
| `created_at`      | TIMESTAMPTZ  | Created timestamp                      |

#### 19. `auth.password_reset_tokens`

Stores password-reset token metadata.

| Column           | Data type   | Key / purpose      |
| ---------------- | ----------- | ------------------ |
| `reset_token_id` | UUID        | PK                 |
| `user_id`        | UUID        | FK → `core.users`  |
| `token_hash`     | TEXT        | Hashed reset token |
| `expires_at`     | TIMESTAMPTZ | Expiration         |
| `used_at`        | TIMESTAMPTZ | Consumption time   |
| `created_at`     | TIMESTAMPTZ | Created timestamp  |

#### 20. `auth.email_verification_tokens`

Stores email-verification tokens.

| Column                  | Data type   | Key / purpose     |
| ----------------------- | ----------- | ----------------- |
| `verification_token_id` | UUID        | PK                |
| `user_id`               | UUID        | FK → `core.users` |
| `token_hash`            | TEXT        | Hashed token      |
| `expires_at`            | TIMESTAMPTZ | Expiration        |
| `verified_at`           | TIMESTAMPTZ | Verification time |
| `created_at`            | TIMESTAMPTZ | Created timestamp |

#### 21. `auth.mfa_methods`

Stores multi-factor authentication method metadata.

| Column             | Data type    | Key / purpose                    |
| ------------------ | ------------ | -------------------------------- |
| `mfa_method_id`    | UUID         | PK                               |
| `user_id`          | UUID         | FK → `core.users`                |
| `method_type`      | VARCHAR(30)  | TOTP / EMAIL / SMS / OTHER       |
| `method_name`      | VARCHAR(100) | Display name                     |
| `secret_encrypted` | TEXT         | Encrypted secret, if applicable  |
| `destination`      | VARCHAR(255) | Masked email/phone or identifier |
| `is_primary`       | BOOLEAN      | Primary method                   |
| `is_verified`      | BOOLEAN      | Verified status                  |
| `is_active`        | BOOLEAN      | Active status                    |
| `created_at`       | TIMESTAMPTZ  | Created timestamp                |
| `updated_at`       | TIMESTAMPTZ  | Updated timestamp                |

### Authentication relationships

```
core.users
    |
    +---- 1:M ---- auth.sessions
    |
    +---- 1:M ---- auth.invitations (invited_by)
    |
    +---- 1:M ---- auth.password_reset_tokens
    |
    +---- 1:M ---- auth.email_verification_tokens
    |
    +---- 1:M ---- auth.mfa_methods
```

`auth.invitations.organization_id` identifies the organization to which the invitation relates. The invited account is not created until the invitation acceptance workflow completes.

## 6. Employee management schema

The employee module is separate from application login accounts. An employee can enter the building using RFID/fingerprint without ever logging in to the web application.

### D. `employee` schema

#### 22. `employee.departments`

| Column            | Data type    | Key / purpose             |
| ----------------- | ------------ | ------------------------- |
| `department_id`   | UUID         | PK                        |
| `organization_id` | UUID         | FK → `core.organizations` |
| `department_code` | VARCHAR(50)  | Department code           |
| `department_name` | VARCHAR(150) | Department name           |
| `description`     | TEXT         | Optional                  |
| `is_active`       | BOOLEAN      | Active status             |
| `created_at`      | TIMESTAMPTZ  | Created timestamp         |

#### 23. `employee.designations`

| Column             | Data type    | Key / purpose             |
| ------------------ | ------------ | ------------------------- |
| `designation_id`   | UUID         | PK                        |
| `organization_id`  | UUID         | FK → `core.organizations` |
| `designation_name` | VARCHAR(150) | Job title                 |
| `description`      | TEXT         | Optional                  |
| `is_active`        | BOOLEAN      | Active status             |
| `created_at`       | TIMESTAMPTZ  | Created timestamp         |

#### 24. `employee.employees`

Stores employee identity and employment information.

| Column              | Data type    | Key / purpose                          |
| ------------------- | ------------ | -------------------------------------- |
| `employee_id`       | UUID         | PK                                     |
| `organization_id`   | UUID         | FK → `core.organizations`              |
| `user_id`           | UUID         | FK → `core.users`, nullable            |
| `employee_code`     | VARCHAR(50)  | Employee code                          |
| `first_name`        | VARCHAR(100) | First name                             |
| `middle_name`       | VARCHAR(100) | Optional                               |
| `last_name`         | VARCHAR(100) | Last name                              |
| `date_of_birth`     | DATE         | Optional                               |
| `gender`            | VARCHAR(30)  | Optional                               |
| `email`             | VARCHAR(255) | Employee email                         |
| `phone`             | VARCHAR(30)  | Employee phone                         |
| `department_id`     | UUID         | FK → `employee.departments`, nullable  |
| `designation_id`    | UUID         | FK → `employee.designations`, nullable |
| `joining_date`      | DATE         | Employment start                       |
| `employment_status` | VARCHAR(30)  | ACTIVE / INACTIVE / SUSPENDED / LEFT   |
| `photo_path`        | TEXT         | Optional photo reference               |
| `created_by`        | UUID         | FK → `core.users`                      |
| `created_at`        | TIMESTAMPTZ  | Created timestamp                      |
| `updated_at`        | TIMESTAMPTZ  | Updated timestamp                      |

Constraint: UNIQUE (`organization_id`, `employee_code`).

#### 25. `employee.employee_status_history`

Keeps a historical record of employment status changes.

| Column              | Data type   | Key / purpose             |
| ------------------- | ----------- | ------------------------- |
| `status_history_id` | UUID        | PK                        |
| `employee_id`       | UUID        | FK → `employee.employees` |
| `previous_status`   | VARCHAR(30) | Previous status           |
| `new_status`        | VARCHAR(30) | New status                |
| `reason`            | TEXT        | Reason                    |
| `changed_by`        | UUID        | FK → `core.users`         |
| `changed_at`        | TIMESTAMPTZ | Change timestamp          |

### Employee relationships

```
core.organizations
    |
    +---- 1:M ---- employee.departments
    |
    +---- 1:M ---- employee.designations
    |
    +---- 1:M ---- employee.employees

employee.departments
    |
    +---- 1:M ---- employee.employees

employee.designations
    |
    +---- 1:M ---- employee.employees

core.users
    |
    +---- 1:M ---- employee.employees (optional account link)

employee.employees
    |
    +---- 1:M ---- employee.employee_status_history
```

For your initial deployment, I recommend one employee record belonging to one organization. If you later need employees working across multiple organizations, introduce an employee-organization membership model rather than allowing the employee's organization ID to become ambiguous.

## 7. Credential management schema

RFID and fingerprint credentials should not be stored directly inside the employee table. Separating them makes it possible to revoke, replace, expire and audit credentials independently.

### E. `credential` schema

#### 26. `credential.credential_types`

Defines the supported credential types.

| Column               | Data type    | Key / purpose              |
| -------------------- | ------------ | -------------------------- |
| `credential_type_id` | UUID         | PK                         |
| `type_code`          | VARCHAR(50)  | UNIQUE: RFID / FINGERPRINT |
| `type_name`          | VARCHAR(100) | Display name               |
| `description`        | TEXT         | Details                    |
| `is_active`          | BOOLEAN      | Active status              |

#### 27. `credential.employee_credentials`

Maps a credential to an employee.

| Column                   | Data type    | Key / purpose                      |
| ------------------------ | ------------ | ---------------------------------- |
| `employee_credential_id` | UUID         | PK                                 |
| `employee_id`            | UUID         | FK → `employee.employees`          |
| `credential_type_id`     | UUID         | FK → `credential.credential_types` |
| `credential_code`        | VARCHAR(255) | RFID UID or credential identifier  |
| `credential_label`       | VARCHAR(100) | Optional display label             |
| `valid_from`             | TIMESTAMPTZ  | Start validity                     |
| `valid_until`            | TIMESTAMPTZ  | Optional expiration                |
| `status`                 | VARCHAR(20)  | ACTIVE / REVOKED / EXPIRED / LOST  |
| `registered_by`          | UUID         | FK → `core.users`                  |
| `registered_at`          | TIMESTAMPTZ  | Registration timestamp             |
| `revoked_by`             | UUID         | FK → `core.users`, nullable        |
| `revoked_at`             | TIMESTAMPTZ  | Revocation timestamp               |
| `revocation_reason`      | TEXT         | Optional reason                    |

#### 28. `credential.fingerprint_templates`

Stores fingerprint template references and registration metadata.

| Column                    | Data type    | Key / purpose                            |
| ------------------------- | ------------ | ---------------------------------------- |
| `fingerprint_template_id` | UUID         | PK                                       |
| `employee_credential_id`  | UUID         | FK → `credential.employee_credentials`   |
| `template_reference`      | TEXT         | Secure template reference                |
| `template_hash`           | TEXT         | Optional integrity/fingerprint reference |
| `sensor_model`            | VARCHAR(100) | Sensor model                             |
| `template_version`        | VARCHAR(50)  | Template format version                  |
| `encrypted_template`      | BYTEA        | Optional encrypted biometric template    |
| `registered_at`           | TIMESTAMPTZ  | Registration time                        |
| `status`                  | VARCHAR(20)  | ACTIVE / REVOKED / INVALID               |

Biometric security: Do not store raw fingerprint images in PostgreSQL. Prefer keeping biometric templates in a protected format, encrypting sensitive template data, restricting database access and defining a deletion policy. If fingerprint matching is performed entirely inside the ESP32 sensor, the database may only need a sensor/template reference and registration status.

### Credential relationships

```
employee.employees
       |
       | 1:M
       v
credential.employee_credentials
       |
       +---- M:1 ---- credential.credential_types
       |
       +---- 1:M ---- credential.fingerprint_templates
```

An employee may have multiple RFID cards or fingerprint registrations over time. Revoked credentials remain in the database for historical auditability.

## 8. Visitor management schema

This is an important independent module. A visitor's identity must be reusable, while every visit must be a separate transaction.

### F. `visitor` schema

#### 29. `visitor.visitors`

Stores the visitor's identity.

| Column                      | Data type    | Key / purpose                   |
| --------------------------- | ------------ | ------------------------------- |
| `visitor_id`                | UUID         | PK                              |
| `visitor_code`              | VARCHAR(50)  | UNIQUE                          |
| `first_name`                | VARCHAR(100) | First name                      |
| `middle_name`               | VARCHAR(100) | Optional                        |
| `last_name`                 | VARCHAR(100) | Last name                       |
| `phone`                     | VARCHAR(30)  | Contact number                  |
| `email`                     | VARCHAR(255) | Optional                        |
| `identity_type`             | VARCHAR(50)  | Optional identity document type |
| `identity_number_encrypted` | TEXT         | Encrypted identity number       |
| `photo_path`                | TEXT         | Optional photo reference        |
| `created_by`                | UUID         | FK → `core.users`               |
| `created_at`                | TIMESTAMPTZ  | Registration timestamp          |
| `updated_at`                | TIMESTAMPTZ  | Updated timestamp               |

#### 30. `visitor.visits`

Represents an individual visit transaction.

| Column                  | Data type   | Key / purpose                                                        |
| ----------------------- | ----------- | -------------------------------------------------------------------- |
| `visit_id`              | UUID        | PK                                                                   |
| `visitor_id`            | UUID        | FK → `visitor.visitors`                                              |
| `organization_id`       | UUID        | FK → `core.organizations`                                            |
| `host_employee_id`      | UUID        | FK → `employee.employees`                                            |
| `visit_number`          | VARCHAR(50) | Unique visit reference                                               |
| `visit_purpose`         | TEXT        | Purpose of visit                                                     |
| `visit_type`            | VARCHAR(30) | WALK_IN / SCHEDULED                                                  |
| `expected_arrival_at`   | TIMESTAMPTZ | Optional expected arrival                                            |
| `expected_departure_at` | TIMESTAMPTZ | Optional expected departure                                          |
| `actual_check_in_at`    | TIMESTAMPTZ | Actual entry                                                         |
| `actual_check_out_at`   | TIMESTAMPTZ | Actual exit                                                          |
| `status`                | VARCHAR(30) | PENDING / APPROVED / REJECTED / CHECKED_IN / CHECKED_OUT / CANCELLED |
| `registered_by`         | UUID        | FK → `core.users`                                                    |
| `created_at`            | TIMESTAMPTZ | Created timestamp                                                    |
| `updated_at`            | TIMESTAMPTZ | Updated timestamp                                                    |

#### 31. `visitor.visit_approvals`

Stores approval decisions for visits.

| Column                 | Data type   | Key / purpose                       |
| ---------------------- | ----------- | ----------------------------------- |
| `visit_approval_id`    | UUID        | PK                                  |
| `visit_id`             | UUID        | FK → `visitor.visits`               |
| `approver_user_id`     | UUID        | FK → `core.users`, nullable         |
| `approver_employee_id` | UUID        | FK → `employee.employees`, nullable |
| `approval_level`       | VARCHAR(30) | HOST / GUARD / SUPERVISOR / ADMIN   |
| `decision`             | VARCHAR(20) | APPROVED / REJECTED / PENDING       |
| `remarks`              | TEXT        | Optional remarks                    |
| `decided_at`           | TIMESTAMPTZ | Decision time                       |
| `created_at`           | TIMESTAMPTZ | Created timestamp                   |

#### 32. `visitor.visit_status_history`

Stores every status transition for a visit.

| Column                    | Data type   | Key / purpose               |
| ------------------------- | ----------- | --------------------------- |
| `visit_status_history_id` | UUID        | PK                          |
| `visit_id`                | UUID        | FK → `visitor.visits`       |
| `previous_status`         | VARCHAR(30) | Previous state              |
| `new_status`              | VARCHAR(30) | New state                   |
| `changed_by`              | UUID        | FK → `core.users`, nullable |
| `reason`                  | TEXT        | Optional reason             |
| `changed_at`              | TIMESTAMPTZ | Change timestamp            |

#### 33. `visitor.visit_credentials`

Stores temporary visitor access credentials or pass references.

| Column                  | Data type   | Key / purpose              |
| ----------------------- | ----------- | -------------------------- |
| `visit_credential_id`   | UUID        | PK                         |
| `visit_id`              | UUID        | FK → `visitor.visits`      |
| `credential_type`       | VARCHAR(30) | QR / RFID / PASS / OTHER   |
| `credential_value_hash` | TEXT        | Hashed temporary token     |
| `valid_from`            | TIMESTAMPTZ | Validity start             |
| `valid_until`           | TIMESTAMPTZ | Expiration                 |
| `status`                | VARCHAR(20) | ACTIVE / REVOKED / EXPIRED |
| `issued_by`             | UUID        | FK → `core.users`          |
| `issued_at`             | TIMESTAMPTZ | Issuance time              |
| `revoked_at`            | TIMESTAMPTZ | Optional revocation        |

#### 34. `visitor.visitor_vehicles`

Stores vehicle details associated with a visitor visit.

| Column               | Data type    | Key / purpose         |
| -------------------- | ------------ | --------------------- |
| `visitor_vehicle_id` | UUID         | PK                    |
| `visit_id`           | UUID         | FK → `visitor.visits` |
| `vehicle_number`     | VARCHAR(30)  | Registration number   |
| `vehicle_type`       | VARCHAR(50)  | Car / Bike / Other    |
| `vehicle_make`       | VARCHAR(100) | Optional              |
| `vehicle_color`      | VARCHAR(50)  | Optional              |
| `created_at`         | TIMESTAMPTZ  | Created timestamp     |

### Visitor relationships

```
visitor.visitors
       |
       | 1:M
       v
visitor.visits
       |
       +---- M:1 ---- core.organizations
       |
       +---- M:1 ---- employee.employees (host)
       |
       +---- 1:M ---- visitor.visit_approvals
       |
       +---- 1:M ---- visitor.visit_status_history
       |
       +---- 1:M ---- visitor.visit_credentials
       |
       +---- 1:M ---- visitor.visitor_vehicles
```

Important workflow rule: Creating a visitor record does not authorize entry. A visit must be approved according to your configured policy, and an access event must be created when entry is actually attempted.

The exact approval workflow—guard authorization, host approval, or a combination—still needs to be finalized.

## 9. Gate management schema

A building can have several gates, and each gate can support entry, exit or bidirectional movement.

### G. `gate` schema

#### 35. `gate.gates`

Stores physical gate information.

| Column                | Data type    | Key / purpose                   |
| --------------------- | ------------ | ------------------------------- |
| `gate_id`             | UUID         | PK                              |
| `building_id`         | UUID         | FK → `core.buildings`           |
| `gate_code`           | VARCHAR(50)  | Unique within building          |
| `gate_name`           | VARCHAR(150) | Gate name                       |
| `gate_location`       | VARCHAR(255) | Physical location               |
| `gate_type`           | VARCHAR(30)  | MAIN / SIDE / PARKING / OTHER   |
| `supported_direction` | VARCHAR(30)  | ENTRY / EXIT / BOTH             |
| `gate_status`         | VARCHAR(20)  | ACTIVE / INACTIVE / MAINTENANCE |
| `created_at`          | TIMESTAMPTZ  | Created timestamp               |
| `updated_at`          | TIMESTAMPTZ  | Updated timestamp               |

#### 36. `gate.gate_organizations`

Defines which organizations are permitted to use which gates.

| Column                 | Data type   | Key / purpose             |
| ---------------------- | ----------- | ------------------------- |
| `gate_organization_id` | UUID        | PK                        |
| `gate_id`              | UUID        | FK → `gate.gates`         |
| `organization_id`      | UUID        | FK → `core.organizations` |
| `access_policy`        | VARCHAR(30) | ALLOW / RESTRICTED        |
| `is_active`            | BOOLEAN     | Active status             |
| `created_at`           | TIMESTAMPTZ | Created timestamp         |

Constraint: UNIQUE (`gate_id`, `organization_id`).

#### 37. `gate.gate_directions`

Stores allowed movement directions for each gate.

| Column              | Data type   | Key / purpose     |
| ------------------- | ----------- | ----------------- |
| `gate_direction_id` | UUID        | PK                |
| `gate_id`           | UUID        | FK → `gate.gates` |
| `direction_code`    | VARCHAR(20) | ENTRY / EXIT      |
| `direction_name`    | VARCHAR(50) | Display label     |
| `is_active`         | BOOLEAN     | Active status     |

Constraint: UNIQUE (`gate_id`, `direction_code`).

#### 38. `gate.gate_policies`

Stores configurable access rules for gates.

| Column                 | Data type    | Key / purpose                                                |
| ---------------------- | ------------ | ------------------------------------------------------------ |
| `gate_policy_id`       | UUID         | PK                                                           |
| `gate_id`              | UUID         | FK → `gate.gates`                                            |
| `organization_id`      | UUID         | FK → `core.organizations`, nullable for building-wide policy |
| `policy_name`          | VARCHAR(150) | Policy name                                                  |
| `policy_type`          | VARCHAR(50)  | EMPLOYEE_ACCESS / VISITOR_ACCESS / GENERAL                   |
| `policy_configuration` | JSONB        | Policy parameters                                            |
| `priority`             | INTEGER      | Evaluation priority                                          |
| `valid_from`           | TIMESTAMPTZ  | Start                                                        |
| `valid_until`          | TIMESTAMPTZ  | Optional end                                                 |
| `is_active`            | BOOLEAN      | Active status                                                |
| `created_by`           | UUID         | FK → `core.users`                                            |
| `created_at`           | TIMESTAMPTZ  | Created timestamp                                            |

#### 39. `gate.gate_assignments`

Maps guards and supervisors to gates.

| Column               | Data type   | Key / purpose      |
| -------------------- | ----------- | ------------------ |
| `gate_assignment_id` | UUID        | PK                 |
| `gate_id`            | UUID        | FK → `gate.gates`  |
| `user_id`            | UUID        | FK → `core.users`  |
| `assignment_role`    | VARCHAR(30) | GUARD / SUPERVISOR |
| `assigned_from`      | TIMESTAMPTZ | Start              |
| `assigned_until`     | TIMESTAMPTZ | Optional end       |
| `is_active`          | BOOLEAN     | Active status      |
| `assigned_by`        | UUID        | FK → `core.users`  |
| `created_at`         | TIMESTAMPTZ | Created timestamp  |

### Gate relationships

```
core.buildings
       |
       | 1:M
       v
gate.gates
       |
       +---- 1:M ---- gate.gate_directions
       |
       +---- 1:M ---- gate.gate_policies
       |
       +---- 1:M ---- gate.gate_assignments
       |
       +---- 1:M ---- gate.gate_organizations
                          |
                          +---- M:1 ---- core.organizations
```

A gate assignment is an operational duty mapping. It does not replace RBAC permission checks. A guard must have both the required permission and an active assignment to the relevant gate.

## 10. Device management schema

This module manages ESP32 controllers and their connectivity with the Raspberry Pi server.

### H. `device` schema

#### 40. `device.device_types`

| Column           | Data type    | Key / purpose            |
| ---------------- | ------------ | ------------------------ |
| `device_type_id` | UUID         | PK                       |
| `type_code`      | VARCHAR(50)  | ESP32_CONTROLLER / OTHER |
| `type_name`      | VARCHAR(100) | Display name             |
| `description`    | TEXT         | Details                  |

#### 41. `device.devices`

Stores registered hardware devices.

| Column             | Data type    | Key / purpose                        |
| ------------------ | ------------ | ------------------------------------ |
| `device_id`        | UUID         | PK                                   |
| `device_type_id`   | UUID         | FK → `device.device_types`           |
| `device_code`      | VARCHAR(100) | UNIQUE                               |
| `device_name`      | VARCHAR(150) | Display name                         |
| `serial_number`    | VARCHAR(150) | Hardware serial                      |
| `mac_address`      | MACADDR      | Network MAC                          |
| `firmware_version` | VARCHAR(50)  | Installed firmware                   |
| `hardware_version` | VARCHAR(50)  | Hardware revision                    |
| `device_status`    | VARCHAR(20)  | ACTIVE / INACTIVE / FAULTY / RETIRED |
| `registered_at`    | TIMESTAMPTZ  | Registration                         |
| `last_seen_at`     | TIMESTAMPTZ  | Last heartbeat                       |
| `created_at`       | TIMESTAMPTZ  | Created timestamp                    |
| `updated_at`       | TIMESTAMPTZ  | Updated timestamp                    |

#### 42. `device.gate_devices`

Maps devices to gates.

| Column           | Data type   | Key / purpose                                      |
| ---------------- | ----------- | -------------------------------------------------- |
| `gate_device_id` | UUID        | PK                                                 |
| `gate_id`        | UUID        | FK → `gate.gates`                                  |
| `device_id`      | UUID        | FK → `device.devices`                              |
| `device_role`    | VARCHAR(30) | PRIMARY_CONTROLLER / SECONDARY_CONTROLLER / READER |
| `assigned_from`  | TIMESTAMPTZ | Assignment start                                   |
| `assigned_until` | TIMESTAMPTZ | Optional end                                       |
| `is_active`      | BOOLEAN     | Active mapping                                     |
| `created_at`     | TIMESTAMPTZ | Created timestamp                                  |

#### 43. `device.device_components`

Tracks hardware components attached to a controller.

| Column             | Data type    | Key / purpose                                    |
| ------------------ | ------------ | ------------------------------------------------ |
| `component_id`     | UUID         | PK                                               |
| `device_id`        | UUID         | FK → `device.devices`                            |
| `component_type`   | VARCHAR(50)  | RFID_READER / FINGERPRINT_SENSOR / MOTOR / OTHER |
| `component_name`   | VARCHAR(100) | Component name                                   |
| `model_number`     | VARCHAR(100) | Optional                                         |
| `firmware_version` | VARCHAR(50)  | Optional                                         |
| `status`           | VARCHAR(20)  | ACTIVE / FAULTY / DISCONNECTED                   |
| `installed_at`     | TIMESTAMPTZ  | Installation time                                |

#### 44. `device.device_heartbeats`

Stores device health and connectivity history.

| Column             | Data type   | Key / purpose             |
| ------------------ | ----------- | ------------------------- |
| `heartbeat_id`     | BIGINT      | PK                        |
| `device_id`        | UUID        | FK → `device.devices`     |
| `ip_address`       | INET        | Device IP                 |
| `firmware_version` | VARCHAR(50) | Firmware version          |
| `uptime_seconds`   | BIGINT      | Device uptime             |
| `free_heap_bytes`  | BIGINT      | Available memory          |
| `signal_strength`  | INTEGER     | Wi-Fi RSSI, if applicable |
| `health_status`    | VARCHAR(20) | HEALTHY / WARNING / ERROR |
| `reported_at`      | TIMESTAMPTZ | Heartbeat timestamp       |

#### 45. `device.device_commands`

Records commands sent to ESP32 controllers.

| Column              | Data type   | Key / purpose                                              |
| ------------------- | ----------- | ---------------------------------------------------------- |
| `device_command_id` | UUID        | PK                                                         |
| `device_id`         | UUID        | FK → `device.devices`                                      |
| `gate_id`           | UUID        | FK → `gate.gates`                                          |
| `command_id`        | UUID        | Unique idempotency/reference ID                            |
| `command_type`      | VARCHAR(50) | OPEN / CLOSE / STATUS / OTHER                              |
| `command_payload`   | JSONB       | Command details                                            |
| `requested_by`      | UUID        | FK → `core.users`, nullable for automated commands         |
| `requested_at`      | TIMESTAMPTZ | Request time                                               |
| `sent_at`           | TIMESTAMPTZ | Send time                                                  |
| `acknowledged_at`   | TIMESTAMPTZ | Device acknowledgement                                     |
| `completed_at`      | TIMESTAMPTZ | Completion time                                            |
| `status`            | VARCHAR(30) | PENDING / SENT / ACKNOWLEDGED / SUCCESS / FAILED / TIMEOUT |
| `response_payload`  | JSONB       | Device response                                            |

#### 46. `device.device_events`

Stores device-originated events and error reports.

| Column            | Data type    | Key / purpose                                  |
| ----------------- | ------------ | ---------------------------------------------- |
| `device_event_id` | UUID         | PK                                             |
| `device_id`       | UUID         | FK → `device.devices`                          |
| `gate_id`         | UUID         | FK → `gate.gates`, nullable                    |
| `event_type`      | VARCHAR(50)  | BOOT / OFFLINE / ONLINE / FAULT / SENSOR_ERROR |
| `event_code`      | VARCHAR(100) | Event code                                     |
| `event_payload`   | JSONB        | Event details                                  |
| `occurred_at`     | TIMESTAMPTZ  | Device event time                              |
| `received_at`     | TIMESTAMPTZ  | Server receive time                            |

### Device relationships

```
device.device_types
       |
       | 1:M
       v
device.devices
       |
       +---- 1:M ---- device.device_components
       |
       +---- 1:M ---- device.device_heartbeats
       |
       +---- 1:M ---- device.device_commands
       |
       +---- 1:M ---- device.device_events
       |
       +---- 1:M ---- device.gate_devices
                          |
                          +---- M:1 ---- gate.gates
```

Critical distinction: An ESP32 acknowledgement that an OPEN command was received is not proof that the physical gate opened. Keep command status separate from physical gate status and access-event records.

## 11. Access management schema

This is one of the most important parts of the system. It records the difference between an identity being presented, the system making an authorization decision, a command being sent, and the gate physically operating.

### I. `access` schema

#### 47. `access.access_attempts`

Records every authentication attempt from RFID, fingerprint or another supported method.

| Column                       | Data type    | Key / purpose                                     |
| ---------------------------- | ------------ | ------------------------------------------------- |
| `access_attempt_id`          | UUID         | PK                                                |
| `building_id`                | UUID         | FK → `core.buildings`                             |
| `gate_id`                    | UUID         | FK → `gate.gates`                                 |
| `device_id`                  | UUID         | FK → `device.devices`, nullable                   |
| `direction_id`               | UUID         | FK → `gate.gate_directions`, nullable             |
| `employee_id`                | UUID         | FK → `employee.employees`, nullable               |
| `visitor_id`                 | UUID         | FK → `visitor.visitors`, nullable                 |
| `visit_id`                   | UUID         | FK → `visitor.visits`, nullable                   |
| `employee_credential_id`     | UUID         | FK → `credential.employee_credentials`, nullable  |
| `authentication_method`      | VARCHAR(30)  | RFID / FINGERPRINT / VISITOR_PASS / MANUAL        |
| `credential_identifier_hash` | TEXT         | Optional hashed presented identifier              |
| `authentication_result`      | VARCHAR(20)  | SUCCESS / FAILED                                  |
| `failure_reason`             | VARCHAR(100) | INVALID_CREDENTIAL / EXPIRED / INACTIVE / UNKNOWN |
| `occurred_at`                | TIMESTAMPTZ  | Event time from source                            |
| `received_at`                | TIMESTAMPTZ  | Server receive time                               |
| `source_event_id`            | VARCHAR(150) | Unique device event identifier                    |
| `created_at`                 | TIMESTAMPTZ  | Server timestamp                                  |

Important: The device-generated `source_event_id` should be unique within the device's identity. This helps prevent duplicate records when an ESP32 retries transmission.

#### 48. `access.access_decisions`

Stores the authorization decision separately from authentication.

| Column               | Data type    | Key / purpose                                    |
| -------------------- | ------------ | ------------------------------------------------ |
| `access_decision_id` | UUID         | PK                                               |
| `access_attempt_id`  | UUID         | FK → `access.access_attempts`                    |
| `gate_id`            | UUID         | FK → `gate.gates`                                |
| `decision`           | VARCHAR(20)  | ALLOW / DENY                                     |
| `decision_reason`    | VARCHAR(100) | POLICY_ALLOWED / NO_APPROVAL / WRONG_GATE / etc. |
| `policy_id`          | UUID         | FK → `gate.gate_policies`, nullable              |
| `decided_at`         | TIMESTAMPTZ  | Decision timestamp                               |
| `decision_payload`   | JSONB        | Optional evaluation details                      |

#### 49. `access.access_events`

Stores actual access lifecycle events, including entry, exit and manual operations.

| Column               | Data type    | Key / purpose                                    |
| -------------------- | ------------ | ------------------------------------------------ |
| `access_event_id`    | UUID         | PK                                               |
| `access_attempt_id`  | UUID         | FK → `access.access_attempts`, nullable          |
| `access_decision_id` | UUID         | FK → `access.access_decisions`, nullable         |
| `gate_id`            | UUID         | FK → `gate.gates`                                |
| `building_id`        | UUID         | FK → `core.buildings`                            |
| `organization_id`    | UUID         | FK → `core.organizations`, nullable              |
| `employee_id`        | UUID         | FK → `employee.employees`, nullable              |
| `visitor_id`         | UUID         | FK → `visitor.visitors`, nullable                |
| `visit_id`           | UUID         | FK → `visitor.visits`, nullable                  |
| `device_id`          | UUID         | FK → `device.devices`, nullable                  |
| `direction`          | VARCHAR(20)  | ENTRY / EXIT                                     |
| `event_type`         | VARCHAR(30)  | EMPLOYEE_ACCESS / VISITOR_ACCESS / MANUAL_ACCESS |
| `physical_status`    | VARCHAR(30)  | OPENED / CLOSED / NOT_CONFIRMED / FAILED         |
| `occurred_at`        | TIMESTAMPTZ  | Physical event time                              |
| `recorded_at`        | TIMESTAMPTZ  | Server record time                               |
| `source_event_id`    | VARCHAR(150) | Device event identifier                          |
| `idempotency_key`    | VARCHAR(150) | Duplicate protection key                         |
| `metadata`           | JSONB        | Additional event data                            |

#### 50. `access.gate_state_history`

Stores gate-state changes over time.

| Column                  | Data type   | Key / purpose                     |
| ----------------------- | ----------- | --------------------------------- |
| `gate_state_history_id` | BIGINT      | PK                                |
| `gate_id`               | UUID        | FK → `gate.gates`                 |
| `device_id`             | UUID        | FK → `device.devices`, nullable   |
| `previous_state`        | VARCHAR(30) | Previous physical state           |
| `current_state`         | VARCHAR(30) | OPEN / CLOSED / UNKNOWN / FAULT   |
| `state_source`          | VARCHAR(30) | SENSOR / DEVICE / MANUAL / SYSTEM |
| `reported_at`           | TIMESTAMPTZ | Event time                        |
| `received_at`           | TIMESTAMPTZ | Server receive time               |

### Access relationships

```
employee.employees
       |
       +--------------------------+
       |                          |
       v                          v
credential.employee_credentials  access.access_attempts
                                      |
visitor.visitors                     |
       |                              |
       v                              |
visitor.visits ----------------------+
                                      |
                                      +---- 1:1 or 1:M ---- access.access_decisions
                                      |                         |
                                      |                         v
                                      |                   gate.gate_policies
                                      |
                                      +---- 1:M ---- access.access_events

gate.gates
       |
       +---- 1:M ---- access.access_attempts
       |
       +---- 1:M ---- access.access_events
       |
       +---- 1:M ---- access.gate_state_history
```

The intended processing sequence is:

```
RFID / Fingerprint / Visitor Pass
               |
               v
      access.access_attempts
               |
               v
      Authentication Result
               |
               v
       access.access_decisions
               |
         ALLOW / DENY
               |
       If ALLOW, send command
               |
               v
      device.device_commands
               |
               v
          ESP32 Controller
               |
               v
       Physical gate response
               |
               v
       access.access_events
               |
               v
      access.gate_state_history
```

These are separate records because each represents a different fact:

| Situation                        | What the database records                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| Invalid RFID card                | Failed authentication attempt                                                        |
| Valid RFID but employee inactive | Authentication/authorization failure, according to the configured validation process |
| Valid employee, permitted gate   | Successful authentication and ALLOW decision                                         |
| ESP32 receives OPEN command      | Device command acknowledgement                                                       |
| Gate physically opens            | Confirmed physical gate event, if supported by a sensor or reliable feedback         |
| Gate fails to open               | Failed or unconfirmed physical operation                                             |
| Unauthorized manual opening      | Manual operation and corresponding security/audit event                              |

A denied attempt must not create a successful entry event. An OPEN command must not automatically be treated as a physically confirmed opening.

## 12. Operations and incident management schema

These tables support the Operations section of your sidebar, particularly manual gate control, incident management and operational review.

### J. `operations` schema

#### 51. `operations.manual_gate_operations`

Records manual gate commands initiated by authorized staff.

| Column                | Data type   | Key / purpose                                |
| --------------------- | ----------- | -------------------------------------------- |
| `manual_operation_id` | UUID        | PK                                           |
| `gate_id`             | UUID        | FK → `gate.gates`                            |
| `device_id`           | UUID        | FK → `device.devices`, nullable              |
| `user_id`             | UUID        | FK → `core.users`                            |
| `device_command_id`   | UUID        | FK → `device.device_commands`, nullable      |
| `operation_type`      | VARCHAR(30) | MANUAL_OPEN / MANUAL_CLOSE                   |
| `reason`              | TEXT        | Mandatory operational reason                 |
| `approval_status`     | VARCHAR(20) | NOT_REQUIRED / PENDING / APPROVED / REJECTED |
| `performed_at`        | TIMESTAMPTZ | Operation time                               |
| `result`              | VARCHAR(30) | SUCCESS / FAILED / UNKNOWN                   |
| `created_at`          | TIMESTAMPTZ | Created timestamp                            |

#### 52. `operations.incidents`

Stores security, gate and operational incidents.

| Column            | Data type    | Key / purpose                            |
| ----------------- | ------------ | ---------------------------------------- |
| `incident_id`     | UUID         | PK                                       |
| `building_id`     | UUID         | FK → `core.buildings`                    |
| `organization_id` | UUID         | FK → `core.organizations`, nullable      |
| `gate_id`         | UUID         | FK → `gate.gates`, nullable              |
| `device_id`       | UUID         | FK → `device.devices`, nullable          |
| `reported_by`     | UUID         | FK → `core.users`                        |
| `incident_type`   | VARCHAR(50)  | SECURITY / HARDWARE / ACCESS / OTHER     |
| `severity`        | VARCHAR(20)  | LOW / MEDIUM / HIGH / CRITICAL           |
| `title`           | VARCHAR(200) | Incident title                           |
| `description`     | TEXT         | Incident details                         |
| `status`          | VARCHAR(30)  | OPEN / INVESTIGATING / RESOLVED / CLOSED |
| `assigned_to`     | UUID         | FK → `core.users`, nullable              |
| `reported_at`     | TIMESTAMPTZ  | Report time                              |
| `resolved_at`     | TIMESTAMPTZ  | Resolution time                          |

#### 53. `operations.incident_updates`

Stores the history of incident handling.

| Column               | Data type   | Key / purpose                  |
| -------------------- | ----------- | ------------------------------ |
| `incident_update_id` | UUID        | PK                             |
| `incident_id`        | UUID        | FK → `operations.incidents`    |
| `updated_by`         | UUID        | FK → `core.users`              |
| `previous_status`    | VARCHAR(30) | Previous status                |
| `new_status`         | VARCHAR(30) | New status                     |
| `update_description` | TEXT        | Work performed or observations |
| `created_at`         | TIMESTAMPTZ | Update timestamp               |

### Operations relationships

```
gate.gates
     |
     +---- 1:M ---- operations.manual_gate_operations
     |
     +---- 1:M ---- operations.incidents
                        |
                        +---- 1:M ---- operations.incident_updates
```

`manual_gate_operations` records the human action, while `device.device_commands` records the command sent to the controller. Both should be linked when a manual action is performed through the application.

## 13. Communication and notifications schema

This is an additional supporting module for alerts and operational notifications. It is useful for visitor approvals, gate failures, suspicious attempts and account notifications. Actual delivery can remain within the local network.

### K. `communication` schema

#### 54. `communication.notification_templates`

| Column             | Data type    | Key / purpose        |
| ------------------ | ------------ | -------------------- |
| `template_id`      | UUID         | PK                   |
| `template_code`    | VARCHAR(100) | UNIQUE               |
| `template_name`    | VARCHAR(150) | Template name        |
| `channel`          | VARCHAR(30)  | IN_APP / EMAIL / SMS |
| `subject_template` | TEXT         | Optional subject     |
| `body_template`    | TEXT         | Notification content |
| `is_active`        | BOOLEAN      | Active status        |
| `created_at`       | TIMESTAMPTZ  | Created timestamp    |

#### 55. `communication.notifications`

Stores notification records and recipients.

| Column                  | Data type    | Key / purpose                                         |
| ----------------------- | ------------ | ----------------------------------------------------- |
| `notification_id`       | UUID         | PK                                                    |
| `template_id`           | UUID         | FK → `communication.notification_templates`, nullable |
| `recipient_user_id`     | UUID         | FK → `core.users`, nullable                           |
| `recipient_employee_id` | UUID         | FK → `employee.employees`, nullable                   |
| `organization_id`       | UUID         | FK → `core.organizations`, nullable                   |
| `notification_type`     | VARCHAR(50)  | VISITOR_APPROVAL / GATE_ALERT / SECURITY              |
| `subject`               | VARCHAR(255) | Notification subject                                  |
| `message`               | TEXT         | Notification message                                  |
| `related_entity_type`   | VARCHAR(50)  | VISIT / INCIDENT / DEVICE / OTHER                     |
| `related_entity_id`     | UUID         | Related record identifier                             |
| `priority`              | VARCHAR(20)  | LOW / NORMAL / HIGH / CRITICAL                        |
| `created_at`            | TIMESTAMPTZ  | Created timestamp                                     |

#### 56. `communication.notification_deliveries`

Tracks notification delivery attempts.

| Column            | Data type   | Key / purpose                      |
| ----------------- | ----------- | ---------------------------------- |
| `delivery_id`     | UUID        | PK                                 |
| `notification_id` | UUID        | FK → `communication.notifications` |
| `channel`         | VARCHAR(30) | IN_APP / EMAIL / SMS               |
| `delivery_status` | VARCHAR(20) | PENDING / SENT / FAILED / READ     |
| `attempt_count`   | INTEGER     | Delivery attempts                  |
| `last_attempt_at` | TIMESTAMPTZ | Last attempt                       |
| `delivered_at`    | TIMESTAMPTZ | Delivery timestamp                 |
| `read_at`         | TIMESTAMPTZ | Read timestamp                     |
| `failure_reason`  | TEXT        | Optional error                     |

### Communication relationships

```
communication.notification_templates
                 |
                 +---- 1:M ---- communication.notifications
                                      |
                                      +---- 1:M ---- communication.notification_deliveries
                                      |
                                      +---- M:1 ---- core.users (recipient)
                                      |
                                      +---- M:1 ---- employee.employees (recipient)
```

For an offline-first initial release, `IN_APP` notifications should be the primary channel. Email and SMS should be optional integrations rather than dependencies for gate operation.

## 14. System settings schema

The application needs configuration at different levels: building-wide settings, organization settings and potentially gate-specific policies.

### L. `system` schema

#### 57. `system.application_settings`

Stores global application configuration.

| Column                   | Data type    | Key / purpose               |
| ------------------------ | ------------ | --------------------------- |
| `application_setting_id` | UUID         | PK                          |
| `setting_key`            | VARCHAR(100) | UNIQUE                      |
| `setting_value`          | JSONB        | Setting value               |
| `description`            | TEXT         | Purpose                     |
| `is_sensitive`           | BOOLEAN      | Sensitive setting indicator |
| `updated_by`             | UUID         | FK → `core.users`           |
| `created_at`             | TIMESTAMPTZ  | Created timestamp           |
| `updated_at`             | TIMESTAMPTZ  | Updated timestamp           |

#### 58. `system.building_settings`

Stores building-wide operational settings.

| Column                | Data type    | Key / purpose         |
| --------------------- | ------------ | --------------------- |
| `building_setting_id` | UUID         | PK                    |
| `building_id`         | UUID         | FK → `core.buildings` |
| `setting_key`         | VARCHAR(100) | Setting identifier    |
| `setting_value`       | JSONB        | Configuration         |
| `description`         | TEXT         | Purpose               |
| `updated_by`          | UUID         | FK → `core.users`     |
| `updated_at`          | TIMESTAMPTZ  | Updated timestamp     |

Constraint: UNIQUE (`building_id`, `setting_key`).

#### 59. `system.system_maintenance_logs`

Records application maintenance and operational tasks.

| Column               | Data type   | Key / purpose                             |
| -------------------- | ----------- | ----------------------------------------- |
| `maintenance_log_id` | UUID        | PK                                        |
| `building_id`        | UUID        | FK → `core.buildings`, nullable           |
| `performed_by`       | UUID        | FK → `core.users`, nullable               |
| `maintenance_type`   | VARCHAR(50) | BACKUP / RESTORE / DATABASE / APPLICATION |
| `description`        | TEXT        | Maintenance details                       |
| `status`             | VARCHAR(20) | STARTED / SUCCESS / FAILED                |
| `started_at`         | TIMESTAMPTZ | Start time                                |
| `completed_at`       | TIMESTAMPTZ | Completion time                           |
| `result_details`     | JSONB       | Optional results                          |

### System relationships

```
core.buildings
       |
       +---- 1:M ---- system.building_settings
       |
       +---- 1:M ---- system.system_maintenance_logs

system.application_settings
       |
       +---- updated_by ---- core.users
```

`core.organization_settings` remains the home of organization-specific settings. Do not duplicate those same settings in `system.application_settings`.

## 15. Audit and security schema

You already have two audit tables. Keep both, but give them distinct responsibilities.

### M. `audit` schema

#### 60. `audit.audit_logs`

Stores business and administrative changes.

| Column            | Data type    | Key / purpose                                    |
| ----------------- | ------------ | ------------------------------------------------ |
| `audit_log_id`    | UUID         | PK                                               |
| `user_id`         | UUID         | FK → `core.users`, nullable for system actions   |
| `organization_id` | UUID         | FK → `core.organizations`, nullable              |
| `building_id`     | UUID         | FK → `core.buildings`, nullable                  |
| `module_name`     | VARCHAR(100) | Module                                           |
| `entity_name`     | VARCHAR(100) | Changed table/entity                             |
| `entity_id`       | UUID         | Changed record identifier                        |
| `action`          | VARCHAR(50)  | CREATE / UPDATE / DELETE / APPROVE / REVOKE      |
| `old_values`      | JSONB        | Previous values, with sensitive-field exclusions |
| `new_values`      | JSONB        | New values, with sensitive-field exclusions      |
| `ip_address`      | INET         | Source IP                                        |
| `user_agent`      | TEXT         | Client information                               |
| `correlation_id`  | UUID         | Request/operation correlation                    |
| `created_at`      | TIMESTAMPTZ  | Audit timestamp                                  |

#### 61. `audit.security_events`

Stores security-related events and suspicious activity.

| Column              | Data type    | Key / purpose                                      |
| ------------------- | ------------ | -------------------------------------------------- |
| `security_event_id` | UUID         | PK                                                 |
| `user_id`           | UUID         | FK → `core.users`, nullable                        |
| `organization_id`   | UUID         | FK → `core.organizations`, nullable                |
| `building_id`       | UUID         | FK → `core.buildings`, nullable                    |
| `gate_id`           | UUID         | FK → `gate.gates`, nullable                        |
| `device_id`         | UUID         | FK → `device.devices`, nullable                    |
| `event_type`        | VARCHAR(100) | LOGIN_FAILED / ACCESS_DENIED / UNAUTHORIZED_ACTION |
| `severity`          | VARCHAR(20)  | LOW / MEDIUM / HIGH / CRITICAL                     |
| `description`       | TEXT         | Event details                                      |
| `ip_address`        | INET         | Source IP                                          |
| `event_payload`     | JSONB        | Additional context                                 |
| `occurred_at`       | TIMESTAMPTZ  | Event time                                         |
| `created_at`        | TIMESTAMPTZ  | Recorded timestamp                                 |

### Audit relationships

```
core.users
       |
       +---- 1:M ---- audit.audit_logs
       |
       +---- 1:M ---- audit.security_events

core.organizations
       |
       +---- 1:M ---- audit.audit_logs
       |
       +---- 1:M ---- audit.security_events

core.buildings
       |
       +---- 1:M ---- audit.audit_logs
       |
       +---- 1:M ---- audit.security_events

gate.gates
       |
       +---- 1:M ---- audit.security_events

device.devices
       |
       +---- 1:M ---- audit.security_events
```

Examples:

| Action                                       | Audit table             |
| -------------------------------------------- | ----------------------- |
| ADMIN creates an employee                    | `audit.audit_logs`      |
| SUPER_ADMIN changes an organization's status | `audit.audit_logs`      |
| Guard registers a visitor                    | `audit.audit_logs`      |
| ADMIN revokes an RFID card                   | `audit.audit_logs`      |
| Failed application login                     | `audit.security_events` |
| Repeated invalid RFID attempts               | `audit.security_events` |
| Unauthorized manual gate operation           | `audit.security_events` |
| Device authentication failure                | `audit.security_events` |

For auditability, avoid silently modifying historical records. Use append-only access and audit histories wherever practical, and strictly restrict who can alter or delete them.

## 16. Reporting schema

You do not need a separate database table for every dashboard card or report. Most dashboard information should be derived from operational tables using SQL views or materialized views.

If you need to save report execution history and generated exports, use these supporting tables.

### N. `reporting` schema

#### 62. `reporting.report_definitions`

| Column                 | Data type    | Key / purpose     |
| ---------------------- | ------------ | ----------------- |
| `report_definition_id` | UUID         | PK                |
| `report_code`          | VARCHAR(100) | UNIQUE            |
| `report_name`          | VARCHAR(150) | Report name       |
| `description`          | TEXT         | Purpose           |
| `module_name`          | VARCHAR(100) | Related module    |
| `configuration`        | JSONB        | Report parameters |
| `is_active`            | BOOLEAN      | Active status     |
| `created_by`           | UUID         | FK → `core.users` |
| `created_at`           | TIMESTAMPTZ  | Created timestamp |

#### 63. `reporting.report_jobs`

Stores report generation and export history.

| Column                 | Data type   | Key / purpose                             |
| ---------------------- | ----------- | ----------------------------------------- |
| `report_job_id`        | UUID        | PK                                        |
| `report_definition_id` | UUID        | FK → `reporting.report_definitions`       |
| `requested_by`         | UUID        | FK → `core.users`                         |
| `organization_id`      | UUID        | FK → `core.organizations`, nullable       |
| `building_id`          | UUID        | FK → `core.buildings`, nullable           |
| `filter_parameters`    | JSONB       | Date range and filters                    |
| `output_format`        | VARCHAR(20) | PDF / CSV / XLSX                          |
| `file_path`            | TEXT        | Generated file reference                  |
| `job_status`           | VARCHAR(20) | PENDING / PROCESSING / COMPLETED / FAILED |
| `requested_at`         | TIMESTAMPTZ | Request time                              |
| `completed_at`         | TIMESTAMPTZ | Completion time                           |

### Reporting relationships

```
reporting.report_definitions
          |
          +---- 1:M ---- reporting.report_jobs
                               |
                               +---- M:1 ---- core.users
                               |
                               +---- M:1 ---- core.organizations
                               |
                               +---- M:1 ---- core.buildings
```

The report generation process must enforce the requesting user's data scope. A receptionist must not be able to generate a building-wide employee report simply because the report definition exists.

## 17. Complete table inventory

Here is the consolidated inventory of all tables proposed in this design.

63 proposed tables across 14 PostgreSQL schemas

| Schema          | Table count | Tables                                                                                                                                                     |
| --------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`          | 6           | buildings, organizations, building_organizations, organization_settings, users, user_organizations                                                         |
| `rbac`          | 10          | modules, permissions, roles, role_permissions, user_roles, role_delegations, role_permission_grants, role_inheritance, route_permissions, user_data_scopes |
| `auth`          | 5           | sessions, invitations, password_reset_tokens, email_verification_tokens, mfa_methods                                                                       |
| `employee`      | 4           | departments, designations, employees, employee_status_history                                                                                              |
| `credential`    | 3           | credential_types, employee_credentials, fingerprint_templates                                                                                              |
| `visitor`       | 6           | visitors, visits, visit_approvals, visit_status_history, visit_credentials, visitor_vehicles                                                               |
| `gate`          | 5           | gates, gate_organizations, gate_directions, gate_policies, gate_assignments                                                                                |
| `device`        | 7           | device_types, devices, gate_devices, device_components, device_heartbeats, device_commands, device_events                                                  |
| `access`        | 4           | access_attempts, access_decisions, access_events, gate_state_history                                                                                       |
| `operations`    | 3           | manual_gate_operations, incidents, incident_updates                                                                                                        |
| `communication` | 3           | notification_templates, notifications, notification_deliveries                                                                                             |
| `system`        | 3           | application_settings, building_settings, system_maintenance_logs                                                                                           |
| `audit`         | 2           | audit_logs, security_events                                                                                                                                |
| `reporting`     | 2           | report_definitions, report_jobs                                                                                                                            |
| Total           | 63          | Complete proposed inventory                                                                                                                                |

The 63-table count includes your original 21 tables. The additional 42 tables support the wider Smart Gate application.

## 18. Complete application relationship overview

This is the high-level entity relationship structure showing how the major modules connect.

1\. Building and organization foundation

```
BUILDING
    |
    +---- BUILDING_ORGANIZATIONS
    |              |
    |              +---- ORGANIZATIONS
    |                        |
    |                        +---- ORGANIZATION_SETTINGS
    |                        +---- USER_ORGANIZATIONS
    |                        +---- EMPLOYEES
    |                        +---- VISITS
    |
    +---- GATES
```

2\. User and authorization

```
USERS
  |
  +---- USER_ORGANIZATIONS
  +---- USER_ROLES
  |        |
  |        +---- ROLES
  |               |
  |               +---- ROLE_PERMISSIONS
  |               |         |
  |               |         +---- PERMISSIONS
  |               |                   |
  |               |                   +---- MODULES
  |               |
  |               +---- ROLE_INHERITANCE
  |
  +---- ROLE_DELEGATIONS
  +---- ROLE_PERMISSION_GRANTS
  +---- USER_DATA_SCOPES
  +---- AUTH_SESSIONS
```

3\. Employee and credential

```
ORGANIZATIONS
    |
    +---- EMPLOYEES
              |
              +---- DEPARTMENTS
              +---- DESIGNATIONS
              +---- EMPLOYEE_STATUS_HISTORY
              +---- EMPLOYEE_CREDENTIALS
                         |
                         +---- CREDENTIAL_TYPES
                         +---- FINGERPRINT_TEMPLATES
```

4\. Visitor workflow

```
VISITORS
    |
    +---- VISITS
             |
             +---- ORGANIZATIONS
             +---- HOST EMPLOYEE
             +---- VISIT_APPROVALS
             +---- VISIT_STATUS_HISTORY
             +---- VISIT_CREDENTIALS
             +---- VISITOR_VEHICLES
```

5\. Gate and device

```
GATES
  |
  +---- GATE_DIRECTIONS
  +---- GATE_POLICIES
  +---- GATE_ORGANIZATIONS
  +---- GATE_ASSIGNMENTS
  +---- GATE_DEVICES
            |
            +---- DEVICES
                      |
                      +---- DEVICE_COMPONENTS
                      +---- DEVICE_HEARTBEATS
                      +---- DEVICE_COMMANDS
                      +---- DEVICE_EVENTS
```

6\. Access lifecycle

```
EMPLOYEE / VISITOR
        |
        v
ACCESS_ATTEMPTS
        |
        v
ACCESS_DECISIONS
        |
        v
DEVICE_COMMANDS
        |
        v
ESP32 GATE CONTROLLER
        |
        v
ACCESS_EVENTS
        |
        +---- GATE_STATE_HISTORY
```

7\. Operations and security

```
MANUAL_GATE_OPERATIONS
INCIDENTS
    |
    +---- INCIDENT_UPDATES

USERS / ORGANIZATIONS / GATES / DEVICES
    |
    +---- AUDIT_LOGS
    +---- SECURITY_EVENTS
    +---- NOTIFICATIONS
```

This diagram is the module-level relationship map. The detailed column definitions above establish the individual foreign keys.

## 19. Critical database design rules

These rules are particularly important for your production architecture.

### A. Multi-organization data isolation

Every organization-owned record should carry an `organization_id`, directly or through an unambiguous parent relationship.

Examples:

- Employee → organization
- Visit → destination organization
- Department → organization
- Organization settings → organization
- Organization-specific role → organization

A user belonging to Organization A must not automatically access Organization B's private data.

For strong referential integrity, consider composite foreign keys involving `organization_id` where a child record must belong to the same organization as its parent. PostgreSQL Row-Level Security can provide an additional isolation layer, but it does not replace application authorization.

### B. Identity versus authentication versus authorization

Keep these concepts separate:

| Concept                     | Database location                 |
| --------------------------- | --------------------------------- |
| Person's employee identity  | `employee.employees`              |
| Visitor identity            | `visitor.visitors`                |
| Login account               | `core.users`                      |
| RFID/fingerprint credential | `credential.employee_credentials` |
| Login session               | `auth.sessions`                   |
| User role                   | `rbac.user_roles`                 |
| User permissions            | RBAC tables                       |
| Building access attempt     | `access.access_attempts`          |
| Gate access decision        | `access.access_decisions`         |

An employee can exist without a login account. A visitor can exist without an approved visit. Neither identity automatically means access is authorized.

### C. Gate control security

For every manual gate operation:

1. Verify the logged-in user.
2. Check the `GATE_OPEN` permission.
3. Verify the user has access to the particular gate.
4. Check the gate's operational status and applicable policy.
5. Record the manual operation.
6. Create the device command.
7. Receive and validate the device response.
8. Record the physical result, if it can be confirmed.
9. Write the audit record.

Do not permit frontend-only permission checks.

### D. ESP32 and offline synchronization

For the ESP32-to-Raspberry Pi communication, I recommend:

- Unique device identity.
- Device authentication credentials or keys.
- Unique event ID for every device-generated event.
- Idempotent event processing.
- Server receipt timestamp in addition to device event timestamp.
- Command IDs for command tracking.
- Retry-safe event ingestion.
- A defined strategy for clock synchronization.
- Persistent device-side buffering when LAN communication fails.

For events generated while offline, the server must distinguish event occurrence time from event receipt time.

### E. Database indexes and uniqueness

At minimum, plan indexes around these frequent lookup patterns:

| Table                             | Recommended index                                     |
| --------------------------------- | ----------------------------------------------------- |
| `core.users`                      | username, normalized email                            |
| `core.user_organizations`         | user_id, organization_id                              |
| `rbac.user_roles`                 | user_id, organization_id, role_id                     |
| `employee.employees`              | organization_id + employee_code                       |
| `credential.employee_credentials` | credential identifier, employee_id, status            |
| `visitor.visitors`                | phone, visitor_code                                   |
| `visitor.visits`                  | visitor_id, organization_id, host_employee_id, status |
| `gate.gates`                      | building_id, gate_code                                |
| `device.devices`                  | device_code, serial_number                            |
| `device.device_heartbeats`        | device_id + reported_at                               |
| `device.device_commands`          | command_id, device_id + status                        |
| `access.access_attempts`          | gate_id + occurred_at, employee_id + occurred_at      |
| `access.access_events`            | gate_id + occurred_at, organization_id + occurred_at  |
| `audit.audit_logs`                | user_id + created_at, entity_name + entity_id         |
| `audit.security_events`           | severity + occurred_at, event_type + occurred_at      |

For large event tables, consider time-based partitioning after measuring actual data volume. Do not partition every table unnecessarily.

## 20. Dashboard, Live Monitoring and Reports: Do they need tables?

Not necessarily. These are primarily read-oriented features.

| Application feature          | Recommended data source                                                     |
| ---------------------------- | --------------------------------------------------------------------------- |
| Dashboard                    | Aggregations over access, visitor, employee and device tables               |
| Live Gate Monitoring         | `device.devices`, `device.device_heartbeats`, `access.gate_state_history`   |
| Employee Access              | `employee.employees`, `access.access_attempts`, `access.access_events`      |
| Visitor Management           | `visitor.visitors`, `visitor.visits`, `visitor.visit_approvals`             |
| Gate Control                 | `gate.gates`, `gate.gate_policies`, `device.device_commands`                |
| Access Logs                  | `access.access_attempts`, `access.access_decisions`, `access.access_events` |
| Reports                      | Operational tables, SQL views and report jobs                               |
| Building Management          | `core.buildings`, `core.building_organizations`                             |
| Organization Management      | `core.organizations`, `core.organization_settings`                          |
| Employee Management          | `employee.*`                                                                |
| Credential Management        | `credential.*`                                                              |
| User Management              | `core.users`, `core.user_organizations`, `auth.*`                           |
| Role & Permission Management | `rbac.*`                                                                    |
| Gate Management              | `gate.*`                                                                    |
| Device Management            | `device.*`                                                                  |
| Audit Logs                   | `audit.audit_logs`, `audit.security_events`                                 |
| System Settings              | `system.*`, `core.organization_settings`                                    |
| My Profile                   | `core.users`                                                                |
| Change Password              | `core.users`, `auth.password_reset_tokens`                                  |
| My Sessions                  | `auth.sessions`                                                             |
| Logout                       | `auth.sessions`                                                             |

I recommend creating SQL views for commonly used dashboard queries. Materialized views can be considered later for expensive aggregations, with an appropriate refresh strategy.

## 21. Your original validation function and trigger

You mentioned one validation function and trigger in the RBAC design. I recommend that their responsibility be:

RBAC role-permission scope validation

The validation should prevent:

- An organization-specific role from receiving permissions outside its allowed scope.
- An ADMIN from assigning SUPER_ADMIN or another ADMIN role.
- A user from granting permissions beyond their delegated authority.
- A role assignment to an organization that the assigning user cannot administer.
- Invalid or cyclic role-inheritance relationships.

One important implementation detail: a database trigger can enforce structural rules, but it cannot safely replace complete application authorization. Permission checks must also happen in the server-side business logic.

For operations that involve multiple records, such as assigning a role and writing its audit record, use a transaction.

## 22. Design decisions that must be finalized before SQL implementation

The table inventory gives us a strong foundation, but a few business rules affect the exact constraints and relationships.

| Decision                      | Recommended initial approach                                                |
| ----------------------------- | --------------------------------------------------------------------------- |
| Building deployment           | One Raspberry Pi/PostgreSQL database for the building                       |
| Organization relationship     | Many organizations per building                                             |
| Employee ownership            | One primary organization per employee                                       |
| Application user relationship | Optional employee-to-user link                                              |
| Visitor identity              | Reusable visitor master record                                              |
| Visit transaction             | Separate record for every visit                                             |
| Visitor approval              | Host approval, with explicitly authorized overrides if required             |
| Gate access                   | Separate authentication, authorization and physical-operation records       |
| Device mapping                | Multiple devices per gate supported                                         |
| Gate assignments              | Guard/supervisor assignments separate from RBAC                             |
| Fingerprint data              | Encrypted template or secure sensor reference; never raw fingerprint images |
| Reports                       | Views and queries first; stored report jobs only when needed                |

Three decisions I would like to confirm before we move into the final ERD and SQL design:

1\. Raspberry Pi deployment

One Raspberry Pi server for the entire building (recommended)

Separate Raspberry Pi server for each organization

Hybrid deployment

2\. Employee organization relationship

One employee belongs to one organization (recommended initially)

One employee can belong to multiple organizations

3\. Visitor approval policy

Host employee approval required

Guard can approve and authorize entry

Host approval normally; guard/supervisor override when explicitly authorized

Confirm design decisions

My recommendation: finalize these three decisions first, then produce the detailed ERD, validate all foreign keys and constraints, and only after that prepare the PostgreSQL SQL implementation. That sequence will help avoid major schema changes later.
