"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorState } from "@/components/common/StateBlock";
import { Shell } from "@/components/layout/Shell";
import { formatCurrency } from "@/lib/utils";
import { orderService, type OrderSummary } from "@/services/orderService";

export default function TrackOrderPage() {
  const [form, setForm] = useState({ order_number: "", email: "", phone: "" });
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      setOrder(await orderService.track(form));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found.");
      setOrder(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <section className="container-shell py-8">
        <h1 className="text-5xl font-medium tracking-[-0.07em] md:text-7xl">Track order</h1>
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_420px]">
          <form onSubmit={submit} className="grid gap-4 rounded-[28px] border border-neutral-200 p-5">
            {error && <ErrorState message={error} />}
            <Input required placeholder="Order number" value={form.order_number} onChange={(event) => setForm({ ...form, order_number: event.target.value })} />
            <Input placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <Button disabled={busy}>{busy ? "Checking..." : "Track order"}</Button>
          </form>
          {order && (
            <div className="rounded-[28px] bg-neutral-50 p-5">
              <p className="text-xs font-bold uppercase text-neutral-500">Order found</p>
              <h2 className="mt-3 text-3xl font-medium tracking-[-0.05em]">{order.order_number}</h2>
              <p className="mt-4 text-sm text-neutral-600">Status: <strong>{order.status}</strong></p>
              <p className="mt-2 text-sm text-neutral-600">Payment: <strong>{order.payment_status}</strong></p>
              <p className="mt-4 text-2xl font-black">{formatCurrency(order.total)}</p>
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
}
