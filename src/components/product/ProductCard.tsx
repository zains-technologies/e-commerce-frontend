"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatCurrency, getPrimaryImage, getToken } from "@/lib/utils";
import { wishlistService } from "@/services/wishlistService";
import type { Product } from "@/types/product";

export function ProductCard({ product, wide = false }: { product: Product; wide?: boolean }) {
  const { addItem, busy } = useCart();

  return (
    <article className={wide ? "md:col-span-2" : ""}>
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[1.05] overflow-hidden rounded-[24px] bg-neutral-100 md:rounded-[28px]">
          <img
            src={getPrimaryImage(product.images)}
            alt={product.name}
            className="image-cover group-hover:scale-105"
          />
          <button
            type="button"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/80 text-lg backdrop-blur hover:bg-black hover:text-white"
            onClick={(event) => {
              event.preventDefault();
              if (!getToken()) {
                window.location.href = "/login";
                return;
              }
              void wishlistService.add(product.id);
            }}
            disabled={busy}
            aria-label="Add to wishlist"
          >
            ♥
          </button>
        </div>
        <div className="mt-3">
          <h3 className="font-bold">{product.name}</h3>
          {product.reviews_summary?.count ? (
            <p className="mt-1 text-xs font-bold text-neutral-500">★ {product.reviews_summary.average_rating} · {product.reviews_summary.count} reviews</p>
          ) : null}
          <p className="text-sm text-neutral-600">{formatCurrency(product.price)}</p>
          <button
            type="button"
            className="mt-3 rounded-full bg-black px-4 py-2 text-xs font-bold uppercase text-white transition hover:bg-neutral-800"
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              void addItem({ product_id: product.id, product_variant_id: product.variants?.[0]?.id, quantity: 1 });
            }}
          >
            Add to cart
          </button>
        </div>
      </Link>
    </article>
  );
}
