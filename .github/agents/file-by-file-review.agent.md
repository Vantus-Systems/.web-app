---
description: "Recursive file-by-file auditor for Mary Esther Bingo. Includes a grounded file inventory and a strict protocol for reviewing every file for security, production readiness, and intra-repo wiring."
tools:
  ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'critical-thinking/*', 'desktop-commander/*', 'memory/*', 'sequentialthinking/*', 'serena/*', 'agent', 'memory', 'github.vscode-pull-request-github/copilotCodingAgent', 'github.vscode-pull-request-github/issue_fetch', 'github.vscode-pull-request-github/suggest-fix', 'github.vscode-pull-request-github/searchSyntax', 'github.vscode-pull-request-github/doSearch', 'github.vscode-pull-request-github/renderIssues', 'github.vscode-pull-request-github/activePullRequest', 'github.vscode-pull-request-github/openPullRequest', 'todo']
---

# File-by-File Review Agent — Full Repository Audit

This agent is designed to **review every file in this repository**, with a strict protocol that prevents skipping, hallucinating, or “blind refactors”.

## Mission
1. Verify wiring across files (imports, API contracts, DB models, UI consumers).
2. Identify and fix security issues (auth/RBAC/CSRF/input validation).
3. Enforce production readiness (no TODOs, no debug artifacts, consistent errors).
4. Preserve behavior while improving clarity and safety.

## Operating protocol (must follow)
For each file, in order:
1. Identify file role (UI/API/service/schema/config/script/test/doc/asset).
2. Enumerate dependencies:
   - imports in
   - exports out
   - callers/consumers (search references)
3. Run security checks relevant to the role:
   - API: Zod validation, auth/RBAC, CSRF, rate limiting, safe errors
   - UI: XSS vectors, unsafe HTML, auth gating
   - Scripts: avoid unsafe shell execution; avoid leaking secrets
4. Apply fixes with full context:
   - If changing a signature/shape, update every usage site.
5. Record completion in `audit_progress.md` (create/update).
6. Never mark a file as “done” until checks pass.

## Production gates (run repeatedly)
```bash
npm run lint
npm run typecheck
npm run build
npm run verify:admin
```

## Repository inventory snapshot (generated 2026-01-03)
- Total files: **333**
- Categories:
- **Vue component**: 81
- **Nitro API route**: 57
- **Documentation**: 37
- **Code**: 23
- **Nuxt page**: 22
- **Other**: 16
- **Config/data**: 15
- **Asset**: 13
- **Script**: 13
- **Shared util**: 11
- **Server service**: 8
- **Nuxt composable**: 7
- **Prisma**: 7
- **Test**: 6
- **Zod schema**: 5
- **Pinia store**: 3
- **CI workflow**: 2
- **Nuxt layout**: 2
- **Nuxt route middleware**: 2
- **Nitro middleware**: 2
- **DB client**: 1

### Automated scan signals (repo-wide)
- **http://**: 26 file(s)
- **console.log**: 25 file(s)
- **prisma queryRaw**: 5 file(s)
- **child_process shell**: 4 file(s)
- **innerHTML**: 3 file(s)
- **TODO/FIXME/HACK**: 1 file(s)
- **v-html**: 1 file(s)
- **dangerouslySetInnerHTML**: 1 file(s)
- **debugger**: 1 file(s)

Notes:
- Several flags (like `dangerouslySetInnerHTML` / `v-html`) appear only inside documentation files, not in runtime Vue components.
- `console.log` appears primarily in scripts/tests and one health endpoint; treat production logging explicitly during hardening.


# Appendix A — Full file inventory (every file, reviewed at least at metadata + signal level)

### `.agent/API_INVENTORY.md`
- Category: **Documentation**
- Size: 1477 bytes; 12 lines
- Signals: uses Zod, rate limiting
- Automated flags: (none)
- Notes: (none)

### `.agent/ARCHITECTURE_MAP.md`
- Category: **Documentation**
- Size: 1002 bytes; 16 lines
- Signals: uses Prisma, uses argon2, uses Tailwind, uses Pinia
- Automated flags: (none)
- Notes: (none)

### `.agent/NO_SKIP_LEDGER.md`
- Category: **Documentation**
- Size: 13441 bytes; 259 lines
- Signals: uses Prisma, uses Zod, uses argon2, CSRF, rate limiting, uses Tailwind
- Automated flags: (none)
- Notes: (none)

### `.agent/QA_RUNBOOK.md`
- Category: **Documentation**
- Size: 442 bytes; 14 lines
- Signals: uses Prisma, uses Playwright
- Automated flags: (none)
- Notes: (none)

### `.agent/SECURITY_HARDENING.md`
- Category: **Documentation**
- Size: 633 bytes; 14 lines
- Signals: CSRF
- Automated flags: TODO/FIXME/HACK
- Notes: (none)

### `.agent/UI_ACTION_INVENTORY.md`
- Category: **Documentation**
- Size: 143 bytes; 4 lines
- Automated flags: (none)
- Notes: (none)

### `.agent/WIRING_GAPS.md`
- Category: **Documentation**
- Size: 136 bytes; 6 lines
- Automated flags: (none)
- Notes: (none)

### `.env.example`
- Category: **Other**
- Size: 240 bytes; 10 lines
- Automated flags: (none)
- Notes: Environment template: ensure all required runtime vars are listed and no secrets committed.

### `.eslintrc.cjs`
- Category: **Code**
- Size: 347 bytes; 16 lines
- Automated flags: (none)
- Notes: (none)

### `.github/agents/backend.agent.md`
- Category: **Documentation**
- Size: 5666 bytes; 153 lines
- Signals: uses Zod, uses Playwright
- Automated flags: (none)
- Notes: (none)

### `.github/agents/frontend.agent.md`
- Category: **Documentation**
- Size: 4014 bytes; 100 lines
- Signals: uses Playwright, uses Tailwind, uses Pinia
- Automated flags: (none)
- Notes: (none)

### `.github/agents/gpt-5-crack-head.agent.md`
- Category: **Documentation**
- Size: 7776 bytes; 180 lines
- Automated flags: (none)
- Notes: (none)

### `.github/agents/pricing.agent.md`
- Category: **Documentation**
- Size: 6241 bytes; 102 lines
- Signals: uses Zod, uses Playwright
- Automated flags: (none)
- Notes: (none)

### `.github/agents/schedule.agent.md`
- Category: **Documentation**
- Size: 6216 bytes; 102 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `.github/agents/thinking-beast.agent.md`
- Category: **Documentation**
- Size: 17947 bytes; 337 lines
- Automated flags: (none)
- Notes: (none)

