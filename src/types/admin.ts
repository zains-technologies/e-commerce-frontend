import type { Product } from "./product";
import type { CatalogBrand, CatalogTag, ProductCollection, ProductColor, SizeGuide } from "./product";
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

export interface PaymentLog {
  id: number;
  order?: { id: number; order_number: string } | null;
  provider: string;
  event: string;
  status: string;
  payload?: Record<string, unknown> | null;
  created_at?: string;
}

export interface PaymentEvidence {
  id: number;
  order_id: number;
  payment_id?: number | null;
  order?: { id: number; order_number: string } | null;
  method: string;
  file_path?: string | null;
  url?: string | null;
  reference?: string | null;
  note?: string | null;
  status: string;
  created_at?: string;
}

export interface DeliveryZone {
  id: number;
  name: string;
  city?: string | null;
  postal_code?: string | null;
  fee: number;
  estimated_days?: number | null;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface DeliveryProof {
  id: number;
  order?: { id: number; order_number: string } | null;
  status: string;
  recipient_name?: string | null;
  photo_path?: string | null;
  url?: string | null;
  note?: string | null;
  delivered_at?: string | null;
  created_at?: string;
}

export interface ReturnRequest {
  id: number;
  request_number: string;
  order?: { id: number; order_number: string } | null;
  type: "return" | "exchange";
  status: string;
  reason: string;
  customer_note?: string | null;
  admin_note?: string | null;
  refund_amount: number;
  resolved_at?: string | null;
  created_at?: string;
}

export interface Invoice {
  id: number;
  order?: { id: number; order_number: string } | null;
  invoice_number: string;
  subtotal: number;
  tax_total: number;
  delivery_fee: number;
  discount_total: number;
  total: number;
  status: string;
  issued_at?: string | null;
  created_at?: string;
}

export interface CommunicationLog {
  id: number;
  channel: string;
  event: string;
  recipient?: string | null;
  subject?: string | null;
  status: string;
  created_at?: string;
  sent_at?: string | null;
}

export interface SupportTicket {
  id: number;
  ticket_number: string;
  order?: { id: number; order_number: string } | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  subject: string;
  status: string;
  priority: string;
  messages?: Array<{ id: number; sender_type: string; message: string; created_at?: string }>;
  created_at?: string;
}

export interface AnalyticsReport {
  sessions: number;
  product_views: number;
  cart_adds: number;
  checkout_starts: number;
  conversion_rate: number;
  cart_abandonment_rate: number;
  average_order_value: number;
  repeat_customers: number;
  customer_lifetime_value: number;
  revenue_by_channel: Array<{ channel: string; revenue: number }>;
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
  product?: { id: number; name: string; sku?: string | null } | null;
  variant?: { id: number; attribute_name: string; attribute_value: string; sku?: string | null } | null;
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
    communication?: Record<string, unknown>;
    integrations?: Record<string, unknown>;
    tax?: Record<string, unknown>;
    courier?: Record<string, unknown>;
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
  colors?: ProductColor[];
  sizeGuides?: SizeGuide[];
  reviews?: import("./product").ProductReview[];
  notifications?: Array<{ type: string; title: string; message: string; target: string }>;
  shippingMethods?: ShippingMethod[];
  marketingBanners?: MarketingBanner[];
  newsletterSubscribers?: NewsletterSubscriber[];
  questions?: ProductQuestion[];
  auditLogs?: AuditLog[];
  paymentLogs?: PaymentLog[];
  paymentEvidences?: PaymentEvidence[];
  deliveryZones?: DeliveryZone[];
  deliveryProofs?: DeliveryProof[];
  returns?: ReturnRequest[];
  invoices?: Invoice[];
  supportTickets?: SupportTicket[];
  communicationLogs?: CommunicationLog[];
  analyticsReport?: AnalyticsReport;
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
