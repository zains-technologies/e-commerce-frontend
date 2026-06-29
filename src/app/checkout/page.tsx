"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateBlock";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Shell } from "@/components/layout/Shell";
import { useCart } from "@/hooks/useCart";
import { marketingService } from "@/services/marketingService";
import { analyticsService } from "@/services/analyticsService";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import type { CheckoutPayload } from "@/types/cart";

export default function CheckoutPage() {
  const { cart, loading } = useCart();
  const [form, setForm] = useState<CheckoutPayload>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    order_notes: "",
    delivery_fee: 350,
    payment_method: "cod",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bankReference, setBankReference] = useState("");
  const [bankReceipt, setBankReceipt] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const displayCart = useMemo(() => ({
    ...cart,
    totals: {
      ...cart.totals,
      delivery_fee: Number(form.delivery_fee || 0),
      total: Math.max(0, cart.totals.subtotal - cart.totals.discount + Number(form.delivery_fee || 0)),
    },
  }), [cart, form.delivery_fee]);

  useEffect(() => {
    marketingService.shippingMethods()
      .then((methods) => {
        const first = methods[0];
        if (first) {
          setForm((current) => ({
            ...current,
            delivery_fee: Number(first.fee),
          }));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!loading && cart.items.length > 0) {
      void analyticsService.track({ event: "checkout_started", payload: { items: cart.items.length, total: cart.totals.total } });
    }
  }, [cart.items.length, cart.totals.total, loading]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const checkoutPayload: CheckoutPayload = {
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        delivery_address: form.delivery_address,
        order_notes: form.order_notes,
        payment_method: form.payment_method,
        meta: form.meta,
      };
      const order = await orderService.checkout(checkoutPayload);
      const verification = {
        order_number: order.order_number,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
      };

      if (form.payment_method === "payhere") {
        setStatus("Redirecting to PayHere secure checkout...");
        const payload = await paymentService.initiatePayHere(verification);
        paymentService.submitPayHere(payload);
        return;
      }

      if (form.payment_method === "bank_transfer") {
        await paymentService.createBankTransfer({ ...verification, reference: bankReference, receipt: bankReceipt });
        setStatus(`Order ${order.order_number} is waiting for bank transfer review.`);
      } else {
        await paymentService.confirmCod(verification);
        setStatus(`Order ${order.order_number} confirmed for cash on delivery.`);
      }

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
            <form id="checkout-form" onSubmit={submit} className="space-y-6 rounded-[28px] border border-neutral-200 p-5">
              {error && <ErrorState message={error} />}
              {status && <div className="rounded-[20px] bg-green-50 p-4 text-sm font-bold text-green-700">{status}</div>}
              <div className="grid gap-4 md:grid-cols-2">
                <Input required placeholder="Full name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                <Input placeholder="Email" type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
                <Input required placeholder="Phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
              </div>
              <textarea
                required
                placeholder="Delivery address"
                value={form.delivery_address}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                className="min-h-32 w-full rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black"
              />
              <textarea
                placeholder="Order notes, delivery landmarks, or special instructions"
                value={form.order_notes}
                onChange={(e) => setForm({ ...form, order_notes: e.target.value })}
                className="min-h-24 w-full rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black"
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
              {form.payment_method === "bank_transfer" && (
                <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-bold">Bank transfer details</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">Add the transfer reference now, or upload a receipt so the admin can verify it from Payments.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.15fr]">
                    <Input placeholder="Transfer reference" value={bankReference} onChange={(e) => setBankReference(e.target.value)} />
                    <label className="group flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-[22px] border border-dashed border-neutral-300 bg-white px-4 py-3 transition hover:border-black">
                      <input className="sr-only" type="file" accept="image/*,.pdf" onChange={(e) => setBankReceipt(e.target.files?.[0] || null)} />
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-100 text-black transition group-hover:bg-black group-hover:text-white">
                          <UploadIcon />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">{bankReceipt?.name || "Upload payment receipt"}</span>
                          <span className="mt-0.5 block text-xs text-neutral-500">PNG, JPG, WEBP, or PDF</span>
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full border border-neutral-200 px-3 py-2 text-[11px] font-bold uppercase">Choose</span>
                    </label>
                  </div>
                </div>
              )}
              {form.payment_method === "payhere" && (
                <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                  You will be redirected to PayHere secure checkout after the order is created.
                </div>
              )}
              <Button disabled={busy} className="w-full">{busy ? "Placing order..." : "Place order"}</Button>
            </form>
            <OrderSummary
              cart={displayCart}
              actionLabel={busy ? "Placing order..." : "Place order"}
              disabled={busy}
              onAction={() => (document.getElementById("checkout-form") as HTMLFormElement | null)?.requestSubmit()}
            />
          </div>
        )}
      </section>
    </Shell>
  );
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
