/**
 * Enhanced utility functions for Operations Builder
 * Includes timeline math fixes, constraint solver, ripple editing, and more
 */

import {
  toMinutes,
  formatMinutes,
  normalizeTimeRange,
  snapMinutes,
  detectGaps,
  detectOverlaps,
} from "./ops-schema.utils";
import type {
  EnhancedLogicTrigger,
  Constraint,
  ConstraintViolation,
  RippleOptions,
  SnapSettings,
  SimulationState,
  StagePreview,
  RevenueProjection,
  StaffingDensity,
  CompletenessScore,
  AgendaEntry,
  EnhancedOpsSchema,
} from "~/types/ops-schema-enhanced";

import type {
  OpsSchemaFlowSegment,
  OpsSchemaOverlayEvent,
  OpsSchemaV2,
} from "~/types/ops-schema";

// ===== TIMELINE MATH FIXES (SCROLL-AWARE) =====

/**
 * Calculate X position accounting for horizontal scroll
 * This fixes the scrollLeft bug in drag/drop and resize operations
 */
export const calculateScrollAwareX = (
  clientX: number,
  canvasRect: DOMRect,
  scrollLeft: number,
  densityScale: number,
  operationalStartMinutes: number,
): number => {
  // Original buggy calculation: (clientX - rect.left)
  // Fixed calculation: (clientX - rect.left + scrollLeft)
  const relativeX = clientX - canvasRect.left + scrollLeft;
  const minutes = operationalStartMinutes + relativeX / densityScale;
  return minutes;
};

/**
 * Enhanced snap function with anchor snapping support
 */
export const enhancedSnapMinutes = (
  value: number,
  settings: SnapSettings,
  anchorPoints: number[] = [],
): number => {
  const { gridIncrement, anchorSnapEnabled, anchorThreshold } = settings;

  if (!anchorSnapEnabled || anchorPoints.length === 0) {
    return snapMinutes(value, gridIncrement);
  }

  // Check for anchor snaps first
  const thresholdMinutes = anchorThreshold / 2; // Convert pixels to minutes (approximate)

  for (const anchor of anchorPoints) {
    const distance = Math.abs(value - anchor);
    if (distance <= thresholdMinutes) {
      return anchor; // Snap to anchor
    }
  }

  // Fall back to grid snap
  return snapMinutes(value, gridIncrement);
};

// ===== RIPPLE EDITING LOGIC =====

/**
 * Apply ripple editing to segments
 * When extending/moving a segment, pushes subsequent segments forward
 */
export const applyRipple = (
  segments: OpsSchemaFlowSegment[],
  editedId: string,
  deltaMinutes: number,
  mode: "move" | "resize",
  options: RippleOptions,
): { segments: OpsSchemaFlowSegment[]; error?: string } => {
  if (!options.enabled) {
    // No ripple, just update the edited segment
    const updated = segments.map((s) => {
      if (s.id === editedId) {
        const range = normalizeTimeRange(s.time_start, s.time_end);
        if (mode === "move") {
          return {
            ...s,
            time_start: formatMinutes(range.start + deltaMinutes),
            time_end: formatMinutes(range.end + deltaMinutes),
          };
        } else {
          // resize
          return {
            ...s,
            time_end: formatMinutes(range.end + deltaMinutes),
          };
        }
      }
      return s;
    });
    return { segments: updated };
  }

  // Sort segments by start time
  const sorted = [...segments].sort(
    (a, b) => toMinutes(a.time_start) - toMinutes(b.time_start),
  );

  const editedIndex = sorted.findIndex((s) => s.id === editedId);
  if (editedIndex === -1) {
    return { segments, error: "Segment not found" };
  }

  const edited = sorted[editedIndex];
  const editedRange = normalizeTimeRange(edited.time_start, edited.time_end);

  // Calculate new times for edited segment
  let newStart = editedRange.start;
  let newEnd = editedRange.end;

  if (mode === "move") {
    newStart += deltaMinutes;
    newEnd += deltaMinutes;
  } else {
    newEnd += deltaMinutes;
  }

  // Validate minimum duration
  const minDuration = options.minDuration || 15;
  if (newEnd - newStart < minDuration) {
    return {
      segments,
      error: `Segment duration too short. Minimum: ${minDuration} minutes`,
    };
  }

  // Apply ripple to subsequent segments
  const result: OpsSchemaFlowSegment[] = [];
  let currentEnd = newEnd;

  for (let i = 0; i < sorted.length; i++) {
    if (i === editedIndex) {
      // Add edited segment with new times
      result.push({
        ...edited,
        time_start: formatMinutes(newStart),
        time_end: formatMinutes(newEnd),
      });
      continue;
    }

    const segment = sorted[i];
    const segmentRange = normalizeTimeRange(
      segment.time_start,
      segment.time_end,
    );

    // Check for overlap with previous segment
    if (segmentRange.start < currentEnd) {
      // Ripple: push this segment forward
      const duration = segmentRange.end - segmentRange.start;
      const newSegmentStart = currentEnd;
      const newSegmentEnd = currentEnd + duration;

      // Check if this would exceed operational end (you'd pass this in real implementation)
      // For now, just apply the ripple
      result.push({
        ...segment,
        time_start: formatMinutes(newSegmentStart),
        time_end: formatMinutes(newSegmentEnd),
      });
      currentEnd = newSegmentEnd;
    } else {
      // No overlap, keep as is
      result.push(segment);
      currentEnd = segmentRange.end;
    }
  }

  return { segments: result };
};

