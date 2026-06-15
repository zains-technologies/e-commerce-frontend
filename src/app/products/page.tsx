"use client";

import { Suspense, useState } from "react";
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
  const filtered = useProductFilters(products, search, category, sort, categories, { tag, collection });

  function setCategory(value: string) {
    router.push(value === "all" ? "/products" : `/products?category=${value}`);
  }

  return (
    <Shell>
      <section className="container-shell py-8">
        <div className="mb-8">
          <h1 className="text-5xl font-medium tracking-[-0.07em] md:text-7xl">Shop collection</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600">Explore products from the Laravel API with filtering, sorting, and a storefront-ready product grid.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          <ProductFilters categories={categories} search={search} category={category} sort={sort} onSearch={setSearch} onCategory={setCategory} onSort={setSort} />
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
