import { norishFetch } from "../api.js";

export interface ListRecipesOptions {
  limit?: number;
  cursor?: number;
  search?: string;
  searchFields?: Array<"title" | "description" | "ingredients" | "steps" | "tags">;
  tags?: string[];
  categories?: Array<"Breakfast" | "Lunch" | "Dinner" | "Snack">;
  filterMode?: "AND" | "OR";
  sortMode?: "titleAsc" | "titleDesc" | "dateAsc" | "dateDesc" | "none";
  minRating?: number;
  maxCookingTime?: number;
}

interface NorishSearchResponse {
  recipes: Array<{
    id: string;
    name: string;
    description?: string | null;
    image?: string | null;
    categories: string[];
    servings?: number | null;
    totalMinutes?: number | null;
    createdAt: string;
  }>;
  total: number;
  nextCursor?: number | null;
}

export async function listRecipes(options: ListRecipesOptions = {}) {
  const body: Record<string, unknown> = {
    limit: options.limit ?? 50,
    cursor: options.cursor ?? 0,
  };
  if (options.search) body.search = options.search;
  if (options.searchFields) body.searchFields = options.searchFields;
  if (options.tags) body.tags = options.tags;
  if (options.categories) body.categories = options.categories;
  if (options.filterMode) body.filterMode = options.filterMode;
  if (options.sortMode) body.sortMode = options.sortMode;
  if (options.minRating !== undefined) body.minRating = options.minRating;
  if (options.maxCookingTime !== undefined) body.maxCookingTime = options.maxCookingTime;

  return norishFetch<NorishSearchResponse>("/api/v1/recipes/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
