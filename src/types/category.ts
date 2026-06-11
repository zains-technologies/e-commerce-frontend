export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
}

