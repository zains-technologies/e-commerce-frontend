"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCart } from "@/hooks/useCart";
import { useNavigation } from "@/hooks/useNavigation";
import { Input } from "@/components/common/Input";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/navigation";

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { navigation } = useNavigation();

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
        <nav className="hidden flex-1 items-center justify-center gap-7 whitespace-nowrap md:flex">
          <HeaderLink href="/" active={pathname === "/"}>Home</HeaderLink>
          <HeaderLink href="/products" active={pathname === "/products"}>Shop</HeaderLink>
          {navigation.map((item) => (
            <div key={item.slug} className="group relative">
              <Link
                href={`/products?category=${item.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 transition-colors hover:text-black"
              >
                {item.title}
                {item.children?.length ? <ChevronDown /> : null}
              </Link>
              {item.children?.length ? (
                <div className="invisible absolute left-1/2 top-full z-[120] mt-4 min-w-56 -translate-x-1/2 rounded-[22px] border border-neutral-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                  <CategoryDropdownItems items={item.children} />
                </div>
              ) : null}
            </div>
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

function HeaderLink({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link href={href} className={cn("text-sm font-medium transition-colors hover:text-black", active ? "text-black" : "text-neutral-700")}>
      {children}
    </Link>
  );
}

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="mt-0.5 size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CategoryDropdownItems({ items, depth = 0 }: { items: NavigationItem[]; depth?: number }) {
  return (
    <>
      {items.map((item) => (
        <div key={item.slug}>
          <Link
            href={`/products?category=${item.slug}`}
            className="block rounded-2xl py-3 pr-4 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black"
            style={{ paddingLeft: `${16 + depth * 14}px` }}
          >
            {depth > 0 ? "↳ " : ""}{item.title}
          </Link>
          {item.children?.length ? <CategoryDropdownItems items={item.children} depth={depth + 1} /> : null}
        </div>
      ))}
    </>
  );
}
