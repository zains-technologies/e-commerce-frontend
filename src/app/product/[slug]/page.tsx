"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
  const [review, setReview] = useState({ customer_name: "", customer_email: "", rating: 5, comment: "" });
  const [question, setQuestion] = useState({ customer_name: "", customer_email: "", question: "" });
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [questionMessage, setQuestionMessage] = useState<string | null>(null);
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

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!product) return;
    await productService.submitReview(product.id, review);
    setReview({ customer_name: "", customer_email: "", rating: 5, comment: "" });
    setReviewMessage("Review submitted. It will appear after admin approval.");
  }

  async function submitQuestion(event: FormEvent) {
    event.preventDefault();
    if (!product) return;
    await productService.submitQuestion(product.id, question);
    setQuestion({ customer_name: "", customer_email: "", question: "" });
    setQuestionMessage("Question submitted. The store team can answer it from the admin panel.");
  }

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
                {product.brand?.name && <p className="mt-6 text-xs font-bold uppercase text-neutral-500">{product.brand.name}</p>}
                <h1 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.07em] md:text-7xl">{product.name}</h1>
                {product.reviews_summary?.count ? (
                  <p className="mt-4 text-sm font-bold">
                    ★ {product.reviews_summary.average_rating} / 5 · {product.reviews_summary.count} reviews
                  </p>
                ) : null}
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
                {product.size_guide && (
                  <div className="mt-8 rounded-[24px] border border-neutral-200 p-4">
                    <p className="text-xs font-bold uppercase text-neutral-500">{product.size_guide.name}</p>
                    {product.size_guide.notes && <p className="mt-2 text-sm text-neutral-600">{product.size_guide.notes}</p>}
                  </div>
                )}
                {product.specifications?.length ? (
                  <div className="mt-8 rounded-[24px] border border-neutral-200 p-4">
                    <p className="mb-3 text-xs font-bold uppercase text-neutral-500">Specifications</p>
                    <div className="grid gap-2 text-sm">
                      {product.specifications.map((specification) => (
                        <div key={specification.name} className="flex justify-between gap-4 border-b border-neutral-100 pb-2 last:border-b-0">
                          <span className="text-neutral-500">{specification.name}</span>
                          <strong className="text-right">{specification.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
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
              <ProductGrid products={product.related_products?.length ? product.related_products.map((item) => ({
                id: item.id,
                name: item.name,
                slug: item.slug,
                price: item.price,
                stock_quantity: 0,
                images: item.image ? [{ id: item.id, url: item.image }] : [],
              })) : products.filter((item) => item.slug !== product.slug).slice(0, 4)} />
            </div>
            {product.reviews?.length ? (
              <div className="mt-14">
                <h2 className="mb-5 text-3xl font-medium tracking-[-0.04em]">Customer reviews</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="rounded-[24px] border border-neutral-200 p-5">
                      <p className="font-bold">★ {review.rating} · {review.customer_name}</p>
                      <p className="mt-3 text-sm leading-6 text-neutral-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_420px]">
              <div className="rounded-[28px] border border-neutral-200 p-5">
                <h2 className="text-3xl font-medium tracking-[-0.04em]">Questions & answers</h2>
                {product.questions?.length ? (
                  <div className="mt-5 space-y-3">
                    {product.questions.map((item) => (
                      <div key={item.id} className="rounded-[22px] bg-neutral-50 p-4">
                        <p className="text-sm font-black">Q: {item.question}</p>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">A: {item.answer || "The store team has not answered yet."}</p>
                        <p className="mt-3 text-xs font-bold uppercase text-neutral-400">{item.customer_name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-neutral-500">No questions yet. Ask the first one.</p>
                )}
              </div>
              <form onSubmit={submitQuestion} className="rounded-[28px] border border-neutral-200 p-5">
                <h2 className="text-3xl font-medium tracking-[-0.04em]">Ask a question</h2>
                {questionMessage && <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">{questionMessage}</p>}
                <div className="mt-5 grid gap-3">
                  <input required className="h-12 rounded-full border border-neutral-200 px-4 text-sm outline-none focus:border-black" placeholder="Name" value={question.customer_name} onChange={(event) => setQuestion({ ...question, customer_name: event.target.value })} />
                  <input className="h-12 rounded-full border border-neutral-200 px-4 text-sm outline-none focus:border-black" placeholder="Email" type="email" value={question.customer_email} onChange={(event) => setQuestion({ ...question, customer_email: event.target.value })} />
                  <textarea required className="min-h-28 rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black" placeholder="Question" value={question.question} onChange={(event) => setQuestion({ ...question, question: event.target.value })} />
                </div>
                <Button className="mt-4">Submit question</Button>
              </form>
            </div>
            <form onSubmit={submitReview} className="mt-14 rounded-[28px] border border-neutral-200 p-5">
              <h2 className="text-3xl font-medium tracking-[-0.04em]">Write a review</h2>
              {reviewMessage && <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">{reviewMessage}</p>}
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <input required className="h-12 rounded-full border border-neutral-200 px-4 text-sm outline-none focus:border-black" placeholder="Name" value={review.customer_name} onChange={(event) => setReview({ ...review, customer_name: event.target.value })} />
                <input className="h-12 rounded-full border border-neutral-200 px-4 text-sm outline-none focus:border-black" placeholder="Email" type="email" value={review.customer_email} onChange={(event) => setReview({ ...review, customer_email: event.target.value })} />
                <div className="flex h-12 items-center justify-between rounded-full border border-neutral-200 px-4 text-sm">
                  <span className="text-neutral-500">Rating</span>
                  <StarRating value={review.rating} onChange={(rating) => setReview({ ...review, rating })} />
                </div>
              </div>
              <textarea className="mt-4 min-h-28 w-full rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black" placeholder="Review" value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} />
              <Button className="mt-4">Submit review</Button>
            </form>
          </>
        )}
      </section>
    </Shell>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Review rating">
      {[1, 2, 3, 4, 5].map((rating) => {
        const selected = rating <= value;

        return (
          <button
            key={rating}
            type="button"
            className={`text-2xl leading-none transition hover:scale-110 ${selected ? "text-yellow-400" : "text-neutral-300"}`}
            onClick={() => onChange(rating)}
            role="radio"
            aria-checked={value === rating}
            aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
