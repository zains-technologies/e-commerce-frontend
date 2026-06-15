"use client";

import { useEffect, useState } from "react";
import { storeService } from "@/services/storeService";
import type { StoreSettings } from "@/types/admin";

export function useStore() {
  const [store, setStore] = useState<StoreSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    void storeService.get().then((data) => {
      if (mounted) setStore(data);
    }).catch(() => {
      if (mounted) setStore(null);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { store };
}
