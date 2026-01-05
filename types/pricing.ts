export interface PricingMachine {
  description: string;
  price: string;
  type: "individual" | "bundle" | "premium";
  savings?: string;
  badge?: string;
}

export interface PricingSection {
  type: "machines" | "paperRules" | "packages" | "bullets" | "note";
  title?: string;
  items: any[]; // Flexible for now, can be typed stricter if needed
}

export interface PricingSession {
  id?: string;
  name: string;
  timeRange: string;
  icon: string;
  machines: PricingMachine[];
  paperRules: {
    minSpend: string;
    minPaperCards: number;
    description?: string;
  };
  paperRulesAdvanced: {
    minSpendAdvanced: string;
    maxPaperCards: string;
    description?: string;
  };
  vibe?: string[];
  badges?: string[];
  isVisible?: boolean;
  sections?: PricingSection[];
}

export interface PricingJackpot {
  name: string;
  time: string;
  prize: string;
  description?: string;
}

export interface PricingDaytime {
  sessions: PricingSession[];
  jackpots: PricingJackpot[];
  paperOnlyGames?: Record<
    string,
    { name: string; cards: string; price: string }[]
  >;
}

export interface PricingEvening {
  startTime: string;
  valueProposition: string;
  scheduleNote: string;
  machines: PricingMachine[];
}

export interface PricingConfig {
  daytime?: PricingDaytime;
  evening?: PricingEvening;
}

export interface PricingPromotion {
  id: string;
  title: string;
  description: string;
  badge?: string;
  dayOfWeek?: number; // 0-6
  date?: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface PricingTemplate {
  id: string;
  name: string;
  description?: string;
  config: PricingConfig;
  isVisible?: boolean;
}

export interface PricingDateOverride {
  date: string; // YYYY-MM-DD
  templateId: string;
  note?: string;
  isVisible?: boolean;
}

export type PricingWeekdayCode =
  | "Sun"
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat";

// Legacy persisted configs used numeric weekday keys ("0".."6").
export type PricingWeekdayIndexString = "0" | "1" | "2" | "3" | "4" | "5" | "6";

export type PricingWeeklyRotation = Partial<
  Record<PricingWeekdayCode | PricingWeekdayIndexString, string>
>;

export interface PricingSchemaV2 {
  schemaVersion: 2;
  templates: PricingTemplate[];
  defaultTemplateId: string;
  weeklyRotation: PricingWeeklyRotation;
  dateOverrides: PricingDateOverride[];
  promotions: PricingPromotion[];
}

export type PricingContent = PricingConfig | PricingSchemaV2;
