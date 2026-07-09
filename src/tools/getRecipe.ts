import { norishFetch } from "../api.js";

export interface NorishRecipe {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  url?: string | null;
  servings?: number | null;
  prepMinutes?: number | null;
  cookMinutes?: number | null;
  totalMinutes?: number | null;
  notes?: string | null;
  systemUsed?: string;
  calories?: number | null;
  fat?: string | null;
  carbs?: string | null;
  protein?: string | null;
  categories: string[];
  createdAt: string;
  updatedAt: string;
  ingredients?: Array<{
    ingredientId?: string;
    name: string;
    amount?: number | null;
    unit?: string | null;
  }>;
  steps?: Array<{
    id: string;
    order: number;
    step: string;
  }>;
}

export async function getRecipeById(id: string): Promise<NorishRecipe> {
  return norishFetch<NorishRecipe>(`/api/v1/recipes/${id}`);
}
