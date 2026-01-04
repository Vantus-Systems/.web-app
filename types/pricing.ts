export interface PricingMachine {
  description: string;
  price: string;
  type: "individual" | "bundle" | "premium";
  savings?: string;
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
