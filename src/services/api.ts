import { getCartSession, getToken } from "@/lib/utils";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://e-commerce-backend-main-d3ytue.laravel.cloud/api";

type RequestOptions = RequestInit & {
  auth?: boolean;
  cart?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  if (options.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.cart) {
    headers.set("X-Cart-Session", getCartSession());
    headers.set("X-Store-Domain", getStoreDomain());
  }

  // Laravel API connection happens here. Change NEXT_PUBLIC_API_BASE_URL per client/store.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(json?.message || "API request failed");
  }

  return json as T;
}

export type PaginatedResponse<T> = {
  data: T[];
  links?: unknown;
  meta?: unknown;
};

export type SingleResponse<T> = {
  success?: boolean;
  data: T;
};

function getStoreDomain() {
  if (process.env.NEXT_PUBLIC_STORE_DOMAIN) {
    return process.env.NEXT_PUBLIC_STORE_DOMAIN;
  }

  if (typeof window !== "undefined") {
    return window.location.hostname;
  }

  return "localhost";
}
