import { norishFetch } from "../api.js";

export type PlannedRecipeSlot = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface PlannedRecipeItem {
  id: string;
  date: string;
  slot: PlannedRecipeSlot;
  sortOrder: number;
  recipeId: string;
  version: number;
  recipeName: string | null;
  recipeImage: string | null;
  servings: number | null;
  calories: number | null;
}

export async function getTodayPlannedRecipes(): Promise<PlannedRecipeItem[]> {
  return norishFetch("/api/v1/planned-recipes/today");
}

export async function getWeekPlannedRecipes(): Promise<PlannedRecipeItem[]> {
  return norishFetch("/api/v1/planned-recipes/week");
}

export async function getMonthPlannedRecipes(): Promise<PlannedRecipeItem[]> {
  return norishFetch("/api/v1/planned-recipes/month");
}

export interface AddToPlanInput {
  date: string; // YYYY-MM-DD format
  slot: PlannedRecipeSlot;
  recipeId: string;
}

export async function addToPlan(input: AddToPlanInput): Promise<{ id: string }> {
  return norishFetch("/api/v1/planned-recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export interface RemoveFromPlanInput {
  itemId: string;
  version: number;
}

export async function removeFromPlan(input: RemoveFromPlanInput): Promise<{ success: boolean; stale: boolean }> {
  const url = `${process.env.NORISH_API_URL}/api/v1/planned-recipes/${input.itemId}?version=${input.version}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "x-api-key": process.env.NORISH_API_KEY!,
    },
  });

  if (!res.ok) {
    throw new Error(`Norish API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
