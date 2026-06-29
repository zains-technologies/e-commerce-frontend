"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Dropdown } from "@/components/common/Dropdown";
import { Input } from "@/components/common/Input";
import { Shell } from "@/components/layout/Shell";
import { returnService } from "@/services/returnService";

export default function ReturnsPage() {
  const [form, setForm] = useState({ order_id: "", customer_email: "", customer_phone: "", type: "return", reason: "", customer_note: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const request = await returnService.create(Number(form.order_id), {
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        type: form.type,
        reason: form.reason,
        customer_note: form.customer_note,
      });
      setStatus(`Request ${request.request_number} submitted.`);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Return request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <section className="container-shell py-8">
        <h1 className="text-5xl font-medium tracking-[-0.07em] md:text-7xl">Returns and exchanges</h1>
        <form onSubmit={submit} className="mt-8 grid max-w-3xl gap-4 rounded-[28px] border border-neutral-200 p-5">
          {status && <div className="rounded-[20px] bg-green-50 p-4 text-sm font-bold text-green-700">{status}</div>}
          {error && <div className="rounded-[20px] bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <Input required type="number" placeholder="Order ID" value={form.order_id} onChange={(e) => setForm({ ...form, order_id: e.target.value })} />
            <Dropdown value={form.type} options={[{ label: "Return", value: "return" }, { label: "Exchange", value: "exchange" }]} onChange={(type) => setForm({ ...form, type })} />
            <Input type="email" placeholder="Order email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
            <Input placeholder="Order phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
          </div>
          <Input required placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <textarea placeholder="More details" value={form.customer_note} onChange={(e) => setForm({ ...form, customer_note: e.target.value })} className="min-h-32 w-full rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black" />
          <Button disabled={busy}>{busy ? "Submitting..." : "Submit request"}</Button>
        </form>
      </section>
    </Shell>
  );
}
