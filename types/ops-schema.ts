export type OpsSchemaStatus = "Draft" | "Live";

export interface OpsSchemaMeta {
  name: string;
  status: OpsSchemaStatus;
  version: number;
  updatedAt: string;
}

export interface RateCard {
  id: string;
  name: string;
  description?: string;
  category?: string;
  basePrice?: number;
  tags?: string[];
}

export interface Bundle {
  id: string;
  name: string;
  description?: string;
  rateCardIds: string[];
  price?: number;
}

export interface InventoryTier {
  id: string;
  name: string;
  minUnits?: number;
  maxUnits?: number;
  priceModifier?: number;
}

export interface FlowSegment {
  id: string;
  name: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  rateCardId?: string;
}

export interface OverlayEvent {
  id: string;
  name: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  rateCardId?: string;
}

export interface LogicTrigger {
  id: string;
  name: string;
  condition: string;
  action: string;
}

export interface DayProfile {
  id: string;
  name: string;
  category: "weekday" | "weekend" | "special" | "closed";
  description?: string;
  sessionIds?: string[];
}

export interface OpsSchema {
  meta: OpsSchemaMeta;
  definitions: {
    rateCards: RateCard[];
    bundles: Bundle[];
    inventoryTiers: InventoryTier[];
  };
  timelineConfiguration: {
    flowSegments: FlowSegment[];
    overlayEvents: OverlayEvent[];
  };
  logicTriggers: LogicTrigger[];
  dayProfiles: DayProfile[];
}
