import { norishFetch } from "../api.js";

export interface ListRecipesOptions {
  limit?: number;
  cursor?: number;
  search?: string;
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
  nextCursor?: number | null;
}

export async function listRecipes(options: ListRecipesOptions = {}) {
  const body = {
    limit: options.limit ?? 50,
    cursor: options.cursor ?? 0,
    ...(options.search ? { search: options.search } : {}),
  };

  return norishFetch<NorishSearchResponse>("/api/v1/recipes/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
