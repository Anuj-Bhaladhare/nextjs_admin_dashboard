-- SecureGateControl RBAC demo seed data
-- Based on the supplied PostgreSQL schema.
-- Inserts 10 rows into each of the 22 tables (roles: 21 rows so every
-- organization has two scoped roles plus one global role).
-- Run AFTER creating the schema and tables. Use a demo/test database only.

BEGIN;

-- Stable demo UUID helper: md5 text cast to UUID.
-- Organizations
INSERT INTO core.organizations
(id, name, code, description, status, created_at, updated_at)
SELECT md5('bee-org-'||g)::uuid,
       'Demo Organization '||g, 'ORG-'||lpad(g::text,3,'0'),
       'Sample organization for RBAC testing',
       CASE WHEN g=10 THEN 'INACTIVE' ELSE 'ACTIVE' END,
       NOW(), NOW()
FROM generate_series(1,10) g;

-- Organization settings
INSERT INTO core.organization_settings
(id, organization_id, setting_key, setting_value, created_at, updated_at)
SELECT md5('bee-setting-'||g)::uuid, md5('bee-org-'||g)::uuid,
       'general_preferences',
       jsonb_build_object('timezone','Asia/Kolkata','locale','en-IN','notifications',true),
       NOW(), NOW()
FROM generate_series(1,10) g;

-- Users
INSERT INTO core.users
(id, first_name, last_name, username, email, mobile, password_hash, status,
 email_verified_at, mobile_verified_at, failed_login_attempts, locked_until,
 last_login_at, created_by, updated_by, created_at, updated_at)
SELECT md5('bee-user-'||g)::uuid,
       (ARRAY['Aarav','Vivaan','Aditya','Ishita','Ananya','Rohan','Saanvi','Kabir','Meera','Arjun'])[g],
       'Demo', 'demo_user_'||g, 'user'||g||'@example.test',
       '+9198765432'||lpad(g::text,2,'0'),
       '$2b$12$REPLACE_WITH_A_REAL_BCRYPT_HASH_FOR_TESTING',
       CASE WHEN g=10 THEN 'INVITED' ELSE 'ACTIVE' END,
       CASE WHEN g=10 THEN NULL ELSE NOW() END,
       NOW(), 0, NULL, NOW() - (g||' days')::interval,
       NULL, NULL, NOW(), NOW()
FROM generate_series(1,10) g;

-- User profiles
INSERT INTO core.user_profiles
(user_id, display_name, bio, avatar_url, cover_image_url, date_of_birth, gender,
 alternate_email, alternate_mobile, address_line_1, address_line_2, city, state,
 country, postal_code, website_url, linkedin_url, twitter_url, timezone, locale,
 preferences, is_public, created_at, updated_at)
SELECT md5('bee-user-'||g)::uuid, 'Demo User '||g,
       'Sample profile used for development and QA.',
       'https://example.test/avatars/user-'||g||'.png',
       'https://example.test/covers/user-'||g||'.png',
       DATE '1990-01-01' + (g*365), CASE WHEN g%2=0 THEN 'FEMALE' ELSE 'MALE' END,
       'alt'||g||'@example.test', '+9187654321'||lpad(g::text,2,'0'),
       g||' Demo Street', 'Demo Area', 'Nagpur', 'Maharashtra', 'India',
       '440001', 'https://example.test', 'https://linkedin.com/in/demo'||g,
       'https://x.com/demo'||g, 'Asia/Kolkata', 'en-IN',
       jsonb_build_object('theme',CASE WHEN g%2=0 THEN 'dark' ELSE 'light' END),
       FALSE, NOW(), NOW()
FROM generate_series(1,10) g;

-- Organization memberships
INSERT INTO core.user_organizations
(id, user_id, organization_id, membership_status, joined_at, created_at)
SELECT md5('bee-membership-'||g)::uuid, md5('bee-user-'||g)::uuid,
       md5('bee-org-'||g)::uuid,
       'ACTIVE',
       NOW() - (g||' days')::interval, NOW()
FROM generate_series(1,10) g;

