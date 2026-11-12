# Smart Gate Management System – User Management & RBAC Architecture

## 1. User Management Hierarchy

The application will have two privileged administrative roles:

- SUPER\_ADMIN – Highest administrative authority.
- ADMIN – Manages day-to-day organizational users and operations.

Other operational roles will be created according to organizational requirements:

- SUPERVISOR
- GUARD\_ADMIN
- GUARD
- RECEPTIONIST
- OTHER CUSTOM ROLES

Core business rule:

- SUPER\_ADMIN controls administrative authority.
- ADMIN manages day-to-day organizational users and operations within delegated permissions.
- Other roles receive permissions according to their operational responsibilities.

## 2. Proposed Sidebar Structure

The application sidebar will be divided into three main groups.

### A. DASHBOARD

Contains operational modules available to authenticated users, depending on their assigned permissions.

| No. | Module | Purpose |
| --- | --- | --- |
| 1 | Dashboard | Personalized overview |
| 2 | Live Monitoring | Live gate activity and device status |
| 3 | Entry & Exit | Employee movement records |
| 4 | Gate Control | Manual gate operation |
| 5 | Access Logs | Historical entry/exit records |
| 6 | Reports | Access and attendance reports |

### B. ADMINISTRATION

Contains administrative modules accessible to SUPER\_ADMIN and ADMIN with different permission levels.

| No. | Module | SUPER\_ADMIN | ADMIN |
| --- | --- | --- | --- |
| 1 | Employee Management | Full | Full |
| 2 | User Management | Full | Limited |
| 3 | Role & Permissions | Full | Delegated |
| 4 | Gate Management | Full | Full |
| 5 | Device Management | Full | Full |
| 6 | Credential Management | Full | Full |
| 7 | Audit Logs | Full | Limited |
| 8 | System Settings | Full | Limited |

Note: Full and Limited are proposed access levels, not existing permission codes.

### C. ACCOUNT

| Module | Purpose |
| --- | --- |
| My Profile | Manage personal account information |
| Change Password | Change own password |
| Logout | Securely end the session |

## 3. Module Access and RBAC Rules

All modules must follow Role-Based Access Control (RBAC).

Important rules:

- A logged-in user does not automatically receive access to every module.
- Each module must respect the user's assigned permissions.
- Sidebar visibility must be generated dynamically.
- Page-level access must be validated independently.
- Backend authorization must enforce all permissions.

For example:

- SUPER\_ADMIN: Access to all authorized modules.
- ADMIN: Organization-level administrative access.
- SUPERVISOR: Assigned operational and management access.
- GUARD: Monitoring and authorized gate-control access.
- RECEPTIONIST: Only delegated functions.

Important: Hiding a sidebar item does not provide security. Backend authorization is mandatory.

## 4. User Creation Hierarchy

The proposed user hierarchy is:

## SUPER\_ADMIN

Highest administrative authority

### ADMIN

Organizational administration

SUPERVISOR

GUARD\_ADMIN

GUARD

RECEPTIONIST

OTHER CUSTOM ROLES

### User Creation Permissions

| Operation | SUPER\_ADMIN | ADMIN |
| --- | --- | --- |
| Create SUPER\_ADMIN | Restricted system-level operation | No |
| Create ADMIN | Yes | No |
| Create SUPERVISOR | Yes | Yes |
| Create GUARD\_ADMIN | Yes | Yes |
| Create GUARD | Yes | Yes |
| Create RECEPTIONIST | Yes | Yes |
| Create Custom Roles | Yes | Within delegated authority |
| Assign Permissions | Yes | Within delegated authority |
| Suspend Subordinate Users | Yes | Within delegated authority |
| Delete Another ADMIN | Yes | No |
| Modify SUPER\_ADMIN | Restricted | No |

### Critical Security Rules

1. ADMIN cannot create another ADMIN.
2. ADMIN cannot modify SUPER\_ADMIN.
3. ADMIN cannot assign permissions beyond their delegated authority.
4. ADMIN can manage only permitted subordinate users.
5. SUPER\_ADMIN retains the highest administrative authority.
6. All restrictions must be enforced on the backend, not just in the frontend.

## 5. Future Module Enhancements

The following modules can be considered for future development.

| Module | Purpose |
| --- | --- |
| Visitor Management | Register and track visitors |
| Temporary Access | Time-limited access authorization |
| Emergency Management | Emergency gate operations and incident workflows |
| Maintenance Management | Hardware inspection and maintenance records |
| Notifications | Operational alerts and announcements |
| Department Management | Organize employees by department |

MVP rule: These modules should not be included in the initial development scope unless explicitly approved.

## 6. Final Sidebar Information Architecture

| Sidebar Group | Modules |
| --- | --- |
| DASHBOARD | Dashboard, Live Monitoring, Entry & Exit, Gate Control, Access Logs, Reports |
| ADMINISTRATION | Employee Management, User Management, Role & Permissions, Gate Management, Device Management, Credential Management, Audit Logs, System Settings |
| ACCOUNT | My Profile, Change Password, Logout |

### Implementation Recommendation

For the Next.js application:

- Do not hardcode separate sidebars for every role.
- Maintain a centralized permission-based sidebar configuration.
- Generate navigation dynamically using the authenticated user's permissions.
- Apply RBAC to frontend routes, backend APIs and individual actions.

## 7. Next Development Step – Permission Matrix

Before designing individual dashboard screens, create a complete permission matrix for every application module.

### Proposed Permission Types

| Permission | Description |
| --- | --- |
| VIEW | View module data |
| CREATE | Create new records |
| UPDATE | Modify existing records |
| DELETE | Delete records |
| EXPORT | Export data |
| APPROVE | Approve requests or operations |
| CONTROL | Perform physical gate-control operations |
| ASSIGN | Assign roles, permissions or responsibilities |

### RBAC Database Integration

The permission matrix should map to the existing database architecture:

- `rbac.modules` – Stores application modules.
- `rbac.permissions` – Stores available permissions.
- `rbac.route_permissions` – Maps application routes to required permissions.

The same permission structure should control sidebar visibility, page access and backend operations.

## 8. Important Implementation Principles

1. SUPER\_ADMIN and ADMIN are privileged administrative roles.
2. Operational roles are created according to business requirements.
3. Role-based access must be permission-driven.
4. Administrative authority must follow a hierarchy.
5. Permissions must never exceed delegated authority.
6. Frontend and backend authorization must remain consistent.
7. Future modules must remain outside the MVP until approved.

Final conclusion: The immediate next task is to design the complete RBAC Permission Matrix, defining module-wise permissions and role-wise access before proceeding with individual dashboard screens and Next.js implementation.