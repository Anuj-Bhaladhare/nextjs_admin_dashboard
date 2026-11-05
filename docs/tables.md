For your Next.js admin dashboard, I'll provide a production-oriented PostgreSQL RBAC database script covering user authentication, dynamic roles, permissions, page access, role delegation, organization isolation, and audit history.

I'm designing this to support both your current single-organization setup and a future multi-organization setup.

The central authorization relationship will be:

`users`

`user_roles`

`roles`

`role_permissions`

`permissions`

`modules` + `route_permissions`

ALLOW / DENY

## 1. Database schemas

I'll separate the tables into five PostgreSQL schemas:

| Schema  | Responsibility                              |
| ------- | ------------------------------------------- |
| `core`  | Users and organizations                     |
| `rbac`  | Roles, permissions and authorization        |
| `auth`  | Sessions, invitations and password security |
| `audit` | Activity logs and security events           |

The script uses UUID primary keys, foreign keys, unique constraints, indexes, and checks.

Important design decisions:

- SUPER ADMIN is a protected global system role.
- ADMIN is an organization-level administrative role.
- Operational roles are dynamic records.
- Permissions are assigned to roles, not directly hardcoded into users.
- An administrator can only delegate roles and permissions within their authority.
- Page visibility and actual server/API access are separate enforcement responsibilities.

## 2. Complete PostgreSQL table creation SQL

Run this script in your PostgreSQL database. It creates the schemas, tables, relationships, indexes, and role-assignment scope validation.

