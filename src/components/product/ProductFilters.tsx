"use client";

import { Input } from "@/components/common/Input";
import { Dropdown } from "@/components/common/Dropdown";
import { CategoryChips } from "./CategoryChips";
import { formatCurrency } from "@/lib/utils";
import type { Category } from "@/types/category";

export function ProductFilters({
  categories,
  search,
  category,
  sort,
  priceBounds,
  maxPrice,
  resultCount,
  activeCount,
  onSearch,
  onCategory,
  onSort,
  onMaxPrice,
  onClear,
}: {
  categories: Category[];
  search: string;
  category: string;
  sort: string;
  priceBounds: { min: number; max: number };
  maxPrice: number;
  resultCount: number;
  activeCount: number;
  onSearch: (value: string) => void;
  onCategory: (value: string) => void;
  onSort: (value: string) => void;
  onMaxPrice: (value: number) => void;
  onClear: () => void;
}) {
  const hasPriceRange = priceBounds.max > priceBounds.min;
  const progress = hasPriceRange ? ((maxPrice - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100 : 100;

  return (
    <aside className="rounded-[28px] border border-neutral-200 bg-white p-4 shadow-sm md:sticky md:top-28 md:self-start">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Shop filters</p>
          <p className="mt-1 text-sm text-neutral-500">{resultCount} products found</p>
        </div>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="rounded-full border border-neutral-200 px-3 py-2 text-[11px] font-bold uppercase transition hover:border-black">
            Reset
          </button>
        )}
      </div>

      <div className="space-y-5">
        <section>
          <p className="mb-2 text-xs font-bold uppercase text-neutral-500">Search</p>
          <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search products" />
        </section>

        <section className="border-t border-neutral-100 pt-5">
          <p className="mb-3 text-xs font-bold uppercase text-neutral-500">Categories</p>
          <CategoryChips categories={categories} selected={category} onSelect={onCategory} className="flex-wrap overflow-visible" />
        </section>

        <section className="border-t border-neutral-100 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase text-neutral-500">Price</p>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold uppercase text-neutral-700">Up to {formatCurrency(maxPrice)}</span>
          </div>
          <div className="relative pb-1 pt-2">
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-neutral-200" />
            <div className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-black" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={maxPrice}
              disabled={!hasPriceRange}
              onChange={(event) => onMaxPrice(Number(event.target.value))}
              className="relative z-10 h-8 w-full cursor-pointer appearance-none bg-transparent accent-black disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Maximum price"
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>{formatCurrency(priceBounds.min)}</span>
            <span>{formatCurrency(priceBounds.max)}</span>
          </div>
        </section>

        <section className="border-t border-neutral-100 pt-5">
          <p className="mb-2 text-xs font-bold uppercase text-neutral-500">Sort by</p>
          <Dropdown
            value={sort}
            onChange={onSort}
            options={[
              { label: "Featured", value: "featured" },
              { label: "Price: Low to high", value: "price-low" },
              { label: "Price: High to low", value: "price-high" },
            ]}
          />
        </section>
      </div>
    </aside>
  );
}
