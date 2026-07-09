import { norishFetch } from "../api.js";

export interface ImportRecipeUrlInput {
  url: string;
  forceAI?: boolean;
}

export async function importRecipeByUrl(input: ImportRecipeUrlInput): Promise<string> {
  return norishFetch("/api/v1/recipes/import/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export interface ImportRecipeByTextInput {
  text: string;
  forceAI?: boolean;
}

export async function importRecipeByPaste(input: ImportRecipeByTextInput): Promise<{ recipeIds: string[] }> {
  return norishFetch("/api/v1/recipes/import/paste", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
