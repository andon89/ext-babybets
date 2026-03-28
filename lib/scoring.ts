import { CategoryKey, CATEGORY_MAX_POINTS, ScoreBreakdown, Prediction, PoolSettings } from "./types";

export function scoreBirthday(guess: string, actual: string): number {
  const guessDate = new Date(guess + "T00:00:00");
  const actualDate = new Date(actual + "T00:00:00");
  const diffDays = Math.abs(
    Math.round(
      (guessDate.getTime() - actualDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  if (diffDays === 0) return 25;
  if (diffDays === 1) return 20;
  if (diffDays === 2) return 15;
  if (diffDays === 3) return 10;
  if (diffDays <= 5) return 5;
  return 0;
}

export function scoreBirthTime(guess: string, actual: string): number {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const diff = Math.abs(toMinutes(guess) - toMinutes(actual));
  const wrappedDiff = Math.min(diff, 1440 - diff);
  if (wrappedDiff === 0) return 25;
  if (wrappedDiff <= 30) return 20;
  if (wrappedDiff <= 60) return 15;
  if (wrappedDiff <= 120) return 10;
  if (wrappedDiff <= 240) return 5;
  return 0;
}

export function scoreWeight(
  guessLbs: number,
  guessOz: number,
  actualLbs: number,
  actualOz: number
): number {
  const guessTotal = guessLbs * 16 + guessOz;
  const actualTotal = actualLbs * 16 + actualOz;
  const diff = Math.abs(guessTotal - actualTotal);
  if (diff === 0) return 25;
  if (diff <= 2) return 20;
  if (diff <= 4) return 15;
  if (diff <= 8) return 10;
  if (diff <= 16) return 5;
  return 0;
}

export function scoreLength(guess: number, actual: number): number {
  const diff = Math.abs(guess - actual);
  if (diff === 0) return 25;
  if (diff <= 0.25) return 20;
  if (diff <= 0.5) return 15;
  if (diff <= 1) return 10;
  if (diff <= 1.5) return 5;
  return 0;
}

export function scoreCategorical(guess: string, actual: string): number {
  return guess.toLowerCase() === actual.toLowerCase() ? 10 : 0;
}

export function scoreName(guess: string, actual: string): number {
  return guess.trim().toLowerCase() === actual.trim().toLowerCase() ? 40 : 0;
}

export function scoreAll(
  prediction: Prediction,
  settings: PoolSettings,
  enabledCategories: CategoryKey[]
): ScoreBreakdown {
  const scores: ScoreBreakdown = {
    gender: 0,
    birthday: 0,
    birth_time: 0,
    weight: 0,
    length: 0,
    hair_amount: 0,
    hair_color: 0,
    eye_color: 0,
    name: 0,
    total: 0,
    max_possible: 0,
  };

  const enabled = new Set(enabledCategories);
  let maxPossible = 0;

  if (enabled.has("gender") && prediction.gender_guess && settings.actual_gender) {
    scores.gender = scoreCategorical(prediction.gender_guess, settings.actual_gender);
    maxPossible += CATEGORY_MAX_POINTS.gender;
  }
  if (enabled.has("birthday") && prediction.birthday && settings.actual_birthday) {
    scores.birthday = scoreBirthday(prediction.birthday, settings.actual_birthday);
    maxPossible += CATEGORY_MAX_POINTS.birthday;
  }
  if (enabled.has("birth_time") && prediction.birth_time && settings.actual_birth_time) {
    scores.birth_time = scoreBirthTime(prediction.birth_time, settings.actual_birth_time);
    maxPossible += CATEGORY_MAX_POINTS.birth_time;
  }
  if (
    enabled.has("weight") &&
    prediction.weight_lbs != null &&
    prediction.weight_oz != null &&
    settings.actual_weight_lbs != null &&
    settings.actual_weight_oz != null
  ) {
    scores.weight = scoreWeight(
      prediction.weight_lbs,
      prediction.weight_oz,
      settings.actual_weight_lbs,
      settings.actual_weight_oz
    );
    maxPossible += CATEGORY_MAX_POINTS.weight;
  }
  if (enabled.has("length") && prediction.length_inches != null && settings.actual_length_inches != null) {
    scores.length = scoreLength(prediction.length_inches, settings.actual_length_inches);
    maxPossible += CATEGORY_MAX_POINTS.length;
  }
  if (enabled.has("hair_amount") && prediction.hair_amount && settings.actual_hair_amount) {
    scores.hair_amount = scoreCategorical(prediction.hair_amount, settings.actual_hair_amount);
    maxPossible += CATEGORY_MAX_POINTS.hair_amount;
  }
  if (enabled.has("hair_color") && prediction.hair_color && settings.actual_hair_color) {
    scores.hair_color = scoreCategorical(prediction.hair_color, settings.actual_hair_color);
    maxPossible += CATEGORY_MAX_POINTS.hair_color;
  }
  if (enabled.has("eye_color") && prediction.eye_color && settings.actual_eye_color) {
    scores.eye_color = scoreCategorical(prediction.eye_color, settings.actual_eye_color);
    maxPossible += CATEGORY_MAX_POINTS.eye_color;
  }
  if (enabled.has("name") && prediction.name_guess && settings.actual_name) {
    scores.name = scoreName(prediction.name_guess, settings.actual_name);
    maxPossible += CATEGORY_MAX_POINTS.name;
  }

  scores.total = Object.entries(scores)
    .filter(([key]) => key !== "total" && key !== "max_possible")
    .reduce((sum, [, val]) => sum + (val as number), 0);
  scores.max_possible = maxPossible;

  return scores;
}