// ===== KNIFE TOOL (SPLIT SEGMENT) =====

export const applyKnifeSplit = (
  segments: OpsSchemaFlowSegment[],
  segmentId: string,
  splitTime: string,
  minDuration: number = 15,
): {
  segments: OpsSchemaFlowSegment[];
  newSegmentId?: string;
  error?: string;
} => {
  const segmentIndex = segments.findIndex((s) => s.id === segmentId);
  if (segmentIndex === -1) {
    return { segments, error: "Segment not found" };
  }

  const segment = segments[segmentIndex];
  const splitMinutes = toMinutes(splitTime);
  const range = normalizeTimeRange(segment.time_start, segment.time_end);

  // Validate split is within segment bounds
  if (splitMinutes <= range.start || splitMinutes >= range.end) {
    return { segments, error: "Split time must be within segment bounds" };
  }

  // Validate minimum duration for both halves
  const leftDuration = splitMinutes - range.start;
  const rightDuration = range.end - splitMinutes;

  if (leftDuration < minDuration || rightDuration < minDuration) {
    return {
      segments,
      error: `Split would create segments shorter than ${minDuration} minutes`,
    };
  }

  // Create left segment (original)
  const leftSegment = {
    ...segment,
    time_end: formatMinutes(splitMinutes),
  };

  // Create right segment (new)
  const newSegmentId = `segment-split-${Date.now()}`;
  const rightSegment: OpsSchemaFlowSegment = {
    ...segment,
    id: newSegmentId,
    time_start: formatMinutes(splitMinutes),
    label: `${segment.label} (Part 2)`,
  };

  // Replace original with left, add right
  const result = [...segments];
  result[segmentIndex] = leftSegment;
  result.splice(segmentIndex + 1, 0, rightSegment);

  return { segments: result, newSegmentId };
};

// ===== CONSTRAINT SOLVER =====

/**
 * Built-in constraint definitions
 */
