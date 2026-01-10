---
name: admin-workflows
description: Administrative workflows, RBAC hierarchy, and Proposal management.
---

# Admin Workflows

This skill details the administrative capabilities within the "Admin Portal" of Project SENTINEL.

## RBAC Hierarchy
Access is controlled via a strict hierarchy:
1.  **Owner:** Full system control, billing management, and destructive actions.
2.  **Admin:** Project creation, user management within Tenants.
3.  **Editor:** Can modify content and active projects.
4.  **Analyst:** Read-only access to data and reports.

## Workflows

### 1. Proposal to Project
The lifecycle of a new engagement:
*   **Draft:** Admin drafts a "Proposal".
*   **Approval:** Owner approves the Proposal.
*   **Conversion:** System converts the approved Proposal into a "Project" and generates initial "Contracts".

### 2. Lead Management
Handling inbound interest:
*   **Inbox:** Leads arrive in the "Inbox" status.
*   **Triage:** Admin assigns a status (`Qualified`, `Disqualified`, `Nurture`).
*   **Status Update:** Converting a Qualified Lead creates a Draft Proposal.

### 3. Audit Logging
*   **Requirement:** All privileged actions (e.g., changing RBAC roles, deleting Projects, accessing Environment Secrets) must be logged.
*   **Implementation:** Ensure the `AuditLog` service is called with the Actor ID, Action Type, and Target Resource ID.
