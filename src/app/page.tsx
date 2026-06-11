"use client";

import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { Shell } from "@/components/layout/Shell";
import { CategoryChips } from "@/components/product/CategoryChips";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";

const heroImages = {
  main: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85",
  cycling: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=85",
  hoodie: "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=900&q=85",
  shirts: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85",
  funky: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
  testimonial: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=85",
  blog: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85",
};

const colors = [
  ["Red Pastel", "#e85d5d"],
  ["Lime Green", "#b7ec63"],
  ["Navy Blue", "#1d3762"],
  ["Clean White", "#ffffff"],
  ["Blue Sky", "#6fb8ec"],
  ["Purple", "#ad5cff"],
  ["Pink", "#ef5b8a"],
  ["Yellow", "#f3c84b"],
  ["Dark Green", "#4b9367"],
];

export default function Home() {
  const { products, loading, error } = useProducts();
  const { categories } = useCategories();

  return (
    <Shell>
      <section className="container-shell pt-5">
        <div className="grid gap-2 md:grid-cols-[1fr_300px]">
          <div className="relative min-h-[410px] overflow-hidden rounded-[26px] bg-[#b7c0a7] md:min-h-[650px] md:rounded-[32px]">
            <img src={heroImages.main} alt="Summer outfit" className="image-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />
            <div className="absolute left-6 top-8 max-w-sm text-white md:left-12 md:top-12">
              <h1 className="text-5xl font-medium leading-[0.86] tracking-[-0.08em] md:text-7xl">
                Color of Summer Outfit
              </h1>
              <p className="mt-6 max-w-xs text-sm text-white/85">100+ Collections for your outfit inspirations in this summer</p>
              <Link href="/products"><Button className="mt-6">View Collections</Button></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {[
              ["Outdoor Active", heroImages.cycling],
              ["Casual Comfort", heroImages.hoodie],
            ].map(([title, image]) => (
              <div key={title} className="relative min-h-[150px] overflow-hidden rounded-[24px] md:min-h-[320px]">
                <img src={image} alt={title} className="image-cover" />
                <h2 className="absolute left-5 top-5 max-w-[120px] text-2xl font-medium leading-[0.9] tracking-[-0.05em]">{title}</h2>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-4 border-b border-neutral-100 py-8 md:grid-cols-[280px_1fr_1fr]">
        <div>
          <h2 className="text-5xl font-medium leading-[0.9] tracking-[-0.07em]">Casual Inspirations</h2>
          <p className="mt-5 text-sm leading-6 text-neutral-600">Our favorite combinations for casual outfit that can inspire you to apply on your daily activity.</p>
          <Link href="/products"><Button variant="outline" className="mt-6">Browse Inspirations</Button></Link>
        </div>
        {[
          ["Say it with Shirt", heroImages.shirts],
          ["Funky never get old", heroImages.funky],
        ].map(([title, image]) => (
          <Link key={title} href="/products" className="group relative min-h-[260px] overflow-hidden rounded-[28px]">
            <img src={image} alt={title} className="image-cover group-hover:scale-105" />
            <span className="absolute bottom-6 left-6 max-w-[180px] text-3xl font-medium leading-[0.95] tracking-[-0.06em] text-white">{title}</span>
            <span className="absolute bottom-6 right-6 text-3xl text-white">↗</span>
          </Link>
        ))}
      </section>

      <section className="container-shell py-8">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Trending</h2>
          <CategoryChips categories={categories.slice(0, 5)} selected="shoes" />
        </div>
        {loading && <LoadingState />}
        {error && <div className="mb-4"><ErrorState message={`Using placeholder products because API said: ${error}`} /></div>}
        {!loading && <ProductGrid products={products.slice(0, 6)} />}
      </section>

      <section className="container-shell grid gap-6 border-y border-neutral-100 py-8 md:grid-cols-[280px_1fr] md:items-start">
        <h2 className="text-5xl font-medium leading-[0.95] tracking-[-0.07em]">Explore by Colors</h2>
        <div className="flex flex-wrap gap-2">
          {colors.map(([name, color]) => (
            <Badge key={name}>
              <span className="size-5 rounded-full border border-black/10" style={{ backgroundColor: color }} />
              {name}
            </Badge>
          ))}
        </div>
      </section>

      <section className="container-shell py-8">
        <div className="relative min-h-[340px] overflow-hidden rounded-[28px] bg-neutral-200 md:min-h-[470px]">
          <img src={heroImages.testimonial} alt="Happy customer" className="image-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="absolute left-7 top-9 max-w-md text-white md:left-16 md:top-16">
            <p className="text-lg text-white/70">What people said</p>
            <h2 className="mt-2 text-4xl font-medium leading-[0.95] tracking-[-0.07em] md:text-5xl">Love the way they handle the order.</h2>
            <p className="mt-6 text-sm leading-6 text-white/75">Very professional and friendly at the same time. They packed the order on schedule and the detail of their wrapping is top notch.</p>
            <p className="mt-6 font-bold">Samantha William</p>
            <p className="text-xs text-white/55">Fashion Enthusiast</p>
          </div>
        </div>
      </section>

      <section className="container-shell border-t border-neutral-100 py-10">
        <h2 className="max-w-xl text-5xl font-medium leading-[0.95] tracking-[-0.07em]">Why you&apos;ll love to shop on our website</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            ["♥", "Take care with love", "We take care of your package with full attention and thoughtful wrapping."],
            ["☎", "Friendly Customer Service", "Click the chat icon and our team will answer your questions."],
            ["⟳", "Refund Process", "Smooth and friendly process if something does not go as planned."],
          ].map(([icon, title, text]) => (
            <div key={title}>
              <div className="grid size-20 place-items-center rounded-full bg-black text-3xl text-white">{icon}</div>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell grid gap-8 py-8 md:grid-cols-2 md:items-center">
        <img src={heroImages.blog} alt="Clothing rack" className="aspect-[1.55] w-full rounded-[28px] object-cover" />
        <div>
          <p className="mb-4 text-xl">From The Blog</p>
          <h2 className="text-5xl font-medium leading-[0.95] tracking-[-0.07em]">How to combine your daily outfit to looks fresh and cool.</h2>
          <p className="mt-6 text-sm leading-6 text-neutral-600">Maybe you don&apos;t need to buy new clothes to look fresh every day. Mix and match is the key.</p>
          <Button variant="outline" className="mt-6">Read More</Button>
        </div>
      </section>
    </Shell>
  );
}

