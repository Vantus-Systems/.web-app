/**
 * Constraint System for Operations Builder
 * Extensible validation framework with automatic fixes
 */

import {
  toMinutes,
  formatMinutes,
  normalizeTimeRange,
  detectGaps,
  detectOverlaps,
} from "./ops-schema.utils";
import type {
  Constraint,
  ConstraintViolation,
} from "~/types/ops-schema-enhanced";

import type { OpsSchemaV2 } from "~/types/ops-schema";

// ===== CONSTRAINT DEFINITIONS =====

export const CONSTRAINTS = {
  // Timing Constraints
  SALES_WINDOW_BEFORE_SESSION: {
    id: "sales-window-before-session",
    label: "Sales Window must close 15+ minutes before Session Start",
    severity: "error",
    check: (state: OpsSchemaV2) => {
      const violations: ConstraintViolation[] = [];
      const salesClose = state.logicTriggers.find(
        (t) => t.type === "sales_window_close",
      );
      const sessionStart = state.logicTriggers.find(
        (t) => t.type === "session_start",
      );

      if (salesClose && sessionStart) {
        const salesTime = toMinutes(salesClose.trigger_time);
        const sessionTime = toMinutes(sessionStart.trigger_time);
        const gap = sessionTime - salesTime;

        if (gap < 15) {
          violations.push({
            id: `violation-${Date.now()}-1`,
            constraintId: "sales-window-before-session",
            severity: "error",
            message: `Sales window closes ${gap} minutes before session. Minimum 15 minutes required.`,
            affectedIds: [salesClose.id, sessionStart.id],
            path: ["logicTriggers"],
          });
        }
      }
      return violations;
    },
    fix: (_violation: ConstraintViolation, state: OpsSchemaV2) => {
      const salesClose = state.logicTriggers.find(
        (t) => t.type === "sales_window_close",
      );
      const sessionStart = state.logicTriggers.find(
        (t) => t.type === "session_start",
      );

      if (salesClose && sessionStart) {
        const sessionTime = toMinutes(sessionStart.trigger_time);
        salesClose.trigger_time = formatMinutes(sessionTime - 15);
      }
      return state;
    },
  } as Constraint,

  DOORS_BEFORE_SESSION: {
    id: "doors-before-session",
    label: "Doors Open must be before Session Start",
    severity: "error",
    check: (state: OpsSchemaV2) => {
      const violations: ConstraintViolation[] = [];
      const doorsOpen = state.logicTriggers.find(
        (t) => t.type === "doors_open",
      );
      const sessionStart = state.logicTriggers.find(
        (t) => t.type === "session_start",
      );

      if (doorsOpen && sessionStart) {
        const doorsTime = toMinutes(doorsOpen.trigger_time);
        const sessionTime = toMinutes(sessionStart.trigger_time);

        if (doorsTime >= sessionTime) {
          violations.push({
            id: `violation-${Date.now()}-2`,
            constraintId: "doors-before-session",
            severity: "error",
            message: "Doors Open must be before Session Start",
            affectedIds: [doorsOpen.id, sessionStart.id],
            path: ["logicTriggers"],
          });
        }
      }
      return violations;
    },
    fix: (_violation: ConstraintViolation, state: OpsSchemaV2) => {
      const doorsOpen = state.logicTriggers.find(
        (t) => t.type === "doors_open",
      );
      const sessionStart = state.logicTriggers.find(
        (t) => t.type === "session_start",
      );

      if (doorsOpen && sessionStart) {
        const sessionTime = toMinutes(sessionStart.trigger_time);
        doorsOpen.trigger_time = formatMinutes(sessionTime - 30);
      }
      return state;
    },
  } as Constraint,

  HARD_RESET_TARGET: {
    id: "hard-reset-target-required",
    label: "Hard Reset triggers must have a target event",
    severity: "error",
    check: (state: OpsSchemaV2) => {
      const violations: ConstraintViolation[] = [];

      state.logicTriggers
        .filter((t) => t.type === "hard_reset" && !t.target_event)
        .forEach((trigger) => {
          violations.push({
            id: `violation-${Date.now()}-3`,
            constraintId: "hard-reset-target-required",
            severity: "error",
            message: "Hard Reset trigger requires a target event",
            affectedIds: [trigger.id],
            path: ["logicTriggers"],
          });
        });

      return violations;
    },
    // No automatic fix - requires user selection
  } as Constraint,

  NO_OVERLAPS: {
    id: "no-overlaps",
    label: "Flow segments must not overlap",
    severity: "error",
    check: (state: OpsSchemaV2) => {
      const violations: ConstraintViolation[] = [];
      const overlaps = detectOverlaps(state.timeline.flowSegments);

      overlaps.forEach((pair) => {
        violations.push({
          id: `violation-${Date.now()}-4`,
          constraintId: "no-overlaps",
          severity: "error",
          message: `Segments overlap: ${pair.a.label} ↔ ${pair.b.label}`,
          affectedIds: [pair.a.id, pair.b.id],
          path: ["timeline", "flowSegments"],
        });
      });

      return violations;
    },
    // No automatic fix - requires manual adjustment
  } as Constraint,

  NO_GAPS: {
    id: "no-gaps",
    label: "No unexplained gaps in operational hours",
    severity: "warning",
    check: (state: OpsSchemaV2) => {
      const violations: ConstraintViolation[] = [];

      if (!state.timeline.operationalHours.isOpen) {
        return violations;
      }

      const gaps = detectGaps(
        state.timeline.flowSegments,
        state.timeline.operationalHours.start,
        state.timeline.operationalHours.end,
      );

      gaps.forEach((gap) => {
        violations.push({
          id: `violation-${Date.now()}-5`,
          constraintId: "no-gaps",
          severity: "warning",
          message: `Gap: ${formatMinutes(gap.start)} to ${formatMinutes(gap.end)}`,
          affectedIds: [],
          path: ["timeline", "flowSegments"],
        });
      });

      return violations;
    },
    fix: (_violation: ConstraintViolation, state: OpsSchemaV2) => {
      const gaps = detectGaps(
        state.timeline.flowSegments,
        state.timeline.operationalHours.start,
        state.timeline.operationalHours.end,
      );

      if (gaps.length > 0) {
        const gap = gaps[0];
        const breakSegment = {
          id: `break-${Date.now()}`,
          label: "Break",
          time_start: formatMinutes(gap.start),
          time_end: formatMinutes(gap.end),
          rate_card_id: "break-card",
          color_code: "#94a3b8",
          allow_overlap: false,
        };

        state.timeline.flowSegments.push(breakSegment);
        state.timeline.flowSegments.sort(
          (a, b) => toMinutes(a.time_start) - toMinutes(b.time_start),
        );
      }

      return state;
    },
  } as Constraint,

  OPERATIONAL_HOURS_VALID: {
    id: "operational-hours-valid",
    label: "Operational hours must span non-zero duration",
    severity: "error",
    check: (state: OpsSchemaV2) => {
      const violations: ConstraintViolation[] = [];
      const range = normalizeTimeRange(
        state.timeline.operationalHours.start,
        state.timeline.operationalHours.end,
      );

      if (range.start === range.end) {
        violations.push({
          id: `violation-${Date.now()}-6`,
          constraintId: "operational-hours-valid",
          severity: "error",
          message: "Operational hours must span a non-zero duration",
          affectedIds: [],
          path: ["timeline", "operationalHours"],
        });
      }

      return violations;
    },
    // No automatic fix - requires user input
  } as Constraint,

  OVERLAYS_WITHIN_HOURS: {
    id: "overlays-within-hours",
    label: "Overlay events must be within operational hours",
    severity: "error",
    check: (state: OpsSchemaV2) => {
      const violations: ConstraintViolation[] = [];
      const opStart = state.timeline.operationalHours.start;
      const opEnd = state.timeline.operationalHours.end;

      state.timeline.overlayEvents.forEach((event) => {
        const eventStart = toMinutes(event.time_start);
        const eventEnd = toMinutes(event.time_end);
        const opStartMin = toMinutes(opStart);
        const opEndMin = toMinutes(opEnd);

        if (eventStart < opStartMin || eventEnd > opEndMin) {
          violations.push({
            id: `violation-${Date.now()}-7`,
            constraintId: "overlays-within-hours",
            severity: "error",
            message: `Overlay "${event.label}" outside operational hours`,
            affectedIds: [event.id],
            path: ["timeline", "overlayEvents"],
          });
        }
      });

      return violations;
    },
    // No automatic fix - requires user adjustment
  } as Constraint,

  MIN_SEGMENT_DURATION: {
    id: "min-segment-duration",
    label: "Flow segments must be at least 15 minutes",
    severity: "error",
    check: (state: OpsSchemaV2) => {
      const violations: ConstraintViolation[] = [];

      state.timeline.flowSegments.forEach((segment) => {
        const range = normalizeTimeRange(segment.time_start, segment.time_end);
        const duration = range.end - range.start;

        if (duration < 15) {
          violations.push({
            id: `violation-${Date.now()}-8`,
            constraintId: "min-segment-duration",
            severity: "error",
            message: `Segment "${segment.label}" is only ${duration} minutes (minimum 15)`,
            affectedIds: [segment.id],
            path: ["timeline", "flowSegments"],
          });
        }
      });

      return violations;
    },
    // No automatic fix - requires user adjustment
  } as Constraint,

  TRIGGER_TIME_WITHIN_HOURS: {
    id: "trigger-time-within-hours",
    label: "Trigger times must be within operational hours",
    severity: "warning",
    check: (state: OpsSchemaV2) => {
      const violations: ConstraintViolation[] = [];
      const opStart = toMinutes(state.timeline.operationalHours.start);
      const opEnd = toMinutes(state.timeline.operationalHours.end);

      state.logicTriggers.forEach((trigger) => {
        const triggerTime = toMinutes(trigger.trigger_time);

        if (triggerTime < opStart || triggerTime > opEnd) {
          violations.push({
            id: `violation-${Date.now()}-9`,
            constraintId: "trigger-time-within-hours",
            severity: "warning",
            message: `Trigger "${trigger.type}" at ${trigger.trigger_time} outside operational hours`,
            affectedIds: [trigger.id],
            path: ["logicTriggers"],
          });
        }
      });

      return violations;
    },
    // No automatic fix
  } as Constraint,

  REQUIRED_TRIGGERS_PRESENT: {
    id: "required-triggers-present",
    label: "Essential triggers should be present",
    severity: "info",
    check: (state: OpsSchemaV2) => {
      const violations: ConstraintViolation[] = [];
      const hasDoorsOpen = state.logicTriggers.some(
        (t) => t.type === "doors_open",
      );
      const hasSessionStart = state.logicTriggers.some(
        (t) => t.type === "session_start",
      );

      if (!hasDoorsOpen) {
        violations.push({
          id: `violation-${Date.now()}-10`,
          constraintId: "required-triggers-present",
          severity: "info",
          message: "Consider adding a Doors Open trigger",
          affectedIds: [],
          path: ["logicTriggers"],
        });
      }

      if (!hasSessionStart) {
        violations.push({
          id: `violation-${Date.now()}-11`,
          constraintId: "required-triggers-present",
          severity: "info",
          message: "Consider adding a Session Start trigger",
          affectedIds: [],
          path: ["logicTriggers"],
        });
      }

      return violations;
    },
    // No automatic fix - informational only
  } as Constraint,
};