-- Modules
INSERT INTO rbac.modules
(id, name, code, description, parent_id, icon, sort_order, is_active, created_at, updated_at)
SELECT md5('bee-module-'||g)::uuid,
       (ARRAY['Dashboard','Organizations','Users','Roles','Permissions','Reports','Audit Logs','Settings','Invitations','Security'])[g],
       'MODULE_'||g, 'Demo RBAC module '||g, NULL,
       'shield', g, TRUE, NOW(), NOW()
FROM generate_series(1,10) g;

-- Permissions
INSERT INTO rbac.permissions
(id, module_id, name, code, description, is_active, created_at, updated_at)
SELECT md5('bee-permission-'||g)::uuid, md5('bee-module-'||g)::uuid,
       'View demo resource '||g, 'DEMO_VIEW_'||g,
       'Demo permission associated with module '||g, TRUE, NOW(), NOW()
FROM generate_series(1,10) g;

-- Roles: one global system role and two organization roles per organization.
INSERT INTO rbac.roles
(id, organization_id, name, code, description, role_type, is_system, is_active,
 created_by, updated_by, created_at, updated_at)
VALUES
(md5('bee-role-global')::uuid, NULL, 'Super Administrator', 'SUPER_ADMIN',
 'Global platform administrator role', 'SYSTEM', TRUE, TRUE, NULL, NULL, NOW(), NOW());

INSERT INTO rbac.roles
(id, organization_id, name, code, description, role_type, is_system, is_active,
 created_by, updated_by, created_at, updated_at)
SELECT md5('bee-role-admin-'||g)::uuid, md5('bee-org-'||g)::uuid,
       'Organization Admin '||g, 'ORG_ADMIN_'||g,
       'Organization-level administrator role', 'SYSTEM', TRUE, TRUE,
       NULL, NULL, NOW(), NOW()
FROM generate_series(1,10) g;

INSERT INTO rbac.roles
(id, organization_id, name, code, description, role_type, is_system, is_active,
 created_by, updated_by, created_at, updated_at)
SELECT md5('bee-role-staff-'||g)::uuid, md5('bee-org-'||g)::uuid,
       'Organization Staff '||g, 'ORG_STAFF_'||g,
       'Organization-level staff role', 'CUSTOM', FALSE, TRUE,
       NULL, NULL, NOW(), NOW()
FROM generate_series(1,10) g;

-- Role permissions (10 sample grants)
INSERT INTO rbac.role_permissions
(id, role_id, permission_id, granted_by, created_at)
SELECT md5('bee-rp-'||g)::uuid,
       CASE WHEN g=1 THEN md5('bee-role-global')::uuid
            ELSE md5('bee-role-admin-'||(g-1))::uuid END,
       md5('bee-permission-'||g)::uuid,
       NULL, NOW()
FROM generate_series(1,10) g;

-- User role assignments: one global assignment and nine organization assignments.
INSERT INTO rbac.user_roles
(id, user_id, role_id, organization_id, assigned_by, assigned_at, expires_at, is_active)
VALUES
(md5('bee-user-role-1')::uuid, md5('bee-user-1')::uuid,
 md5('bee-role-global')::uuid, NULL, NULL, NOW(), NULL, TRUE);

INSERT INTO rbac.user_roles
(id, user_id, role_id, organization_id, assigned_by, assigned_at, expires_at, is_active)
SELECT md5('bee-user-role-'||g)::uuid, md5('bee-user-'||g)::uuid,
       md5('bee-role-admin-'||g)::uuid, md5('bee-org-'||g)::uuid,
       md5('bee-user-1')::uuid, NOW(), NULL, TRUE
FROM generate_series(2,10) g;

-- Role delegation: admin role delegates staff role within each organization.
INSERT INTO rbac.role_delegations
(id, organization_id, delegator_role_id, target_role_id, can_create_users,
 can_assign_role, can_manage_users, is_active, created_by, created_at)
SELECT md5('bee-delegation-'||g)::uuid, md5('bee-org-'||g)::uuid,
       md5('bee-role-admin-'||g)::uuid, md5('bee-role-staff-'||g)::uuid,
       TRUE, TRUE, TRUE, TRUE, md5('bee-user-1')::uuid, NOW()
FROM generate_series(1,10) g;

-- Role permission grants
INSERT INTO rbac.role_permission_grants
(id, delegator_role_id, target_role_id, permission_id, granted_by, created_at)
SELECT md5('bee-rpg-'||g)::uuid, md5('bee-role-admin-'||g)::uuid,
       md5('bee-role-staff-'||g)::uuid, md5('bee-permission-'||g)::uuid,
       md5('bee-user-1')::uuid, NOW()
