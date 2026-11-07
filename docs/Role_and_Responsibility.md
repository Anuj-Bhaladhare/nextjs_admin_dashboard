# Smart Gate Management System – Role & Responsibility Definition

Based on your requirements, the multi-organization building structure, and the proposed Smart Gate Management System, I recommend defining six primary roles.

The purpose of this document is to establish exactly:

- Who each role is.
- What responsibilities each role has.
- What each role can create and manage.
- Which modules each role can access.
- What each role is not allowed to do.

One important principle: Every role should have clearly defined responsibilities and access boundaries. A user should only receive the permissions necessary to perform their job.

# 1. SUPER_ADMIN

System / Building Level

Role description: SUPER_ADMIN is the highest-authority user responsible for managing the complete Smart Gate Management System and the building's overall security administration.

SUPER_ADMIN has authority across all organizations operating within the building.

### Responsibilities

A. Organization Management

1. Create new organizations in the building.
2. Update organization information.
3. Activate, deactivate or suspend organizations.
4. View all registered organizations.
5. Manage organization-level configurations.
6. Assign administrators to organizations.
7. Monitor activity across all organizations.

B. User & Staff Management

1. Create ADMIN accounts for organizations.
2. Create other staff accounts across all organizations.
3. Assign roles and responsibilities to staff members.
4. Update user information.
5. Activate, deactivate or suspend user accounts.
6. Reset user passwords when authorized.
7. Assign or change user permissions.
8. Manage user access across organizations.
9. View all registered system users.
10. Revoke access when an employee or staff member leaves.

C. Role & Permission Management

1. Create new operational roles.
2. Update existing roles.
3. Assign permissions to roles.
4. Define which modules each role can access.
5. Define which actions each role can perform.
6. Control role assignment boundaries.
7. Prevent unauthorized privilege escalation.
8. Manage role delegation policies.

D. Building & Gate Management

1. Manage building information.
2. Register and configure gates.
3. Configure entry and exit gates.
4. Assign ESP32 controllers to gates.
5. Monitor all gate statuses.
6. Configure building-wide gate policies.
7. Monitor connected and disconnected devices.

E. Employee & Credential Management

1. View employee records across all organizations.
2. Manage employee-to-organization relationships.
3. Manage RFID and fingerprint credential policies.
4. Activate or deactivate credentials.
5. Review employee access authorization.
6. Manage organization-level access configurations.

F. Visitor & Security Management

1. View visitor activity across the building.
2. Monitor visitor entry and exit records.
3. Review visitor approvals and rejected visits.
4. Investigate security incidents.
5. Review suspicious access attempts.
6. Monitor manual gate operations.

G. Monitoring & Reports

1. View building-wide dashboard.
2. Monitor all organizations' activities.
3. View building-wide access logs.
4. Generate organization-wise reports.
5. Generate building-wide reports.
6. View audit logs and security events.
7. Monitor system and device health.

H. System Administration

1. Configure system-wide settings.
2. Manage application configuration.
3. Manage database backup and recovery operations, subject to deployment safeguards.
4. Monitor application health.
5. Manage system security settings.

SUPER_ADMIN restriction: This role should be tightly controlled. It should not be assigned through ordinary organization ADMIN workflows. Its creation and recovery should follow a protected system-administration process.

# 2. ADMIN

Organization Level

Role description: ADMIN is responsible for managing one assigned organization within the building. ADMIN controls the organization's employees, staff accounts, operational permissions and organization-specific activities.

ADMIN cannot manage other organizations unless explicitly granted additional building-level authority.

### Responsibilities

A. Organization Management

1. View their own organization's information.
2. Update permitted organization details.
3. Manage organization-specific settings.
4. Monitor their organization's activities.
5. View organization-level dashboards and reports.

B. Employee Management

1. Register new employees.
2. Update employee information.
3. Maintain employee identification details.
4. Assign employees to departments and designations.
5. Activate or deactivate employee records.
6. Manage employee status.
7. View employee entry and exit history.
8. Manage employee organization membership, within their scope.

C. User & Staff Management

1. Create operational staff accounts for their organization.
2. Create users such as SUPERVISOR, GUARD_ADMIN, GUARD and RECEPTIONIST.
3. Assign appropriate roles to staff members.
4. Assign permissions only within the authority delegated to them.
5. Update staff information.
6. Activate or deactivate staff accounts.
7. Reset staff passwords when authorized.
8. Monitor their organization's staff activity.

