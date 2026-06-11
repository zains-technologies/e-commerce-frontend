import type { Product, ProductVariant } from "./product";

export interface CartItem {
  id: number;
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
}

export interface Cart {
  id?: number;
  coupon?: string | null;
  items: CartItem[];
  totals: CartTotals;
}

export interface AddToCartPayload {
  product_id: number;
  product_variant_id?: number | null;
  quantity: number;
  coupon_code?: string;
}

export interface CheckoutPayload {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_address: string;
  delivery_fee?: number;
  payment_method?: "cod" | "bank_transfer" | "payhere";
  meta?: Record<string, unknown>;
}