```

-- ============================================================
-- COMPLETE RBAC DATABASE ARCHITECTURE
-- PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS rbac;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS audit;

-- ============================================================
-- 1. ORGANIZATION MANAGEMENT
-- ============================================================

CREATE TABLE core.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(200) NOT NULL,
    code VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE core.organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
        REFERENCES core.organizations(id) ON DELETE CASCADE,

    setting_key VARCHAR(150) NOT NULL,
    setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (organization_id, setting_key)
);

-- ============================================================
-- 2. USER MANAGEMENT
-- ============================================================

CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),

    username VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),

    password_hash TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'INVITED'
        CHECK (
            status IN (
                'INVITED',
                'ACTIVE',
                'SUSPENDED',
                'DISABLED',
                'LOCKED'
            )
        ),

    email_verified_at TIMESTAMPTZ,
    mobile_verified_at TIMESTAMPTZ,

    failed_login_attempts INTEGER NOT NULL DEFAULT 0
        CHECK (failed_login_attempts >= 0),

    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,

    created_by UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    updated_by UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_users_email_lower
    ON core.users (LOWER(email));

CREATE UNIQUE INDEX uq_users_username_lower
    ON core.users (LOWER(username))
    WHERE username IS NOT NULL;

CREATE INDEX idx_users_status
    ON core.users(status);

CREATE INDEX idx_users_created_by
    ON core.users(created_by);

-- User can belong to one or multiple organizations.

CREATE TABLE core.user_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES core.users(id) ON DELETE CASCADE,

    organization_id UUID NOT NULL
        REFERENCES core.organizations(id) ON DELETE CASCADE,

    membership_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (
            membership_status IN (
                'ACTIVE',
                'INACTIVE',
                'SUSPENDED'
            )
        ),

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, organization_id),

    -- Supports composite foreign keys from organization-scoped tables.
    UNIQUE (user_id, organization_id, membership_status)
);

CREATE INDEX idx_user_organizations_org
    ON core.user_organizations(organization_id);

-- ============================================================
-- 3. RBAC MODULE MANAGEMENT
-- ============================================================

CREATE TABLE rbac.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    parent_id UUID
        REFERENCES rbac.modules(id) ON DELETE RESTRICT,

    icon VARCHAR(100),
    sort_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_parent
    ON rbac.modules(parent_id);

-- ============================================================
-- 4. RBAC PERMISSIONS
-- ============================================================

CREATE TABLE rbac.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    module_id UUID NOT NULL
        REFERENCES rbac.modules(id) ON DELETE RESTRICT,

    name VARCHAR(150) NOT NULL,
    code VARCHAR(150) NOT NULL UNIQUE,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permissions_module
    ON rbac.permissions(module_id);

CREATE INDEX idx_permissions_active
    ON rbac.permissions(is_active);

-- ============================================================
-- 5. RBAC ROLES
-- ============================================================

CREATE TABLE rbac.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- NULL means global system role.
    -- Non-NULL means organization-specific role.
    organization_id UUID
        REFERENCES core.organizations(id) ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,
    code VARCHAR(100) NOT NULL,

    description TEXT,

    role_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM'
        CHECK (role_type IN ('SYSTEM', 'CUSTOM')),

    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_by UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    updated_by UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        (is_system = TRUE AND role_type = 'SYSTEM')
        OR
        (is_system = FALSE AND role_type = 'CUSTOM')
    )
);

-- Global roles and organization roles have separate uniqueness rules.

CREATE UNIQUE INDEX uq_roles_global_code
    ON rbac.roles(code)
    WHERE organization_id IS NULL;

CREATE UNIQUE INDEX uq_roles_org_code
    ON rbac.roles(organization_id, code)
    WHERE organization_id IS NOT NULL;

CREATE INDEX idx_roles_organization
    ON rbac.roles(organization_id);

CREATE INDEX idx_roles_active
    ON rbac.roles(is_active);

-- ============================================================
-- 6. ROLE PERMISSIONS
-- ============================================================

CREATE TABLE rbac.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role_id UUID NOT NULL
        REFERENCES rbac.roles(id) ON DELETE CASCADE,

    permission_id UUID NOT NULL
        REFERENCES rbac.permissions(id) ON DELETE RESTRICT,

    granted_by UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role
    ON rbac.role_permissions(role_id);

CREATE INDEX idx_role_permissions_permission
    ON rbac.role_permissions(permission_id);

-- ============================================================
-- 7. USER ROLE ASSIGNMENTS
-- ============================================================

CREATE TABLE rbac.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES core.users(id) ON DELETE CASCADE,

    role_id UUID NOT NULL
        REFERENCES rbac.roles(id) ON DELETE RESTRICT,

    -- NULL for a global role such as SUPER_ADMIN.
    organization_id UUID
        REFERENCES core.organizations(id) ON DELETE CASCADE,

    assigned_by UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CHECK (expires_at IS NULL OR expires_at > assigned_at)
);

CREATE UNIQUE INDEX uq_user_roles_global
    ON rbac.user_roles(user_id, role_id)
    WHERE organization_id IS NULL;

CREATE UNIQUE INDEX uq_user_roles_org
    ON rbac.user_roles(user_id, role_id, organization_id)
    WHERE organization_id IS NOT NULL;

CREATE INDEX idx_user_roles_user
    ON rbac.user_roles(user_id);

CREATE INDEX idx_user_roles_role
    ON rbac.user_roles(role_id);

CREATE INDEX idx_user_roles_org
    ON rbac.user_roles(organization_id);

-- ============================================================
-- 8. ROLE DELEGATION
-- Controls which role can create/assign/manage another role.
-- ============================================================

CREATE TABLE rbac.role_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
        REFERENCES core.organizations(id) ON DELETE CASCADE,

    delegator_role_id UUID NOT NULL
        REFERENCES rbac.roles(id) ON DELETE CASCADE,

    target_role_id UUID NOT NULL
        REFERENCES rbac.roles(id) ON DELETE CASCADE,

    can_create_users BOOLEAN NOT NULL DEFAULT FALSE,
    can_assign_role BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_users BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_by UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (delegator_role_id <> target_role_id),

    UNIQUE (
        organization_id,
        delegator_role_id,
        target_role_id
    )
);

CREATE INDEX idx_role_delegations_delegator
    ON rbac.role_delegations(delegator_role_id);

CREATE INDEX idx_role_delegations_target
    ON rbac.role_delegations(target_role_id);

-- ============================================================
-- 9. ROLE PERMISSION GRANTS
-- Controls which permissions a role may delegate to a target role.
-- ============================================================

CREATE TABLE rbac.role_permission_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    delegator_role_id UUID NOT NULL
        REFERENCES rbac.roles(id) ON DELETE CASCADE,

    target_role_id UUID NOT NULL
        REFERENCES rbac.roles(id) ON DELETE CASCADE,

    permission_id UUID NOT NULL
        REFERENCES rbac.permissions(id) ON DELETE RESTRICT,

    granted_by UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (delegator_role_id <> target_role_id),

    UNIQUE (
        delegator_role_id,
        target_role_id,
        permission_id
    )
);

CREATE INDEX idx_permission_grants_delegator
    ON rbac.role_permission_grants(delegator_role_id);

-- ============================================================
-- 10. OPTIONAL ROLE INHERITANCE
-- ============================================================

CREATE TABLE rbac.role_inheritance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    parent_role_id UUID NOT NULL
        REFERENCES rbac.roles(id) ON DELETE CASCADE,

    child_role_id UUID NOT NULL
        REFERENCES rbac.roles(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (parent_role_id <> child_role_id),

    UNIQUE (parent_role_id, child_role_id)
);

CREATE INDEX idx_role_inheritance_child
    ON rbac.role_inheritance(child_role_id);

-- ============================================================
-- 11. ROUTE PERMISSIONS
-- Maps application routes to required permissions.
-- ============================================================

CREATE TABLE rbac.route_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    module_id UUID NOT NULL
        REFERENCES rbac.modules(id) ON DELETE CASCADE,

    permission_id UUID NOT NULL
        REFERENCES rbac.permissions(id) ON DELETE RESTRICT,

    route_path VARCHAR(500) NOT NULL,

    http_method VARCHAR(10) NOT NULL DEFAULT 'PAGE'
        CHECK (
            http_method IN (
                'PAGE',
                'GET',
                'POST',
                'PUT',
                'PATCH',
                'DELETE'
            )
        ),

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (route_path, http_method)
);

CREATE INDEX idx_route_permissions_module
    ON rbac.route_permissions(module_id);

CREATE INDEX idx_route_permissions_permission
    ON rbac.route_permissions(permission_id);

-- ============================================================
-- 12. USER DATA SCOPES
-- Restricts access to branches, departments, locations, etc.
-- ============================================================

CREATE TABLE rbac.user_data_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,

    scope_type VARCHAR(50) NOT NULL,
    scope_id UUID NOT NULL,

    assigned_by UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id, organization_id)
        REFERENCES core.user_organizations(user_id, organization_id)
        ON DELETE CASCADE,

    UNIQUE (user_id, organization_id, scope_type, scope_id)
);

CREATE INDEX idx_user_data_scopes_user
    ON rbac.user_data_scopes(user_id, organization_id);

CREATE INDEX idx_user_data_scopes_resource
    ON rbac.user_data_scopes(scope_type, scope_id);

-- ============================================================
-- 13. AUTHENTICATION SESSIONS
-- Store only a hash of the session token.
-- ============================================================

CREATE TABLE auth.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES core.users(id) ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    ip_address INET,
    user_agent TEXT,

    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,

    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user
    ON auth.sessions(user_id);

CREATE INDEX idx_sessions_expiry
    ON auth.sessions(expires_at);

-- ============================================================
-- 14. USER INVITATIONS
-- ============================================================

CREATE TABLE auth.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES core.users(id) ON DELETE CASCADE,

    email VARCHAR(255) NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    created_by UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_user
    ON auth.invitations(user_id);

CREATE INDEX idx_invitations_expiry
    ON auth.invitations(expires_at);

-- ============================================================
-- 15. PASSWORD RESET TOKENS
-- ============================================================

CREATE TABLE auth.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES core.users(id) ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_user
    ON auth.password_reset_tokens(user_id);

-- ============================================================
-- 16. EMAIL VERIFICATION TOKENS
-- ============================================================

CREATE TABLE auth.email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES core.users(id) ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verification_user
    ON auth.email_verification_tokens(user_id);

-- ============================================================
-- 17. MULTI-FACTOR AUTHENTICATION METHODS
-- ============================================================

CREATE TABLE auth.mfa_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES core.users(id) ON DELETE CASCADE,

    method_type VARCHAR(30) NOT NULL
        CHECK (
            method_type IN (
                'TOTP',
                'EMAIL',
                'SMS',
                'WEBAUTHN'
            )
        ),

    secret_encrypted TEXT,

    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mfa_methods_user
    ON auth.mfa_methods(user_id);

-- ============================================================
-- 18. AUDIT LOGS
-- ============================================================

CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES core.organizations(id) ON DELETE SET NULL,

    actor_id UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    action VARCHAR(150) NOT NULL,

    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,

    old_values JSONB,
    new_values JSONB,

    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor
    ON audit.audit_logs(actor_id);

CREATE INDEX idx_audit_organization
    ON audit.audit_logs(organization_id);

CREATE INDEX idx_audit_entity
    ON audit.audit_logs(entity_type, entity_id);

CREATE INDEX idx_audit_created
    ON audit.audit_logs(created_at DESC);

CREATE INDEX idx_audit_action
    ON audit.audit_logs(action);

-- ============================================================
-- 19. SECURITY EVENTS
-- ============================================================

CREATE TABLE audit.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES core.users(id) ON DELETE SET NULL,

    event_type VARCHAR(100) NOT NULL,

    severity VARCHAR(20) NOT NULL DEFAULT 'INFO'
        CHECK (
            severity IN (
                'INFO',
                'WARNING',
                'HIGH',
                'CRITICAL'
            )
        ),

    ip_address INET,
    user_agent TEXT,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_events_user
    ON audit.security_events(user_id);

CREATE INDEX idx_security_events_type
    ON audit.security_events(event_type);

CREATE INDEX idx_security_events_created
    ON audit.security_events(created_at DESC);

-- ============================================================
-- 20. VALIDATE ROLE ASSIGNMENT SCOPE
-- Global roles can only be assigned globally.
-- Organization roles require active organization membership.
-- ============================================================

CREATE OR REPLACE FUNCTION rbac.validate_user_role_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_role_organization_id UUID;
    v_membership_status VARCHAR(20);
BEGIN
    SELECT organization_id
    INTO v_role_organization_id
    FROM rbac.roles
    WHERE id = NEW.role_id
      AND is_active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Role does not exist or is inactive';
    END IF;

    IF v_role_organization_id IS DISTINCT FROM NEW.organization_id THEN
        RAISE EXCEPTION
            'Role organization scope does not match assignment scope';
    END IF;

    IF NEW.organization_id IS NOT NULL THEN
        SELECT membership_status
        INTO v_membership_status
        FROM core.user_organizations
        WHERE user_id = NEW.user_id
          AND organization_id = NEW.organization_id;

        IF NOT FOUND OR v_membership_status <> 'ACTIVE' THEN
            RAISE EXCEPTION
                'User must have active membership in this organization';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_user_role_scope
BEFORE INSERT OR UPDATE OF user_id, role_id, organization_id
ON rbac.user_roles
FOR EACH ROW
EXECUTE FUNCTION rbac.validate_user_role_scope();

-- ============================================================
-- END OF RBAC DATABASE STRUCTURE
-- ============================================================

```

