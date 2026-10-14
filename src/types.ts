export interface Trip {
  id: string;
  code: string;
  name: string;
  start_city: string;
  year: number;
  state_code: string;
  duration_days: number;
  created_by: string;
}

export interface Member {
  user_id: string;
  display_name: string;
}

export interface AvailabilityRow {
  user_id: string;
  days: string[];
}