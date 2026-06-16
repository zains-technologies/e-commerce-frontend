export interface MarketingBanner {
  id: number;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  position: string;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface ShippingMethod {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  fee: number;
  min_order_total?: number | null;
  is_active: boolean;
  sort_order?: number;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  name?: string | null;
  status: string;
  subscribed_at?: string | null;
  created_at?: string;
}