// ===== CONSTRAINT MANAGER =====

export class ConstraintManager {
  private constraints: Constraint[];
  private customConstraints: Constraint[] = [];

  constructor(additionalConstraints: Constraint[] = []) {
    this.constraints = Object.values(CONSTRAINTS);
    this.customConstraints = additionalConstraints;
  }

  /**
   * Check all constraints and return violations
   */
  check(state: OpsSchemaV2): ConstraintViolation[] {
    const allConstraints = [...this.constraints, ...this.customConstraints];
    const violations: ConstraintViolation[] = [];

    allConstraints.forEach((constraint) => {
      const result = constraint.check(state);
      violations.push(...result);
    });

    return violations;
  }

  /**
   * Get violations by severity
   */
  getViolationsBySeverity(
    violations: ConstraintViolation[],
    severity: ConstraintViolation["severity"],
  ): ConstraintViolation[] {
    return violations.filter((v) => v.severity === severity);
  }

  /**
   * Apply automatic fixes for violations where possible
   */
  applyFixes(
    state: OpsSchemaV2,
    violations: ConstraintViolation[],
  ): { state: OpsSchemaV2; fixed: string[]; failed: string[] } {
    const result = { ...state };
    const fixed: string[] = [];
    const failed: string[] = [];

    violations.forEach((violation) => {
      const constraint = [...this.constraints, ...this.customConstraints].find(
        (c) => c.id === violation.constraintId,
      );

      if (constraint && constraint.fix) {
        try {
          const before = JSON.stringify(result);
          constraint.fix(violation, result);
          const after = JSON.stringify(result);

          if (before !== after) {
            fixed.push(violation.id);
          } else {
            failed.push(violation.id);
          }
        } catch (error) {
          console.warn(`Failed to fix violation ${violation.id}:`, error);
          failed.push(violation.id);
        }
      } else {
        failed.push(violation.id);
      }
    });

    return { state: result, fixed, failed };
  }