## 3. Seed the initial modules and permissions

Creating the tables is only the first step. Your application also needs a permission catalog.

Run this after creating the tables.

```

BEGIN;

-- ------------------------------------------------------------
-- APPLICATION MODULES
-- ------------------------------------------------------------

INSERT INTO rbac.modules (name, code, description, sort_order)
VALUES
    ('Dashboard', 'DASHBOARD', 'Main dashboard', 1),
    ('User Management', 'USERS', 'Manage application users', 2),
    ('Role Management', 'ROLES', 'Manage application roles', 3),
    ('Permission Management', 'PERMISSIONS', 'Manage permissions', 4),
    ('Members', 'MEMBERS', 'Manage members', 5),
    ('Reports', 'REPORTS', 'Manage reports', 6),
    ('Settings', 'SETTINGS', 'Application settings', 7),
    ('Audit Logs', 'AUDIT_LOGS', 'View audit history', 8)
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------
-- PERMISSIONS
-- ------------------------------------------------------------

INSERT INTO rbac.permissions (module_id, name, code, description)
SELECT m.id, p.name, p.code, p.description
FROM (
    VALUES
        ('DASHBOARD', 'View Dashboard', 'dashboard.view', 'View dashboard'),

        ('USERS', 'View Users', 'users.view', 'View users'),
        ('USERS', 'Create Users', 'users.create', 'Create users'),
        ('USERS', 'Update Users', 'users.update', 'Update users'),
        ('USERS', 'Delete Users', 'users.delete', 'Delete users'),
        ('USERS', 'Activate Users', 'users.activate', 'Activate users'),
        ('USERS', 'Deactivate Users', 'users.deactivate', 'Deactivate users'),

        ('ROLES', 'View Roles', 'roles.view', 'View roles'),
        ('ROLES', 'Create Roles', 'roles.create', 'Create roles'),
        ('ROLES', 'Update Roles', 'roles.update', 'Update roles'),
        ('ROLES', 'Delete Roles', 'roles.delete', 'Delete roles'),
        ('ROLES', 'Assign Roles', 'roles.assign', 'Assign roles'),

        ('PERMISSIONS', 'View Permissions', 'permissions.view', 'View permissions'),
        ('PERMISSIONS', 'Assign Permissions', 'permissions.assign', 'Assign permissions'),

        ('MEMBERS', 'View Members', 'members.view', 'View members'),
        ('MEMBERS', 'Create Members', 'members.create', 'Create members'),
        ('MEMBERS', 'Update Members', 'members.update', 'Update members'),
        ('MEMBERS', 'Delete Members', 'members.delete', 'Delete members'),

        ('REPORTS', 'View Reports', 'reports.view', 'View reports'),
        ('REPORTS', 'Export Reports', 'reports.export', 'Export reports'),

        ('SETTINGS', 'View Settings', 'settings.view', 'View settings'),
        ('SETTINGS', 'Update Settings', 'settings.update', 'Update settings'),

        ('AUDIT_LOGS', 'View Audit Logs', 'audit_logs.view', 'View audit logs')

) AS p(module_code, name, code, description)
JOIN rbac.modules m ON m.code = p.module_code
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------
-- GLOBAL SUPER ADMIN ROLE
-- The first SUPER ADMIN user is assigned this role
-- through a secure provisioning process.
-- ------------------------------------------------------------

INSERT INTO rbac.roles (
    organization_id,
    name,
    code,
    description,
    role_type,
    is_system,
    is_active
)
VALUES (
    NULL,
    'SUPER ADMIN',
    'SUPER_ADMIN',
    'Global application administrator',
    'SYSTEM',
    TRUE,
    TRUE
)
ON CONFLICT DO NOTHING;

-- Give SUPER_ADMIN every active permission in the catalog.

INSERT INTO rbac.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac.roles r
CROSS JOIN rbac.permissions p
WHERE r.code = 'SUPER_ADMIN'
  AND r.organization_id IS NULL
  AND p.is_active = TRUE
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;

```

