# **Role & Permission Management — Complete Backend API Architecture**

**Project:** SecureGateControl\
**Module:** Role Management & Permission Management\
**Architecture baseline:** Your existing PostgreSQL RBAC schema\
**API style:** RESTful\
**API version:** `/api/v1`\
**Backend:** Next.js API architecture / Node.js / TypeScript\
**Database:** PostgreSQL + Drizzle ORM\
**Authorization:** JWT authentication + RBAC + organization scope

This architecture is designed specifically for your existing database, including `rbac.modules`, `rbac.permissions`, `rbac.roles`, `rbac.role_permissions`, `rbac.user_roles`, `rbac.role_delegations`, `rbac.role_permission_grants`, `rbac.role_inheritance`, and `rbac.route_permissions`.

The objective is to design the backend APIs for managing **Modules, Permissions, Roles, Role-Permission Assignments, Role Delegation, Permission Delegation, and Role Inheritance**—without redesigning your database.

# **1. Requirements Analysis**

## **1.1 Module objective**

The Role & Permission Management module controls how access is defined and organized across SecureGateControl.

It allows authorized administrators to:

- View the system's modules.
- Manage module records.
- View and manage permission definitions.
- Create, update, activate, deactivate, and inspect roles.
- Assign permissions to roles.
- Remove permissions from roles.
- View a role's effective permissions.
- Control role delegation.
- Control permission delegation.
- Manage role inheritance.
- View role assignments and understand where a role is being used.
- Prevent unauthorized privilege escalation.
- Enforce global versus organization-specific role boundaries.

## **1.2 Scope**

**Included**

Role and Permission Management

**Excluded**

User Management and authentication workflows

| Included in this design              | Not covered by this design       |
| ------------------------------------ | -------------------------------- |
| Module management                    | User creation                    |
| Permission management                | User profile management          |
| Role CRUD                            | Login / logout                   |
| Role activation/deactivation         | Password management              |
| Role permission assignments          | Session management               |
| Role permission removal              | MFA configuration                |
| Delegation rules                     | Invitation lifecycle             |
| Permission delegation grants         | Direct user role assignment APIs |
| Role inheritance                     | User data scope management       |
| Role details & effective permissions | Audit module APIs themselves     |
| Role usage / dependency inspection   | Frontend UI implementation       |

> **Boundary:** User Role Assignment is managed by User Management. This module may expose read-only information about assigned users or role usage, but it will not create or remove user-role assignments.

## **1.3 Primary actors**

| Actor             | Scope                           | Capabilities                                                                  |
| ----------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| SUPER_ADMIN       | Global/system                   | Manage system roles, organization roles, system catalog, all delegation rules |
| ADMIN             | Own organization                | Manage organization custom roles and permitted permissions                    |
| Other staff roles | No management access by default | Access denied unless explicitly authorized                                    |

## **1.4 Authorization assumptions**

These are architecture assumptions based on your existing RBAC model, not additional business requirements.

| Action                                       | SUPER_ADMIN                 | ADMIN                                    |
| -------------------------------------------- | --------------------------- | ---------------------------------------- |
| View modules                                 | Yes                         | Yes                                      |
| Create modules                               | Yes                         | No by default                            |
| Update modules                               | Yes                         | No by default                            |
| Activate/deactivate modules                  | Yes                         | No by default                            |
| View permissions                             | Yes                         | Yes                                      |
| Create permissions                           | Yes                         | No by default                            |
| Update permissions                           | Yes                         | No by default                            |
| Activate/deactivate permissions              | Yes                         | No by default                            |
| View global roles                            | Yes                         | Limited/read-only                        |
| Create global roles                          | Yes                         | No                                       |
| Manage global roles                          | Yes                         | No                                       |
| View own organization roles                  | Yes                         | Yes                                      |
| Create organization roles                    | Yes                         | Yes                                      |
| Update own organization roles                | Yes                         | Yes                                      |
| Delete own custom roles                      | Yes, subject to constraints | Yes, subject to constraints              |
| Assign permissions to global roles           | Yes                         | No                                       |
| Assign permissions to own organization roles | Yes                         | Yes, within allowed grants               |
| Manage role delegation                       | Yes                         | Limited to permitted org rules           |
| Manage permission delegation                 | Yes                         | Limited to authorized grants             |
| Manage role inheritance                      | Yes                         | Only within permitted organization scope |
| View effective permissions                   | Yes                         | Own organization scope                   |

**Important:** The database does not contain a dedicated SUPER_ADMIN/ADMIN permission policy table. These access boundaries must be implemented in the authorization service and ultimately enforced by endpoint-level permission checks and scope validation.

## **1.5 Non-functional requirements**

| Requirement     | Design target                         |
| --------------- | ------------------------------------- |
| Security        | Deny by default                       |
| Data isolation  | Organization-level enforcement        |
| Consistency     | Transactional role-permission updates |
| Performance     | Indexed lookup and pagination         |
| Availability    | Stateless API instances               |
| Maintainability | Domain-based module separation        |
| Extensibility   | Support new modules and permissions   |
| Auditing        | Every privileged mutation audited     |
| Concurrency     | Prevent conflicting updates           |
| Compatibility   | Versioned API contracts               |

# **2. Architecture Overview**

## **2.1 Recommended architecture style**

## **Modular Monolith**

Recommended for SecureGateControl

One application deployment with separate domain modules, service boundaries, repositories, and authorization policies.

I recommend a **modular monolith** instead of microservices for this module.

Reasons:

- Role, permission, delegation, and inheritance operations share the same PostgreSQL database.
- Several operations need atomic transactions.
- Authorization decisions often require multiple RBAC tables.
- Microservices would introduce distributed consistency challenges.
- Your current Next.js architecture can support this cleanly.
- You can separate these modules later if actual scaling requirements justify it.

## **2.2 API base path**

```
/api/v1/rbac
```

The module will be divided into six API resource groups:

```
/api/v1/rbac/modules
/api/v1/rbac/permissions
/api/v1/rbac/roles
/api/v1/rbac/role-permissions
/api/v1/rbac/delegations
/api/v1/rbac/permission-grants
/api/v1/rbac/role-inheritance
```

# **3. High-Level Architecture Diagram**

\#chatgpt-mermaid-\_r_ha\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_ha\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_ha\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_ha\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_ha\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_ha\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_ha\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_ha\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_ha\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_ha\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_ha\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_ha\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_ha\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_ha\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_ha\_ p{margin:0;}#chatgpt-mermaid-\_r_ha\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_ha\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_ha\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_ha\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_ha\_ .label text,#chatgpt-mermaid-\_r_ha\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_ha\_ .node rect,#chatgpt-mermaid-\_r_ha\_ .node circle,#chatgpt-mermaid-\_r_ha\_ .node ellipse,#chatgpt-mermaid-\_r_ha\_ .node polygon,#chatgpt-mermaid-\_r_ha\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_ha\_ .rough-node .label text,#chatgpt-mermaid-\_r_ha\_ .node .label text,#chatgpt-mermaid-\_r_ha\_ .image-shape .label,#chatgpt-mermaid-\_r_ha\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_ha\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_ha\_ .rough-node .label,#chatgpt-mermaid-\_r_ha\_ .node .label,#chatgpt-mermaid-\_r_ha\_ .image-shape .label,#chatgpt-mermaid-\_r_ha\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_ha\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_ha\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_ha\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_ha\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_ha\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_ha\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_ha\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_ha\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_ha\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_ha\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_ha\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_ha\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_ha\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_ha\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_ha\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_ha\_ .icon-shape,#chatgpt-mermaid-\_r_ha\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_ha\_ .icon-shape p,#chatgpt-mermaid-\_r_ha\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_ha\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_ha\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_ha\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_ha\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_ha\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_ha\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_ha\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_ha\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_ha\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ha\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_ha\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ha\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_ha\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_ha\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_ha\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_ha\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_ha\_ .node rect,#chatgpt-mermaid-\_r_ha\_ .node circle,#chatgpt-mermaid-\_r_ha\_ .node ellipse,#chatgpt-mermaid-\_r_ha\_ .node polygon,#chatgpt-mermaid-\_r_ha\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_ha\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_ha\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_ha\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_ha\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_ha\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Admin DashboardNext.js API LayerAuthentication MiddlewareRBAC Authorization GuardScope ResolverRBAC Controller LayerModule ServicePermission ServiceRole ServiceRole Permission ServiceDelegation ServicePermission Grant ServiceRole Inheritance ServiceRepository LayerPostgreSQLAudit Serviceaudit.audit_logs

## **3.1 Request flow**

1. Client sends request with access token.
2. Authentication middleware validates token/session.
3. Authorization guard checks required permission.
4. Organization scope resolver identifies global or organization context.
5. Controller validates route and payload.
6. Service enforces business rules.
7. Repository executes database operations.
8. Transaction commits.
9. Audit record is written for mutation.
10. Standard response is returned.

# **4. Component and Service Breakdown**

Backend structure should follow domain responsibility rather than putting all RBAC logic in one service.

## **4.1 Module services**

| Service                    | Responsibility                                              |
| -------------------------- | ----------------------------------------------------------- |
| `ModuleService`            | Module CRUD, hierarchy validation, activation               |
| `PermissionService`        | Permission CRUD, module validation, permission lifecycle    |
| `RoleService`              | Role CRUD, role scope, status, role details                 |
| `RolePermissionService`    | Attach/detach permissions and resolve effective permissions |
| `DelegationService`        | Manage role delegation policies                             |
| `PermissionGrantService`   | Manage permission delegation grants                         |
| `RoleInheritanceService`   | Manage role inheritance and detect cycles                   |
| `RoleQueryService`         | Role usage, assigned users count, permission summaries      |
| `RbacPolicyService`        | Business rules and security restrictions                    |
| `RbacAuthorizationService` | Permission checks, access enforcement, scope validation     |
| `RbacAuditService`         | Record privileged changes                                   |
| `RbacRepository`           | Database access abstraction                                 |

