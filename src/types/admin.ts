import type { Product } from "./product";
import type { CatalogBrand, CatalogTag, ProductCollection, SizeGuide } from "./product";
import type { ProductQuestion } from "./product";
import type { Category } from "./category";
import type { MarketingBanner, NewsletterSubscriber, ShippingMethod } from "./marketing";

export interface Order {
  id: number;
  order_number: string;
  customer: { name: string; email?: string | null; phone?: string | null };
  delivery_address: string;
  subtotal: number;
  discount_total: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  delivery_status?: string;
  tracking_number?: string | null;
  shipping_method?: string | null;
  order_notes?: string | null;
  delivery_assignee?: { id: number; name: string } | null;
  timeline?: Array<{ label: string; status: string; at?: string | null }>;
  payments?: Payment[];
  items?: Array<{ id: number; product_name: string; sku?: string | null; variant_label?: string | null; quantity: number; unit_price?: number; line_total: number }>;
  created_at?: string;
}

export interface Payment {
  id: number;
  order_id: number;
  order_number?: string;
  method: string;
  status: string;
  amount: number;
  transaction_id?: string | null;
  paid_at?: string | null;
  created_at?: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  starts_at?: string | null;
  ends_at?: string | null;
  usage_limit?: number | null;
  used_count?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryLog {
  id: number;
  product_id: number;
  product_variant_id?: number | null;
  order_id?: number | null;
  type: string;
  quantity_change: number;
  stock_after: number;
  note?: string | null;
  created_at?: string;
}

export interface Branch {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: "admin" | "manager" | "staff";
  permissions?: string[];
  store_id?: number;
  created_at?: string;
}

export interface StoreSettings {
  id: number;
  name: string;
  logo_url?: string | null;
  contact?: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  currency: string;
  domain?: string | null;
  custom_domain?: string | null;
  plan: "simple" | "mid" | "pro";
  theme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    [key: string]: string | undefined;
  } | null;
  settings?: {
    delivery_fee?: number;
    promo_notice?: {
      enabled?: boolean;
      message?: string;
      coupon_code?: string;
      href?: string;
    };
    [key: string]: unknown;
  } | null;
}

export interface SalesReport {
  sales_by_date: Array<{ date: string; orders: number; revenue: number }>;
  total_orders: number;
  total_revenue: number;
  best_selling_products: Array<{ product_name: string; quantity_sold: number; revenue: number }>;
  sales_by_category?: Array<{ category_name: string; quantity_sold: number; revenue: number }>;
  sales_by_payment_method?: Array<{ payment_method: string; orders: number; revenue: number }>;
  customer_report?: Array<{ customer_name: string; customer_email?: string | null; orders: number; revenue: number }>;
}

export interface ProfitReport {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
}

export interface AdminDashboardData {
  store?: StoreSettings;
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  payments: Payment[];
  inventoryLogs: InventoryLog[];
  branches: Branch[];
  staff: StaffUser[];
  salesReport?: SalesReport;
  profitReport?: ProfitReport;
  notificationProducts?: Product[];
  notificationOrders?: Order[];
  notificationPayments?: Payment[];
  brands?: CatalogBrand[];
  tags?: CatalogTag[];
  collections?: ProductCollection[];
  sizeGuides?: SizeGuide[];
  reviews?: import("./product").ProductReview[];
  notifications?: Array<{ type: string; title: string; message: string; target: string }>;
  shippingMethods?: ShippingMethod[];
  marketingBanners?: MarketingBanner[];
  newsletterSubscribers?: NewsletterSubscriber[];
  questions?: ProductQuestion[];
  auditLogs?: AuditLog[];
}

export interface AuditLog {
  id: number;
  user?: { id: number; name: string; email: string } | null;
  action: string;
  subject_type?: string | null;
  subject_id?: number | null;
  description?: string | null;
  properties?: Record<string, unknown> | null;
  created_at?: string;
}