  /**
   * Get constraint by ID
   */
  getConstraint(id: string): Constraint | undefined {
    return [...this.constraints, ...this.customConstraints].find(
      (c) => c.id === id,
    );
  }

  /**
   * Add custom constraint
   */
  addCustomConstraint(constraint: Constraint): void {
    this.customConstraints.push(constraint);
  }

  /**
   * Remove custom constraint
   */
  removeCustomConstraint(id: string): void {
    this.customConstraints = this.customConstraints.filter((c) => c.id !== id);
  }

  /**
   * Get all constraint definitions
   */
  getAllConstraints(): Constraint[] {
    return [...this.constraints, ...this.customConstraints];
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Quick check for violations (stateless)
 */
export function checkAllConstraints(state: OpsSchemaV2): ConstraintViolation[] {
  const manager = new ConstraintManager();
  return manager.check(state);
}

/**
 * Quick fix for violations (stateless)
 */
export function fixAllViolations(
  state: OpsSchemaV2,
  violations: ConstraintViolation[],
): { state: OpsSchemaV2; fixed: string[] } {
  const manager = new ConstraintManager();
  const result = manager.applyFixes(state, violations);
  return { state: result.state, fixed: result.fixed };
}

/**
 * Get violation summary
 */
export function getViolationSummary(violations: ConstraintViolation[]): {
  errors: number;
  warnings: number;
  info: number;
  total: number;
} {
  return {
    errors: violations.filter((v) => v.severity === "error").length,
    warnings: violations.filter((v) => v.severity === "warning").length,
    info: violations.filter((v) => v.severity === "info").length,
    total: violations.length,
  };
}
