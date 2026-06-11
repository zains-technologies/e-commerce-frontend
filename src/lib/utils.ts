export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number, currency = "LKR") {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function getPrimaryImage(images?: { url: string; is_primary?: boolean }[]) {
  return images?.find((image) => image.is_primary)?.url || images?.[0]?.url || "/window.svg";
}

export function getCartSession() {
  if (typeof window === "undefined") return "server-session";

  const key = "ecommerce_cart_session";
  const existing = window.localStorage.getItem(key);

  if (existing) return existing;

  const value = `web-${crypto.randomUUID()}`;
  window.localStorage.setItem(key, value);
  return value;
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("ecommerce_token");
}

export function setToken(token: string) {
  window.localStorage.setItem("ecommerce_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("ecommerce_token");
}

