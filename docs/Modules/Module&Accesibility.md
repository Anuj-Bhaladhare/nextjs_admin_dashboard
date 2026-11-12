# Smart Gate & Visitor Management System – Multi-Organization Architecture

Architecture & Requirements Notes## 1. System Overview

The application should be designed as a Multi-Organization Smart Gate & Visitor Management System, rather than only an employee gate-control system.

The system must support two categories of people entering a building:

### A. Registered Employees

Employees are already registered in the database with:

- Name and basic personal details.
- Organization information.
- Photograph.
- Fingerprint information.
- RFID credentials.

Employees authenticate themselves using their registered RFID card or fingerprint.

### B. Unregistered Visitors

Visitors are people whose details are not registered as employees in the database.

Their workflow includes:

- Guard registers basic visitor details at the gate.
- Guard selects the organization being visited.
- Guard records the host employee and visit purpose.
- System applies visitor access policies.
- Temporary visit authorization is issued when permitted.
- Entry and exit activities are recorded.

### Multi-Organization Requirement

One physical building can contain multiple organizations.

Therefore, the system must identify:

1. Who is entering?
2. Is the person an employee or visitor?
3. Which organization does the person belong to?
4. Which organization is the visitor visiting?
5. Which gate is being accessed?
6. Is the person authorized to enter?

## 2. Recommended Sidebar Architecture

The sidebar should be divided into three major groups.

### A. OPERATIONS

| No. | Module | Responsibilities | Main Users |
| --- | --- | --- | --- |
| 1 | Dashboard | Building overview, entries/exits, occupancy, visitors, gate/device status | SUPER\_ADMIN, ADMIN, SUPERVISOR, GUARD |
| 2 | Live Gate Monitoring | Live gate status, access activity, ESP32 connection status | Security team, administrators |
| 3 | Employee Access | Employee RFID/fingerprint authentication and access history | Administrators, supervisors, guards |
| 4 | Visitor Management | Visitor registration, host selection, temporary authorization, check-in/check-out | GUARD, RECEPTIONIST, SUPERVISOR |
| 5 | Gate Control | Manual gate opening/closing, command status and history | Authorized guards and supervisors |
| 6 | Access Logs | Employee and visitor access records with filters | Administrators, supervisors, authorized guards |
| 7 | Reports | Attendance, visitor, gate activity and failed-access reports | Administrators, supervisors |

### B. BUILDING & ORGANIZATION ADMINISTRATION

| No. | Module | Responsibilities | Main Users |
| --- | --- | --- | --- |
| 1 | Building Management | Building details and access configuration | SUPER\_ADMIN, authorized building administrator |
| 2 | Organization Management | Manage multiple organizations operating inside the building | SUPER\_ADMIN, authorized building administrator |
| 3 | Employee Management | Employee profiles, departments, designations and organization membership | SUPER\_ADMIN, organization ADMIN, HR |
| 4 | Credential Management | RFID assignment and fingerprint registration status | Authorized administrators |
| 5 | User Management | Manage login accounts for administrators and operational users | SUPER\_ADMIN, authorized ADMIN |
| 6 | Role & Permission Management | Create roles and assign permissions | SUPER\_ADMIN, authorized ADMIN |
| 7 | Gate Management | Gate names, locations, directions and controllers | Authorized administrators |
| 8 | Device Management | ESP32 registration, authentication and connection status | Authorized administrators |
| 9 | Audit Logs | Administrative changes, user actions, gate commands and security events | SUPER\_ADMIN, ADMIN, authorized auditors |

### C. ACCOUNT

- My Profile
- Change Password
- My Sessions (optional)
- Logout

Important: Visitor Management must be an independent first-class module, not a submodule of Employee Management. Employees and visitors have different identity, authorization, check-in/check-out and reporting workflows.

## 3. User Roles and Access Hierarchy

Because one building contains multiple organizations, administrative authority must be divided into building-level and organization-level scopes.

| Role | Access Scope | Main Responsibilities |
| --- | --- | --- |
| SUPER\_ADMIN | Entire system/building | Manage all organizations, building configuration, ADMIN accounts and system settings |
| ADMIN | Assigned organization | Manage organization employees, credentials, users and permitted reports |
| SUPERVISOR | Assigned organization or gates | Monitor operations, review visitor activity and supervise guards |
| GUARD\_ADMIN | Assigned building/gates | Manage guard operations, gate assignments and visitor operations |
| GUARD | Assigned gates | Authenticate employees, register visitors and operate authorized gates |
| RECEPTIONIST | Assigned organization/building | Register visitors, contact hosts and manage visitor check-ins |

### Important Role Design Rules

