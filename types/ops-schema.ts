export type OpsSchemaStatus = "draft" | "live";

export type OpsSchemaInventoryTier = {
  id: string;
  name: string;
  price: number;
};

export type OpsSchemaBundle = {
  id: string;
  name: string;
  items: string[];
  price: number;
  discount_label?: string;
  savings?: number;
};

export type OpsSchemaRateCard = {
  id: string;
  name: string;
  category?: string;
  color?: string;
  yield_configuration: {
    mode: "fixed_rate" | "standard_rate" | "reduced_rate";
    active_bundles: string[];
    qualifying_criteria?: {
      min_spend?: number;
      free_unit_ratio?: string;
    };
  };
};

export type OpsSchemaFlowSegment = {
  id: string;
  label: string;
  time_start: string;
  time_end: string;
  rate_card_id: string;
  color_code?: string;
  allow_overlap?: boolean;
};

export type OpsSchemaOverlayEvent = {
  id: string;
  label: string;
  time_start: string;
  time_end: string;
  is_hard_ticket: boolean;
  pricing_override?: Record<string, unknown>;
};

export type OpsSchemaLogicTrigger = {
  id: string;
  trigger_time: string;
  type:
    | "hard_reset"
    | "sales_window_open"
    | "sales_window_close"
    | "doors_open"
    | "doors_close"
    | "session_start"
    | "session_end"
    | "jackpot_reset"
    | "custom";
  target_event?: string;
  description?: string;
  custom_label?: string;
  payload?: Record<string, unknown>;
  isRelative?: boolean;
  relativeAnchor?: {
    targetId: string;
    anchorPoint: "start" | "end";
    offsetMinutes: number;
  };
  derivedTime?: string;
};

export type OpsSchemaDayProfile = {
  id: string;
  name: string;
  category: "weekday" | "weekend" | "special" | "closed";
  segment_ids: string[];
  overlay_event_ids: string[];
  description?: string;
  color?: string;
  doors_open_time?: string; // HH:mm
};

export type OpsSchemaCalendarAssignment = {
  status: "open" | "closed";
  profile_id?: string;
};

export type OpsSchemaCalendarOverride = {
  id: string;
  profile_id?: string;
  kind?: "LOCKED" | "CLOSED" | "CLOSE_EARLY" | "PROFILE_SWAP" | "DOORS_OPEN";
  reason?: string;
  note?: string;
  untilTime?: string;
  doors_open_time?: string;
};

export type OpsSchemaV2 = {
  schema_version: string;
  meta: {
    name: string;
    status: OpsSchemaStatus;
    currency: string;
    timezone: string;
    schema_version: string;
  };
  definitions: {
    inventoryTiers: OpsSchemaInventoryTier[];
    bundles: OpsSchemaBundle[];
    rateCards: OpsSchemaRateCard[];
  };
  timeline: {
    operationalHours: {
      start: string;
      end: string;
      isOpen: boolean;
    };
    flowSegments: OpsSchemaFlowSegment[];
    overlayEvents: OpsSchemaOverlayEvent[];
  };
  logicTriggers: OpsSchemaLogicTrigger[];
  dayProfiles: OpsSchemaDayProfile[];
  calendar: {
    range: {
      start: string;
      end: string;
    };
    weekdayDefaults: Record<string, OpsSchemaCalendarAssignment>;
    assignments: Record<string, OpsSchemaCalendarAssignment>;
    overrides: Record<string, OpsSchemaCalendarOverride[]>;
  };
};
