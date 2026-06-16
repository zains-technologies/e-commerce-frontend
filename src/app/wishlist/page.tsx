"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateBlock";
import { Shell } from "@/components/layout/Shell";
import { ProductGrid } from "@/components/product/ProductGrid";
import { wishlistService } from "@/services/wishlistService";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setProducts(await wishlistService.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please login to view your wishlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  return (
    <Shell>
      <section className="container-shell py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-neutral-500">Customer list</p>
            <h1 className="text-5xl font-medium tracking-[-0.07em] md:text-7xl">Wishlist</h1>
          </div>
          <Link href="/products"><Button variant="outline">Continue shopping</Button></Link>
        </div>
        <div className="mt-8">
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}
          {!loading && !error && products.length === 0 && <EmptyState message="No wishlist products yet." />}
          {!loading && products.length > 0 && <ProductGrid products={products} />}
        </div>
      </section>
    </Shell>
  );
}
