# Fortune-500 Admin Suite Refactor - December 30, 2025

## Completed Implementation

### Phase 0: Security & Governance Foundation ✅

**Permission System (`server/utils/permissions.ts`)**
- Granular RBAC with 20+ permissions (ops:edit, ops:publish, mic:approve, etc.)
- Role-to-permission mapping for OWNER, MIC, CHARITY roles
- Helper functions: hasPermission, assertPermission, assertAnyPermission

**CSRF Protection (`server/middleware/csrf.ts`)**
- Token-based CSRF validation on all mutating requests (POST/PUT/PATCH/DELETE)
- Server-side enforcement with token derivation from session
- Integrated with login endpoint (`server/api/auth/login.post.ts`)

**Rate Limiting (`server/utils/rateLimiter.ts`)**
- In-memory rate limiter for critical endpoints
- Login endpoint: 5 attempts per 15 minutes per IP
- Automatic cleanup of expired entries

**Version Control System (`server/services/version.service.ts`)**
- Draft → Publish → Rollback workflow
- Version history tracking in database
- Methods: getDraft, saveDraft, publish, rollback, discardDraft

**Audit Log API (`server/api/admin/audit-logs.get.ts`)**
- GET endpoint with filtering by entity, action, actor
- Returns audit logs with full actor information
- Pagination support (limit, offset)

**Strengthened Security**
- Password validation: 12+ chars with complexity requirements
- Updated `nuxt.config.ts` with nuxt-security module configuration
- CSP, HSTS, X-Frame-Options, rate limiting configured
- Removed sensitive logging from auth endpoints

**Permission-Based Endpoints**
- Updated `/api/admin/ops-schema.post.ts` - requires `ops:edit`
- Updated `/api/admin/ops-schema/publish.post.ts` - requires `ops:publish`
- Updated `/api/admin/shift-records.post.ts` - requires `mic:edit` OR `ops:edit`
- Updated `/api/admin/users.post.ts` - requires `people:edit` with audit logging

**Client-Side Composable (`composables/usePermissions.ts`)**
- Client-side permission checking for UI convenience
- Methods: hasPermission, hasAnyPermission, hasAllPermissions

### Phase 1: AdminShell + Navigation + Guidance System ✅

**New Components Created**
1. `AdminBreadcrumbs.vue` - Breadcrumb navigation with chevrons
2. `AdminEnvironmentBadge.vue` - Production/Staging/Development indicator with animated dot
3. `AdminCommandPalette.vue` - ⌘K searchable command palette for quick navigation
4. `AdminHelpPanel.vue` - Sliding help panel with contextual tips
5. `AdminPageHeader.vue` - Standardized page header with collapsible instructions

**Enhanced AdminShell (`components/admin/AdminShell.vue`)**
- Integrated breadcrumbs, environment badge, command palette button, help button
- Displays user permissions in help panel
- Removed page title/subtitle from shell (moved to AdminPageHeader)
- Added global keyboard shortcuts (⌘K for command palette)

**Updated Admin Pages**
- `/pages/admin/index.vue` - Now uses AdminPageHeader with built-in instructions
- Instructions explain each tab: Business Info, Jackpot, Specials, Operations

### Phase 2: Admin Design System & Reusable Components ✅

**Form Components**
- `AdminField.vue` - Label, hint, error display with accessibility
- Input components can be built using AdminField as wrapper

**Layout Components**
- `AdminSection.vue` - Standardized section with title, description, actions slot
- `AdminCard.vue` - Card with optional header/footer slots

**Data Display**
- `AdminTable.vue` - Sortable table with empty state, customizable cells via slots
- Supports column configuration with headerClass, cellClass

**Feedback Components**
- `AdminConfirmDialog.vue` - Modal confirmation with variants (default, danger, warning)
- `AdminToast.vue` - Toast notifications with auto-dismiss and progress bar
- `AdminSkeleton.vue` - Loading skeletons (card, table, form, text variants)
- `AdminEmptyState.vue` - Empty states with icons and action buttons

**Global Toast System (`composables/useToast.ts`)**
- Reactive toast management with show, success, error, warning, info methods
- Auto-dismiss with configurable duration
- Stacked toast display

## Architecture Patterns Established

**Security-First Design**
- ALL admin endpoints MUST use `assertPermission()` or `assertAnyPermission()`
- Server is source of truth; UI permission checks are convenience only
- CSRF tokens required on all mutating requests
- Rate limiting on sensitive endpoints

**Versioning Pattern**
- Settings stored as: `key`, `key:draft`, `key:history:N`
- Version metadata includes: version, publishedAt, publishedBy, comment
- Rollback restores old version and creates new history entry

**Audit Trail Pattern**
- All state-changing actions logged via `auditService.log()`
- Includes actor, action, entity, before/after state, timestamp
- Exposed via `/api/admin/audit-logs` with filtering

**Component Naming**
- Admin-specific components prefixed with `Admin*`
- Located in `components/admin/ui/` for design system
- General admin features in `components/admin/`

## Remaining Work

### Phase 3A: Operations Builder Refactor (NOT COMPLETED)
- Convert to stepper workflow
- Add templates (Weekday, Weekend, Special Event)
- Split-panel preview
- Validation summary before publish
- Server-side validation

### Phase 3B: MIC Shifts Refactor (NOT COMPLETED)
- Single-page form with collapsible sections
- Sticky totals panel (right-side)
- Autosave draft functionality
- Approval workflow (MIC submits → Owner approves)
- Server recomputes all totals

### Phase 4: People/Owner/Charities (NOT COMPLETED)
- People: Search, filters, bulk actions, role assignment warnings
- Owner: KPIs dashboard, approval queue, recent changes feed, scheduled publishes
- Charities: Full CRUD with validation

### Quality Gate (NOT COMPLETED)
- Add TypeScript strict mode (currently disabled)
- Fix all `any` types
- Run lint with zero warnings
- Run typecheck with zero errors
- Add basic tests for RBAC and key endpoints
- Verify accessibility (labels, focus states, keyboard navigation)

## How to Use

**Permission Checking (Server)**
```typescript
import { assertPermission } from "~/server/utils/permissions";
assertPermission(event.context.user?.role, "ops:publish");
```

**Permission Checking (Client)**
```typescript
const { hasPermission } = usePermissions(userRole);
if (hasPermission("people:edit")) {
  // Show edit UI
}
```

**Version Control**
```typescript
import { versionService } from "@server/services/version.service";

// Save draft
await versionService.saveDraft("ops_schema", data, userId);

// Publish
const { version } = await versionService.publish("ops_schema", userId, "Initial setup");

// Rollback
await versionService.rollback("ops_schema", 2, userId, "Reverting bad config");
```

**Toast Notifications**
```typescript
const toast = useToast();
toast.success("Changes saved successfully!");
toast.error("Failed to save changes", { duration: 0 }); // No auto-dismiss
```

## Known Issues

1. TypeScript strict mode disabled - many `any` types need fixing
2. Command palette icons are placeholders (using "svg" string)
3. CSRF middleware may need exclusion for public contact form
4. Rate limiter is in-memory - will reset on server restart
5. Version history not paginated - could grow large

## Next Steps for Production

1. Enable TypeScript strict mode
2. Add comprehensive tests
3. Implement persistent rate limiting (Redis/database)
4. Add Sentry error monitoring configuration
5. Complete Operations Builder refactor
6. Complete MIC Shifts refactor
7. Build People/Owner/Charities pages
8. Comprehensive accessibility audit
9. Performance testing
10. Security penetration testing