export const builtInConstraints: Constraint[] = [
  {
    id: "sales-window-before-session",
    label: "Sales Window must close at least 15 minutes before Session Start",
    severity: "error",
    check: (state) => {
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
            id: `violation-${Date.now()}`,
            constraintId: "sales-window-before-session",
            severity: "error",
            message: `Sales window closes ${gap} minutes before session starts. Minimum 15 minutes required.`,
            affectedIds: [salesClose.id, sessionStart.id],
          });
        }
      }

      return violations;
    },
    fix: (_violation, state) => {
      const salesClose = state.logicTriggers.find(
        (t) => t.type === "sales_window_close",
      );
      const sessionStart = state.logicTriggers.find(
        (t) => t.type === "session_start",
      );

      if (salesClose && sessionStart) {
        const sessionTime = toMinutes(sessionStart.trigger_time);
        // Move sales close to 15 minutes before session
        const newSalesTime = sessionTime - 15;
        salesClose.trigger_time = formatMinutes(newSalesTime);
      }

      return state;
    },
  },
  {
    id: "doors-before-session",
    label: "Doors Open cannot be after Session Start",
    severity: "error",
    check: (state) => {
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

        if (doorsTime > sessionTime) {
          violations.push({
            id: `violation-${Date.now()}`,
            constraintId: "doors-before-session",
            severity: "error",
            message: "Doors Open cannot be after Session Start",
            affectedIds: [doorsOpen.id, sessionStart.id],
          });
        }
      }

      return violations;
    },
    fix: (_violation, state) => {
      const doorsOpen = state.logicTriggers.find(
        (t) => t.type === "doors_open",
      );
      const sessionStart = state.logicTriggers.find(
        (t) => t.type === "session_start",
      );

      if (doorsOpen && sessionStart) {
        // Move doors to 30 minutes before session
        const sessionTime = toMinutes(sessionStart.trigger_time);
        doorsOpen.trigger_time = formatMinutes(sessionTime - 30);
      }

      return state;
    },
  },
  {
    id: "hard-reset-target-required",
    label: "Hard Reset must have a Target Event",
    severity: "error",
    check: (state) => {
      const violations: ConstraintViolation[] = [];

      state.logicTriggers
        .filter((t) => t.type === "hard_reset" && !t.target_event)
        .forEach((trigger) => {
          violations.push({
            id: `violation-${Date.now()}`,
            constraintId: "hard-reset-target-required",
            severity: "error",
            message: "Hard Reset trigger requires a target event",
            affectedIds: [trigger.id],
          });
        });

      return violations;
    },
    // No automatic fix - requires user action
  },
  {
    id: "no-gaps-in-operations",
    label: "No unexplained gaps in operational hours",
    severity: "warning",
    check: (state) => {
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
          id: `violation-${Date.now()}`,
          constraintId: "no-gaps-in-operations",
          severity: "warning",
          message: `Gap detected: ${formatMinutes(gap.start)} to ${formatMinutes(gap.end)}`,
          affectedIds: [],
          path: ["timeline", "flowSegments"],
        });
      });

      return violations;
    },
    fix: (_violation, state) => {
      // Find the gap and offer to fill with break segment
      const gaps = detectGaps(
        state.timeline.flowSegments,
        state.timeline.operationalHours.start,
        state.timeline.operationalHours.end,
      );

      if (gaps.length > 0) {
        const gap = gaps[0];
        // Create a break segment
        const breakSegment: OpsSchemaFlowSegment = {
          id: `break-${Date.now()}`,
          label: "Break",
          time_start: formatMinutes(gap.start),
          time_end: formatMinutes(gap.end),
          rate_card_id: "break-card", // Would need to ensure this exists
          color_code: "#94a3b8",
          allow_overlap: false,
        };

        state.timeline.flowSegments.push(breakSegment);
        // Sort segments
        state.timeline.flowSegments.sort(
          (a, b) => toMinutes(a.time_start) - toMinutes(b.time_start),
        );
      }

      return state;
    },
  },
];

/**
 * Check all constraints and return violations
 */
export const checkConstraints = (
  state: OpsSchemaV2,
  customConstraints: Constraint[] = [],
): ConstraintViolation[] => {
  const allConstraints = [...builtInConstraints, ...customConstraints];
  const allViolations: ConstraintViolation[] = [];

  allConstraints.forEach((constraint) => {
    const violations = constraint.check(state);
    allViolations.push(...violations);
  });

  return allViolations;
};

/**
 * Apply automatic fixes for violations where possible
 */
export const applyConstraintFixes = (
  state: OpsSchemaV2,
  violations: ConstraintViolation[],
): { state: OpsSchemaV2; fixed: string[] } => {
  const result = { ...state };
  const fixed: string[] = [];

  violations.forEach((violation) => {
    const constraint = builtInConstraints.find(
      (c) => c.id === violation.constraintId,
    );
    if (constraint && constraint.fix) {
      try {
        constraint.fix(violation, result);
        fixed.push(violation.id);
      } catch (error) {
        console.warn(`Failed to fix violation ${violation.id}:`, error);
      }
    }
  });

  return { state: result, fixed };
};