### `.github/aurora_design_system.md`
- Category: **Documentation**
- Size: 11406 bytes; 327 lines
- Automated flags: (none)
- Notes: (none)

### `.github/copilot-instructions.md`
- Category: **Documentation**
- Size: 11034 bytes; 252 lines
- Signals: uses Prisma, uses Zod, CSRF, rate limiting, uses Tailwind, uses Pinia
- Automated flags: (none)
- Notes: (none)

### `.github/design_system.md`
- Category: **Documentation**
- Size: 7025 bytes; 308 lines
- Automated flags: (none)
- Notes: (none)

### `.github/workflows/ci-health-check.yml`
- Category: **CI workflow**
- Size: 1807 bytes; 74 lines
- Automated flags: http://
- Notes: (none)

### `.github/workflows/scheduled-monitor.yml`
- Category: **CI workflow**
- Size: 4065 bytes; 110 lines
- Automated flags: console.log
- Notes: (none)

### `.gitignore`
- Category: **Other**
- Size: 312 bytes; 34 lines
- Automated flags: (none)
- Notes: (none)

### `.serena/.gitignore`
- Category: **Other**
- Size: 7 bytes; 1 lines
- Automated flags: (none)
- Notes: (none)

### `.serena/memories/critical-security-findings.md`
- Category: **Documentation**
- Size: 1873 bytes; 71 lines
- Signals: CSRF
- Automated flags: console.log
- Notes: (none)

### `.serena/memories/fortune-500-admin-refactor.md`
- Category: **Documentation**
- Size: 7600 bytes; 200 lines
- Signals: CSRF, rate limiting
- Automated flags: (none)
- Notes: (none)

### `.serena/memories/project-architecture.md`
- Category: **Documentation**
- Size: 1873 bytes; 55 lines
- Signals: uses Prisma, uses Zod, uses argon2, uses Tailwind, uses Pinia
- Automated flags: (none)
- Notes: (none)

### `.serena/project.yml`
- Category: **Other**
- Size: 5595 bytes; 84 lines
- Automated flags: (none)
- Notes: (none)

### `.well-known/appspecific/com.chrome.devtools.json`
- Category: **Config/data**
- Size: 583 bytes; 23 lines
- Automated flags: http://
- Notes: (none)

### `AUDIT_SUMMARY.md`
- Category: **Documentation**
- Size: 2673 bytes; 50 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `CHANGES_SUMMARY.md`
- Category: **Documentation**
- Size: 10185 bytes; 266 lines
- Signals: uses Prisma, CSRF
- Automated flags: http://
- Notes: (none)

### `DELIVERABLES.md`
- Category: **Documentation**
- Size: 2743 bytes; 56 lines
- Signals: uses Prisma, uses Zod
- Automated flags: (none)
- Notes: (none)

### `FORTUNE10000_IMPLEMENTATION.md`
- Category: **Documentation**
- Size: 8658 bytes; 269 lines
- Signals: uses Playwright, uses Tailwind, uses Pinia
- Automated flags: (none)
- Notes: (none)

### `NO_SKIP_LEDGER.md`
- Category: **Documentation**
- Size: 13441 bytes; 259 lines
- Signals: uses Prisma, uses Zod, uses argon2, CSRF, rate limiting, uses Tailwind
- Automated flags: (none)
- Notes: (none)

### `PRODUCTION_AUDIT_REPORT.md`
- Category: **Documentation**
- Size: 15658 bytes; 608 lines
- Signals: uses Prisma, uses Zod, uses argon2, reads cookies, CSRF, uses h3, uses Playwright, uses Tailwind
- Automated flags: console.log, v-html, innerHTML, dangerouslySetInnerHTML
- Notes: (none)

### `QUALITY_AUDIT_COMPLETE.md`
- Category: **Documentation**
- Size: 8290 bytes; 277 lines
- Signals: uses Prisma, uses Zod, CSRF
- Automated flags: (none)
- Notes: (none)

### `README.md`
- Category: **Documentation**
- Size: 12762 bytes; 311 lines
- Signals: uses Prisma, uses Zod, CSRF, uses Playwright, uses Tailwind, uses Pinia
- Automated flags: http://
- Notes: (none)

### `VERIFICATION_AUDIT_SUMMARY.md`
- Category: **Documentation**
- Size: 10731 bytes; 349 lines
- Signals: uses Playwright
- Automated flags: http://
- Notes: (none)

### `VERIFICATION_CHECKLIST.md`
- Category: **Documentation**
- Size: 5103 bytes; 203 lines
- Signals: uses Playwright
- Automated flags: (none)
- Notes: (none)

### `WIRING_AUDIT_REPORT.md`
- Category: **Documentation**
- Size: 2876 bytes; 43 lines
- Signals: uses Prisma, uses Zod, uses Tailwind, uses Pinia
- Automated flags: (none)
- Notes: (none)

### `app.vue`
- Category: **Code**
- Size: 71 bytes; 5 lines
- Automated flags: (none)
- Notes: (none)

### `assets/css/pdf/fw2g.pdf`
- Category: **Asset**
- Size: 144972 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `assets/css/tailwind.css`
- Category: **Other**
- Size: 220 bytes; 20 lines
- Automated flags: (none)
- Notes: (none)

### `assets/images/AdobeStock_1619675428.svg`
- Category: **Asset**
- Size: 84903 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `assets/images/AdobeStock_226274460.jpeg`
- Category: **Asset**
- Size: 5958992 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `assets/images/AdobeStock_245908028.jpeg`
- Category: **Asset**
- Size: 1482167 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `assets/images/AdobeStock_393911855.jpeg`
- Category: **Asset**
- Size: 5820899 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `assets/images/AdobeStock_577457978.png`
- Category: **Asset**
- Size: 18856739 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `assets/pdf/fw2g.pdf`
- Category: **Asset**
- Size: 144972 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `check-tables.js`
- Category: **Code**
- Size: 673 bytes; 29 lines
- Signals: uses Prisma
- Automated flags: console.log, prisma queryRaw
- Notes: (none)

### `components/DailySpecials.vue`
- Category: **Vue component**
- Size: 10666 bytes; 270 lines
- Automated flags: (none)
- Notes: (none)

### `components/ScheduleEventCard.vue`
- Category: **Vue component**
- Size: 12131 bytes; 358 lines
- Automated flags: (none)
- Notes: (none)

### `components/TheFooter.vue`
- Category: **Vue component**
- Size: 4708 bytes; 134 lines
- Automated flags: (none)
- Notes: (none)

### `components/TheNavbar.vue`
- Category: **Vue component**
- Size: 3838 bytes; 115 lines
- Automated flags: (none)
- Notes: (none)