Important restrictions:

- Cannot create another ADMIN.
- Cannot create a SUPER_ADMIN.
- Cannot assign SUPER_ADMIN or ADMIN privileges.
- Cannot modify building-wide settings.
- Cannot manage another organization's employees or users.
- Cannot grant permissions beyond their delegated authority.

D. Employee Credential Management

1. Register employee RFID cards.
2. Map RFID cards to employees.
3. Manage fingerprint registration status.
4. Activate or deactivate employee credentials.
5. Revoke lost or compromised RFID cards.
6. Review employee credential status.

E. Visitor Management

1. View visitors visiting their organization.
2. View visitor history.
3. Review visitor entry and exit records.
4. Approve or reject visitor requests when authorized.
5. Monitor active visitors.
6. Review visitor-related security incidents.

F. Monitoring & Reports

1. Monitor employee entry and exit activities.
2. Monitor visitor activities for their organization.
3. View organization-specific access logs.
4. Generate employee access reports.
5. Generate visitor reports.
6. Monitor assigned gates, where permitted.
7. Monitor their organization's guards and supervisors.

G. Operational Management

1. Assign supervisors to operational responsibilities.
2. Assign guards to approved gates or shifts.
3. Review operational activities.
4. Escalate security incidents to SUPER_ADMIN.

# 3. SUPERVISOR

Operational Management Level

Role description: SUPERVISOR is responsible for monitoring and supervising daily security and gate operations. The supervisor ensures that guards perform their duties correctly and that employee and visitor entry/exit activities are properly managed.

A supervisor operates within the organization or building scope assigned to them.

### Responsibilities

A. Daily Operations

1. Monitor daily gate operations.
2. Monitor employee entry and exit activities.
3. Monitor visitor entry and exit activities.
4. Monitor guard activities.
5. Ensure that assigned gates are operational.
6. Monitor pending visitor approvals.
7. Review unusual or suspicious access activities.

B. Guard Supervision

1. Monitor assigned guards.
2. Verify guard duty assignments.
3. Monitor guard attendance or shift status, if this feature is enabled.
4. Review guard activity records.
5. Guide guards in visitor registration procedures.
6. Report inappropriate guard activities.
7. Escalate operational problems to ADMIN or GUARD_ADMIN.

C. Visitor Management

1. View visitor registrations.
2. Review visitor information.
3. Approve or reject visits when explicitly authorized.
4. Monitor active visitor visits.
5. Review visitor check-in and check-out.
6. Handle visitor-related operational issues.
7. Escalate suspicious visitor cases.

D. Gate Monitoring & Control

1. Monitor live gate status.
2. View gate controller connectivity.
3. View gate activity.
4. Open gates manually only when authorized.
5. Monitor failed gate commands.
6. Report gate malfunctions.
7. Escalate emergencies.

E. Reports & Logs

1. View employee access logs.
2. View visitor logs.
3. Monitor guard activities.
4. Generate daily operational reports.
5. Review failed authentication attempts.
6. Report security incidents.

Restrictions:

- Cannot create ADMIN or SUPER_ADMIN.
- Cannot create roles or assign permissions unless explicitly delegated.
- Cannot change organization-wide security configuration.
- Cannot modify employee credentials unless authorized.
- Cannot access unrelated organizations' private data.

# 4. GUARD_ADMIN

Security Team Management Level

Role description: GUARD_ADMIN is responsible for managing the security guards and coordinating gate-level operations. This role acts as the link between guards and the supervisor/ADMIN.

Unlike SUPERVISOR, whose responsibility is broader operational monitoring, GUARD_ADMIN focuses specifically on the security team and its gate responsibilities.

### Responsibilities

A. Guard Management

1. View registered guards.
2. Create guard accounts only if explicitly delegated by ADMIN.
3. Update guard information.
4. Activate or deactivate guard accounts within delegated authority.
5. Assign guards to gates.
6. Assign guards to shifts.
7. Maintain guard duty assignments.
8. Monitor guard availability.
9. Review guard activities.
10. Report guard performance or misconduct.

B. Gate Assignment

1. View available gates.
2. Assign guards to authorized gates.
3. Manage gate duty allocation.
4. Monitor assigned gate operations.
5. Verify that guards are assigned to appropriate gates.
6. Report gate staffing problems.