## **4.2 Suggested folder structure**

```
src/
├── app/
│   └── api/
│       └── v1/
│           └── rbac/
│               ├── modules/
│               ├── permissions/
│               ├── roles/
│               ├── role-permissions/
│               ├── delegations/
│               ├── permission-grants/
│               └── role-inheritance/
│
├── modules/
│   └── rbac/
│       ├── modules/
│       │   ├── module.controller.ts
│       │   ├── module.service.ts
│       │   ├── module.repository.ts
│       │   ├── module.validation.ts
│       │   └── module.types.ts
│       │
│       ├── permissions/
│       │   ├── permission.controller.ts
│       │   ├── permission.service.ts
│       │   ├── permission.repository.ts
│       │   ├── permission.validation.ts
│       │   └── permission.types.ts
│       │
│       ├── roles/
│       │   ├── role.controller.ts
│       │   ├── role.service.ts
│       │   ├── role.repository.ts
│       │   ├── role.validation.ts
│       │   └── role.types.ts
│       │
│       ├── role-permissions/
│       ├── delegations/
│       ├── permission-grants/
│       ├── role-inheritance/
│       │
│       ├── policies/
│       │   ├── role-scope.policy.ts
│       │   ├── permission-assignment.policy.ts
│       │   ├── role-delegation.policy.ts
│       │   ├── role-inheritance.policy.ts
│       │   └── privilege-escalation.policy.ts
│       │
│       ├── shared/
│       │   ├── rbac.types.ts
│       │   ├── rbac.constants.ts
│       │   ├── rbac.errors.ts
│       │   └── rbac.helpers.ts
│       │
│       └── index.ts
│
├── lib/
│   ├── auth/
│   ├── authorization/
│   ├── db/
│   ├── audit/
│   └── validation/
```

# **5. API Endpoint Specification**

## **5.1 API summary**

Complete API inventory

| Group                       | Endpoints | Purpose                                  |
| --------------------------- | --------- | ---------------------------------------- |
| Module Management           | 7         | Manage RBAC module catalog               |
| Permission Management       | 7         | Manage permissions                       |
| Role Management             | 11        | Manage roles                             |
| Role-Permission Management  | 5         | Manage role permission assignments       |
| Delegation Management       | 5         | Manage role delegation rules             |
| Permission Grant Management | 5         | Manage permission delegation             |
| Role Inheritance            | 5         | Manage role inheritance                  |
| Role Insights               | 3         | Inspect usage and permission composition |
| **Total**                   | **48**    |                                          |

Endpoint counts include the proposed API routes, not database objects or frontend pages.

## **A. Module Management APIs**

Database table: `rbac.modules`

Module represents a logical feature group such as User Management, Gate Control, Visitor Management, Reports, or RBAC.

### **Endpoint list**

| # | Method | Endpoint                         | Purpose                                |
| - | ------ | -------------------------------- | -------------------------------------- |
| 1 | GET    | `/modules`                       | List all modules                       |
| 2 | GET    | `/modules/tree`                  | Return hierarchical module tree        |
| 3 | GET    | `/modules/:moduleId`             | Get module details                     |
| 4 | POST   | `/modules`                       | Create a module                        |
| 5 | PATCH  | `/modules/:moduleId`             | Update module metadata                 |
| 6 | PATCH  | `/modules/:moduleId/status`      | Activate/deactivate module             |
| 7 | GET    | `/modules/:moduleId/permissions` | List permissions belonging to a module |

### **1. GET&#x20;**`/modules`

**Purpose:** Retrieve the module catalog with filtering and pagination.

Query parameters:

| Parameter   | Type    | Purpose                       |
| ----------- | ------- | ----------------------------- |
| `search`    | string  | Search by module name or code |
| `isActive`  | boolean | Filter by active state        |
| `parentId`  | UUID    | Filter by parent module       |
| `page`      | number  | Page number                   |
| `limit`     | number  | Items per page                |
| `sortBy`    | string  | Sort field                    |
| `sortOrder` | string  | `asc` / `desc`                |

Example:

```
GET /api/v1/rbac/modules?isActive=true&page=1&limit=20
```

Use case: Admin loads the module catalog.

### **2. GET&#x20;**`/modules/tree`

**Purpose:** Return hierarchical modules using `parent_id`.

Use case: Build the RBAC module hierarchy and navigation structure.

### **3. GET&#x20;**`/modules/:moduleId`

**Purpose:** Fetch complete information about a single module.

### **4. POST&#x20;**`/modules`

**Purpose:** Create a new system module.

Request:

```
{
  "name": "Gate Control",
  "code": "GATE_CONTROL",
  "description": "Gate access control management",
  "parentId": null,
  "icon": "gate",
  "sortOrder": 5
}
```

Rules:

- `code` must be unique.
- `parentId` must reference an existing module if supplied.
- Only SUPER_ADMIN can create modules by default.
- Module code is treated as immutable after creation unless a migration is approved.

### **5. PATCH&#x20;**`/modules/:moduleId`

**Purpose:** Update editable module information.

Editable fields:

- `name`
- `description`
- `parentId`
- `icon`
- `sortOrder`

### **6. PATCH&#x20;**`/modules/:moduleId/status`

**Purpose:** Enable or disable a module.

Request:

```
{
  "isActive": false
}
```

A deactivated module should not be used to grant new permissions. Its impact on existing role permissions must be evaluated before deactivation.

### **7. GET&#x20;**`/modules/:moduleId/permissions`

**Purpose:** Fetch all permissions inside the selected module.

Use case: Display permission checkboxes while editing a role.

## **B. Permission Management APIs**

Database table: `rbac.permissions`

A permission represents an action that can be authorized.

Examples:

```
USER_VIEW
USER_CREATE
USER_UPDATE
USER_DELETE

ROLE_VIEW
ROLE_CREATE
ROLE_UPDATE
ROLE_DELETE

GATE_OPEN
GATE_CLOSE
GATE_STATUS_VIEW
```

### **Endpoint list**

| #  | Method | Endpoint                            | Purpose                           |
| -- | ------ | ----------------------------------- | --------------------------------- |
| 8  | GET    | `/permissions`                      | List permissions                  |
| 9  | GET    | `/permissions/:permissionId`        | Get permission details            |
| 10 | POST   | `/permissions`                      | Create permission                 |
| 11 | PATCH  | `/permissions/:permissionId`        | Update permission metadata        |
| 12 | PATCH  | `/permissions/:permissionId/status` | Activate/deactivate permission    |
| 13 | GET    | `/permissions/:permissionId/roles`  | Get roles containing permission   |
| 14 | GET    | `/permissions/catalog`              | Return grouped permission catalog |

### **8. GET&#x20;**`/permissions`

**Purpose:** Retrieve permissions with filters.

Query parameters:

| Parameter  | Type    | Purpose                     |
| ---------- | ------- | --------------------------- |
| `moduleId` | UUID    | Filter by module            |
| `search`   | string  | Search permission name/code |
| `isActive` | boolean | Filter active/inactive      |
| `page`     | number  | Page                        |
| `limit`    | number  | Page size                   |

Example:

```
GET /api/v1/rbac/permissions?moduleId=uuid&isActive=true&page=1&limit=50
```

### **9. GET&#x20;**`/permissions/:permissionId`

**Purpose:** Get a permission's complete definition.

Response includes its module details and current status.

### **10. POST&#x20;**`/permissions`

**Purpose:** Create a new permission.

Request:

```
{
  "moduleId": "MODULE_UUID",
  "name": "Open Gate",
  "code": "GATE_OPEN",
  "description": "Allows authorized users to issue gate-open commands"
}
```

Validation:

- Module must exist.
- Module must be active.
- Permission code must be unique.
- Code must follow naming conventions.
- Permission creation is SUPER_ADMIN-only by default.

### **11. PATCH&#x20;**`/permissions/:permissionId`

**Purpose:** Update permission metadata.

Editable:

- `name`
- `description`
- `moduleId` (recommended to avoid changing after permissions are used; restricted if allowed)

The permission code should not be casually renamed because it may be referenced by backend policies and frontend permission checks.

### **12. PATCH&#x20;**`/permissions/:permissionId/status`

**Purpose:** Enable or disable a permission.

Request:

```
{
  "isActive": false
}
```

Deactivation should prevent new authorization grants and make the permission unavailable for effective access. The implementation must define whether existing role-permission links are retained or removed. **Recommendation: retain links but exclude inactive permissions from authorization decisions**, preserving historical configuration.

### **13. GET&#x20;**`/permissions/:permissionId/roles`

**Purpose:** Find roles associated with a permission.

Use cases:

- Determine the impact of deactivating a permission.
- View which roles have a particular capability.
- Prevent accidental security-impacting changes.

### **14. GET&#x20;**`/permissions/catalog`

**Purpose:** Return permissions grouped by module.

Example use case: Role editor displays a permission tree, with checkboxes grouped by modules.

## **C. Role Management APIs**

Database table: `rbac.roles`

This is the core of the module.

A role is an authorization bundle. Permissions are attached to roles, and users receive roles through the User Management module.

### **Endpoint list**

