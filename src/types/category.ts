export interface Category {
  id: number;
  parent_id?: number | null;
  show_in_header?: boolean;
  sort_order?: number;
  parent?: { id: number; name: string; slug: string } | null;
  children?: Category[];
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