### `components/TheSkipLink.vue`
- Category: **Vue component**
- Size: 333 bytes; 8 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/AdminShell.vue`
- Category: **Vue component**
- Size: 9315 bytes; 276 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/AdminSidebar.vue`
- Category: **Vue component**
- Size: 3353 bytes; 112 lines
- Automated flags: http://
- Notes: (none)

### `components/admin/BulkActions.vue`
- Category: **Vue component**
- Size: 1231 bytes; 50 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/OperationsBuilder.vue`
- Category: **Vue component**
- Size: 18021 bytes; 528 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/PatternEditor.vue`
- Category: **Vue component**
- Size: 21957 bytes; 600 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/PricingEditor.vue`
- Category: **Vue component**
- Size: 30340 bytes; 869 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ProgramEditor.vue`
- Category: **Vue component**
- Size: 42313 bytes; 1062 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ProgressiveEditor.vue`
- Category: **Vue component**
- Size: 10228 bytes; 296 lines
- Automated flags: http://
- Notes: (none)

### `components/admin/ShiftsTable.vue`
- Category: **Vue component**
- Size: 4235 bytes; 106 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/UserModal.vue`
- Category: **Vue component**
- Size: 8081 bytes; 236 lines
- Automated flags: http://
- Notes: (none)

### `components/admin/UserSearchFilters.vue`
- Category: **Vue component**
- Size: 2519 bytes; 97 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/W2GGenerator.vue`
- Category: **Vue component**
- Size: 20117 bytes; 614 lines
- Automated flags: http://
- Notes: (none)

### `components/admin/mic/DailyTotals.vue`
- Category: **Vue component**
- Size: 3306 bytes; 99 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/HolidayBanner.vue`
- Category: **Vue component**
- Size: 1160 bytes; 44 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/IncidentPanel.vue`
- Category: **Vue component**
- Size: 1392 bytes; 45 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/KpiCards.vue`
- Category: **Vue component**
- Size: 2036 bytes; 65 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/LowStockPanel.vue`
- Category: **Vue component**
- Size: 909 bytes; 31 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/RestrictedPlayersList.vue`
- Category: **Vue component**
- Size: 1694 bytes; 63 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/ShiftDepositCard.vue`
- Category: **Vue component**
- Size: 15654 bytes; 417 lines
- Automated flags: http://
- Notes: (none)

### `components/admin/mic/ShiftForm.vue`
- Category: **Vue component**
- Size: 11755 bytes; 410 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/ShiftSummary.vue`
- Category: **Vue component**
- Size: 1501 bytes; 53 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/ShiftWizard.vue`
- Category: **Vue component**
- Size: 22323 bytes; 720 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/StickyTotalsSidebar.vue`
- Category: **Vue component**
- Size: 3954 bytes; 134 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/charts/PulltabsTrendLine.vue`
- Category: **Vue component**
- Size: 1533 bytes; 59 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/mic/charts/WeeklyAmPmBar.vue`
- Category: **Vue component**
- Size: 1698 bytes; 54 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/BingoStep.vue`
- Category: **Vue component**
- Size: 4534 bytes; 163 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/DayProfileInspector.vue`
- Category: **Vue component**
- Size: 9215 bytes; 314 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/DayProfileLibrary.vue`
- Category: **Vue component**
- Size: 2980 bytes; 96 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/DaysStep.vue`
- Category: **Vue component**
- Size: 3549 bytes; 116 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/MasterCalendarCanvas.vue`
- Category: **Vue component**
- Size: 4127 bytes; 137 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/OpsSchemaCalendarEditor.vue`
- Category: **Vue component**
- Size: 20055 bytes; 555 lines
- Automated flags: http://
- Notes: (none)

### `components/admin/ops/OpsSchemaPricingEditor.vue`
- Category: **Vue component**
- Size: 18523 bytes; 629 lines
- Automated flags: http://
- Notes: (none)

### `components/admin/ops/OpsSchemaPricingEditorEnhanced.vue`
- Category: **Vue component**
- Size: 38761 bytes; 1276 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/PreviewStep.vue`
- Category: **Vue component**
- Size: 3863 bytes; 112 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/RateCardPalette.vue`
- Category: **Vue component**
- Size: 2861 bytes; 92 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/SessionsStep.vue`
- Category: **Vue component**
- Size: 3934 bytes; 129 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/SimulationTimeline.vue`
- Category: **Vue component**
- Size: 9061 bytes; 297 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/StagePreview.vue`
- Category: **Vue component**
- Size: 3246 bytes; 103 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/TimelineCanvas.vue`
- Category: **Vue component**
- Size: 12003 bytes; 375 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/TimelineCanvasEnhanced.vue`
- Category: **Vue component**
- Size: 32598 bytes; 957 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/TimelineInspector.vue`
- Category: **Vue component**
- Size: 9685 bytes; 325 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ops/TimelineInspectorEnhanced.vue`
- Category: **Vue component**
- Size: 36194 bytes; 1015 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/pricing/InspectorPanel.vue`
- Category: **Vue component**
- Size: 8507 bytes; 264 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/pricing/RateCardLibrary.vue`
- Category: **Vue component**
- Size: 4803 bytes; 147 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/pricing/TimelineGantt.vue`
- Category: **Vue component**
- Size: 7104 bytes; 215 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/schedule/ScheduleCanvas.vue`
- Category: **Vue component**
- Size: 15815 bytes; 451 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/schedule/ScheduleContextMenu.vue`
- Category: **Vue component**
- Size: 5098 bytes; 99 lines
- Automated flags: http://
- Notes: (none)

### `components/admin/schedule/ScheduleDayCard.vue`
- Category: **Vue component**
- Size: 7960 bytes; 197 lines
- Automated flags: http://
- Notes: (none)

