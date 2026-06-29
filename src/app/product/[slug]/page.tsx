"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { Dropdown } from "@/components/common/Dropdown";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { Shell } from "@/components/layout/Shell";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { formatCurrency, getPrimaryImage } from "@/lib/utils";
import { analyticsService } from "@/services/analyticsService";
import { productService } from "@/services/productService";
import type { Product, ProductColor, ProductVariant } from "@/types/product";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const [catalogColors, setCatalogColors] = useState<ProductColor[]>([]);
  const [activeImage, setActiveImage] = useState("");
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [review, setReview] = useState({
    customer_name: "",
    customer_email: "",
    rating: 5,
    comment: "",
  });
  const [question, setQuestion] = useState({
    customer_name: "",
    customer_email: "",
    question: "",
  });
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [questionMessage, setQuestionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { products } = useProducts();
  const { addItem, busy } = useCart();

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      productService.getBySlug(slug),
      productService.colors().catch(() => []),
    ])
      .then(([data, colors]) => {
        setProduct(data);
        setCatalogColors(colors);
        setActiveImage(getPrimaryImage(data.images));
        setVariant(
          data.variants?.find((item) => item.stock_quantity > 0) ||
            data.variants?.[0] ||
            null,
        );
        void analyticsService.track({ event: "product_view", product_id: data.id, payload: { slug: data.slug } });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const variants = useMemo(() => product?.variants || [], [product]);
  const hasStructuredVariants = useMemo(
    () =>
      variants.some(
        (item) =>
          item.options?.size || item.options?.color_id || item.options?.color,
      ),
    [variants],
  );
  const price = useMemo(
    () => (product ? product.price + (variant?.price_adjustment || 0) : 0),
    [product, variant],
  );
  const selectedColorId = getVariantColorId(variant);
  const selectedColorName = getVariantColorName(variant);
  const selectedSize = String(variant?.options?.size || "");
  const activeStock = variant
    ? variant.stock_quantity
    : product?.stock_quantity || 0;
  const stockTone = getStockTone(activeStock);
  const variantOptions = useMemo(
    () =>
      variants.map((item) => ({
        label: `${item.attribute_value} · ${item.stock_quantity} in stock`,
        value: String(item.id),
      })),
    [variants],
  );
  const sizeOptions = useMemo(() => {
    const sizeSet = new Set<string>();
    variants
      .filter((item) =>
        variantMatchesColor(item, selectedColorId, selectedColorName),
      )
      .forEach((item) => {
        if (item.options?.size) sizeSet.add(String(item.options.size));
      });
    return Array.from(sizeSet);
  }, [selectedColorId, selectedColorName, variants]);
  const visibleColors = useMemo(
    () => deriveVariantColors(product, variants, catalogColors),
    [catalogColors, product, variants],
  );
  const sizeGuide = useMemo(
    () => buildSizeGuide(product, sizeOptions),
    [product, sizeOptions],
  );

  function chooseColor(colorId: number) {
    const color = visibleColors.find((item) => item.id === colorId);
    const nextVariant =
      variants.find(
        (item) =>
          variantMatchesColor(item, colorId, color?.name) &&
          String(item.options?.size || "") === selectedSize,
      ) ||
      variants.find(
        (item) =>
          variantMatchesColor(item, colorId, color?.name) &&
          item.stock_quantity > 0,
      ) ||
      variants.find((item) =>
        variantMatchesColor(item, colorId, color?.name),
      ) ||
      null;
    setVariant(nextVariant);
    if (nextVariant?.stock_quantity)
      setQuantity((value) => Math.min(value, nextVariant.stock_quantity));
  }

  function chooseSize(size: string) {
    const nextVariant =
      variants.find(
        (item) =>
          String(item.options?.size || "") === size &&
          variantMatchesColor(item, selectedColorId, selectedColorName),
      ) ||
      variants.find((item) => String(item.options?.size || "") === size) ||
      null;
    setVariant(nextVariant);
    if (nextVariant?.stock_quantity)
      setQuantity((value) => Math.min(value, nextVariant.stock_quantity));
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!product) return;
    await productService.submitReview(product.id, review);
    setReview({
      customer_name: "",
      customer_email: "",
      rating: 5,
      comment: "",
    });
    setReviewMessage("Review submitted. It will appear after admin approval.");
  }

  async function submitQuestion(event: FormEvent) {
    event.preventDefault();
    if (!product) return;
    await productService.submitQuestion(product.id, question);
    setQuestion({ customer_name: "", customer_email: "", question: "" });
    setQuestionMessage(
      "Question submitted. The store team can answer it from the admin panel.",
    );
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
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="image-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {(product.images || []).map((image) => (
                    <button
                      key={image.id}
                      className="aspect-square overflow-hidden rounded-[18px] border border-neutral-200"
                      onClick={() => setActiveImage(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={product.name}
                        className="image-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:pt-6">
                <Link
                  href="/products"
                  className="text-xs font-bold uppercase text-neutral-500"
                >
                  ← Back to products
                </Link>
                {product.brand?.name && (
                  <p className="mt-6 text-xs font-bold uppercase text-neutral-500">
                    {product.brand.name}
                  </p>
                )}
                <h1 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.07em] md:text-7xl">
                  {product.name}
                </h1>
                {product.reviews_summary?.count ? (
                  <p className="mt-4 text-sm font-bold">
                    ★ {product.reviews_summary.average_rating} / 5 ·{" "}
                    {product.reviews_summary.count} reviews
                  </p>
                ) : null}
                <p className="mt-5 text-2xl font-bold">
                  {formatCurrency(price)}
                </p>
                <p className="mt-5 max-w-xl text-sm leading-6 text-neutral-600">
                  {product.description}
                </p>
                {visibleColors.length ? (
                  <div className="mt-7 space-y-3">
                    <p className="text-xs font-bold uppercase text-neutral-500">
                      Color
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {visibleColors.map((color) => {
                        const colorStock = variants
                          .filter((item) =>
                            variantMatchesColor(item, color.id, color.name),
                          )
                          .reduce((sum, item) => sum + item.stock_quantity, 0);
                        const selected =
                          selectedColorId === color.id ||
                          (!selectedColorId &&
                            selectedColorName.toLowerCase() ===
                              color.name.toLowerCase());

                        return (
                          <button
                            key={color.id}
                            type="button"
                            disabled={colorStock <= 0}
                            onClick={() => chooseColor(color.id)}
                            className={`inline-flex h-10 min-w-10 items-center gap-2 rounded-full border px-3 text-xs font-black uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 ${selected ? "border-black bg-neutral-50" : "border-neutral-200 hover:border-black"}`}
                          >
                            <span
                              className="size-5 rounded-full border border-neutral-300 shadow-inner"
                              style={{ backgroundColor: color.hex_code }}
                            />
                            {color.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {hasStructuredVariants && sizeOptions.length ? (
                  <div className="mt-7 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase text-neutral-500">
                        Size
                      </p>
                      {sizeGuide.rows.length ? (
                        <button
                          type="button"
                          onClick={() => setSizeGuideOpen(true)}
                          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-xs font-bold uppercase text-neutral-600 transition hover:border-black hover:text-black"
                        >
                          <RulerIcon />
                          Size guide
                        </button>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((size) => {
                        const sizeVariant = variants.find(
                          (item) =>
                            String(item.options?.size || "") === size &&
                            variantMatchesColor(
                              item,
                              selectedColorId,
                              selectedColorName,
                            ),
                        );
                        const disabled =
                          !sizeVariant || sizeVariant.stock_quantity <= 0;

                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={disabled}
                            onClick={() => chooseSize(size)}
                            className={`grid h-10 min-w-10 place-items-center rounded-full border px-3 text-xs font-black uppercase transition disabled:cursor-not-allowed disabled:opacity-40 ${selectedSize === size ? "border-black bg-black text-white" : "border-neutral-200 hover:border-black"}`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {!hasStructuredVariants && variantOptions.length ? (
                  <div className="mt-8 max-w-sm space-y-3">
                    <p className="text-xs font-bold uppercase text-neutral-500">
                      Variant
                    </p>
                    <Dropdown
                      value={variant?.id ? String(variant.id) : ""}
                      options={variantOptions}
                      placeholder="Select variant"
                      onChange={(value) =>
                        setVariant(
                          (product.variants || []).find(
                            (item) => String(item.id) === value,
                          ) || null,
                        )
                      }
                    />
                  </div>
                ) : null}
                <div className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase ${stockTone.className}`}>
                  <span className="size-2 rounded-full bg-current" />
                  {activeStock > 0
                    ? `${activeStock} in stock${variant ? ` · ${variant.sku || variant.attribute_value}` : ""}`
                    : "Out of stock"}
                </div>
                {product.specifications?.length ? (
                  <div className="mt-8 rounded-[24px] border border-neutral-200 p-4">
                    <p className="mb-3 text-xs font-bold uppercase text-neutral-500">
                      Specifications
                    </p>
                    <div className="grid gap-2 text-sm">
                      {product.specifications.map((specification) => (
                        <div
                          key={specification.name}
                          className="flex justify-between gap-4 border-b border-neutral-100 pb-2 last:border-b-0"
                        >
                          <span className="text-neutral-500">
                            {specification.name}
                          </span>
                          <strong className="text-right">
                            {specification.value}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-8 flex items-center gap-3">
                  <div className="inline-flex h-12 items-center rounded-full border border-neutral-200">
                    <button
                      className="size-12"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold">
                      {quantity}
                    </span>
                    <button
                      className="size-12"
                      onClick={() =>
                        setQuantity(
                          activeStock > 0
                            ? Math.min(activeStock, quantity + 1)
                            : quantity,
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <Button
                    disabled={
                      busy ||
                      activeStock <= 0 ||
                      quantity > activeStock ||
                      (variants.length > 0 && !variant)
                    }
                    onClick={() =>
                      addItem({
                        product_id: product.id,
                        product_variant_id: variant?.id,
                        quantity,
                      })
                    }
                  >
                    {activeStock <= 0 ? "Out of stock" : "Add to cart"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-14">
              <h2 className="mb-5 text-3xl font-medium tracking-[-0.04em]">
                Related products
              </h2>
              <ProductGrid
                products={
                  product.related_products?.length
                    ? product.related_products.map((item) => ({
                        id: item.id,
                        name: item.name,
                        slug: item.slug,
                        price: item.price,
                        stock_quantity: 0,
                        images: item.image
                          ? [{ id: item.id, url: item.image }]
                          : [],
                      }))
                    : products
                        .filter((item) => item.slug !== product.slug)
                        .slice(0, 4)
                }
              />
            </div>
            {product.reviews?.length ? (
              <div className="mt-14">
                <h2 className="mb-5 text-3xl font-medium tracking-[-0.04em]">
                  Customer reviews
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {product.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-[24px] border border-neutral-200 p-5"
                    >
                      <p className="font-bold">
                        ★ {review.rating} · {review.customer_name}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-neutral-600">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_420px]">
              <div className="rounded-[28px] border border-neutral-200 p-5">
                <h2 className="text-3xl font-medium tracking-[-0.04em]">
                  Questions & answers
                </h2>
                {product.questions?.length ? (
                  <div className="mt-5 space-y-3">
                    {product.questions.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[22px] bg-neutral-50 p-4"
                      >
                        <p className="text-sm font-black">Q: {item.question}</p>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                          A:{" "}
                          {item.answer ||
                            "The store team has not answered yet."}
                        </p>
                        <p className="mt-3 text-xs font-bold uppercase text-neutral-400">
                          {item.customer_name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-neutral-500">
                    No questions yet. Ask the first one.
                  </p>
                )}
              </div>
              <form
                onSubmit={submitQuestion}
                className="rounded-[28px] border border-neutral-200 p-5"
              >
                <h2 className="text-3xl font-medium tracking-[-0.04em]">
                  Ask a question
                </h2>
                {questionMessage && (
                  <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">
                    {questionMessage}
                  </p>
                )}
                <div className="mt-5 grid gap-3">
                  <input
                    required
                    className="h-12 rounded-full border border-neutral-200 px-4 text-sm outline-none focus:border-black"
                    placeholder="Name"
                    value={question.customer_name}
                    onChange={(event) =>
                      setQuestion({
                        ...question,
                        customer_name: event.target.value,
                      })
                    }
                  />
                  <input
                    className="h-12 rounded-full border border-neutral-200 px-4 text-sm outline-none focus:border-black"
                    placeholder="Email"
                    type="email"
                    value={question.customer_email}
                    onChange={(event) =>
                      setQuestion({
                        ...question,
                        customer_email: event.target.value,
                      })
                    }
                  />
                  <textarea
                    required
                    className="min-h-28 rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black"
                    placeholder="Question"
                    value={question.question}
                    onChange={(event) =>
                      setQuestion({ ...question, question: event.target.value })
                    }
                  />
                </div>
                <Button className="mt-4">Submit question</Button>
              </form>
            </div>
            <form
              onSubmit={submitReview}
              className="mt-14 rounded-[28px] border border-neutral-200 p-5"
            >
              <h2 className="text-3xl font-medium tracking-[-0.04em]">
                Write a review
              </h2>
              {reviewMessage && (
                <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">
                  {reviewMessage}
                </p>
              )}
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <input
                  required
                  className="h-12 rounded-full border border-neutral-200 px-4 text-sm outline-none focus:border-black"
                  placeholder="Name"
                  value={review.customer_name}
                  onChange={(event) =>
                    setReview({ ...review, customer_name: event.target.value })
                  }
                />
                <input
                  className="h-12 rounded-full border border-neutral-200 px-4 text-sm outline-none focus:border-black"
                  placeholder="Email"
                  type="email"
                  value={review.customer_email}
                  onChange={(event) =>
                    setReview({ ...review, customer_email: event.target.value })
                  }
                />
                <div className="flex h-12 items-center justify-between rounded-full border border-neutral-200 px-4 text-sm">
                  <span className="text-neutral-500">Rating</span>
                  <StarRating
                    value={review.rating}
                    onChange={(rating) => setReview({ ...review, rating })}
                  />
                </div>
              </div>
              <textarea
                className="mt-4 min-h-28 w-full rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black"
                placeholder="Review"
                value={review.comment}
                onChange={(event) =>
                  setReview({ ...review, comment: event.target.value })
                }
              />
              <Button className="mt-4">Submit review</Button>
            </form>
            {sizeGuideOpen && sizeGuide.rows.length ? (
              <SizeGuideModal
                title={sizeGuide.title}
                columns={sizeGuide.columns}
                rows={sizeGuide.rows}
                notes={product.size_guide?.notes}
                onClose={() => setSizeGuideOpen(false)}
              />
            ) : null}
          </>
        )}
      </section>
    </Shell>
  );
}

function getStockTone(stock: number) {
  if (stock <= 0) {
    return { label: "Out of stock", className: "bg-red-50 text-red-700" };
  }

  if (stock <= 10) {
    return { label: "Low stock", className: "bg-red-50 text-red-700" };
  }

  return { label: "In stock", className: "bg-green-50 text-green-700" };
}

function buildSizeGuide(product: Product | null, availableSizes: string[]) {
  const rows = product?.size_guide?.rows || [];
  if (rows.length) {
    const columns = Object.keys(rows[0]);
    return {
      title: product?.size_guide?.name || "Size guide",
      columns,
      rows: rows.map((row) => columns.map((column) => String(row[column] || ""))),
    };
  }

  const standardRows = [
    { size: "XS", uk: "6-8", us: "2-4", eu: "34-36" },
    { size: "S", uk: "8-10", us: "4-6", eu: "36-38" },
    { size: "M", uk: "10-12", us: "6-8", eu: "38-40" },
    { size: "L", uk: "12-14", us: "8-10", eu: "40-42" },
    { size: "XL", uk: "14-16", us: "10-12", eu: "42-44" },
    { size: "XXL", uk: "16-18", us: "12-14", eu: "44-46" },
    { size: "XXXL", uk: "18-20", us: "14-16", eu: "46-48" },
  ];
  const normalizedAvailableSizes = new Set(availableSizes.map(normalizeSizeLabel));
  const filteredRows = standardRows.filter((row) => normalizedAvailableSizes.has(normalizeSizeLabel(row.size)));

  return {
    title: "Size guide",
    columns: ["Size", "UK", "US", "EU"],
    rows: filteredRows.map((row) => [row.size, row.uk, row.us, row.eu]),
  };
}

function normalizeSizeLabel(value: string) {
  return value.trim().toUpperCase().replace(/^2XL$/, "XXL").replace(/^3XL$/, "XXXL");
}

function RulerIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17 17 4l3 3L7 20l-3-3Z" />
      <path d="m14 7 3 3" />
      <path d="m11 10 2 2" />
      <path d="m8 13 3 3" />
    </svg>
  );
}

function SizeGuideModal({
  title,
  columns,
  rows,
  notes,
  onClose,
}: {
  title: string;
  columns: string[];
  rows: string[][];
  notes?: string | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className="mx-auto flex max-h-[calc(100vh-3rem)] max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-neutral-500">Find your fit</p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full border border-neutral-200 transition hover:border-black" aria-label="Close size guide">
            <CloseIcon />
          </button>
        </div>
        <div className="overflow-auto p-5">
          {notes ? <p className="mb-4 text-sm leading-6 text-neutral-600">{notes}</p> : null}
          <table className="w-full min-w-[520px] overflow-hidden rounded-[18px] border border-neutral-200 text-center text-sm">
            <thead className="bg-neutral-100 text-xs uppercase text-neutral-600">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="border-b border-r border-neutral-200 px-4 py-4 last:border-r-0">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${row[0]}-${rowIndex}`} className="even:bg-neutral-50">
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className="border-b border-r border-neutral-200 px-4 py-4 last:border-r-0 last:font-bold">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function getVariantColorId(variant?: ProductVariant | null) {
  const rawColorId = variant?.options?.color_id;
  const colorId = Number(rawColorId);
  return Number.isFinite(colorId) && colorId > 0 ? colorId : null;
}

function getVariantColorName(variant?: ProductVariant | null) {
  return String(variant?.options?.color || "").trim();
}

function variantMatchesColor(
  variant: ProductVariant,
  colorId?: number | null,
  colorName = "",
) {
  if (!colorId && !colorName) return true;

  const variantColorId = getVariantColorId(variant);
  if (colorId && variantColorId === colorId) return true;

  const variantColorName = getVariantColorName(variant).toLowerCase();
  return Boolean(
    colorName &&
    variantColorName &&
    variantColorName === colorName.toLowerCase(),
  );
}

function deriveVariantColors(
  product: Product | null,
  variants: ProductVariant[],
  catalogColors: ProductColor[],
) {
  const colorMap = new Map<number, ProductColor>();

  [...(product?.colors || []), ...catalogColors].forEach((color) => {
    const hasVariant = variants.some((variant) =>
      variantMatchesColor(variant, color.id, color.name),
    );
    if (hasVariant) colorMap.set(color.id, color);
  });

  variants.forEach((variant) => {
    const colorId = getVariantColorId(variant);
    const colorName = getVariantColorName(variant);
    if (!colorName && !colorId) return;

    const existing = colorId
      ? colorMap.get(colorId) ||
        catalogColors.find((color) => color.id === colorId)
      : catalogColors.find(
          (color) => color.name.toLowerCase() === colorName.toLowerCase(),
        );
    if (existing) {
      colorMap.set(existing.id, existing);
      return;
    }

    if (colorName) {
      const syntheticId = colorId || -Math.abs(hashColorName(colorName));
      colorMap.set(syntheticId, {
        id: syntheticId,
        name: colorName,
        slug: colorName.toLowerCase().replace(/\s+/g, "-"),
        hex_code: "#111111",
      });
    }
  });

  return Array.from(colorMap.values());
}

function hashColorName(value: string) {
  return (
    value
      .split("")
      .reduce(
        (hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0,
        0,
      ) || 1
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Review rating"
    >
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
