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
  options?: Record<string, string> | null;
  price_adjustment: number;
  stock_quantity: number;
  sku?: string | null;
}

export interface CatalogBrand {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logo_path?: string | null;
  is_active?: boolean;
}

export interface CatalogTag {
  id: number;
  name: string;
  slug: string;
}

export interface ProductColor {
  id: number;
  name: string;
  slug: string;
  hex_code: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface ProductCollection {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface SizeGuide {
  id: number;
  name: string;
  rows?: Array<Record<string, string>> | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface ProductSpecification {
  id?: number;
  name: string;
  value?: string | null;
}

export interface ProductReview {
  id: number;
  product?: { id: number; name: string; slug: string };
  customer_name: string;
  customer_email?: string | null;
  rating: number;
  comment?: string | null;
  status?: string;
  created_at?: string;
}

export interface ProductQuestion {
  id: number;
  product?: { id: number; name: string; slug: string };
  customer_name: string;
  customer_email?: string | null;
  question: string;
  answer?: string | null;
  status?: string;
  answered_at?: string | null;
  created_at?: string;
}

export interface Product {
  id: number;
  category?: Category | null;
  brand?: CatalogBrand | null;
  name: string;
  slug: string;
  description?: string | null;
  seo?: {
    title?: string | null;
    description?: string | null;
    keywords?: string | null;
  };
  price: number;
  cost_price?: number;
  sku?: string | null;
  stock_quantity: number;
  low_stock?: boolean;
  status?: string;
  is_featured?: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
  tags?: CatalogTag[];
  collections?: ProductCollection[];
  colors?: ProductColor[];
  size_guide?: SizeGuide | null;
  specifications?: ProductSpecification[];
  reviews_summary?: {
    average_rating: number;
    count: number;
  };
  reviews?: ProductReview[];
  questions?: ProductQuestion[];
  related_products?: Array<{ id: number; name: string; slug: string; price: number; image?: string | null }>;
  created_at?: string;
  updated_at?: string;
}
