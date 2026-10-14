export type Stage = 'dates' | 'interests' | 'transport' | 'destination';

export interface Trip {
  id: string;
  code: string;
  name: string;
  start_city: string;
  year: number;
  state_code: string;
  duration_days: number;
  created_by: string;
  stage: Stage;
  chosen_start: string | null;
  chosen_end: string | null;
  travelers: string[];
  chosen_interests: string[];
  chosen_transport: string | null;
  chosen_budget_pp: number | null;
}

export interface Member {
  user_id: string;
  display_name: string;
}

export interface AvailabilityRow {
  user_id: string;
  days: string[];
}

export interface DateOption {
  start_date: string;
  end_date: string;
}

export interface DateVoteRow {
  user_id: string;
  starts: string[];
}

export interface PreferenceRow {
  user_id: string;
  interests: string[];
  transport: string | null;
}