FROM generate_series(1,10) g;

-- Role inheritance
INSERT INTO rbac.role_inheritance
(id, parent_role_id, child_role_id, created_at)
SELECT md5('bee-inheritance-'||g)::uuid, md5('bee-role-admin-'||g)::uuid,
       md5('bee-role-staff-'||g)::uuid, NOW()
FROM generate_series(1,10) g;

-- Route permissions
INSERT INTO rbac.route_permissions
(id, module_id, permission_id, route_path, http_method, description, is_active, created_at)
SELECT md5('bee-route-'||g)::uuid, md5('bee-module-'||g)::uuid,
       md5('bee-permission-'||g)::uuid,
       '/api/demo/resource-'||g, 'GET',
       'Demo route permission mapping '||g, TRUE, NOW()
FROM generate_series(1,10) g;

-- User data scopes
INSERT INTO rbac.user_data_scopes
(id, user_id, organization_id, scope_type, scope_id, assigned_by, created_at)
SELECT md5('bee-scope-'||g)::uuid, md5('bee-user-'||g)::uuid,
       md5('bee-org-'||g)::uuid, 'DEPARTMENT',
       md5('bee-department-'||g)::uuid, md5('bee-user-1')::uuid, NOW()
FROM generate_series(1,10) g;

-- Authentication sessions (store token hashes, never raw session tokens)
INSERT INTO auth.sessions
(id, user_id, token_hash, ip_address, user_agent, expires_at, revoked_at,
 last_activity_at, created_at)
SELECT md5('bee-session-'||g)::uuid, md5('bee-user-'||g)::uuid,
       encode(digest('demo-session-token-'||g, 'sha256'),'hex'),
       ('192.0.2.'||g)::inet, 'Mozilla/5.0 (Demo Browser)',
       NOW() + INTERVAL '7 days',
       CASE WHEN g=10 THEN NOW() ELSE NULL END,
       NOW(), NOW()
FROM generate_series(1,10) g;

-- Invitations
INSERT INTO auth.invitations
(id, user_id, email, token_hash, expires_at, accepted_at, revoked_at, created_by, created_at)
SELECT md5('bee-invitation-'||g)::uuid, md5('bee-user-'||g)::uuid,
       'user'||g||'@example.test',
       encode(digest('demo-invitation-token-'||g, 'sha256'),'hex'),
       NOW() + INTERVAL '2 days',
       CASE WHEN g<=8 THEN NOW() ELSE NULL END,
       CASE WHEN g=10 THEN NOW() ELSE NULL END,
       md5('bee-user-1')::uuid, NOW()
FROM generate_series(1,10) g;

-- Password reset tokens
INSERT INTO auth.password_reset_tokens
(id, user_id, token_hash, expires_at, used_at, created_at)
SELECT md5('bee-reset-'||g)::uuid, md5('bee-user-'||g)::uuid,
       encode(digest('demo-reset-token-'||g, 'sha256'),'hex'),
       NOW() + INTERVAL '30 minutes',
       CASE WHEN g<=5 THEN NOW() ELSE NULL END, NOW()
FROM generate_series(1,10) g;

-- Email verification tokens
INSERT INTO auth.email_verification_tokens
(id, user_id, token_hash, expires_at, verified_at, created_at)
SELECT md5('bee-email-verify-'||g)::uuid, md5('bee-user-'||g)::uuid,
       encode(digest('demo-email-verification-'||g, 'sha256'),'hex'),
       NOW() + INTERVAL '1 day',
       CASE WHEN g<=9 THEN NOW() ELSE NULL END, NOW()
FROM generate_series(1,10) g;

-- MFA methods
INSERT INTO auth.mfa_methods
(id, user_id, method_type, secret_encrypted, is_enabled, verified_at, created_at, updated_at)
SELECT md5('bee-mfa-'||g)::uuid, md5('bee-user-'||g)::uuid,
       (ARRAY['TOTP','EMAIL','SMS','WEBAUTHN','TOTP','EMAIL','SMS','TOTP','EMAIL','TOTP'])[g],
       CASE WHEN g%2=0 THEN 'DEMO_ENCRYPTED_SECRET_NOT_FOR_PRODUCTION' ELSE NULL END,
       g<=6, CASE WHEN g<=6 THEN NOW() ELSE NULL END, NOW(), NOW()