### `components/admin/schedule/ScheduleInspector.vue`
- Category: **Vue component**
- Size: 14073 bytes; 368 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/schedule/ScheduleMiniTimeline.vue`
- Category: **Vue component**
- Size: 5582 bytes; 145 lines
- Automated flags: http://
- Notes: (none)

### `components/admin/schedule/ScheduleProfileLibrary.vue`
- Category: **Vue component**
- Size: 2940 bytes; 82 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/schedule/ScheduleTimePrompt.vue`
- Category: **Vue component**
- Size: 1762 bytes; 55 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminBreadcrumbs.vue`
- Category: **Vue component**
- Size: 1007 bytes; 44 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminCard.vue`
- Category: **Vue component**
- Size: 420 bytes; 13 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminCommandPalette.vue`
- Category: **Vue component**
- Size: 8240 bytes; 275 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminConfirmDialog.vue`
- Category: **Vue component**
- Size: 5560 bytes; 185 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminEmptyState.vue`
- Category: **Vue component**
- Size: 2551 bytes; 81 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminEnvironmentBadge.vue`
- Category: **Vue component**
- Size: 1320 bytes; 59 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminField.vue`
- Category: **Vue component**
- Size: 1415 bytes; 59 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminHelpPanel.vue`
- Category: **Vue component**
- Size: 3168 bytes; 114 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminPageHeader.vue`
- Category: **Vue component**
- Size: 2875 bytes; 107 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminSection.vue`
- Category: **Vue component**
- Size: 618 bytes; 25 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminSkeleton.vue`
- Category: **Vue component**
- Size: 1290 bytes; 43 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminTable.vue`
- Category: **Vue component**
- Size: 4473 bytes; 152 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminToast.vue`
- Category: **Vue component**
- Size: 6270 bytes; 218 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminToastContainer.vue`
- Category: **Vue component**
- Size: 4618 bytes; 131 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/ui/AdminWizard.vue`
- Category: **Vue component**
- Size: 10474 bytes; 288 lines
- Automated flags: (none)
- Notes: (none)

### `components/admin/users/PeopleDirectory.vue`
- Category: **Vue component**
- Size: 10996 bytes; 328 lines
- Automated flags: http://
- Notes: (none)

### `components/bingo/BingoPatternGrid.vue`
- Category: **Vue component**
- Size: 3030 bytes; 125 lines
- Automated flags: (none)
- Notes: (none)

### `components/bingo/ProgramTable.vue`
- Category: **Vue component**
- Size: 4382 bytes; 139 lines
- Automated flags: (none)
- Notes: (none)

### `components/ui/BaseButton.vue`
- Category: **Vue component**
- Size: 929 bytes; 36 lines
- Automated flags: (none)
- Notes: (none)

### `components/ui/BaseButtonEnhanced.vue`
- Category: **Vue component**
- Size: 2834 bytes; 105 lines
- Automated flags: (none)
- Notes: (none)

### `components/ui/BaseButtonUpdated.vue`
- Category: **Vue component**
- Size: 2834 bytes; 105 lines
- Automated flags: (none)
- Notes: (none)

### `components/ui/BaseCard.vue`
- Category: **Vue component**
- Size: 658 bytes; 35 lines
- Automated flags: (none)
- Notes: (none)

### `components/ui/BaseModal.vue`
- Category: **Vue component**
- Size: 4633 bytes; 161 lines
- Automated flags: http://
- Notes: (none)

### `components/ui/InspectorField.vue`
- Category: **Vue component**
- Size: 6693 bytes; 277 lines
- Automated flags: http://
- Notes: (none)

### `composables/useAuthUser.ts`
- Category: **Nuxt composable**
- Size: 805 bytes; 36 lines
- Automated flags: (none)
- Notes: (none)

### `composables/useAutosave.ts`
- Category: **Nuxt composable**
- Size: 3434 bytes; 147 lines
- Automated flags: (none)
- Notes: (none)

### `composables/useBusiness.ts`
- Category: **Nuxt composable**
- Size: 1794 bytes; 77 lines
- Automated flags: (none)
- Notes: (none)

### `composables/useCsrf.ts`
- Category: **Nuxt composable**
- Size: 508 bytes; 26 lines
- Signals: CSRF
- Automated flags: (none)
- Notes: (none)

### `composables/usePermissions.ts`
- Category: **Nuxt composable**
- Size: 1869 bytes; 78 lines
- Automated flags: (none)
- Notes: (none)

### `composables/useScheduleClock.ts`
- Category: **Nuxt composable**
- Size: 3881 bytes; 137 lines
- Automated flags: (none)
- Notes: (none)

### `composables/useToast.ts`
- Category: **Nuxt composable**
- Size: 2158 bytes; 99 lines
- Automated flags: (none)
- Notes: (none)

### `coverage/base.css`
- Category: **Other**
- Size: 5394 bytes; 224 lines
- Automated flags: (none)
- Notes: (none)

### `coverage/block-navigation.js`
- Category: **Code**
- Size: 2655 bytes; 87 lines
- Automated flags: (none)
- Notes: (none)

### `coverage/clover.xml`
- Category: **Other**
- Size: 2016 bytes; 37 lines
- Automated flags: (none)
- Notes: (none)

### `coverage/coverage-final.json`
- Category: **Config/data**
- Size: 8171 bytes; 3 lines
- Automated flags: (none)
- Notes: (none)

### `coverage/favicon.png`
- Category: **Asset**
- Size: 445 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `coverage/index.html`
- Category: **Other**
- Size: 5073 bytes; 131 lines
- Automated flags: (none)
- Notes: (none)

### `coverage/prettify.css`
- Category: **Other**
- Size: 676 bytes; 1 lines
- Automated flags: (none)
- Notes: (none)

### `coverage/prettify.js`
- Category: **Code**
- Size: 17590 bytes; 2 lines
- Automated flags: console.log, debugger, innerHTML
- Notes: (none)

### `coverage/programs.get.ts.html`
- Category: **Other**
- Size: 7987 bytes; 208 lines
- Automated flags: (none)
- Notes: (none)

### `coverage/programs.post.ts.html`
- Category: **Other**
- Size: 18785 bytes; 460 lines
- Automated flags: (none)
- Notes: (none)

### `coverage/sort-arrow-sprite.png`
- Category: **Asset**
- Size: 138 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `coverage/sorter.js`
- Category: **Code**
- Size: 6731 bytes; 210 lines
- Automated flags: innerHTML
- Notes: (none)

### `docs/API_ENDPOINTS.md`
- Category: **Documentation**
- Size: 10963 bytes; 138 lines
- Signals: CSRF
- Automated flags: (none)
- Notes: (none)

### `docs/AUDIT_REPORT.md`
- Category: **Documentation**
- Size: 2404 bytes; 40 lines
- Signals: uses Prisma, uses Zod, CSRF, uses Tailwind
- Automated flags: (none)
- Notes: (none)

### `docs/LOCAL_DEV.md`
- Category: **Documentation**
- Size: 1396 bytes; 48 lines
- Signals: uses Prisma, CSRF
- Automated flags: (none)
- Notes: (none)

### `docs/PRODUCTION_DEPLOYMENT.md`
- Category: **Documentation**
- Size: 1479 bytes; 63 lines
- Signals: uses Prisma, CSRF
- Automated flags: (none)
- Notes: (none)

### `docs/PROGRAM_EDITOR_MANUAL.md`
- Category: **Documentation**
- Size: 4005 bytes; 91 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `docs/RUNBOOK.md`
- Category: **Documentation**
- Size: 1160 bytes; 45 lines
- Signals: uses Prisma
- Automated flags: (none)
- Notes: (none)

### `docs/VERIFICATION.md`
- Category: **Documentation**
- Size: 600 bytes; 26 lines
- Signals: uses Playwright
- Automated flags: http://
- Notes: (none)

### `eslint-report.json`
- Category: **Config/data**
- Size: 95730 bytes; 1 lines
- Signals: uses Prisma, uses Zod, uses Tailwind
- Automated flags: (none)
- Notes: (none)

### `layouts/blank.vue`
- Category: **Nuxt layout**
- Size: 74 bytes; 5 lines
- Automated flags: (none)
- Notes: (none)

### `layouts/default.vue`
- Category: **Nuxt layout**
- Size: 307 bytes; 14 lines
- Automated flags: (none)
- Notes: (none)

### `mcp.json`
- Category: **Config/data**
- Size: 86 bytes; 8 lines
- Automated flags: (none)
- Notes: (none)

### `middleware/auth.ts`
- Category: **Nuxt route middleware**
- Size: 505 bytes; 17 lines
- Automated flags: (none)
- Notes: (none)

### `middleware/role.ts`
- Category: **Nuxt route middleware**
- Size: 575 bytes; 21 lines
- Automated flags: (none)
- Notes: (none)

### `nuxt.config.ts`
- Category: **Code**
- Size: 2725 bytes; 108 lines
- Signals: rate limiting, uses Tailwind, uses Pinia
- Automated flags: (none)
- Notes: (none)

### `package-lock.json`
- Category: **Config/data**
- Size: 631678 bytes; 21781 lines
- Signals: uses Prisma, uses Zod, uses argon2, uses Playwright, uses Tailwind, uses Pinia
- Automated flags: (none)
- Notes: (none)

### `package.json`
- Category: **Config/data**
- Size: 2688 bytes; 84 lines
- Signals: uses Prisma, uses Zod, uses argon2, uses Tailwind, uses Pinia
- Automated flags: (none)
- Notes: (none)

### `pages/about.vue`
- Category: **Nuxt page**
- Route: **/about**
- Size: 5534 bytes; 149 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/charities/index.vue`
- Category: **Nuxt page**
- Route: **/admin/charities**
- Size: 10172 bytes; 329 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/index.vue`
- Category: **Nuxt page**
- Route: **/admin**
- Size: 18219 bytes; 501 lines
- Automated flags: http://
- Notes: (none)

### `pages/admin/login.vue`
- Category: **Nuxt page**
- Route: **/admin/login**
- Size: 3472 bytes; 98 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/mic/index.vue`
- Category: **Nuxt page**
- Route: **/admin/mic**
- Size: 4467 bytes; 153 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/mic/restricted-players.vue`
- Category: **Nuxt page**
- Route: **/admin/mic/restricted-players**
- Size: 4227 bytes; 165 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/mic/shifts.vue`
- Category: **Nuxt page**
- Route: **/admin/mic/shifts**
- Size: 24944 bytes; 721 lines
- Automated flags: http://
- Notes: (none)