Important: The SUPER ADMIN role is global. An ADMIN role should be created for each organization, with its own permitted set of permissions. Don't make ADMIN a global role if you want organization-level isolation.

## 4. Map pages and API routes to permissions

The `route_permissions` table connects application routes to permission records.

Here is an example seed:

```

INSERT INTO rbac.route_permissions (
    module_id,
    permission_id,
    route_path,
    http_method,
    description
)
SELECT
    m.id,
    p.id,
    x.route_path,
    x.http_method,
    x.description
FROM (
    VALUES
        ('DASHBOARD', 'dashboard.view', '/dashboard', 'PAGE', 'Dashboard page'),

        ('USERS', 'users.view', '/users', 'PAGE', 'Users page'),
        ('USERS', 'users.create', '/api/users', 'POST', 'Create user API'),
        ('USERS', 'users.update', '/api/users/:id', 'PATCH', 'Update user API'),
        ('USERS', 'users.delete', '/api/users/:id', 'DELETE', 'Delete user API'),

        ('ROLES', 'roles.view', '/roles', 'PAGE', 'Roles page'),
        ('ROLES', 'roles.create', '/api/roles', 'POST', 'Create role API'),
        ('ROLES', 'roles.update', '/api/roles/:id', 'PATCH', 'Update role API'),

        ('MEMBERS', 'members.view', '/members', 'PAGE', 'Members page'),
        ('MEMBERS', 'members.create', '/api/members', 'POST', 'Create member API'),

        ('REPORTS', 'reports.view', '/reports', 'PAGE', 'Reports page'),
        ('REPORTS', 'reports.export', '/api/reports/export', 'POST', 'Export reports API'),

        ('AUDIT_LOGS', 'audit_logs.view', '/audit-logs', 'PAGE', 'Audit logs page')

) AS x(module_code, permission_code, route_path, http_method, description)
JOIN rbac.modules m ON m.code = x.module_code
JOIN rbac.permissions p ON p.code = x.permission_code
ON CONFLICT (route_path, http_method) DO NOTHING;

```

