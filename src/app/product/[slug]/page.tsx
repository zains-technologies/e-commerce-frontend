"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { Shell } from "@/components/layout/Shell";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { formatCurrency, getPrimaryImage } from "@/lib/utils";
import { productService } from "@/services/productService";
import type { Product, ProductVariant } from "@/types/product";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState("");
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { products } = useProducts();
  const { addItem, busy } = useCart();

  useEffect(() => {
    if (!slug) return;
    productService
      .getBySlug(slug)
      .then((data) => {
        setProduct(data);
        setActiveImage(getPrimaryImage(data.images));
        setVariant(data.variants?.[0] || null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const price = useMemo(() => (product ? product.price + (variant?.price_adjustment || 0) : 0), [product, variant]);

  return (
    <Shell>
      <section className="container-shell py-8">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {product && (
          <>
            <div className="grid gap-8 md:grid-cols-[1.05fr_.95fr]">
              <div className="space-y-3">
                <div className="aspect-square overflow-hidden rounded-[32px] bg-neutral-100">
                  <img src={activeImage} alt={product.name} className="image-cover" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {(product.images || []).map((image) => (
                    <button key={image.id} className="aspect-square overflow-hidden rounded-[18px] border border-neutral-200" onClick={() => setActiveImage(image.url)}>
                      <img src={image.url} alt={product.name} className="image-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:pt-6">
                <Link href="/products" className="text-xs font-bold uppercase text-neutral-500">← Back to products</Link>
                <h1 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.07em] md:text-7xl">{product.name}</h1>
                <p className="mt-5 text-2xl font-bold">{formatCurrency(price)}</p>
                <p className="mt-5 max-w-xl text-sm leading-6 text-neutral-600">{product.description}</p>
                <div className="mt-8 space-y-4">
                  <p className="text-xs font-bold uppercase text-neutral-500">Variant</p>
                  <div className="flex flex-wrap gap-2">
                    {(product.variants || []).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setVariant(item)}
                        className={`rounded-full border px-4 py-2 text-sm ${variant?.id === item.id ? "border-black bg-black text-white" : "border-neutral-200"}`}
                      >
                        {item.attribute_value}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-3">
                  <div className="inline-flex h-12 items-center rounded-full border border-neutral-200">
                    <button className="size-12" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span className="w-10 text-center font-bold">{quantity}</span>
                    <button className="size-12" onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                  <Button disabled={busy} onClick={() => addItem({ product_id: product.id, product_variant_id: variant?.id, quantity })}>
                    Add to cart
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-14">
              <h2 className="mb-5 text-3xl font-medium tracking-[-0.04em]">Related products</h2>
              <ProductGrid products={products.filter((item) => item.slug !== product.slug).slice(0, 4)} />
            </div>
          </>
        )}
      </section>
    </Shell>
  );
}
