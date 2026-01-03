export interface BingoGamePricing {
  model: "standard" | "premium" | "included";
  price?: number;
  currency?: string;
}

export interface BingoGamePayout {
  type: "fixed" | "percentage" | "progressive" | "merchandise";
  amount?: number;
  percentage?: number;
  description?: string;
  currency?: string;
}

export interface BingoGameTimeline {
  estimatedDuration?: number; // minutes
  isBreak?: boolean;
}

export interface BingoGameExtended {
  id?: string;
  sortOrder: number;
  title: string;
  paperColor: string;
  notes?: string;
  patternSlug: string;
  pricing: BingoGamePricing;
  payout: BingoGamePayout;
  timeline: BingoGameTimeline;
}

export interface BingoProgramExtended {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  games: BingoGameExtended[];
}
