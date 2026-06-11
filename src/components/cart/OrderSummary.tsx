import { Button } from "@/components/common/Button";
import { formatCurrency } from "@/lib/utils";
import type { Cart } from "@/types/cart";

export function OrderSummary({
  cart,
  actionLabel,
  onAction,
  disabled,
}: {
  cart: Cart;
  actionLabel: string;
  onAction?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-[28px] bg-neutral-50 p-5">
      <h2 className="text-xl font-bold">Order summary</h2>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(cart.totals.subtotal)}</strong></div>
        <div className="flex justify-between"><span>Discount</span><strong>-{formatCurrency(cart.totals.discount)}</strong></div>
        <div className="flex justify-between"><span>Delivery fee</span><strong>{formatCurrency(cart.totals.delivery_fee)}</strong></div>
        <div className="border-t border-neutral-200 pt-3 flex justify-between text-lg"><span>Total</span><strong>{formatCurrency(cart.totals.total)}</strong></div>
      </div>
      <Button className="mt-6 w-full" disabled={disabled} onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}

