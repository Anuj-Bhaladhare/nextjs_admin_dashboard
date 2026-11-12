
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


CREATE TABLE core.user_profiles (
    -- Primary relationship
    user_id UUID PRIMARY KEY
        REFERENCES core.users(id) ON DELETE CASCADE,

    -- Profile information
    display_name VARCHAR(150),
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,

    -- Personal information
    date_of_birth DATE,
    gender VARCHAR(20),

    -- Contact and location
    alternate_email VARCHAR(255),
    alternate_mobile VARCHAR(20),

    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),

    -- Social profiles
    website_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,

    -- Preferences
    timezone VARCHAR(100) DEFAULT 'UTC',
    locale VARCHAR(20) DEFAULT 'en',
    preferences JSONB NOT NULL DEFAULT '{}'::JSONB,

    -- Profile visibility
    is_public BOOLEAN NOT NULL DEFAULT FALSE,

    -- Audit information
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