FROM generate_series(1,10) g;

-- Audit logs
INSERT INTO audit.audit_logs
(id, organization_id, actor_id, action, entity_type, entity_id, old_values,
 new_values, ip_address, user_agent, created_at)
SELECT md5('bee-audit-'||g)::uuid, md5('bee-org-'||g)::uuid,
       md5('bee-user-'||g)::uuid, 'DEMO_UPDATE',
       'USER', md5('bee-user-'||g)::uuid,
       jsonb_build_object('status','INVITED'),
       jsonb_build_object('status','ACTIVE'),
       ('198.51.100.'||g)::inet, 'Mozilla/5.0 (Demo Browser)',
       NOW() - (g||' hours')::interval
FROM generate_series(1,10) g;

-- Security events
INSERT INTO audit.security_events
(id, user_id, event_type, severity, ip_address, user_agent, metadata, created_at)
SELECT md5('bee-security-'||g)::uuid, md5('bee-user-'||g)::uuid,
       (ARRAY['LOGIN_SUCCESS','LOGIN_FAILED','PASSWORD_RESET','MFA_ENABLED',
              'SESSION_REVOKED','INVITATION_ACCEPTED','EMAIL_VERIFIED',
              'ACCOUNT_LOCKED','LOGOUT','PERMISSION_DENIED'])[g],
       (ARRAY['INFO','WARNING','INFO','INFO','WARNING','INFO','INFO','HIGH','INFO','WARNING'])[g],
       ('203.0.113.'||g)::inet, 'Mozilla/5.0 (Demo Browser)',
       jsonb_build_object('source','seed_data','sequence',g),
       NOW() - (g||' minutes')::interval
FROM generate_series(1,10) g;

COMMIT;

-- Quick row-count verification (expect 10 in each table except rbac.roles=21):
SELECT 'core.organizations' AS table_name, COUNT(*) AS row_count FROM core.organizations
UNION ALL SELECT 'core.organization_settings', COUNT(*) FROM core.organization_settings
UNION ALL SELECT 'core.users', COUNT(*) FROM core.users
UNION ALL SELECT 'core.user_profiles', COUNT(*) FROM core.user_profiles
UNION ALL SELECT 'core.user_organizations', COUNT(*) FROM core.user_organizations
UNION ALL SELECT 'rbac.modules', COUNT(*) FROM rbac.modules
UNION ALL SELECT 'rbac.permissions', COUNT(*) FROM rbac.permissions
UNION ALL SELECT 'rbac.roles', COUNT(*) FROM rbac.roles
UNION ALL SELECT 'rbac.role_permissions', COUNT(*) FROM rbac.role_permissions
UNION ALL SELECT 'rbac.user_roles', COUNT(*) FROM rbac.user_roles
UNION ALL SELECT 'rbac.role_delegations', COUNT(*) FROM rbac.role_delegations
UNION ALL SELECT 'rbac.role_permission_grants', COUNT(*) FROM rbac.role_permission_grants
UNION ALL SELECT 'rbac.role_inheritance', COUNT(*) FROM rbac.role_inheritance
UNION ALL SELECT 'rbac.route_permissions', COUNT(*) FROM rbac.route_permissions
UNION ALL SELECT 'rbac.user_data_scopes', COUNT(*) FROM rbac.user_data_scopes
UNION ALL SELECT 'auth.sessions', COUNT(*) FROM auth.sessions
UNION ALL SELECT 'auth.invitations', COUNT(*) FROM auth.invitations
UNION ALL SELECT 'auth.password_reset_tokens', COUNT(*) FROM auth.password_reset_tokens
UNION ALL SELECT 'auth.email_verification_tokens', COUNT(*) FROM auth.email_verification_tokens
UNION ALL SELECT 'auth.mfa_methods', COUNT(*) FROM auth.mfa_methods
UNION ALL SELECT 'audit.audit_logs', COUNT(*) FROM audit.audit_logs
UNION ALL SELECT 'audit.security_events', COUNT(*) FROM audit.security_events
ORDER BY table_name;
