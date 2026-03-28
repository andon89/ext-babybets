export const GENDERS = ["Boy", "Girl"] as const;
export const HAIR_AMOUNTS = [
  "Bald",
  "Peach fuzz",
  "Some hair",
  "Full head",
] as const;
export const HAIR_COLORS = ["Brown", "Blonde", "Black", "Red"] as const;
export const EYE_COLORS = [
  "Brown",
  "Blue",
  "Green",
  "Hazel",
  "Gray",
] as const;

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";
  return `${month} ${day}${suffix}`;
}

export function generateSlug(babyName: string): string {
  const year = new Date().getFullYear();
  const slug = babyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  return `${slug}-${year}`;
}

import { CategoryKey, CATEGORY_MAX_POINTS } from "./types";

export const CATEGORY_META: Record<CategoryKey, { label: string; description: string; emoji: string }> = {
  gender: { label: "Gender", description: "Boy or Girl", emoji: "👶" },
  birthday: { label: "Birthday", description: "Date of birth", emoji: "📅" },
  birth_time: { label: "Birth Time", description: "Hour and minute", emoji: "⏰" },
  weight: { label: "Weight", description: "Pounds and ounces", emoji: "⚖️" },
  length: { label: "Length", description: "Inches", emoji: "📏" },
  hair_amount: { label: "Hair Amount", description: "How much hair", emoji: "💇" },
  hair_color: { label: "Hair Color", description: "Brown, Blonde, Black, Red", emoji: "🎨" },
  eye_color: { label: "Eye Color", description: "Brown, Blue, Green, Hazel, Gray", emoji: "👁️" },
  name: { label: "Name", description: "First name guess", emoji: "✨" },
};

export const ALL_CATEGORIES: CategoryKey[] = [
  "gender", "birthday", "birth_time", "weight", "length",
  "hair_amount", "hair_color", "eye_color", "name",
];
