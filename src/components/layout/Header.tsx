"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent, type ReactNode } from "react";
import { useCart } from "@/hooks/useCart";
import { useNavigation } from "@/hooks/useNavigation";
import { Input } from "@/components/common/Input";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/navigation";

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { navigation } = useNavigation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobileMenuFromLink(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) {
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/90 backdrop-blur">
      <div className="container-shell hidden h-9 items-center justify-between text-[11px] text-neutral-500 md:flex">
        <div className="flex gap-8">
          <span>English</span>
          <span>Dollar</span>
        </div>
        <div className="flex gap-8">
          <Link href="/track-order" className="hover:text-black">Tracking Package</Link>
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
          <Link aria-label="Wishlist" href="/wishlist" className="hidden md:inline">♡</Link>
          <Link aria-label="Account" href="/account" className="hidden md:inline">♙</Link>
          <Link aria-label="Cart" href="/cart" className="relative">
            🛒
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-black text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-neutral-200 text-sm font-black transition hover:border-black md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-neutral-100 bg-white shadow-xl md:hidden" onClick={closeMobileMenuFromLink}>
          <div className="container-shell space-y-5 py-5">
            <Input placeholder="Search products" className="h-10 text-xs" />
            <nav className="space-y-1">
              <MobileLink href="/" active={pathname === "/"}>Home</MobileLink>
              <MobileLink href="/products" active={pathname === "/products"}>Shop</MobileLink>
              {navigation.map((item) => (
                <div key={item.slug} className="rounded-[22px] border border-neutral-100 bg-neutral-50/60 p-1">
                  <MobileLink href={`/products?category=${item.slug}`}>
                    <span>{item.title}</span>
                    {item.children?.length ? <span className="text-xs text-neutral-400">{item.children.length}</span> : null}
                  </MobileLink>
                  {item.children?.length ? (
                    <div className="border-t border-neutral-100 px-3 py-2">
                      <CategoryDropdownItems items={item.children} mobile />
                    </div>
                  ) : null}
                </div>
              ))}
            </nav>
            <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-4">
              <MobileAction href="/wishlist" label="Wishlist">♡</MobileAction>
              <MobileAction href="/account" label="Account">♙</MobileAction>
              <MobileAction href="/cart" label={`Cart${count > 0 ? ` (${count})` : ""}`}>🛒</MobileAction>
            </div>
          </div>
        </div>
      )}
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

function MobileLink({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link href={href} className={cn("flex min-h-12 items-center justify-between rounded-[18px] px-4 text-sm font-bold transition-colors", active ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100 hover:text-black")}>
      {children}
    </Link>
  );
}

function MobileAction({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Link href={href} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-[20px] border border-neutral-200 text-sm font-bold transition hover:border-black">
      <span className="text-xl leading-none">{children}</span>
      <span className="text-[11px] uppercase">{label}</span>
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function CategoryDropdownItems({ items, depth = 0, mobile = false }: { items: NavigationItem[]; depth?: number; mobile?: boolean }) {
  return (
    <>
      {items.map((item) => (
        <div key={item.slug}>
          <Link
            href={`/products?category=${item.slug}`}
            className={cn(
              "block rounded-2xl pr-4 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black",
              mobile ? "py-2.5" : "py-3",
            )}
            style={{ paddingLeft: `${mobile ? 8 + depth * 14 : 16 + depth * 14}px` }}
          >
            {depth > 0 ? "↳ " : ""}{item.title}
          </Link>
          {item.children?.length ? <CategoryDropdownItems items={item.children} depth={depth + 1} mobile={mobile} /> : null}
        </div>
      ))}
    </>
  );
}
