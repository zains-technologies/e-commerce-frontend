"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { Input } from "@/components/common/Input";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/products", label: "All Category" },
  { href: "/products", label: "Gift Cards" },
  { href: "/products", label: "Special Event" },
];

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/90 backdrop-blur">
      <div className="container-shell hidden h-9 items-center justify-between text-[11px] text-neutral-500 md:flex">
        <div className="flex gap-8">
          <span>English</span>
          <span>Dollar</span>
        </div>
        <div className="flex gap-8">
          <span>Tracking Package</span>
          <span>FAQ</span>
          <span>About Us</span>
          <span>Contact Us</span>
        </div>
      </div>
      <div className="container-shell flex h-16 items-center gap-4">
        <Link href="/" className="text-base font-black tracking-tight">
          ECOMMERCE
        </Link>
        <div className="hidden w-full max-w-[270px] md:block">
          <Input placeholder="Search here" className="h-9 text-xs" />
        </div>
        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn("text-xs font-semibold", pathname === item.href ? "text-black" : "text-neutral-600")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-xl">
          <Link aria-label="Wishlist" href="/products" className="hidden md:inline">♡</Link>
          <Link aria-label="Account" href="/login" className="hidden md:inline">♙</Link>
          <Link aria-label="Cart" href="/cart" className="relative">
            🛒
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-black text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button className="md:hidden" aria-label="Menu">☰</button>
        </div>
      </div>
    </header>
  );
}

