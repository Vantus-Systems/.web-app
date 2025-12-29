export type OpsSchemaStatus = "draft" | "active";

export type OpsSchemaV2 = {
  schema_version: string;
  meta: {
    profile_name: string;
    status: OpsSchemaStatus;
    currency: string;
    timezone: string;
  };
  definitions: {
    inventory_tiers: Record<
      string,
      { id: string; name: string; price: number }
    >;
    bundles: Record<
      string,
      {
        id: string;
        name: string;
        items: string[];
        price: number;
        discount_label?: string;
        savings?: number;
      }
    >;
    rate_cards: Record<
      string,
      {
        id: string;
        name: string;
        yield_configuration: {
          mode: "fixed_rate" | "standard_rate" | "reduced_rate";
          active_bundles: string[];
          qualifying_criteria?: {
            min_spend?: number;
            free_unit_ratio?: string;
          };
        };
      }
    >;
  };
  timeline_configuration: {
    flow_segments: Array<{
      id: string;
      label: string;
      time_start: string;
      time_end: string;
      rate_card_id: string;
      color_code?: string;
    }>;
    overlay_events: Array<{
      id: string;
      label: string;
      time_start: string;
      time_end: string;
      is_hard_ticket: boolean;
      pricing_override?: Record<string, unknown>;
    }>;
  };
  logic_triggers: Array<{
    trigger_time: string;
    type: "hard_reset" | "sales_window_open";
    target_event?: string;
    description?: string;
  }>;
  day_profiles: Array<{
    id: string;
    name: string;
    category: "weekday" | "weekend" | "special" | "closed";
    segment_ids: string[];
    overlay_event_ids: string[];
    description?: string;
  }>;
  calendar: {
    assignments: Record<string, string>;
    overrides: Record<string, Array<{ id: string; profile_id: string }>>;
  };
};
