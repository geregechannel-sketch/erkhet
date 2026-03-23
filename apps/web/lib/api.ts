import { repairDeep } from "@/lib/text";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function backendBaseUrl() {
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

function toApiPath(path: string) {
  return path.startsWith("/api") ? path : `/api${path}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;
  const data = repairDeep(parsed);

  if (!response.ok) {
    throw new ApiError((data as { error?: string } | null)?.error || "Request failed", response.status);
  }

  return data as T;
}

export async function serverApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${backendBaseUrl()}${toApiPath(path)}`, {
    ...init,
    cache: "no-store",
    headers
  });

  return parseResponse<T>(response);
}

export async function browserApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(toApiPath(path), {
    ...init,
    cache: "no-store",
    headers
  });

  return parseResponse<T>(response);
}

export async function safeServerApiFetch<T>(path: string, fallback: T, init: RequestInit = {}) {
  try {
    return await serverApiFetch<T>(path, init);
  } catch {
    return fallback;
  }
}

export function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}