C. Visitor Operations

1. Monitor visitor registrations.
2. Monitor active visitors.
3. Help guards resolve visitor registration issues.
4. Review visitor check-in and check-out records.
5. Escalate suspicious visitor cases.
6. Approve visits only if explicitly authorized.

D. Gate Monitoring

1. Monitor assigned gate status.
2. View ESP32 controller connectivity.
3. Monitor successful and failed gate operations.
4. Review manual gate operations.
5. Report device and hardware problems.
6. Request technical support when required.

E. Security Operations

1. Ensure guards follow security procedures.
2. Coordinate guard activities during busy periods.
3. Handle operational problems at gates.
4. Escalate emergencies to SUPERVISOR or ADMIN.
5. Maintain shift handover information, if enabled.

Restrictions:

- Cannot create ADMIN or SUPER_ADMIN.
- Cannot modify organization-wide employee records.
- Cannot assign permissions to other roles unless delegated.
- Cannot access system-wide settings.
- Cannot manage unrelated organizations.

# 5. GUARD

Gate Operations Level

Role description: GUARD is responsible for physical gate security and controlling the entry and exit of registered employees and visitors.

This is the primary operational role interacting with the physical gate and the visitor registration process.

### Responsibilities

A. Employee Entry & Exit

1. Monitor employee entry and exit.
2. Verify employee identity through RFID or fingerprint authentication.
3. Verify employee details when required.
4. Check employee authorization status.
5. Allow system-authorized employee entry.
6. Prevent unauthorized access.
7. Report invalid or suspicious credentials.
8. Assist employees when RFID or fingerprint authentication fails.

B. Visitor Registration

1. Register new visitors who are not present in the system.
2. Enter visitor name and basic details.
3. Select the organization being visited.
4. Select the host employee.
5. Record the purpose of the visit.
6. Capture visitor photograph when permitted and configured.
7. Submit visitor registration.
8. Verify visitor approval status.
9. Complete visitor check-in after authorization.
10. Complete visitor check-out when the visitor leaves.

C. Gate Operations

1. Monitor assigned gate status.
2. Monitor gate controller connectivity.
3. Open the gate using the authorized manual-control function.
4. Assist with employee entry and exit.
5. Manage authorized visitor entry.
6. Report gate-opening failures.
7. Report hardware malfunctions.
8. Follow emergency gate procedures.

D. Security Monitoring

1. Monitor entry and exit activity.
2. Identify suspicious access attempts.
3. Report unauthorized entry attempts.
4. Report suspicious visitor behavior.
5. Report unknown or unidentified individuals.
6. Maintain security discipline at the assigned gate.

E. Activity Records

1. Ensure visitor information is recorded correctly.
2. Ensure entry and exit events are recorded.
3. Record manual gate operations through the system.
4. Report incorrect access records.
5. Maintain shift handover information, if enabled.

Restrictions:

- Cannot create or manage organization ADMIN accounts.
- Cannot create users unless specifically delegated.
- Cannot modify employee personal details.
- Cannot register or change employee fingerprints or RFID mappings.
- Cannot change gate configurations.
- Cannot approve their own visitor requests when approval is required.
- Cannot view unrelated organizations' private employee records.

# 6. RECEPTIONIST

Front Desk / Visitor Management Level

Role description: RECEPTIONIST is responsible for handling visitors at the building reception or organization's front desk. This role primarily manages visitor registration, host identification, visit approval coordination and visitor check-in/check-out.

The receptionist does not have general security-administration authority.

### Responsibilities

A. Visitor Registration

1. Register new visitors.
2. Enter visitor basic details.
3. Search for previously registered visitors.
4. Update permitted visitor details.
5. Select the organization being visited.
6. Identify the host employee.
7. Record the purpose of the visit.
8. Capture visitor photograph when permitted.
9. Record visitor vehicle details when required.

B. Visitor Approval Coordination

1. Contact the host employee when a visitor arrives.
2. Submit visitor approval requests.
3. Monitor approval status.
4. Notify the visitor when approval is received.
5. Inform the guard when a visitor is authorized.
6. Handle rejected or cancelled visit requests.

C. Visitor Check-in & Check-out

1. Verify visitor registration details.
2. Verify approval status.
3. Complete check-in when authorized.
4. Issue a visitor pass or temporary identification, if enabled.
5. Monitor active visitors.
6. Record visitor check-out.
7. Identify overdue or unclosed visits.
8. Notify the responsible person about visitors who have not checked out.

