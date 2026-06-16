"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateBlock";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Shell } from "@/components/layout/Shell";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, busy, error, updateItem, removeItem, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState("");

  function submitCoupon(event: FormEvent) {
    event.preventDefault();
    if (couponCode.trim()) {
      void applyCoupon(couponCode.trim());
    }
  }

  const couponLabel = typeof cart.coupon === "string" ? cart.coupon : cart.coupon?.code;

  return (
    <Shell>
      <section className="container-shell py-8">
        <h1 className="text-5xl font-medium tracking-[-0.07em] md:text-7xl">Your cart</h1>
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_360px]">
          <div className="rounded-[28px] border border-neutral-200 p-5">
            {loading && <LoadingState />}
            {error && <ErrorState message={error} />}
            {!loading && cart.items.length === 0 && <EmptyState message="Your cart is empty. Add a product to continue." />}
            {cart.items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                disabled={busy}
                onQuantity={(quantity) => updateItem(item.id, quantity)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
            {cart.items.length > 0 && (
              <form onSubmit={submitCoupon} className="mt-5 rounded-[22px] border border-neutral-200 p-4">
                <p className="text-xs font-bold uppercase text-neutral-500">Coupon</p>
                {couponLabel ? (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold">{couponLabel} applied</span>
                    <button type="button" onClick={() => removeCoupon()} disabled={busy} className="text-sm font-bold underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-3">
                    <input
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value)}
                      placeholder="Coupon code"
                      className="h-11 flex-1 rounded-full border border-neutral-200 px-4 text-sm outline-none focus:border-black"
                    />
                    <button disabled={busy} className="h-11 rounded-full bg-black px-5 text-xs font-bold uppercase text-white">
                      Apply
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
          <OrderSummary cart={cart} actionLabel="Proceed to checkout" disabled={!cart.items.length} onAction={() => router.push("/checkout")} />
        </div>
      </section>
    </Shell>
  );
}