| #  | Method | Endpoint                               | Purpose                        |
| -- | ------ | -------------------------------------- | ------------------------------ |
| 15 | GET    | `/roles`                               | List roles                     |
| 16 | GET    | `/roles/:roleId`                       | Get role details               |
| 17 | POST   | `/roles`                               | Create a role                  |
| 18 | PATCH  | `/roles/:roleId`                       | Update role metadata           |
| 19 | PATCH  | `/roles/:roleId/status`                | Activate/deactivate role       |
| 20 | DELETE | `/roles/:roleId`                       | Delete custom role             |
| 21 | GET    | `/roles/:roleId/permissions`           | Get direct permissions         |
| 22 | GET    | `/roles/:roleId/effective-permissions` | Get effective permissions      |
| 23 | GET    | `/roles/:roleId/users`                 | View users assigned to role    |
| 24 | GET    | `/roles/:roleId/delegations`           | View delegation rules for role |
| 25 | GET    | `/roles/:roleId/summary`               | Get complete role summary      |

### **15. GET&#x20;**`/roles`

**Purpose:** List roles visible to the current administrator.

Query parameters:

| Parameter        | Type    | Purpose                   |
| ---------------- | ------- | ------------------------- |
| `search`         | string  | Search role name/code     |
| `organizationId` | UUID    | Organization filter       |
| `scope`          | string  | `GLOBAL` / `ORGANIZATION` |
| `roleType`       | string  | `SYSTEM` / `CUSTOM`       |
| `isActive`       | boolean | Status filter             |
| `page`           | integer | Page number               |
| `limit`          | integer | Page size                 |
| `sortBy`         | string  | Sorting field             |
| `sortOrder`      | string  | Sorting order             |

Scope rules:

- SUPER_ADMIN can view global roles and organization roles within authorized system scope.
- ADMIN is automatically restricted to their active organization.
- ADMIN cannot override scope by passing another organization ID.
- Global roles should not be exposed with sensitive management capabilities to ADMIN.

Example:

```
GET /api/v1/rbac/roles?scope=ORGANIZATION&isActive=true&page=1&limit=20
```

### **16. GET&#x20;**`/roles/:roleId`

**Purpose:** Fetch role details.

Returns:

- Role metadata.
- Role scope.
- Organization information when scoped.
- Role type.
- System role flag.
- Active state.
- Created/updated information.
- Permission count.
- Assigned user count, if authorized.

### **17. POST&#x20;**`/roles`

**Purpose:** Create a role.

Request:

```
{
  "name": "Receptionist",
  "code": "RECEPTIONIST",
  "description": "Handles visitor registration and reception operations",
  "organizationId": "ORG_UUID"
}
```

Rules:

- `organizationId = null` indicates a global role, allowed only for SUPER_ADMIN.
- Organization roles must reference a valid organization.
- ADMIN can create roles only within their active organization.
- ADMIN-created roles must be `CUSTOM`.
- Role codes must be unique within scope.
- ADMIN cannot create roles that grant permissions beyond their delegation policy.
- System role creation is restricted.

### **18. PATCH&#x20;**`/roles/:roleId`

**Purpose:** Update role metadata.

Request:

```
{
  "name": "Front Desk Receptionist",
  "description": "Handles visitor registration, visitor records, and reception operations"
}
```

Rules:

- Role scope cannot be changed from global to organization or vice versa through normal update.
- System role fields cannot be manipulated by ADMIN.
- `code` is immutable by default.
- Role ownership must be validated before mutation.

### **19. PATCH&#x20;**`/roles/:roleId/status`

**Purpose:** Activate or deactivate a role.

Request:

```
{
  "isActive": false
}
```

Business rules:

- Inactive roles cannot be assigned to new users.
- Existing user-role assignments are not automatically deleted.
- The authorization engine must stop honoring inactive roles.
- Deactivation should generate an audit event.
- Warn the administrator if the role is assigned to users.

### **20. DELETE&#x20;**`/roles/:roleId`

**Purpose:** Delete an organization custom role that is no longer needed.

Rules:

- System roles cannot be deleted.
- Roles assigned to users cannot be deleted.
- Roles referenced in delegation, inheritance, or permission grant structures cannot be deleted without resolving dependencies.
- Organization administrators may delete only roles in their organization.
- Recommended implementation: use soft deletion or deactivation instead of physical deletion where possible.

### **21. GET&#x20;**`/roles/:roleId/permissions`

**Purpose:** Retrieve the permissions directly attached to a role.

Returns direct grants only—not inherited permissions.

Use case: Role editor loads currently selected permissions.

### **22. GET&#x20;**`/roles/:roleId/effective-permissions`

**Purpose:** Return the complete permission set that applies to a role, including direct grants and inherited grants if inheritance is enabled.

Example:

```
{
  "roleId": "ROLE_UUID",
  "directPermissions": [],
  "inheritedPermissions": [],
  "effectivePermissions": [],
  "permissionCount": 0
}
```

### **23. GET&#x20;**`/roles/:roleId/users`

**Purpose:** View users currently assigned to the role.

Read-only dependency with User Management.

Use cases:

- Understand role impact.
- Warn before deactivation.
- Review assigned users.

### **24. GET&#x20;**`/roles/:roleId/delegations`

**Purpose:** Get delegations where this role is involved.

Can return:

- Roles it is permitted to manage.
- Roles it is permitted to assign.
- Roles it is permitted to create users for.
- Delegation status.

### **25. GET&#x20;**`/roles/:roleId/summary`

**Purpose:** Retrieve a consolidated view of a role.

This is a dashboard/detail endpoint to reduce frontend requests.

Includes:

- Role metadata.
- Direct permissions.
- Effective permissions.
- Inherited roles.
- Delegation policies.
- Permission delegation grants.
- User assignment summary.
- Role usage and dependency information.

## **D. Role-Permission Assignment APIs**

Database table: `rbac.role_permissions`

These APIs manage which permissions are assigned directly to a role.

### **Endpoint list**

| #  | Method | Endpoint                                   | Purpose                                     |
| -- | ------ | ------------------------------------------ | ------------------------------------------- |
| 26 | GET    | `/roles/:roleId/permissions`               | List assigned permissions                   |
| 27 | PUT    | `/roles/:roleId/permissions`               | Replace the role's permission set           |
| 28 | POST   | `/roles/:roleId/permissions`               | Add permissions to role                     |
| 29 | DELETE | `/roles/:roleId/permissions/:permissionId` | Remove one permission                       |
| 30 | POST   | `/roles/:roleId/permissions/validate`      | Validate proposed permissions before saving |

Important design decision

Endpoint `PUT` and `POST` have different meanings:

- `PUT` replaces the complete permission assignment.
- `POST` adds permissions without removing existing permissions.

This prevents accidental permission removal during incremental updates.

### **26. GET&#x20;**`/roles/:roleId/permissions`

**Purpose:** Retrieve the permission set currently attached to a role.

Example:

```
GET /api/v1/rbac/roles/ROLE_UUID/permissions
```

Use case: Load a role's current permissions in the role editor.

### **27. PUT&#x20;**`/roles/:roleId/permissions`

**Purpose:** Replace all direct permissions assigned to the role.

Request:

```
{
  "permissionIds": [
    "PERMISSION_UUID_1",
    "PERMISSION_UUID_2",
    "PERMISSION_UUID_3"
  ]
}
```

Use case:

Administrator opens a role's permission editor, selects the desired permissions, and saves the complete selection.

Recommended implementation:

- Validate every permission.
- Validate role scope.
- Validate administrator authority.
- Validate delegation constraints.
- Validate system-role protection.
- Run the replacement in a database transaction.
- Remove old assignments not in the request.
- Insert missing assignments.
- Preserve assignments that are unchanged.
- Record the before/after state in audit logs.

### **28. POST&#x20;**`/roles/:roleId/permissions`

**Purpose:** Add permissions to a role without removing existing permissions.

Request:

```
{
  "permissionIds": [
    "PERMISSION_UUID_1",
    "PERMISSION_UUID_2"
  ]
}
```

Use case: Add two permissions to a role while retaining all previous permissions.

### **29. DELETE&#x20;**`/roles/:roleId/permissions/:permissionId`

**Purpose:** Remove a specific permission from a role.

Use case: Revoke a single capability from a role.

### **30. POST&#x20;**`/roles/:roleId/permissions/validate`

**Purpose:** Validate the permission assignment before committing.

Request:

```
{
  "permissionIds": [
    "PERMISSION_UUID_1",
    "PERMISSION_UUID_2"
  ]
}
```

Returns:

- Whether the assignment is valid.
- Invalid permissions.
- Inactive permissions.
- Unauthorized permissions.
- Scope violations.
- Privilege escalation warnings.
- Inheritance conflicts, if applicable.

This is particularly useful for a permission-selection UI because the frontend can validate a proposed configuration before saving.

## **E. Role Delegation APIs**

Database table: `rbac.role_delegations`

This table controls which role can manage, create users for, or assign another role within an organization.

### **Endpoint list**

| #  | Method | Endpoint                     | Purpose                        |
| -- | ------ | ---------------------------- | ------------------------------ |
| 31 | GET    | `/delegations`               | List delegation rules          |
| 32 | POST   | `/delegations`               | Create a delegation rule       |
| 33 | GET    | `/delegations/:delegationId` | Get delegation detail          |
| 34 | PATCH  | `/delegations/:delegationId` | Update delegation capabilities |
| 35 | DELETE | `/delegations/:delegationId` | Remove delegation rule         |

### **31. GET&#x20;**`/delegations`

**Purpose:** List role delegation policies.

Query parameters:

- `organizationId`
- `delegatorRoleId`
- `targetRoleId`
- `isActive`
- `page`
- `limit`

ADMIN must be restricted to their organization.

### **32. POST&#x20;**`/delegations`

**Purpose:** Define a role delegation relationship.

Request:

```
{
  "organizationId": "ORG_UUID",
  "delegatorRoleId": "ROLE_A_UUID",
  "targetRoleId": "ROLE_B_UUID",
  "canCreateUsers": true,
  "canAssignRole": true,
  "canManageUsers": false
}
```

