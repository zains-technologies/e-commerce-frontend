export interface Category {
  id: number;
  parent_id?: number | null;
  show_in_header?: boolean;
  parent?: { id: number; name: string; slug: string } | null;
  children?: Category[];
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
}
