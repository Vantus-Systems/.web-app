---
name: prisma-data-model
description: Overview of the Project SENTINEL database schema and core entities.
---

# Prisma Data Model

This skill outlines the core entities and relationships in the `prisma/schema.prisma` file, designed for the multi-tenant operations suite, ensuring Fortune-500 level standards.

## Core Entities

### 1. Tenant
The top-level organizational unit.
*   **Key Fields:** `id`, `name`, `slug`, `subscriptionPlan`.
*   **Relationships:** Has many `Projects`, `Users` (via Membership), and `Environments`.

### 2. Project
A specific engagement or engineering initiative within a Tenant.
*   **Key Fields:** `id`, `tenantId`, `name`, `status`.
*   **Relationships:** Belongs to a `Tenant`. Has many `Contracts` and `Invoices`.

### 3. Contract
Legal agreements defining scope and terms.
*   **Key Fields:** `id`, `projectId`, `startDate`, `endDate`, `value`.
*   **Relationships:** Linked to a `Project`.

### 4. Invoice
Financial records linked to contracts.
*   **Key Fields:** `id`, `contractId`, `amount`, `status` (DRAFT, SENT, PAID).
*   **Relationships:** Linked to a `Contract`.

### 5. User
System users with access to one or more Tenants.
*   **Key Fields:** `id`, `email`, `mfaSecret` (for 2FA).
*   **Relationships:** Many-to-Many with `Tenants` via a Membership join table.

## Key Relationships & Constraints
*   **Multi-tenancy:** Almost all queries should filter by `tenantId` to ensure data isolation.
*   **Environments:** Tenants have specific `Environments` (Dev, Staging, Prod) which store configuration secrets.

## Soft Deletes
The system uses a "Soft Delete" pattern for critical records (`Tenant`, `Project`).
*   **Check:** Always ensure `deletedAt` is `null` when querying active records.
*   **Example:** `where: { deletedAt: null }`.

## Database Operations

### CLI Commands
*   **Generate Client:** `npx prisma generate`
    *   *When to use:* After modifying `schema.prisma` to update the type definitions.
*   **Migrate:** `npx prisma migrate dev`
    *   *When to use:* To apply schema changes to the local database and create a migration file.

### Documentation Review
Ensure all documentation in the `docs/` directory is updated to reflect data model changes.
