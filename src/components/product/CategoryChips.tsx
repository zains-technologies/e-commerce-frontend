"use client";

import { Badge } from "@/components/common/Badge";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

export function CategoryChips({
  categories,
  selected = "all",
  onSelect,
  className,
}: {
  categories: Category[];
  selected?: string;
  onSelect?: (slug: string) => void;
  className?: string;
}) {
  const chips = [{ id: 0, name: "All", slug: "all" }, ...categories];

  return (
    <div className={cn("hide-scrollbar flex gap-2 overflow-x-auto", className)}>
      {chips.map((category) => (
        <button key={category.slug} onClick={() => onSelect?.(category.slug)} type="button">
          <Badge active={selected === category.slug}>{category.name}</Badge>
        </button>
      ))}
    </div>
  );
}