Meaning:

| Field            | Meaning                                                                           |
| ---------------- | --------------------------------------------------------------------------------- |
| `canCreateUsers` | Delegator may create users with the target role, subject to User Management rules |
| `canAssignRole`  | Delegator may assign the target role to eligible users                            |
| `canManageUsers` | Delegator may manage users who have the target role, subject to applicable policy |

### **33. GET&#x20;**`/delegations/:delegationId`

**Purpose:** Retrieve a specific delegation policy.

### **34. PATCH&#x20;**`/delegations/:delegationId`

**Purpose:** Change delegation capabilities.

Request:

```
{
  "canCreateUsers": false,
  "canAssignRole": true,
  "canManageUsers": true,
  "isActive": true
}
```

### **35. DELETE&#x20;**`/delegations/:delegationId`

**Purpose:** Remove a delegation policy.

Use soft removal or `isActive=false` policy where historical auditability is required. The current table supports deactivation; it does not contain a deleted/status field other than `is_active`.

## **F. Permission Delegation Grant APIs**

Database table: `rbac.role_permission_grants`

This controls which permissions a delegator role is allowed to grant to a target role.

### **Endpoint list**

| #  | Method | Endpoint                      | Purpose                            |
| -- | ------ | ----------------------------- | ---------------------------------- |
| 36 | GET    | `/permission-grants`          | List permission grants             |
| 37 | POST   | `/permission-grants`          | Create a permission grant          |
| 38 | GET    | `/permission-grants/:grantId` | Get grant detail                   |
| 39 | DELETE | `/permission-grants/:grantId` | Remove permission grant            |
| 40 | POST   | `/permission-grants/validate` | Validate permission grant proposal |

### **36. GET&#x20;**`/permission-grants`

**Purpose:** List grants allowing one role to delegate permissions to another role.

Query parameters:

- `delegatorRoleId`
- `targetRoleId`
- `permissionId`
- `organizationId`

### **37. POST&#x20;**`/permission-grants`

**Purpose:** Grant permission delegation authority.

Request:

```
{
  "delegatorRoleId": "ROLE_A_UUID",
  "targetRoleId": "ROLE_B_UUID",
  "permissionId": "PERMISSION_UUID"
}
```

### **38. GET&#x20;**`/permission-grants/:grantId`

**Purpose:** Retrieve details of an individual grant.

### **39. DELETE&#x20;**`/permission-grants/:grantId`

**Purpose:** Revoke permission delegation authority.

This does not necessarily remove the permission from the target role itself. It removes the authority to delegate that permission through this rule.

### **40. POST&#x20;**`/permission-grants/validate`

**Purpose:** Validate whether a proposed permission delegation grant is allowed.

Request:

```
{
  "delegatorRoleId": "ROLE_A_UUID",
  "targetRoleId": "ROLE_B_UUID",
  "permissionIds": [
    "PERMISSION_UUID_1",
    "PERMISSION_UUID_2"
  ]
}
```

## **G. Role Inheritance APIs**

Database table: `rbac.role_inheritance`

Role inheritance allows a parent role to inherit permissions from another role, according to the inheritance direction defined by the implementation.

### **Endpoint list**

| #  | Method | Endpoint                           | Purpose                         |
| -- | ------ | ---------------------------------- | ------------------------------- |
| 41 | GET    | `/role-inheritance`                | List inheritance relationships  |
| 42 | POST   | `/role-inheritance`                | Create inheritance relationship |
| 43 | GET    | `/role-inheritance/:inheritanceId` | Get relationship details        |
| 44 | DELETE | `/role-inheritance/:inheritanceId` | Remove inheritance              |
| 45 | POST   | `/role-inheritance/validate`       | Validate inheritance proposal   |

### **41. GET&#x20;**`/role-inheritance`

**Purpose:** Retrieve role inheritance relationships.

Query parameters:

- `parentRoleId`
- `childRoleId`
- `organizationId`

### **42. POST&#x20;**`/role-inheritance`

**Purpose:** Create a relationship between two roles.

Request:

```
{
  "parentRoleId": "ROLE_PARENT_UUID",
  "childRoleId": "ROLE_CHILD_UUID"
}
```

**Recommended semantic definition:** The `childRoleId` inherits permissions from `parentRoleId`.

Example:

```
Receptionist
    ↑ inherits from
VisitorManagementOperator
```

The inheritance direction must be clearly defined in code and documentation. Otherwise, developers may implement the inverse relationship.

### **43. GET&#x20;**`/role-inheritance/:inheritanceId`

**Purpose:** Retrieve a specific inheritance relationship.

### **44. DELETE&#x20;**`/role-inheritance/:inheritanceId`

**Purpose:** Remove the relationship between two roles.

### **45. POST&#x20;**`/role-inheritance/validate`

**Purpose:** Validate inheritance before creation.

Request:

```
{
  "parentRoleId": "ROLE_PARENT_UUID",
  "childRoleId": "ROLE_CHILD_UUID"
}
```

Validation must detect:

- Self-inheritance.
- Circular inheritance.
- Cross-organization inheritance.
- Inactive roles.
- System-role restrictions.
- Invalid scope relationships.

## **H. Role Insights & Dependency APIs**

These are read-only APIs used to understand the impact of RBAC configuration changes.

| #  | Method | Endpoint                            | Purpose                          |
| -- | ------ | ----------------------------------- | -------------------------------- |
| 46 | GET    | `/roles/:roleId/usage`              | View role usage and dependencies |
| 47 | GET    | `/permissions/:permissionId/impact` | Analyze permission impact        |
| 48 | GET    | `/roles/permission-matrix`          | View role-permission matrix      |

### **46. GET&#x20;**`/roles/:roleId/usage`

**Purpose:** Determine where a role is currently being used.

Response may include:

- Assigned user count.
- Active assignment count.
- Direct permission count.
- Inherited permission count.
- Delegation relationship count.
- Inheritance relationship count.

### **47. GET&#x20;**`/permissions/:permissionId/impact`

**Purpose:** Determine what may be affected by a permission change.

Response may include:

- Roles directly containing the permission.
- Roles inheriting the permission.
- Total affected roles.
- Total users potentially affected.
- Permission status.

Use this before permission deactivation or removal.

### **48. GET&#x20;**`/roles/permission-matrix`

**Purpose:** Return a role-permission matrix for administrative comparison.

Query parameters:

- `organizationId`
- `moduleId`
- `roleIds`
- `page`
- `limit`

Use case: A security administrator compares permissions across multiple roles.

# **6. Request and Response Examples**

## **6.1 Standard success response**

All APIs should follow one response format.

### **Single resource**

```
{
  "success": true,
  "message": "Role retrieved successfully",
  "data": {
    "id": "b3e05ec9-6f90-4e24-a74c-1020e5f4d114",
    "name": "Receptionist",
    "code": "RECEPTIONIST",
    "roleType": "CUSTOM",
    "isSystem": false,
    "isActive": true,
    "organizationId": "8efca4e8-cf21-4f32-88f8-445a2d30a6a4",
    "createdAt": "2026-11-27T07:00:00.000Z",
    "updatedAt": "2026-11-27T07:00:00.000Z"
  },
  "meta": null
}
```

## **6.2 Paginated response**