// ===== RELATIVE TRIGGER RESOLUTION =====

/**
 * Resolve relative triggers to absolute times
 */
export const resolveRelativeTriggers = (
  triggers: EnhancedLogicTrigger[],
  segments: OpsSchemaFlowSegment[],
  overlays: OpsSchemaOverlayEvent[],
): EnhancedLogicTrigger[] => {
  return triggers.map((trigger) => {
    if (!trigger.relativeAnchor || !trigger.isRelative) {
      return trigger;
    }

    const { targetId, anchorPoint, offsetMinutes } = trigger.relativeAnchor;

    // Find target
    const targetSegment = segments.find((s) => s.id === targetId);
    const targetOverlay = overlays.find((o) => o.id === targetId);

    if (!targetSegment && !targetOverlay) {
      return {
        ...trigger,
        derivedTime: "INVALID",
      };
    }

    const target = targetSegment || targetOverlay!;
    const range = normalizeTimeRange(target.time_start, target.time_end);
    const anchorTime = anchorPoint === "start" ? range.start : range.end;
    const absoluteTime = anchorTime + offsetMinutes;

    return {
      ...trigger,
      trigger_time: formatMinutes(absoluteTime),
      derivedTime: formatMinutes(absoluteTime),
    };
  });
};

// ===== SIMULATION ENGINE =====

/**
 * Generate simulation state for a given time
 */
export const deriveSimulationState = (
  schema: EnhancedOpsSchema,
  currentTime: number,
  speed: SimulationSpeed = 1,
): SimulationState => {
  const events: SimulationState["events"] = [];

  // Check triggers
  schema.logicTriggers.forEach((trigger) => {
    const triggerTime = toMinutes(trigger.trigger_time);
    if (Math.abs(currentTime - triggerTime) < speed) {
      events.push({
        time: triggerTime,
        type: trigger.type,
        description: trigger.customDescription || trigger.type,
      });
    }
  });

  // Find active segment
  const activeSegment = schema.timeline.flowSegments.find((segment) => {
    const range = normalizeTimeRange(segment.time_start, segment.time_end);
    return currentTime >= range.start && currentTime < range.end;
  });

  // Find active overlays
  const activeOverlays = schema.timeline.overlayEvents.filter((event) => {
    const range = normalizeTimeRange(event.time_start, event.time_end);
    return currentTime >= range.start && currentTime < range.end;
  });

  return {
    isPlaying: true,
    currentTime,
    speed,
    events,
    activeSegment,
    activeOverlays,
  };
};

/**
 * Generate stage preview for simulation
 */
export const deriveStagePreview = (
  state: SimulationState,
  _schema: EnhancedOpsSchema,
): StagePreview => {
  const time = formatMinutes(state.currentTime);

  const customerScreen = state.activeSegment
    ? `Now Playing: ${state.activeSegment.label}`
    : "Intermission";

  const posStaff =
    state.activeOverlays.length > 0
      ? `Active: ${state.activeOverlays.map((o) => o.label).join(", ")}`
      : "Standard Operations";

  const activeFlow = state.activeSegment
    ? `${state.activeSegment.label} (${state.activeSegment.time_start} - ${state.activeSegment.time_end})`
    : "No active flow";

  const activeOverlays = state.activeOverlays.map((o) => o.label);

  const triggeredEvents = state.events.map(
    (e) => `${formatMinutes(e.time)} - ${e.type}`,
  );

  return {
    time,
    customerScreen,
    posStaff,
    activeFlow,
    activeOverlays,
    triggeredEvents,
  };
};

// ===== ANALYTICS CALCULATIONS =====

/**
 * Calculate revenue projection
 * Note: Requires seat capacity - uses default if not available
 */
