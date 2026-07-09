import { norishFetch } from "../api.js";

interface GroceryItem {
  id: string;
  recipeIngredientId?: string | null;
  name?: string | null;
  unit?: string | null;
  amount?: number | null;
  isDone: boolean;
  sortOrder: number;
  version: number;
  recurringGroceryId?: string | null;
  storeId?: string | null;
}

export async function listGroceries(): Promise<GroceryItem[]> {
  return norishFetch<GroceryItem[]>(`/api/v1/groceries`);
}

export interface CreateGroceryInput {
  name: string;
  unit: string;
  amount: number;
  isDone?: boolean;
  storeId?: string | null;
}

export async function createGrocery(input: CreateGroceryInput): Promise<GroceryItem> {
  return norishFetch<GroceryItem>(`/api/v1/groceries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      unit: input.unit,
      amount: input.amount,
      isDone: input.isDone ?? false,
      ...(input.storeId ? { storeId: input.storeId } : {}),
    }),
  });
}

export async function markGroceryAsDone(id: string, version: number): Promise<{ grocery: GroceryItem | null; stale: boolean }> {
  return norishFetch(`/api/v1/groceries/${id}/done`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version }),
  });
}

export async function markGroceryAsUndone(id: string, version: number): Promise<{ grocery: GroceryItem | null; stale: boolean }> {
  return norishFetch(`/api/v1/groceries/${id}/undone`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version }),
  });
}

export async function deleteGrocery(id: string, version: number): Promise<{ success: boolean; stale: boolean }> {
  return norishFetch(`/api/v1/groceries/${id}?version=${version}`, {
    method: "DELETE",
  });
}

export interface AssignStoreInput {
  storeId: string | null;
  version: number;
  savePreference?: boolean;
}

export async function assignGroceryToStore(id: string, input: AssignStoreInput): Promise<{ grocery: GroceryItem | null; stale: boolean }> {
  return norishFetch(`/api/v1/groceries/${id}/store`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      version: input.version,
      storeId: input.storeId,
      savePreference: input.savePreference ?? true,
    }),
  });
}
