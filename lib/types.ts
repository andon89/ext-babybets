export type CategoryKey =
  | "gender"
  | "birthday"
  | "birth_time"
  | "weight"
  | "length"
  | "hair_amount"
  | "hair_color"
  | "eye_color"
  | "name";

export interface Pool {
  id: string;
  slug: string;
  baby_name: string;
  due_date: string;
  host_display_name: string;
  enabled_categories: CategoryKey[];
  predictions_locked: boolean;
  revealed: boolean;
  share_code: string;
  created_at: string;
}

export interface PoolHost {
  pool_id: string;
  user_id: string;
  role: "creator" | "co-parent";
  invited_at: string;
  accepted_at: string | null;
}

export interface PoolSettings {
  pool_id: string;
  actual_gender: string | null;
  actual_birthday: string | null;
  actual_birth_time: string | null;
  actual_weight_lbs: number | null;
  actual_weight_oz: number | null;
  actual_length_inches: number | null;
  actual_hair_amount: string | null;
  actual_hair_color: string | null;
  actual_eye_color: string | null;
  actual_name: string | null;
  photo_urls: string[];
  announcement_message: string | null;
}

export interface Prediction {
  id: string;
  pool_id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  short_code: string;
  gender_guess: "Boy" | "Girl" | null;
  birthday: string | null;
  birth_time: string | null;
  weight_lbs: number | null;
  weight_oz: number | null;
  length_inches: number | null;
  hair_amount: "Bald" | "Peach fuzz" | "Some hair" | "Full head" | null;
  hair_color: "Brown" | "Blonde" | "Black" | "Red" | null;
  eye_color: "Brown" | "Blue" | "Green" | "Hazel" | "Gray" | null;
  name_guess: string | null;
  created_at: string;
}

export interface Invite {
  id: string;
  pool_id: string;
  channel: "link" | "qr" | "email" | "share_sheet";
  recipient: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreBreakdown {
  gender: number;
  birthday: number;
  birth_time: number;
  weight: number;
  length: number;
  hair_amount: number;
  hair_color: number;
  eye_color: number;
  name: number;
  total: number;
  max_possible: number;
}

export const CATEGORY_MAX_POINTS: Record<CategoryKey, number> = {
  gender: 10,
  birthday: 25,
  birth_time: 25,
  weight: 25,
  length: 25,
  hair_amount: 10,
  hair_color: 10,
  eye_color: 10,
  name: 40,
};