```
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": "ROLE_UUID_1",
      "name": "Receptionist",
      "code": "RECEPTIONIST",
      "roleType": "CUSTOM",
      "isActive": true
    },
    {
      "id": "ROLE_UUID_2",
      "name": "Gate Operator",
      "code": "GATE_OPERATOR",
      "roleType": "CUSTOM",
      "isActive": true
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 42,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

## **6.3 Role creation response**

`POST /roles`

```
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": "NEW_ROLE_UUID",
    "name": "Visitor Operator",
    "code": "VISITOR_OPERATOR",
    "description": "Handles visitor management operations",
    "organizationId": "ORG_UUID",
    "roleType": "CUSTOM",
    "isSystem": false,
    "isActive": true,
    "createdAt": "2026-11-27T07:00:00.000Z"
  },
  "meta": null
}
```

## **6.4 Permission assignment response**

`PUT /roles/:roleId/permissions`

```
{
  "success": true,
  "message": "Role permissions updated successfully",
  "data": {
    "roleId": "ROLE_UUID",
    "addedCount": 3,
    "removedCount": 2,
    "totalPermissions": 8,
    "permissions": [
      {
        "id": "PERMISSION_UUID",
        "code": "VISITOR_VIEW",
        "name": "View Visitors"
      },
      {
        "id": "PERMISSION_UUID",
        "code": "VISITOR_CREATE",
        "name": "Create Visitor"
      }
    ]
  },
  "meta": null
}
```

## **6.5 Permission validation response**

`POST /roles/:roleId/permissions/validate`

```
{
  "success": true,
  "message": "Permission assignment validation completed",
  "data": {
    "valid": false,
    "requestedCount": 4,
    "validCount": 3,
    "invalidCount": 1,
    "invalidPermissions": [
      {
        "permissionId": "PERMISSION_UUID",
        "code": "SYSTEM_SETTINGS_UPDATE",
        "reason": "Permission is outside the administrator's permitted delegation scope"
      }
    ],
    "warnings": [
      "This role is currently assigned to 12 users."
    ]
  },
  "meta": null
}
```

## **6.6 Error response format**

Every API must return a predictable error contract.

```
{
  "success": false,
  "message": "Permission assignment failed",
  "error": {
    "code": "RBAC_PERMISSION_ASSIGNMENT_DENIED",
    "details": [
      {
        "field": "permissionIds",
        "reason": "One or more permissions cannot be assigned by the current administrator"
      }
    ]
  },
  "meta": {
    "requestId": "req_01JXYZ123"
  }
}
```

## **6.7 Validation rules**

| Field            | Rule                                                  |
| ---------------- | ----------------------------------------------------- |
| UUID             | Valid UUID format                                     |
| `name`           | Required, trimmed, length 1–150                       |
| `code`           | Required, uppercase underscore naming, length 1–100   |
| `description`    | Optional, bounded length                              |
| `organizationId` | Required for organization role creation               |
| `permissionIds`  | Array of valid UUIDs, deduplicated                    |
| `isActive`       | Boolean                                               |
| `sortOrder`      | Integer, bounded                                      |
| `page`           | Positive integer                                      |
| `limit`          | 1–100, default 20                                     |
| `parentId`       | Valid UUID, no cycles                                 |
| `roleId`         | Must exist, be active where required, and match scope |

# **7. Database and Data Model Design**

This architecture uses your existing PostgreSQL schema. No new tables are required for the core endpoint catalog.

## **7.1 Database mapping**

| API Group             | Database Tables                                                   |
| --------------------- | ----------------------------------------------------------------- |
| Module APIs           | `rbac.modules`                                                    |
| Permission APIs       | `rbac.permissions`, `rbac.modules`                                |
| Role APIs             | `rbac.roles`                                                      |
| Role-Permission APIs  | `rbac.role_permissions`, `rbac.roles`, `rbac.permissions`         |
| Delegation APIs       | `rbac.role_delegations`, `rbac.roles`                             |
| Permission Grant APIs | `rbac.role_permission_grants`                                     |
| Role Inheritance APIs | `rbac.role_inheritance`, `rbac.roles`                             |
| Role Insights         | Role-related tables, `core.user_organizations`, `rbac.user_roles` |

## **7.2 Relationships**

\#chatgpt-mermaid-\_r_m2\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_m2\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_m2\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_m2\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_m2\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_m2\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_m2\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_m2\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_m2\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_m2\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_m2\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_m2\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_m2\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_m2\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_m2\_ p{margin:0;}#chatgpt-mermaid-\_r_m2\_ .entityBox{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_m2\_ .relationshipLabelBox{fill:rgb(243, 243, 243);opacity:0.7;background-color:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_m2\_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-\_r_m2\_ .labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_m2\_ .edgeLabel{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_m2\_ .edgeLabel .label rect{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_m2\_ .edgeLabel .label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_m2\_ .edgeLabel .label{fill:rgb(83, 154, 248);font-size:14px;}#chatgpt-mermaid-\_r_m2\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_m2\_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-\_r_m2\_ .node rect,#chatgpt-mermaid-\_r_m2\_ .node circle,#chatgpt-mermaid-\_r_m2\_ .node ellipse,#chatgpt-mermaid-\_r_m2\_ .node polygon{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_m2\_ .relationshipLine{stroke:rgb(143, 143, 143);stroke-width:1px;fill:none;}#chatgpt-mermaid-\_r_m2\_ .marker{fill:none!important;stroke:rgb(143, 143, 143)!important;stroke-width:1;}#chatgpt-mermaid-\_r_m2\_ [data-look=neo].labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_m2\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_m2\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_m2\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_m2\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_m2\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_m2\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_m2\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_m2\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}MODULESPERMISSIONSROUTE_PERMISSIONSROLESROLE_PERMISSIONSROLE_DELEGATIONSROLE_PERMISSION_GRANTSROLE_INHERITANCEORGANIZATIONScontainsmapshasassigneddelegator_or_targetdelegator_or_targetparent_or_childowns

## **7.3 Key indexes**

Your schema already contains several relevant indexes. These should be used by the API query design.

| Table                         | Existing index                    | Purpose                         |
| ----------------------------- | --------------------------------- | ------------------------------- |
| `rbac.modules`                | `idx_modules_parent`              | Module tree                     |
| `rbac.permissions`            | `idx_permissions_module`          | Permission listing by module    |
| `rbac.permissions`            | `idx_permissions_active`          | Active permission filtering     |
| `rbac.roles`                  | `idx_roles_organization`          | Organization role listing       |
| `rbac.roles`                  | `idx_roles_active`                | Active role filtering           |
| `rbac.role_permissions`       | `idx_role_permissions_role`       | Role permissions lookup         |
| `rbac.role_permissions`       | `idx_role_permissions_permission` | Reverse permission lookup       |
| `rbac.role_delegations`       | `idx_role_delegations_delegator`  | Delegation listing              |
| `rbac.role_delegations`       | `idx_role_delegations_target`     | Target role lookup              |
| `rbac.role_permission_grants` | `idx_permission_grants_delegator` | Grant lookup                    |
| `rbac.role_inheritance`       | `idx_role_inheritance_child`      | Parent/child inheritance lookup |

## **7.4 Recommended additional indexes**

Only add these after checking query plans and actual workload.

```
-- List organization roles sorted by name
CREATE INDEX idx_roles_org_name
ON rbac.roles (organization_id, name);

-- Role permission lookup using role ID and permission ID
CREATE INDEX idx_role_permissions_lookup
ON rbac.role_permissions (role_id, permission_id);

-- Permission filtering by module and active state
CREATE INDEX idx_permissions_module_active
ON rbac.permissions (module_id, is_active);

-- Active delegations for organization and delegator
CREATE INDEX idx_delegations_org_active
ON rbac.role_delegations (organization_id, is_active, delegator_role_id);

-- Role inheritance lookup by parent
CREATE INDEX idx_role_inheritance_parent
ON rbac.role_inheritance (parent_role_id);
```

Some indexes may duplicate existing unique indexes or be unnecessary. Evaluate using `EXPLAIN (ANALYZE, BUFFERS)` before adding them.

## **7.5 Transaction boundaries**

These operations must use database transactions:

- Create role.
- Delete role after dependency validation.
- Replace role permissions.
- Add role permissions in bulk.
- Create/update/delete delegations.
- Create/revoke permission grants.
- Create/delete inheritance relationships.

A role-permission replacement must be atomic.

# **8. Authentication and Authorization Strategy**

## **8.1 Authentication**

All management APIs require an authenticated user.

```
Client
  │
  │ Authorization: Bearer <access_token>
  ▼
Authentication Middleware
  │
  ├── Validate JWT signature
  ├── Validate expiration
  ├── Validate issuer / audience
  ├── Validate session or revocation policy
  └── Load authenticated principal
```

For SecureGateControl, retain your existing cookie-based JWT authentication architecture. The API contract below uses `Bearer` notation to explain the authentication requirement; your implementation may extract the token from the secure cookie rather than the Authorization header.

## **8.2 Authorization layers**

Authorization should not be a single check.

## **Four-layer RBAC enforcement**

**Layer 1 — Authentication**

Is the requester a valid authenticated user?

**Layer 2 — Endpoint permission**

Does the user possess the required permission?

**Layer 3 — Scope authorization**

Is the requested role/resource within the user's global or organization scope?

**Layer 4 — Business policy**

Is the action permitted under delegation, system-role protection, and privilege-escalation rules?

## **8.3 Permission naming conventions**

I recommend a consistent permission code naming convention:

```
RBAC_MODULE_VIEW
RBAC_MODULE_CREATE
RBAC_MODULE_UPDATE
RBAC_MODULE_STATUS_UPDATE

RBAC_PERMISSION_VIEW
RBAC_PERMISSION_CREATE
RBAC_PERMISSION_UPDATE
RBAC_PERMISSION_STATUS_UPDATE

RBAC_ROLE_VIEW
RBAC_ROLE_CREATE
RBAC_ROLE_UPDATE
RBAC_ROLE_DELETE
RBAC_ROLE_STATUS_UPDATE

RBAC_ROLE_PERMISSION_VIEW
RBAC_ROLE_PERMISSION_ASSIGN
RBAC_ROLE_PERMISSION_REMOVE
RBAC_ROLE_PERMISSION_VALIDATE

RBAC_DELEGATION_VIEW
RBAC_DELEGATION_CREATE
RBAC_DELEGATION_UPDATE
RBAC_DELEGATION_DELETE

RBAC_PERMISSION_GRANT_VIEW
RBAC_PERMISSION_GRANT_CREATE
RBAC_PERMISSION_GRANT_DELETE

RBAC_ROLE_INHERITANCE_VIEW
RBAC_ROLE_INHERITANCE_CREATE
RBAC_ROLE_INHERITANCE_DELETE
RBAC_ROLE_INHERITANCE_VALIDATE

