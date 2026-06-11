"use client";

import { useRouter } from "next/navigation";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateBlock";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Shell } from "@/components/layout/Shell";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, busy, error, updateItem, removeItem } = useCart();

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
          </div>
          <OrderSummary cart={cart} actionLabel="Proceed to checkout" disabled={!cart.items.length} onAction={() => router.push("/checkout")} />
        </div>
      </section>
    </Shell>
  );
}

