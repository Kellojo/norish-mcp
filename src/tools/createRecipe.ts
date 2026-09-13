import { norishFetch } from "../api.js";

export interface CreateRecipeInput {
  name: string;
  description?: string | null;
  image?: string | null;
  url?: string | null;
  servings?: number;
  prepMinutes?: number | null;
  cookMinutes?: number | null;
  totalMinutes?: number | null;
  notes?: string | null;
  systemUsed?: "metric" | "us";
  calories?: number | null;
  fat?: string | null;
  carbs?: string | null;
  protein?: string | null;
  originCountry?: string | null;
  originCountryName?: string | null;
  originRegion?: string | null;
  provenanceNote?: string | null;
  dishColor?: string | null;
  categories?: Array<"Breakfast" | "Lunch" | "Dinner" | "Snack">;
  tags?: Array<{ name: string }>;
  cuisines?: string[];
  steps?: Array<{
    step: string;
    order: number;
    systemUsed?: "metric" | "us";
    images?: Array<{ image: string; order?: number }>;
    stepIngredients?: Array<{ ingredientOrder: number; share?: number; order?: number }>;
  }>;
  recipeIngredients?: Array<{
    ingredientId?: string | null;
    amount?: number | null;
    unit?: string | null;
    order: number;
    systemUsed?: "metric" | "us";
    ingredientName?: string;
  }>;
  images?: Array<{
    image: string;
    order?: number;
    generated?: boolean;
  }>;
  videos?: Array<{
    video: string;
    thumbnail?: string | null;
    duration?: number | null;
    order?: number;
  }>;
  id?: string;
  version?: number;
}

export async function createRecipe(input: CreateRecipeInput): Promise<string> {
  return norishFetch("/api/v1/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
