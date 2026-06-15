"use client";

import { useEffect, useState } from "react";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService
      .list()
      .then((data) => {
        setCategories(data);
        setError(null);
      })
      .catch((err: Error) => {
        setCategories([]);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}
