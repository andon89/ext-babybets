import { supabase } from "./supabase";
import { Prediction } from "./types";
import { nanoid } from "nanoid";

export async function submitPrediction(
  poolId: string,
  prediction: Omit<Prediction, "id" | "pool_id" | "short_code" | "created_at">
): Promise<{ prediction: Prediction; shortCode: string }> {
  const shortCode = nanoid(6);

  const { data, error } = await supabase
    .from("bb_predictions")
    .insert({
      pool_id: poolId,
      short_code: shortCode,
      guest_name: prediction.guest_name,
      guest_email: prediction.guest_email,
      guest_phone: prediction.guest_phone,
      gender_guess: prediction.gender_guess,
      birthday: prediction.birthday,
      birth_time: prediction.birth_time,
      weight_lbs: prediction.weight_lbs,
      weight_oz: prediction.weight_oz,
      length_inches: prediction.length_inches,
      hair_amount: prediction.hair_amount,
      hair_color: prediction.hair_color,
      eye_color: prediction.eye_color,
      name_guess: prediction.name_guess,
    })
    .select()
    .single();

  if (error) throw error;
  return { prediction: data as Prediction, shortCode };
}

export async function getPredictionByCode(shortCode: string): Promise<Prediction | null> {
  const { data, error } = await supabase
    .from("bb_predictions")
    .select("*")
    .eq("short_code", shortCode)
    .single();

  if (error) return null;
  return data as Prediction;
}