D. Visitor Records

1. View visitor history within the assigned scope.
2. Search visitor records.
3. View active visitors.
4. View upcoming scheduled visits, if enabled.
5. Correct permitted visitor information.
6. Maintain accurate visit records.

E. Communication & Coordination

1. Contact host employees.
2. Coordinate with guards.
3. Inform supervisors about visitor-related issues.
4. Escalate suspicious visitor cases.
5. Help resolve visitor registration problems.

Restrictions:

- Cannot create ADMIN or operational staff accounts.
- Cannot change employee RFID or fingerprint credentials.
- Cannot change gate configuration.
- Cannot independently override visitor approval requirements.
- Cannot operate gates unless separately granted gate-control permission.
- Cannot access building-wide employee records or unrelated organization data.

# 7. Role hierarchy and reporting structure

This is the recommended organizational structure:

SUPER_ADMIN

Controls the complete building deployment

ADMIN

Manages an assigned organization

SUPERVISOR

Operational supervision

GUARD_ADMIN

Security team management

GUARD

Physical gate operations

RECEPTIONIST

Front desk and visitors

This is a reporting hierarchy, not an automatic permission inheritance hierarchy. For example, a SUPERVISOR should not automatically inherit every permission of an ADMIN.

# 8. Role creation and assignment rules

| Who creates/manages | SUPER_ADMIN | ADMIN | SUPERVISOR | GUARD_ADMIN | GUARD | RECEPTIONIST |
| ------------------- | ----------- | ----- | ---------- | ----------- | ----- | ------------ |
| Organizations       | Yes         | No    | No         | No          | No    | No           |
| ADMIN               | Yes         | No    | No         | No          | No    | No           |
| SUPERVISOR          | Yes         | Yes\* | No         | No          | No    | No           |
| GUARD_ADMIN         | Yes         | Yes\* | No         | No          | No    | No           |
| GUARD               | Yes         | Yes\* | No         | Delegated\* | No    | No           |
| RECEPTIONIST        | Yes         | Yes\* | No         | No          | No    | No           |
| Operational roles   | Yes         | Yes\* | No         | No          | No    | No           |

`*` Subject to the permissions delegated to that user. GUARD_ADMIN creating guard accounts is optional and should be explicitly enabled if you want that workflow.

# 9. Important RBAC design rules

For your existing RBAC architecture, I recommend enforcing these rules:

1. Role does not equal organization access. A user must have an organization assignment and a role assignment with the appropriate scope.
2. SUPER_ADMIN has building-level scope. ADMIN has organization-level scope.
3. No privilege escalation. A user cannot create or assign a role with more authority than they possess.
4. Permissions are action-specific. For example, `VISITOR_REGISTER` does not automatically mean `VISITOR_APPROVE` or `GATE_OPEN`.
5. Data visibility is scope-specific. A receptionist may see visitor records without seeing all employee records.
6. Gate control is separately permissioned. Being a guard does not automatically grant access to every gate.
7. Sensitive actions are audited. Record who created users, changed roles, revoked credentials, approved visitors and issued manual gate commands.
8. Backend authorization is mandatory. Hiding a sidebar item is not sufficient security.

# 10. Final recommended role definitions

| Role         | Primary responsibility                           | Scope                                     |
| ------------ | ------------------------------------------------ | ----------------------------------------- |
| SUPER_ADMIN  | Complete system and building administration      | All organizations                         |
| ADMIN        | Organization administration                      | Assigned organization                     |
| SUPERVISOR   | Daily operations and security supervision        | Assigned organization / operational scope |
| GUARD_ADMIN  | Guard team and gate duty management              | Assigned security team / gates            |
| GUARD        | Employee and visitor gate entry/exit operations  | Assigned gates                            |
| RECEPTIONIST | Visitor registration and front-desk coordination | Assigned organization / reception         |

My recommendation: Treat this as your initial role-and-responsibility baseline, not yet as the final database permission configuration. We should approve the responsibilities first, then map them to your existing `roles`, `permissions`, `role_permissions`, `user_roles`, `role_delegations` and `user_data_scopes` structures.

The next step should be to finalize the exact SUPERVISOR vs GUARD_ADMIN division, because both roles can otherwise overlap in monitoring guards, assigning duties and handling visitors.
