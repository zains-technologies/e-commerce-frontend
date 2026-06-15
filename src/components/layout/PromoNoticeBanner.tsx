"use client";

import Link from "next/link";
import { useStore } from "@/hooks/useStore";

export function PromoNoticeBanner() {
  const { store } = useStore();
  const notice = store?.settings?.promo_notice;

  if (!notice?.enabled || !notice.message) return null;

  const text = `${notice.message}${notice.coupon_code ? ` · Code ${notice.coupon_code}` : ""}`;

  return (
    <Link href={notice.href || "/products"} className="block overflow-hidden bg-black py-4 text-white">
      <div className="flex min-w-max animate-notice-marquee gap-8 text-3xl font-black uppercase tracking-wide md:text-5xl">
        {[1, 2, 3, 4].map((item) => (
          <span key={item} className="whitespace-nowrap">{text}</span>
        ))}
      </div>
    </Link>
  );
}
