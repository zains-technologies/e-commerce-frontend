"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cartService, emptyCart } from "@/services/cartService";
import type { AddToCartPayload, Cart } from "@/types/cart";

export function useCart() {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cartService.get();
      setCart(data);
      setError(null);
    } catch (err) {
      setCart(emptyCart);
      setError(err instanceof Error ? err.message : "Could not load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    cartService
      .get()
      .then((data) => {
        if (!active) return;
        setCart(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setCart(emptyCart);
        setError(err instanceof Error ? err.message : "Could not load cart");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(async (callback: () => Promise<Cart | unknown>) => {
    setBusy(true);
    try {
      const data = await callback();
      if (data && typeof data === "object" && "items" in data) {
        setCart(data as Cart);
      } else {
        await refresh();
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cart action failed");
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const count = useMemo(
    () => cart.items.reduce((total, item) => total + item.quantity, 0),
    [cart.items],
  );

  return {
    cart,
    count,
    loading,
    busy,
    error,
    refresh,
    addItem: (payload: AddToCartPayload) => run(() => cartService.add(payload)),
    updateItem: (itemId: number, quantity: number) => run(() => cartService.updateItem(itemId, quantity)),
    removeItem: (itemId: number) => run(() => cartService.removeItem(itemId)),
    applyCoupon: (code: string) => run(() => cartService.applyCoupon(code)),
    removeCoupon: () => run(() => cartService.removeCoupon()),
    clear: () => run(() => cartService.clear()),
  };
}
