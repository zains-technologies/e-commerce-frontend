import type { Category } from "./category";

export interface ProductImage {
  id: number;
  url: string;
  path?: string;
  is_primary?: boolean;
}

export interface ProductVariant {
  id: number;
  attribute_name: string;
  attribute_value: string;
  price_adjustment: number;
  stock_quantity: number;
  sku?: string | null;
}

export interface Product {
  id: number;
  category?: Category | null;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  cost_price?: number;
  sku?: string | null;
  stock_quantity: number;
  low_stock?: boolean;
  status?: string;
  is_featured?: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

