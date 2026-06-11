"use client";

import { Input } from "@/components/common/Input";
import { Dropdown } from "@/components/common/Dropdown";
import { CategoryChips } from "./CategoryChips";
import type { Category } from "@/types/category";

export function ProductFilters({
  categories,
  search,
  category,
  sort,
  onSearch,
  onCategory,
  onSort,
}: {
  categories: Category[];
  search: string;
  category: string;
  sort: string;
  onSearch: (value: string) => void;
  onCategory: (value: string) => void;
  onSort: (value: string) => void;
}) {
  return (
    <aside className="space-y-5 rounded-[28px] border border-neutral-200 p-4">
      <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search products" />
      <div>
        <p className="mb-3 text-xs font-bold uppercase text-neutral-500">Categories</p>
        <CategoryChips categories={categories} selected={category} onSelect={onCategory} />
      </div>
      <div>
        <p className="mb-3 text-xs font-bold uppercase text-neutral-500">Price</p>
        <div className="h-2 rounded-full bg-neutral-200">
          <div className="h-2 w-2/3 rounded-full bg-black" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-neutral-500">
          <span>Low</span>
          <span>Premium</span>
        </div>
      </div>
      <Dropdown
        value={sort}
        onChange={onSort}
        options={[
          { label: "Featured", value: "featured" },
          { label: "Price: Low to high", value: "price-low" },
          { label: "Price: High to low", value: "price-high" },
        ]}
      />
    </aside>
  );
}