### `pages/admin/mic/shifts/[id].vue`
- Category: **Nuxt page**
- Route: **/admin/mic/shifts/:id**
- Size: 4737 bytes; 172 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/operations-enhanced.vue`
- Category: **Nuxt page**
- Route: **/admin/operations-enhanced**
- Size: 5664 bytes; 226 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/operations/index.vue`
- Category: **Nuxt page**
- Route: **/admin/operations**
- Size: 1233 bytes; 51 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/operations/schedule/print.vue`
- Category: **Nuxt page**
- Route: **/admin/operations/schedule/print**
- Size: 2614 bytes; 98 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/operations/schedule/tv.vue`
- Category: **Nuxt page**
- Route: **/admin/operations/schedule/tv**
- Size: 6554 bytes; 244 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/owner/index.vue`
- Category: **Nuxt page**
- Route: **/admin/owner**
- Size: 9526 bytes; 328 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/people/index.vue`
- Category: **Nuxt page**
- Route: **/admin/people**
- Size: 5151 bytes; 176 lines
- Automated flags: (none)
- Notes: (none)

### `pages/admin/progressives.vue`
- Category: **Nuxt page**
- Route: **/admin/progressives**
- Size: 6311 bytes; 204 lines
- Automated flags: (none)
- Notes: (none)

### `pages/contact.vue`
- Category: **Nuxt page**
- Route: **/contact**
- Size: 9598 bytes; 278 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `pages/house-rules.vue`
- Category: **Nuxt page**
- Route: **/house-rules**
- Size: 5142 bytes; 131 lines
- Automated flags: (none)
- Notes: (none)

### `pages/index.vue`
- Category: **Nuxt page**
- Route: **/**
- Size: 8872 bytes; 260 lines
- Automated flags: (none)
- Notes: (none)

### `pages/pricing.vue`
- Category: **Nuxt page**
- Route: **/pricing**
- Size: 36676 bytes; 939 lines
- Automated flags: (none)
- Notes: (none)

### `pages/privacy.vue`
- Category: **Nuxt page**
- Route: **/privacy**
- Size: 3572 bytes; 101 lines
- Automated flags: (none)
- Notes: (none)

### `pages/programs.vue`
- Category: **Nuxt page**
- Route: **/programs**
- Size: 3436 bytes; 111 lines
- Automated flags: http://
- Notes: (none)

### `pages/schedule.vue`
- Category: **Nuxt page**
- Route: **/schedule**
- Size: 15126 bytes; 474 lines
- Automated flags: (none)
- Notes: (none)

### `pricing.png`
- Category: **Asset**
- Size: 1918477 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `prisma/migrations/20251227213106_init/migration.sql`
- Category: **Prisma**
- Size: 3602 bytes; 113 lines
- Automated flags: (none)
- Notes: (none)

### `prisma/migrations/20251230120000_roles_shifts/migration.sql`
- Category: **Prisma**
- Size: 1938 bytes; 56 lines
- Automated flags: (none)
- Notes: (none)

### `prisma/migrations/20260103071444_update/migration.sql`
- Category: **Prisma**
- Size: 6282 bytes; 146 lines
- Automated flags: (none)
- Notes: (none)

### `prisma/migrations/20260103100253_program_refactor/migration.sql`
- Category: **Prisma**
- Size: 244 bytes; 4 lines
- Automated flags: (none)
- Notes: (none)

### `prisma/migrations/migration_lock.toml`
- Category: **Prisma**
- Size: 122 bytes; 3 lines
- Automated flags: (none)
- Notes: (none)

### `prisma/schema.prisma`
- Category: **Prisma**
- Size: 8919 bytes; 272 lines
- Automated flags: (none)
- Notes: (none)

### `prisma/seed.js`
- Category: **Prisma**
- Size: 11539 bytes; 426 lines
- Signals: uses Prisma, uses argon2
- Automated flags: console.log, prisma queryRaw
- Notes: (none)

