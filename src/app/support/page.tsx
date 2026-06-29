"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Shell } from "@/components/layout/Shell";
import { supportService } from "@/services/supportService";

export default function SupportPage() {
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_phone: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const ticket = await supportService.create(form);
      setStatus(`Support ticket ${ticket.ticket_number} created.`);
      setError("");
      setForm({ customer_name: "", customer_email: "", customer_phone: "", subject: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Support request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <section className="container-shell py-8">
        <h1 className="text-5xl font-medium tracking-[-0.07em] md:text-7xl">Customer support</h1>
        <form onSubmit={submit} className="mt-8 grid max-w-3xl gap-4 rounded-[28px] border border-neutral-200 p-5">
          {status && <div className="rounded-[20px] bg-green-50 p-4 text-sm font-bold text-green-700">{status}</div>}
          {error && <div className="rounded-[20px] bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <Input required placeholder="Name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            <Input type="email" placeholder="Email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
            <Input placeholder="Phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
            <Input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <textarea required placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-36 w-full rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black" />
          <Button disabled={busy}>{busy ? "Sending..." : "Submit ticket"}</Button>
        </form>
      </section>
    </Shell>
  );
}
