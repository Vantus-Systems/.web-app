# Deliverables for Admin Operations Refactoring

## 1. Migration Plan

### Database Schema Changes
The following optional JSON fields have been added to the `BingoGame` model in `prisma/schema.prisma`:
- `pricing_config`: Stores pricing model and amounts.
- `payout_config`: Stores payout type, amount/percentage, and description.
- `timeline_config`: Stores estimated duration and break status.

### Data Migration Steps
1.  **Backup Database**: Ensure a full backup exists before applying schema changes.
2.  **Apply Schema**: Run `npx prisma db push` (development) or `npx prisma migrate deploy` (production) to add the new columns.
    - *Note*: The new columns are nullable, so existing records will default to `null`.
3.  **Verify Data**: Check that `api/admin/programs` returns existing programs correctly (API handles nulls by providing default values).
4.  **No Data Transformation Required**: Backward compatibility is built into the API layer. Existing programs will function as "standard" model with default timelines until updated.

### Backward Compatibility
- **API**: `GET /api/admin/programs` returns a stable structure. New fields are populated with defaults if missing in DB.
- **UI**: The "Programs" and "Timeline" editors support both the legacy `rate_card_id` and the new `program_id` linking.

## 2. Test Report

### Summary
- **Test Suite**: `tests/server/api/programs.test.ts`
- **Framework**: Vitest
- **Total Tests**: 5
- **Passed**: 5
- **Failed**: 0

### Coverage
- **Overall Line Coverage**: 100%
- **Files Covered**:
    - `server/api/admin/programs.get.ts`: 100%
    - `server/api/admin/programs.post.ts`: 96% (Statements), 100% (Lines)

### Test Cases
1.  **GET /api/admin/programs**
    - Verifies retrieval of programs with parsed JSON configs.
    - Verifies default handling for missing configs.
2.  **POST /api/admin/programs**
    - Verifies saving of program with full game configurations.
    - Verifies validation error when referencing non-existent patterns.
    - Verifies schema validation (Zod) for invalid inputs (e.g., bad hex colors, negative numbers).

## 3. Implementation Summary

### Key Components
- **Program Editor**: Refactored to a 4-tab interface (General, Payout, Pricing, Timeline) for granular control.
- **Timeline Inspector**: Enhanced to support linking Flow Segments directly to Programs, with duration validation.
- **API Layer**: Hardened `programs.post.ts` with strict Zod validation and transactional updates.

### Security Enhancements
- **Input Validation**: Added regex for hex colors, min/max checks for numeric values.
- **Authorization**: Enforced `OWNER` role for all administrative mutations.
- **Audit Logging**: All program changes are logged via `auditService`.