### `public/favicon.ico`
- Category: **Asset**
- Size: 4286 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `public/robots.txt`
- Category: **Other**
- Size: 24 bytes; 2 lines
- Automated flags: (none)
- Notes: (none)

### `scripts/check-db.js`
- Category: **Script**
- Size: 1415 bytes; 50 lines
- Signals: uses Prisma
- Automated flags: console.log, prisma queryRaw
- Notes: (none)

### `scripts/check-ops-schema.cjs`
- Category: **Script**
- Size: 333 bytes; 13 lines
- Signals: uses Prisma
- Automated flags: console.log
- Notes: (none)

### `scripts/clean-prisma-db.js`
- Category: **Script**
- Size: 718 bytes; 40 lines
- Signals: uses Prisma
- Automated flags: console.log
- Notes: (none)

### `scripts/integration/missing-tables.unit.ts`
- Category: **Script**
- Size: 2539 bytes; 94 lines
- Automated flags: console.log, child_process shell, http://
- Notes: (none)

### `scripts/list-tables.mjs`
- Category: **Script**
- Size: 365 bytes; 13 lines
- Signals: uses Prisma
- Automated flags: console.log, prisma queryRaw
- Notes: (none)

### `scripts/migrate-settings.ts`
- Category: **Script**
- Size: 2355 bytes; 88 lines
- Signals: uses Prisma
- Automated flags: console.log
- Notes: (none)

### `scripts/postinstall.js`
- Category: **Script**
- Size: 1657 bytes; 59 lines
- Automated flags: console.log, child_process shell
- Notes: (none)

### `scripts/query-settings.js`
- Category: **Script**
- Size: 1376 bytes; 47 lines
- Signals: uses Prisma
- Automated flags: console.log
- Notes: (none)

### `scripts/query-users.js`
- Category: **Script**
- Size: 1311 bytes; 45 lines
- Signals: uses Prisma
- Automated flags: console.log
- Notes: (none)

### `scripts/setup-db.js`
- Category: **Script**
- Size: 3532 bytes; 124 lines
- Signals: uses Prisma
- Automated flags: console.log, child_process shell
- Notes: (none)

### `scripts/start-server.js`
- Category: **Script**
- Size: 1100 bytes; 47 lines
- Automated flags: console.log, child_process shell
- Notes: (none)

### `scripts/test-db-check.js`
- Category: **Script**
- Size: 735 bytes; 29 lines
- Signals: uses Prisma
- Automated flags: console.log, prisma queryRaw
- Notes: (none)

### `scripts/test-health.js`
- Category: **Script**
- Size: 84 bytes; 2 lines
- Automated flags: console.log
- Notes: (none)

### `server/api/admin/approval-requests.ts`
- Category: **Nitro API route**
- Route: `ANY` **/api/admin/approval-requests**
- Size: 2357 bytes; 95 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: Uses readBody without obvious Zod validation in-file; verify validation happens in called function.

### `server/api/admin/approval-requests/[id].ts`
- Category: **Nitro API route**
- Route: `ANY` **/api/admin/approval-requests/:id**
- Size: 2009 bytes; 81 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: Uses readBody without obvious Zod validation in-file; verify validation happens in called function.

### `server/api/admin/audit-logs.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/audit-logs**
- Size: 1944 bytes; 77 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/business.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/business**
- Size: 1047 bytes; 37 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/charities.ts`
- Category: **Nitro API route**
- Route: `ANY` **/api/admin/charities**
- Size: 2005 bytes; 80 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: Uses readBody without obvious Zod validation in-file; verify validation happens in called function.

### `server/api/admin/charities/[id].ts`
- Category: **Nitro API route**
- Route: `ANY` **/api/admin/charities/:id**
- Size: 2848 bytes; 113 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: Uses readBody without obvious Zod validation in-file; verify validation happens in called function.

### `server/api/admin/holiday-rules.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/holiday-rules**
- Size: 723 bytes; 26 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/holiday-rules.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/holiday-rules**
- Size: 2243 bytes; 76 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/jackpot.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/jackpot**
- Size: 1882 bytes; 61 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/messages.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/messages**
- Size: 336 bytes; 10 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/mic/incidents.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/mic/incidents**
- Size: 1357 bytes; 50 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/mic/incidents.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/mic/incidents**
- Size: 1368 bytes; 48 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/mic/incidents/[id].put.ts`
- Category: **Nitro API route**
- Route: `PUT` **/api/admin/mic/incidents/:id**
- Size: 1443 bytes; 50 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/mic/restricted-players.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/mic/restricted-players**
- Size: 682 bytes; 25 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/mic/restricted-players.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/mic/restricted-players**
- Size: 911 bytes; 32 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/mic/restricted-players.search.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/mic/restricted-players.search**
- Size: 667 bytes; 21 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/mic/restricted-players/[id].delete.ts`
- Category: **Nitro API route**
- Route: `DELETE` **/api/admin/mic/restricted-players/:id**
- Size: 615 bytes; 23 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/mic/shifts.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/mic/shifts**
- Size: 6546 bytes; 188 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/ops-schema.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/ops-schema**
- Size: 768 bytes; 27 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/ops-schema.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/ops-schema**
- Size: 1130 bytes; 38 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/ops-schema.publish.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/ops-schema.publish**
- Size: 2101 bytes; 70 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/ops-schema.rollback.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/ops-schema.rollback**
- Size: 984 bytes; 34 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/ops-schema/publish.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/ops-schema/publish**
- Size: 2130 bytes; 70 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/ops-schema/rollback.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/ops-schema/rollback**
- Size: 984 bytes; 34 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/patterns.delete.ts`
- Category: **Nitro API route**
- Route: `DELETE` **/api/admin/patterns**
- Size: 1284 bytes; 49 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/patterns.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/patterns**
- Size: 547 bytes; 18 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/patterns.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/patterns**
- Size: 2369 bytes; 78 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/pricing.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/pricing**
- Size: 983 bytes; 35 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/programs.delete.ts`
- Category: **Nitro API route**
- Route: `DELETE` **/api/admin/programs**
- Size: 1887 bytes; 67 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/programs.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/programs**
- Size: 1247 bytes; 47 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/programs.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/programs**
- Size: 4624 bytes; 162 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/schedule-day-profiles.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/schedule-day-profiles**
- Size: 438 bytes; 16 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/schedule-day-profiles.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/schedule-day-profiles**
- Size: 962 bytes; 31 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/schedule.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/schedule**
- Size: 973 bytes; 35 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/schedule/doors-open.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/schedule/doors-open**
- Size: 4226 bytes; 157 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/shift-records.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/shift-records**
- Size: 1034 bytes; 32 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/shift-records.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/shift-records**
- Size: 1821 bytes; 54 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/shift-records/[id].delete.ts`
- Category: **Nitro API route**
- Route: `DELETE` **/api/admin/shift-records/:id**
- Size: 709 bytes; 24 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/shift-records/[id].get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/shift-records/:id**
- Size: 761 bytes; 27 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/shift-records/[id].put.ts`
- Category: **Nitro API route**
- Route: `PUT` **/api/admin/shift-records/:id**
- Size: 2581 bytes; 68 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/specials.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/specials**
- Size: 960 bytes; 34 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/users.delete.ts`
- Category: **Nitro API route**
- Route: `DELETE` **/api/admin/users**
- Size: 1452 bytes; 56 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/users.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/admin/users**
- Size: 665 bytes; 28 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/admin/users.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/admin/users**
- Size: 2643 bytes; 94 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/admin/users/[id].patch.ts`
- Category: **Nitro API route**
- Route: `PATCH` **/api/admin/users/:id**
- Size: 3289 bytes; 107 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/auth/login.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/auth/login**
- Size: 3343 bytes; 123 lines
- Signals: uses Prisma, uses Zod, sets cookies, CSRF, rate limiting, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/auth/logout.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/auth/logout**
- Size: 558 bytes; 20 lines
- Signals: reads cookies, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/auth/user.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/auth/user**
- Size: 516 bytes; 18 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/business.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/business**
- Size: 238 bytes; 7 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/contact.post.ts`
- Category: **Nitro API route**
- Route: `POST` **/api/contact**
- Size: 921 bytes; 29 lines
- Signals: uses Zod, rate limiting, uses h3
- Automated flags: (none)
- Notes: Mutating API handler: confirm CSRF enforced (global middleware or explicit check).

### `server/api/health.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/health**
- Size: 1995 bytes; 63 lines
- Signals: uses Prisma, uses h3
- Automated flags: console.log
- Notes: (none)