RBAC_ROLE_USAGE_VIEW
RBAC_PERMISSION_IMPACT_VIEW
RBAC_PERMISSION_MATRIX_VIEW
```

These codes are **recommended permission definitions** to be registered in your existing `rbac.permissions` table. They are not new database columns.

## **8.4 Permission-to-endpoint mapping**

| Permission                       | Endpoint access                 |
| -------------------------------- | ------------------------------- |
| `RBAC_MODULE_VIEW`               | GET module endpoints            |
| `RBAC_MODULE_CREATE`             | POST modules                    |
| `RBAC_MODULE_UPDATE`             | PATCH module metadata           |
| `RBAC_MODULE_STATUS_UPDATE`      | PATCH module status             |
| `RBAC_PERMISSION_VIEW`           | GET permission endpoints        |
| `RBAC_PERMISSION_CREATE`         | POST permissions                |
| `RBAC_PERMISSION_UPDATE`         | PATCH permission metadata       |
| `RBAC_PERMISSION_STATUS_UPDATE`  | PATCH permission status         |
| `RBAC_ROLE_VIEW`                 | GET roles and role details      |
| `RBAC_ROLE_CREATE`               | POST roles                      |
| `RBAC_ROLE_UPDATE`               | PATCH roles                     |
| `RBAC_ROLE_DELETE`               | DELETE roles                    |
| `RBAC_ROLE_STATUS_UPDATE`        | PATCH role status               |
| `RBAC_ROLE_PERMISSION_VIEW`      | GET role permission endpoints   |
| `RBAC_ROLE_PERMISSION_ASSIGN`    | PUT/POST permission assignments |
| `RBAC_ROLE_PERMISSION_REMOVE`    | DELETE role permission          |
| `RBAC_ROLE_PERMISSION_VALIDATE`  | POST validation endpoint        |
| `RBAC_DELEGATION_VIEW`           | GET delegation endpoints        |
| `RBAC_DELEGATION_CREATE`         | POST delegation                 |
| `RBAC_DELEGATION_UPDATE`         | PATCH delegation                |
| `RBAC_DELEGATION_DELETE`         | DELETE delegation               |
| `RBAC_PERMISSION_GRANT_VIEW`     | GET permission grant endpoints  |
| `RBAC_PERMISSION_GRANT_CREATE`   | POST permission grants          |
| `RBAC_PERMISSION_GRANT_DELETE`   | DELETE permission grants        |
| `RBAC_ROLE_INHERITANCE_VIEW`     | GET inheritance endpoints       |
| `RBAC_ROLE_INHERITANCE_CREATE`   | POST inheritance                |
| `RBAC_ROLE_INHERITANCE_DELETE`   | DELETE inheritance              |
| `RBAC_ROLE_INHERITANCE_VALIDATE` | POST inheritance validation     |
| `RBAC_ROLE_USAGE_VIEW`           | GET role usage                  |
| `RBAC_PERMISSION_IMPACT_VIEW`    | GET permission impact           |
| `RBAC_PERMISSION_MATRIX_VIEW`    | GET permission matrix           |

## **8.5 Scope enforcement**

SUPER_ADMIN

```
Global context:
  organizationId = NULL

Can manage:
  Global system roles
  System permission catalog
  Organization roles
  Organization RBAC configuration
```

ADMIN

```
Organization context:
  organizationId = Active organization

Can manage:
  Organization-specific custom roles
  Permissions allowed by delegation policy
  Delegation rules allowed within own organization
```

Never trust the client-provided `organizationId` alone. Resolve the user's active organization from their authenticated context and verify membership/authority.

# **9. Error Handling Strategy**

## **9.1 Standard HTTP status codes**

| HTTP                        | Use                                           |
| --------------------------- | --------------------------------------------- |
| `200 OK`                    | Successful retrieval/update                   |
| `201 Created`               | Resource created                              |
| `204 No Content`            | Successful removal with no response body      |
| `400 Bad Request`           | Invalid request structure or query            |
| `401 Unauthorized`          | Missing or invalid authentication             |
| `403 Forbidden`             | Authenticated, but not allowed                |
| `404 Not Found`             | Resource not found or intentionally concealed |
| `409 Conflict`              | Duplicate, dependency, or state conflict      |
| `422 Unprocessable Content` | Business rule validation failed               |
| `429 Too Many Requests`     | Rate limit exceeded                           |
| `500 Internal Server Error` | Unexpected server error                       |
| `503 Service Unavailable`   | Temporarily unavailable                       |

## **9.2 RBAC error codes**

| Error code                          | Meaning                                   |
| ----------------------------------- | ----------------------------------------- |
| `RBAC_MODULE_NOT_FOUND`             | Module does not exist                     |
| `RBAC_PERMISSION_NOT_FOUND`         | Permission does not exist                 |
| `RBAC_ROLE_NOT_FOUND`               | Role does not exist                       |
| `RBAC_ROLE_CODE_EXISTS`             | Role code already exists in scope         |
| `RBAC_PERMISSION_CODE_EXISTS`       | Permission code already exists            |
| `RBAC_MODULE_CODE_EXISTS`           | Module code already exists                |
| `RBAC_SCOPE_MISMATCH`               | Global/org scope mismatch                 |
| `RBAC_ORGANIZATION_ACCESS_DENIED`   | Unauthorized organization                 |
| `RBAC_SYSTEM_ROLE_PROTECTED`        | System role modification prohibited       |
| `RBAC_PERMISSION_ASSIGNMENT_DENIED` | Permission assignment prohibited          |
| `RBAC_DELEGATION_NOT_ALLOWED`       | Delegation operation prohibited           |
| `RBAC_ROLE_IN_USE`                  | Role cannot be deleted because it is used |
| `RBAC_PERMISSION_IN_USE`            | Permission has dependencies               |
| `RBAC_INHERITANCE_CYCLE`            | Circular inheritance detected             |
| `RBAC_INACTIVE_MODULE`              | Module is inactive                        |
| `RBAC_INACTIVE_PERMISSION`          | Permission is inactive                    |
| `RBAC_INACTIVE_ROLE`                | Role is inactive                          |
| `RBAC_CONCURRENT_MODIFICATION`      | Concurrent update conflict                |
| `RBAC_VALIDATION_FAILED`            | Business validation failure               |

## **9.3 Conflict example**

```
{
  "success": false,
  "message": "Role cannot be deleted because it is assigned to users",
  "error": {
    "code": "RBAC_ROLE_IN_USE",
    "details": [
      {
        "field": "roleId",
        "reason": "The role is currently assigned to 8 users"
      }
    ]
  },
  "meta": {
    "requestId": "req_01JXYZ"
  }
}
```

# **10. Scalability and Performance Considerations**

## **10.1 Stateless API**

All API instances should be stateless.

\#chatgpt-mermaid-\_r_nf\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_nf\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_nf\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_nf\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_nf\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_nf\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_nf\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_nf\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_nf\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_nf\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_nf\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_nf\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_nf\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_nf\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_nf\_ p{margin:0;}#chatgpt-mermaid-\_r_nf\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_nf\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_nf\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_nf\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_nf\_ .label text,#chatgpt-mermaid-\_r_nf\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_nf\_ .node rect,#chatgpt-mermaid-\_r_nf\_ .node circle,#chatgpt-mermaid-\_r_nf\_ .node ellipse,#chatgpt-mermaid-\_r_nf\_ .node polygon,#chatgpt-mermaid-\_r_nf\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_nf\_ .rough-node .label text,#chatgpt-mermaid-\_r_nf\_ .node .label text,#chatgpt-mermaid-\_r_nf\_ .image-shape .label,#chatgpt-mermaid-\_r_nf\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_nf\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_nf\_ .rough-node .label,#chatgpt-mermaid-\_r_nf\_ .node .label,#chatgpt-mermaid-\_r_nf\_ .image-shape .label,#chatgpt-mermaid-\_r_nf\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_nf\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_nf\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_nf\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_nf\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_nf\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_nf\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_nf\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_nf\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_nf\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_nf\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_nf\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_nf\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_nf\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_nf\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_nf\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_nf\_ .icon-shape,#chatgpt-mermaid-\_r_nf\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_nf\_ .icon-shape p,#chatgpt-mermaid-\_r_nf\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_nf\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_nf\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_nf\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_nf\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_nf\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_nf\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_nf\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_nf\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_nf\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_nf\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_nf\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_nf\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_nf\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_nf\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_nf\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_nf\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_nf\_ .node rect,#chatgpt-mermaid-\_r_nf\_ .node circle,#chatgpt-mermaid-\_r_nf\_ .node ellipse,#chatgpt-mermaid-\_r_nf\_ .node polygon,#chatgpt-mermaid-\_r_nf\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_nf\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_nf\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_nf\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_nf\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_nf\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}ClientLoad BalancerAPI Instance 1API Instance 2API Instance 3PostgreSQL

This allows additional API instances to be deployed without changing the RBAC module.

## **10.2 Pagination**

Use pagination for:

- Modules.
- Permissions.
- Roles.
- Delegations.
- Permission grants.
- Inheritance relationships.
- Role users.
- Permission impact results.
- Matrix results.

Recommended defaults:

| Setting          | Value                      |
| ---------------- | -------------------------- |
| Default page     | 1                          |
| Default limit    | 20                         |
| Maximum limit    | 100                        |
| Sorting          | Explicit allowlist         |
| Search           | Debounced on frontend      |
| Large result set | Consider cursor pagination |

## **10.3 Caching**

Potential caching:

| Resource              | Cache recommendation              |
| --------------------- | --------------------------------- |
| Module catalog        | Cacheable                         |
| Permission catalog    | Cacheable                         |
| Role list             | Short-lived or no cache initially |
| Role permissions      | Cacheable with invalidation       |
| Effective permissions | Cacheable, but security-sensitive |
| Delegation policies   | Short TTL or cache invalidation   |
| Permission matrix     | Cache only if justified by usage  |

### **Important**

Never let stale authorization caches continue granting access after a permission or role has been revoked.

When any of these change:

- Role permissions.
- Role status.
- Permission status.
- Role inheritance.
- User role assignments.
- Delegation policies.

The authorization cache must be invalidated or versioned.

## **10.4 Bulk operations**

Use bulk permission assignment rather than making one HTTP request per checkbox.

Recommended:

```
PUT /roles/:roleId/permissions
```

With an array of permission IDs in a single request.

This minimizes:

- HTTP overhead.
- Database round trips.
- Partial failures.
- Inconsistent role configuration.

## **10.5 Database optimization**

Use:

- Connection pooling.
- Parameterized queries.
- Explicit transaction boundaries.
- Indexed foreign-key access.
- Query projections rather than selecting every column.
- `EXPLAIN ANALYZE` for slow queries.
- N+1 query prevention.
- Bounded permission matrix size.

# **11. Security Considerations**

This is a highly security-sensitive module because incorrect role or permission configuration can grant users access to restricted operations.

## **11.1 Prevent privilege escalation**

Every permission assignment must pass a policy evaluation.

**Core rule**

An administrator must never be able to assign a permission, role, or delegation authority that exceeds their own authorized management scope.

Do not rely on the following as security controls:

- Hiding buttons in frontend.
- Disabling menu items.
- Filtering role options in React only.
- Trusting the submitted `organizationId`.
- Trusting submitted role names.
- Trusting submitted permission codes.

All security rules must be enforced server-side.

## **11.2 System role protection**

For roles where:

```
is_system = TRUE
role_type = SYSTEM
```

The API must protect:

- Role name/code.
- Role scope.
- System status.
- Permission assignments.
- Role deletion.
- Privileged delegation.

ADMIN must not modify or delete system roles.

## **11.3 Permission assignment protection**

When a permission is assigned to a role:

```
Request
   │
   ▼
