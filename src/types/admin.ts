import type { Product } from "./product";
import type { Category } from "./category";

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
  items?: Array<{ id: number; product_name: string; quantity: number; line_total: number }>;
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
}

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: "admin" | "manager" | "staff";
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
    [key: string]: unknown;
  } | null;
}

export interface SalesReport {
  sales_by_date: Array<{ date: string; orders: number; revenue: number }>;
  total_orders: number;
  total_revenue: number;
  best_selling_products: Array<{ product_name: string; quantity_sold: number; revenue: number }>;
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
}
