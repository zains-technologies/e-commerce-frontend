"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateBlock";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Shell } from "@/components/layout/Shell";
import { useCart } from "@/hooks/useCart";
import { marketingService } from "@/services/marketingService";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import type { CheckoutPayload } from "@/types/cart";
import type { ShippingMethod } from "@/types/marketing";

export default function CheckoutPage() {
  const { cart, loading } = useCart();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [form, setForm] = useState<CheckoutPayload>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    shipping_method: "standard",
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
        setShippingMethods(methods);
        const first = methods[0];
        if (first) {
          setForm((current) => ({
            ...current,
            shipping_method: first.code as CheckoutPayload["shipping_method"],
            shipping_method_id: first.id,
            delivery_fee: Number(first.fee),
          }));
        }
      })
      .catch(() => setShippingMethods([]));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const order = await orderService.checkout(form);
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
              <div>
                <p className="mb-3 text-xs font-bold uppercase text-neutral-500">Shipping method</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {(shippingMethods.length ? shippingMethods : [
                    { id: 0, code: "standard", name: "Standard", fee: 350, is_active: true },
                    { id: 0, code: "express", name: "Express", fee: 650, is_active: true },
                    { id: 0, code: "pickup", name: "Store pickup", fee: 0, is_active: true },
                  ]).map((method) => (
                    <label key={method.code} className={`rounded-[20px] border p-4 text-sm font-bold ${form.shipping_method === method.code ? "border-black bg-black text-white" : "border-neutral-200"}`}>
                      <input
                        className="sr-only"
                        type="radio"
                        value={method.code}
                        checked={form.shipping_method === method.code}
                        onChange={() => setForm({ ...form, shipping_method: method.code as CheckoutPayload["shipping_method"], shipping_method_id: method.id || null, delivery_fee: Number(method.fee) })}
                      />
                      {method.name}
                      <span className="mt-1 block text-xs opacity-70">{formatFee(Number(method.fee))}</span>
                    </label>
                  ))}
                </div>
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
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Input placeholder="Transfer reference" value={bankReference} onChange={(e) => setBankReference(e.target.value)} />
                    <Input type="file" accept="image/*,.pdf" onChange={(e) => setBankReceipt(e.target.files?.[0] || null)} />
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

function formatFee(fee: number) {
  return fee > 0 ? `Delivery ${new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(fee)}` : "Free";
}
