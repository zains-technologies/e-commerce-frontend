"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { Shell } from "@/components/layout/Shell";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCategories } from "@/hooks/useCategories";
import { useProductFilters, useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, loading, error } = useProducts();
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const category = searchParams.get("category") || "all";
  const tag = searchParams.get("tag") || "";
  const collection = searchParams.get("collection") || "";
  const [sort, setSort] = useState("featured");
  const priceBounds = useMemo(() => {
    const prices = products.map((product) => Number(product.price || 0)).filter((price) => Number.isFinite(price));
    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const selectedMaxPrice = Math.min(maxPrice ?? priceBounds.max, priceBounds.max);
  const priceFilter = selectedMaxPrice < priceBounds.max ? selectedMaxPrice : undefined;
  const filtered = useProductFilters(products, search, category, sort, categories, { tag, collection, maxPrice: priceFilter });
  const activeCount =
    Number(Boolean(search.trim())) +
    Number(category !== "all") +
    Number(Boolean(tag)) +
    Number(Boolean(collection)) +
    Number(sort !== "featured") +
    Number(Boolean(priceFilter));

  function setCategory(value: string) {
    router.push(value === "all" ? "/products" : `/products?category=${value}`);
  }

  function clearFilters() {
    setSearch("");
    setSort("featured");
    setMaxPrice(null);
    router.push("/products");
  }

  return (
    <Shell>
      <section className="container-shell py-8">
        <div className="mb-8">
          <h1 className="text-5xl font-medium tracking-[-0.07em] md:text-7xl">Shop collection</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600">Explore products from the Laravel API with filtering, sorting, and a storefront-ready product grid.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-[320px_1fr]">
          <ProductFilters
            categories={categories}
            search={search}
            category={category}
            sort={sort}
            priceBounds={priceBounds}
            maxPrice={selectedMaxPrice}
            resultCount={filtered.length}
            activeCount={activeCount}
            onSearch={setSearch}
            onCategory={setCategory}
            onSort={setSort}
            onMaxPrice={(value) => setMaxPrice(value)}
            onClear={clearFilters}
          />
          <div>
            {loading && <LoadingState />}
            {error && <div className="mb-4"><ErrorState message={`Using placeholder products because API said: ${error}`} /></div>}
            {!loading && <ProductGrid products={filtered} />}
          </div>
        </div>
      </section>
    </Shell>
  );
}