Validate permission exists
   │
   ▼
Validate permission active
   │
   ▼
Validate target role active
   │
   ▼
Validate organization scope
   │
   ▼
Validate actor permission
   │
   ▼
Validate delegation grant
   │
   ▼
Check privilege escalation
   │
   ▼
Database transaction
```

## **11.4 Rate limiting**

Recommended initial limits, subject to adjustment based on real usage:

| Endpoint category      | Initial rate limit       |
| ---------------------- | ------------------------ |
| GET APIs               | 120 requests/minute/user |
| Standard mutations     | 30 requests/minute/user  |
| Permission bulk update | 10 requests/minute/user  |
| Validation endpoints   | 30 requests/minute/user  |

These are proposed defaults, not measured capacity limits.

## **11.5 Input security**

- Validate UUIDs.
- Validate all JSON bodies.
- Use allowlisted fields for updates.
- Prevent mass assignment.
- Use parameterized SQL.
- Limit array lengths.
- Reject unknown properties where appropriate.
- Sanitize log content.
- Never log passwords, access tokens, or secret values.
- Enforce request-size limits.

## **11.6 Audit logging**

Log all security-relevant changes.

| Action                             | Audit |
| ---------------------------------- | ----- |
| Module created                     | Yes   |
| Module updated                     | Yes   |
| Module deactivated                 | Yes   |
| Permission created                 | Yes   |
| Permission modified                | Yes   |
| Permission deactivated             | Yes   |
| Role created                       | Yes   |
| Role updated                       | Yes   |
| Role deleted                       | Yes   |
| Role activated/deactivated         | Yes   |
| Permissions assigned               | Yes   |
| Permissions removed                | Yes   |
| Delegation created/updated/deleted | Yes   |
| Permission grants changed          | Yes   |
| Role inheritance created/removed   | Yes   |

Audit data should capture:

- Actor.
- Organization.
- Action.
- Entity type.
- Entity ID.
- Old values.
- New values.
- IP address.
- User agent.
- Timestamp.

Your existing `audit.audit_logs` table supports this design.

# **12. Integration and Communication Flow**

## **12.1 Create a role workflow**

Audit ServicePostgreSQLRole ServiceAuthorizationRole APIDashboardAudit ServicePostgreSQLRole ServiceAuthorizationRole APIDashboard#chatgpt-mermaid-\_r_o3\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_o3\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_o3\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_o3\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_o3\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_o3\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_o3\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_o3\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_o3\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_o3\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_o3\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_o3\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_o3\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_o3\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_o3\_ p{margin:0;}#chatgpt-mermaid-\_r_o3\_ .actor{stroke:rgb(83, 154, 248);fill:rgb(222, 234, 251);stroke-width:1;}#chatgpt-mermaid-\_r_o3\_ rect.actor.outer-path[data-look="neo"]{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_o3\_ rect.note[data-look="neo"]{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_o3\_ text.actor>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_o3\_ .actor-line{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_o3\_ .innerArc{stroke-width:1.5;stroke-dasharray:none;}#chatgpt-mermaid-\_r_o3\_ .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_o3\_ .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_o3\_ [id$="-arrowhead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_o3\_ .sequenceNumber{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_o3\_ [id$="-sequencenumber"]{fill:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_o3\_ [id$="-crosshead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_o3\_ .messageText{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_o3\_ .labelBox{stroke:rgba(0, 0, 0, 0.1);fill:rgb(252, 252, 252);filter:none;}#chatgpt-mermaid-\_r_o3\_ .labelText,#chatgpt-mermaid-\_r_o3\_ .labelText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_o3\_ .loopText,#chatgpt-mermaid-\_r_o3\_ .loopText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_o3\_ .sectionTitle,#chatgpt-mermaid-\_r_o3\_ .sectionTitle>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_o3\_ .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:rgba(0, 0, 0, 0.1);fill:rgba(0, 0, 0, 0.1);}#chatgpt-mermaid-\_r_o3\_ .note{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_o3\_ .noteText,#chatgpt-mermaid-\_r_o3\_ .noteText>tspan{fill:rgb(13, 13, 13);stroke:none;font-weight:normal;}#chatgpt-mermaid-\_r_o3\_ .activation0{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_o3\_ .activation1{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_o3\_ .activation2{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_o3\_ .actorPopupMenu{position:absolute;}#chatgpt-mermaid-\_r_o3\_ .actorPopupMenuPanel{position:absolute;fill:rgb(222, 234, 251);box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#chatgpt-mermaid-\_r_o3\_ .actor-man circle,#chatgpt-mermaid-\_r_o3\_ line{fill:rgb(222, 234, 251);stroke-width:2px;}#chatgpt-mermaid-\_r_o3\_ g rect.rect{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_o3\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_o3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_o3\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_o3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_o3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_o3\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_o3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_o3\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}AdminCreate RolePOST /rbac/rolesVerify ROLE_CREATEValidate organization scopeAuthorizedCreate roleInsert roleRole createdRecord creationRole data201 CreatedSuccessAdmin

## **12.2 Assign permissions to a role**

Audit ServicePostgreSQLRBAC PolicyAuthorizationRole Permission APIDashboardAudit ServicePostgreSQLRBAC PolicyAuthorizationRole Permission APIDashboard#chatgpt-mermaid-\_r_oa\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_oa\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_oa\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_oa\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_oa\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_oa\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_oa\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_oa\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_oa\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_oa\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_oa\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_oa\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_oa\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_oa\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_oa\_ p{margin:0;}#chatgpt-mermaid-\_r_oa\_ .actor{stroke:rgb(83, 154, 248);fill:rgb(222, 234, 251);stroke-width:1;}#chatgpt-mermaid-\_r_oa\_ rect.actor.outer-path[data-look="neo"]{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_oa\_ rect.note[data-look="neo"]{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_oa\_ text.actor>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_oa\_ .actor-line{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_oa\_ .innerArc{stroke-width:1.5;stroke-dasharray:none;}#chatgpt-mermaid-\_r_oa\_ .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_oa\_ .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_oa\_ [id$="-arrowhead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_oa\_ .sequenceNumber{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_oa\_ [id$="-sequencenumber"]{fill:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_oa\_ [id$="-crosshead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_oa\_ .messageText{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_oa\_ .labelBox{stroke:rgba(0, 0, 0, 0.1);fill:rgb(252, 252, 252);filter:none;}#chatgpt-mermaid-\_r_oa\_ .labelText,#chatgpt-mermaid-\_r_oa\_ .labelText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_oa\_ .loopText,#chatgpt-mermaid-\_r_oa\_ .loopText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_oa\_ .sectionTitle,#chatgpt-mermaid-\_r_oa\_ .sectionTitle>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_oa\_ .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:rgba(0, 0, 0, 0.1);fill:rgba(0, 0, 0, 0.1);}#chatgpt-mermaid-\_r_oa\_ .note{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_oa\_ .noteText,#chatgpt-mermaid-\_r_oa\_ .noteText>tspan{fill:rgb(13, 13, 13);stroke:none;font-weight:normal;}#chatgpt-mermaid-\_r_oa\_ .activation0{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_oa\_ .activation1{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_oa\_ .activation2{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_oa\_ .actorPopupMenu{position:absolute;}#chatgpt-mermaid-\_r_oa\_ .actorPopupMenuPanel{position:absolute;fill:rgb(222, 234, 251);box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#chatgpt-mermaid-\_r_oa\_ .actor-man circle,#chatgpt-mermaid-\_r_oa\_ line{fill:rgb(222, 234, 251);stroke-width:2px;}#chatgpt-mermaid-\_r_oa\_ g rect.rect{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_oa\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_oa\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_oa\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_oa\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_oa\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_oa\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_oa\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_oa\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}AdminSelect permissionsPUT /roles/:id/permissionsVerify assignment permissionAuthorizedValidate proposed permissionsScope & escalation checksValidBegin transactionUpdate role permissionsCommitRecord permission changesUpdated permission setSaved successfullyAdmin

## **12.3 Deactivate a permission**

Audit ServicePostgreSQLRBAC PolicyPermission APIDashboardAudit ServicePostgreSQLRBAC PolicyPermission APIDashboard#chatgpt-mermaid-\_r_ob\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_ob\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_ob\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_ob\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_ob\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_ob\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_ob\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_ob\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_ob\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_ob\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_ob\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_ob\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_ob\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_ob\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_ob\_ p{margin:0;}#chatgpt-mermaid-\_r_ob\_ .actor{stroke:rgb(83, 154, 248);fill:rgb(222, 234, 251);stroke-width:1;}#chatgpt-mermaid-\_r_ob\_ rect.actor.outer-path[data-look="neo"]{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ob\_ rect.note[data-look="neo"]{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ob\_ text.actor>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_ob\_ .actor-line{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_ob\_ .innerArc{stroke-width:1.5;stroke-dasharray:none;}#chatgpt-mermaid-\_r_ob\_ .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_ob\_ .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_ob\_ [id$="-arrowhead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_ob\_ .sequenceNumber{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_ob\_ [id$="-sequencenumber"]{fill:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_ob\_ [id$="-crosshead"] path{fill:rgb(97, 97, 97);stroke:rgb(97, 97, 97);}#chatgpt-mermaid-\_r_ob\_ .messageText{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_ob\_ .labelBox{stroke:rgba(0, 0, 0, 0.1);fill:rgb(252, 252, 252);filter:none;}#chatgpt-mermaid-\_r_ob\_ .labelText,#chatgpt-mermaid-\_r_ob\_ .labelText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_ob\_ .loopText,#chatgpt-mermaid-\_r_ob\_ .loopText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_ob\_ .sectionTitle,#chatgpt-mermaid-\_r_ob\_ .sectionTitle>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_ob\_ .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:rgba(0, 0, 0, 0.1);fill:rgba(0, 0, 0, 0.1);}#chatgpt-mermaid-\_r_ob\_ .note{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_ob\_ .noteText,#chatgpt-mermaid-\_r_ob\_ .noteText>tspan{fill:rgb(13, 13, 13);stroke:none;font-weight:normal;}#chatgpt-mermaid-\_r_ob\_ .activation0{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_ob\_ .activation1{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_ob\_ .activation2{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_ob\_ .actorPopupMenu{position:absolute;}#chatgpt-mermaid-\_r_ob\_ .actorPopupMenuPanel{position:absolute;fill:rgb(222, 234, 251);box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#chatgpt-mermaid-\_r_ob\_ .actor-man circle,#chatgpt-mermaid-\_r_ob\_ line{fill:rgb(222, 234, 251);stroke-width:2px;}#chatgpt-mermaid-\_r_ob\_ g rect.rect{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_ob\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_ob\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_ob\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_ob\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_ob\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ob\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_ob\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_ob\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}AdminDeactivate permissionPATCH /permissions/:id/statusCheck permission status change authorityAuthorizedIdentify affected rolesUpdate permission statusRecord status changeSuccess + impact summaryPermission deactivatedAdmin

# **13. Deployment and Infrastructure Recommendations**

## **13.1 Recommended initial deployment**

For SecureGateControl's current stage:

```
Next.js Application
├── Authentication
├── Authorization / RBAC
├── User Management
├── Role Management
├── Permission Management
├── Gate Control
├── Visitor Management
└── Other application modules

