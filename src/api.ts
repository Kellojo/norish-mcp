const NORISH_API_URL = process.env.NORISH_API_URL || "http://localhost:3000";
const NORISH_API_KEY = process.env.NORISH_API_KEY;

if (!NORISH_API_KEY) {
  console.error("NORISH_API_KEY environment variable is required");
  process.exit(1);
}

export async function norishFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${NORISH_API_URL}${path}`;
  const headers = new Headers((options?.headers as Record<string, string>) || {});
  headers.set("x-api-key", NORISH_API_KEY!);

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`Norish API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
