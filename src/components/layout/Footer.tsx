"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { marketingService } from "@/services/marketingService";

export function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function subscribe(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    await marketingService.subscribe({ email: email.trim() });
    setEmail("");
    setMessage("Subscribed successfully.");
  }

  return (
    <footer className="mt-20 bg-[#101010] py-14 text-white">
      <div className="container-shell grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <h2 className="text-lg font-black">ECOMMERCE</h2>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">
            Reusable ecommerce storefront for fashion, lifestyle, and product brands.
          </p>
          <form onSubmit={subscribe} className="mt-6 flex max-w-sm gap-2">
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 flex-1 rounded-full border border-white/20 bg-transparent px-4 text-xs outline-none" placeholder="Type your email address" />
            <Button variant="light" className="h-10 px-5">Submit</Button>
          </form>
          {message && <p className="mt-3 text-xs font-bold text-white/70">{message}</p>}
        </div>
        {[
          ["Popular", "Shoes", "T-Shirt", "Jackets", "Hat", "Accessories"],
          ["Menu", "All Category", "Gift Cards", "Special Events", "Testimonial", "Blog"],
          ["Other", "Tracking Package", "FAQ", "About Us", "Contact Us", "Terms and Conditions"],
        ].map(([title, ...items]) => (
          <div key={title}>
            <h3 className="text-xs font-bold uppercase text-white/70">{title}</h3>
            <ul className="mt-4 space-y-3 text-xs text-white/45">
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