PostgreSQL
├── core
├── rbac
├── auth
└── audit
```

Start with one backend deployment and PostgreSQL. Do not deploy independent microservices for every RBAC domain at this stage.

## **13.2 Environments**

| Environment | Purpose                        |
| ----------- | ------------------------------ |
| Local       | Developer implementation       |
| Development | Shared development integration |
| Staging     | Production-like testing        |
| Production  | Live deployment                |

## **13.3 Deployment requirements**

- Docker-based deployment.
- Environment-specific configuration.
- Database migration system.
- CI/CD pipeline.
- Secrets management.
- HTTPS.
- Database backups.
- Monitoring.
- Centralized logs.
- Health checks.
- Rollback procedure.

## **13.4 API documentation**

Recommended: OpenAPI 3.1.

Each API should document:

- Endpoint.
- HTTP method.
- Summary.
- Description.
- Authentication requirements.
- Required permissions.
- Path parameters.
- Query parameters.
- Request body.
- Success response.
- Error response.
- Examples.

# **14. Potential Bottlenecks and Architectural Risks**

This section is particularly important because the existing schema already has some complex RBAC capabilities.

## **14.1 Role permission evaluation complexity**

As role inheritance, permission grants, and delegations grow, authorization checks become more complicated.

**Risk:** Repeated recursive queries for each API request.

**Mitigation:**

- Centralize permission evaluation.
- Avoid duplicate evaluation within a request.
- Cache computed results with reliable invalidation.
- Use recursive CTEs for inheritance resolution where appropriate.
- Monitor query performance.

## **14.2 Permission changes may affect many users**

A role can be assigned to many users. Modifying its permissions changes the effective access of all those users.

**Risk:** Accidental mass privilege changes.

**Mitigation:**

- Add role usage endpoint.
- Add permission validation endpoint.
- Provide impact preview before saving.
- Audit before/after permission assignments.
- Warn when role has many assigned users.

## **14.3 Delegation complexity**

The tables `role_delegations` and `role_permission_grants` represent different delegation concepts.

| Table                    | Controls                                              |
| ------------------------ | ----------------------------------------------------- |
| `role_delegations`       | Role management and user/role delegation capabilities |
| `role_permission_grants` | Which permissions may be delegated to a target role   |

These must not be treated as interchangeable.

## **14.4 Inheritance cycles**

Example:

```
Role A inherits Role B
Role B inherits Role C
Role C inherits Role A
```

This must never be allowed.

**Mitigation:** Before creating an inheritance link, verify that the graph remains acyclic. Perform validation and insertion inside a transaction with concurrency protection so two simultaneous requests cannot create a cycle.

## **14.5 Existing schema constraints and gaps**

Your uploaded database design has several areas that API implementation must handle carefully.

| Existing schema limitation                                                           | API-level handling                                                                                      |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Role inheritance table has no `organization_id`                                      | Validate organization scope through referenced roles; consider schema enforcement in a future migration |
| Delegation table stores org but does not directly enforce role ownership matches org | Validate delegator and target roles belong to the requested organization or allowed scope               |
| Permission grants do not have an organization field                                  | Derive scope from the involved roles and validate both                                                  |
| Role permissions do not store organization                                           | Derive scope from role and verify permission is allowed within that scope                               |
| Role status can change while users are assigned                                      | Authorization must ignore inactive roles                                                                |
| No soft-delete columns in roles/modules/permissions                                  | Prefer deactivation or controlled hard deletion                                                         |
| `route_permissions` maps paths/methods                                               | Keep API permission checks centralized and consistent with the route catalog                            |
| Role delegation is organization-specific                                             | Do not allow an organization administrator to create cross-organization delegation                      |

### **One important database issue**

Your existing role scope validation trigger checks that the role scope matches the `user_roles.organization_id` assignment scope. However, this trigger does not by itself enforce every permission-management business rule, nor does it prevent unauthorized permission assignment.

That validation must remain in the backend policy layer, and critical scope relationships should eventually be reinforced with database constraints where feasible.

# **15. Final Architecture Recommendations**

## **15.1 Final API structure**

### **SecureGateControl RBAC API v1**

48 planned endpoints · 7 API groups

Base path: `/api/v1/rbac`

**Modules**

7 endpoints — module catalog, hierarchy, lifecycle

**Permissions**

7 endpoints — permission definitions, catalog, impact

**Roles**

11 endpoints — role lifecycle, details, summary, effective permissions

**Role-Permission Assignments**

5 endpoints — assignment, removal, replacement, validation

**Delegation**

5 endpoints — role delegation rules

**Permission Grants**

5 endpoints — delegatable permission authority

**Role Inheritance**

5 endpoints — inheritance relationships and validation

**Role Insights**

3 endpoints — usage, impact, permission matrix

## **15.2 Recommended implementation order**

I recommend implementing the module in the following order, because later functionality depends on earlier functionality.

## **Implementation roadmap**

Phase 1

**Module APIs**

Module CRUD, tree, status, catalog

Phase 2

**Permission APIs**

Permission CRUD, catalog, activation

Phase 3

**Role APIs**

Role CRUD, scope validation, role lifecycle

Phase 4

**Role-Permission APIs**

Bulk assignment, removal, validation, effective permissions

Phase 5

**Delegation APIs**

Role delegation and permission grants

Phase 6

**Inheritance APIs**

Inheritance graph, cycle detection, effective permissions

Phase 7

**Insights APIs**

Usage, impact analysis, permission matrix, optimization

## **15.3 My architectural decisions**

| Decision                   | Recommendation                                          |
| -------------------------- | ------------------------------------------------------- |
| Architecture               | Modular monolith                                        |
| API version                | `/api/v1`                                               |
| Base prefix                | `/api/v1/rbac`                                          |
| Database                   | Existing PostgreSQL schema                              |
| ORM                        | Drizzle                                                 |
| Validation                 | Zod                                                     |
| Authentication             | Existing SecureGateControl JWT cookie authentication    |
| Authorization              | Centralized RBAC policy service                         |
| Scope                      | Global + organization scope                             |
| Role permission assignment | Transactional bulk operations                           |
| Role deletion              | Dependency-aware                                        |
| Module/permission deletion | Prefer deactivation                                     |
| Role inheritance           | Optional, validate cycles                               |
| Delegation                 | Validate role and permission boundaries                 |
| Auditing                   | `audit.audit_logs`                                      |
| Pagination                 | Standardized page/limit initially                       |
| API documentation          | OpenAPI                                                 |
| Testing                    | Unit, integration, authorization, security, concurrency |

## **15.4 Critical implementation rule**

The most important architectural principle for this entire module is:

> **The Role & Permission Management API must never allow an administrator to grant authority that exceeds the administrator's own authorized scope.**

For SecureGateControl, this means the backend must explicitly protect:

- SUPER_ADMIN global privileges.
- ADMIN organization isolation.
- System roles.
- System permissions.
- Role scope.
- Permission assignment.
- Delegation authority.
- Inheritance relationships.
- Privilege escalation.

Your existing database is a good foundation for this module. The API architecture above is designed around your actual tables rather than introducing a different RBAC database model.&#x20;

Pasted text.txt



### **Architecture status**

Architecture design complete — ready for the next design stage.

The next logical stage is to freeze this architecture and then produce the **complete API endpoint list only**, followed by the detailed specification for each endpoint (permissions, request schemas, response schemas, validations, controller/service responsibilities, and database transactions) before implementation.

I can continue from this exact architecture without redesigning it.