### `server/api/jackpot.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/jackpot**
- Size: 6545 bytes; 219 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/pricing.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/pricing**
- Size: 237 bytes; 7 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/programs/[slug].get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/programs/:slug**
- Size: 1161 bytes; 51 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/programs/index.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/programs**
- Size: 463 bytes; 22 lines
- Signals: uses Prisma, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/schedule.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/schedule**
- Size: 1099 bytes; 32 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/api/specials.get.ts`
- Category: **Nitro API route**
- Route: `GET` **/api/specials**
- Size: 238 bytes; 7 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/data/business.json`
- Category: **Config/data**
- Size: 1016 bytes; 25 lines
- Automated flags: (none)
- Notes: (none)

### `server/data/jackpot.json`
- Category: **Config/data**
- Size: 65 bytes; 4 lines
- Automated flags: (none)
- Notes: (none)

### `server/data/messages.json`
- Category: **Config/data**
- Size: 3 bytes; 1 lines
- Automated flags: (none)
- Notes: (none)

### `server/data/pricing.json`
- Category: **Config/data**
- Size: 6447 bytes; 204 lines
- Automated flags: (none)
- Notes: (none)

### `server/data/schedule.json`
- Category: **Config/data**
- Size: 8138 bytes; 208 lines
- Automated flags: (none)
- Notes: (none)

### `server/data/sessions.json`
- Category: **Config/data**
- Size: 417 bytes; 17 lines
- Automated flags: (none)
- Notes: (none)

### `server/data/specials.json`
- Category: **Config/data**
- Size: 4268 bytes; 102 lines
- Automated flags: (none)
- Notes: (none)

### `server/data/users.json`
- Category: **Config/data**
- Size: 630 bytes; 18 lines
- Automated flags: (none)
- Notes: (none)

### `server/db/client.ts`
- Category: **DB client**
- Size: 1123 bytes; 31 lines
- Signals: uses Prisma
- Automated flags: (none)
- Notes: (none)

### `server/middleware/auth.ts`
- Category: **Nitro middleware**
- Size: 950 bytes; 28 lines
- Signals: sets cookies, reads cookies, CSRF, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/middleware/csrf.ts`
- Category: **Nitro middleware**
- Size: 2328 bytes; 97 lines
- Signals: reads cookies, CSRF, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/schemas/micIncident.zod.ts`
- Category: **Zod schema**
- Size: 1619 bytes; 62 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `server/schemas/micShift.zod.ts`
- Category: **Zod schema**
- Size: 4496 bytes; 136 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `server/schemas/ops-schema.zod.ts`
- Category: **Zod schema**
- Size: 12178 bytes; 406 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `server/schemas/restrictedPlayer.zod.ts`
- Category: **Zod schema**
- Size: 1253 bytes; 54 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `server/schemas/shift-record.zod.ts`
- Category: **Zod schema**
- Size: 1240 bytes; 42 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `server/services/audit.service.ts`
- Category: **Server service**
- Size: 496 bytes; 21 lines
- Signals: uses Prisma
- Automated flags: (none)
- Notes: (none)

### `server/services/auth.service.ts`
- Category: **Server service**
- Size: 2465 bytes; 92 lines
- Signals: uses Prisma, uses argon2
- Automated flags: (none)
- Notes: (none)

### `server/services/contact.service.ts`
- Category: **Server service**
- Size: 1224 bytes; 48 lines
- Signals: uses Prisma, uses Zod
- Automated flags: (none)
- Notes: (none)

### `server/services/holidayRules.service.ts`
- Category: **Server service**
- Size: 3272 bytes; 127 lines
- Signals: uses Prisma
- Automated flags: (none)
- Notes: (none)

