"use client";

import { QuantityControl } from "./QuantityControl";
import { formatCurrency, getPrimaryImage } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

export function CartItemRow({
  item,
  onQuantity,
  onRemove,
  disabled,
}: {
  item: CartItem;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const variantLabel = item.variant
    ? [item.variant.options?.size, item.variant.options?.color].filter(Boolean).join(" / ") || item.variant.attribute_value
    : item.product.sku;

  return (
    <div className="flex gap-4 border-b border-neutral-100 py-4">
      <img src={getPrimaryImage(item.product.images)} alt={item.product.name} className="size-24 rounded-[20px] object-cover" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-3">
          <div>
            <h3 className="font-bold">{item.product.name}</h3>
            <p className="text-xs text-neutral-500">
              {variantLabel}
            </p>
          </div>
          <p className="font-bold">{formatCurrency(item.line_total)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <QuantityControl value={item.quantity} disabled={disabled} onChange={onQuantity} />
          <button disabled={disabled} onClick={onRemove} className="text-xs font-bold uppercase text-neutral-500 hover:text-black">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