export const calculateRevenueProjection = (
  schema: EnhancedOpsSchema,
  seatCapacity: number = 0,
): RevenueProjection => {
  const breakdown: RevenueProjection["breakdown"] = [];
  let totalValue = 0;

  schema.timeline.flowSegments.forEach((segment) => {
    const rateCard = schema.definitions.rateCards.find(
      (rc) => rc.id === segment.rate_card_id,
    );
    if (!rateCard) return;

    const range = normalizeTimeRange(segment.time_start, segment.time_end);
    const durationHours = (range.end - range.start) / 60;

    // Rate factor based on yield mode
    const rateFactors = {
      fixed_rate: 1.0,
      standard_rate: 1.0,
      reduced_rate: 0.7,
    };
    const rateFactor = rateFactors[rateCard.yield_configuration.mode] || 1.0;

    const value = durationHours * seatCapacity * rateFactor;
    totalValue += value;

    breakdown.push({
      segmentId: segment.id,
      rateCardName: rateCard.name,
      durationHours,
      seatCapacity,
      rateFactor,
      value,
    });
  });

  return {
    totalValue,
    breakdown,
  };
};

/**
 * Calculate staffing density based on overlays and segments
 */
export const calculateStaffingDensity = (
  schema: EnhancedOpsSchema,
): StaffingDensity => {
  const timeRanges: StaffingDensity["timeRanges"] = [];

  // Define operational range
  normalizeTimeRange(
    schema.timeline.operationalHours.start,
    schema.timeline.operationalHours.end,
  );

  // Check for high traffic periods (overlays of segments + overlays)
  const highTrafficRanges: Array<{ start: number; end: number }> = [];

  schema.timeline.overlayEvents.forEach((overlay) => {
    const overlayRange = normalizeTimeRange(
      overlay.time_start,
      overlay.time_end,
    );

    schema.timeline.flowSegments.forEach((segment) => {
      const segmentRange = normalizeTimeRange(
        segment.time_start,
        segment.time_end,
      );

      // Check for overlap
      const overlapStart = Math.max(overlayRange.start, segmentRange.start);
      const overlapEnd = Math.min(overlayRange.end, segmentRange.end);

      if (overlapStart < overlapEnd) {
        highTrafficRanges.push({ start: overlapStart, end: overlapEnd });
      }
    });
  });

  // Merge overlapping high traffic ranges
  const mergedRanges: Array<{ start: number; end: number }> = [];
  highTrafficRanges.sort((a, b) => a.start - b.start);

  let current: { start: number; end: number } | null = null;
  for (const range of highTrafficRanges) {
    if (!current) {
      current = { ...range };
    } else if (range.start <= current.end) {
      current.end = Math.max(current.end, range.end);
    } else {
      mergedRanges.push(current);
      current = { ...range };
    }
  }
  if (current) mergedRanges.push(current);

  // Convert to density ranges
  mergedRanges.forEach((range) => {
    timeRanges.push({
      start: range.start,
      end: range.end,
      density: "high",
      reason: "Sales window + active session overlap",
    });
  });

  return { timeRanges };
};

/**
 * Calculate completeness score
 */
export const calculateCompletenessScore = (
  schema: EnhancedOpsSchema,
  violations: ConstraintViolation[],
): CompletenessScore => {
  // Coverage: operational hours filled by segments
  const opRange = normalizeTimeRange(
    schema.timeline.operationalHours.start,
    schema.timeline.operationalHours.end,
  );
  const totalOpMinutes = opRange.end - opRange.start;

  let coveredMinutes = 0;
  const sortedSegments = [...schema.timeline.flowSegments].sort(
    (a, b) => toMinutes(a.time_start) - toMinutes(b.time_start),
  );

  let lastEnd = opRange.start;
  sortedSegments.forEach((segment) => {
    const range = normalizeTimeRange(segment.time_start, segment.time_end);
    if (range.start >= lastEnd) {
      coveredMinutes += range.end - range.start;
      lastEnd = range.end;
    }
  });

  const coverageScore =
    totalOpMinutes > 0 ? (coveredMinutes / totalOpMinutes) * 100 : 0;

  // No overlaps
  const overlaps = detectOverlaps(schema.timeline.flowSegments);
  const noOverlapsScore =
    overlaps.length === 0 ? 100 : Math.max(0, 100 - overlaps.length * 20);

  // Triggers valid
  const totalTriggers = schema.logicTriggers.length;
  const invalidTriggers = schema.logicTriggers.filter((t) => {
    if (t.type === "hard_reset" && !t.target_event) return true;
    if (t.type === "custom" && !t.customLabel) return true;
    return false;
  }).length;
  const triggersValidScore =
    totalTriggers > 0
      ? ((totalTriggers - invalidTriggers) / totalTriggers) * 100
      : 100;

  // No violations
  const errorViolations = violations.filter(
    (v) => v.severity === "error",
  ).length;
  const warningViolations = violations.filter(
    (v) => v.severity === "warning",
  ).length;
  const noViolationsScore = Math.max(
    0,
    100 - errorViolations * 10 - warningViolations * 5,
  );

  const score = Math.round(
    coverageScore * 0.3 +
      noOverlapsScore * 0.2 +
      triggersValidScore * 0.25 +
      noViolationsScore * 0.25,
  );

  const missing: string[] = [];
  if (coverageScore < 100) missing.push("Complete operational coverage");
  if (noOverlapsScore < 100) missing.push("No overlapping segments");
  if (triggersValidScore < 100)
    missing.push("All triggers properly configured");
  if (noViolationsScore < 100) missing.push("No constraint violations");

  return {
    score,
    breakdown: {
      coverage: Math.round(coverageScore),
      noOverlaps: Math.round(noOverlapsScore),
      triggersValid: Math.round(triggersValidScore),
      noViolations: Math.round(noViolationsScore),
    },
    missing,
  };
};

