/**
 * Enhanced Ops Schema Types for Premium Operations Builder
 * Extends existing types with advanced features for Fortune-1000 quality bar
 */

import type {
  OpsSchemaV2,
  OpsSchemaFlowSegment,
  OpsSchemaOverlayEvent,
  OpsSchemaLogicTrigger,
} from "./ops-schema";

// ===== ENHANCED TRIGGER TYPES =====

export type TriggerType =
  | "hard_reset"
  | "sales_window_open"
  | "sales_window_close"
  | "doors_open"
  | "doors_close"
  | "session_start"
  | "session_end"
  | "jackpot_reset"
  | "custom";

export interface RelativeAnchor {
  targetId: string; // ID of overlay or segment to anchor to
  anchorPoint: "start" | "end";
  offsetMinutes: number; // positive = after, negative = before
}

export interface CustomTriggerParams {
  [key: string]: string | number | boolean;
}

export interface EnhancedLogicTrigger extends OpsSchemaLogicTrigger {
  type: TriggerType;
  // Relative mode support
  relativeAnchor?: RelativeAnchor;
  // Custom trigger support
  customLabel?: string;
  customDescription?: string;
  customParams?: CustomTriggerParams;
  // Visual state
  isRelative?: boolean;
  derivedTime?: string; // Computed absolute time for relative triggers
}

// ===== CONSTRAINT SYSTEM TYPES =====

export type ConstraintSeverity = "error" | "warning" | "info";

export interface ConstraintViolation {
  id: string;
  constraintId: string;
  severity: ConstraintSeverity;
  message: string;
  affectedIds: string[];
  path?: (string | number)[];
}

export interface Constraint {
  id: string;
  label: string;
  severity: ConstraintSeverity;
  check: (state: OpsSchemaV2) => ConstraintViolation[];
  fix?: (violation: ConstraintViolation, state: OpsSchemaV2) => OpsSchemaV2;
}

// ===== EDITING MODE TYPES =====

export type EditMode = "standard" | "ripple" | "knife";

export interface RippleOptions {
  enabled: boolean;
  preserveSpacing: boolean;
  minDuration: number; // minutes
}

export interface SnapSettings {
  gridIncrement: number;
  anchorSnapEnabled: boolean;
  anchorThreshold: number; // pixels
  showGuideLines: boolean;
}

// ===== SIMULATION TYPES =====

export type SimulationSpeed = 1 | 10 | 60;

export interface SimulationState {
  isPlaying: boolean;
  currentTime: number; // minutes from start
  speed: SimulationSpeed;
  events: Array<{
    time: number;
    type: string;
    description: string;
  }>;
  activeSegment?: OpsSchemaFlowSegment;
  activeOverlays: OpsSchemaOverlayEvent[];
}

export interface StagePreview {
  time: string;
  customerScreen: string;
  posStaff: string;
  activeFlow: string;
  activeOverlays: string[];
  triggeredEvents: string[];
}

// ===== ANALYTICS TYPES =====

export interface RevenueProjection {
  totalValue: number;
  breakdown: Array<{
    segmentId: string;
    rateCardName: string;
    durationHours: number;
    seatCapacity: number;
    rateFactor: number;
    value: number;
  }>;
}

export interface StaffingDensity {
  timeRanges: Array<{
    start: number;
    end: number;
    density: "low" | "medium" | "high";
    reason: string;
  }>;
}

export interface CompletenessScore {
  score: number; // 0-100
  breakdown: {
    coverage: number; // 0-100
    noOverlaps: number; // 0-100
    triggersValid: number; // 0-100
    noViolations: number; // 0-100
  };
  missing: string[];
}

// ===== EXPORT TYPES =====

export interface AgendaEntry {
  time: string;
  lane: "flow" | "overlay" | "trigger";
  label: string;
  duration?: string;
  context?: string;
}

export interface ExportOptions {
  format: "clipboard" | "print";
  includeContext: boolean;
  sortByTime: boolean;
}

// ===== UI STATE TYPES =====

export interface StudioUIState {
  // Layout
  leftPaneWidth: number; // pixels
  rightPaneWidth: number; // pixels
  leftPaneCollapsed: boolean;
  rightPaneCollapsed: boolean;

  // Toolbar
  operationalHours: {
    start: string;
    end: string;
  };
  snapIncrement: number;
  zoomLevel: "compact" | "standard" | "detail";

  // Toggles
  showGaps: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showHeatmap: boolean;

  // Tools
  activeTool: EditMode;
  rippleOptions: RippleOptions;
  snapSettings: SnapSettings;

  // Selection
  selectedIds: string[];
  selectionType: "rateCard" | "segment" | "overlay" | "trigger" | null;

  // Simulation
  simulation: SimulationState;

  // Validation
  violations: ConstraintViolation[];
  issuesCount: number;
}

// ===== ENHANCED STATE WRAPPER =====

export interface EnhancedOpsSchema extends OpsSchemaV2 {
  // Enhanced trigger support
  logicTriggers: EnhancedLogicTrigger[];

  // UI state (not persisted)
  ui?: StudioUIState;

  // Analytics (computed, not persisted)
  analytics?: {
    revenue: RevenueProjection;
    staffing: StaffingDensity;
    completeness: CompletenessScore;
  };
}

// ===== UTILITY TYPE GUARDS =====

export const isRelativeAnchor = (obj: any): obj is RelativeAnchor => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.targetId === "string" &&
    (obj.anchorPoint === "start" || obj.anchorPoint === "end") &&
    typeof obj.offsetMinutes === "number"
  );
};

export const isCustomParams = (obj: any): obj is CustomTriggerParams => {
  return obj && typeof obj === "object" && !Array.isArray(obj);
};

export const isEnhancedTrigger = (obj: any): obj is EnhancedLogicTrigger => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.trigger_time === "string" &&
    typeof obj.type === "string"
  );
};
