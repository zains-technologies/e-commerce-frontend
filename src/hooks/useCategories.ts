"use client";

import { useEffect, useState } from "react";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

const fallbackCategories: Category[] = [
  { id: 1, name: "Shoes", slug: "shoes", is_active: true },
  { id: 2, name: "T-Shirt", slug: "t-shirt", is_active: true },
  { id: 3, name: "Jackets", slug: "jackets", is_active: true },
  { id: 4, name: "Accessories", slug: "accessories", is_active: true },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService
      .list()
      .then((data) => {
        setCategories(data.length ? data : fallbackCategories);
        setError(null);
      })
      .catch((err: Error) => {
        setCategories(fallbackCategories);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}

