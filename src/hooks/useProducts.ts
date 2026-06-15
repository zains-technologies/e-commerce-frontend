"use client";

import { useEffect, useMemo, useState } from "react";
import { productService } from "@/services/productService";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

const fallbackProducts: Product[] = [
  {
    id: 101,
    name: "Casual Shoe",
    slug: "casual-shoe",
    price: 225,
    stock_quantity: 10,
    is_featured: true,
    description: "Clean everyday shoe for premium storefront previews.",
    images: [{ id: 1, url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", is_primary: true }],
    variants: [{ id: 1, attribute_name: "size", attribute_value: "42", price_adjustment: 0, stock_quantity: 4 }],
  },
  {
    id: 102,
    name: "Skateboard Shoe",
    slug: "skateboard-shoe",
    price: 125,
    stock_quantity: 12,
    is_featured: true,
    description: "Lightweight sneaker with a simple rounded silhouette.",
    images: [{ id: 2, url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80", is_primary: true }],
    variants: [{ id: 2, attribute_name: "color", attribute_value: "Green", price_adjustment: 0, stock_quantity: 5 }],
  },
  {
    id: 103,
    name: "Sportwear Shoe",
    slug: "sportwear-shoe",
    price: 159,
    stock_quantity: 8,
    is_featured: false,
    description: "Sportwear shoe with a breathable upper and soft profile.",
    images: [{ id: 3, url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80", is_primary: true }],
    variants: [{ id: 3, attribute_name: "size", attribute_value: "41", price_adjustment: 0, stock_quantity: 3 }],
  },
  {
    id: 104,
    name: "Basket Shoe",
    slug: "basket-shoe",
    price: 125,
    stock_quantity: 9,
    is_featured: false,
    description: "High-top shoe for streetwear product grids.",
    images: [{ id: 4, url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80", is_primary: true }],
    variants: [{ id: 4, attribute_name: "color", attribute_value: "Red", price_adjustment: 0, stock_quantity: 6 }],
  },
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productService
      .list()
      .then((data) => {
        setProducts(data.length ? data : fallbackProducts);
        setError(null);
      })
      .catch((err: Error) => {
        setProducts(fallbackProducts);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}

export function useProductFilters(
  products: Product[],
  search: string,
  category: string,
  sort: string,
  categories: Category[] = [],
  extraFilters: { tag?: string; collection?: string } = {},
) {
  return useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedCategory = categories.find((item) => item.slug === category);
    const categorySlugs = new Set([category, ...collectDescendantSlugs(selectedCategory, categories)]);
    let result = products.filter((product) => {
      const matchesSearch = !query || product.name.toLowerCase().includes(query);
      const matchesCategory = category === "all" || Boolean(product.category?.slug && categorySlugs.has(product.category.slug));
      const matchesTag = !extraFilters.tag || Boolean(product.tags?.some((tag) => tag.slug === extraFilters.tag));
      const matchesCollection = !extraFilters.collection || Boolean(product.collections?.some((collection) => collection.slug === extraFilters.collection));
      return matchesSearch && matchesCategory && matchesTag && matchesCollection;
    });

    if (sort === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "featured") result = [...result].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

    return result;
  }, [products, search, category, sort, categories, extraFilters.tag, extraFilters.collection]);
}

function collectDescendantSlugs(category: Category | undefined, categories: Category[]): string[] {
  if (!category) return [];
  const nestedChildren = category.children || [];
  const flatChildren = categories.filter((item) => item.parent_id === category.id);
  const children = Array.from(new Map([...nestedChildren, ...flatChildren].map((child) => [child.id, child])).values());

  return children.flatMap((child) => [child.slug, ...collectDescendantSlugs(child, categories)]);
}
