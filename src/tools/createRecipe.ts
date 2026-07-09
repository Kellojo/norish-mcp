import { norishFetch } from "../api.js";

export interface CreateRecipeInput {
  name: string;
  description?: string | null;
  image?: string | null;
  url?: string | null;
  servings: number;
  prepMinutes?: number | null;
  cookMinutes?: number | null;
  totalMinutes?: number | null;
  notes?: string | null;
  systemUsed?: "metric" | "us";
  calories?: number | null;
  fat?: string | null;
  carbs?: string | null;
  protein?: string | null;
  categories?: Array<"Breakfast" | "Lunch" | "Dinner" | "Snack">;
  version?: number;
  id?: string;
}

export async function createRecipe(input: CreateRecipeInput): Promise<any> {
  return norishFetch("/api/v1/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
