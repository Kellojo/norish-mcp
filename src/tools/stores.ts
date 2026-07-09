import { norishFetch } from "../api.js";

interface StoreItem {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  version: number;
}

export async function listStores(): Promise<StoreItem[]> {
  return norishFetch<StoreItem[]>(`/api/v1/stores`);
}

export interface CreateStoreInput {
  name: string;
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "slate" | "sky" | "violet";
  icon?: string;
}

export async function createStore(input: CreateStoreInput): Promise<StoreItem> {
  const body: Record<string, unknown> = { name: input.name };
  if (input.color) body.color = input.color;
  if (input.icon) body.icon = input.icon;

  return norishFetch<StoreItem>(`/api/v1/stores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
