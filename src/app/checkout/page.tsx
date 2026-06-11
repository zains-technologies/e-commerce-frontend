"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateBlock";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Shell } from "@/components/layout/Shell";
import { useCart } from "@/hooks/useCart";
import { orderService } from "@/services/orderService";
import type { CheckoutPayload } from "@/types/cart";

export default function CheckoutPage() {
  const { cart, loading } = useCart();
  const [form, setForm] = useState<CheckoutPayload>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    delivery_fee: 350,
    payment_method: "cod",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const order = await orderService.checkout(form);
      setStatus(`Order placed successfully: ${order.order_number}`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <section className="container-shell py-8">
        <h1 className="text-5xl font-medium tracking-[-0.07em] md:text-7xl">Checkout</h1>
        {loading && <div className="mt-8"><LoadingState /></div>}
        {!loading && cart.items.length === 0 && <div className="mt-8"><EmptyState message="Your cart is empty. Add items before checkout." /></div>}
        {!loading && cart.items.length > 0 && (
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_360px]">
            <form onSubmit={submit} className="space-y-6 rounded-[28px] border border-neutral-200 p-5">
              {error && <ErrorState message={error} />}
              {status && <div className="rounded-[20px] bg-green-50 p-4 text-sm font-bold text-green-700">{status}</div>}
              <div className="grid gap-4 md:grid-cols-2">
                <Input required placeholder="Full name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                <Input placeholder="Email" type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
                <Input placeholder="Phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
                <Input placeholder="Delivery fee" type="number" value={form.delivery_fee} onChange={(e) => setForm({ ...form, delivery_fee: Number(e.target.value) })} />
              </div>
              <textarea
                required
                placeholder="Delivery address"
                value={form.delivery_address}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                className="min-h-32 w-full rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black"
              />
              <div>
                <p className="mb-3 text-xs font-bold uppercase text-neutral-500">Payment method</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    ["cod", "Cash on Delivery"],
                    ["bank_transfer", "Bank Transfer"],
                    ["payhere", "PayHere"],
                  ].map(([value, label]) => (
                    <label key={value} className={`rounded-[20px] border p-4 text-sm font-bold ${form.payment_method === value ? "border-black bg-black text-white" : "border-neutral-200"}`}>
                      <input className="sr-only" type="radio" value={value} checked={form.payment_method === value} onChange={() => setForm({ ...form, payment_method: value as CheckoutPayload["payment_method"] })} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <Button disabled={busy} className="w-full">{busy ? "Placing order..." : "Place order"}</Button>
            </form>
            <OrderSummary cart={cart} actionLabel="Place order" disabled={busy} />
          </div>
        )}
      </section>
    </Shell>
  );
}

