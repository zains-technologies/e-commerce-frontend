"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateBlock";
import { Shell } from "@/components/layout/Shell";
import { addressService } from "@/services/addressService";
import { authService } from "@/services/authService";
import { orderService, type OrderSummary } from "@/services/orderService";
import type { CustomerAddress } from "@/types/address";
import type { User } from "@/types/user";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", password: "" });
  const [address, setAddress] = useState({ label: "Home", recipient_name: "", phone: "", address: "", city: "", postal_code: "", is_default: true });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [me, nextOrders, nextAddresses] = await Promise.all([authService.me(), orderService.orders(), addressService.list()]);
      setUser(me);
      setProfile({ name: me.name, email: me.email, phone: me.phone || "", password: "" });
      setOrders(nextOrders);
      setAddresses(nextAddresses);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please login to manage your account.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await action();
      setMessage(success);
      setError(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    void run(() => authService.updateProfile({ ...profile, password: profile.password || undefined }), "Profile updated.");
  }

  function saveAddress(event: FormEvent) {
    event.preventDefault();
    void run(() => addressService.create(address), "Address saved.");
  }

  return (
    <Shell>
      <section className="container-shell py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-neutral-500">Customer workspace</p>
            <h1 className="text-5xl font-medium tracking-[-0.07em] md:text-7xl">Account</h1>
          </div>
          {!user && <Link className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold" href="/login">Login</Link>}
        </div>

        {loading && <div className="mt-8"><LoadingState /></div>}
        {error && <div className="mt-8"><ErrorState message={error} /></div>}
        {message && <div className="mt-8 rounded-[20px] bg-green-50 p-4 text-sm font-bold text-green-700">{message}</div>}

        {!loading && user && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
            <form onSubmit={saveProfile} className="rounded-[28px] border border-neutral-200 p-5">
              <h2 className="text-2xl font-medium tracking-[-0.04em]">Profile</h2>
              <div className="mt-5 grid gap-4">
                <Input required placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                <Input required type="email" placeholder="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                <Input placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                <Input type="password" placeholder="New password optional" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} />
              </div>
              <Button disabled={busy} className="mt-5">Update profile</Button>
            </form>

            <form onSubmit={saveAddress} className="rounded-[28px] border border-neutral-200 p-5">
              <h2 className="text-2xl font-medium tracking-[-0.04em]">Saved addresses</h2>
              <div className="mt-5 grid gap-4">
                <Input placeholder="Label" value={address.label} onChange={(e) => setAddress({ ...address, label: e.target.value })} />
                <Input required placeholder="Recipient name" value={address.recipient_name} onChange={(e) => setAddress({ ...address, recipient_name: e.target.value })} />
                <Input placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                <Input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                <textarea required placeholder="Address" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} className="min-h-24 rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black" />
              </div>
              <Button disabled={busy} className="mt-5">Save address</Button>
              <div className="mt-5 space-y-3">
                {addresses.map((item) => (
                  <div key={item.id} className="flex items-start justify-between rounded-[20px] bg-neutral-50 p-4 text-sm">
                    <div>
                      <p className="font-bold">{item.label} {item.is_default ? "· Default" : ""}</p>
                      <p className="mt-1 text-neutral-600">{item.recipient_name} · {item.address}</p>
                    </div>
                    <button type="button" onClick={() => run(() => addressService.remove(item.id), "Address deleted.")} className="font-bold underline">Remove</button>
                  </div>
                ))}
              </div>
            </form>

            <div className="rounded-[28px] border border-neutral-200 p-5 lg:col-span-2">
              <h2 className="text-2xl font-medium tracking-[-0.04em]">Order history</h2>
              {!orders.length && <div className="mt-5"><EmptyState message="No orders yet." /></div>}
              <div className="mt-5 grid gap-3">
                {orders.map((order) => (
                  <div key={order.id} className="grid gap-3 rounded-[20px] bg-neutral-50 p-4 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                    <div>
                      <p className="font-bold">{order.order_number}</p>
                      <p className="text-neutral-500">{order.status} · {order.payment_status}</p>
                    </div>
                    <p className="font-bold">LKR {Number(order.total).toLocaleString()}</p>
                    <Button disabled={busy} onClick={() => run(() => orderService.reorder(order.id), "Items added back to cart.")}>Reorder</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </Shell>
  );
}