You can add more routes as your application grows.

## 5. Additional integrity validation for role delegation

The database should also prevent an ADMIN from configuring delegations between roles belonging to different organizations.

Add this trigger:

```

CREATE OR REPLACE FUNCTION rbac.validate_role_delegation_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_delegator_org UUID;
    v_target_org UUID;
BEGIN
    SELECT organization_id
    INTO v_delegator_org
    FROM rbac.roles
    WHERE id = NEW.delegator_role_id;

    SELECT organization_id
    INTO v_target_org
    FROM rbac.roles
    WHERE id = NEW.target_role_id;

    IF v_delegator_org IS DISTINCT FROM NEW.organization_id
       OR v_target_org IS DISTINCT FROM NEW.organization_id THEN

        RAISE EXCEPTION
            'Delegator and target roles must belong to the delegation organization';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_role_delegation_scope
BEFORE INSERT OR UPDATE
ON rbac.role_delegations
FOR EACH ROW
EXECUTE FUNCTION rbac.validate_role_delegation_scope();

```

This table is intended for organization-level delegation, such as ADMIN creating GUARD or SUPERVISOR roles. Global SUPER ADMIN authority should be handled separately by the authorization service.

## 6. Example: How the database records an ADMIN creating a GUARD

Assume organization `ORG-001` exists, and Rahul is an active member of that organization.