### `server/services/opsSchemaCompiler.ts`
- Category: **Server service**
- Size: 8997 bytes; 290 lines
- Signals: uses Zod, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/services/settings.service.ts`
- Category: **Server service**
- Size: 1274 bytes; 44 lines
- Signals: uses Prisma
- Automated flags: (none)
- Notes: (none)

### `server/services/shiftRecords.service.ts`
- Category: **Server service**
- Size: 3697 bytes; 141 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: (none)

### `server/services/version.service.ts`
- Category: **Server service**
- Size: 6040 bytes; 230 lines
- Signals: uses Prisma
- Automated flags: (none)
- Notes: (none)

### `server/utils/mic-money.ts`
- Category: **Code**
- Size: 1845 bytes; 75 lines
- Signals: uses Zod
- Automated flags: (none)
- Notes: (none)

### `server/utils/mic-restricted.ts`
- Category: **Code**
- Size: 1521 bytes; 82 lines
- Signals: uses Prisma
- Automated flags: (none)
- Notes: (none)

### `server/utils/permissions.ts`
- Category: **Code**
- Size: 3596 bytes; 165 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `server/utils/rateLimiter.ts`
- Category: **Code**
- Size: 2250 bytes; 98 lines
- Signals: rate limiting
- Automated flags: (none)
- Notes: (none)

### `server/utils/roles.ts`
- Category: **Code**
- Size: 365 bytes; 12 lines
- Signals: uses h3
- Automated flags: (none)
- Notes: (none)

### `stores/jackpot.ts`
- Category: **Pinia store**
- Size: 2351 bytes; 81 lines
- Signals: uses Pinia
- Automated flags: (none)
- Notes: (none)

### `stores/ops.ts`
- Category: **Pinia store**
- Size: 12466 bytes; 417 lines
- Signals: uses Pinia
- Automated flags: (none)
- Notes: (none)

### `stores/specials.ts`
- Category: **Pinia store**
- Size: 1839 bytes; 76 lines
- Signals: uses Pinia
- Automated flags: (none)
- Notes: (none)

### `system_config/Ghetto Specials Flyer.pdf`
- Category: **Asset**
- Size: 647466 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `system_config/MIC_Chat_Thread.txt`
- Category: **Other**
- Size: 190433 bytes; 16120 lines
- Automated flags: (none)
- Notes: (none)

### `system_config/Mary Esther Bingo Callers Guideline.pdf`
- Category: **Asset**
- Size: 141320 bytes
- Automated flags: (none)
- Notes: Static/binary asset.

### `system_config/Pricing.txt`
- Category: **Other**
- Size: 4782 bytes; 30 lines
- Automated flags: (none)
- Notes: (none)

### `system_config/meb.conf`
- Category: **Other**
- Size: 584 bytes; 24 lines
- Automated flags: http://
- Notes: (none)

### `system_config/meb.service`
- Category: **Other**
- Size: 925 bytes; 42 lines
- Automated flags: (none)
- Notes: (none)

### `tailwind.config.ts`
- Category: **Code**
- Size: 3165 bytes; 120 lines
- Signals: uses Tailwind
- Automated flags: (none)
- Notes: (none)

### `test-admin-pass.js`
- Category: **Code**
- Size: 299 bytes; 12 lines
- Signals: uses argon2
- Automated flags: console.log
- Notes: (none)

### `test-argon2-import.js`
- Category: **Code**
- Size: 160 bytes; 4 lines
- Signals: uses argon2
- Automated flags: console.log
- Notes: (none)

### `test-argon2.js`
- Category: **Code**
- Size: 340 bytes; 15 lines
- Signals: uses argon2
- Automated flags: console.log
- Notes: (none)

### `tests/components/ProgramEditorLogic.test.ts`
- Category: **Test**
- Size: 2519 bytes; 87 lines
- Automated flags: (none)
- Notes: (none)

### `tests/jackpot-get.test.ts`
- Category: **Test**
- Size: 2446 bytes; 73 lines
- Automated flags: (none)
- Notes: (none)

### `tests/ops-schema-verification.test.ts`
- Category: **Test**
- Size: 3844 bytes; 151 lines
- Signals: uses Zod
- Automated flags: console.log
- Notes: (none)

### `tests/ops-schema.utils.test.ts`
- Category: **Test**
- Size: 2153 bytes; 69 lines
- Automated flags: console.log
- Notes: (none)

### `tests/security/schema.test.ts`
- Category: **Test**
- Size: 3444 bytes; 111 lines
- Signals: uses Prisma, uses Zod
- Automated flags: (none)
- Notes: (none)

### `tests/server/api/programs.test.ts`
- Category: **Test**
- Size: 6110 bytes; 207 lines
- Signals: uses Prisma, uses Zod, uses h3
- Automated flags: (none)
- Notes: (none)

### `tsconfig.json`
- Category: **Config/data**
- Size: 320 bytes; 18 lines
- Automated flags: (none)
- Notes: (none)

### `types/admin.ts`
- Category: **Code**
- Size: 1111 bytes; 49 lines
- Automated flags: (none)
- Notes: (none)

### `types/bingo.ts`
- Category: **Code**
- Size: 801 bytes; 38 lines
- Automated flags: (none)
- Notes: (none)

### `types/ops-schema-enhanced.ts`
- Category: **Code**
- Size: 5479 bytes; 244 lines
- Automated flags: (none)
- Notes: (none)

### `types/ops-schema.ts`
- Category: **Code**
- Size: 3037 bytes; 139 lines
- Automated flags: (none)
- Notes: (none)

### `utils/business.ts`
- Category: **Shared util**
- Size: 1112 bytes; 27 lines
- Automated flags: (none)
- Notes: (none)

### `utils/cn.ts`
- Category: **Shared util**
- Size: 169 bytes; 6 lines
- Signals: uses Tailwind
- Automated flags: (none)
- Notes: (none)

### `utils/constraints.ts`
- Category: **Shared util**
- Size: 16643 bytes; 559 lines
- Automated flags: (none)
- Notes: (none)

### `utils/format.ts`
- Category: **Shared util**
- Size: 412 bytes; 15 lines
- Automated flags: (none)
- Notes: (none)

### `utils/ops-schema-enhanced.utils.ts`
- Category: **Shared util**
- Size: 26431 bytes; 945 lines
- Automated flags: (none)
- Notes: (none)

### `utils/ops-schema.utils.ts`
- Category: **Shared util**
- Size: 5289 bytes; 202 lines
- Automated flags: (none)
- Notes: (none)

### `utils/ops-templates.ts`
- Category: **Shared util**
- Size: 3199 bytes; 131 lines
- Automated flags: (none)
- Notes: (none)

### `utils/pattern.utils.ts`
- Category: **Shared util**
- Size: 5442 bytes; 190 lines
- Automated flags: (none)
- Notes: (none)

### `utils/roles.ts`
- Category: **Shared util**
- Size: 909 bytes; 28 lines
- Automated flags: (none)
- Notes: (none)

### `utils/schedule-calendar.ts`
- Category: **Shared util**
- Size: 5570 bytes; 188 lines
- Automated flags: (none)
- Notes: (none)

### `utils/time.utils.ts`
- Category: **Shared util**
- Size: 2498 bytes; 82 lines
- Automated flags: (none)
- Notes: (none)

### `verification/verify_admin_console.py`
- Category: **Code**
- Size: 2723 bytes; 73 lines
- Signals: uses Playwright
- Automated flags: http://
- Notes: (none)

### `verify_homepage.py`
- Category: **Code**
- Size: 1348 bytes; 39 lines
- Signals: uses Playwright
- Automated flags: http://
- Notes: (none)

### `vitest.config.ts`
- Category: **Code**
- Size: 240 bytes; 11 lines
- Automated flags: (none)
- Notes: (none)