// ===== AGENDA EXPORT =====

/**
 * Generate agenda entries sorted by time
 */
export const generateAgenda = (schema: EnhancedOpsSchema): AgendaEntry[] => {
  const entries: AgendaEntry[] = [];

  // Flow segments
  schema.timeline.flowSegments.forEach((segment) => {
    const rateCard = schema.definitions.rateCards.find(
      (rc) => rc.id === segment.rate_card_id,
    );
    entries.push({
      time: segment.time_start,
      lane: "flow",
      label: segment.label,
      duration: `${segment.time_start} - ${segment.time_end}`,
      context: rateCard
        ? `${rateCard.name} (${rateCard.category || "Standard"})`
        : undefined,
    });
  });

  // Overlay events
  schema.timeline.overlayEvents.forEach((event) => {
    entries.push({
      time: event.time_start,
      lane: "overlay",
      label: event.label,
      duration: `${event.time_start} - ${event.time_end}`,
      context: event.is_hard_ticket ? "Hard Ticket Event" : "Overlay Event",
    });
  });

  // Logic triggers
  schema.logicTriggers.forEach((trigger) => {
    const contextParts: string[] = [];
    if (trigger.type === "hard_reset" && trigger.target_event) {
      const target = schema.timeline.overlayEvents.find(
        (o) => o.id === trigger.target_event,
      );
      contextParts.push(`Target: ${target?.label || trigger.target_event}`);
    }
    if (trigger.isRelative && trigger.relativeAnchor) {
      contextParts.push("Relative trigger");
    }
    if (trigger.customLabel) {
      contextParts.push(`Custom: ${trigger.customLabel}`);
    }

    entries.push({
      time: trigger.trigger_time,
      lane: "trigger",
      label: trigger.customLabel || trigger.type.replace("_", " "),
      context: contextParts.join(" | ") || undefined,
    });
  });

  // Sort by time
  entries.sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

  return entries;
};

/**
 * Format agenda for clipboard or print
 */
export const formatAgendaForExport = (
  entries: AgendaEntry[],
  options: { includeContext: boolean },
): string => {
  const lines: string[] = [];
  lines.push("OPERATIONS AGENDA");
  lines.push("=".repeat(50));
  lines.push("");

  entries.forEach((entry) => {
    const lanePrefix =
      entry.lane === "flow"
        ? "FLOW"
        : entry.lane === "overlay"
          ? "OVER"
          : "TRIG";
    const line = `${entry.time} [${lanePrefix}] ${entry.label}`;

    if (options.includeContext && entry.context) {
      lines.push(`${line} - ${entry.context}`);
    } else {
      lines.push(line);
    }

    if (entry.duration) {
      lines.push(`       ${entry.duration}`);
    }
    lines.push("");
  });

  return lines.join("\n");
};