- SUPER\_ADMIN has building-wide administrative authority.
- ADMIN manages only their assigned organization.
- SUPERVISOR receives delegated operational permissions.
- GUARD\_ADMIN manages assigned guard and gate operations.
- GUARD performs authorized gate and visitor operations.
- RECEPTIONIST handles visitor registration and check-in/check-out.

These are role templates. The existing RBAC system must remain responsible for authorization. Avoid hardcoding role names throughout the application.

### Organization Isolation Rules

An organization ADMIN must not automatically access another organization's private data.

Example:

| User | Permitted Access |
| --- | --- |
| Organization A ADMIN | Organization A employees and records |
| Organization B ADMIN | Organization B employees and records |
| Building SUPER\_ADMIN | Both organizations |
| GUARD | Employee verification and visitor processing at assigned gates |

Important security distinction: A guard may verify employees from different organizations, but this does not give the guard permission to modify employee profiles or credentials.

## 4. Employee and Visitor Access Workflows

There are two separate access workflows.

### Workflow 1: Registered Employee Access

Nos piden nuestros datos biométricos hasta para entrar al gimnasio. No tiene ningún sentido y la AEPD ya ha empezado a multar

[xatakamovil.com](<https://www.xatakamovil.com/seguridad/no-tiene-ningun-sentido-que-nos-pidan-nuestros-datos-biometricos-para-entrar-al-gimnasio-al-zoo-lluvia-multas-deberia-hacernos-reflexionar?utm_source=chatgpt.com>)

Process:

1. Employee arrives at the gate.
2. Employee scans their registered RFID card or fingerprint.
3. ESP32 sends authentication information to the local Raspberry Pi server, or uses securely synchronized local credentials.
4. Server identifies the employee.
5. Server checks employee and access authorization.
6. If authorized, the gate receives an opening command.
7. System records the access event.

Authorization checks:

- Is the employee registered?
- Is the employee active?
- Does the credential belong to this employee?
- Is the employee authorized for this building?
- Is the employee authorized for this gate?
- Is the requested access permitted?

Access event information:

- Employee ID.
- Organization ID.
- Gate ID.
- Entry/exit direction.
- Authentication method.
- Timestamp.
- Authorization result.

Important: Employees do not need to be manually registered by guards during every visit.

### Workflow 2: Unregistered Visitor Access

Visitor Management System for Offices and Modern Workplaces

[digitalreception.app](<https://digitalreception.app/blog/visitor-management-system-for-offices-and-modern-workplaces?utm_source=chatgpt.com>)

Process:

1. Visitor arrives at the gate.
2. Visitor does not have a registered employee RFID or fingerprint credential.
3. Guard opens Visitor Management → New Visitor Check-in.
4. Guard enters visitor's basic information.
5. Guard selects the organization being visited.
6. Guard selects the host employee.
7. Guard enters the visit purpose.
8. System checks the visitor access policy.
9. If authorized, the system creates temporary visit authorization.
10. Gate receives an opening command when the applicable approval conditions are satisfied.
11. Visitor entry is recorded.
12. On departure, visitor check-out is recorded.

### Important Visitor Security Rule

Visitor registration and visitor entry approval must be separate operations.

Two possible approval modes:

- Immediate authorization: Guard can authorize entry when organizational policy permits it.
- Host approval: Host employee or organization ADMIN must approve the visitor before entry.

A gate must not open merely because a visitor registration form has been submitted.

### Visitor Registration Fields

| Field | Required? | Purpose |
| --- | --- | --- |
| Visitor Name | Yes | Visitor identification |
| Mobile Number | Recommended | Contact information |
| Photograph | Optional | Visual identification |
| Visiting Organization | Yes | Destination organization |
| Host Employee | Yes, by default | Person being visited |
| Visit Purpose | Yes | Reason for entry |
| Number of Visitors | Optional | Group visit support |
| Vehicle Number | Optional | Vehicle identification |
| Entry Gate | Yes | Entry location |
| Visit Status | System-managed | Track visit progress |

### Visitor Status Lifecycle

| Status | Description |
| --- | --- |
| PENDING | Awaiting approval |
| APPROVED | Visitor entry approved |
| CHECKED\_IN | Visitor has entered |
| CHECKED\_OUT | Visitor has exited |
| REJECTED | Visitor entry rejected |
| CANCELLED | Visit cancelled |

Important: Visitor identity and visitor visit records must be separate. One visitor may visit multiple organizations or return to the building multiple times.

## 5. Recommended Database Architecture

The database must support multiple organizations inside one physical building.

### High-Level Relationship

BUILDING

One physical building

ORGANIZATION A

Employees, users, credentials

ORGANIZATION B

Employees, users, credentials

SHARED BUILDING OPERATIONS

Employees · Visitors · Gates · ESP32 Devices · Access Events · Audit History

### Recommended Core Database Entities

| No. | Entity/Table | Responsibility |
| --- | --- | --- |
| 1 | `buildings` | Physical building information |
| 2 | `organizations` | Organizations operating in the building |
| 3 | `organization_memberships` | Employee-to-organization relationship |
| 4 | `employees` | Employee identity and basic details |
| 5 | `employee_credentials` | RFID and fingerprint credential mapping/status |
| 6 | `visitors` | Reusable visitor identity records |
| 7 | `visitor_visits` | Individual visitor transactions |
| 8 | `visitor_approvals` | Host/organization approval records |
| 9 | `gates` | Physical gates and entry/exit configuration |
| 10 | `devices` | ESP32 controllers assigned to gates |
| 11 | `access_events` | Employee/visitor entry, exit and failed attempts |

### Database Design Rules

1. Every employee must have an organization relationship.
2. Organization-owned records must have an organization identifier.
3. Visitor identity must be separate from visitor visit transactions.
4. Each visitor visit must identify its destination organization.
5. Shared building gates must be associated with the building.
6. Devices must be assigned to the appropriate gates.
7. All access events must preserve identity, organization, gate and timestamp information.
8. Backend authorization must enforce organization-level data isolation.

## 6. RBAC Permission Design

Permissions should be defined around business actions rather than granting broad permissions to entire roles.

### Proposed Module-wise Permissions

| Module | Suggested Permissions |
| --- | --- |
| Dashboard | `DASHBOARD_VIEW`, `DASHBOARD_VIEW_BUILDING` |
| Employee Access | `EMPLOYEE_ACCESS_VIEW`, `EMPLOYEE_ACCESS_VERIFY` |
| Visitor Management | `VISITOR_VIEW`, `VISITOR_REGISTER`, `VISITOR_UPDATE`, `VISITOR_APPROVE`, `VISITOR_CHECKIN`, `VISITOR_CHECKOUT`, `VISITOR_REJECT` |
| Gate Control | `GATE_VIEW`, `GATE_OPEN`, `GATE_CLOSE`, `GATE_EMERGENCY_CONTROL` |
| Access Logs | `ACCESS_LOG_VIEW`, `ACCESS_LOG_EXPORT` |
| Reports | `REPORT_VIEW`, `REPORT_EXPORT` |
| Employee Management | `EMPLOYEE_VIEW`, `EMPLOYEE_CREATE`, `EMPLOYEE_UPDATE`, `EMPLOYEE_DEACTIVATE` |
| Credential Management | `CREDENTIAL_VIEW`, `CREDENTIAL_ASSIGN`, `CREDENTIAL_REVOKE` |
| Organization Management | `ORGANIZATION_VIEW`, `ORGANIZATION_CREATE`, `ORGANIZATION_UPDATE` |
| User Management | `USER_VIEW`, `USER_CREATE`, `USER_UPDATE`, `USER_DEACTIVATE` |
| Role & Permissions | `ROLE_VIEW`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_ASSIGN`, `PERMISSION_ASSIGN` |
| Device Management | `DEVICE_VIEW`, `DEVICE_REGISTER`, `DEVICE_UPDATE`, `DEVICE_DISABLE` |
| Audit Logs | `AUDIT_LOG_VIEW`, `AUDIT_LOG_EXPORT` |

### Example: Guard Permissions

A guard may receive:

- `VISITOR_REGISTER`
- `VISITOR_CHECKIN`
- `VISITOR_CHECKOUT`
- `EMPLOYEE_ACCESS_VERIFY`
- `GATE_OPEN`

A guard should not automatically receive:

- `VISITOR_APPROVE`
- `EMPLOYEE_UPDATE`
- `CREDENTIAL_ASSIGN`
- `USER_CREATE`
- `PERMISSION_ASSIGN`

### Recommended Role-wise Access Matrix

| Module | SUPER\_ADMIN | ADMIN | SUPERVISOR | GUARD\_ADMIN | GUARD | RECEPTIONIST |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard | Full | Organization | Assigned scope | Gate scope | Limited | Limited |
| Live Gate Monitoring | Full | Organization | Yes | Yes | Assigned gates | No |
| Employee Access | Full | Organization | Yes | Yes | Verify only | No |
| Visitor Management | Full | Organization | Manage | Manage | Register/check-in/out | Register/check-in/out |
| Gate Control | Full | Permitted gates | Authorized | Authorized | Authorized | No |
| Access Logs | All | Organization | Assigned scope | Gate scope | Limited | Visitor-only |
| Reports | All | Organization | Permitted | Permitted | No | Visitor-only |
| Employee Management | Full | Organization | View | No | No | No |
| Credential Management | Full | Organization | Limited | No | No | No |
| Organization Management | Full | Own/limited | No | No | No | No |
| User Management | Full | Subordinate users | No | No | No | No |
| Role & Permissions | Full | Delegated roles | No | No | No | No |
| Device Management | Full | Permitted devices | View | View | Status only | No |
| Audit Logs | All | Organization | Limited | Limited | No | No |

Note: Full, Limited, Organization and Assigned Scope are conceptual access levels. They must ultimately resolve into explicit RBAC permissions and data scopes.

## 7. Recommended Next.js Application Structure

The following folder structure organizes application routes according to business modules.

text

```text
(app)
│
├── (auth)
│   └── login
│
├── (dashboard)
│   │
│   ├── dashboard
│   │
│   ├── operations
│   │   ├── live-monitoring
│   │   ├── employee-access
│   │   ├── visitor-management
│   │   │   ├── visitors
│   │   │   ├── new-visitor
│   │   │   ├── active-visits
│   │   │   ├── visit-history
│   │   │   └── approvals
│   │   ├── gate-control
│   │   ├── access-logs
│   │   └── reports
│   │
│   ├── building
│   │   ├── building-management
│   │   ├── organization-management
│   │   ├── gate-management
│   │   └── device-management
│   │
│   ├── people
│   │   ├── employee-management
│   │   ├── credential-management
│   │   └── user-management
│   │
│   ├── administration
│   │   ├── role-permissions
│   │   ├── audit-logs
│   │   └── system-settings
│   │
│   └── account
│       ├── profile
│       └── change-password
```

These are proposed route groups and URL structures. They do not require replacing the existing `(auth)` and `(dashboard)` architecture.

## 8\. Three Important Architectural Decisions

### 1\. Separate Employee Access and Visitor Access

Employees use registered credentials such as RFID and fingerprint.

Visitors use temporary visit authorization.

Both generate access events, but their identity and authorization processes must remain separate.

### 2\. Separate Building Scope and Organization Scope

- Building contains shared infrastructure such as gates and devices.
- Organizations manage their own employees and related private records.
- SUPER\_ADMIN has building-wide administrative authority.
- Organization ADMIN has organization-specific authority.

This separation prevents one organization's ADMIN from accessing another organization's private employee information.

### 3\. Separate Gate Commands and Physical Gate Results

An accepted `GATE_OPEN` command does not guarantee that the physical gate opened.

The system must separately track:

- Gate command request.
- Command delivery status.
- Controller response.
- Physical gate movement/sensor confirmation.
- Operation result and timestamp.

This is essential for reliable gate operations and audit history.

## 9\. Decisions Required Before Finalizing Architecture

Two major architectural decisions must be finalized because they affect database design, RBAC, visitor workflows and deployment.

### Decision 1: Raspberry Pi Deployment Architecture

| Option | Description |
| --- | --- |
| Option A | One Raspberry Pi server for the entire building, shared by all organizations |
| Option B | Each organization has its own Raspberry Pi server |
| Option C | One building server initially, with support for separate deployments in the future |

Recommended direction: Option C, if future expansion to multiple buildings or independent deployments is expected.

### Decision 2: Visitor Entry Approval Workflow

| Option | Description |
| --- | --- |
| Option A | Guard enters visitor details and can immediately authorize entry |
| Option B | Guard enters visitor details, then host employee or organization ADMIN must approve |
| Option C | Both modes: immediate guard authorization for permitted visits; otherwise host approval |

Recommended direction: Option C, because it supports different organizational security policies.

## 10\. Final Development Priorities

The implementation should follow this order:

1. Finalize multi-organization building architecture.
2. Finalize Raspberry Pi deployment architecture.
3. Design building and organization database relationships.
4. Design employee and visitor identity management.
5. Define visitor registration and approval workflows.
6. Design the complete RBAC permission matrix.
7. Define building-level and organization-level data isolation.
8. Finalize sidebar modules and Next.js routes.
9. Design employee and visitor access-event recording.
10. Integrate ESP32 gate controllers with the Raspberry Pi server.

### Key Takeaways

- The system must support multiple organizations within one building.
- Employees and visitors require separate access workflows.
- Visitor Management must be an independent application module.
- Building-level and organization-level administration must be separated.
- Organization data must be isolated through backend authorization.
- RBAC must control modules, actions and data visibility.
- Raspberry Pi, ESP32 and physical gate operations must be tracked independently.
- The architecture should support future expansion to multiple buildings.

Next milestone: Finalize the deployment model and visitor approval policy, then prepare the complete database schema and RBAC permission matrix before beginning individual module development.