The application performs these operations in a database transaction:

1. Insert the GUARD user into `core.users`.
2. Insert their organization membership.
3. Assign the GUARD role through `rbac.user_roles`.
4. Create an invitation in `auth.invitations`.
5. Record the action in `audit.audit_logs`.

The backend must verify Rahul's permissions and delegation authority before executing this transaction.

Example role assignment SQL:

```
INSERT INTO rbac.user_roles (
    user_id,
    role_id,
    organization_id,
    assigned_by
)
VALUES (
    'GUARD_USER_UUID',
    'GUARD_ROLE_UUID',
    'ORGANIZATION_UUID',
    'ADMIN_USER_UUID'
);
```

The trigger checks that the role belongs to that organization and that the user has an active organization membership.

## 7. Example: Fetch a user's effective permissions

This is one of the most important queries for your Next.js application.

```
SELECT DISTINCT
    p.code AS permission_code,
    m.code AS module_code,
    m.name AS module_name
FROM rbac.user_roles ur
JOIN rbac.roles r
    ON r.id = ur.role_id
JOIN rbac.role_permissions rp
    ON rp.role_id = r.id
JOIN rbac.permissions p
    ON p.id = rp.permission_id
JOIN rbac.modules m
    ON m.id = p.module_id
WHERE ur.user_id = 'USER_UUID'
  AND ur.is_active = TRUE
  AND r.is_active = TRUE
  AND p.is_active = TRUE
  AND m.is_active = TRUE
  AND (
      ur.expires_at IS NULL
      OR ur.expires_at > NOW()
  )
  AND (
      ur.organization_id = 'ORGANIZATION_UUID'
      OR ur.organization_id IS NULL
  );
```

For organization-scoped users, pass the organization selected for the current request. The global-role condition should only grant global access when the authenticated user actually holds an authorized global role.

# 8. Final database structure

PostgreSQL schemas

21 tables

core

4 tables

organizations · organization_settings · users · user_organizations

rbac

10 tables

modules · permissions · roles · role_permissions · user_roles · role_delegations · role_permission_grants · role_inheritance · route_permissions · user_data_scopes

auth

5 tables

sessions · invitations · password_reset_tokens · email_verification_tokens · mfa_methods

audit

2 tables

audit_logs · security_events

## 9. Important production considerations

Before deploying, there are a few things you should understand:

1. SQL tables do not automatically secure your application. Your Next.js server must verify permissions on every protected page, API, Server Action and data operation.
2. The role-delegation table defines the rules, but your backend must verify that the acting ADMIN has authority to create the target role and grant each requested permission.
3. Add PostgreSQL Row-Level Security (RLS) or equivalent tenant-scoped query enforcement if you need database-enforced organization isolation.
4. Prevent deletion or deactivation of the last active SUPER ADMIN using a protected transactional operation.
5. Use transactions when creating users, assigning roles, creating invitations and writing audit records.
6. Protect audit tables from ordinary UPDATE and DELETE operations.
7. Add automatic `updated_at` triggers or explicitly update that field in your data-access layer.
8. Add appropriate retention policies for sessions, tokens, and audit records.

One important note about your existing project: This is a new schema design, not a migration of your existing tables. Before running it on a database that already contains users, roles or permissions, inspect the current schema and plan a migration so you don't create duplicate or conflicting structures.

My recommendation is to implement this database first, verify its relationships, and then connect your existing `src/lib/auth/permissions.ts`, `session.ts`, and API routes to it.