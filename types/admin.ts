export type AdminUser = {
  id: string;
  username: string;
  role: string;
  is_active: boolean;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type HolidayOccurrence = {
  date: string;
  name: string;
  closureType: "CLOSED" | "CLOSE_EARLY";
  closeTime?: string | null;
  ruleId?: string;
};

export type ShiftRecord = {
  id: string;
  date: string;
  shift: "AM" | "PM";
  pulltabs_total: number;
  deposit_total: number;
  bingo_total: number;
  players?: number | null;
  workflow_type: string;
  beginning_box?: number | null;
  ending_box?: number | null;
  bingo_actual?: number | null;
  deposit_actual?: number | null;
  notes?: string | null;
  deposit_bank_total?: number;
  box_delta?: number | null;
  bingo_deposited?: number;
  actual_revenue?: number | null;
  
  prev_shift_id?: string | null;
  created_by_user_id?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  prev_shift?: ShiftRecord | null;
  created_by?: {
    id: string;
    username: string;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
};
